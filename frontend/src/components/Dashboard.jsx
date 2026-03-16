import StatsPanel from './StatsPanel'
import StakePanel from './StakePanel'
import TreasuryPanel from './TreasuryPanel'
import CreateProposal from './CreateProposal'
import ProposalList from './ProposalList'

export default function Dashboard(props) {
  const {
    provider,
    signer,
    address,
    stats,
    tokenMeta,
    proposals,
    reactivityEvents,
    refresh,
    onFunded,
    onVote,
    onFinalize,
    onExecute,
    pushToast,
    setBusy,
    busy,
  } = props

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-6">
      <StatsPanel
        treasuryBalanceWei={stats.treasuryBalanceWei}
        proposalCount={stats.proposalCount}
        activeProposals={stats.activeProposals}
        userTokenBalance={stats.userTokenBalance}
        userStakeBalance={stats.userStakeBalance}
        tokenSymbol={tokenMeta.symbol}
        address={address}
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <TreasuryPanel
          signer={signer}
          treasuryBalanceWei={stats.treasuryBalanceWei}
          onFunded={onFunded}
          pushToast={pushToast}
          setBusy={setBusy}
        />
        <StakePanel
          provider={provider}
          signer={signer}
          address={address}
          tokenSymbol={tokenMeta.symbol}
          tokenDecimals={tokenMeta.decimals}
          userTokenBalance={stats.userTokenBalance}
          userStakeBalance={stats.userStakeBalance}
          refresh={refresh}
          pushToast={pushToast}
          setBusy={setBusy}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <CreateProposal signer={signer} refresh={refresh} pushToast={pushToast} setBusy={setBusy} />
        <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-glow">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-white">Live Somnia activity</div>
              <div className="mt-1 text-xs text-white/60">
                Powered by Somnia Reactivity · faucet, DAO, and treasury events stream in real time.
              </div>
            </div>
          </div>
          <div className="mt-3 max-h-48 space-y-1 overflow-auto text-xs text-white/70">
            {reactivityEvents && reactivityEvents.length > 0 ? (
              reactivityEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/30 px-3 py-2"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">
                      {evt.isFaucet ? 'FaucetClaimed' : evt.type}
                    </span>
                    {evt.contractAddress ? (
                      <span className="text-[10px] text-white/45">
                        {evt.isFaucet ? 'Faucet' : 'Contract'}: {evt.contractAddress}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[10px] text-emerald-300/90">live</span>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 bg-black/20 px-3 py-3 text-xs text-white/50">
                Waiting for on-chain activity… create a proposal, vote, execute, or claim from the faucet to
                see real-time updates.
              </div>
            )}
          </div>
          {busy ? (
            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white/70">
              Processing transaction… data will auto-refresh when confirmed.
            </div>
          ) : null}
        </section>
      </div>

      <div className="mt-6">
        <ProposalList
          proposals={proposals}
          onVote={onVote}
          onFinalize={onFinalize}
          onExecute={onExecute}
          busy={busy}
        />
      </div>
    </div>
  )
}

