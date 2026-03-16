export default function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-white/70">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
      <span>{label}</span>
    </div>
  )
}

