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

function SymIcon({ type }) {
  if (type.includes('Radial')) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="4.93" y1="19.07" x2="19.07" y2="4.93"/>
      </svg>
    )
  }
  if (type.includes('Bilateral')) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12c0-5 4-9 9-9v18c-5 0-9-4-9-9z"/><path d="M21 12c0-5-4-9-9-9v18c5 0 9-4 9-9z"/><line x1="12" y1="2" x2="12" y2="22" strokeDasharray="3 3"/>
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" strokeDasharray="4 2"/>
    </svg>
  )
}

function CoelomIcon({ type }) {
  if (type === 'Acoelomate') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="var(--bg)" opacity="0.8"/>
      </svg>
    )
  }
  if (type === 'Pseudocoelomate') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.4"/><circle cx="12" cy="12" r="4" fill="var(--bg)" opacity="0.9"/>
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="7" fill="currentColor"/><circle cx="12" cy="12" r="3" fill="var(--bg)" opacity="0.9"/>
    </svg>
  )
}

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
          transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}>
          {/* Front */}
          <div style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
            background: `${p.color}10`, border: `2px solid ${p.color}40`,
            borderRadius: 16, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            zIndex: flipped ? 0 : 1,
            boxShadow: `0 8px 24px ${p.color}20`
          }}>
            <div style={{ fontSize: '3.5rem', filter: `drop-shadow(0 4px 8px ${p.color}40)`, transition: 'all 0.3s', transform: flipped ? 'scale(0.8)' : 'scale(1)' }}>{p.icon}</div>
            <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.6rem', color: p.color, fontWeight: 600 }}>{p.name}</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Badge color={p.color}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <SymIcon type={p.symmetry} /> {p.symmetry}
                </div>
              </Badge>
              <Badge color={p.color}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CoelomIcon type={p.coelom} /> {p.coelom}
                </div>
              </Badge>
            </div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.63rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
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
