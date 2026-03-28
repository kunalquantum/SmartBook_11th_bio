import { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Environment, CameraControls, ContactShadows, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { SimHeader, Callout, Btn } from '../ui'

// High-fidelity Dicot Stem architectural layers
const TISSUES = [
  { id: 'ep', label: 'Epidermis & Cuticle', color: '#65a30d', radius: 4.8, count: 65, type: 'shield', 
    desc: 'Outer protective layer. Its waxy cuticle prevents deadly water loss.' },
  { id: 'col', label: 'Collenchyma (Hypodermis)', color: '#84cc16', radius: 4.2, count: 50, type: 'block', 
    desc: 'Provides flexible mechanical support to the young stem.' },
  { id: 'cor', label: 'Cortex (Parenchyma)', color: '#d9f99d', radius: 3.2, count: 45, type: 'sphere', 
    desc: 'Thick zone of large, thin-walled parenchyma cells designed for massive starch and water storage.' },
  { id: 'end', label: 'Endodermis', color: '#f59e0b', radius: 2.3, count: 40, type: 'barrel', 
    desc: 'The innermost cortical layer. Barrel-shaped cells packing Casparian strips regulate water entry.' },
  { id: 'per', label: 'Pericycle', color: '#fbbf24', radius: 2.0, count: 35, type: 'block', 
    desc: 'Outer boundary of the stele. Provides reinforcement.' },
  { id: 'phl', label: 'Phloem', color: '#38bdf8', radius: 1.6, count: 28, type: 'tube', 
    desc: 'Living sieve-tubes and companion cells. Notice the downward flow: it actively transports sugary sap from leaves to roots.' },
  { id: 'cam', label: 'Vascular Cambium', color: '#e2e8f0', radius: 1.3, count: 28, type: 'sheet', 
    desc: 'A hyper-active meristematic ring. It constantly divides to generate explosive secondary growth (wood).' },
  { id: 'xyl', label: 'Xylem', color: '#e11d48', radius: 0.8, count: 18, type: 'hollow', 
    desc: 'Massive, dead, lignified pipe structures. They violently vacuum water and minerals upwards due to transpiration pull.' },
  { id: 'pi', label: 'Pith', color: '#fef08a', radius: 0.2, count: 7, type: 'sphere', 
    desc: 'Spongy central core. Highly vascularised in dictos to anchor the entire stem infrastructure.' },
]

function TissueRing({ data, selected, isExploded, onSelect }) {
  const isSelected = selected === data.id
  const isMuted = selected && !isSelected
  const baseOpacity = isMuted ? 0.2 : 1
  
  const cellsRef = useRef([])

  useFrame((state, delta) => {
    const ringIndex = TISSUES.findIndex(t => t.id === data.id)
    
    // Physics-based Exploded View Mechanics
    // Outer layers get pushed further away mechanically
    const explodeOffset = isExploded ? (9 - ringIndex) * 0.85 : 0
    const targetRadius = data.radius + explodeOffset
    
    cellsRef.current.forEach((mesh, index) => {
      if (!mesh) return
      
      // Calculate wedge position (75% circle = 1.5 * PI)
      const angle = (index / data.count) * (Math.PI * 1.5)
      
      // Animate exact positions radially outward
      const tx = Math.cos(angle) * targetRadius
      const tz = Math.sin(-angle) * targetRadius // clockwise
      
      mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, tx, 5 * delta)
      mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, tz, 5 * delta)
      
      // Throbbing biological pulse if actively selected
      const pulse = isSelected ? 1 + Math.sin(state.clock.elapsedTime * 6 + index) * 0.1 : 1
      mesh.scale.setScalar(THREE.MathUtils.lerp(mesh.scale.x, pulse, 5 * delta))
    })
  })

  // Geometric Cellular Differentiation
  let CellNode = null
  if (data.type === 'shield') CellNode = <boxGeometry args={[0.3, 1.3, 0.5]} />
  if (data.type === 'block') CellNode = <boxGeometry args={[0.4, 1.2, 0.4]} />
  if (data.type === 'sphere') CellNode = <dodecahedronGeometry args={[0.3, 1]} />
  if (data.type === 'barrel') CellNode = <cylinderGeometry args={[0.2, 0.2, 1.2, 8]} />
  if (data.type === 'sheet') CellNode = <boxGeometry args={[0.1, 1.2, 0.3]} />
  if (data.type === 'tube') CellNode = <cylinderGeometry args={[0.15, 0.15, 1.3, 16]} />
  if (data.type === 'hollow') {
    CellNode = (
      <group>
        {/* Massive rigid lignin walls */}
        <cylinderGeometry args={[0.25, 0.25, 1.4, 16, 1, true]} />
      </group>
    )
  }

  return (
    <group 
      onClick={(e) => { e.stopPropagation(); onSelect(isSelected ? null : data.id) }}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'default' }}
    >
      {[...Array(data.count)].map((_, i) => {
        const angle = (i / data.count) * (Math.PI * 1.5)
        // Midpoint calculation for attaching the HTML label to the center-most cell of the wedge arc
        const isMidpoint = i === Math.floor(data.count / 2)
        
        return (
          <group key={i} ref={el => cellsRef.current[i] = el} rotation={[0, -angle, 0]}>
            <mesh>
              {CellNode}
              <meshPhysicalMaterial 
                color={data.color} 
                roughness={0.4} 
                clearcoat={data.type === 'sphere' ? 0.8 : 0.1}
                transparent opacity={baseOpacity * 0.95} 
                side={data.type === 'hollow' ? THREE.DoubleSide : THREE.FrontSide}
              />
            </mesh>

            {/* Xylem Transpiration Flow */}
            {data.type === 'hollow' && isSelected && (
               <Sparkles count={5} scale={[0.1, 1.4, 0.1]} size={2} speed={5} color="#bae6fd" />
            )}

            {/* Phloem Sucrose Sap Flow */}
            {data.type === 'tube' && isSelected && (
               <Sparkles count={4} scale={[0.1, 1.3, 0.1]} size={3} speed={-3.5} color="#fcd34d" />
            )}

            {/* High-Tech Geometric Label attached to mid-wedge */}
            {isMidpoint && (!selected || isSelected) && (
              <Html distanceFactor={22} center zIndexRange={[100,0]} position={[0, 1.2, 0]}>
                <div style={{
                  background: isSelected ? data.color : 'rgba(5, 10, 15, 0.85)',
                  color: isSelected ? '#fff' : '#cbd5e1',
                  padding: '4px 12px', borderRadius: 8, fontSize: '0.8rem',
                  fontFamily: '"Outfit", sans-serif', fontWeight: 600, pointerEvents: 'none',
                  border: `1px solid ${data.color}80`, whiteSpace: 'nowrap',
                  opacity: isMuted ? 0 : 1, transition: 'all 0.3s'
                }}>
                  {data.label}
                </div>
              </Html>
            )}
          </group>
        )
      })}
    </group>
  )
}

