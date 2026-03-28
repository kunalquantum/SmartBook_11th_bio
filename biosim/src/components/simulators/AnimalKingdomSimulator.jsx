import { useState } from 'react'
import { SimHeader, Btn, Badge } from '../ui'

const PHYLA = [
  { name: 'Porifera',       eg: 'Sycon, Spongilla', color: '#94a3b8', icon: '🧽', symmetry: 'Asymmetrical', coelom: 'Acoelomate', features: 'Pore-bearing, canal system, choanocytes, spicules. Cellular level of organisation.' },
  { name: 'Cnidaria',       eg: 'Hydra, Obelia, Aurelia', color: '#22d3ee', icon: '🪼', symmetry: 'Radial', coelom: 'Acoelomate', features: 'Cnidocytes (stinging cells). Polymorphism — polyp & medusa forms. Diploblastic.' },
  { name: 'Platyhelminthes',eg: 'Planaria, Taenia, Fasciola', color: '#a78bfa', icon: '🪱', symmetry: 'Bilateral', coelom: 'Acoelomate', features: 'Flat body, triploblastic. Mostly parasitic. Flame cells for excretion. No true body cavity.' },
  { name: 'Aschelminthes',  eg: 'Ascaris, Wuchereria', color: '#fb7185', icon: '🪱', symmetry: 'Bilateral', coelom: 'Pseudocoelomate', features: 'Round/thread-like body. Complete alimentary canal. Dioecious. Pseudocoelom present.' },
  { name: 'Annelida',       eg: 'Earthworm, Leech, Nereis', color: '#fb923c', icon: '🐛', symmetry: 'Bilateral', coelom: 'Eucoelomate', features: 'Segmented body (metamerism). Chaetae for locomotion. Closed circulatory system. Nephridia for excretion.' },
  { name: 'Arthropoda',     eg: 'Cockroach, Prawn, Spider', color: '#fbbf24', icon: '🦟', symmetry: 'Bilateral', coelom: 'Haemocoel', features: 'Largest phylum. Jointed appendages, chitinous exoskeleton. Open circulatory system. Compound eyes.' },
  { name: 'Mollusca',       eg: 'Snail, Octopus, Pila', color: '#f472b6', icon: '🐌', symmetry: 'Bilateral', coelom: 'Eucoelomate', features: 'Soft body, mantle, radula for feeding. Shell present (usually). Haemocyanin (blue blood).' },
  { name: 'Echinodermata',  eg: 'Starfish, Sea urchin, Holothuria', color: '#f87171', icon: '⭐', symmetry: 'Radial (adult) / Bilateral (larva)', coelom: 'Eucoelomate', features: 'Water vascular system. Spiny endoskeleton. Pentamerous symmetry. Remarkable regeneration.' },
]

export function AnimalKingdomSimulator() {
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const go = (dir) => {
    setIdx(i => (i + dir + PHYLA.length) % PHYLA.length)
    setFlipped(false)
  }

  const p = PHYLA[idx]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="🐾" title="Animal Phyla — Flashcards" subtitle="Tap card to flip and reveal key features" color="var(--rose)" />

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Btn onClick={() => go(-1)} color="var(--muted)">← Prev</Btn>
        <div style={{ flex: 1, fontFamily: '"DM Mono", monospace', fontSize: '0.7rem', color: 'var(--muted)', textAlign: 'center' }}>
          {idx + 1} / {PHYLA.length}
        </div>
        <Btn onClick={() => go(1)} color="var(--muted)">Next →</Btn>
      </div>

      {/* Flip card */}
      <div onClick={() => setFlipped(f => !f)} style={{ cursor: 'pointer', perspective: 1000, height: 210 }}>
        <div style={{
          position: 'relative', width: '100%', height: '100%',
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
        }}>
          {/* Front */}
          <div style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
            background: `${p.color}10`, border: `2px solid ${p.color}40`,
            borderRadius: 16, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
          }}>
            <div style={{ fontSize: '3rem' }}>{p.icon}</div>
            <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', color: p.color }}>{p.name}</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Badge color={p.color}>{p.symmetry}</Badge>
              <Badge color={p.color}>{p.coelom}</Badge>
            </div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.63rem', color: 'var(--muted)' }}>
              Tap to reveal features →
            </div>
          </div>

          {/* Back */}
          <div style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: `${p.color}15`, border: `2px solid ${p.color}50`,
            borderRadius: 16, padding: '1.5rem',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.75rem',
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Badge color={p.color}>eg: {p.eg}</Badge>
            </div>
            <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.1rem', color: p.color }}>{p.name}</div>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.75, color: 'var(--text)' }}>{p.features}</p>
          </div>
        </div>
      </div>

      {/* Quick index dots */}
      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
        {PHYLA.map((ph, i) => (
          <button key={ph.name} onClick={() => { setIdx(i); setFlipped(false) }} style={{
            width: i === idx ? 20 : 8, height: 8, borderRadius: 4,
            background: i === idx ? p.color : 'var(--dim)',
            border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0,
          }} />
        ))}
      </div>
    </div>
  )
}
