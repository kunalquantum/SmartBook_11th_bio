import { useState } from 'react'
import { SimHeader, StepPill, Btn, Callout } from '../ui'
import { useInterval } from '../../hooks/useInterval'

const MITOSIS_STEPS = [
  {
    name: 'Interphase', color: '#64748b', icon: '⭕',
    sub: 'G1 → S → G2',
    desc: 'Cell grows (G1), DNA replicates (S phase — each chromosome duplicated into 2 sister chromatids joined at centromere), then grows again (G2). Chromatin is diffuse; cell appears normal.',
    events: ['Cell grows in size', 'Organelles duplicated', 'DNA replication (S phase)', 'Proteins synthesised for division'],
  },
  {
    name: 'Prophase', color: '#8b5cf6', icon: '🔵',
    sub: 'Chromatin condenses',
    desc: 'Chromatin condenses into distinct chromosomes (each = 2 sister chromatids). Centrioles move to poles, spindle fibres begin forming. Nuclear envelope starts breaking down.',
    events: ['Chromatin → Chromosomes', 'Centrioles migrate to poles', 'Spindle formation begins', 'Nuclear envelope breakdown'],
  },
  {
    name: 'Metaphase', color: '#00e5ff', icon: '➡️',
    sub: 'Chromosomes align',
    desc: 'Chromosomes are maximally condensed (best time to study karyotype). Spindle fibres attach to centromeres via kinetochores. All chromosomes align at the metaphase plate (equatorial plane).',
    events: ['Chromosomes maximally condensed', 'Spindle fibres attach to kinetochores', 'Chromosomes align at equatorial plate', 'Karyotype analysis done here'],
  },
  {
    name: 'Anaphase', color: '#00e099', icon: '↕️',
    sub: 'Chromatids separate',
    desc: 'Centromeres split. Sister chromatids are pulled to opposite poles by spindle fibres (motor proteins). Cell elongates. Each pole receives one complete set of chromosomes.',
    events: ['Centromeres split', 'Sister chromatids pulled apart', 'Spindle fibres shorten', 'Cell elongates'],
  },
  {
    name: 'Telophase', color: '#ffb300', icon: '🔵🔵',
    sub: 'Two nuclei reform',
    desc: 'Chromosomes reach poles and begin to decondense back into chromatin. Nuclear envelopes reform around each set. Nucleoli reappear. Two daughter nuclei formed.',
    events: ['Chromosomes reach poles', 'Chromosomes decondense', 'Nuclear envelopes reform', 'Nucleoli reappear'],
  },
  {
    name: 'Cytokinesis', color: '#ff4d6d', icon: '✂️',
    sub: 'Cytoplasm divides',
    desc: 'Division of cytoplasm. Animal cells: actin-myosin cleavage furrow constricts inward. Plant cells: cell plate (phragmoplast) forms between daughter cells and extends outward.',
    events: ['Animal: cleavage furrow forms', 'Plant: cell plate forms', 'Cytoplasm equally divided', 'Two genetically identical daughter cells'],
  },
]

export function CellDivisionSimulator() {
  const [step, setStep] = useState(0)
  const [auto, setAuto] = useState(false)

  useInterval(() => setStep(s => (s + 1) % MITOSIS_STEPS.length), auto ? 2000 : null)

  const s = MITOSIS_STEPS[step]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="🔄" title="Cell Division — Mitosis" subtitle="Step through each phase" color="var(--violet)" />

      {/* Phase pills */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {MITOSIS_STEPS.map((ms, i) => (
          <StepPill key={ms.name} label={ms.name} active={step === i} color={ms.color}
            onClick={() => { setStep(i); setAuto(false) }} />
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Btn onClick={() => { setStep(s => (s - 1 + MITOSIS_STEPS.length) % MITOSIS_STEPS.length); setAuto(false) }} color="var(--muted)">← Prev</Btn>
        <Btn active={auto} onClick={() => setAuto(a => !a)} color="var(--violet)">{auto ? '⏹ Stop' : '▶ Auto-Play'}</Btn>
        <Btn onClick={() => { setStep(s => (s + 1) % MITOSIS_STEPS.length); setAuto(false) }} color="var(--muted)">Next →</Btn>
      </div>

      {/* Phase card */}
      <div key={s.name} className="animate-fadeUp" style={{
        background: `${s.color}0d`, border: `2px solid ${s.color}40`,
        borderRadius: 14, padding: '1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '2rem' }}>{s.icon}</div>
          <div>
            <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.2rem', color: s.color }}>{s.name}</div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.62rem', color: 'var(--muted)' }}>{s.sub}</div>
          </div>
        </div>
        <p style={{ fontSize: '0.82rem', lineHeight: 1.75, marginBottom: '0.75rem' }}>{s.desc}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {s.events.map((ev, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.78rem' }}>
              <span style={{
                fontFamily: '"DM Mono", monospace', fontSize: '0.6rem', color: s.color,
                background: `${s.color}18`, width: 20, height: 20, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 1,
              }}>{i + 1}</span>
              {ev}
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.63rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
          Phase {step + 1}/{MITOSIS_STEPS.length}
        </div>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--dim)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${((step + 1) / MITOSIS_STEPS.length) * 100}%`, background: s.color, borderRadius: 2, transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.63rem', color: s.color }}>{Math.round(((step+1)/MITOSIS_STEPS.length)*100)}%</div>
      </div>
    </div>
  )
}