export function PlantTissueSimulator() {
  const [selected, setSelected] = useState(null)
  const [exploded, setExploded] = useState(false)
  const controlsRef = useRef()

  // Cinematic Interpolation
  useEffect(() => {
    if (controlsRef.current) {
      if (selected) {
        // Fly directly to the specific cellular layer selected
        const tIdx = TISSUES.findIndex(t => t.id === selected)
        const explodeOffset = exploded ? (9 - tIdx) * 0.85 : 0
        const activeRadius = TISSUES[tIdx].radius + explodeOffset
        
        // Approach from the precise angle of the wedge
        controlsRef.current.setLookAt(
          activeRadius + 3.0, 3.5, activeRadius + 3.0, // Swoop overhead and outside
          activeRadius, 0, 0, // Target exact physical layer wall
          true
        )
      } else if (exploded) {
        // Broad exploded overview
        controlsRef.current.setLookAt(7, 8, 11, 0, 0, 0, true)
      } else {
        // Default angled isometric stem perspective
        controlsRef.current.setLookAt(5, 6, 8, 0, 0, 0, true)
      }
    }
  }, [selected, exploded])

  const sel = TISSUES.find(t => t.id === selected)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="🌱" title="Plant Tissues (Dicot Stem)" subtitle="Procedural 3D Vascular Anatomy" color="#a3e635" />

      {/* Dissection Toggles */}
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        <Btn active={!exploded} onClick={() => setExploded(false)} color="#64748b">🪵 Intact Stem Wedge</Btn>
        <Btn active={exploded} onClick={() => setExploded(true)} color="#f43f5e">💥 Mechanical Exploded View</Btn>
      </div>

      <div style={{
        position: 'relative', width: '100%', height: 500,
        background: 'radial-gradient(ellipse at center, #022c22 0%, #020617 100%)',
        borderRadius: 16, border: '1px solid #1e293b', overflow: 'hidden',
        boxShadow: 'inset 0 0 100px rgba(163, 230, 53, 0.05)'
      }}>
        <Canvas camera={{ position: [5, 6, 8], fov: 45 }}>
          <ambientLight intensity={0.3} />
          <spotLight position={[15, 20, 15]} angle={0.4} penumbra={1} intensity={1.5} color="#d9f99d" />
          <pointLight position={[-15, -15, -15]} intensity={0.5} color="#38bdf8" />
          
          <Suspense fallback={<Html center><div style={{color:'#a3e635', fontFamily:'"DM Mono"', letterSpacing: 2}}>CLONING PLANT CELLS...</div></Html>}>
            <Environment preset="forest" resolution={256} />
            
            {/* The massive procedural cross-section */}
            <group position={[0, -0.5, 0]} onClick={() => setSelected(null)}>
              {TISSUES.map(t => (
                <TissueRing key={t.id} data={t} selected={selected} isExploded={exploded} onSelect={setSelected} />
              ))}
            </group>

            {/* Heavy shadow gradient mimicking microscope stage */}
            <ContactShadows position={[0, -1.8, 0]} opacity={0.7} scale={25} blur={3} far={8} color="#064e3b" />
            <CameraControls ref={controlsRef} minDistance={3} maxDistance={25} />
          </Suspense>
        </Canvas>

        {/* Technical overlay layout */}
        <div style={{ position: 'absolute', bottom: 12, left: 16, pointerEvents: 'none' }}>
           <div style={{ color: '#a3e635', fontFamily: '"DM Mono", monospace', fontSize: '0.65rem', letterSpacing: '2px' }}>
              RESOLUTION: HIGH
              <br/>
              SPECIMEN: DICOTYLEDON STEM
           </div>
        </div>
      </div>

      {/* Anatomical Details Panel */}
      {sel ? (
        <Callout color={sel.color}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ color: sel.color, fontSize: '1.2rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{sel.label}</strong>
            <Btn onClick={() => setSelected(null)} color="#64748b" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>✖ Close Inspection</Btn>
          </div>
          <p style={{ marginTop: 8, lineHeight: 1.7, fontSize: '0.9rem' }}>{sel.desc}</p>
        </Callout>
      ) : (
        <div className="animate-fadeUp" style={{ background: '#0f172a', borderRadius: 12, padding: '1.2rem', border: '1px solid #1e293b', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
            Tap <strong style={{color: '#f43f5e'}}>Mechanical Exploded View</strong> to dissect the biological strata radially outwards. Click any anatomical ring to instruct the optical array to physically track to its cellular coordinates.
          </p>
        </div>
      )}
    </div>
  )
}
