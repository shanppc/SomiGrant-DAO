import { useEffect, useState } from 'react'
import { formatSTT, msToCountdown } from '../utils/formatters'

// Converts a raw 18-decimal BigInt (wei) to a human-readable string
// e.g. 1000000000000000000n → "1.00"
function formatVotes(raw) {
  if (raw == null) return '0'
  const n = BigInt(raw)
  const whole = n / 10n ** 18n
  const remainder = n % 10n ** 18n
  const decimals = String(remainder).padStart(18, '0').slice(0, 2)
  return `${whole}.${decimals}`
}

function Pill({ children, tone = 'neutral' }) {
  const cls =
    tone === 'active'
      ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
      : tone === 'passed'
        ? 'border-sky-400/30 bg-sky-400/10 text-sky-200'
        : tone === 'failed'
          ? 'border-rose-400/30 bg-rose-400/10 text-rose-200'
          : tone === 'executed'
            ? 'border-purple-400/30 bg-purple-400/10 text-purple-200'
            : 'border-white/10 bg-white/5 text-white/70'
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {children}
    </div>
  )
}

export default function ProposalCard({ proposal, nowMs, onVote, onFinalize, onExecute, busy }) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Force a live "now" each tick for countdown/progress.
  // (We keep `tick` only to re-render every second.)
  void tick
  const currentMs = Date.now()

  const deadlineMs = Number(proposal.deadline ?? 0) * 1000
  const isActive = currentMs < deadlineMs && !proposal.executed

  const computedPassed =
    proposal.passed ?? (proposal.finalized ? (BigInt(proposal.votesFor ?? 0n) > BigInt(proposal.votesAgainst ?? 0n)) : null)

  const status = proposal.executed
    ? { label: 'Executed', tone: 'executed' }
    : isActive
      ? { label: 'Active', tone: 'active' }
      : computedPassed
        ? { label: 'Passed', tone: 'passed' }
        : { label: 'Failed', tone: 'failed' }

  // Both votesFor and votesAgainst are 18-decimal BigInts from the contract.
  // We scale down before percentage math to avoid Number overflow on huge wei values.
  const scaledFor = BigInt(proposal.votesFor ?? 0n) / 10n ** 15n      // keeps 3 sig-fig precision
  const scaledAgainst = BigInt(proposal.votesAgainst ?? 0n) / 10n ** 15n
  const totalVotes = scaledFor + scaledAgainst
  const forPct = totalVotes === 0n ? 0 : Number((scaledFor * 10000n) / totalVotes) / 100

  const canVote = isActive
  const canFinalize = !isActive && !proposal.finalized && !proposal.executed
  const canExecute = proposal.finalized && computedPassed && !proposal.executed

  const timeLeft = Math.max(0, deadlineMs - currentMs)

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-glow transition duration-300 hover:-translate-y-0.5 hover:border-white/15">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-white/5 px-2 py-1 text-xs font-semibold text-white/70">
              #{proposal.id}
            </div>
            <Pill tone={status.tone}>{status.label}</Pill>
            {isActive ? (
              <div className="text-xs text-white/55">Ends in {msToCountdown(timeLeft)}</div>
            ) : (
              <div className="text-xs text-white/55">Deadline reached</div>
            )}
          </div>
          <div className="mt-3 break-words text-base font-semibold text-white">{proposal.description}</div>
          <div className="mt-1 text-sm text-white/60">
            Requested funding: <span className="font-semibold text-white">{formatSTT(proposal.amount)} STT</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="text-xs text-white/55">Voting</div>
          <div className="w-44 overflow-hidden rounded-full border border-white/10 bg-black/25">
            <div
              className="h-2 bg-gradient-to-r from-polkaPink to-polkaPurple transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, forPct))}%` }}
            />
          </div>
          <div className="text-xs text-white/60">
            For <span className="font-semibold text-white">{formatVotes(proposal.votesFor)}</span> · Against{' '}
            <span className="font-semibold text-white">{formatVotes(proposal.votesAgainst)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {canVote ? (
          <>
            <button
              onClick={() => onVote(proposal.id, true)}
              disabled={busy}
              className="rounded-xl bg-gradient-to-r from-polkaPink to-polkaPurple px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:opacity-95 disabled:opacity-60"
            >
              Vote For
            </button>
            <button
              onClick={() => onVote(proposal.id, false)}
              disabled={busy}
              className="rounded-xl border border-white/10 bg-black/25 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-black/35 disabled:opacity-60"
            >
              Vote Against
            </button>
          </>
        ) : null}

        {canFinalize ? (
          <button
            onClick={() => onFinalize(proposal.id)}
            disabled={busy}
            className="rounded-xl border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-400/15 disabled:opacity-60"
          >
            Finalize
          </button>
        ) : null}

        {canExecute ? (
          <button
            onClick={() => onExecute(proposal.id)}
            disabled={busy}
            className="rounded-xl border border-purple-400/30 bg-purple-400/10 px-4 py-2 text-sm font-semibold text-purple-200 transition hover:bg-purple-400/15 disabled:opacity-60"
          >
            Execute
          </button>
        ) : null}
      </div>
    </div>
  )
}