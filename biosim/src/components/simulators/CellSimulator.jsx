import { useState } from 'react'
import { SimHeader, Callout } from '../ui'

const ORGANELLES = [
  {
    id: 'nucleus', label: 'Nucleus', cx: 50, cy: 46, rx: 11, ry: 9, color: '#00e5ff',
    desc: 'Control centre of the cell. Contains DNA as chromatin. Bounded by a double nuclear envelope with nuclear pores. Contains nucleolus (rRNA synthesis).',
  },
  {
    id: 'mito', label: 'Mitochondria', cx: 74, cy: 30, rx: 7, ry: 4.5, color: '#00e099',
    desc: 'Powerhouse of the cell. Site of aerobic respiration. Double membrane — outer smooth, inner folded into cristae. Contains own DNA (semi-autonomous).',
  },
  {
    id: 'rer', label: 'Rough ER', cx: 30, cy: 36, rx: 9, ry: 5, color: '#8b5cf6',
    desc: 'Rough Endoplasmic Reticulum — studded with ribosomes. Site of protein synthesis and initial folding. Connected to the nuclear envelope.',
  },
  {
    id: 'ser', label: 'Smooth ER', cx: 22, cy: 54, rx: 7, ry: 4, color: '#7c3aed',
    desc: 'Smooth ER — no ribosomes. Synthesises lipids and steroids. Detoxifies drugs. Stores Ca²⁺ in muscle cells.',
  },
  {
    id: 'golgi', label: 'Golgi Complex', cx: 66, cy: 63, rx: 8, ry: 4.5, color: '#ffb300',
    desc: 'Cis–trans stack of cisternae. Modifies, packages and dispatches proteins and lipids. Produces secretory vesicles and lysosomes.',
  },
  {
    id: 'lyso', label: 'Lysosome', cx: 38, cy: 65, rx: 4.5, ry: 4.5, color: '#ff4d6d',
    desc: '"Suicidal bags" — contain 40+ hydrolytic enzymes (acid hydrolases). Digest worn-out organelles (autophagy). Involved in apoptosis.',
  },
  {
    id: 'chloro', label: 'Chloroplast', cx: 18, cy: 38, rx: 8, ry: 5, color: '#22c55e',
    desc: 'Site of photosynthesis (plant/algal cells). Double membrane. Thylakoids stacked into grana. Stroma contains enzymes of Calvin cycle. Has own DNA.',
  },
  {
    id: 'ribo', label: 'Ribosomes', cx: 58, cy: 38, rx: 3, ry: 3, color: '#fb923c',
    desc: 'Non-membranous organelles (80S in eukaryotes: 60S + 40S subunits). Site of protein synthesis (translation). Found free in cytoplasm or on RER.',
  },
  {
    id: 'vacuole', label: 'Vacuole', cx: 48, cy: 25, rx: 6, ry: 5, color: '#38bdf8',
    desc: 'Large central vacuole in plant cells maintains turgor pressure. Bounded by tonoplast. Stores salts, sugars, pigments, waste products.',
  },
]

export function CellSimulator() {
  const [selected, setSelected] = useState(null)
  const sel = ORGANELLES.find(o => o.id === selected)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="🔬" title="Cell Organelles" subtitle="Click any organelle on the diagram" color="var(--cyan)" />

      {/* SVG Cell diagram */}
      <div style={{
        position: 'relative', width: '100%', paddingBottom: '54%',
        background: 'radial-gradient(ellipse at center, #0a2a1e 0%, var(--surface) 70%)',
        borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden',
      }}>
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          viewBox="0 0 100 60"
        >
          {/* Cell membrane */}
          <ellipse cx="50" cy="50" rx="48" ry="56"
            fill="rgba(0,229,255,0.02)"
            stroke="rgba(0,229,255,0.3)" strokeWidth="0.6" strokeDasharray="1.5,0.8"
          />
          {/* Cytoplasm label */}
          <text x="87" y="54" textAnchor="middle" style={{ fontSize: '2.8px', fill: 'rgba(90,122,144,0.8)', fontFamily: 'DM Mono' }}>
            Cytoplasm
          </text>

          {ORGANELLES.map(o => (
            <g key={o.id} onClick={() => setSelected(selected === o.id ? null : o.id)} style={{ cursor: 'pointer' }}>
              <ellipse
                cx={o.cx} cy={o.cy} rx={o.rx} ry={o.ry}
                fill={selected === o.id ? `${o.color}30` : `${o.color}18`}
                stroke={o.color}
                strokeWidth={selected === o.id ? 1 : 0.5}
                style={{ transition: 'all 0.25s' }}
              />
              <text x={o.cx} y={o.cy} textAnchor="middle" dominantBaseline="middle"
                style={{ fontSize: '2.6px', fill: 'rgba(220,232,240,0.9)', pointerEvents: 'none', userSelect: 'none', fontFamily: 'Outfit' }}>
                {o.label.split(' ')[0]}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Detail callout */}
      {sel ? (
        <Callout color={sel.color}>
          <strong style={{ color: sel.color }}>🔵 {sel.label}</strong> — {sel.desc}
        </Callout>
      ) : (
        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)', fontStyle: 'italic', padding: '0.5rem' }}>
          Tap any organelle on the diagram above to learn about it
        </div>
      )}

      {/* Quick-select chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        {ORGANELLES.map(o => (
          <button key={o.id} onClick={() => setSelected(selected === o.id ? null : o.id)} style={{
            fontFamily: '"DM Mono", monospace', fontSize: '0.6rem',
            padding: '3px 9px', borderRadius: 99, cursor: 'pointer',
            border: `1px solid ${selected === o.id ? o.color : 'var(--border)'}`,
            background: selected === o.id ? `${o.color}18` : 'var(--surface)',
            color: selected === o.id ? o.color : 'var(--muted)',
            transition: 'all 0.2s',
          }}>{o.label}</button>
        ))}
      </div>
    </div>
  )
}
