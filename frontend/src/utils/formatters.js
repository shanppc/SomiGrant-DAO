import { ethers } from 'ethers'

export function shortAddr(addr) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function formatToken(amount, decimals = 18, precision = 4) {
  try {
    const s = ethers.formatUnits(amount ?? 0n, decimals)
    const [a, b = ''] = s.split('.')
    const trimmed = b.slice(0, precision).replace(/0+$/, '')
    return trimmed ? `${a}.${trimmed}` : a
  } catch {
    return '0'
  }
}

export function formatSTT(amountWei, precision = 4) {
  return formatToken(amountWei, 18, precision)
}

export function parseSTT(value) {
  return ethers.parseUnits(String(value || '0'), 18)
}

export function parseToken(value, decimals = 18) {
  return ethers.parseUnits(String(value || '0'), decimals)
}

export function msToCountdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(s / 86400)
  const hours = Math.floor((s % 86400) / 3600)
  const mins = Math.floor((s % 3600) / 60)
  const secs = s % 60
  if (days > 0) return `${days}d ${hours}h ${mins}m`
  if (hours > 0) return `${hours}h ${mins}m ${secs}s`
  if (mins > 0) return `${mins}m ${secs}s`
  return `${secs}s`
}

