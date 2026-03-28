import { useState } from 'react'
import { SimHeader, Btn, Slider, ProgressBar, Callout } from '../ui'
import { useInterval } from '../../hooks/useInterval'

const STEPS = ['Free Enzyme', 'Substrate Binds', 'ES Complex', 'Product Released']

const MODEL_INFO = {
  lockkey: {
    color: 'var(--amber)',
    title: 'Lock & Key Model',
    author: 'Emil Fischer, 1894',
    desc: 'The active site has a rigid, pre-formed shape that exactly matches the substrate geometry — like a key fitting a specific lock. The shape does not change upon binding.',
  },
  induced: {
    color: 'var(--violet)',
    title: 'Induced Fit Model',
    author: 'Daniel Koshland, 1958',
    desc: 'The active site is flexible and moulds itself around the substrate upon binding, changing shape to optimise the interaction. More accurate and widely accepted today.',
  },
}

export function EnzymeSimulator() {
  const [model, setModel] = useState('lockkey')
  const [temp, setTemp] = useState(37)
  const [ph, setPh] = useState(7)
  const [animStep, setAnimStep] = useState(0)

  useInterval(() => setAnimStep(s => (s + 1) % 4), 900)

  const m = MODEL_INFO[model]

  // Activity calculation
  const tempEffect = Math.max(0, 1 - Math.abs(temp - 37) * 0.04)
  const phEffect   = Math.max(0, 1 - Math.abs(ph - 7) * 0.18)
  const activity   = Math.round(tempEffect * phEffect * 100)

  const actColor = activity > 65 ? 'var(--emerald)' : activity > 35 ? 'var(--amber)' : 'var(--rose)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="⚗️" title="Enzyme Mechanism" subtitle="Adjust conditions to observe activity changes" color="var(--amber)" />

      {/* Model selector */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Btn active={model === 'lockkey'} onClick={() => setModel('lockkey')} color="var(--amber)">🔒 Lock & Key</Btn>
        <Btn active={model === 'induced'} onClick={() => setModel('induced')} color="var(--violet)">🔄 Induced Fit</Btn>
      </div>

      {/* Model description */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10, padding: '0.75rem 1rem',
      }}>
        <div style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '0.85rem', marginBottom: 2 }}>{m.title}</div>
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.62rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>{m.author}</div>
        <p style={{ fontSize: '0.78rem', lineHeight: 1.7, color: 'var(--text)' }}>{m.desc}</p>
      </div>

      {/* Reaction animation */}
      <div style={{ background: 'var(--surface)', borderRadius: 12, padding: '0.75rem', border: '1px solid var(--border)' }}>
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          Reaction Steps
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                padding: '5px 11px', borderRadius: 8, fontSize: '0.72rem',
                border: `1px solid ${animStep === i ? (model === 'lockkey' ? '#ffb300' : '#8b5cf6') : 'var(--border)'}`,
                background: animStep === i ? (model === 'lockkey' ? '#ffb30020' : '#8b5cf620') : 'transparent',
                color: animStep === i ? 'var(--text)' : 'var(--muted)',
                transition: 'all 0.4s', fontFamily: '"DM Mono", monospace',
              }}>{s}</div>
              {i < STEPS.length - 1 && <span style={{ color: 'var(--dim)', fontSize: '0.8rem' }}>→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Environmental factors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Slider label="Temperature (°C)" value={temp} min={0} max={70} onChange={setTemp} color="var(--rose)" />
        <Slider label="pH" value={ph} min={0} max={14} step={0.5} onChange={setPh} color="var(--violet)" />
        <ProgressBar value={activity} label="Relative Enzyme Activity (%)" color={actColor} />
      </div>

      {/* Dynamic callout */}
      <Callout color={actColor}>
        {temp > 55 && <><strong style={{ color: 'var(--rose)' }}>⚠️ Denaturation</strong> — Above ~50°C, H-bonds holding the enzyme's tertiary structure break. Active site loses its shape permanently.<br /></>}
        {temp < 10 && <><strong style={{ color: 'var(--cyan)' }}>❄️ Low Activity</strong> — Low temperature reduces kinetic energy. Fewer enzyme-substrate collisions per second.<br /></>}
        {ph < 4 && <><strong style={{ color: 'var(--rose)' }}>⚠️ Acidic pH</strong> — Extreme acidity protonates amino acid R-groups, disrupting ionic bonds in active site.<br /></>}
        {ph > 10 && <><strong style={{ color: 'var(--rose)' }}>⚠️ Alkaline pH</strong> — Extreme alkalinity deprotonates R-groups, similarly distorting active site geometry.<br /></>}
        {activity >= 80 && <>✅ <strong style={{ color: 'var(--emerald)' }}>Optimal conditions</strong> — Temperature and pH are near the enzyme's optimum. Maximum activity achieved.</>}
        {activity < 80 && activity >= 35 && <>Activity is moderate. Adjust temperature closer to 37°C and pH closer to 7 for maximum activity.</>}
        {activity < 35 && activity > 0 && <>Very low activity. Conditions are far from optimal — enzyme is partially or fully denatured.</>}
      </Callout>
    </div>
  )
}
