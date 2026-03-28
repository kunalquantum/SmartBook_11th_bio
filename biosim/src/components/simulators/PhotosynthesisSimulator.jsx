import { useState, useRef, useEffect, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Environment, CameraControls, ContactShadows, Sparkles, Float } from '@react-three/drei'
import * as THREE from 'three'
import { SimHeader, Callout, Btn } from '../ui'

// Mathematical Photosynthesis Engine
// Rate of Reaction = Math.min(Light, CO2) * TempBellCurve
function ChloroplastSystem({ lightIntensity, co2Level, temperature }) {
  // Limiting Factor Calculator (Blackman's Law)
  // Optimal temp is ~35°C. At 55°C, enzymes totally denature.
  const tempFactor = Math.max(0, 1 - Math.pow((temperature - 35) / 20, 2)) 
  const rawRate = Math.min(lightIntensity, co2Level) / 100
  const photoRate = rawRate * tempFactor // Continuous output 0.0 to 1.0

  const granaRef = useRef()
  const calvinCycleRef = useRef()
  const sunLightRef = useRef()

  useFrame((state, delta) => {
    // 1. Solar Intensity (The sun gets physically brighter as lightIntensity slider goes up)
    if (sunLightRef.current) {
      sunLightRef.current.intensity = THREE.MathUtils.lerp(sunLightRef.current.intensity, (lightIntensity/100) * 8, 5 * delta)
    }

    // 2. Light Reaction Activity (Grana float and throb faster based on pure light)
    if (granaRef.current) {
       const pulse = 1 + Math.sin(state.clock.elapsedTime * 15 * (lightIntensity/100)) * 0.02
       granaRef.current.scale.setScalar(pulse)
    }

    // 3. Dark Reaction Activity (Calvin Cycle spins completely based on the OVERALL photoRate limit)
    if (calvinCycleRef.current) {
       // Calvin Cycle spins! If enzymes frozen/denatured by extreme temp, spin = 0
       calvinCycleRef.current.rotation.y += (photoRate * 3) * delta
    }
  })

  // Procedural Grana Stacks (Thylakoids)
  const granaPositions = [
     [-2.5, 0, 0], [-1.0, 0.8, -1.2], [-1.5, -1, 1],
     [-3.0, -1.5, -0.5], [-0.5, -1.5, -1.5]
  ]

  const isDenatured = temperature > 45 || temperature < 5

  return (
    <group position={[0,-0.5,0]}>
      {/* Light Source (The Sun) */}
      <spotLight ref={sunLightRef} position={[-15, 10, 0]} angle={0.4} penumbra={0.5} color="#fbbf24" distance={30} castShadow />

      {/* --- GRANA (Light Reactions Zone) --- */}
      <group ref={granaRef}>
         {granaPositions.map((pos, i) => (
           <group key={i} position={pos}>
             {/* Stack of 5 Thylakoid discs */}
             {[...Array(5)].map((_, j) => (
               <mesh key={j} position={[0, (j * 0.25) - 0.5, 0]}>
                 <cylinderGeometry args={[0.5, 0.5, 0.15, 32]} />
                 {/* Chlorophyll physically glows green based on light limits! */}
                 <meshPhysicalMaterial color="#22c55e" emissive="#4ade80" emissiveIntensity={(lightIntensity/100) * 1.5} roughness={0.4} />
               </mesh>
             ))}
           </group>
         ))}

         {/* Stroma Lamellae mathematically connecting grana */}
         <mesh position={[-2, 0, -0.5]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.05, 0.05, 2]}/><meshPhysicalMaterial color="#166534" /></mesh>
         <mesh position={[-1.2, -0.5, 0]} rotation={[0,0,Math.PI/3]}><cylinderGeometry args={[0.05, 0.05, 2]}/><meshPhysicalMaterial color="#166534" /></mesh>

         {/* O2 Gas Bubbling off the Grana due to Water Splitting (Photolysis) */}
         {/* Speed and Count driven completely by Light Intensity limit! */}
         {lightIntensity > 0 && (
           <Sparkles position={[-2, 1, 0]} count={Math.floor((lightIntensity/100)*60)} scale={[4, 4, 4]} size={3} speed={(lightIntensity/100)*5} color="#38bdf8" />
         )}

         <Html position={[-2, 1.8, 0]} center zIndexRange={[100, 0]}>
            <div style={{ background: 'rgba(2, 44, 34, 0.8)', color: '#4ade80', padding: '6px 12px', borderRadius: 6, fontFamily: '"DM Mono", monospace', fontSize: '0.7rem', whiteSpace: 'nowrap', border: '1px solid #22c55e', textTransform: 'uppercase', textAlign: 'center' }}>
               Light Reaction (Photolysis)<br/><span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '1rem', letterSpacing: 2 }}>H₂O → O₂ ⬆</span>
            </div>
         </Html>
      </group>

      {/* --- ATP / NADPH Transit Stream --- */}
      {/* Energy flowing laterally from Light (Grana) to Dark (Calvin Cycle) */}
      {photoRate > 0 && (
        <group position={[0, 0, 0]}>
          <Sparkles count={Math.floor(photoRate * 40)} scale={[2, 2, 2]} size={4} speed={photoRate * 8} color="#fcd34d" />
          <Html position={[0, 1.2, 0]} center zIndexRange={[100, 0]}>
             <div style={{ background: 'rgba(2, 44, 34, 0.8)', color: '#fcd34d', padding: '4px 8px', borderRadius: 4, fontFamily: '"DM Mono", monospace', fontSize: '0.65rem', whiteSpace: 'nowrap', border: '1px dashed #fcd34d', fontWeight: 'bold' }}>
                ATP + NADPH ➔
             </div>
          </Html>
        </group>
      )}

      {/* --- STROMA (Dark Reactions / Calvin Cycle Zone) --- */}
      <group position={[2.5, 0, 0]}>
         {/* The physical cycle machinery */}
         <group ref={calvinCycleRef}>
            <mesh rotation={[Math.PI/2, 0, 0]}>
               <torusGeometry args={[1.5, 0.05, 16, 64]} />
               <meshPhysicalMaterial color="#0ea5e9" transmission={0.5} roughness={0.2} clearcoat={1} />
            </mesh>
            {/* RuBisCO Enzyme nodes sitting on the cycle ring */}
            {[...Array(6)].map((_, i) => (
               <mesh key={i} position={[Math.cos(i*Math.PI/3)*1.5, 0, Math.sin(i*Math.PI/3)*1.5]}>
                 {/* Denatures (melts into a random blob and turns grey) if temp reaches limits */}
                 <dodecahedronGeometry args={[isDenatured ? 0.2 : 0.35, isDenatured ? 2 : 0]} />
                 <meshPhysicalMaterial color={isDenatured ? '#64748b' : '#8b5cf6'} roughness={0.8} />
               </mesh>
            ))}
         </group>

         {/* CO2 Entering the Cycle from the atmosphere */}
         {co2Level > 0 && (
            <Sparkles position={[1, 2, 0]} count={Math.floor((co2Level/100)*40)} scale={[2, 2, 2]} size={2.5} speed={-3} color="#a8a29e" />
         )}

         {/* Glucose (C6H12O6) Ejecting from the bottom! Driven by pure photoRate limitations! */}
         {photoRate > 0 && (
            <group position={[0, -2, 0]}>
              <Sparkles count={Math.floor(photoRate * 20)} scale={[1.5, 0.5, 1.5]} size={8} speed={-5} color="#f87171" opacity={0.9} noise={0} />
              <Html position={[0, -1.2, 0]} center zIndexRange={[100, 0]}>
                 <div style={{ background: 'rgba(2, 44, 34, 0.8)', color: '#f87171', padding: '4px 8px', borderRadius: 4, fontFamily: '"DM Mono", monospace', fontSize: '0.65rem', whiteSpace: 'nowrap', border: '1px solid #f87171', textTransform: 'uppercase', textAlign: 'center' }}>
                    Glucose Yield<br/><span style={{ fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: 2 }}>C₆H₁₂O₆ ⬇</span>
                 </div>
              </Html>
            </group>
         )}

         <Html position={[0, 2.8, 0]} center zIndexRange={[100, 0]}>
            <div style={{ background: 'rgba(2, 44, 34, 0.8)', color: '#a8a29e', padding: '6px 12px', borderRadius: 6, fontFamily: '"DM Mono", monospace', fontSize: '0.7rem', whiteSpace: 'nowrap', border: '1px solid #a8a29e', textTransform: 'uppercase', textAlign: 'center' }}>
               Dark Reaction<br/><span style={{ color: '#8b5cf6', fontWeight: 'bold', fontSize: '0.85rem', letterSpacing: 1 }}>Calvin Cycle</span>
            </div>
         </Html>
      </group>

      {/* A massive translucent Chloroplast shell loosely holding it all together */}
      <mesh position={[0, 0, 0]} scale={[1, 0.6, 0.8]}>
        <sphereGeometry args={[5.5, 32, 32]} />
        <meshPhysicalMaterial color="#022c22" transparent opacity={0.15} transmission={0.9} roughness={0.1} side={THREE.DoubleSide} depthWrite={false}/>
      </mesh>
    </group>
  )
}

