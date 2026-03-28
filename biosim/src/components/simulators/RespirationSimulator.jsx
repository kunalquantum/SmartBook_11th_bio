import { useState, useRef, useEffect, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Environment, CameraControls, ContactShadows, Sparkles, Float } from '@react-three/drei'
import * as THREE from 'three'
import { SimHeader, Callout, Btn } from '../ui'

function MitochondrionSystem({ glucoseLevel, oxygenLevel, temperature }) {
  // --- Limiting Factor Math (Aerobic vs Anaerobic) ---
  const tempFactor = Math.max(0, 1 - Math.pow((temperature - 37) / 20, 2)) // Optimal 37C
  
  // Glycolysis (Cytoplasm) - DOES NOT REQUIRE OXYGEN
  const glycolysisRate = (glucoseLevel / 100) * tempFactor // Produces net 2 ATP
  
  // Krebs Cycle & ETC - STRICTLY REQUIRES OXYGEN
  const aerobicRate = Math.min((glucoseLevel / 100), (oxygenLevel / 100)) * tempFactor // Produces ~34 ATP

  const isDenatured = temperature > 50 || temperature < 5

  const atpSynthaseRef = useRef()
  const krebsCycleRef = useRef()
  const innerMembraneRef = useRef()

  useFrame((state, delta) => {
    // Krebs Cycle rotation (driven solely by aerobic rate limit)
    if (krebsCycleRef.current && !isDenatured) {
       krebsCycleRef.current.rotation.y += (aerobicRate * 4) * delta
    }
    
    // Massive ATP Synthase Rotor spinning (RPM driven by oxygen/aerobic rate)
    if (atpSynthaseRef.current && !isDenatured) {
       atpSynthaseRef.current.rotation.z += (aerobicRate * 25) * delta
    }

    // Inner Membrane Phosphorylation Glow (ETC charging up the voltage gradient!)
    if (innerMembraneRef.current) {
       innerMembraneRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
           innerMembraneRef.current.material.emissiveIntensity,
           aerobicRate * 2.5,
           5 * delta
       )
    }
  })

  return (
    <group position={[0, -0.5, 0]}>
      {/* ========================================== */}
      {/* 1. CYTOPLASM (Glycolysis Zone - Outside Mitochondrion) */}
      {/* ========================================== */}
      <group position={[-4, 0, 0]}>
         {/* Incoming Glucose converting into Pyruvate */}
         {glycolysisRate > 0 && (
            <group>
              <Sparkles position={[-1, 1, 0]} count={Math.floor(glycolysisRate * 10)} scale={[1, 1, 1]} size={12} speed={glycolysisRate * -3} color="#f87171" opacity={0.8} />
              {/* Splitting into Pyruvate heading toward Mitochondria */}
              <Sparkles position={[1, 0, 0]} count={Math.floor(glycolysisRate * 20)} scale={[1.5, 1, 1.5]} size={6} speed={glycolysisRate * 4} color="#fb923c" opacity={0.8} />
              {/* Very tiny ATP yield (Net 2 ATP) */}
              <Sparkles position={[0, -1.8, 0]} count={10} scale={[1, 0.5, 1]} size={4} speed={-5} color="#fcd34d" />
            </group>
         )}
         
         <Html position={[0, 2.5, 0]} center zIndexRange={[100, 0]}>
            <div style={{ background: 'rgba(67, 20, 7, 0.8)', color: '#fb923c', padding: '6px 12px', borderRadius: 6, fontFamily: '"DM Mono", monospace', fontSize: '0.7rem', whiteSpace: 'nowrap', border: '1px solid #fb923c', textTransform: 'uppercase', textAlign: 'center' }}>
               Glycolysis (Anaerobic)<br/><span style={{ color: '#f87171', fontWeight: 'bold' }}>Glucose → Pyruvate</span>
            </div>
         </Html>
      </group>

      {/* ========================================== */}
      {/* MITOCHONDRION BOUNDARY                       */}
      {/* ========================================== */}
      <mesh scale={[3.4, 2.2, 2.2]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial color="#9a3412" transparent opacity={0.25} transmission={0.9} roughness={0.3} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* ========================================== */}
      {/* 2. MATRIX (Krebs/Citric Acid Cycle Zone)     */}
      {/* ========================================== */}
      <group position={[-1.2, 0, 0]}>
         <group ref={krebsCycleRef}>
            {/* The Cycle Ring */}
            <mesh rotation={[Math.PI/2, 0, 0]}>
               <torusGeometry args={[1.0, 0.05, 16, 64]} />
               <meshPhysicalMaterial color="#c2410c" transmission={0.5} roughness={0.2} clearcoat={1} />
            </mesh>
            {/* Krebs Enzymes */}
            {[...Array(5)].map((_, i) => (
               <mesh key={i} position={[Math.cos(i*Math.PI/2.5)*1.0, 0, Math.sin(i*Math.PI/2.5)*1.0]}>
                 <dodecahedronGeometry args={[isDenatured ? 0.15 : 0.25, isDenatured ? 2 : 0]} />
                 <meshPhysicalMaterial color={isDenatured ? '#64748b' : '#ea580c'} roughness={0.8} />
               </mesh>
            ))}
         </group>

         {/* CO2 Ejecting from Krebs Cycle as Waste! */}
         {aerobicRate > 0 && (
            <Sparkles position={[0, 1.5, 0]} count={Math.floor(aerobicRate * 30)} scale={[1, 1, 1]} size={5} speed={6} color="#94a3b8" />
         )}
         
         {/* NADH/FADH2 High Energy Electrons travelling horizontally to the Cristae! */}
         {aerobicRate > 0 && (
            <Sparkles position={[1.2, 0, 0]} count={Math.floor(aerobicRate * 60)} scale={[2, 2, 2]} size={3} speed={aerobicRate * 12} color="#38bdf8" />
         )}

         <Html position={[0, 2.2, 0]} center zIndexRange={[100, 0]}>
            <div style={{ background: 'rgba(67, 20, 7, 0.8)', color: '#ea580c', padding: '6px 12px', borderRadius: 6, fontFamily: '"DM Mono", monospace', fontSize: '0.7rem', whiteSpace: 'nowrap', border: '1px solid #ea580c', textTransform: 'uppercase', textAlign: 'center' }}>
               Krebs Cycle<br/><span style={{ color: '#94a3b8', fontWeight: 'bold' }}>CO₂ Byproduct ⬆</span>
            </div>
         </Html>
      </group>

      {/* ========================================== */}
      {/* 3. CRISTAE (Electron Transport Chain Zone)   */}
      {/* ========================================== */}
      <group position={[1.8, 0, 0]}>
         {/* Inner Folded Membrane (Cristae) */}
         <mesh ref={innerMembraneRef} rotation={[0,0,Math.PI/2]}>
            <cylinderGeometry args={[1.5, 1.5, 2.0, 32, 16, false]} />
            <meshPhysicalMaterial color="#7c2d12" emissive="#f97316" emissiveIntensity={0} wireframe={true} />
         </mesh>

         {/* ATP Synthase Nanomotor embedded in membrane! */}
         <group ref={atpSynthaseRef} position={[-1.0, 0, 0]} scale={[1.5, 1.5, 1.5]}>
            {/* Rotor stalk sitting in the membrane */}
            <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.08, 0.08, 0.8]} /><meshPhysicalMaterial color="#eab308" /></mesh>
            {/* Massive F1 Catalytic Knob spinning! */}
            <mesh position={[-0.4, 0, 0]} rotation={[0,0,Math.PI/2]}><coneGeometry args={[0.3, 0.4, 8]} /><meshPhysicalMaterial color="#ca8a04" /></mesh>
         </group>

         {/* MASSIVE ATP PRODUCTION YIELD (Chemiosmosis) */}
         {aerobicRate > 0 && (
           <group>
             {/* Oxygen combining with H+ to form Water (H2O) */}
             <Sparkles position={[0, -1.8, 0]} count={Math.floor(aerobicRate * 25)} scale={[1, 0.5, 1]} size={4} speed={-5} color="#3b82f6" opacity={0.6} />
             
             {/* The 34 ATP Payload! Highly intense yellow geyser blasting inward! */}
             <Sparkles position={[-1.5, 0, 0]} count={Math.floor(aerobicRate * 120)} scale={[1, 3, 3]} size={6} speed={aerobicRate * -10} color="#fcd34d" />
           </group>
         )}

         <Html position={[0, 2.8, 0]} center zIndexRange={[100, 0]}>
            <div style={{ background: 'rgba(67, 20, 7, 0.8)', color: '#fcd34d', padding: '6px 12px', borderRadius: 6, fontFamily: '"DM Mono", monospace', fontSize: '0.7rem', whiteSpace: 'nowrap', border: '1px solid #fcd34d', textTransform: 'uppercase', textAlign: 'center' }}>
               Electron Transport Chain<br/><span style={{ fontWeight: 'bold', fontSize: '1rem', letterSpacing: 1 }}>{Math.floor(aerobicRate*34)} ATP YIELD ⬅</span>
            </div>
         </Html>
      </group>
    </group>
  )
}

