// PlaceholderSimulator — shown for chapters that don't yet have a dedicated simulator
export function PlaceholderSimulator({ chapter }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '0.75rem',
      alignItems: 'center', padding: '2.5rem 1rem', textAlign: 'center',
    }}>
      <div style={{ fontSize: '3rem' }}>🔭</div>
      <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.2rem', color: 'var(--muted)' }}>
        Simulator Coming Soon
      </div>
      <div style={{ fontFamily: '"Outfit", sans-serif', fontSize: '0.85rem', color: 'var(--text)' }}>
        {chapter.title}
      </div>
      <div style={{ fontSize: '0.78rem', color: 'var(--muted)', maxWidth: 320, lineHeight: 1.7 }}>
        An interactive simulation for this chapter is being built. Explore the topic list and study tips on the right while you wait.
      </div>
    </div>
  )
}
