import { useState } from 'react'
import { SimHeader, Callout } from '../ui'

const GI_ORGANS = [
  {
    name: 'Mouth', icon: '👄', color: '#f472b6',
    enzymes: ['Salivary Amylase (ptyalin)'],
    substrate: 'Starch', product: 'Maltose',
    ph: '6.8–7.0',
    action: 'Mastication breaks food mechanically. Tongue mixes with saliva. Salivary amylase begins starch hydrolysis. Bolus formed and swallowed.',
  },
  {
    name: 'Oesophagus', icon: '〰️', color: '#94a3b8',
    enzymes: ['None'],
    substrate: '—', product: '—',
    ph: 'Neutral',
    action: 'Peristaltic waves (rhythmic muscle contractions) propel the food bolus from pharynx to stomach. No digestion occurs here.',
  },
  {
    name: 'Stomach', icon: '🫁', color: '#ff4d6d',
    enzymes: ['Pepsin', 'Gastric Lipase', 'Rennin (in infants)'],
    substrate: 'Proteins, Fats', product: 'Peptides, Partial fat digestion',
    ph: '1.5–2.0',
    action: 'HCl (pH 1.5–2) secreted by parietal cells kills bacteria and activates pepsinogen → Pepsin. Churning creates chyme. Gastric lipase begins fat digestion.',
  },
  {
    name: 'Small Intestine', icon: '🌀', color: '#00e5ff',
    enzymes: ['Pancreatic Amylase', 'Trypsin', 'Chymotrypsin', 'Lipase', 'Maltase', 'Sucrase', 'Lactase'],
    substrate: 'All macronutrients', product: 'Glucose, Amino acids, Fatty acids + Glycerol',
    ph: '7.5–8.5',
    action: 'Major site of digestion and absorption. Bile from liver emulsifies fats. Pancreatic enzymes digest all macronutrients. Microvilli (brush border) maximise absorption surface. Lacteals absorb fat-soluble vitamins.',
  },
  {
    name: 'Large Intestine', icon: '🔄', color: '#ffb300',
    enzymes: ['Bacterial enzymes'],
    substrate: 'Undigested fibre', product: 'Short-chain fatty acids, Vitamin K',
    ph: '5.5–7.0',
    action: 'Water, minerals and vitamins absorbed. Gut microbiota (E. coli) synthesise Vitamin K and B12. Undigested residue compacted into faeces and stored in rectum.',
  },
  {
    name: 'Liver', icon: '🫀', color: '#fb923c',
    enzymes: ['Produces Bile (not enzyme)'],
    substrate: 'Fats (via bile)', product: 'Fine fat droplets (emulsification)',
    ph: '7.4',
    action: 'Produces bile containing bile salts (sodium glycocholate, sodium taurocholate) stored in gall bladder. Bile emulsifies fats (increases surface area for lipase). Liver processes absorbed nutrients, detoxifies, stores glycogen.',
  },
  {
    name: 'Pancreas', icon: '🦠', color: '#a78bfa',
    enzymes: ['Trypsinogen → Trypsin', 'Chymotrypsinogen', 'Pancreatic Amylase', 'Pancreatic Lipase', 'Pancreatic Nucleases'],
    substrate: 'Proteins, Starch, Fats, Nucleic acids', product: 'Peptides, Glucose, Fatty acids, Nucleotides',
    ph: '8.0 (alkaline)',
    action: 'Exocrine function: secretes pancreatic juice into duodenum via pancreatic duct. Sodium bicarbonate neutralises acidic chyme. Endocrine function: Islets of Langerhans secrete insulin and glucagon.',
  },
]

export function DigestionSimulator() {
  const [selected, setSelected] = useState(0)
  const sel = GI_ORGANS[selected]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="🫁" title="Human Digestion" subtitle="Follow food through the GI tract" color="var(--rose)" />

      {/* Organ selector grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
        {GI_ORGANS.map((o, i) => (
          <button key={o.name} onClick={() => setSelected(i)} style={{
            padding: '8px 6px', borderRadius: 10, cursor: 'pointer',
            border: `2px solid ${selected === i ? o.color : 'var(--border)'}`,
            background: selected === i ? `${o.color}18` : 'var(--surface)',
            color: selected === i ? o.color : 'var(--muted)',
            fontSize: '0.7rem', fontFamily: '"Outfit", sans-serif',
            transition: 'all 0.2s',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          }}>
            <span style={{ fontSize: '1.25rem' }}>{o.icon}</span>
            <span>{o.name}</span>
          </button>
        ))}
      </div>

      {/* Detail panel */}
      <div key={sel.name} className="animate-fadeUp" style={{
        background: `${sel.color}08`, border: `1px solid ${sel.color}28`,
        borderRadius: 14, padding: '1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '2rem' }}>{sel.icon}</div>
          <div>
            <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.2rem', color: sel.color }}>{sel.name}</div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.6rem', color: 'var(--muted)' }}>pH: {sel.ph}</div>
          </div>
        </div>

        {/* Substrate / Product */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ background: 'var(--surface)', borderRadius: 8, padding: '0.6rem 0.75rem', border: '1px solid var(--border)' }}>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.58rem', color: 'var(--muted)', marginBottom: 2, textTransform: 'uppercase' }}>Substrate</div>
            <div style={{ fontSize: '0.78rem' }}>{sel.substrate}</div>
          </div>
          <span style={{ color: sel.color, fontSize: '1.2rem', textAlign: 'center' }}>→</span>
          <div style={{ background: 'var(--surface)', borderRadius: 8, padding: '0.6rem 0.75rem', border: '1px solid var(--border)' }}>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.58rem', color: 'var(--muted)', marginBottom: 2, textTransform: 'uppercase' }}>Product</div>
            <div style={{ fontSize: '0.78rem' }}>{sel.product}</div>
          </div>
        </div>

        {/* Enzymes */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Enzymes / Secretions</div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {sel.enzymes.map(e => (
              <span key={e} style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.62rem', padding: '3px 9px', borderRadius: 99, border: `1px solid ${sel.color}35`, color: sel.color, background: `${sel.color}0a` }}>{e}</span>
            ))}
          </div>
        </div>

        <Callout color={sel.color}>{sel.action}</Callout>
      </div>
    </div>
  )
}
