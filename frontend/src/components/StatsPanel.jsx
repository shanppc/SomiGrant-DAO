import { formatSTT, formatToken, shortAddr } from '../utils/formatters'

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-glow">
      <div className="text-xs uppercase tracking-wider text-white/55">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
      {sub ? <div className="mt-1 text-xs text-white/55">{sub}</div> : null}
    </div>
  )
}

export default function StatsPanel({
  treasuryBalanceWei,
  proposalCount,
  activeProposals,
  userTokenBalance,
  userStakeBalance,
  tokenSymbol = 'SGT',
  address,
}) {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <Stat
        label="Treasury balance"
        value={`${formatSTT(treasuryBalanceWei)} STT`}
        sub="Funds available for grants"
      />
      <Stat label="Total proposals" value={`${proposalCount ?? 0}`} sub="Governance history" />
      <Stat label="Active proposals" value={`${activeProposals ?? 0}`} sub="Open for voting" />
      <Stat
        label="Your token balance"
        value={`${formatToken(userTokenBalance)} ${tokenSymbol}`}
        sub={address ? `Wallet: ${shortAddr(address)}` : 'Connect wallet to view'}
      />
      <Stat
        label="Your staking balance"
        value={`${formatToken(userStakeBalance)} ${tokenSymbol}`}
        sub="Voting power (stake-based, live-reactive)"
      />
    </section>
  )
}

