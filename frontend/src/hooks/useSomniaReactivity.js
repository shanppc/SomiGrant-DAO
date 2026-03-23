import { useEffect, useMemo, useRef, useState } from 'react'
import { createPublicClient, defineChain, webSocket, decodeEventLog } from 'viem'
import { SDK } from '@somnia-chain/reactivity'
import { ADDRESSES, SOMNIA, NETWORK } from '../utils/config'
import { daoABI, faucetABI } from '../utils/contracts'

const somniaTestnet = defineChain({
  id: NETWORK.chainId,
  name: NETWORK.chainName,
  network: 'testnet',
  nativeCurrency: NETWORK.nativeCurrency,
  rpcUrls: {
    default: {
      http: NETWORK.rpcUrls,
      webSocket: [SOMNIA.wsUrl],
    },
    public: {
      http: NETWORK.rpcUrls,
      webSocket: [SOMNIA.wsUrl],
    },
  },
})

export function useSomniaReactivity({ enabled = true, onEvent }) {
  const [status, setStatus] = useState({ connected: false, lastEvent: null, error: null })
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent

  const publicClient = useMemo(() => {
    return createPublicClient({
      chain: somniaTestnet,
      transport: webSocket(),
    })
  }, [])

  useEffect(() => {
    if (!enabled) return
    let unsub = null
    let alive = true

    async function start() {
      try {
        setStatus((s) => ({ ...s, error: null }))
        const sdk = new SDK({ public: publicClient })

        const sub = await sdk.subscribe({
          ethCalls: [],
          onData: (n) => {
            if (!alive) return
            const log = n?.result ?? {}
            const topics = log?.topics ?? []
            const data = log?.data ?? '0x'

            let decoded = null
            try {
              decoded = decodeEventLog({
                abi: [...daoABI, ...faucetABI],
                data,
                topics,
              })
            } catch {
              // decoding can fail if ABI mismatches; still trigger refresh
            }

            const payload = { raw: n, log, decoded }
            setStatus({ connected: true, lastEvent: payload, error: null })
            onEventRef.current?.(payload)
          },
          onError: (err) => {
            console.error('Reactivity WS error:', err)
            if (!alive) return
            setStatus({ connected: false, lastEvent: null, error: err?.message || String(err) })
          },
          eventContractSources: [ADDRESSES.dao, ADDRESSES.faucet],
        })

        console.log('Reactivity subscription result:', sub)
        if (sub instanceof Error) throw sub
        setStatus((s) => ({ ...s, connected: true }))
        unsub = () => sub.unsubscribe()
      } catch (e) {
        setStatus({ connected: false, lastEvent: null, error: e?.message || String(e) })
      }
    }

    start()
    return () => {
      alive = false
      try { unsub?.() } catch { /* ignore */ }
    }
  }, [enabled, publicClient])

  return status
}
