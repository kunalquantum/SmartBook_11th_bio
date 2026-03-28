// Badge — small pill label
export function Badge({ children, color = 'var(--cyan)' }) {
  return (
    <span style={{
      fontFamily: 'var(--font-mono, "DM Mono", monospace)',
      fontSize: '0.6rem',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      padding: '3px 9px',
      borderRadius: 999,
      border: `1px solid ${color}44`,
      color,
      background: `${color}11`,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}
