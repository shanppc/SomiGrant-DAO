import { NETWORK } from '../utils/config'
import { shortAddr } from '../utils/formatters'

export default function ConnectWallet({
  hasProvider,
  address,
  chainId,
  onConnect,
  onSwitchNetwork,
  connecting,
}) {
  const isConnected = Boolean(address)
  const isCorrect = chainId === NETWORK.chainId

  return (
    <div className="flex flex-col items-end gap-2">
      {!hasProvider ? (
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
          MetaMask not detected
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400/90" />
                <span className="font-medium">{shortAddr(address)}</span>
              </div>
              <div className="mt-1 text-xs text-white/60">
                Network:{' '}
                <span className={isCorrect ? 'text-emerald-300' : 'text-rose-300'}>
                  {isCorrect ? NETWORK.chainName : chainId ? `Chain ${chainId}` : '—'}
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={onConnect}
              disabled={connecting}
              className="rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 px-4 py-2 text-sm font-semibold text-black shadow-glow transition hover:brightness-110 disabled:opacity-60"
            >
              {connecting ? 'Connecting…' : 'Connect MetaMask'}
            </button>
          )}

          {isConnected && !isCorrect && (
            <button
              onClick={onSwitchNetwork}
              className="rounded-full border border-amber-300/60 bg-amber-400/10 px-3 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/15"
            >
              Switch to {NETWORK.chainName}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

