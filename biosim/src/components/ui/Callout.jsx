// Callout — highlighted info/explanation box
export function Callout({ children, color = 'var(--cyan)' }) {
  return (
    <div style={{
      background: `${color}08`,
      border: `1px solid ${color}25`,
      borderRadius: 10,
      padding: '0.75rem 1rem',
      fontSize: '0.8rem',
      color: 'var(--text)',
      lineHeight: 1.75,
    }}>
      {children}
    </div>
  )
}
