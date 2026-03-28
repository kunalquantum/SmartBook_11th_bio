import { useState, useRef, useEffect, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Environment, CameraControls, ContactShadows, Sparkles, Float } from '@react-three/drei'
import * as THREE from 'three'
import { SimHeader, Callout, Btn } from '../ui'

const SYSTEMS = [
  { id: 'all', label: 'Full Anatomy', sub: 'Periplaneta americana', color: '#94a3b8', desc: 'The complete internal and external macroscopic anatomy of the Cockroach. It features a hardened chitinous exoskeleton divided into three main tagmata: Head, Thorax, and Abdomen.' },
  { id: 'dig', label: 'Alimentary Canal', sub: 'Digestive System', color: '#10b981', desc: 'The complex digestive tract. Notice the massive Crop for storing food, the muscular Gizzard for grinding, the Hepatic Caeca rings, and the massive tangle of Malpighian Tubules for excretion.' },
  { id: 'cir', label: 'Circulatory System', sub: 'Dorsal Heart', color: '#f43f5e', desc: 'An open circulatory system. A long, 13-chambered dorsal heart runs along the entire back, actively pumping hemolymph (colourless blood) forward into the head sinuses.' }
]

function ProceduralCockroach({ activeSystem, exoskeletonOpacity }) {
  const heartChambersRef = useRef([])
  const cropRef = useRef()

  // Biological Animations!
  useFrame((state, delta) => {
    // 1. Heartbeat Protocol (Sequential 13-chamber pulse)
    heartChambersRef.current.forEach((mesh, index) => {
      if (!mesh) return
      // Calculate a travelling wave offset based on index to simulate peristaltic pumping forward!
      const squeeze = 1 + Math.sin(state.clock.elapsedTime * 6 + (index * 0.8)) * 0.25
      mesh.scale.set(squeeze, squeeze, squeeze)
    })

    // 2. Digestive Peristalsis (Slow throbbing of the Crop)
    if (cropRef.current) {
        const dig = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
        cropRef.current.scale.setScalar(dig)
    }
  })

  // Procedural Constants
  const exoMat = <meshPhysicalMaterial color="#78350f" transparent opacity={exoskeletonOpacity} roughness={0.6} clearcoat={1} depthWrite={false} side={THREE.DoubleSide} />
  
  const showDig = activeSystem === 'all' || activeSystem === 'dig'
  const showCir = activeSystem === 'all' || activeSystem === 'cir'

  return (
    <group position={[0, -1, 0]}>
      
      {/* ======================================= */}
      {/* 1. EXOSKELETON (Transparent Shell)      */}
      {/* ======================================= */}
      {exoskeletonOpacity > 0 && (
        <group>
          {/* Head (Hypognathous - tucked underneath Pronotum facing down) */}
          <mesh position={[0, 4.0, 0.4]} rotation={[0.4, 0, 0]}>
             <sphereGeometry args={[0.5, 32, 32]} />
             {exoMat}
             {/* Antennae (Sweeping frantically backwards & out) */}
             <mesh position={[-0.3, 0.4, 0.2]} rotation={[Math.PI/3, 0.3, 0.5]}>
               <cylinderGeometry args={[0.02, 0.04, 5, 8]} />
               <meshPhysicalMaterial color="#451a03" />
             </mesh>
             <mesh position={[0.3, 0.4, 0.2]} rotation={[Math.PI/3, -0.3, -0.5]}>
               <cylinderGeometry args={[0.02, 0.04, 5, 8]} />
               <meshPhysicalMaterial color="#451a03" />
             </mesh>
          </mesh>

          {/* Pronotum (Massive curved shield completely hiding the neck) */}
          <mesh position={[0, 3.5, 0.2]} rotation={[-Math.PI/2 - 0.2, 0, 0]} scale={[1.4, 1.2, 0.4]}>
             <cylinderGeometry args={[1.2, 1.3, 0.3, 32]} />
             {exoMat}
          </mesh>

          {/* Core Body (Flattened tremendously to give Cockroach oval aerodynamic profile) */}
          <mesh position={[0, -0.5, 0]} scale={[1.7, 4.2, 0.7]}>
             <sphereGeometry args={[1, 32, 32]} />
             {exoMat}
          </mesh>

          {/* Segmented Abdominal Tergites (Distinct overlapping armour plates running down the back) */}
          {[...Array(9)].map((_, i) => (
             <mesh key={i} position={[0, 2 - (i*0.65), -0.6]} rotation={[0.1, 0, 0]} scale={[1.6 - (i*0.1), 0.7, 0.15]}>
               <sphereGeometry args={[1, 16, 16, 0, Math.PI]} />
               {exoMat}
             </mesh>
          ))}

          {/* Folded Wings (Tegmina) laying totally flat against the dorsal side */}
          <mesh position={[-0.2, -0.2, -0.75]} rotation={[0, 0, 0.03]} scale={[0.8, 3.8, 0.05]}>
             <sphereGeometry args={[1, 32, 32]} />
             <meshPhysicalMaterial color="#451a03" transparent opacity={exoskeletonOpacity} roughness={0.4} clearcoat={1} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.2, -0.3, -0.8]} rotation={[0, 0, -0.03]} scale={[0.8, 3.8, 0.05]}>
             <sphereGeometry args={[1, 32, 32]} />
             <meshPhysicalMaterial color="#451a03" transparent opacity={exoskeletonOpacity} roughness={0.4} clearcoat={1} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>

          {/* 3 Pairs of Jointed Spiky Legs (Pro, Meso, Meta-thoracic) */}
          {[2.8, 1.4, 0.0].map((y, i) => (
             <group key={i}>
                {/* Left Leg Base pointing slightly up and out */}
                <group position={[-1.2, y, 0]} rotation={[0, 0, Math.PI/2.5 + (i*0.2)]}>
                   {/* Thick Femur */}
                   <mesh position={[0, 1.0, 0]}>
                      <cylinderGeometry args={[0.15, 0.06, 2]} />
                      <meshPhysicalMaterial color="#451a03" />
                   </mesh>
                   <mesh position={[0, 2.0, 0]}><sphereGeometry args={[0.08]} /><meshPhysicalMaterial color="#451a03" /></mesh> {/* Knee */}
                   {/* Tibia pointing violently downward */}
                   <mesh position={[0, 2.0, 0]} rotation={[0, 0, -Math.PI/1.3]}>
                      <mesh position={[0, 1.25, 0]}><cylinderGeometry args={[0.05, 0.02, 2.5]} /></mesh>
                      <meshPhysicalMaterial color="#451a03" />
                   </mesh>
                </group>

                {/* Right Leg */}
                <group position={[1.2, y, 0]} rotation={[0, 0, -Math.PI/2.5 - (i*0.2)]}>
                   {/* Thick Femur */}
                   <mesh position={[0, 1.0, 0]}>
                      <cylinderGeometry args={[0.15, 0.06, 2]} />
                      <meshPhysicalMaterial color="#451a03" />
                   </mesh>
                   <mesh position={[0, 2.0, 0]}><sphereGeometry args={[0.08]} /><meshPhysicalMaterial color="#451a03" /></mesh> {/* Knee */}
                   {/* Tibia pointing violently downward */}
                   <mesh position={[0, 2.0, 0]} rotation={[0, 0, Math.PI/1.3]}>
                      <mesh position={[0, 1.25, 0]}><cylinderGeometry args={[0.05, 0.02, 2.5]} /></mesh>
                      <meshPhysicalMaterial color="#451a03" />
                   </mesh>
                </group>
             </group>
          ))}

          {/* Anal Cerci (Sensory hairs) */}
          <mesh position={[-0.4, -4.8, 0]} rotation={[0,0,-0.4]}><cylinderGeometry args={[0.05,0.01,1.5]}/><meshPhysicalMaterial color="#451a03" /></mesh>
          <mesh position={[ 0.4, -4.8, 0]} rotation={[0,0, 0.4]}><cylinderGeometry args={[0.05,0.01,1.5]}/><meshPhysicalMaterial color="#451a03" /></mesh>
        </group>
      )}

      {/* ======================================= */}
      {/* 2. ALIMENTARY CANAL (Digestive Tract)   */}
      {/* ======================================= */}
      {showDig && (
        <group position={[0, 0, 0.2]}> {/* Centered vertically but slightly forward */}
           {/* Pharynx & Oesophagus */}
           <mesh position={[0, 4.0, 0]}>
              <cylinderGeometry args={[0.1, 0.15, 1]} />
              <meshPhysicalMaterial color="#6ee7b7" roughness={0.6} />
           </mesh>
           {/* CROP - Massive storage sac */}
           <mesh position={[0, 2.4, 0]} ref={cropRef}>
              <dodecahedronGeometry args={[0.7, 1]} />
              <meshPhysicalMaterial color="#fbbf24" roughness={0.3} transmission={0.2} thickness={0.5} />
           </mesh>
           {/* Gizzard (Proventriculus) - Grinding organ */}
           <mesh position={[0, 1.4, 0]}>
              <sphereGeometry args={[0.4, 32, 32]} />
              <meshPhysicalMaterial color="#f87171" roughness={0.8} />
           </mesh>
           {/* Hepatic Caeca (6-8 blind tubules secreting digestive juice) */}
           {[...Array(8)].map((_, i) => {
              const theta = (i / 8) * Math.PI * 2
              return (
                <mesh key={i} position={[Math.cos(theta)*0.3, 1.2, Math.sin(theta)*0.3]} rotation={[0, -theta, -Math.PI/4]}>
                   <capsuleGeometry args={[0.08, 0.5]} />
                   <meshPhysicalMaterial color="#a3e635" />
                </mesh>
              )
           })}
           {/* Mesenteron (Midgut) */}
           <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 2.8, 16]} />
              <meshPhysicalMaterial color="#86efac" />
           </mesh>

           {/* Malpighian Tubules (Excretory hairs at the midgut/hindgut junction) */}
           {/* 150 structurally simplified into 40 dense geometric hairs */}
           {[...Array(40)].map((_, i) => {
              const theta = Math.random() * Math.PI * 2
              const drop = Math.random() * (-Math.PI/2) // pointing downwards
              return (
                <group key={i} position={[0, -1.6, 0]} rotation={[drop, theta, 0]}>
                   <mesh position={[0, 0.6, 0]}>
                      <cylinderGeometry args={[0.015, 0.015, 1.2]} />
                      <meshPhysicalMaterial color="#fef08a" emissive="#fcd34d" emissiveIntensity={0.5} />
                   </mesh>
                </group>
              )
           })}

           {/* Hindgut (Ileum, Colon, Rectum) */}
           <mesh position={[0, -2.6, 0]}>
              <cylinderGeometry args={[0.25, 0.15, 2]} />
              <meshPhysicalMaterial color="#059669" />
           </mesh>
           {/* Rectum */}
           <mesh position={[0, -4.0, 0]}>
              <dodecahedronGeometry args={[0.3, 0]} />
              <meshPhysicalMaterial color="#064e3b" />
           </mesh>

           {/* Food Digestion Sparks inside tract */}
           {activeSystem === 'dig' && <Sparkles position={[0, 1.0, 0]} count={20} scale={[0.5, 8, 0.5]} size={2} speed={1} color="#10b981" />}
        </group>
      )}

      {/* ======================================= */}
      {/* 3. CIRCULATORY SYSTEM (Dorsal Heart)   */}
      {/* ======================================= */}
      {showCir && (
        <group position={[0, 0, -0.4]}> {/* Tucked into the dorsal (back) spine edge */}
           {/* 13 Funnel-shaped Chambers */}
           {[...Array(13)].map((_, i) => {
              return (
                 <mesh key={i} ref={el => heartChambersRef.current[i] = el} position={[0, 3.5 - (i * 0.6), 0]}>
                    <coneGeometry args={[0.2, 0.5, 16]} rotation={[Math.PI, 0, 0]} />
                    <meshPhysicalMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={0.2} clearcoat={1} transmission={0.2} />
                 </mesh>
              )
           })}

           {/* Alary Muscles (Fan shaped muscles that support the heart) */}
           {[...Array(12)].map((_, i) => (
             <group key={i} position={[0, 3.2 - (i * 0.6), 0]}>
                <mesh position={[0.3, 0, 0]} rotation={[0,0,Math.PI/2]}>
                  <cylinderGeometry args={[0.03, 0.01, 0.6]} />
                  <meshPhysicalMaterial color="#fda4af" />
                </mesh>
                <mesh position={[-0.3, 0, 0]} rotation={[0,0,-Math.PI/2]}>
                  <cylinderGeometry args={[0.03, 0.01, 0.6]} />
                  <meshPhysicalMaterial color="#fda4af" />
                </mesh>
             </group>
           ))}

           {/* Anterior Aorta (Tube blasting blood into the head sinuses) */}
           <mesh position={[0, 4.0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 1]} />
              <meshPhysicalMaterial color="#f43f5e" />
           </mesh>

           {/* Haemolymph Blood Pulses */}
           {activeSystem === 'cir' && <Sparkles position={[0, 0, 0]} count={40} scale={[1, 10, 0.2]} size={3} speed={6} color="#38bdf8" />}
        </group>
      )}

    </group>
  )
}

