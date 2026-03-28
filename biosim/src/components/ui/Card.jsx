// Card — generic content container
export function Card({ children, style = {}, glow, className = '' }) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '1.25rem',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        boxShadow: glow ? `0 0 30px ${glow}18` : 'none',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
