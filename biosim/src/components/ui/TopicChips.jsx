// TopicChips — compact chip list of chapter topics
export function TopicChips({ topics }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
      {topics.map(t => (
        <span key={t} style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: '0.62rem',
          padding: '3px 10px',
          borderRadius: 99,
          border: '1px solid var(--border)',
          color: 'var(--muted)',
          background: 'var(--surface)',
          letterSpacing: '0.04em',
        }}>
          {t}
        </span>
      ))}
    </div>
  )
}
