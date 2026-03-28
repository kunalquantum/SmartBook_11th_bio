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

function KingdomEnvironment({ kingdom, color }) {
  let particles = []
  
  // Create 15 deterministic "random" spots for purely visual background noise
  // We use prime modulus so it looks random but remains stable on re-renders
  const getPos = (i, prime) => `${(i * prime) % 100}%`

  if (kingdom === 'Monera') {
    // Vibrating bacilli
    particles = Array.from({length: 15}).map((_, i) => (
      <div key={i} style={{
        position: 'absolute', top: getPos(i, 41), left: getPos(i, 67),
        width: 14, height: 6, borderRadius: 6, background: color, opacity: 0.15 + (i%3)*0.1,
        animation: `vibrate ${0.3 + (i%5)*0.1}s infinite alternate ease-in-out`
      }} />
    ))
  } else if (kingdom === 'Protista') {
    // Drifting irregular amoeba blobs
    particles = Array.from({length: 10}).map((_, i) => (
      <div key={i} style={{
        position: 'absolute', top: getPos(i, 31), left: getPos(i, 53),
        width: 24, height: 24, borderRadius: '40% 60% 70% 30%', background: color, opacity: 0.1 + (i%2)*0.1,
        animation: `float-slow ${8 + (i%5)*2}s infinite alternate ease-in-out`
      }} />
    ))
  } else if (kingdom === 'Fungi') {
    // Rising spores
    particles = Array.from({length: 20}).map((_, i) => (
      <div key={i} style={{
        position: 'absolute', top: getPos(i, 19), left: getPos(i, 71),
        width: 6, height: 6, borderRadius: '50%', background: color, opacity: 0.2 + (i%4)*0.1,
        animation: `rise-up ${4 + (i%4)*2}s infinite linear`
      }} />
    ))
  } else if (kingdom === 'Plantae') {
    // Drifting geometric leaves
    particles = Array.from({length: 12}).map((_, i) => (
      <div key={i} style={{
        position: 'absolute', top: getPos(i, 23), left: getPos(i, 83),
        width: 16, height: 16, borderRadius: '0 50% 0 50%', background: color, opacity: 0.15 + (i%3)*0.1,
        animation: `fall-spin ${6 + (i%5)*2}s infinite linear`
      }} />
    ))
  } else if (kingdom === 'Animalia') {
    // Quick darting dots
    particles = Array.from({length: 8}).map((_, i) => (
      <div key={i} style={{
        position: 'absolute', top: getPos(i, 89), left: getPos(i, 37),
        width: 8, height: 8, borderRadius: '50%', background: color, opacity: 0.2,
        animation: `dart ${2 + (i%3)*1.5}s infinite cubic-bezier(0.175, 0.885, 0.32, 1.275)`
      }} />
    ))
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0, borderRadius: 14 }}>
      {particles}
    </div>
  )
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
      <style>
        {`
          @keyframes vibrate {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(2px, 2px) rotate(5deg); }
            66% { transform: translate(-2px, -1px) rotate(-3deg); }
          }
          @keyframes float-slow {
            0% { transform: translate(0, 0) rotate(0deg) scale(1); }
            100% { transform: translate(20px, -20px) rotate(45deg) scale(1.1); }
          }
          @keyframes rise-up {
            0% { transform: translateY(50vh) scale(0.5); opacity: 0; }
            50% { opacity: 0.6; }
            100% { transform: translateY(-10vh) scale(1.2); opacity: 0; }
          }
          @keyframes fall-spin {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
            20% { opacity: 0.5; }
            80% { opacity: 0.5; }
            100% { transform: translateY(30vh) rotate(360deg); opacity: 0; }
          }
          @keyframes dart {
            0%, 50%, 100% { transform: translate(0,0); opacity: 0; }
            60% { transform: translate(100px, 20px); opacity: 0.5; }
            70% { transform: translate(120px, -30px); opacity: 0; }
          }
        `}
      </style>
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

      <div style={{ position: 'relative', minHeight: 400 }}>
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

            <div key={flowStep} className="animate-fadeUp" style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.8rem', textAlign: 'center', color: 'var(--emerald)', transition: 'all 0.3s' }}>
              {FLOW_NODES[flowStep].q}
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {FLOW_NODES[flowStep].opts.map(opt => (
                <button key={opt.t} onClick={() => handleFlow(opt)} style={{
                  padding: '12px 24px', borderRadius: 12, border: `2px solid ${opt.c}50`,
                  background: `${opt.c}10`, color: opt.c, cursor: 'pointer',
                  fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '1rem',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', boxShadow: `0 4px 12px ${opt.c}20`,
                }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}>
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
          <div className="animate-fadeUp">
            {/* Kingdom tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {KINGDOMS.map((kk, i) => (
                <button key={kk.name} onClick={() => setActive(i)} style={{
                  padding: '7px 15px', borderRadius: 10, cursor: 'pointer',
                  border: `2px solid ${active === i ? kk.color : 'var(--border)'}`,
                  background: active === i ? `${kk.color}18` : 'var(--surface)',
                  color: active === i ? kk.color : 'var(--muted)',
                  fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '0.82rem',
                  transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: 6,
                  transform: active === i ? 'translateY(-2px)' : 'none',
                  boxShadow: active === i ? `0 4px 10px ${kk.color}30` : 'none'
                }}>
                  {kk.icon} {kk.name}
                </button>
              ))}
            </div>

            {/* Kingdom detail panel */}
            <div key={k.name} className="animate-fadeUp" style={{
              position: 'relative',
              background: `${k.color}08`, border: `1px solid ${k.color}30`,
              borderRadius: 14, padding: '1.5rem', overflow: 'hidden',
              boxShadow: `inset 0 0 40px ${k.color}10`,
            }}>
              <KingdomEnvironment kingdom={k.name} color={k.color} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem', filter: `drop-shadow(0 4px 8px ${k.color}60)` }}>{k.icon}</div>
                <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.6rem', color: k.color, marginBottom: '0.4rem', fontWeight: 600 }}>
                  Kingdom {k.name}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.75, marginBottom: '1.5rem' }}>{k.desc}</p>

                {/* Properties grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {[
                    { label: 'Cell Type', value: k.cellType },
                    { label: 'Body', value: k.body },
                    { label: 'Nutrition', value: k.nutrition },
                  ].map(p => (
                    <div key={p.label} style={{
                      background: 'rgba(25,25,25,0.6)', borderRadius: 12, padding: '0.8rem',
                      border: `1px solid ${k.color}40`, backdropFilter: 'blur(8px)',
                      boxShadow: `0 4px 12px rgba(0,0,0,0.2)`
                    }}>
                      <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.62rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                        {p.label}
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>{p.value}</div>
                    </div>
                  ))}
                </div>

                {/* Examples */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
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
          </div>
        )}
      </div>
    </div>
  )
}
