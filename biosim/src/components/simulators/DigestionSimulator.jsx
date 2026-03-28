import { useState, useRef, useEffect, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Environment, CameraControls, ContactShadows, Sparkles, Float, Trail } from '@react-three/drei'
import * as THREE from 'three'
import { SimHeader, Callout, Btn } from '../ui'

const MACROS = [
  { id: 'protein', label: 'Protein (Meat)', color: '#8b5cf6', desc: 'Requires highly acidic Stomach (pH 1.5 - 2.5) for Pepsin to break it down into Amino Acids.' },
  { id: 'carb', label: 'Carbohydrate (Bread)', color: '#f87171', desc: 'Digested primarily by Salivary Amylase and Pancreatic juices in the Duodenum into Glucose.' },
  { id: 'fat', label: 'Lipids (Fats/Oils)', color: '#eab308', desc: 'Requires mechanical emulsification by Liver Bile in the Duodenum before Lipase can break it into Fatty Acids.' }
]

function AlimentaryCanal({ activeFood, stomachPh, bileLevel, telemetryRef, onComplete }) {
  const foodSystemRef = useRef()
  const solidRef = useRef()
  const fragmentsRef = useRef()
  const stomachGlowRef = useRef()

  // Track the continuous path using completely unlinked Refs for ultra high performance!
  const foodProgress = useRef(0)

  // Initialize movement when activeFood changes!
  useEffect(() => {
     if (activeFood) {
        foodProgress.current = 0.001
     }
  }, [activeFood])

  // --- ANATOMICAL PATH GENERATION ---
  const colonCurve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.2, -2.6, 0),
    new THREE.Vector3(-2.2,  1.0, 0),
    new THREE.Vector3( 2.2,  1.4, -0.5),
    new THREE.Vector3( 2.2, -2.5, 0),
    new THREE.Vector3( 0.8, -3.8, -0.2),
    new THREE.Vector3( 0.8, -4.8, 0),
  ]), [])

  const smallIntestinePoints = useMemo(() => {
    const pts = []
    pts.push(new THREE.Vector3(1.2, 1.8, -0.4))   // Stomach exit
    pts.push(new THREE.Vector3(0.5, 1.4, 0))      // Duodenum Curve
    pts.push(new THREE.Vector3(-0.8, 1.4, 0))     // Duodenum Curve End
    // Tangled Mass filling the central colon frame window
    for (let i = 1; i <= 35; i++) {
        const x = Math.sin(i * 2.1) * 1.6
        const y = Math.cos(i * 1.7) * 1.6 - 0.5
        const z = Math.sin(i * 3.4) * 0.5
        pts.push(new THREE.Vector3(x, y, z))
    }
    pts.push(new THREE.Vector3(-2.2, -2.6, 0)) // Connect Ileum directly into Cecum
    return pts
  }, [])
  const smallIntestineCurve = useMemo(() => new THREE.CatmullRomCurve3(smallIntestinePoints, false), [smallIntestinePoints])

  const alimentaryTracker = useMemo(() => {
    const prePts = [
        new THREE.Vector3(0, 5, -0.2),      // Mouth
        new THREE.Vector3(0, 3.5, -0.2),    // Esophagus
        new THREE.Vector3(0.6, 2.8, -0.2),  // Upper Stomach
        new THREE.Vector3(1.6, 2.2, -0.2),  // Belly of Stomach
    ]
    return new THREE.CatmullRomCurve3([...prePts, ...smallIntestinePoints], false)
  }, [smallIntestinePoints])

  // --- BIOCHEMISTRY PHYSICS MAP ---
  const pepsinActive = stomachPh > 1.0 && stomachPh < 3.5
  const isProtein = activeFood === 'protein'
  const isCarb = activeFood === 'carb'
  const isFat = activeFood === 'fat'
  const bileActive = bileLevel > 50

  const fModel = MACROS.find(m => m.id === activeFood)
  const foodColor = fModel ? fModel.color : '#ffffff'

  // GOLD STANDARD: TELEMETRY UI ENGINE (Zero React Renders)
  const generateTelemetry = (p) => {
     let html = ''
     if (p < 0.08) {
         html = `
            <div style="color: #60a5fa; font-size: 1.1rem; font-weight: bold; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">[1] ESOPHAGUS (INGESTION)</div>
            <div style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; display: flex; flex-direction: column; gap: 8px;">
               <div style="display: flex; justify-content: space-between;"><span>Nutrient:</span> <strong style="color: ${foodColor}">${fModel.label}</strong></div>
               <div style="display: flex; justify-content: space-between;"><span>Geometry:</span> <strong>Solid Macromolecule</strong></div>
               <div style="display: flex; justify-content: space-between;"><span>Action:</span> <strong>Mechanical Peristalsis</strong></div>
            </div>
            <div style="margin-top: 16px; width: 100%; height: 4px; background: #1e293b; border-radius: 2px; overflow: hidden;"><div style="width: 25%; height: 100%; background: #60a5fa;"></div></div>
         `
     } else if (p >= 0.08 && p < 0.16) {
         html = `
            <div style="color: #ef4444; font-size: 1.1rem; font-weight: bold; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">[2] STOMACH (GASTRIC DIGESTION)</div>
            <div style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; display: flex; flex-direction: column; gap: 8px;">
               <div style="display: flex; justify-content: space-between;"><span>Gastric pH:</span> <strong style="color: ${pepsinActive ? '#ef4444' : '#94a3b8'}">${stomachPh.toFixed(1)} ${pepsinActive ? '(Optimal)' : '(Weak)'}</strong></div>
               <div style="display: flex; justify-content: space-between;"><span>Pepsin Enzyme:</span> <strong>${pepsinActive ? 'ACTIVE' : 'DENATURED'}</strong></div>
               <div style="display: flex; justify-content: space-between;"><span>Geometry:</span> <strong style="color: ${isProtein && pepsinActive ? '#a855f7' : foodColor}">${isProtein && pepsinActive ? 'Splitting into Peptides (Shattering)' : 'Unchanged (Solid)'}</strong></div>
            </div>
            <div style="margin-top: 16px; padding: 8px; background: ${isProtein && pepsinActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color: ${isProtein && pepsinActive ? '#4ade80' : '#f87171'}; border-radius: 6px; font-size: 0.8rem;">
               ${isProtein && pepsinActive ? 'SUCCESS: The acidic environment perfectly activated Pepsin. The chunk is physically shattering apart into smaller peptide chains!' : isProtein ? 'FAILURE: The stomach pH is too neutral. Pepsin is destroyed instantly. The chunk passes through completely rigid.' : 'INFO: ' + fModel.label + ' does not react heavily to Stomach Acid. Waiting for Duodenum.'}
            </div>
         `
     } else if (p >= 0.16 && p < 0.25) {
         html = `
            <div style="color: #fcd34d; font-size: 1.1rem; font-weight: bold; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">[3] DUODENUM (CHEM. BREAKDOWN)</div>
            <div style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; display: flex; flex-direction: column; gap: 8px;">
               <div style="display: flex; justify-content: space-between;"><span>Liver Bile Secretion:</span> <strong style="color: ${bileActive ? '#22c55e' : '#f87171'}">${bileLevel}%</strong></div>
               ${isFat ? `<div style="display: flex; justify-content: space-between;"><span>Emulsification:</span> <strong>${bileActive ? 'SUCCESS' : 'FAILED'}</strong></div>` : ''}
               <div style="display: flex; justify-content: space-between;"><span>Pancreatic Enzymes:</span> <strong style="color: #fbbf24">Injected</strong></div>
               <div style="display: flex; justify-content: space-between;"><span>Geometry:</span> <strong style="color: #38bdf8">Dissolving into Monomers</strong></div>
            </div>
            <div style="margin-top: 16px; padding: 8px; background: ${((isFat && bileActive) || isCarb || (isProtein && pepsinActive)) ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color: ${((isFat && bileActive) || isCarb || (isProtein && pepsinActive)) ? '#4ade80' : '#f87171'}; border-radius: 6px; font-size: 0.8rem;">
               ${isFat && bileActive ? 'SUCCESS: Green Bile destroyed the lipid bonds! Pancreatic Lipase melts the fat into Fatty Acids!' : isFat ? 'FAILURE: Zero Bile detected! The fat globs clump together and resist pancreatic enzymes!' : isCarb ? 'SUCCESS: Pancreatic Amylase obliterates the complex starches into simple Glucose monomers!' : 'INFO: Pancreatic juices neutralizing the stomach acid and cleaving remaining bonds.'}
            </div>
         `
     } else if (p >= 0.25) {
         html = `
            <div style="color: #a78bfa; font-size: 1.1rem; font-weight: bold; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">[4] JEJUNUM/ILEUM (ABSORPTION)</div>
            <div style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; display: flex; flex-direction: column; gap: 8px;">
               <div style="display: flex; justify-content: space-between;"><span>Intestinal Villi:</span> <strong style="color: #22c55e">Extracting Nutrients</strong></div>
               <div style="display: flex; justify-content: space-between;"><span>Bloodstream Entry:</span> <strong style="color: #fcd34d">Maximum Output</strong></div>
               <div style="display: flex; justify-content: space-between;"><span>Geometry:</span> <strong style="color: #fcd34d">Pure ATP Energy Yield</strong></div>
            </div>
            <div style="margin-top: 16px; padding: 8px; background: rgba(252, 211, 77, 0.1); color: #fcd34d; border-radius: 6px; font-size: 0.8rem; text-align: center; letter-spacing: 1px;">
               >>> YIELDING MAXIMUM ENERGY TO BLOODSTREAM <<<
            </div>
         `
     }
     return html
  }

  useFrame((state, delta) => {
    // 1. Stomach Glow (Brighter Red matching stomach acidity directly)
    if (stomachGlowRef.current) {
        stomachGlowRef.current.emissiveIntensity = THREE.MathUtils.lerp(
            stomachGlowRef.current.emissiveIntensity,
            (7.0 - stomachPh) * 0.4,
            5 * delta
        )
    }

    // 2. Ultra-high performance biological pipeline processing
    const p = foodProgress.current
    
    if (foodSystemRef.current && p > 0) {
       let speed = 0.08
       
       if (p < 0.08) {
          // Esophagus
          speed = 0.05
          solidRef.current.visible = true
          fragmentsRef.current.visible = false
       } else if (p >= 0.08 && p < 0.16) {
          // Stomach Churning Mode
          speed = 0.015
          solidRef.current.rotation.x += 10 * delta
          fragmentsRef.current.rotation.y += 10 * delta
          
          if (isProtein && pepsinActive) {
             // SHATTERING EFFECT! Replace the single solid geometry with numerous peptide fragment spheres!
             solidRef.current.visible = false
             fragmentsRef.current.visible = true
             // Shrink fragments slowly as they dissolve
             fragmentsRef.current.scale.setScalar(THREE.MathUtils.lerp(fragmentsRef.current.scale.x, 0.5, 1.0 * delta))
          }
       } else if (p >= 0.16 && p < 0.25) {
          // Duodenum Enzyme Processing
          speed = 0.04
          if ((isFat && bileActive) || isCarb || (isProtein && pepsinActive)) {
             // Fully obliterated into purely Sparkles (Monomers)!
             solidRef.current.visible = false
             fragmentsRef.current.visible = false
          }
       } else if (p >= 0.25) {
          // Jejunum Villi Absorption
          speed = 0.08
          // Absorbed geometry dissolves completely into nothing as it enters the blood!
          solidRef.current.scale.setScalar(THREE.MathUtils.lerp(solidRef.current.scale.x, 0, 2.0 * delta))
          fragmentsRef.current.scale.setScalar(THREE.MathUtils.lerp(fragmentsRef.current.scale.x, 0, 2.0 * delta))
       }

       // Core Loop Advance
       foodProgress.current += speed * delta

       // Calculate precise 3D Space Coordinates using the Master CatmullRomCurve3 Spline!
       const tPos = alimentaryTracker.getPointAt(Math.min(foodProgress.current, 0.99))
       foodSystemRef.current.position.copy(tPos)

       // Instantly update the HTML DOM telemetry box WITHOUT dropping React frames!
       if (telemetryRef.current) {
          telemetryRef.current.innerHTML = generateTelemetry(foodProgress.current)
       }

       // Reset when completing the cycle
       if (foodProgress.current >= 0.99) {
          foodProgress.current = 0
          solidRef.current.scale.setScalar(1)
          fragmentsRef.current.scale.setScalar(1)
          onComplete() // Allow user to click buttons again
          if (telemetryRef.current) telemetryRef.current.innerHTML = '<div style="color: #94a3b8; font-family: monospace;">[ AWAITING INGESTION ]</div>'
       }
    }
  })

  // State calculations for render mapping
  const activeP = activeFood ? Math.max(0.001, foodProgress.current) : 0

  return (
    <group position={[0,-1,0]}>
      
      {/* 1. LIVER */}
      <mesh position={[-0.8, 3.4, 0.1]} scale={[1.8, 1.2, 0.8]} rotation={[0, 0, 0.1]}>
         <sphereGeometry args={[1.5, 32, 32]} />
         <meshPhysicalMaterial color="#7c2d12" roughness={0.5} clearcoat={1} emissive="#451a03" emissiveIntensity={0.5} />
      </mesh>
      
      {/* 2. GALLBLADDER */}
      <mesh position={[-0.1, 2.2, 0.6]} rotation={[0, 0, -0.6]}>
         <capsuleGeometry args={[0.2, 0.5, 16, 16]} />
         <meshPhysicalMaterial color="#16a34a" roughness={0.2} clearcoat={1} />
      </mesh>

      {bileLevel > 0 && <Sparkles position={[0.2, 1.5, 0]} count={Math.floor(bileLevel/4)} scale={[0.5,0.5,0.5]} size={4} speed={4} color="#4ade80" />}

      {/* 3. STOMACH */}
      <group position={[1.4, 2.4, -0.2]}>
         <mesh scale={[1.2, 0.8, 0.8]} rotation={[0, 0, -0.6]}>
            <sphereGeometry args={[1.2, 32, 32]} />
            <meshPhysicalMaterial ref={stomachGlowRef} color="#f472b6" emissive="#ef4444" emissiveIntensity={0} transparent opacity={0.7} roughness={0.3} depthWrite={false}/>
         </mesh>
      </group>

      {/* 4. PANCREAS */}
      <mesh position={[0.1, 1.4, -0.3]} scale={[1.8, 0.4, 0.3]} rotation={[0, 0, 0.1]}>
         <sphereGeometry args={[1, 16, 16]} />
         <meshPhysicalMaterial color="#fbbf24" roughness={0.8} />
      </mesh>
      <Html position={[0.1, 1.4, -0.2]} center zIndexRange={[100,0]}>
          <div style={{ color: '#fbbf24', fontFamily: '"DM Mono", monospace', fontSize: '0.65rem', whiteSpace: 'nowrap', textTransform: 'uppercase', textShadow: '0 1px 4px #000' }}>Pancreas</div>
      </Html>

      {/* 5. ESOPHAGUS */}
      <mesh position={[0, 4.0, -0.2]}>
         <cylinderGeometry args={[0.2, 0.2, 3]} />
         <meshPhysicalMaterial color="#fda4af" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* 6. COLON (Large Intestine Frame) */}
      <mesh>
         <tubeGeometry args={[colonCurve, 128, 0.55, 32, false]} />
         <meshPhysicalMaterial color="#fb7185" roughness={0.8} clearcoat={0.2} />
      </mesh>
      <mesh position={[-2.2, -3.2, 0]} rotation={[0,0,-0.2]}><capsuleGeometry args={[0.1, 0.6, 16]}/><meshPhysicalMaterial color="#fb7185" roughness={0.8} /></mesh>

      {/* 7. SMALL INTESTINES (Coiled Frame) */}
      <mesh>
         <tubeGeometry args={[smallIntestineCurve, 256, 0.25, 16, false]} />
         <meshPhysicalMaterial color="#fca5a5" transparent opacity={0.85} roughness={0.4} />
      </mesh>


      {/* --- THE FOOD PAYLOAD SYSTEM --- */}
      {activeFood && (
        <group ref={foodSystemRef} position={[0, 5, -0.2]}>
          
          {/* A. The Emissive Glowing Trail defining the route */}
          <Trail width={1.8} length={12} color={foodColor} attenuation={(t) => t * t}>
             <group>
                {/* STATE 1: Solid Macromolecule Chunk */}
                <mesh ref={solidRef}>
                  {isProtein && <dodecahedronGeometry args={[0.35, 0]} />}
                  {isCarb && <boxGeometry args={[0.35, 0.35, 0.35]} />}
                  {isFat && <sphereGeometry args={[0.3, 32, 32]} />}
                  <meshPhysicalMaterial color={foodColor} emissive={foodColor} emissiveIntensity={2.5} roughness={0} clearcoat={1} toneMapped={false} />
                </mesh>

                {/* STATE 2: Shattered Peptide/Chyme Fragments (Visible only when structurally broken!) */}
                <group ref={fragmentsRef} visible={false}>
                   {[...Array(6)].map((_, i) => (
                      <mesh key={i} position={[Math.cos(i*Math.PI/3)*0.2, Math.sin(i*Math.PI/3)*0.2, 0]}>
                         <sphereGeometry args={[0.12]} />
                         <meshPhysicalMaterial color={foodColor} emissive={foodColor} emissiveIntensity={2.5} toneMapped={false} />
                      </mesh>
                   ))}
                </group>
             </group>
          </Trail>

          {/* Dynamic internal light simulating an Endoscope mapping the stomach walls! */}
          <pointLight distance={6} intensity={3.5} color={foodColor} decay={2} castShadow />

          {/* Violent Biochemical Particle Emators */}
          {/* Phase: Acid Bath */}
          {activeP >= 0.08 && activeP < 0.16 && (
             <Sparkles position={[0, 0, 0]} count={60} scale={[2,2,2]} size={6} speed={12} color={foodColor} />
          )}

          {/* Phase: Emulsification Blast! */}
          {activeP >= 0.16 && activeP < 0.25 && (
             <group>
               <Sparkles position={[0, 0, 0]} count={150} scale={[2,2,2]} size={5} speed={18} color="#ffffff" opacity={0.8} />
               {/* Massive Pancreas/Bile splash */}
               <Sparkles position={[-0.5, 0, 0]} count={80} scale={[1, 1, 1]} size={4} speed={20} color="#fbbf24" />
             </group>
          )}

          {/* Phase: Pure ATP Energy Yield getting sucked into the bloodstream! */}
          {activeP >= 0.25 && (
             <Sparkles position={[0, 0, 0]} count={150} scale={[4,4,4]} size={8} speed={5} color="#fcd34d" emissive="#fcd34d" emissiveIntensity={2} />
          )}

        </group>
      )}
    </group>
  )
}

