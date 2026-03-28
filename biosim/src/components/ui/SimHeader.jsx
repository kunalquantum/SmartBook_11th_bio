// SimHeader — consistent title block for every simulator card
export function SimHeader({ icon, title, subtitle, color = 'var(--cyan)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
      {/* Icon box */}
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `${color}15`,
        border: `1px solid ${color}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1rem', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '0.95rem' }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 1 }}>{subtitle}</div>
        )}
      </div>
    </div>
  )
}
