import { useState } from 'react'
import { SimHeader, Callout, Badge } from '../ui'

const KINGDOMS = [
  {
    name: 'Monera', color: '#ff4d6d', icon: '🦠',
    desc: 'Prokaryotes — no true nucleus, no membrane-bound organelles. Includes Bacteria and Cyanobacteria.',
    nutrition: 'Autotrophic / Heterotrophic',
    cellType: 'Prokaryotic',
    body: 'Unicellular',
    examples: ['E. coli', 'Nostoc', 'Anabaena', 'Lactobacillus'],
    keyFact: 'Cell wall made of peptidoglycan (murein). Reproduce by binary fission.',
  },
  {
    name: 'Protista', color: '#ffb300', icon: '🔬',
    desc: 'Unicellular eukaryotes. Divided into plant-like (algae), animal-like (protozoa), and fungi-like (slime moulds).',
    nutrition: 'Autotrophic / Heterotrophic / Mixotrophic',
    cellType: 'Eukaryotic',
    body: 'Unicellular',
    examples: ['Amoeba', 'Euglena', 'Plasmodium', 'Paramecium'],
    keyFact: 'Euglena has both chloroplasts (autotrophic) and can ingest food (heterotrophic) — a mixotroph.',
  },
  {
    name: 'Fungi', color: '#8b5cf6', icon: '🍄',
    desc: 'Heterotrophic eukaryotes with absorptive nutrition. Body is made of hyphae forming a mycelium.',
    nutrition: 'Heterotrophic (Absorptive / Saprophytic)',
    cellType: 'Eukaryotic',
    body: 'Multicellular (except yeasts)',
    examples: ['Rhizopus', 'Penicillium', 'Agaricus', 'Saccharomyces'],
    keyFact: 'Cell wall contains chitin (not cellulose). Store food as glycogen, not starch.',
  },
  {
    name: 'Plantae', color: '#00e099', icon: '🌿',
    desc: 'Autotrophic, multicellular eukaryotes with cellulose cell walls. Primary producers of all ecosystems.',
    nutrition: 'Autotrophic (Photosynthetic)',
    cellType: 'Eukaryotic',
    body: 'Multicellular',
    examples: ['Moss', 'Fern', 'Pine', 'Mango Tree'],
    keyFact: 'Chlorophyll a and b are the primary pigments. Cell vacuoles store sap and maintain turgor pressure.',
  },
  {
    name: 'Animalia', color: '#00e5ff', icon: '🐾',
    desc: 'Heterotrophic, multicellular eukaryotes without cell walls. Ingestive nutrition and complex organ systems.',
    nutrition: 'Heterotrophic (Ingestive / Holozoic)',
    cellType: 'Eukaryotic',
    body: 'Multicellular',
    examples: ['Hydra', 'Earthworm', 'Cockroach', 'Human'],
    keyFact: 'No cell wall. Store food as glycogen. Only kingdom with nervous system and muscle tissue.',
  },
]

export function FiveKingdomSimulator() {
  const [active, setActive] = useState(0)
  const k = KINGDOMS[active]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="🌍" title="Five Kingdom Classification" subtitle="R.H. Whittaker, 1969" color="var(--emerald)" />

      {/* Kingdom tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {KINGDOMS.map((kk, i) => (
          <button key={kk.name} onClick={() => setActive(i)} style={{
            padding: '7px 15px', borderRadius: 10, cursor: 'pointer',
            border: `2px solid ${active === i ? kk.color : 'var(--border)'}`,
            background: active === i ? `${kk.color}18` : 'var(--surface)',
            color: active === i ? kk.color : 'var(--muted)',
            fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '0.82rem',
            transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {kk.icon} {kk.name}
          </button>
        ))}
      </div>

      {/* Kingdom detail panel */}
      <div key={k.name} className="animate-fadeUp" style={{
        background: `${k.color}0c`, border: `1px solid ${k.color}30`,
        borderRadius: 14, padding: '1.25rem',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{k.icon}</div>
        <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.4rem', color: k.color, marginBottom: '0.4rem' }}>
          Kingdom {k.name}
        </div>
        <p style={{ fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.75, marginBottom: '1rem' }}>{k.desc}</p>

        {/* Properties grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
          {[
            { label: 'Cell Type', value: k.cellType },
            { label: 'Body', value: k.body },
            { label: 'Nutrition', value: k.nutrition },
          ].map(p => (
            <div key={p.label} style={{
              background: 'var(--surface)', borderRadius: 8, padding: '0.6rem 0.75rem',
              border: `1px solid ${k.color}22`,
            }}>
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.58rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
                {p.label}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 500 }}>{p.value}</div>
            </div>
          ))}
        </div>

        {/* Examples */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
            Examples
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {k.examples.map(e => <Badge key={e} color={k.color}>{e}</Badge>)}
          </div>
        </div>

        <Callout color={k.color}>
          <strong style={{ color: k.color }}>Key Fact: </strong>{k.keyFact}
        </Callout>
      </div>
    </div>
  )
}
