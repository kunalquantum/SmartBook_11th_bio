// Slider — labelled range input
export function Slider({ label, value, min = 0, max = 100, step = 1, onChange, color = 'var(--cyan)' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontFamily: '"DM Mono", monospace' }}>
        <span style={{ color: 'var(--muted)' }}>{label}</span>
        <span style={{ color }}>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ accentColor: color, width: '100%', cursor: 'pointer', height: 4 }}
      />
    </div>
  )
}
