import { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Environment, CameraControls, ContactShadows, Sparkles, Float } from '@react-three/drei'
import * as THREE from 'three'
import { SimHeader, Callout, Btn, StepPill } from '../ui'

// Sequence of Digital Dissection
const DISSECT_LEVELS = [
  { id: 0, label: 'Intact Flower', sub: 'Complete Angiosperm', color: '#ec4899', desc: 'The complete flower in bloom, showcasing all four whorls: Calyx, Corolla, Androecium, and Gynoecium.' },
  { id: 1, label: 'Remove Calyx (Sepals)', sub: 'Exposing Corolla', color: '#84cc16', desc: 'The green sepals (Calyx) fall away. Their primary biological function was to protect the bud before it blossomed.' },
  { id: 2, label: 'Remove Corolla (Petals)', sub: 'Exposing Reproductive Organs', color: '#f43f5e', desc: 'The brightly coloured petals fall away. They are strictly accessory organs designed by evolution to attract pollinators.' },
  { id: 3, label: 'Remove Androecium (Stamens)', sub: 'Isolating Gynoecium', color: '#fcd34d', desc: 'Male reproductive organs (Stamens) detach. You can see the anthers that produce and release microscopic pollen.' },
  { id: 4, label: 'Slice Ovary (Cross-Section)', sub: 'Revealing Ovules', color: '#bef264', desc: 'The female Ovary is vertically bisected. Inside, you can see the geometric ovules (seeds) attached to the placenta!' },
]

