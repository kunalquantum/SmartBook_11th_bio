import { useState } from 'react'
import { SimHeader, Btn, Callout } from '../ui'

const PLANTS = [
  {
    name: 'Algae', icon: '🌊', color: '#00e099', group: 'Thallophyta',
    generation: 'Haplontic',
    nPhase: 'Dominant (entire plant body)',
    x2nPhase: 'Zygote only (transient)',
    nLabel: 'Gametophyte (n)', x2nLabel: 'Sporophyte (2n)',
    desc: 'In algae, the haploid gametophyte is the dominant, independent phase. The 2n stage exists only as a brief zygote before meiosis restores the haploid state.',
    examples: ['Spirogyra', 'Chlamydomonas', 'Ulva', 'Fucus'],
  },
  {
    name: 'Moss', icon: '🌱', color: '#7cfc00', group: 'Bryophyta',
    generation: 'Haplodiplontic',
    nPhase: 'Dominant gametophyte (thallus/leafy shoot)',
    x2nPhase: 'Dependent sporophyte (capsule on gametophyte)',
    nLabel: 'Gametophyte (n)', x2nLabel: 'Sporophyte (2n)',
    desc: 'Both phases present. The haploid gametophyte is still dominant and photosynthetically independent. The diploid sporophyte grows on and depends on the gametophyte.',
    examples: ['Funaria', 'Polytrichum', 'Sphagnum'],
  },
  {
    name: 'Fern', icon: '🌿', color: '#22c55e', group: 'Pteridophyta',
    generation: 'Haplodiplontic',
    nPhase: 'Small, independent prothallus',
    x2nPhase: 'Dominant, independent plant (fern frond)',
    nLabel: 'Gametophyte (n)', x2nLabel: 'Sporophyte (2n)',
    desc: 'A transitional type — both phases are independent. But the diploid sporophyte (the recognisable fern plant) is now dominant. The gametophyte (prothallus) is tiny.',
    examples: ['Dryopteris', 'Adiantum', 'Equisetum', 'Selaginella'],
  },
  {
    name: 'Gymnosperm', icon: '🌲', color: '#16a34a', group: 'Phanerogam',
    generation: 'Diplontic',
    nPhase: 'Pollen grain & ovule (entirely dependent on sporophyte)',
    x2nPhase: 'Dominant plant body (tree/shrub)',
    nLabel: 'Gametophyte (n)', x2nLabel: 'Sporophyte (2n)',
    desc: 'The sporophyte is completely dominant. The gametophyte is microscopic and fully dependent on the sporophyte. Seeds are naked (not enclosed in fruit).',
    examples: ['Pinus', 'Cycas', 'Gnetum', 'Sequoia'],
  },
  {
    name: 'Angiosperm', icon: '🌸', color: '#f472b6', group: 'Phanerogam',
    generation: 'Diplontic',
    nPhase: 'Pollen tube & embryo sac (3–8 cells only)',
    x2nPhase: 'Dominant plant body; seeds enclosed in fruit',
    nLabel: 'Gametophyte (n)', x2nLabel: 'Sporophyte (2n)',
    desc: 'Most advanced. Sporophyte is entirely dominant. Gametophyte is maximally reduced. Seeds are enclosed within fruits — the key distinguishing feature.',
    examples: ['Mango', 'Rose', 'Wheat', 'Sunflower'],
  },
]

export function PlantKingdomSimulator() {
  const [idx, setIdx] = useState(0)
  const p = PLANTS[idx]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="🌿" title="Plant Kingdom & Life Cycles" subtitle="Alternation of Generations" color="var(--emerald)" />

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {PLANTS.map((pl, i) => (
          <Btn key={pl.name} active={idx === i} onClick={() => setIdx(i)} color={pl.color}>
            {pl.icon} {pl.name}
          </Btn>
        ))}
      </div>

      <div key={p.name} className="animate-fadeUp">
        {/* Generation type badge */}
        <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{
            fontFamily: '"DM Mono", monospace', fontSize: '0.65rem', textTransform: 'uppercase',
            letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 99,
            background: `${p.color}20`, color: p.color, border: `1px solid ${p.color}40`,
          }}>{p.generation}</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{p.group}</span>
        </div>

        {/* Phase comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
          {[
            { label: p.nLabel,   value: p.nPhase,   color: '#00e5ff', icon: '♀' },
            { label: p.x2nLabel, value: p.x2nPhase, color: '#ff9800', icon: '♂' },
          ].map(ph => (
            <div key={ph.label} style={{
              background: `${ph.color}0a`, border: `1px solid ${ph.color}28`,
              borderRadius: 12, padding: '1rem',
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{ph.icon}</div>
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.6rem', color: ph.color, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {ph.label}
              </div>
              <div style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>{ph.value}</div>
            </div>
          ))}
        </div>

        <Callout color={p.color}>{p.desc}</Callout>

        {/* Examples */}
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {p.examples.map(e => (
            <span key={e} style={{
              fontFamily: '"DM Mono", monospace', fontSize: '0.62rem',
              padding: '3px 10px', borderRadius: 99,
              border: `1px solid ${p.color}30`, color: p.color,
              background: `${p.color}0a`,
            }}>{e}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