export function CockroachSimulator() {
  const [activeSys, setActiveSys] = useState('all')
  const [opacity, setOpacity] = useState(0.4)
  const controlsRef = useRef()

  const s = SYSTEMS.find(x => x.id === activeSys)

  useEffect(() => {
    if (controlsRef.current) {
      if (activeSys === 'dig') {
        controlsRef.current.setLookAt(0, 1.5, 6, 0, 1.5, 0, true) // Zoom to Crop/Gizzard
      } else if (activeSys === 'cir') {
        controlsRef.current.setLookAt(3, 0, 5, 0, 0, 0, true) // Side view to see entire heart spine
      } else {
        controlsRef.current.setLookAt(0, 0, 11, 0, 0, 0, true) // Full body overview
      }
    }
  }, [activeSys])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="🪳" title="Cockroach Dissection" subtitle="Study of Animal Type: Periplaneta" color={s.color} />

      {/* System Filters */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {SYSTEMS.map(sys => (
          <Btn key={sys.id} active={activeSys === sys.id} onClick={() => setActiveSys(sys.id)} color={sys.color}>
            {sys.label}
          </Btn>
        ))}
      </div>

      {/* Exoskeleton Laser Opacity Control */}
      <div style={{ background: '#0f172a', padding: '12px 24px', borderRadius: 12, border: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '1rem' }}>
         <span style={{ fontSize: '0.8rem', color: '#94a3b8', width: 140 }}>Exoskeleton Opacity:</span>
         <input type="range" min="0" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))}
           style={{ flex: 1, accentColor: '#78350f' }} 
         />
         <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 'bold' }}>{Math.round(opacity * 100)}%</span>
      </div>

      <div style={{
        position: 'relative', width: '100%', height: 500,
        background: 'radial-gradient(circle at center, #020617 0%, #000000 100%)',
        borderRadius: 16, border: `1px solid ${s.color}60`, overflow: 'hidden',
        boxShadow: `inset 0 0 100px ${s.color}15`, transition: 'all 0.5s'
      }}>
        <Canvas camera={{ position: [0, 0, 11], fov: 45 }}>
          <ambientLight intensity={0.4} />
          <spotLight position={[15, 20, 15]} angle={0.4} penumbra={1} intensity={1.5} color="#fff" />
          {/* Internal backlight to make organs pop through chitin */}
          <pointLight position={[0, 0, -5]} intensity={0.6} color={s.color} />
          <pointLight position={[0, 6, 2]} intensity={0.4} color="#fcd34d" />
          
          <Suspense fallback={<Html center><div style={{color: s.color, fontFamily:'"DM Mono"', letterSpacing: 2}}>COMPILING PERIPLANETA...</div></Html>}>
            <Environment preset="night" resolution={256} />
            
            <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
               <ProceduralCockroach activeSystem={activeSys} exoskeletonOpacity={opacity} />
            </Float>

            <ContactShadows position={[0, -6, 0]} opacity={0.6} scale={20} blur={2.5} far={8} />
            <CameraControls ref={controlsRef} minDistance={2} maxDistance={20} />
          </Suspense>
        </Canvas>

        {/* Cinematic Readout */}
        <div style={{ position: 'absolute', top: 16, left: 16, pointerEvents: 'none' }}>
           <div style={{ color: s.color, fontFamily: '"DM Mono", monospace', fontSize: '0.65rem', letterSpacing: '2px', textShadow: '0 2px 4px rgba(0,0,0,1)' }}>
              VIEWING MODE: {s.label.toUpperCase()}
              <br/>
              CARAPACE OPACITY: {Math.round(opacity * 100)}%
           </div>
        </div>
      </div>

      <Callout color={s.color}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
           <div style={{ flex: 1 }}>
              <strong style={{ color: s.color, fontSize: '1.2rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{s.label}</strong>
              <div style={{ fontSize: '0.8rem', color: '#e2e8f0', opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>
                 {s.sub}
              </div>
              <p style={{ marginTop: 8, lineHeight: 1.7, fontSize: '0.95rem' }}>{s.desc}</p>
           </div>
        </div>
      </Callout>
    </div>
  )
}