function ProceduralFlower({ level }) {
  // Animation Refs
  const sepalRef = useRef()
  const petalRef = useRef()
  const stamenRef = useRef()
  const ovaryShellRef = useRef()

  useFrame((state, delta) => {
    // 1. Sepal Drop (Level >= 1)
    if (sepalRef.current) {
      const dropS = level >= 1
      sepalRef.current.position.y = THREE.MathUtils.lerp(sepalRef.current.position.y, dropS ? -4 : 0, 3 * delta)
      sepalRef.current.scale.setScalar(THREE.MathUtils.lerp(sepalRef.current.scale.x, dropS ? 0 : 1, 3 * delta))
    }

    // 2. Petal Drop (Level >= 2)
    if (petalRef.current) {
      const dropP = level >= 2
      petalRef.current.position.y = THREE.MathUtils.lerp(petalRef.current.position.y, dropP ? -6 : 0, 2.5 * delta)
      petalRef.current.scale.setScalar(THREE.MathUtils.lerp(petalRef.current.scale.x, dropP ? 0 : 1, 3 * delta))
    }

    // 3. Stamen Drop (Level >= 3)
    if (stamenRef.current) {
      const dropSt = level >= 3
      stamenRef.current.position.y = THREE.MathUtils.lerp(stamenRef.current.position.y, dropSt ? -8 : 0, 2 * delta)
      stamenRef.current.scale.setScalar(THREE.MathUtils.lerp(stamenRef.current.scale.x, dropSt ? 0 : 1, 3 * delta))
    }

    // 4. Ovary Slice (Level == 4)
    if (ovaryShellRef.current) {
      // Rotate the front half of the ovary away like a door
      const sliceO = level >= 4
      ovaryShellRef.current.rotation.y = THREE.MathUtils.lerp(ovaryShellRef.current.rotation.y, sliceO ? Math.PI / 1.5 : 0, 4 * delta)
    }
  })

  // Geometric Builders
  const buildWhorl = (count, radius, tilt, scale, Comp, Mat) => {
    return [...Array(count)].map((_, i) => {
      const angle = (i / count) * Math.PI * 2
      return (
        <group key={i} rotation={[0, angle, 0]}>
          <mesh position={[radius, radius * Math.tan(tilt), 0]} rotation={[0, 0, -tilt]} scale={scale}>
            {Comp}
            {Mat}
          </mesh>
        </group>
      )
    })
  }

  return (
    <group position={[0, -2, 0]}>
      
      {/* --- WHORL 1: CALYX (Sepals) --- */}
      <group ref={sepalRef}>
        {buildWhorl(5, 1.2, Math.PI/4, [0.6, 2.0, 0.1], 
          <sphereGeometry args={[1, 32, 16]} />, 
          <meshPhysicalMaterial color="#65a30d" roughness={0.8} clearcoat={0.1} />
        )}
      </group>

      {/* --- WHORL 2: COROLLA (Petals) --- */}
      <group ref={petalRef}>
        {/* Layer 1 Overlapping Petals */}
        {buildWhorl(5, 0.8, Math.PI/3.5, [1.4, 3.5, 0.1], 
          <sphereGeometry args={[1, 32, 16]} />, 
          <meshPhysicalMaterial color="#f43f5e" roughness={0.4} transmission={0.4} thickness={0.2} clearcoat={0.5} />
        )}
        {/* Layer 2 Overlapping Petals */}
        <group rotation={[0, Math.PI/5, 0]}>
          {buildWhorl(5, 0.6, Math.PI/4.5, [1.2, 3.2, 0.1], 
            <sphereGeometry args={[1, 32, 16]} />, 
            <meshPhysicalMaterial color="#fb7185" roughness={0.4} transmission={0.4} thickness={0.2} clearcoat={0.5} />
          )}
        </group>
      </group>

      {/* --- WHORL 3: ANDROECIUM (Stamens) --- */}
      <group ref={stamenRef}>
        {[...Array(6)].map((_, i) => {
          const angle = (i / 6) * Math.PI * 2
          return (
            <group key={i} rotation={[0, angle, 0]}>
              <group position={[0.7, 0, 0]} rotation={[0, 0, -Math.PI/12]}>
                {/* Filament */}
                <mesh position={[0, 2.5, 0]}>
                  <cylinderGeometry args={[0.04, 0.08, 5, 16]} />
                  <meshPhysicalMaterial color="#fef08a" roughness={0.5} />
                </mesh>
                {/* Double-Lobed Anther */}
                <mesh position={[0.08, 5.0, 0]} rotation={[0,0,Math.PI/2]}>
                  <capsuleGeometry args={[0.15, 0.5, 16, 16]} />
                  <meshPhysicalMaterial color="#fcd34d" roughness={0.9} />
                </mesh>
                <mesh position={[-0.08, 5.0, 0]} rotation={[0,0,Math.PI/2]}>
                  <capsuleGeometry args={[0.15, 0.5, 16, 16]} />
                  <meshPhysicalMaterial color="#fcd34d" roughness={0.9} />
                </mesh>
                {/* Active Pollen */}
                <Sparkles position={[0, 5.0, 0]} count={15} scale={1} size={2} speed={0.4} color="#fcd34d" />
              </group>
            </group>
          )
        })}
      </group>

      {/* --- WHORL 4: GYNOECIUM (Pistil/Carpel) --- */}
      <group>
        {/* Receptacle (Thalamus Base) */}
        <mesh position={[0, -0.4, 0]}>
           <cylinderGeometry args={[1.4, 0.4, 0.8, 32]} />
           <meshPhysicalMaterial color="#4d7c0f" roughness={0.9} />
        </mesh>

        {/* Stigma (Top Sticky Pad) */}
        <mesh position={[0, 5.8, 0]}>
          <dodecahedronGeometry args={[0.35, 1]} />
          <meshPhysicalMaterial color="#a3e635" roughness={0.9} />
        </mesh>
        
        {/* Style (Long Neck Tube) */}
        <mesh position={[0, 3.8, 0]}>
          <cylinderGeometry args={[0.15, 0.35, 4, 32]} />
          <meshPhysicalMaterial color="#bef264" roughness={0.6} />
        </mesh>

        {/* Ovary (Swollen Basal Part) */}
        {/* Back Half (Static) */}
        <mesh position={[0, 1.0, 0]}>
          <sphereGeometry args={[1.2, 32, 32, Math.PI, Math.PI]} />
          <meshPhysicalMaterial color="#a3e635" roughness={0.4} side={THREE.DoubleSide} />
        </mesh>
        {/* Front Half (Slices open during Level 4) */}
        <mesh position={[0, 1.0, 0]} ref={ovaryShellRef}>
          <sphereGeometry args={[1.2, 32, 32, 0, Math.PI]} />
          <meshPhysicalMaterial color="#a3e635" roughness={0.4} side={THREE.DoubleSide} />
        </mesh>

        {/* Internal Ovules (Seeds) - Only deeply visible when sliced or via transmission */}
        <group position={[0, 1.0, 0]}>
          {/* Central Placenta column */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 1.8, 16]} />
            <meshPhysicalMaterial color="#d9f99d" />
          </mesh>
          {/* Attached Ovules */}
          {[...Array(8)].map((_, i) => (
             <mesh key={i} position={[
               Math.cos(i * Math.PI/2) * 0.4, 
               (i * 0.2) - 0.7, 
               Math.sin(i * Math.PI/2) * 0.4
             ]} scale={0.3}>
                <icosahedronGeometry args={[1, 1]} />
                <meshPhysicalMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={level === 4 ? 0.5 : 0} />
             </mesh>
          ))}
        </group>
      </group>

    </group>
  )
}

