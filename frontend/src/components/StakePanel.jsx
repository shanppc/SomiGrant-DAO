import { useMemo, useState } from 'react'
import { ethers } from 'ethers'
import { ADDRESSES } from '../utils/config'
import { formatToken, parseToken } from '../utils/formatters'
import { getContracts } from '../utils/contracts'

export default function StakePanel({
  provider,
  signer,
  address,
  tokenSymbol = 'SGT',
  tokenDecimals = 18,
  userTokenBalance,
  userStakeBalance,
  refresh,
  pushToast,
  setBusy,
}) {
  const [amount, setAmount] = useState('')

  const disabled = useMemo(
    () => !signer || !address || !amount || Number(amount) <= 0,
    [signer, address, amount],
  )

  async function ensureApproveIfNeeded(amountWei) {
    const read = getContracts(provider)
    const allowance = await read.token.allowance(address, ADDRESSES.staking)
    if (allowance >= amountWei) return

    const write = getContracts(signer)
    pushToast({ type: 'info', title: 'Approving staking…' })
    const tx = await write.token.approve(ADDRESSES.staking, ethers.MaxUint256)
    pushToast({ type: 'tx', title: 'Approve submitted', txHash: tx.hash })
    await tx.wait()
    pushToast({ type: 'success', title: 'Approved' })
  }

  async function stake() {
    try {
      setBusy(true)
      const amountWei = parseToken(amount, tokenDecimals)
      await ensureApproveIfNeeded(amountWei)

      const write = getContracts(signer)
      pushToast({ type: 'info', title: 'Staking…' })
      const tx = await write.staking.stake(amountWei)
      pushToast({ type: 'tx', title: 'Stake submitted', txHash: tx.hash })
      await tx.wait()
      pushToast({ type: 'success', title: 'Staked' })
      setAmount('')
      await refresh?.()
    } catch (e) {
      pushToast({ type: 'error', title: 'Stake failed', message: e?.shortMessage || e?.message })
    } finally {
      setBusy(false)
    }
  }

  async function unstake() {
    try {
      setBusy(true)
      const amountWei = parseToken(amount, tokenDecimals)
      const write = getContracts(signer)
      pushToast({ type: 'info', title: 'Unstaking…' })
      const tx = await write.staking.unstake(amountWei)
      pushToast({ type: 'tx', title: 'Unstake submitted', txHash: tx.hash })
      await tx.wait()
      pushToast({ type: 'success', title: 'Unstaked' })
      setAmount('')
      await refresh?.()
    } catch (e) {
      pushToast({ type: 'error', title: 'Unstake failed', message: e?.shortMessage || e?.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-glow">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-white">Staking</div>
          <div className="mt-1 text-sm text-white/60">
            Balance: <span className="font-semibold text-white">{formatToken(userTokenBalance)} {tokenSymbol}</span>{' '}
            · Staked:{' '}
            <span className="font-semibold text-white">{formatToken(userStakeBalance)} {tokenSymbol}</span>
          </div>
        </div>
        <button
          onClick={refresh}
          className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80 transition hover:bg-black/30"
        >
          Refresh
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div>
          <label className="text-xs uppercase tracking-wider text-white/55">Amount ({tokenSymbol})</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-400/70"
          />
        </div>
        <button
          onClick={stake}
          disabled={disabled}
          className="h-10 self-end rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 px-5 text-sm font-semibold text-black shadow-glow transition hover:brightness-110 disabled:opacity-60"
        >
          Stake
        </button>
        <button
          onClick={unstake}
          disabled={disabled}
          className="h-10 self-end rounded-xl border border-white/10 bg-black/25 px-5 text-sm font-semibold text-white/90 transition hover:bg-black/35 disabled:opacity-60"
        >
          Unstake
        </button>
      </div>
    </section>
  )
}

