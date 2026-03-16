import { useMemo, useState } from 'react'
import { parseSTT } from '../utils/formatters'
import { getContracts } from '../utils/contracts'

export default function CreateProposal({ signer, refresh, pushToast, setBusy }) {
  const [description, setDescription] = useState('')
  const [amountSTT, setAmountSTT] = useState('')

  const disabled = useMemo(
    () => !signer || !description.trim() || !amountSTT || Number(amountSTT) <= 0,
    [signer, description, amountSTT],
  )

  async function submit() {
    try {
      setBusy(true)
      const write = getContracts(signer)
      pushToast({ type: 'info', title: 'Creating proposal…' })
      const tx = await write.dao.createProposal(description.trim(), parseSTT(amountSTT))
      pushToast({ type: 'tx', title: 'Proposal submitted', txHash: tx.hash })
      await tx.wait()
      pushToast({ type: 'success', title: 'Proposal created' })
      setDescription('')
      setAmountSTT('')
      await refresh?.()
    } catch (e) {
      pushToast({ type: 'error', title: 'Create proposal failed', message: e?.shortMessage || e?.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-glow">
      <div className="text-lg font-semibold text-white">Create Proposal</div>
      <div className="mt-1 text-sm text-white/60">
        Propose an STT funding amount from the treasury with a clear description.
      </div>

      <div className="mt-4 grid gap-3">
        <div>
          <label className="text-xs uppercase tracking-wider text-white/55">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="e.g. Fund grant for team building open-source Somnia tooling…"
            className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-polkaPink/60"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div>
            <label className="text-xs uppercase tracking-wider text-white/55">Funding amount (STT)</label>
            <input
              value={amountSTT}
              onChange={(e) => setAmountSTT(e.target.value)}
              placeholder="25"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-polkaPink/60"
            />
          </div>
          <button
            onClick={submit}
            disabled={disabled}
            className="h-10 self-end rounded-xl bg-gradient-to-r from-polkaPink to-polkaPurple px-5 text-sm font-semibold text-white shadow-glow transition hover:opacity-95 disabled:opacity-60"
          >
            Submit
          </button>
        </div>
      </div>
    </section>
  )
}

