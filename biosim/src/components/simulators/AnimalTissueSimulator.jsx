import { useState, useRef, useEffect, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Environment, CameraControls, ContactShadows, Sparkles, Float } from '@react-three/drei'
import * as THREE from 'three'
import { SimHeader, Callout, Btn } from '../ui'

// --- TISSUE DATA ---
const TISSUES = [
  { id: 'musc', label: 'Skeletal Muscular Tissue', color: '#f43f5e', desc: 'Striated, voluntary muscle. Features complex microscopic bundles called sarcomeres capable of forceful contraction via sliding filaments.' },
  { id: 'nerv', label: 'Nervous Tissue (Neuron)', color: '#3b82f6', desc: 'Highly specialised for electrical conduction. Massive axon pathways insulated by myelin sheaths rapidly transmit biological data.' },
  { id: 'conn', label: 'Specialised Connective (Bone)', color: '#d97706', desc: 'The Osteon structure (Haversian system). Calcified concentric lamellae rings provide immense load-bearing structural integrity.' },
  { id: 'epit', label: 'Cuboidal Epithelium', color: '#0ea5e9', desc: 'Tightly packed, gapless geometric cells sitting atop a basement membrane. Functions as a protective lining or glandular secretion layer.' },
]

// --- 3D TISSUE MODULES ---

function EpithelialTissue() {
  // A perfect 5x5 grid of tightly packed cuboidal cells on a basement membrane
  const cells = useMemo(() => {
    const arr = []
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
         arr.push({ x: x * 1.05, z: z * 1.05 }) // Tightly packed with tiny gap
      }
    }
    return arr
  }, [])

  return (
    <group position={[0, -0.5, 0]}>
      {/* Basement Membrane */}
      <mesh position={[0, -0.6, 0]}>
         <boxGeometry args={[5.5, 0.2, 5.5]} />
         <meshPhysicalMaterial color="#94a3b8" roughness={0.8} />
      </mesh>
      
      {/* Cuboidal Cells */}
      {cells.map((c, i) => (
        <group key={i} position={[c.x, 0, c.z]}>
          <mesh>
             <boxGeometry args={[1, 1, 1]} />
             <meshPhysicalMaterial color="#38bdf8" roughness={0.2} transmission={0.5} thickness={0.5} clearcoat={1} />
          </mesh>
          {/* Distinct Nucleus exactly in the center */}
          <mesh position={[0, 0, 0]}>
             <sphereGeometry args={[0.25, 16, 16]} />
             <meshPhysicalMaterial color="#1e3a8a" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function ConnectiveTissueOsteon({ isExploded }) {
  // Haversian System (Concentric rings of bone matrix)
  const rings = [1.2, 1.8, 2.4, 3.0]
  
  const groupRef = useRef()
  useFrame((state, delta) => {
    if (groupRef.current) {
      // If exploded, push rings up on the Y axis like a telescope
      groupRef.current.children.forEach((child, idx) => {
         const targetY = isExploded ? idx * 1.2 : 0
         child.position.y = THREE.MathUtils.lerp(child.position.y, targetY, 4 * delta)
      })
    }
  })

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      {/* Central Haversian Canal (Blood vessels & Nerves) */}
      <group position={[0,0,0]}>
         <mesh position={[0.1, 0, 0]}>
           <cylinderGeometry args={[0.15, 0.15, 4, 16]} />
           <meshPhysicalMaterial color="#ef4444" />
         </mesh>
         <mesh position={[-0.1, 0, 0]}>
           <cylinderGeometry args={[0.15, 0.15, 4, 16]} />
           <meshPhysicalMaterial color="#3b82f6" />
         </mesh>
      </group>

      {/* Concentric Lamellae Rings */}
      {rings.map((r, ringIdx) => (
        <group key={ringIdx}>
          <mesh>
             <cylinderGeometry args={[r, r, 3, 32, 1, true]} />
             <meshPhysicalMaterial color="#fcd34d" side={THREE.DoubleSide} roughness={0.7} />
          </mesh>
          {/* Osteocytes (Bone cells) embedded in the rings */}
          {[...Array(8 + ringIdx*4)].map((_, i) => {
             const angle = (i / (8 + ringIdx*4)) * Math.PI * 2
             return (
               <mesh key={i} position={[Math.cos(angle)*r, (Math.sin(angle*3)*1), Math.sin(angle)*r]}>
                 <sphereGeometry args={[0.15, 8, 8]} />
                 <meshPhysicalMaterial color="#b45309" />
               </mesh>
             )
          })}
        </group>
      ))}
    </group>
  )
}

function MuscularTissue({ isContracting }) {
  // Sarcomere model
  const leftZRef = useRef()
  const rightZRef = useRef()
  const muscleBundleRef = useRef()

  useFrame((state, delta) => {
    // Sliding Filament Theory animation!
    // When contracting, the Z-discs pull closer together, and muscle thickens (bulges).
    const contractionZ = isContracting ? 1.5 : 3.0
    const bulgeScale = isContracting ? 1.25 : 1.0

    if (leftZRef.current && rightZRef.current) {
      leftZRef.current.position.z = THREE.MathUtils.lerp(leftZRef.current.position.z, contractionZ, 5 * delta)
      rightZRef.current.position.z = THREE.MathUtils.lerp(rightZRef.current.position.z, -contractionZ, 5 * delta)
    }

    if (muscleBundleRef.current) {
      muscleBundleRef.current.scale.x = THREE.MathUtils.lerp(muscleBundleRef.current.scale.x, bulgeScale, 5 * delta)
      muscleBundleRef.current.scale.y = THREE.MathUtils.lerp(muscleBundleRef.current.scale.y, bulgeScale, 5 * delta)
    }
  })

  // Procedural filament generator
  const filaments = useMemo(() => {
    const arr = []
    for (let x = -0.8; x <= 0.8; x += 0.4) {
      for (let y = -0.8; y <= 0.8; y += 0.4) {
        if (x*x + y*y < 1.0) arr.push({x, y})
      }
    }
    return arr
  }, [])

  return (
    <group rotation={[Math.PI/2, Math.PI/4, 0]} ref={muscleBundleRef}>
      {/* Outer muscle fiber plasma membrane (Sarcolemma) */}
      <mesh>
        <cylinderGeometry args={[1.5, 1.5, 8, 32, 1, true]} />
        <meshPhysicalMaterial color="#fda4af" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Z-Disc Left (Actin anchors) */}
      <group ref={leftZRef} position={[0, 0, 3]}>
        <mesh rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[1.3, 1.3, 0.1, 32]} />
          <meshPhysicalMaterial color="#3b82f6" />
        </mesh>
        {/* Thin Actin Filaments attached to Z-Disc */}
        {filaments.map((f, i) => (
           <mesh key={i} position={[f.x, f.y, -1.2]} rotation={[Math.PI/2, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 2.4, 8]} />
              <meshPhysicalMaterial color="#93c5fd" />
           </mesh>
        ))}
      </group>

      {/* Z-Disc Right (Actin anchors) */}
      <group ref={rightZRef} position={[0, 0, -3]}>
        <mesh rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[1.3, 1.3, 0.1, 32]} />
          <meshPhysicalMaterial color="#3b82f6" />
        </mesh>
        {filaments.map((f, i) => (
           <mesh key={i} position={[f.x, f.y, 1.2]} rotation={[Math.PI/2, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 2.4, 8]} />
              <meshPhysicalMaterial color="#93c5fd" />
           </mesh>
        ))}
      </group>

      {/* Central Thick Myosin Filaments */}
      <group>
        {filaments.map((f, i) => (
           // Myosin sits exactly in between actin
           <mesh key={i} position={[f.x + 0.2, f.y + 0.2, 0]} rotation={[Math.PI/2, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 3.5, 8]} />
              <meshPhysicalMaterial color="#e11d48" roughness={0.8} />
           </mesh>
        ))}
      </group>
    </group>
  )
}

