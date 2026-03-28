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
  const [hovered, setHovered] = useState(null)
  const [orgIdx, setOrgIdx] = useState(0)
  const org = ORGANISMS[orgIdx]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="🔬" title="Taxonomic Hierarchy" subtitle="Interactive 3D Isometric View" color="var(--cyan)" />

      {/* Organism selector */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {ORGANISMS.map((o, i) => (
          <Btn key={o.name} active={orgIdx === i} onClick={() => { setOrgIdx(i); setSelected(null) }} color="var(--cyan)">
            {o.icon} {o.name}
          </Btn>
        ))}
      </div>

      <div style={{ width: '100%', height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center', perspective: 1200, margin: '2rem 0' }}>
        <div style={{ 
          position: 'relative', width: 340, height: 340, 
          transformStyle: 'preserve-3d', 
          transform: 'rotateX(55deg) rotateZ(-45deg)',
          transition: 'transform 0.5s',
          cursor: 'grab'
        }}>
          {RANKS.map((r, i) => {
            const size = 340 - i * 42
            const isActive = selected === i
            const isHover = hovered === i
            const isMuted = selected !== null && selected !== i
            
            // Stack them on the Z axis
            const baseZ = i * 25
            const hoverZ = isHover || isActive ? baseZ + 35 : baseZ
            
            return (
              <div
                key={r.rank}
                onClick={(e) => { e.stopPropagation(); setSelected(isActive ? null : i) }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  width: size, height: size,
                  borderRadius: '50%',
                  background: isActive ? r.color : `${r.color}25`,
                  border: `2px solid ${isActive ? '#fff' : r.color}`,
                  cursor: 'pointer',
                  transform: `translate(-50%, -50%) translateZ(${hoverZ}px)`,
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  zIndex: i,
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  opacity: isMuted ? 0.2 : 1,
                  boxShadow: isActive || isHover ? `0 10px 40px ${r.color}90, inset 0 0 20px rgba(255,255,255,0.4)` : `0 4px 10px rgba(0,0,0,0.3)`,
                  backdropFilter: 'blur(4px)',
                }}
              >
                <div style={{
                  transform: 'rotateZ(45deg) rotateX(-55deg)',
                  color: isActive ? '#000' : (isHover ? r.color : 'var(--text)'),
                  fontFamily: '"DM Mono", monospace',
                  fontSize: isActive ? '1.1rem' : (isHover ? '0.9rem' : '0.8rem'),
                  fontWeight: isActive || isHover ? 700 : 500,
                  textAlign: 'center',
                  pointerEvents: 'none',
                  textShadow: isActive ? 'none' : '0 2px 4px rgba(0,0,0,0.8)',
                  transition: 'all 0.3s',
                  background: isActive ? 'rgba(255,255,255,0.8)' : (isHover ? 'rgba(0,0,0,0.6)' : 'transparent'),
                  padding: isActive || isHover ? '6px 16px' : '2px 6px',
                  borderRadius: 12,
                  border: isActive ? `1px solid ${r.color}` : 'none'
                }}>
                  {r.rank}
                  {(isActive || isHover) && (
                    <div style={{ fontFamily: '"Outfit", sans-serif', fontSize: isActive ? '1.4rem' : '1.1rem', marginTop: 4, color: isActive ? '#000' : '#fff' }}>
                      {org.ranks[i]}
                    </div>
                  )}
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
