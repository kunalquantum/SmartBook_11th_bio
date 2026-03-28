import { useState } from 'react'
import { SimHeader, Btn, Badge, Callout } from '../ui'
import { useInterval } from '../../hooks/useInterval'

const PATHWAYS = {
  aerobic: {
    color: '#00e5ff', label: 'Aerobic Respiration',
    equation: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 38 ATP',
    total: 38,
    stages: [
      { name: 'Glycolysis', loc: 'Cytoplasm', atp: 2, nadh: 2, fadh2: 0,
        input: 'Glucose (C₆H₁₂O₆)', output: '2 Pyruvate + 2 ATP + 2 NADH',
        desc: 'Glucose (6C) split into 2 pyruvate (3C) via 10 enzyme-catalysed steps. Net gain: 2 ATP (substrate-level phosphorylation).' },
      { name: 'Acetyl CoA Formation', loc: 'Mitochondrial matrix', atp: 0, nadh: 2, fadh2: 0,
        input: '2 Pyruvate + 2 CoA', output: '2 Acetyl CoA + 2 CO₂ + 2 NADH',
        desc: 'Oxidative decarboxylation by pyruvate dehydrogenase complex. Each pyruvate loses one CO₂ to form Acetyl CoA (2C).' },
      { name: 'Krebs Cycle (TCA)', loc: 'Mitochondrial matrix', atp: 2, nadh: 6, fadh2: 2,
        input: '2 Acetyl CoA + 4H₂O', output: '4 CO₂ + 6 NADH + 2 FADH₂ + 2 ATP',
        desc: '2 turns per glucose. Acetyl CoA (2C) condenses with OAA (4C) → Citrate (6C). Step-by-step oxidation releases CO₂ and electrons (NADH, FADH₂).' },
      { name: 'Electron Transport System', loc: 'Inner mitochondrial membrane', atp: 34, nadh: 0, fadh2: 0,
        input: '10 NADH + 2 FADH₂ + 6O₂', output: '6 H₂O + 34 ATP',
        desc: 'NADH donates electrons to Complex I; FADH₂ to Complex II. Electrons flow through complexes I→III→IV pumping H⁺ into intermembrane space. ATP synthase harnesses the proton gradient (chemiosmosis).' },
    ],
  },
  anaerobic: {
    color: '#ff4d6d', label: 'Anaerobic Respiration (Fermentation)',
    equation: 'C₆H₁₂O₆ → 2 Lactic Acid / 2 Ethanol + 2CO₂ + 2 ATP',
    total: 2,
    stages: [
      { name: 'Glycolysis', loc: 'Cytoplasm', atp: 2, nadh: 2, fadh2: 0,
        input: 'Glucose', output: '2 Pyruvate + 2 ATP + 2 NADH',
        desc: 'Same as aerobic. Glucose → 2 Pyruvate. NADH must be re-oxidised to NAD⁺ for glycolysis to continue (no ETS present).' },
      { name: 'Fermentation', loc: 'Cytoplasm', atp: 0, nadh: -2, fadh2: 0,
        input: '2 Pyruvate + 2 NADH', output: '2 Lactate (animals) OR 2 Ethanol + 2CO₂ (yeast)',
        desc: 'Lactic acid fermentation (animals, bacteria): Pyruvate → Lactate by LDH. Alcoholic fermentation (yeast/plants): Pyruvate → Acetaldehyde → Ethanol + CO₂ (by PDC & ADH). Regenerates NAD⁺.' },
    ],
  },
}

export function RespirationSimulator() {
  const [pathway, setPathway] = useState('aerobic')
  const [animStep, setAnimStep] = useState(0)

  const pw = PATHWAYS[pathway]
  useInterval(() => setAnimStep(s => (s + 1) % pw.stages.length), 1800)

  const totalATP = pw.stages.reduce((acc, s) => acc + s.atp, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="⚡" title="Cellular Respiration" subtitle="Energy currency — ATP" color="var(--cyan)" />

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Btn active={pathway === 'aerobic'}   onClick={() => { setPathway('aerobic');   setAnimStep(0) }} color="var(--cyan)">🌬️ Aerobic</Btn>
        <Btn active={pathway === 'anaerobic'} onClick={() => { setPathway('anaerobic'); setAnimStep(0) }} color="var(--rose)">🚫 Anaerobic</Btn>
      </div>

      {/* Equation */}
      <div style={{ background: 'var(--surface)', borderRadius: 10, padding: '0.6rem 1rem', border: '1px solid var(--border)', fontFamily: '"DM Mono", monospace', fontSize: '0.72rem', color: pw.color }}>
        {pw.equation}
      </div>

      {/* Stages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {pw.stages.map((s, i) => (
          <div key={s.name} style={{
            background: animStep === i ? `${pw.color}10` : 'var(--surface)',
            border: `1px solid ${animStep === i ? pw.color : 'var(--border)'}`,
            borderRadius: 10, padding: '0.75rem 1rem', transition: 'all 0.4s',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: animStep === i ? '0.5rem' : 0 }}>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.62rem', color: pw.color, background: `${pw.color}18`, padding: '2px 8px', borderRadius: 6 }}>
                  {i + 1}
                </span>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{s.name}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {s.atp > 0 && <Badge color="var(--amber)">+{s.atp} ATP</Badge>}
                {s.nadh > 0 && <Badge color="var(--violet)">+{s.nadh} NADH</Badge>}
                {s.fadh2 > 0 && <Badge color="var(--emerald)">+{s.fadh2} FADH₂</Badge>}
              </div>
            </div>
            {animStep === i && (
              <div className="animate-fadeIn">
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.4rem', fontFamily: '"DM Mono", monospace' }}>
                  📍 {s.loc} &nbsp;|&nbsp; {s.input} → {s.output}
                </div>
                <p style={{ fontSize: '0.78rem', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Total ATP */}
      <div style={{
        display: 'flex', gap: '1rem', alignItems: 'center',
        background: `${pw.color}10`, border: `1px solid ${pw.color}30`,
        borderRadius: 10, padding: '0.75rem 1rem',
      }}>
        <div>
          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 2 }}>Total ATP Yield / Glucose</div>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '2rem', color: pw.color }}>{pw.total} <span style={{ fontSize: '1rem' }}>ATP</span></div>
        </div>
        {pathway === 'aerobic' && (
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.6 }}>
            2 (Glycolysis) + 2 (Krebs) + 34 (ETS)<br/>= <strong style={{ color: pw.color }}>38 ATP</strong> total
          </div>
        )}
      </div>
    </div>
  )
}
