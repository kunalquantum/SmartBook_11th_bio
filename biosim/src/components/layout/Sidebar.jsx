export function Sidebar({ curriculum, activeChapter, onSelect }) {
  return (
    <aside style={{
      width: 264,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      height: 'calc(100vh - 60px)',
      position: 'sticky', top: 60,
      overflowY: 'auto',
      flexShrink: 0,
      padding: '0.75rem 0',
    }}>
      {curriculum.map(unit => (
        <div key={unit.id} style={{ marginBottom: '0.25rem' }}>
          {/* Unit label */}
          <div style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: '0.58rem', textTransform: 'uppercase',
            letterSpacing: '0.12em', color: 'var(--muted)',
            padding: '0.65rem 1.25rem 0.3rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: unit.color, display: 'inline-block',
              boxShadow: `0 0 6px ${unit.color}`,
            }} />
            {unit.label}: {unit.title}
          </div>

          {/* Chapter buttons */}
          {unit.chapters.map(ch => {
            const isActive = activeChapter?.id === ch.id
            return (
              <button
                key={ch.id}
                onClick={() => onSelect(ch)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.55rem 1.25rem', width: '100%',
                  background: isActive ? `${unit.color}09` : 'transparent',
                  border: 'none',
                  borderLeft: `3px solid ${isActive ? unit.color : 'transparent'}`,
                  color: isActive ? unit.color : 'var(--text)',
                  cursor: 'pointer',
                  fontFamily: '"Outfit", sans-serif', fontSize: '0.78rem',
                  textAlign: 'left', transition: 'all 0.2s',
                }}
              >
                {/* Chapter number badge */}
                <span style={{
                  fontFamily: '"DM Mono", monospace', fontSize: '0.6rem',
                  width: 24, height: 24, borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  background: isActive ? unit.color : 'var(--card)',
                  color: isActive ? 'var(--bg)' : 'var(--muted)',
                  transition: 'all 0.2s',
                }}>
                  {ch.num}
                </span>
                <span style={{ lineHeight: 1.3 }}>{ch.title}</span>
              </button>
            )
          })}
        </div>
      ))}
    </aside>
  )
}