export function PhotosynthesisSimulator() {
  const [light, setLight] = useState(50) // 0-100%
  const [co2, setCo2] = useState(50)     // 0-100%
  const [temp, setTemp] = useState(30)   // 0-60°C
  
  const controlsRef = useRef()

  // Calculate realtime physics
  const tempFactor = Math.max(0, 1 - Math.pow((temp - 35) / 20, 2))
  const rawRate = Math.min(light, co2) / 100
  const photoRate = rawRate * tempFactor

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="☀️" title="Photosynthesis & Limiting Factors" subtitle="Blackman's Law - Live Chloroplast Simulation" color="#22c55e" />

      {/* Advanced Interactive Control Panel */}
      <div style={{ background: '#0f172a', padding: '16px 24px', borderRadius: 12, border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
            
            {/* Light Slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 'bold' }}>Light Intensity</span>
                 <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{light}%</span>
               </div>
               <input type="range" min="0" max="100" value={light} onChange={(e) => setLight(parseInt(e.target.value))} style={{ accentColor: '#fbbf24' }} />
            </div>

            {/* CO2 Slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold' }}>CO₂ Concentration</span>
                 <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{co2}%</span>
               </div>
               <input type="range" min="0" max="100" value={co2} onChange={(e) => setCo2(parseInt(e.target.value))} style={{ accentColor: '#94a3b8' }} />
            </div>

            {/* Temp Slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <span style={{ fontSize: '0.8rem', color: temp > 45 || temp < 5 ? '#ef4444' : '#8b5cf6', fontWeight: 'bold' }}>Temperature</span>
                 <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{temp}°C</span>
               </div>
               <input type="range" min="0" max="60" value={temp} onChange={(e) => setTemp(parseInt(e.target.value))} style={{ accentColor: temp > 45 ? '#ef4444' : '#8b5cf6' }} />
            </div>
         </div>

         {/* Live Output Meter */}
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 8 }}>
           <span style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 'bold', width: 150 }}>LIVE G3P/GLUCOSE RATE:</span>
           <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#1e293b', overflow: 'hidden' }}>
             <div style={{ height: '100%', width: `${photoRate * 100}%`, background: '#22c55e', transition: 'width 0.2s', boxShadow: '0 0 10px #22c55e' }} />
           </div>
           <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 'bold' }}>{Math.round(photoRate * 100)}%</span>
         </div>
      </div>

      <div style={{
        position: 'relative', width: '100%', height: 450,
        background: 'radial-gradient(circle at right, #064e3b 0%, #020617 100%)',
        borderRadius: 16, border: `1px solid #22c55e80`, overflow: 'hidden',
        boxShadow: `inset 0 0 100px rgba(34, 197, 94, 0.1)`, transition: 'all 0.5s'
      }}>
        <Canvas camera={{ position: [0, 2, 12], fov: 45 }}>
          <ambientLight intensity={0.4} />
          
          <Suspense fallback={<Html center><div style={{color: '#22c55e', fontFamily:'"DM Mono"', letterSpacing: 2}}>INITIALIZING CHLOROPLAST...</div></Html>}>
            <Environment preset="forest" resolution={256} />
            
            <Float speed={1} rotationIntensity={0.2} floatIntensity={0.4}>
               <ChloroplastSystem lightIntensity={light} co2Level={co2} temperature={temp} />
            </Float>

            <ContactShadows position={[0, -4, 0]} opacity={0.6} scale={20} blur={2.5} far={8} color="#064e3b" />
            <CameraControls ref={controlsRef} minDistance={4} maxDistance={20} />
          </Suspense>
        </Canvas>

        {/* Cinematic Labels */}
        <div style={{ position: 'absolute', top: 16, left: 16, pointerEvents: 'none' }}>
           <div style={{ color: '#22c55e', fontFamily: '"DM Mono", monospace', fontSize: '0.75rem', letterSpacing: '2px', textShadow: '0 2px 4px rgba(0,0,0,1)' }}>
              LEFT: LIGHT REACTIONS (GRANA)
              <br/>
              RIGHT: DARK REACTIONS (STROMA)
           </div>
        </div>
      </div>

      <Callout color="#22c55e">
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
           <div style={{ flex: 1 }}>
              <strong style={{ color: '#22c55e', fontSize: '1.2rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Blackman's Law of Limiting Factors</strong>
              <p style={{ marginTop: 8, lineHeight: 1.7, fontSize: '0.95rem' }}>
                Photosynthesis is limited by the scarcest resource. Notice that sliding <strong>Light</strong> to 100% does absolutely nothing to the final glucose output if <strong>CO₂</strong> is blocked at 10%. Additionally, the critical RuBisCO enzyme in the Calvin Cycle denotes an optimal temperature curve. If you slide the <strong>Temperature</strong> past 45°C, the 3D purple enzymes will physically denature (melt grey), instantly shutting down the dark reaction regardless of Light or CO₂ abundance!
              </p>
           </div>
        </div>
      </Callout>
    </div>
  )
}
