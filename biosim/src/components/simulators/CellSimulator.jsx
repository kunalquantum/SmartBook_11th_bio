import { useState, useMemo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html, Float, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { SimHeader, Callout } from '../ui'

// Advanced 3D Data mapping
const ORGANELLES_3D = [
  { id: 'nucleus', label: 'Nucleus', pos: [0, 0, 0], color: '#00e5ff', scale: 1.4, type: 'sphere', 
    desc: 'Control centre of the cell. Contains DNA as chromatin. Bounded by a double nuclear envelope with nuclear pores.' },
  { id: 'mito', label: 'Mitochondria', pos: [2.2, 0.8, 1], color: '#00e099', scale: 0.6, type: 'capsule', 
    desc: 'Powerhouse of the cell. Site of aerobic respiration. Double membrane with inner folded cristae.' },
  { id: 'mito2', label: 'Mitochondria', pos: [-1.8, -1.2, -1.2], color: '#00e099', scale: 0.5, type: 'capsule', desc: '' },
  { id: 'rer', label: 'Rough ER', pos: [-1.5, 0.8, 1.2], color: '#8b5cf6', scale: 0.9, type: 'torus', 
    desc: 'Rough Endoplasmic Reticulum — studded with ribosomes. Site of protein synthesis and initial folding.' },
  { id: 'ser', label: 'Smooth ER', pos: [1.2, -1.8, -0.6], color: '#7c3aed', scale: 0.7, type: 'torus', 
    desc: 'Smooth ER — no ribosomes. Synthesises lipids and steroids. Detoxifies drugs.' },
  { id: 'golgi', label: 'Golgi Complex', pos: [0, 1.8, -1.5], color: '#ffb300', scale: 0.8, type: 'torus', 
    desc: 'Cis–trans stack of cisternae. Modifies, packages and dispatches proteins and lipids.' },
  { id: 'lyso', label: 'Lysosome', pos: [-1.0, 2.0, 0.6], color: '#ff4d6d', scale: 0.35, type: 'sphere', 
    desc: '"Suicidal bags" — contain hydrolytic enzymes. Digest worn-out organelles (autophagy).' },
  { id: 'vacuole', label: 'Vacuole', pos: [1.5, -0.4, 1.8], color: '#38bdf8', scale: 0.75, type: 'sphere', 
    desc: 'Fluid-filled sac maintaining turgor pressure. Stores salts, nutrients, and waste.' }
]

function OrganelleNode({ data, selected, onSelect }) {
  const isPrimary = !data.id.endsWith('2')
  const actualId = data.id.replace('2', '')
  const isSelected = selected === actualId
  const isMuted = selected !== null && !isSelected

  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: data.color,
      roughness: 0.2,
      metalness: 0.1,
      emissive: data.color,
      emissiveIntensity: isSelected ? 0.8 : 0.2,
      clearcoat: 1,
      transparent: true,
      opacity: isMuted ? 0.3 : 1
    })
  }, [data.color, isSelected, isMuted])

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
      <mesh 
        position={data.pos} 
        scale={data.scale * (isSelected ? 1.2 : 1)} 
        onClick={(e) => { e.stopPropagation(); onSelect(isSelected ? null : actualId) }} 
        material={material}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'default'}
      >
        {data.type === 'sphere' && <sphereGeometry args={[1, 32, 32]} />}
        {data.type === 'capsule' && <capsuleGeometry args={[0.5, 1, 8, 32]} />}
        {data.type === 'torus' && <torusGeometry args={[0.8, 0.35, 16, 48]} />}
        
        {isPrimary && (
          <Html distanceFactor={12} center zIndexRange={[100, 0]}>
            <div style={{
              background: isSelected ? data.color : 'rgba(15, 20, 25, 0.7)',
              color: isSelected ? '#000' : '#fff',
              padding: '6px 12px', borderRadius: 12, fontSize: '0.9rem',
              fontFamily: '"Outfit", sans-serif', fontWeight: 600,
              pointerEvents: 'none', transition: 'all 0.3s',
              border: `1px solid ${data.color}80`, whiteSpace: 'nowrap',
              boxShadow: isSelected ? `0 0 20px ${data.color}80` : 'none',
              opacity: isMuted ? 0.1 : 1, transform: isSelected ? 'scale(1.2)' : 'scale(1)'
            }}>
              {data.label}
            </div>
          </Html>
        )}
      </mesh>
    </Float>
  )
}

