// StepPill — small pill tab used in step-by-step simulators
export function StepPill({ label, active, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: '"DM Mono", monospace',
        fontSize: '0.63rem',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        padding: '5px 12px',
        borderRadius: 99,
        cursor: 'pointer',
        border: `1px solid ${active ? color : 'var(--border)'}`,
        background: active ? color : 'transparent',
        color: active ? 'var(--bg)' : 'var(--muted)',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}
