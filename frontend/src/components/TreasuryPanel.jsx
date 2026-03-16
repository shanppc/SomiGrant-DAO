import { useMemo, useState } from 'react'
import { ADDRESSES } from '../utils/config'
import { formatSTT, parseSTT, shortAddr } from '../utils/formatters'

export default function TreasuryPanel({ signer, treasuryBalanceWei, onFunded, pushToast, setBusy }) {
  const [amount, setAmount] = useState('')

  const disabled = useMemo(() => !signer || !amount || Number(amount) <= 0, [signer, amount])

  async function fund() {
    try {
      setBusy(true)
      pushToast({ type: 'info', title: 'Sending funding transaction…' })
      const tx = await signer.sendTransaction({
        to: ADDRESSES.treasury,
        value: parseSTT(amount),
      })
      pushToast({ type: 'tx', title: 'Transaction sent', txHash: tx.hash })
      await tx.wait()
      pushToast({ type: 'success', title: 'Treasury funded' })
      setAmount('')
      await onFunded?.()
    } catch (e) {
      pushToast({ type: 'error', title: 'Funding failed', message: e?.shortMessage || e?.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-glow">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-lg font-semibold text-white">Treasury</div>
          <div className="mt-1 text-sm text-white/60">
            Address: <span className="font-mono text-white/75">{shortAddr(ADDRESSES.treasury)}</span>
          </div>
        </div>
        <div className="text-sm text-white/60">
          Balance: <span className="font-semibold text-white">{formatSTT(treasuryBalanceWei)} STT</span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <label className="text-xs uppercase tracking-wider text-white/55">Fund treasury (STT)</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.25"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-400/70"
          />
          <div className="mt-2 text-xs text-white/50">
            Sends native STT directly to the treasury contract.
          </div>
        </div>
        <button
          onClick={fund}
          disabled={disabled}
          className="h-10 self-end rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 px-5 text-sm font-semibold text-black shadow-glow transition hover:brightness-110 disabled:opacity-60"
        >
          Fund
        </button>
      </div>
    </section>
  )
}

