import ProposalCard from './ProposalCard'

export default function ProposalList({ proposals, onVote, onFinalize, onExecute, busy }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 shadow-glow">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-white">Proposals</div>
          <div className="mt-1 text-sm text-white/60">
            Vote, finalize, and execute governance decisions.
          </div>
        </div>
        <div className="text-sm text-white/60">{proposals?.length ?? 0} loaded</div>
      </div>

      <div className="mt-4 grid gap-3">
        {proposals?.length ? (
          proposals.map((p) => (
            <ProposalCard
              key={String(p.id)}
              proposal={p}
              onVote={onVote}
              onFinalize={onFinalize}
              onExecute={onExecute}
              busy={busy}
            />
          ))
        ) : (
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/60">
            No proposals found yet.
          </div>
        )}
      </div>
    </section>
  )
}