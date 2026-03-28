import { Card, TopicChips } from '../ui'
import * as Simulators from '../simulators'
import { PlaceholderSimulator } from '../simulators'

export function ChapterView({ chapter, unitColor }) {
  // Dynamically resolve the simulator component from the registry
  const SimComponent = Simulators[chapter.simulator] || null

  return (
    <div className="animate-fadeUp" style={{ padding: '2rem' }}>
      {/* Chapter hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--card), rgba(15,34,54,0.4))',
        border: `1px solid ${unitColor}30`,
        borderRadius: 20, padding: '1.75rem 2rem', marginBottom: '1.75rem',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 180, height: 180, borderRadius: '50%',
          background: `${unitColor}08`, filter: 'blur(40px)',
          pointerEvents: 'none',
        }} />

        <div style={{
          fontFamily: '"DM Mono", monospace', fontSize: '0.6rem',
          color: unitColor, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.4rem',
        }}>
          Chapter {chapter.num}
        </div>

        <h2 style={{
          fontFamily: '"Playfair Display", serif', fontWeight: 900,
          fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', lineHeight: 1.2, marginBottom: '0.5rem',
        }}>
          {chapter.title}
        </h2>

        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', maxWidth: 560, lineHeight: 1.7 }}>
          {chapter.desc}
        </p>

        <TopicChips topics={chapter.topics} />
      </div>

      {/* Two-column body */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: '1.5rem',
        alignItems: 'start',
      }}>
        {/* Simulator */}
        <Card glow={unitColor}>
          {SimComponent
            ? <SimComponent />
            : <PlaceholderSimulator chapter={chapter} />
          }
        </Card>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Key Topics list */}
          <Card>
            <div style={{
              fontFamily: '"Outfit", sans-serif', fontWeight: 600,
              fontSize: '0.88rem', marginBottom: '0.75rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <span>📋</span> Key Topics
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {chapter.topics.map((t, i) => (
                <div key={t} style={{
                  display: 'flex', gap: '0.6rem', alignItems: 'center',
                  padding: '0.5rem 0.65rem', borderRadius: 8,
                  background: 'var(--surface)', fontSize: '0.78rem',
                  border: '1px solid var(--border)',
                }}>
                  <span style={{
                    fontFamily: '"DM Mono", monospace', fontSize: '0.6rem',
                    color: unitColor, width: 22, textAlign: 'center', flexShrink: 0,
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {t}
                </div>
              ))}
            </div>
          </Card>

          {/* Study Tip */}
          <Card style={{ background: `${unitColor}09`, border: `1px solid ${unitColor}25` }}>
            <div style={{
              fontSize: '0.7rem', color: unitColor,
              fontFamily: '"DM Mono", monospace', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: '0.5rem',
            }}>
              💡 Study Tip
            </div>
            <p style={{ fontSize: '0.8rem', lineHeight: 1.75, fontStyle: 'italic', color: 'var(--text)' }}>
              {chapter.studyTip}
            </p>
          </Card>

          {/* Quick stats */}
          <Card>
            <div style={{
              fontFamily: '"DM Mono", monospace', fontSize: '0.6rem', color: 'var(--muted)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem',
            }}>
              Chapter Stats
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {[
                { label: 'Topics', value: chapter.topics.length },
                { label: 'Simulator', value: chapter.simulator !== 'PlaceholderSimulator' ? '✓ Live' : '⏳ Soon' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'var(--surface)', borderRadius: 8, padding: '0.6rem 0.75rem',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.58rem', color: 'var(--muted)', marginBottom: 2, textTransform: 'uppercase' }}>
                    {s.label}
                  </div>
                  <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.2rem', color: unitColor }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