function NervousTissue({ isFiring }) {
  // Massive Neuron Model
  return (
    <group rotation={[Math.PI/4, Math.PI/4, 0]}>
      {/* Soma (Cell Body) */}
      <mesh>
        <dodecahedronGeometry args={[1.5, 1]} />
        <meshPhysicalMaterial color="#60a5fa" clearcoat={1} transmission={0.4} thickness={0.5} />
      </mesh>
      {/* Glowing Nucleus */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshPhysicalMaterial color="#eff6ff" emissive="#eff6ff" emissiveIntensity={0.8} />
      </mesh>

      {/* Dendrites (Receiving Branches) */}
      {[...Array(6)].map((_, i) => {
        const ax = Math.cos(i*Math.PI/3) * 1.4
        const az = Math.sin(i*Math.PI/3) * 1.4
        return (
          <group key={i} position={[ax, 0.5, az]} rotation={[Math.PI/6, -i*Math.PI/3, 0]}>
             <mesh position={[0, 1, 0]}>
               <cylinderGeometry args={[0.1, 0.3, 2]} />
               <meshPhysicalMaterial color="#93c5fd" />
             </mesh>
          </group>
        )
      })}

      {/* Axon (Transmitting Tail) */}
      <group position={[0, -1.2, 0]}>
        {/* Axon tube */}
        <mesh position={[0, -4, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 8, 16]} />
          <meshPhysicalMaterial color="#3b82f6" />
        </mesh>

        {/* Myelin Sheaths (Nodes of Ranvier) */}
        {[...Array(4)].map((_, i) => (
          <mesh key={i} position={[0, -2 - (i*1.8), 0]}>
            <capsuleGeometry args={[0.35, 1.2, 16, 16]} />
            <meshPhysicalMaterial color="#fef08a" roughness={0.6} />
          </mesh>
        ))}

        {/* Action Potential Electrical Pulses */}
        {isFiring && (
          <Sparkles position={[0, -4, 0]} count={40} scale={[1, 8, 1]} size={6} speed={6} color="#fbbf24" />
        )}
      </group>
    </group>
  )
}

export function AnimalTissueSimulator() {
  const [activeId, setActiveId] = useState('musc')
  const [interactA, setInteractA] = useState(false)
  const controlsRef = useRef()

  const t = TISSUES.find(x => x.id === activeId)

  // Auto-reset interactions when swapping tissues
  useEffect(() => {
    setInteractA(false)
    if (controlsRef.current) {
      controlsRef.current.setLookAt(0, 4, 10, 0, 0, 0, true)
    }
  }, [activeId])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="🧬" title="Animal Tissues" subtitle="Mammalian Geometric Cellular Architecture" color={t.color} />

      {/* Tissue Selector */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {TISSUES.map(ts => (
          <Btn key={ts.id} active={activeId === ts.id} onClick={() => setActiveId(ts.id)} color={ts.color}>
            {ts.label}
          </Btn>
        ))}
      </div>

      <div style={{
        position: 'relative', width: '100%', height: 500,
        background: 'radial-gradient(ellipse at center, #0f172a 0%, #020617 100%)',
        borderRadius: 16, border: `1px solid ${t.color}60`, overflow: 'hidden',
        boxShadow: `inset 0 0 100px ${t.color}15`, transition: 'all 0.5s'
      }}>
        <Canvas camera={{ position: [0, 4, 10], fov: 45 }}>
          <ambientLight intensity={0.4} />
          <spotLight position={[15, 20, 15]} angle={0.5} penumbra={1} intensity={1.5} color="#fff" />
          <pointLight position={[-15, -5, -15]} intensity={0.5} color={t.color} />
          
          <Suspense fallback={<Html center><div style={{color: t.color, fontFamily:'"DM Mono"', letterSpacing: 2}}>CLONING TISSUE...</div></Html>}>
            <Environment preset="night" resolution={256} />
            
            <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
               {activeId === 'epit' && <EpithelialTissue />}
               {activeId === 'conn' && <ConnectiveTissueOsteon isExploded={interactA} />}
               {activeId === 'musc' && <MuscularTissue isContracting={interactA} />}
               {activeId === 'nerv' && <NervousTissue isFiring={interactA} />}
            </Float>

            {/* A clean glass floor mimicking a petri dish */}
            <mesh position={[0, -4, 0]} rotation={[-Math.PI/2, 0, 0]}>
              <circleGeometry args={[10, 64]} />
              <meshPhysicalMaterial color="#1e293b" roughness={0} clearcoat={1} transmission={0.9} />
            </mesh>

            <ContactShadows position={[0, -3.9, 0]} opacity={0.5} scale={20} blur={2.5} far={8} />
            <CameraControls ref={controlsRef} minDistance={2} maxDistance={20} />
          </Suspense>
        </Canvas>

        {/* Dynamic Interactive Overlays specific to Tissue type */}
        <div style={{ position: 'absolute', bottom: 16, right: 16 }}>
           {activeId === 'conn' && (
             <Btn active={interactA} onClick={() => setInteractA(!interactA)} color="#fbbf24">
                {interactA ? 'Collapse Osteon' : 'Telescope Lamellae Rings'}
             </Btn>
           )}
           {activeId === 'musc' && (
             <Btn active={interactA} onClick={() => setInteractA(!interactA)} color="#f43f5e"
               onPointerDown={() => setInteractA(true)} onPointerUp={() => setInteractA(false)} onPointerLeave={() => setInteractA(false)}>
                [HOLD TO CONTRACT SARCOMERE]
             </Btn>
           )}
           {activeId === 'nerv' && (
             <div style={{ display: 'flex', gap: '8px' }}>
                <Btn active={interactA} onClick={() => setInteractA(!interactA)} color="#fbbf24"
                  onPointerDown={() => setInteractA(true)} onPointerUp={() => setInteractA(false)} onPointerLeave={() => setInteractA(false)}>
                   [HOLD TO FIRE ACTION POTENTIAL]
                </Btn>
             </div>
           )}
        </div>
      </div>

      <Callout color={t.color}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <strong style={{ color: t.color, fontSize: '1.2rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Biological Function</strong>
            <p style={{ marginTop: 8, lineHeight: 1.7, fontSize: '0.95rem' }}>{t.desc}</p>
          </div>
        </div>
      </Callout>
    </div>
  )
}
