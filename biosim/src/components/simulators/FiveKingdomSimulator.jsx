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

const FLOW_NODES = {
  START: {
    q: 'What is the Cell Type of the organism?',
    opts: [
      { t: 'Prokaryotic (No true nucleus)', next: 0, c: '#ff4d6d' },
      { t: 'Eukaryotic (True nucleus present)', next: 'ORG', c: '#8b5cf6' }
    ]
  },
  ORG: {
    q: 'What is its Body Organisation?',
    opts: [
      { t: 'Unicellular', next: 1, c: '#ffb300' },
      { t: 'Multicellular (or multinucleate)', next: 'NUT', c: '#00e099' }
    ]
  },
  NUT: {
    q: 'What is its Mode of Nutrition?',
    opts: [
      { t: 'Autotrophic (Photosynthetic)', next: 3, c: '#00e099' },
      { t: 'Heterotrophic (Absorptive)', next: 2, c: '#8b5cf6' },
      { t: 'Heterotrophic (Ingestive)', next: 4, c: '#00e5ff' }
    ]
  }
}

export function FiveKingdomSimulator() {
  const [active, setActive] = useState(0)
  const [view, setView] = useState('tabs') // 'tabs' or 'key'
  const [flowStep, setFlowStep] = useState('START')
  const [flowHistory, setFlowHistory] = useState([])

  const k = KINGDOMS[active]

  const handleFlow = (opt) => {
    if (typeof opt.next === 'number') {
      // Discovered!
      setActive(opt.next)
      setView('tabs')
      setFlowStep('START')
      setFlowHistory([])
    } else {
      setFlowHistory([...flowHistory, { step: flowStep, answer: opt.t }])
      setFlowStep(opt.next)
    }
  }

  const resetFlow = () => {
    setFlowStep('START')
    setFlowHistory([])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="🌍" title="Five Kingdom Classification" subtitle="R.H. Whittaker, 1969" color="var(--emerald)" />

      {/* View Toggle */}
      <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--surface)', padding: 4, borderRadius: 12, width: 'max-content' }}>
        <button onClick={() => setView('tabs')} style={{
          padding: '6px 14px', borderRadius: 8, cursor: 'pointer', border: 'none',
          background: view === 'tabs' ? 'var(--emerald)' : 'transparent',
          color: view === 'tabs' ? '#000' : 'var(--text)',
          fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s'
        }}>Explore Grid</button>
        <button onClick={() => setView('key')} style={{
          padding: '6px 14px', borderRadius: 8, cursor: 'pointer', border: 'none',
          background: view === 'key' ? 'var(--emerald)' : 'transparent',
          color: view === 'key' ? '#000' : 'var(--text)',
          fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s'
        }}>Whittaker's Dichotomous Key</button>
      </div>

      {view === 'key' ? (
        <div className="animate-fadeUp" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', minHeight: 300, justifyContent: 'center' }}>
          
          {flowHistory.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1rem' }}>
              {flowHistory.map((h, i) => (
                <div key={i} style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ background: 'var(--bg)', padding: '4px 10px', borderRadius: 99, border: '1px solid var(--border)' }}>{h.answer}</span>
                  {i < flowHistory.length - 1 && '→'}
                </div>
              ))}
            </div>
          )}

          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.6rem', textAlign: 'center', color: 'var(--emerald)' }}>
            {FLOW_NODES[flowStep].q}
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {FLOW_NODES[flowStep].opts.map(opt => (
              <button key={opt.t} onClick={() => handleFlow(opt)} style={{
                padding: '12px 24px', borderRadius: 12, border: `2px solid ${opt.c}50`,
                background: `${opt.c}10`, color: opt.c, cursor: 'pointer',
                fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '1rem',
                transition: 'all 0.2s', boxShadow: `0 4px 12px ${opt.c}20`,
              }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                {opt.t}
              </button>
            ))}
          </div>

          {flowStep !== 'START' && (
            <button onClick={resetFlow} style={{
              marginTop: '1rem', background: 'transparent', border: 'none', color: 'var(--muted)',
              fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline'
            }}>Start Over</button>
          )}

        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}