function CellMembrane() {
  return (
    <mesh>
      <sphereGeometry args={[4.2, 64, 64]} />
      <meshPhysicalMaterial 
        color="#00e5ff"
        transparent opacity={0.12} roughness={0.1}
        transmission={0.9} thickness={1} iridescence={0.5}
        side={THREE.DoubleSide} depthWrite={false}
      />
    </mesh>
  )
}

export function CellSimulator() {
  const [selected, setSelected] = useState(null)
  const sel = ORGANELLES_3D.find(o => o.id === selected)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="🔬" title="3D Animal Cell" subtitle="Interactive WebGL Organelle Explorer" color="var(--cyan)" />

      {/* 3D Canvas */}
      <div style={{
        position: 'relative', width: '100%', height: 450,
        background: 'radial-gradient(circle at center, #05181a 0%, #000000 100%)',
        borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden',
        boxShadow: 'inset 0 0 60px rgba(0,229,255,0.05)'
      }}>
        <Canvas camera={{ position: [0, 0, 9], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00e5ff" />
          
          <Suspense fallback={<Html center><div style={{color:'var(--cyan)', fontFamily:'"DM Mono"'}}>Loading 3D Cell...</div></Html>}>
            <group onClick={() => setSelected(null)}>
              <CellMembrane />
              {ORGANELLES_3D.map(o => (
                <OrganelleNode key={o.id} data={o} selected={selected} onSelect={setSelected} />
              ))}
            </group>
            <OrbitControls makeDefault enablePan={false} minDistance={5} maxDistance={15} autoRotate autoRotateSpeed={0.6} />
            <ContactShadows position={[0, -4.5, 0]} opacity={0.4} scale={15} blur={2} far={5} />
          </Suspense>
        </Canvas>
        
        {/* Helper overlay */}
        <div style={{ position: 'absolute', bottom: 12, right: 12, fontFamily: '"DM Mono", monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }}>
          Left Click: Select / Drag: Rotate / Scroll: Zoom
        </div>
      </div>

      {/* Detail callout */}
      {sel ? (
        <Callout color={sel.color}>
          <strong style={{ color: sel.color, fontSize: '1.1rem' }}>{sel.label}</strong>
          <p style={{ marginTop: 6, lineHeight: 1.6 }}>{sel.desc}</p>
        </Callout>
      ) : (
        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--muted)', fontStyle: 'italic', padding: '0.5rem' }}>
          Tap any 3D organelle floating in the cytoplasm to learn more
        </div>
      )}

      {/* Quick-select chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
        {ORGANELLES_3D.filter(o => !o.id.endsWith('2')).map(o => (
          <button key={o.id} onClick={() => setSelected(selected === o.id ? null : o.id)} style={{
            fontFamily: '"Outfit", sans-serif', fontSize: '0.8rem', fontWeight: 600,
            padding: '6px 14px', borderRadius: 99, cursor: 'pointer',
            border: `1px solid ${selected === o.id ? o.color : 'var(--border)'}`,
            background: selected === o.id ? `${o.color}25` : 'var(--surface)',
            color: selected === o.id ? o.color : 'var(--muted)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: selected === o.id ? 'translateY(-2px)' : 'none',
            boxShadow: selected === o.id ? `0 4px 12px ${o.color}40` : 'none'
          }}>{o.label}</button>
        ))}
      </div>
    </div>
  )
}
