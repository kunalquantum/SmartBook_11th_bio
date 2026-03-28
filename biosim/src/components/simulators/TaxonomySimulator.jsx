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

      {/* Pyramid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {RANKS.map((r, i) => {
          const isActive = selected === i
          const width = 100 - i * 10
          return (
            <div
              key={r.rank}
              onClick={() => setSelected(isActive ? null : i)}
              style={{
                width: `${width}%`,
                padding: '7px 14px',
                borderRadius: 8,
                background: isActive ? `${r.color}20` : 'var(--surface)',
                border: `1px solid ${isActive ? r.color : 'var(--border)'}`,
                cursor: 'pointer',
                transition: 'all 0.25s',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.62rem', color: r.color, width: 58 }}>
                  {r.rank}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{org.ranks[i]}</span>
              </div>
              <span style={{ fontSize: '0.62rem', color: 'var(--muted)' }}>Rank {i + 1}</span>
            </div>
          )
        })}
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
