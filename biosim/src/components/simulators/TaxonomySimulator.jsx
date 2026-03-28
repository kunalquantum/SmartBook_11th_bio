import { useState } from 'react'
import { SimHeader, Callout, Btn } from '../ui'

const RANKS = [
  { rank: 'Kingdom', color: '#00e5ff' },
  { rank: 'Phylum',  color: '#00d4ef' },
  { rank: 'Class',   color: '#00c2de' },
  { rank: 'Order',   color: '#00aecd' },
  { rank: 'Family',  color: '#009abc' },
  { rank: 'Genus',   color: '#0086ab' },
  { rank: 'Species', color: '#00729a' },
]

const ORGANISMS = [
  { name: 'Human',     icon: '🧑', ranks: ['Animalia','Chordata','Mammalia','Primates','Hominidae','Homo','H. sapiens'] },
  { name: 'House Cat', icon: '🐱', ranks: ['Animalia','Chordata','Mammalia','Carnivora','Felidae','Felis','F. catus'] },
  { name: 'Mango',     icon: '🥭', ranks: ['Plantae','Magnoliophyta','Magnoliopsida','Sapindales','Anacardiaceae','Mangifera','M. indica'] },
  { name: 'Mushroom',  icon: '🍄', ranks: ['Fungi','Basidiomycota','Agaricomycetes','Agaricales','Amanitaceae','Amanita','A. muscaria'] },
]

const RANK_DESC = [
  'Kingdom is the broadest taxonomic rank, grouping organisms by the most fundamental characteristics.',
  'Phylum groups organisms sharing a basic body plan or fundamental structural similarity.',
  'Class is a subdivision of phylum, grouping related orders together.',
  'Order groups related families. Named after a characteristic genus or feature.',
  'Family groups related genera. Names typically end in -idae (animals) or -aceae (plants).',
  'Genus groups closely related species. Always capitalised in binomial nomenclature.',
  'Species is the most specific rank — organisms that interbreed to produce fertile offspring.',
]

export function TaxonomySimulator() {
  const [selected, setSelected] = useState(null)
  const [orgIdx, setOrgIdx] = useState(0)
  const org = ORGANISMS[orgIdx]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="🔬" title="Taxonomic Hierarchy" subtitle="Click any rank to learn more" color="var(--cyan)" />

      {/* Organism selector */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {ORGANISMS.map((o, i) => (
          <Btn key={o.name} active={orgIdx === i} onClick={() => { setOrgIdx(i); setSelected(null) }} color="var(--cyan)">
            {o.icon} {o.name}
          </Btn>
        ))}
      </div>

      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '1rem 0', perspective: 1000 }}>
        <div style={{ position: 'relative', width: 340, height: 340 }} onClick={() => setSelected(null)}>
          {RANKS.map((r, i) => {
            const size = 340 - i * 42
            const isActive = selected === i
            const isMuted = selected !== null && selected !== i
            return (
              <div
                key={r.rank}
                onClick={(e) => { e.stopPropagation(); setSelected(isActive ? null : i) }}
                className={isActive ? 'animate-pulse-slow' : ''}
                style={{
                  position: 'absolute',
                  bottom: 0, left: '50%',
                  transform: `translateX(-50%) ${isActive ? 'translateY(-10px) scale(1.02)' : ''}`,
                  width: size, height: size,
                  borderRadius: '50%',
                  background: isActive ? r.color : `${r.color}15`,
                  border: `2px solid ${isActive ? 'var(--bg)' : r.color}`,
                  cursor: 'pointer',
                  transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  zIndex: isActive ? 10 : i,
                  display: 'flex', justifyContent: 'center',
                  paddingTop: isActive ? '18px' : '10px',
                  opacity: isMuted ? 0.4 : 1,
                  boxShadow: isActive ? `0 15px 35px ${r.color}60, inset 0 0 20px rgba(255,255,255,0.2)` : 'none',
                }}
              >
                <div style={{
                  color: isActive ? '#000' : 'var(--text)',
                  fontFamily: '"DM Mono", monospace',
                  fontSize: isActive ? '0.75rem' : '0.65rem',
                  fontWeight: isActive ? 700 : 500,
                  textAlign: 'center',
                  pointerEvents: 'none',
                  transition: 'all 0.3s'
                }}>
                  {r.rank}
                  <div style={{ 
                    fontFamily: '"Outfit", sans-serif', 
                    fontSize: isActive ? '0.9rem' : (i === 6 ? '0.8rem' : '0.75rem'), 
                    marginTop: isActive ? 2 : -2 
                  }}>
                    {org.ranks[i]}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selected !== null && (
        <Callout color={RANKS[selected].color}>
          <strong style={{ color: RANKS[selected].color }}>{RANKS[selected].rank}</strong>{' '}
          — {RANK_DESC[selected]}
        </Callout>
      )}
    </div>
  )
}
