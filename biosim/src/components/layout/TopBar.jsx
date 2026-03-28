import { Badge } from '../ui'

export function TopBar() {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: 'rgba(6,13,20,0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      height: 60,
      display: 'flex', alignItems: 'center',
      padding: '0 1.5rem', gap: '1rem',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div>
        <div style={{
          fontFamily: '"Playfair Display", serif',
          fontWeight: 900, fontSize: '1.2rem',
          background: 'linear-gradient(135deg, var(--cyan), var(--emerald))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
        }}>
          BioSim
        </div>
        <div style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: '0.55rem', color: 'var(--muted)',
          textTransform: 'uppercase', letterSpacing: '0.1em',
          lineHeight: 1.2,
        }}>
          Maharashtra Board · Class 11 · Biology
        </div>
      </div>

      {/* Spacer */}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Badge color="var(--emerald)">16 Chapters</Badge>
        <Badge color="var(--cyan)">11 Simulators</Badge>
      </div>
    </header>
  )
}