export function DigestionSimulator() {
  const [activeFood, setActiveFood] = useState(null)
  const [stomachPh, setStomachPh] = useState(2.0)
  const [bile, setBile] = useState(80) 
  
  const controlsRef = useRef()
  const telemetryRef = useRef() // The DOM node for ultra-high performance streaming telemetry!

  const handleIngest = (id) => {
    setActiveFood(id)
    if (controlsRef.current) {
        // Exquisite cinematic tracking curve matching the anatomical speeds
        controlsRef.current.setLookAt(0, 3, 10, 0, 3, 0, true) // Esophagus
        setTimeout(() => controlsRef.current.setLookAt(1.4, 1.5, 7, 0.8, 1.5, 0, true), 1500) // Stomach drop
        setTimeout(() => controlsRef.current.setLookAt(-0.5, 0.5, 6, 0.2, 0.5, 0, true), 6000)   // Duodenum Splatter zone
        setTimeout(() => controlsRef.current.setLookAt(0, -1, 4, 0, -1, 0, true), 8000)     // Final ATP sequence
        setTimeout(() => controlsRef.current.setLookAt(0, 0, 11, 0, 0, 0, true), 12000)      // Reset
    }
  }

  const pepsinActive = stomachPh > 1.0 && stomachPh < 3.5

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="✨" title="Macronutrient Digestion Workflow" subtitle="Gold Standard Cinematic Geometry & Live Telemetry" color="#8b5cf6" />

      {/* Massive Split Panel View: 2/3 Canvas, 1/3 Biochemistry Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1rem', height: '600px' }}>
         
         {/* THE CINEMATIC CANVAS */}
         <div style={{
           position: 'relative', width: '100%', height: '100%',
           background: 'radial-gradient(circle at center, #1e1b4b 0%, #020617 100%)',
           borderRadius: 16, border: `1px solid #47556980`, overflow: 'hidden',
           boxShadow: `inset 0 0 100px #312e81`
         }}>
           <Canvas camera={{ position: [0, 0, 11], fov: 45 }}>
             <ambientLight intensity={0.5} />
             <spotLight position={[10, 15, 10]} angle={0.5} intensity={1} color="#fff" />
             <pointLight position={[1.4, 2.4, 2]} intensity={0.6} color="#ef4444" /> {/* Core Stomach Light */}
             
             <Suspense fallback={<Html center><div style={{color: '#8b5cf6', fontFamily:'"DM Mono"', letterSpacing: 2}}>CLONING ALIMENTARY TRACT...</div></Html>}>
               <Environment preset="city" resolution={256} />
               <Float speed={1} rotationIntensity={0.15} floatIntensity={0.3}>
                  <AlimentaryCanal activeFood={activeFood} stomachPh={stomachPh} bileLevel={bile} telemetryRef={telemetryRef} onComplete={() => setActiveFood(null)} />
               </Float>
               <ContactShadows position={[0, -6, 0]} opacity={0.5} scale={20} blur={2.5} far={8} color="#000" />
               <CameraControls ref={controlsRef} minDistance={2} maxDistance={20} />
             </Suspense>
           </Canvas>
         </div>

         {/* THE BIO-TELEMETRY DASHBOARD */}
         <div style={{ background: '#0f172a', padding: '16px', borderRadius: 16, border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ color: '#fff', fontSize: '1rem', borderBottom: '1px solid #334155', paddingBottom: 12, margin: 0 }}>MACRONUTRIENT INGESTION</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {MACROS.map(m => (
                <Btn key={m.id} active={activeFood === m.id} onClick={() => !activeFood && handleIngest(m.id)} color={m.color}>
                  {m.label}
                </Btn>
              ))}
            </div>

            <h3 style={{ color: '#fff', fontSize: '1rem', borderBottom: '1px solid #334155', paddingBottom: 12, marginTop: 12, margin: 0 }}>BIOCHEMISTRY LIMITS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: pepsinActive ? '#ef4444' : '#94a3b8', fontWeight: 'bold' }}>Stomach pH (Hydrochloric Acid)</span>
                    <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{stomachPh.toFixed(1)}</span>
                  </div>
                  <input type="range" min="1.0" max="7.0" step="0.1" value={stomachPh} onChange={(e) => setStomachPh(parseFloat(e.target.value))} style={{ accentColor: pepsinActive ? '#ef4444' : '#94a3b8' }} disabled={activeFood} />
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 'bold' }}>Liver Bile Secretion</span>
                    <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{bile}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={bile} onChange={(e) => setBile(parseInt(e.target.value))} style={{ accentColor: '#22c55e' }} disabled={activeFood} />
               </div>
            </div>

            <h3 style={{ color: '#fff', fontSize: '1rem', borderBottom: '1px solid #334155', paddingBottom: 12, marginTop: 12, margin: 0 }}>LIVE TELEMETRY STREAM</h3>
            {/* RAW DOM UPDATES - ZERO FRAME DROPS */}
            <div ref={telemetryRef} style={{ flex: 1, padding: '16px', background: '#020617', border: '1px solid #1e293b', borderRadius: 8, overflowY: 'auto', fontFamily: '"DM Mono", monospace' }}>
               <div style={{ color: '#94a3b8' }}>[ AWAITING INGESTION ]</div>
            </div>
         </div>

      </div>
    </div>
  )
}
