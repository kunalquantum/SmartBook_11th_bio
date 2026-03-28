export function WelcomeScreen({ curriculum, onSelect }) {
  return (
    <div className="animate-fadeUp" style={{ padding: '2rem' }}>
      {/* Hero */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{
          fontFamily: '"DM Mono", monospace', fontSize: '0.62rem',
          color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem',
        }}>
          Interactive Smart Book
        </div>
        <h1 style={{
          fontFamily: '"Playfair Display", serif', fontSize: '2.2rem',
          fontWeight: 900, lineHeight: 1.2, marginBottom: '0.75rem',
        }}>
          Maharashtra Board<br />
          <span style={{
            background: 'linear-gradient(135deg, var(--cyan), var(--emerald))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Class 11 Biology
          </span>
        </h1>
        <p style={{ color: 'var(--muted)', maxWidth: 520, fontSize: '0.9rem', lineHeight: 1.75 }}>
          Learn through interactive simulations, animated diagrams and step-by-step explorations.
          Select any chapter from the sidebar or the cards below to begin.
        </p>
      </div>

      {/* Units and chapter cards */}
      {curriculum.map(unit => (
        <div key={unit.id} style={{ marginBottom: '2.5rem' }}>
          {/* Unit header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem',
          }}>
            <span style={{
              width: 10, height: 10, borderRadius: '50%',
              background: unit.color, display: 'inline-block',
              boxShadow: `0 0 12px ${unit.color}`,
            }} />
            <span style={{
              fontFamily: '"DM Mono", monospace', fontSize: '0.65rem',
              color: unit.color, textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>
              {unit.label}: {unit.title}
            </span>
            <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.6rem', color: 'var(--muted)' }}>
              {unit.chapters.length} chapters
            </span>
          </div>

          {/* Chapter cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '0.75rem',
          }}>
            {unit.chapters.map(ch => (
              <ChapterCard key={ch.id} chapter={ch} unitColor={unit.color} onSelect={onSelect} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ChapterCard({ chapter, unitColor, onSelect }) {
  return (
    <button
      onClick={() => onSelect(chapter)}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = unitColor
        e.currentTarget.style.boxShadow = `0 0 20px ${unitColor}18`
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 14, padding: '1rem 1.25rem',
        cursor: 'pointer', textAlign: 'left',
        transition: 'all 0.25s',
        fontFamily: '"Outfit", sans-serif',
      }}
    >
      <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.6rem', color: unitColor, marginBottom: 4 }}>
        Ch. {chapter.num}
      </div>
      <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4, color: 'var(--text)' }}>
        {chapter.title}
      </div>
      <div style={{ fontSize: '0.73rem', color: 'var(--muted)', lineHeight: 1.6 }}>
        {chapter.desc}
      </div>
      <div style={{ marginTop: '0.6rem', fontFamily: '"DM Mono", monospace', fontSize: '0.6rem', color: unitColor }}>
        {chapter.topics.length} topics →
      </div>
    </button>
  )
}
