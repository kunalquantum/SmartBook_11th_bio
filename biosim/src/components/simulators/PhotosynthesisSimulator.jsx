import { useState } from 'react'
import { SimHeader, Btn, Slider, Callout } from '../ui'

const STAGES = {
  light: {
    title: 'Light Reaction', icon: '☀️', color: '#ffb300',
    location: 'Thylakoid membrane (Grana)',
    steps: [
      { n: 1, text: 'Photosystem II (P680) absorbs light energy' },
      { n: 2, text: 'Photolysis of water: 2H₂O → 4H⁺ + 4e⁻ + O₂ (released)' },
      { n: 3, text: 'Electrons pass through ETC (plastoquinone → cytb6f → plastocyanin)' },
      { n: 4, text: 'Photosystem I (P700) re-energises electrons with light' },
      { n: 5, text: 'NADP⁺ reduced to NADPH by ferredoxin-NADP⁺ reductase' },
      { n: 6, text: 'ATP synthesised via photophosphorylation (ATP synthase, chemiosmosis)' },
    ],
    products: ['ATP', 'NADPH', 'O₂'],
  },
  dark: {
    title: 'Calvin Cycle (Dark Reaction)', icon: '🌙', color: '#00e099',
    location: 'Stroma of chloroplast',
    steps: [
      { n: 1, text: 'CO₂ fixation: CO₂ + RuBP (C5) → 2× 3-PGA (C3) — catalysed by RuBisCO' },
      { n: 2, text: '3-PGA phosphorylated using ATP → 1,3-bisphosphoglycerate' },
      { n: 3, text: '1,3-BPG reduced using NADPH → G3P (glyceraldehyde-3-phosphate)' },
      { n: 4, text: 'Some G3P used to synthesise glucose (C6H12O6)' },
      { n: 5, text: 'RuBP regenerated using remaining G3P + ATP (3 turns = 1 CO₂ fixed)' },
    ],
    products: ['G3P → Glucose', 'ADP + Pi', 'NADP⁺'],
  },
  c4: {
    title: 'C4 Pathway (Hatch & Slack)', icon: '🌾', color: '#22c55e',
    location: 'Mesophyll + Bundle sheath (Kranz anatomy)',
    steps: [
      { n: 1, text: 'CO₂ fixed in mesophyll cells by PEP carboxylase → OAA (C4)' },
      { n: 2, text: 'OAA converted to malate/aspartate and transported to bundle sheath cells' },
      { n: 3, text: 'CO₂ released in bundle sheath from malate (decarboxylation)' },
      { n: 4, text: 'Released CO₂ enters normal Calvin cycle (RuBisCO)' },
      { n: 5, text: 'PEP regenerated in mesophyll using ATP; cycle continues' },
    ],
    products: ['Glucose (efficient)', 'No photorespiration'],
  },
}

export function PhotosynthesisSimulator() {
  const [stage, setStage] = useState('light')
  const [light, setLight] = useState(60)
  const [co2, setCo2] = useState(50)

  const st = STAGES[stage]

  // Derived outputs
  const atp    = Math.round(light * 0.4)
  const nadph  = Math.round(light * 0.35)
  const glucose = Math.round(co2 * 0.5 * (light / 100))
  const o2     = Math.round(light * 0.3)

  // Blackman's limiting factor
  const limitingFactor = light < co2 * 0.8 ? 'Light Intensity' : 'CO₂ Concentration'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="☀️" title="Photosynthesis" subtitle="Adjust conditions — observe Blackman's Law" color="var(--amber)" />

      {/* Stage selector */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {Object.entries(STAGES).map(([key, val]) => (
          <Btn key={key} active={stage === key} onClick={() => setStage(key)} color={val.color}>
            {val.icon} {val.title.split(' ')[0]}
          </Btn>
        ))}
      </div>

      {/* Stage detail */}
      <div key={stage} className="animate-fadeUp" style={{
        background: `${st.color}08`, border: `1px solid ${st.color}25`, borderRadius: 12, padding: '1rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, color: st.color }}>{st.icon} {st.title}</div>
          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.6rem', color: 'var(--muted)' }}>📍 {st.location}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {st.steps.map(s => (
            <div key={s.n} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.78rem' }}>
              <span style={{
                fontFamily: '"DM Mono", monospace', fontSize: '0.6rem', color: st.color,
                background: `${st.color}18`, width: 20, height: 20, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
              }}>{s.n}</span>
              {s.text}
            </div>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Slider label="Light Intensity" value={light} onChange={setLight} color="var(--amber)" />
        <Slider label="CO₂ Concentration" value={co2} onChange={setCo2} color="var(--emerald)" />
      </div>

      {/* Output meters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.5rem' }}>
        {[
          { l: 'ATP', v: atp, c: 'var(--amber)' },
          { l: 'NADPH', v: nadph, c: 'var(--violet)' },
          { l: 'Glucose', v: glucose, c: 'var(--emerald)' },
          { l: 'O₂', v: o2, c: 'var(--cyan)' },
        ].map(m => (
          <div key={m.l} style={{
            background: 'var(--surface)', borderRadius: 10, padding: '0.75rem', textAlign: 'center',
            border: `1px solid var(--border)`,
          }}>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.58rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 3 }}>{m.l}</div>
            <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', color: m.c }}>{m.v}</div>
          </div>
        ))}
      </div>

      <Callout color="var(--amber)">
        <strong style={{ color: 'var(--amber)' }}>Blackman's Law of Limiting Factors:</strong> The rate of photosynthesis is limited by whichever factor is present in the least amount. Currently, <strong style={{ color: 'var(--cyan)' }}>{limitingFactor}</strong> is the limiting factor.
      </Callout>
    </div>
  )
}
