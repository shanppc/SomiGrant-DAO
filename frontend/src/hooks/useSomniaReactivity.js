import { useEffect, useMemo, useRef, useState } from 'react'
import { createPublicClient, webSocket } from 'viem'
import { decodeEventLog } from 'viem'
import { Reactivity } from '@somnia-chain/reactivity'
import { ADDRESSES, SOMNIA } from '../utils/config'
import { daoABI, faucetABI } from '../utils/contracts'

function toViemAbi(ethersHumanReadableAbi) {
  // viem accepts human-readable ABI as well; keep as-is.
  return ethersHumanReadableAbi
}

export function useSomniaReactivity({ enabled = true, onEvent }) {
  const [status, setStatus] = useState({ connected: false, lastEvent: null, error: null })
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent

  const publicClient = useMemo(() => {
    return createPublicClient({
      transport: webSocket(SOMNIA.wsUrl),
    })
  }, [])

  useEffect(() => {
    if (!enabled) return
    let unsub = null
    let alive = true

    async function start() {
      try {
        setStatus((s) => ({ ...s, error: null }))
        const sdk = new Reactivity({ public: publicClient })

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
                // Merge DAO and faucet ABIs so we can decode both governance and faucet activity.
                abi: toViemAbi([...daoABI, ...faucetABI]),
                data,
                topics,
              })
            } catch {
              // decoding can fail if ABI mismatches; still trigger refresh
            }

            const payload = {
              raw: n,
              log,
              decoded,
            }

            setStatus({ connected: true, lastEvent: payload, error: null })
            onEventRef.current?.(payload)
          },
          onError: (err) => {
            if (!alive) return
            setStatus({ connected: false, lastEvent: null, error: err?.message || String(err) })
          },
          // Listen to both DAO contract and Faucet contract as event sources.
          eventContractSources: [ADDRESSES.dao, ADDRESSES.faucet],
        })

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
      try {
        unsub?.()
      } catch {
        // ignore
      }
    }
  }, [enabled, publicClient])

  return status
}