export function FlowerMorphSimulator() {
  const [level, setLevel] = useState(0)
  const controlsRef = useRef()

  // Cinematic Interpolation
  useEffect(() => {
    if (controlsRef.current) {
      if (level === 4) {
        // Swoop closely into the sliced Ovary!
        controlsRef.current.setLookAt(
          0, -0.5, 4.5, // Move camera down and close to center
          0, -1.0, 0,   // Look specifically at the internal seeds
          true
        )
      } else if (level >= 1) {
        // Slight zoom as parts fall off
        controlsRef.current.setLookAt(
          0, 2, 9 - level, 
          0, 2, 0, 
          true
        )
      } else {
        // Intact full flower
        controlsRef.current.setLookAt(
          0, 4, 11, 
          0, 1, 0, 
          true
        )
      }
    }
  }, [level])

  const s = DISSECT_LEVELS[level]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="🌺" title="Angiosperm Morphology" subtitle="Procedural Digital Di-section" color={s.color} />

      {/* Dissection Sequence Pills */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {DISSECT_LEVELS.map((sl, i) => (
          <StepPill key={sl.id} label={sl.label} active={level >= i} color={sl.color}
            onClick={() => setLevel(i)} />
        ))}
      </div>

      <div style={{
        position: 'relative', width: '100%', height: 500,
        background: 'radial-gradient(circle at center, #020617 0%, #000000 100%)',
        borderRadius: 16, border: `1px solid ${s.color}60`, overflow: 'hidden',
        boxShadow: `inset 0 0 100px ${s.color}15`, transition: 'all 0.5s'
      }}>
        <Canvas camera={{ position: [0, 4, 11], fov: 45 }}>
          <ambientLight intensity={0.4} />
          <spotLight position={[15, 20, 15]} angle={0.4} penumbra={1} intensity={1.5} color="#fff" />
          <pointLight position={[-15, -5, -15]} intensity={0.5} color={s.color} />
          
          <Suspense fallback={<Html center><div style={{color: s.color, fontFamily:'"DM Mono"', letterSpacing: 2}}>GENERATING FLOWERING TISSUES...</div></Html>}>
            <Environment preset="forest" resolution={256} />
            
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
               <ProceduralFlower level={level} />
            </Float>

            <ContactShadows position={[0, -2.5, 0]} opacity={0.6} scale={20} blur={2.5} far={8} />
            <CameraControls ref={controlsRef} minDistance={2} maxDistance={20} />
          </Suspense>
        </Canvas>

        {/* Cinematic Overlay Title */}
        <div style={{ position: 'absolute', top: 16, left: 16, pointerEvents: 'none', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '2rem', color: '#fff', textShadow: `0 2px 20px ${s.color}`, transition: 'all 0.5s' }}>
            {level === 4 ? "Cross-section Active" : "Intact Specimen"}
          </div>
          <div style={{ fontFamily: '"Outfit", sans-serif', fontSize: '0.8rem', color: s.color, fontWeight: 700, textTransform: 'uppercase', transition: 'all 0.5s', letterSpacing: '1px' }}>
            {s.sub}
          </div>
        </div>
      </div>

      {/* Dissection Details Panel */}
      <Callout color={s.color}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
           <div style={{ flex: 1 }}>
              <strong style={{ color: s.color, fontSize: '1.2rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{s.label}</strong>
              <p style={{ marginTop: 8, lineHeight: 1.7, fontSize: '0.95rem' }}>{s.desc}</p>
           </div>
           {/* Sequential Control Builder */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Btn onClick={() => setLevel(Math.max(0, level - 1))} color="#475569" style={{ width: '100%' }}>Undo Dissection</Btn>
              <Btn onClick={() => setLevel(Math.min(4, level + 1))} color={level === 4 ? '#475569' : s.color} style={{ width: '100%' }}>
                 {level === 4 ? 'Fully Dissected' : 'Scapel: Next Layer'}
              </Btn>
           </div>
        </div>
      </Callout>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#1e293b', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(level / 4) * 100}%`, background: s.color, borderRadius: 3, transition: 'width 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} />
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontFamily: '"DM Mono"' }}>{Math.round((level/4)*100)}% DISSECTED</span>
      </div>

    </div>
  )
}
