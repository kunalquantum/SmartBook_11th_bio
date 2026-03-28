// ProgressBar — animated horizontal progress indicator
export function ProgressBar({ value, max = 100, color = 'var(--cyan)', label }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div>
      {label && (
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: '0.68rem', fontFamily: '"DM Mono", monospace',
          color: 'var(--muted)', marginBottom: 4,
        }}>
          <span>{label}</span>
          <span style={{ color }}>{Math.round(value)}</span>
        </div>
      )}
      <div style={{ height: 6, borderRadius: 3, background: 'var(--dim)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 3,
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  )
}
