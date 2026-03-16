import { useEffect, useMemo, useRef, useState } from 'react'
import { ethers } from 'ethers'
import ConnectWallet from './components/ConnectWallet'
import Dashboard from './components/Dashboard'
import LoadingSpinner from './components/LoadingSpinner'
import { ADDRESSES, APP_NAME, NETWORK } from './utils/config'
import { getContracts } from './utils/contracts'
import { shortAddr } from './utils/formatters'
import { useSomniaReactivity } from './hooks/useSomniaReactivity'

function Toast({ toast, onClose }) {
  const tone =
    toast.type === 'success'
      ? 'border-emerald-400/30 bg-emerald-400/10'
      : toast.type === 'error'
        ? 'border-rose-400/30 bg-rose-400/10'
        : toast.type === 'tx'
          ? 'border-purple-400/30 bg-purple-400/10'
          : 'border-white/10 bg-white/5'

  return (
    <div className={`rounded-2xl border p-4 shadow-glow ${tone}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">{toast.title}</div>
          {toast.message ? <div className="mt-1 text-xs text-white/70">{toast.message}</div> : null}
          {toast.txHash ? (
            <div className="mt-2 text-xs text-white/70">
              Tx:{' '}
              <span className="font-mono text-white/85">
                {toast.txHash.slice(0, 10)}…{toast.txHash.slice(-8)}
              </span>
            </div>
          ) : null}
        </div>
        <button onClick={onClose} className="text-white/60 transition hover:text-white">
          ✕
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const hasProvider = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
  const [connecting, setConnecting] = useState(false)
  const [busy, setBusy] = useState(false)
  const [address, setAddress] = useState('')
  const [chainId, setChainId] = useState(null)
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [loading, setLoading] = useState(true)

  const [tokenMeta, setTokenMeta] = useState({ symbol: 'SGT', decimals: 18 })
  const [stats, setStats] = useState({
    treasuryBalanceWei: 0n,
    proposalCount: 0,
    activeProposals: 0,
    userTokenBalance: 0n,
    userStakeBalance: 0n,
  })
  const [proposals, setProposals] = useState([])
  const [faucetBusy, setFaucetBusy] = useState(false)
  const [reactivityEvents, setReactivityEvents] = useState([])

  const [toasts, setToasts] = useState([])
  const toastSeq = useRef(1)

  const isCorrectNetwork = chainId === NETWORK.chainId

  const canRead = Boolean(provider)
  const canWrite = Boolean(signer && address && isCorrectNetwork)

  function pushToast({ type, title, message, txHash }) {
    const id = toastSeq.current++
    setToasts((t) => [{ id, type, title, message, txHash }, ...t].slice(0, 4))
    if (type !== 'error') {
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6000)
    }
  }

  const refresh = useMemo(() => {
    return async () => {
      if (!provider) return
      try {
        const read = getContracts(provider)

        // Token metadata
        let symbol = tokenMeta.symbol
        let decimals = tokenMeta.decimals
        try {
          symbol = await read.token.symbol()
          decimals = Number(await read.token.decimals())
          setTokenMeta({ symbol, decimals })
        } catch {
          // ignore and keep defaults
        }

        // Treasury
        const treasuryBalanceWei = await provider.getBalance(ADDRESSES.treasury)

        // Proposals
        const countBn = await read.dao.proposalCount()
        const proposalCount = Number(countBn)
        const items = []
        // proposalCount() returns the latest proposal ID, so fetch i=1..proposalCount.
        for (let i = 1; i <= proposalCount; i++) {
          const p = await read.dao.proposals(i)
          // Solidity struct order:
          // [0] proposer  [1] description  [2] amount     [3] deadline
          // [4] votesFor  [5] votesAgainst [6] executionTime
          // [7] finalized [8] executed     [9] passed
  
          const description  = p[1]
          const amount       = p[2]
          const deadline     = p[3]   // was wrongly p[5]
          const votesFor     = p[4]   // was wrongly p[3]
          const votesAgainst = p[5]   // was wrongly p[4]
          // p[6] = executionTime (not used in UI)
          // Bools map directly to struct order: [7] finalized [8] executed [9] passed
          const finalized    = Boolean(p[7])
          const executed     = Boolean(p[8])
          const passed       = Boolean(p[9])
          items.push({
            id: i,
            description,
            amount,
            votesFor,
            votesAgainst,
            deadline,
            finalized,
            executed,
            passed,
          })
        }
        const now = Date.now()
        const activeProposals = items.filter(
          (x) => now < Number(x.deadline) * 1000 && !x.finalized && !x.executed,
        ).length

        // User balances
        let userTokenBalance = 0n
        let userStakeBalance = 0n
        if (address) {
          try {
            userTokenBalance = await read.token.balanceOf(address)
          } catch {
            userTokenBalance = 0n
          }
          try {
            userStakeBalance = await read.staking.stakedBalance(address)
          } catch {
            userStakeBalance = 0n
          }
        }

        setStats({
          treasuryBalanceWei,
          proposalCount,
          activeProposals,
          userTokenBalance,
          userStakeBalance,
        })
        setProposals(items.reverse())
      } catch (e) {
        pushToast({ type: 'error', title: 'Refresh failed', message: e?.shortMessage || e?.message })
      }
    }
  }, [provider, address, tokenMeta.symbol, tokenMeta.decimals])

  // Somnia Reactivity: refresh on governance events (best-effort decoding).
  useSomniaReactivity({
    enabled: Boolean(canRead),
    onEvent: (evt) => {
      const name =
        evt?.decoded?.eventName || evt?.decoded?.eventName === '' ? evt.decoded.eventName : null
      const eventType = name || 'UnknownEvent'
      const contractAddress = evt?.log?.address
      const isFaucet = contractAddress?.toLowerCase() === ADDRESSES.faucet.toLowerCase()

      pushToast({
        type: isFaucet ? 'success' : 'info',
        title: isFaucet ? 'Faucet claim observed' : 'Live DAO update',
        message: name
          ? `Reactivity: ${name}`
          : isFaucet
            ? 'Reactivity: Faucet activity'
            : 'Reactivity: new DAO activity',
      })

      setReactivityEvents((events) => {
        const next = [
          {
            id: `${Date.now()}-${events.length}`,
            type: eventType,
            isFaucet,
            contractAddress,
            raw: evt.raw,
          },
          ...events,
        ]
        return next.slice(0, 20)
      })
      refresh()
    },
  })

  async function init() {
    if (!hasProvider) {
      setLoading(false)
      return
    }
    const p = new ethers.BrowserProvider(window.ethereum)
    setProvider(p)
    try {
      const net = await p.getNetwork()
      setChainId(Number(net.chainId))
    } catch {
      setChainId(null)
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (accounts?.length) {
        setAddress(accounts[0])
        const s = await p.getSigner()
        setSigner(s)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    init()
    if (!hasProvider) return

    function onAccountsChanged(accounts) {
      const next = accounts?.[0] || ''
      setAddress(next)
      if (!next) setSigner(null)
    }

    function onChainChanged(hexId) {
      const next = Number.parseInt(hexId, 16)
      setChainId(next)
      // refresh signer/provider objects on chain changes
      const p = new ethers.BrowserProvider(window.ethereum)
      setProvider(p)
      if (address) {
        p.getSigner().then(setSigner).catch(() => setSigner(null))
      }
    }

    window.ethereum.on('accountsChanged', onAccountsChanged)
    window.ethereum.on('chainChanged', onChainChanged)
    return () => {
      window.ethereum.removeListener('accountsChanged', onAccountsChanged)
      window.ethereum.removeListener('chainChanged', onChainChanged)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!provider) return
    refresh()
    const id = setInterval(() => refresh(), 15000)
    return () => clearInterval(id)
  }, [provider, address, chainId, refresh])

  async function connect() {
    if (!hasProvider) return
    try {
      setConnecting(true)
      const p = new ethers.BrowserProvider(window.ethereum)
      setProvider(p)
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const addr = accounts?.[0]
      setAddress(addr || '')
      setSigner(addr ? await p.getSigner() : null)
      const net = await p.getNetwork()
      setChainId(Number(net.chainId))
      pushToast({ type: 'success', title: 'Wallet connected', message: addr ? shortAddr(addr) : '' })
    } catch (e) {
      pushToast({ type: 'error', title: 'Connect failed', message: e?.message })
    } finally {
      setConnecting(false)
    }
  }

  async function switchNetwork() {
    if (!hasProvider) return
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK.chainIdHex }],
      })
    } catch (e) {
      // Unrecognized chain → try add (rpcUrls may be empty in config; MetaMask may still accept if user preconfigured)
      if (e?.code === 4902) {
        if (!NETWORK.rpcUrls?.length) {
          pushToast({
            type: 'error',
            title: 'Network not in MetaMask',
            message:
              'This testnet is not configured in your MetaMask and no RPC URL was provided. Please add the Somnia Testnet network manually, then click Switch again.',
          })
          return
        }
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: NETWORK.chainIdHex,
              chainName: NETWORK.chainName,
              nativeCurrency: NETWORK.nativeCurrency,
              rpcUrls: NETWORK.rpcUrls,
              blockExplorerUrls: NETWORK.blockExplorerUrls,
            },
          ],
        })
      } else {
        pushToast({ type: 'error', title: 'Network switch failed', message: e?.message })
      }
    }
  }

  async function vote(proposalId, support) {
    if (!canWrite) return
    try {
      setBusy(true)
      const write = getContracts(signer)
      pushToast({ type: 'info', title: support ? 'Voting For…' : 'Voting Against…' })
      const tx = await write.dao.vote(proposalId, support)
      pushToast({ type: 'tx', title: 'Vote submitted', txHash: tx.hash })
      await tx.wait()
      pushToast({ type: 'success', title: 'Vote confirmed' })
      await refresh()
    } catch (e) {
      pushToast({ type: 'error', title: 'Vote failed', message: e?.shortMessage || e?.message })
    } finally {
      setBusy(false)
    }
  }

  async function finalize(proposalId) {
    if (!canWrite) return
    try {
      setBusy(true)
      const write = getContracts(signer)
      pushToast({ type: 'info', title: 'Finalizing…' })
      const tx = await write.dao.finalizeProposal(proposalId)
      pushToast({ type: 'tx', title: 'Finalize submitted', txHash: tx.hash })
      await tx.wait()
      pushToast({ type: 'success', title: 'Finalized' })
      await refresh()
    } catch (e) {
      pushToast({ type: 'error', title: 'Finalize failed', message: e?.shortMessage || e?.message })
    } finally {
      setBusy(false)
    }
  }

  async function execute(proposalId) {
    if (!canWrite) return
    try {
      setBusy(true)
      const write = getContracts(signer)
      pushToast({ type: 'info', title: 'Executing…' })
      const tx = await write.dao.executeProposal(proposalId)
      pushToast({ type: 'tx', title: 'Execute submitted', txHash: tx.hash })
      await tx.wait()
      pushToast({ type: 'success', title: 'Executed' })
      await refresh()
    } catch (e) {
      pushToast({ type: 'error', title: 'Execute failed', message: e?.shortMessage || e?.message })
    } finally {
      setBusy(false)
    }
  }

  async function claimFaucet() {
    if (!canWrite || faucetBusy) return
    try {
      setFaucetBusy(true)
      const write = getContracts(signer)
      pushToast({ type: 'info', title: 'Claiming faucet…', message: 'Requesting 1500 SGT from faucet' })
      const tx = await write.faucet.requestTokens()
      pushToast({ type: 'tx', title: 'Faucet transaction submitted', txHash: tx.hash })
      await tx.wait()
      pushToast({ type: 'success', title: 'Faucet claimed', message: '1500 SGT minted to your wallet (subject to faucet rules)' })
      await refresh()
    } catch (e) {
      pushToast({
        type: 'error',
        title: 'Faucet claim failed',
        message: e?.shortMessage || e?.message,
      })
    } finally {
      setFaucetBusy(false)
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
  
            </div>
            <div className="min-w-0">
              <div className="text-base font-semibold text-white">{APP_NAME}</div>
              <div className="text-xs text-white/55">Governance Dashboard · {NETWORK.chainName}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={claimFaucet}
              disabled={!canWrite || faucetBusy}
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 px-4 py-2 text-xs font-semibold text-black shadow-glow transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-black/70" />
              {faucetBusy ? 'Claiming 1500 SGT…' : 'Claim 1500 SGT'}
            </button>
            <ConnectWallet
              hasProvider={hasProvider}
              address={address}
              chainId={chainId}
              connecting={connecting}
              onConnect={connect}
              onSwitchNetwork={switchNetwork}
            />
          </div>
        </div>

        {address && !isCorrectNetwork ? (
          <div className="border-t border-rose-400/20 bg-rose-400/10">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3">
              <div className="text-sm text-rose-200">
                Wrong network. Please switch to <span className="font-semibold">{NETWORK.chainName}</span> (chainId{' '}
                {NETWORK.chainId}).
              </div>
              <button
                onClick={switchNetwork}
                className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/15"
              >
                Switch
              </button>
            </div>
          </div>
        ) : null}
      </header>

      <main>
        {loading ? (
          <div className="mx-auto w-full max-w-7xl px-4 py-10">
            <LoadingSpinner label="Booting SomniaGrant DAO…" />
          </div>
        ) : (
          <Dashboard
            provider={provider}
            signer={signer}
            address={address}
            stats={stats}
            tokenMeta={tokenMeta}
            proposals={proposals}
            reactivityEvents={reactivityEvents}
            refresh={refresh}
            onFunded={refresh}
            onVote={vote}
            onFinalize={finalize}
            onExecute={execute}
            pushToast={pushToast}
            setBusy={setBusy}
            busy={busy}
          />
        )}
      </main>

      <div className="fixed right-4 top-20 z-50 w-[360px] max-w-[calc(100vw-2rem)] space-y-2">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={() => setToasts((x) => x.filter((y) => y.id !== t.id))} />
        ))}
      </div>
    </div>
  )
}