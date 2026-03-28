import { useState } from 'react'
import { SimHeader, StepPill, Slider, Callout } from '../ui'

const STEPS = [
  {
    name: 'Ultrafiltration', color: '#00e5ff', icon: '🔵',
    location: 'Glomerulus + Bowman\'s Capsule',
    desc: 'High hydrostatic pressure (55 mmHg) in glomerular capillaries forces water, urea, glucose, amino acids, salts and creatinine into Bowman\'s capsule → Glomerular Filtrate. Blood cells and plasma proteins stay behind (too large).',
    filtered: ['Water', 'Urea', 'Glucose', 'Amino acids', 'Salts', 'Creatinine'],
    retained: ['RBCs', 'Plasma proteins', 'Platelets'],
  },
  {
    name: 'Selective Reabsorption', color: '#00e099', icon: '♻️',
    location: 'PCT → Loop of Henle → DCT',
    desc: 'PCT reabsorbs 100% glucose, 100% amino acids, 70–80% Na⁺ (active transport). Loop of Henle creates a concentration gradient in medulla (countercurrent multiplier). DCT fine-tunes salt and acid-base balance.',
    filtered: ['Glucose (100%)', 'Amino acids (100%)', 'Na⁺ (70–80%)', 'Water (obligatory)'],
    retained: ['Urea', 'Creatinine', 'Excess ions'],
  },
  {
    name: 'Tubular Secretion', color: '#ffb300', icon: '⬆️',
    location: 'DCT + Collecting Duct',
    desc: 'Active secretion of H⁺, K⁺, NH₄⁺, drugs and toxins from peritubular capillaries into the tubule lumen. Maintains blood pH (buffering). Final fine-tuning of urine composition.',
    filtered: ['H⁺ ions', 'K⁺ ions', 'NH₄⁺', 'Drugs/toxins'],
    retained: ['Useful metabolites'],
  },
  {
    name: 'Concentration & Excretion', color: '#ff4d6d', icon: '💧',
    location: 'Collecting Duct → Renal Pelvis → Ureter',
    desc: 'ADH (vasopressin) makes collecting duct permeable to water, concentrating urine. Concentrated urine (urea, creatinine, salts, pigments) flows to renal pelvis → ureter → bladder → expelled by micturition reflex.',
    filtered: ['Final urine (hypertonic)', '~1.5 L/day normally'],
    retained: ['Water (ADH-dependent)'],
  },
]

export function ExcretionSimulator() {
  const [step, setStep]   = useState(0)
  const [adh, setAdh]     = useState(50)
  const [gfr, setGfr]     = useState(125)

  const s = STEPS[step]

  const urineVol      = Math.max(0.3, (2.5 - adh / 55)).toFixed(1)
  const concentration = Math.round(adh * 3.5 + 100)
  const filteredDay   = Math.round(gfr * 60 * 24 / 1000) // litres/day

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="🫘" title="Nephron — Urine Formation" subtitle="Step through filtration to excretion" color="var(--cyan)" />

      {/* Steps */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {STEPS.map((st, i) => (
          <StepPill key={st.name} label={st.name} active={step === i} color={st.color} onClick={() => setStep(i)} />
        ))}
      </div>

      {/* Step detail */}
      <div key={s.name} className="animate-fadeUp" style={{
        background: `${s.color}0c`, border: `2px solid ${s.color}35`, borderRadius: 14, padding: '1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '2rem' }}>{s.icon}</div>
          <div>
            <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.1rem', color: s.color }}>{s.name}</div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.6rem', color: 'var(--muted)' }}>📍 {s.location}</div>
          </div>
        </div>
        <p style={{ fontSize: '0.82rem', lineHeight: 1.75, marginBottom: '0.75rem' }}>{s.desc}</p>

        {/* What passes vs retained */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div style={{ background: 'var(--surface)', borderRadius: 8, padding: '0.6rem 0.75rem', border: `1px solid ${s.color}25` }}>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.58rem', color: s.color, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Passes / Secreted</div>
            {s.filtered.map(f => <div key={f} style={{ fontSize: '0.75rem', color: 'var(--text)', padding: '1px 0' }}>✓ {f}</div>)}
          </div>
          <div style={{ background: 'var(--surface)', borderRadius: 8, padding: '0.6rem 0.75rem', border: '1px solid var(--border)' }}>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.58rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Retained / Blocked</div>
            {s.retained.map(f => <div key={f} style={{ fontSize: '0.75rem', color: 'var(--muted)', padding: '1px 0' }}>✗ {f}</div>)}
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Slider label="ADH Level (Vasopressin)" value={adh} onChange={setAdh} color="var(--violet)" />
        <Slider label="GFR (mL/min)" value={gfr} min={80} max={180} onChange={setGfr} color="var(--cyan)" />
      </div>

      {/* Output meters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
        {[
          { l: 'Urine Volume', v: `${urineVol} L/day`, c: 'var(--cyan)' },
          { l: 'Concentration', v: `${concentration} mOsm`, c: 'var(--violet)' },
          { l: 'Filtrate/Day', v: `${filteredDay} L`, c: 'var(--emerald)' },
        ].map(m => (
          <div key={m.l} style={{ background: 'var(--surface)', borderRadius: 10, padding: '0.75rem', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.58rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 3 }}>{m.l}</div>
            <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.2rem', color: m.c }}>{m.v}</div>
          </div>
        ))}
      </div>

      <Callout color="var(--violet)">
        <strong style={{ color: 'var(--violet)' }}>ADH Effect:</strong> High ADH → collecting duct becomes highly permeable to water → concentrated urine (low volume). Low ADH → dilute, large-volume urine (diabetes insipidus if absent).
      </Callout>
    </div>
  )
}