export function RespirationSimulator() {
  const [glucose, setGlucose] = useState(50) // 0-100%
  const [oxygen, setOxygen] = useState(50)   // 0-100%
  const [temp, setTemp] = useState(37)       // 0-60°C
  
  const controlsRef = useRef()

  // Physics calculation for UI readout
  const tempFactor = Math.max(0, 1 - Math.pow((temp - 37) / 20, 2))
  const aerobicRate = Math.min((glucose / 100), (oxygen / 100)) * tempFactor
  const glycolysisRate = (glucose / 100) * tempFactor

  // Output Math (Glycolysis net 2, Aerobic net 34 = Total 36 ATP)
  const totalAtp = Math.floor((glycolysisRate * 2) + (aerobicRate * 34))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="⚡" title="Cellular Respiration" subtitle="Glycolysis & The Electron Transport Chain" color="#ea580c" />

      {/* Engine Control Panel */}
      <div style={{ background: '#0f172a', padding: '16px 24px', borderRadius: 12, border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <span style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: 'bold' }}>Glucose Substrate (Fuel)</span>
                 <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{glucose}%</span>
               </div>
               <input type="range" min="0" max="100" value={glucose} onChange={(e) => setGlucose(parseInt(e.target.value))} style={{ accentColor: '#f87171' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 'bold' }}>Oxygen Levels (O₂)</span>
                 <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{oxygen}%</span>
               </div>
               <input type="range" min="0" max="100" value={oxygen} onChange={(e) => setOxygen(parseInt(e.target.value))} style={{ accentColor: '#38bdf8' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <span style={{ fontSize: '0.8rem', color: temp > 50 || temp < 5 ? '#ef4444' : '#ea580c', fontWeight: 'bold' }}>Temperature</span>
                 <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{temp}°C</span>
               </div>
               <input type="range" min="0" max="60" value={temp} onChange={(e) => setTemp(parseInt(e.target.value))} style={{ accentColor: temp > 50 ? '#ef4444' : '#ea580c' }} />
            </div>
         </div>

         {/* ATP Payload Meter */}
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 8 }}>
           <span style={{ fontSize: '0.8rem', color: '#fcd34d', fontWeight: 'bold', width: 150 }}>LIVE ATP PRODUCTION:</span>
           <div style={{ flex: 1, height: 12, borderRadius: 6, background: '#1e293b', overflow: 'hidden' }}>
             <div style={{ height: '100%', width: `${(totalAtp / 36) * 100}%`, background: '#fcd34d', transition: 'width 0.2s', boxShadow: '0 0 15px #fcd34d' }} />
           </div>
           <span style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 'bold', minWidth: 70 }}>{totalAtp} ATP</span>
         </div>
      </div>

      <div style={{
        position: 'relative', width: '100%', height: 450,
        background: 'radial-gradient(ellipse at center, #431407 0%, #020617 100%)',
        borderRadius: 16, border: `1px solid #ea580c80`, overflow: 'hidden',
        boxShadow: `inset 0 0 100px rgba(234, 88, 12, 0.1)`, transition: 'all 0.5s'
      }}>
        <Canvas camera={{ position: [0, 1.5, 12], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 15, 10]} angle={0.5} intensity={1} color="#fff" />
          
          <Suspense fallback={<Html center><div style={{color: '#ea580c', fontFamily:'"DM Mono"', letterSpacing: 2}}>CLONING MITOCHONDRION...</div></Html>}>
            <Environment preset="city" resolution={256} />
            
            <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.5}>
               <MitochondrionSystem glucoseLevel={glucose} oxygenLevel={oxygen} temperature={temp} />
            </Float>

            <ContactShadows position={[0, -4, 0]} opacity={0.6} scale={20} blur={2.5} far={8} color="#431407" />
            <CameraControls ref={controlsRef} minDistance={4} maxDistance={20} />
          </Suspense>
        </Canvas>
        
        <div style={{ position: 'absolute', top: 16, left: 16, pointerEvents: 'none' }}>
           <div style={{ color: '#ea580c', fontFamily: '"DM Mono", monospace', fontSize: '0.75rem', letterSpacing: '2px', textShadow: '0 2px 4px rgba(0,0,0,1)' }}>
              LEFT: CYTOPLASM (GLYCOLYSIS)
              <br/>
              RIGHT: INNER MEMBRANE (CRISTAE)
           </div>
        </div>
      </div>

      <Callout color="#ea580c">
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
           <div style={{ flex: 1 }}>
              <strong style={{ color: '#ea580c', fontSize: '1.2rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Aerobic vs Anaerobic Respiration</strong>
              <p style={{ marginTop: 8, lineHeight: 1.7, fontSize: '0.95rem' }}>
                Try sliding <strong>Oxygen</strong> down to 0% while keeping Glucose high. You will see the Krebs Cycle and Electron Transport Chain completely die, and the massive 34 ATP payload halts because oxygen is the final electron acceptor. However, notice that <strong>Glycolysis</strong> (in the Cytoplasm entirely outside the mitochondrion) continues running smoothly, breaking down Glucose into Pyruvate and fermenting a meager 2 ATP!
              </p>
           </div>
        </div>
      </Callout>
    </div>
  )
}
