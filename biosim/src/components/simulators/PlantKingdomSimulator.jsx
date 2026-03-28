import { useState } from 'react'
import { SimHeader, Btn, Callout } from '../ui'

const PLANTS = [
  {
    name: 'Algae', icon: '🌊', color: '#00e099', group: 'Thallophyta',
    generation: 'Haplontic', nPercent: 90,
    nPhase: 'Dominant (entire plant body)',
    x2nPhase: 'Zygote only (transient window)',
    nLabel: 'Gametophyte (n)', x2nLabel: 'Sporophyte (2n)',
    desc: 'In algae, the haploid gametophyte is the dominant, independent phase. The 2n stage exists only as a brief zygote before meiosis restores the haploid state.',
    examples: ['Spirogyra', 'Chlamydomonas', 'Ulva', 'Fucus'],
  },
  {
    name: 'Moss', icon: '🌱', color: '#7cfc00', group: 'Bryophyta',
    generation: 'Haplodiplontic', nPercent: 65,
    nPhase: 'Dominant gametophyte (leafy shoot)',
    x2nPhase: 'Dependent sporophyte (capsule)',
    nLabel: 'Gametophyte (n)', x2nLabel: 'Sporophyte (2n)',
    desc: 'Both phases present. The haploid gametophyte is still dominant and photosynthetically independent. The diploid sporophyte grows on and depends on the gametophyte.',
    examples: ['Funaria', 'Polytrichum', 'Sphagnum'],
  },
  {
    name: 'Fern', icon: '🌿', color: '#22c55e', group: 'Pteridophyta',
    generation: 'Haplodiplontic', nPercent: 35,
    nPhase: 'Small, independent prothallus',
    x2nPhase: 'Dominant, independent fern frond',
    nLabel: 'Gametophyte (n)', x2nLabel: 'Sporophyte (2n)',
    desc: 'A transitional type — both phases are independent. But the diploid sporophyte (the recognisable fern plant) is now dominant. The gametophyte (prothallus) is tiny.',
    examples: ['Dryopteris', 'Adiantum', 'Equisetum', 'Selaginella'],
  },
  {
    name: 'Gymnosperm', icon: '🌲', color: '#16a34a', group: 'Phanerogam',
    generation: 'Diplontic', nPercent: 12,
    nPhase: 'Pollen grain & ovule (dependent)',
    x2nPhase: 'Dominant plant body (tree)',
    nLabel: 'Gametophyte (n)', x2nLabel: 'Sporophyte (2n)',
    desc: 'The sporophyte is completely dominant. The gametophyte is microscopic and fully dependent on the sporophyte. Seeds are naked (not enclosed in fruit).',
    examples: ['Pinus', 'Cycas', 'Gnetum', 'Sequoia'],
  },
  {
    name: 'Angiosperm', icon: '🌸', color: '#f472b6', group: 'Phanerogam',
    generation: 'Diplontic', nPercent: 3,
    nPhase: 'Embryo sac (few cells, dependent)',
    x2nPhase: 'Dominant plant body (tree/flower)',
    nLabel: 'Gametophyte (n)', x2nLabel: 'Sporophyte (2n)',
    desc: 'Most advanced. Sporophyte is entirely dominant. Gametophyte is maximally reduced. Seeds are enclosed within fruits — the key distinguishing feature.',
    examples: ['Mango', 'Rose', 'Wheat', 'Sunflower'],
  },
]

export function PlantKingdomSimulator() {
  const [idx, setIdx] = useState(0)
  const p = PLANTS[idx]

  // SVG dimensions & math
  const r = 64
  const c = 2 * Math.PI * r
  const nLen = (p.nPercent / 100) * c
  const x2nLen = c - nLen
  const offset = c * 0.25 // Rotate so boundaries aren't perfectly at 0 deg

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="🌿" title="Plant Kingdom & Life Cycles" subtitle="Alternation of Generations Cycle" color="var(--emerald)" />

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {PLANTS.map((pl, i) => (
          <Btn key={pl.name} active={idx === i} onClick={() => setIdx(i)} color={pl.color}>
            {pl.icon} {pl.name}
          </Btn>
        ))}
      </div>

      <div key="content" className="animate-fadeUp" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Dynamic SVG Visualisation */}
        <div style={{
          background: 'var(--surface)', border: `1px solid var(--border)`,
          borderRadius: 16, padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '2rem', flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: 200 }}>
             <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{
                fontFamily: '"DM Mono", monospace', fontSize: '0.7rem', textTransform: 'uppercase',
                letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 99,
                background: `${p.color}20`, color: p.color, border: `1px solid ${p.color}40`,
              }}>{p.generation}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{p.group}</span>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text)' }}>
              {p.desc}
            </p>
          </div>

          <div style={{ position: 'relative', width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)', filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.2))' }}>
              {/* Sporophyte Cycle (2n) */}
              <circle cx="80" cy="80" r={r} fill="transparent"
                      stroke="#ff9800" strokeWidth="18"
                      strokeDasharray={`${x2nLen} ${c}`}
                      strokeDashoffset={-offset}
                      style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), stroke-dashoffset 0.8s' }} />
              {/* Gametophyte Cycle (n) */}
              <circle cx="80" cy="80" r={r} fill="transparent"
                      stroke="#00e5ff" strokeWidth="18"
                      strokeDasharray={`${nLen} ${c}`}
                      strokeDashoffset={-offset - x2nLen}
                      style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), stroke-dashoffset 0.8s' }} />
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '1rem', fontWeight: 700, color: '#00e5ff' }}>
                {p.nPercent}%
              </div>
              <div style={{ width: 30, height: 1, background: 'var(--border)', margin: '4px 0' }} />
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '1rem', fontWeight: 700, color: '#ff9800' }}>
                {100 - p.nPercent}%
              </div>
            </div>
          </div>
        </div>

        {/* Phase comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '0.75rem' }}>
          {[
            { label: p.nLabel,   value: p.nPhase,   color: '#00e5ff', icon: '♀', percent: p.nPercent },
            { label: p.x2nLabel, value: p.x2nPhase, color: '#ff9800', icon: '♂', percent: 100 - p.nPercent },
          ].map((ph, i) => (
            <div key={i} style={{
              background: `${ph.color}10`, border: `1px solid ${ph.color}30`,
              borderRadius: 12, padding: '1rem', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: -10, right: -10, fontSize: '4rem', opacity: 0.1 }}>{ph.icon}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.65rem', color: ph.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {ph.label}
                </div>
                <div style={{ background: `${ph.color}20`, color: ph.color, borderRadius: 6, padding: '2px 6px', fontSize: '0.65rem', fontWeight: 'bold' }}>
                  {ph.percent}%
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', lineHeight: 1.5, fontWeight: 500 }}>{ph.value}</div>
            </div>
          ))}
        </div>

        {/* Examples */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--muted)', marginRight: '0.5rem' }}>Examples:</span>
          {p.examples.map(e => (
            <span key={e} style={{
              fontFamily: '"DM Mono", monospace', fontSize: '0.7rem',
              padding: '4px 12px', borderRadius: 99,
              border: `1px solid ${p.color}30`, color: p.color,
              background: `${p.color}0a`,
            }}>{e}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
