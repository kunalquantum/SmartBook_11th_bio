// Btn — control button used inside simulators
export function Btn({ children, onClick, active, color = 'var(--cyan)', style = {}, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: '"DM Mono", monospace',
        fontSize: '0.68rem',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        padding: '6px 14px',
        borderRadius: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: `1px solid ${active ? color : 'var(--border)'}`,
        background: active ? `${color}22` : 'var(--surface)',
        color: active ? color : 'var(--muted)',
        transition: 'all 0.2s',
        opacity: disabled ? 0.4 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  )
}
