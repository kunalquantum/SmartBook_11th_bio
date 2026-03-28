import { useState, useRef, useEffect, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Environment, CameraControls, ContactShadows, Sparkles, Float, Trail } from '@react-three/drei'
import * as THREE from 'three'
import { SimHeader, Callout, Btn } from '../ui'

// PERFECT LOCAL COORDINATES for the Left Kidney Cross-Section (Relative to its own center [0,0,0])
const PYRAMIDS = [
   { pos: [-0.5, 0.9, 0], rot: [0, 0, -Math.PI / 3] },
   { pos: [-1.0, 0.2, 0], rot: [0, 0, -Math.PI / 1.8] },
   { pos: [-0.8, -0.6, 0], rot: [0, 0, Math.PI / 1.3] },
   { pos: [-0.2, -1.0, 0], rot: [0, 0, Math.PI / 1.6] },
   { pos: [0.3, 0.8, 0], rot: [0, 0, -Math.PI / 5] },
]

function MacroscopicExcretorySystem({ activePulse, bloodPressure, bloodGlucose, adhLevel, telemetryRef, onComplete }) {
  const trackerAorta = useRef()
  const trackerSolidKidney = useRef()
  const trackerUreterLeft = useRef()
  const trackerUreterRight = useRef()
  const bladderRef = useRef()

  const flowProgress = useRef(0)
  const [bladderVolume, setBladderVolume] = useState(0)

  useEffect(() => {
     if (activePulse) {
        flowProgress.current = 0.001
        setBladderVolume(0)
     }
  }, [activePulse])

  // --- PRECISE DIAGRAMMATIC URETER MAPPING (Connecting smoothly to the Pelvis) ---
  const ureterLeftVisual = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.3, 1.8, 0),     // Inside Left Pelvis Hilum Base
    new THREE.Vector3(-2.0, 0.5, 0.2),   // Exiting Hilum
    new THREE.Vector3(-1.6, -1.0, 0.2),  // Mid-Descent
    new THREE.Vector3(-0.6, -3.2, 1.0),  // Inserting rear of Bladder
  ]), [])
  
  const ureterRightVisual = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(2.3, 1.8, 0),      // Exiting Right Hilum
    new THREE.Vector3(2.0, 0.5, 0.2),    
    new THREE.Vector3(1.6, -1.0, 0.2),   
    new THREE.Vector3(0.6, -3.2, 1.0),   // Inserting rear of Bladder
  ]), [])

  // --- BIOCHEMISTRY PHYSICS BOUNDS ---
  const gfrActive = bloodPressure >= 55
  const gfrCritical = bloodPressure >= 90
  const glucosuria = bloodGlucose > 180
  const waterAbsorbed = adhLevel > 60
  const diuresis = adhLevel < 20
  
  const getFiltrateColor = () => {
      if (waterAbsorbed && glucosuria) return '#d97706'
      if (waterAbsorbed) return '#b45309'
      if (glucosuria) return '#fce7f3'
      return '#fef08a'
  }
  const uColor = getFiltrateColor()

  const generateTelemetry = (p) => {
     if (p < 0.15) {
         return `
            <div style="color: #ef4444; font-size: 1.1rem; font-weight: bold; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">[1] VASCULAR INFLOW</div>
            <div style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; display: flex; flex-direction: column; gap: 8px;">
               <div style="display: flex; justify-content: space-between;"><span>Vessel:</span> <strong>Aorta → Renal Arteries</strong></div>
               <div style="display: flex; justify-content: space-between;"><span>Hydrostatic Pressure:</span> <strong style="color: ${gfrCritical ? '#ef4444' : gfrActive ? '#22c55e' : '#94a3b8'}">${bloodPressure} mmHg</strong></div>
            </div>
            <div style="margin-top: 16px; padding: 8px; background: ${gfrCritical ? 'rgba(239, 68, 68, 0.1)' : gfrActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(148, 163, 184, 0.1)'}; color: ${gfrCritical ? '#ef4444' : gfrActive ? '#4ade80' : '#94a3b8'}; border-radius: 6px; font-size: 0.8rem;">
               ${gfrCritical ? 'WARNING: Hypertension detected. Massive pressure wave hitting the renal hilum.' : gfrActive ? 'SUCCESS: Optimal systemic pressure.' : 'FAILURE: Severe hypotensive shock!'}
            </div>
         `
     } else if (p >= 0.15 && p < 0.40) {
         return `
            <div style="color: #c084fc; font-size: 1.1rem; font-weight: bold; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">[2] RENAL FILTRATION (MEDULLA)</div>
            <div style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; display: flex; flex-direction: column; gap: 8px;">
               <div style="display: flex; justify-content: space-between;"><span>Segmental Processing:</span> <strong style="color: #c084fc">Renal Pyramids</strong></div>
               <div style="display: flex; justify-content: space-between;"><span>Blood Glucose Limit:</span> <strong style="color: ${glucosuria ? '#ef4444' : '#22c55e'}">${bloodGlucose} mg/dL</strong></div>
               <div style="display: flex; justify-content: space-between;"><span>Caliceal Collection:</span> <strong style="color: #fcd34d">Funneled to Renal Pelvis</strong></div>
            </div>
            <div style="margin-top: 16px; padding: 8px; background: ${glucosuria ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)'}; color: ${glucosuria ? '#f87171' : '#4ade80'}; border-radius: 6px; font-size: 0.8rem;">
               ${glucosuria ? 'DIABETES WARNING: Renal threshold breached. Medullary pyramids dumping glucose straight into the Calyces!' : 'SUCCESS: Pyramids successfully extracting urea and draining it into the yellow Pelvis funnel.'}
            </div>
         `
     } else if (p >= 0.40 && p < 0.65) {
         return `
            <div style="color: #fcd34d; font-size: 1.1rem; font-weight: bold; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">[3] URETERAL TRANSPORT</div>
            <div style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; display: flex; flex-direction: column; gap: 8px;">
               <div style="display: flex; justify-content: space-between;"><span>ADH Pituitary Hormone:</span> <strong style="color: ${waterAbsorbed ? '#f59e0b' : '#38bdf8'}">${adhLevel}% Secretion</strong></div>
               <div style="display: flex; justify-content: space-between;"><span>Payload:</span> <strong style="color: ${uColor}">Aqueous Urine</strong></div>
            </div>
            <div style="margin-top: 16px; padding: 8px; background: ${waterAbsorbed ? 'rgba(245, 158, 11, 0.1)' : 'rgba(56, 189, 248, 0.1)'}; color: ${waterAbsorbed ? '#f59e0b' : '#38bdf8'}; border-radius: 6px; font-size: 0.8rem;">
               ${waterAbsorbed ? 'DEHYDRATION DETECTED: ADH absorbed massive water natively in the kidney! The concentrated urine is slowly squeezing down the long ureter.' : 'NORMAL: Pale yellow urine is flowing smoothly down the paired ureters.'}
            </div>
         `
     } else if (p >= 0.65 && p < 0.90) {
         return `
            <div style="color: #fdba74; font-size: 1.1rem; font-weight: bold; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">[4] BLADDER EXPANSION</div>
            <div style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; display: flex; flex-direction: column; gap: 8px;">
               <div style="display: flex; justify-content: space-between;"><span>Bladder Volume:</span> <strong style="color: #fdba74">Expanding Structurally</strong></div>
               <div style="display: flex; justify-content: space-between;"><span>Internal Pressure:</span> <strong style="color: #f87171">Firing Stretch Receptors</strong></div>
            </div>
            <div style="margin-top: 16px; padding: 8px; background: rgba(253, 186, 116, 0.1); color: #fdba74; border-radius: 6px; font-size: 0.8rem;">
               STORAGE PHASE: The muscular sac is visibly expanding as filtered urine pools from both ureters. Awaiting micturition reflex.
            </div>
         `
     } else {
         return `
            <div style="color: #22d3ee; font-size: 1.1rem; font-weight: bold; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">[5] MICTURITION (EXCRETION)</div>
            <div style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; display: flex; flex-direction: column; gap: 8px;">
               <div style="display: flex; justify-content: space-between;"><span>Detrusor Muscle:</span> <strong style="color: #22d3ee">Violent Contraction</strong></div>
               <div style="display: flex; justify-content: space-between;"><span>Urethral Sphincter:</span> <strong style="color: #4ade80">Relaxed Open</strong></div>
            </div>
            <div style="margin-top: 16px; width: 100%; height: 4px; background: #1e293b; border-radius: 2px; overflow: hidden;"><div style="width: 100%; height: 100%; background: #22d3ee;"></div></div>
         `
     }
  }

  useFrame((state, delta) => {
    const p = flowProgress.current
    if (p > 0) {
       if (!gfrActive && p < 0.15) {
          flowProgress.current = 0
          if (telemetryRef.current) telemetryRef.current.innerHTML = '<div style="color: #ef4444; font-family: monospace;">[ SHOCK - INSUFFICIENT PRESSURE ]</div>'
          onComplete()
          return
       }

       let speed = 0.08
       if (p < 0.15) speed = (bloodPressure / 100) * 0.12 
       else if (p >= 0.15 && p < 0.40) speed = 0.04       
       else if (p >= 0.40 && p < 0.65) speed = waterAbsorbed ? 0.05 : (diuresis ? 0.14 : 0.08) 
       else if (p >= 0.65 && p < 0.90) {                  
            speed = 0.08
            setBladderVolume(v => Math.min(v + delta * 0.5, 1.0))
            if (bladderRef.current) bladderRef.current.scale.setScalar(1 + bladderVolume * 0.4)
       }
       else if (p >= 0.90) {                              
            speed = 0.2 
            if (bladderRef.current) bladderRef.current.scale.setScalar(Math.max(1, bladderRef.current.scale.x - delta * 4))
       }

       flowProgress.current += speed * delta

       // Visual Spline Trackers
       if (trackerAorta.current) {
           if (p < 0.15) { 
               trackerAorta.current.position.set(0.5, 5 - (p/0.15)*2.8, -0.6)
               trackerAorta.current.visible = true
           } else trackerAorta.current.visible = false
       }

       if (trackerSolidKidney.current) {
           if (p >= 0.15 && p < 0.40) {
               const t = (p - 0.15) / 0.05
               if (p < 0.20) trackerSolidKidney.current.position.lerpVectors(new THREE.Vector3(0.5, 2.2, -0.6), new THREE.Vector3(2.3, 1.8, 0), t)
               else trackerSolidKidney.current.position.set(2.3, 1.8, 0) // Hold at hilum
           }
       }

       if (trackerUreterLeft.current && trackerUreterRight.current) {
           if (p >= 0.40 && p < 0.65) {
               trackerUreterLeft.current.visible = true
               trackerUreterRight.current.visible = true
               const uProg = (p - 0.40) / 0.25
               trackerUreterLeft.current.position.copy(ureterLeftVisual.getPointAt(Math.min(uProg, 0.99)))
               trackerUreterRight.current.position.copy(ureterRightVisual.getPointAt(Math.min(uProg, 0.99)))
           } else if (p >= 0.65 && p < 0.90) {
               trackerUreterLeft.current.position.set(0, -3.2, 1.0)
               trackerUreterRight.current.position.set(0, -3.2, 1.0)
           } else if (p >= 0.90) {
               const exit = (p - 0.90) / 0.10
               trackerUreterLeft.current.position.set(0, -4.5 - exit*2, 1.0)
               trackerUreterRight.current.position.set(0, -4.5 - exit*2, 1.0)
           } else {
               trackerUreterLeft.current.visible = false
               trackerUreterRight.current.visible = false
           }
       }

       if (telemetryRef.current) telemetryRef.current.innerHTML = generateTelemetry(flowProgress.current)
       if (flowProgress.current >= 0.99) {
          flowProgress.current = 0
          setBladderVolume(0)
          onComplete() 
          if (telemetryRef.current) telemetryRef.current.innerHTML = '<div style="color: #94a3b8; font-family: monospace;">[ AWAITING VASCULAR INFLOW ]</div>'
       }
    }
  })

  const actP = flowProgress.current

  return (
    <group position={[0,-0.5,0]}>
      
      {/* 1. CENTRAL VASCULATURE */}
      <mesh position={[0.5, 2.0, -0.6]}> {/* Aorta (Red) */}
         <cylinderGeometry args={[0.5, 0.5, 9]} />
         <meshPhysicalMaterial color="#ef4444" roughness={0.6} />
      </mesh>
      <mesh position={[-0.5, 2.0, -0.6]}> {/* Vena Cava (Blue) */}
         <cylinderGeometry args={[0.5, 0.5, 9]} />
         <meshPhysicalMaterial color="#3b82f6" roughness={0.6} />
      </mesh>

      {/* Renal Arteries (Red to Kidneys) */}
      <mesh position={[-1.15, 2.3, -0.2]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.2, 0.2, 3.3]}/><meshPhysicalMaterial color="#ef4444" /></mesh>
      <mesh position={[1.65, 2.3, -0.2]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.2, 0.2, 2.3]}/><meshPhysicalMaterial color="#ef4444" /></mesh>

      {/* Renal Veins (Blue to Vena Cava) */}
      <mesh position={[-1.65, 2.0, 0.1]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.2, 0.2, 2.3]}/><meshPhysicalMaterial color="#3b82f6" /></mesh>
      <mesh position={[1.15, 1.8, 0.1]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.2, 0.2, 3.3]}/><meshPhysicalMaterial color="#3b82f6" /></mesh>

      {/* 2. THE KIDNEYS */}
      
      {/* VISUAL RIGHT KIDNEY (Solid anatomical representation) */}
      <group position={[2.8, 2.0, 0]} scale={[1, 1.4, 0.7]} rotation={[0, 0, -0.2]}>
         <mesh>
            <sphereGeometry args={[1.2, 32, 32]} />
            <meshPhysicalMaterial color="#b91c1c" emissive="#ef4444" emissiveIntensity={actP >= 0.15 && actP < 0.40 && gfrCritical ? 2 : 0} roughness={0.5} clearcoat={1}/>
         </mesh>
         <mesh position={[0, 1.2, 0]} scale={[1.2, 0.5, 1.2]} rotation={[0,0,-0.2]}><coneGeometry args={[0.8, 1, 16]}/><meshPhysicalMaterial color="#fef08a"/></mesh>
      </group>

      {/* VISUAL LEFT KIDNEY (High Fidelity Anatomical Cross-Section matching Diagram!) */}
      <group position={[-2.8, 2.0, 0]} scale={[1.1, 1.1, 1.1]} rotation={[0, 0, 0.1]}>
         
         {/* Fleshy back-plate cortex shell (Properly anchored locally at [0,0,0]) */}
         <mesh position={[0, 0, -0.2]} scale={[1.1, 1.4, 0.3]}>
            <sphereGeometry args={[1.4, 32, 32]} />
            <meshPhysicalMaterial color="#b91c1c" roughness={0.7} />
         </mesh>
         
         {/* Adrenal Gland Top Local */}
         <mesh position={[-0.3, 1.4, -0.1]} scale={[1.2, 0.5, 1.2]} rotation={[0,0,0.3]}><coneGeometry args={[0.8, 1, 16]}/><meshPhysicalMaterial color="#fef08a"/></mesh>

         {/* Internal Pyramids (Medulla - The actual mechanical filters perfectly localized!) */}
         {PYRAMIDS.map((p, i) => (
             <mesh key={i} position={p.pos} rotation={p.rot}>
                <coneGeometry args={[0.35, 0.7, 16]} />
                <meshPhysicalMaterial color="#7f1d1d" roughness={0.9} />
             </mesh>
         ))}

         {/* Renal Pelvis & Calyces (Properly positioned at Local Hilum: x=0.5) */}
         <group position={[0.5, -0.2, 0.1]}>
             <mesh rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.5, 0.2, 1.0, 16]}/><meshPhysicalMaterial color="#fef08a" roughness={0.4}/></mesh>
             
             {/* Micro-Vascular Segmental Arteries bringing blood internally to pyramids! */}
             {PYRAMIDS.map((p, i) => {
                 const dx = p.pos[0] - 0.5; const dy = p.pos[1] - (-0.2);
                 const dist = Math.sqrt(dx*dx + dy*dy);
                 const angle = Math.atan2(dy, dx);
                 return (
                    <mesh key={i} position={[dx/2, dy/2, 0]} rotation={[0, 0, angle]}>
                       <cylinderGeometry args={[0.04, 0.04, dist, 8]} /><meshPhysicalMaterial color="#ef4444" />
                    </mesh>
                 )
             })}

             {/* Minor Calyces connecting Pyramids cleanly into the Pelvis funnel */}
             {PYRAMIDS.map((p, i) => {
                 const dx = p.pos[0] - 0.5; const dy = p.pos[1] - (-0.2);
                 const dist = Math.sqrt(dx*dx + dy*dy) - 0.35;
                 const angle = Math.atan2(dy, dx);
                 return (
                    <mesh key={`calyx-${i}`} position={[dx/2 - 0.2*Math.cos(angle), dy/2 - 0.2*Math.sin(angle), 0]} rotation={[0, 0, angle]}>
                       <cylinderGeometry args={[0.12, 0.06, dist, 8]} /><meshPhysicalMaterial color="#fef08a" />
                    </mesh>
                 )
             })}
         </group>

         {/* EXTREME FIDELITY FLUID PAYLOAD - PURE LOCAL COORDINATE TRACKING SYSTEM */}
         {activePulse && actP >= 0.15 && actP < 0.40 && PYRAMIDS.map((p, i) => {
             // Because these trackers are inside the Kidney Group, we perfectly lerp against p.pos LOCALLY!
             let pPos = new THREE.Vector3(0.5, -0.2, 0.1) // Start at Local Hilum
             let pColor = actP < 0.27 ? '#ef4444' : uColor
             
             if (actP < 0.20) { // Blood shoots from hilum to pyramids
                 const t = (actP - 0.15) / 0.05
                 pPos.lerpVectors(new THREE.Vector3(0.5, -0.2, 0.1), new THREE.Vector3(...p.pos), t)
             } else if (actP >= 0.20 && actP < 0.35) {
                 pPos.set(...p.pos) // Filters AT the dark red pyramids
             } else if (actP >= 0.35 && actP < 0.40) { // Clean Urine drops back through Calyces 
                 const t = (actP - 0.35) / 0.05
                 pPos.lerpVectors(new THREE.Vector3(...p.pos), new THREE.Vector3(0.5, -0.2, 0.1), t) 
             }

             return (
                <group key={`track-${i}`} position={pPos}>
                   <Trail width={1.0} length={8} color={pColor} attenuation={(t) => t * t}>
                      <mesh><sphereGeometry args={[0.1]} /><meshPhysicalMaterial color={pColor} emissive={pColor} emissiveIntensity={4} toneMapped={false} /></mesh>
                   </Trail>
                </group>
             )
          })}
      </group>

      {/* 3. URETERS (Sweeping paths precisely derived) */}
      <mesh>
         <tubeGeometry args={[ureterLeftVisual, 64, 0.18, 16, false]} />
         <meshPhysicalMaterial color="#fca5a5" transparent opacity={0.6} roughness={0.3} />
      </mesh>
      <mesh>
         <tubeGeometry args={[ureterRightVisual, 64, 0.18, 16, false]} />
         <meshPhysicalMaterial color="#fca5a5" transparent opacity={0.6} roughness={0.3} />
      </mesh>

      {/* 4. BLADDER & URETHRA (Highly defined Trigone shape) */}
      <group ref={bladderRef} position={[0, -3.8, 1.0]}>
         <mesh position={[0,0,0]} scale={[1, 0.8, 1]}>
            <sphereGeometry args={[1.5, 32, 32]} />
            <meshPhysicalMaterial color="#fdba74" transparent opacity={0.8} clearcoat={1} emissive="#fef08a" emissiveIntensity={bladderVolume * 0.6} />
         </mesh>
         <mesh position={[0, -1.2, 0]}>
            <cylinderGeometry args={[0.6, 0.2, 1.0, 32]} />
            <meshPhysicalMaterial color="#fdba74" transparent opacity={0.8} />
         </mesh>
      </group>
      <mesh position={[0, -5.5, 1.0]}><cylinderGeometry args={[0.2, 0.2, 1.5]} /><meshPhysicalMaterial color="#fc8181" /></mesh>

      {/* --- THE FLUID PAYLOAD (Extreme High Fidelity Cross-section Engine) --- */}
      {activePulse && actP > 0 && (
        <group>
          {/* Phase 1: Entering the Aorta */}
          <group ref={trackerAorta} visible={false}>
              <Trail width={2.5} length={15} color="#ef4444" attenuation={(t) => t * t}>
                 <mesh><sphereGeometry args={[0.25]} /><meshPhysicalMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3} toneMapped={false} /></mesh>
              </Trail>
              <pointLight distance={6} intensity={4} color="#ef4444" />
          </group>

          {/* Phase 2: Processing in Solid Right Kidney */}
          <group ref={trackerSolidKidney} visible={actP >= 0.15 && actP < 0.40}>
              <Trail width={3} length={10} color={actP < 0.25 ? '#ef4444' : uColor} attenuation={(t) => t * t}>
                 <mesh><sphereGeometry args={[0.25]} /><meshPhysicalMaterial color={actP < 0.25 ? '#ef4444' : uColor} emissive={actP < 0.25 ? '#ef4444' : uColor} emissiveIntensity={5} toneMapped={false} /></mesh>
              </Trail>
          </group>

          {/* Phase 3 & 4 & 5: Ureteral transport and Excretion */}
          <group ref={trackerUreterLeft} visible={false}>
              <Trail width={2.0} length={15} color={uColor} attenuation={(t) => t * t}>
                 <mesh><sphereGeometry args={[0.2]} /><meshPhysicalMaterial color={uColor} emissive={uColor} emissiveIntensity={3} toneMapped={false} /></mesh>
              </Trail>
              <pointLight distance={4} intensity={4} color={uColor} decay={2} castShadow={actP >= 0.4} />
          </group>
          <group ref={trackerUreterRight} visible={false}>
              <Trail width={2.0} length={15} color={uColor} attenuation={(t) => t * t}>
                 <mesh><sphereGeometry args={[0.2]} /><meshPhysicalMaterial color={uColor} emissive={uColor} emissiveIntensity={3} toneMapped={false} /></mesh>
              </Trail>
              <pointLight distance={4} intensity={4} color={uColor} decay={2} castShadow={actP >= 0.4} />
          </group>

          {/* BIOCHEMICAL VISUAL PARTICLE SHADERS */}
          {/* Clean Blood Return Blast (Vena Cava) */}
          {actP >= 0.15 && actP < 0.40 && (
              <group>
                 <Sparkles position={[-0.5, 2.0, -0.5]} count={90} scale={[1,3,1]} size={5} speed={25} color="#3b82f6" />
              </group>
          )}

          {/* Glucosuria Leak out of Ureters */}
          {actP >= 0.40 && actP < 0.65 && glucosuria && (
              <group>
                 <Sparkles position={[-1.5, -1, 0.2]} count={80} scale={[2, 2, 2]} size={6} speed={15} color="#fbbf24" opacity={0.8} />
                 <Sparkles position={[1.5, -1, 0.2]} count={80} scale={[2, 2, 2]} size={6} speed={15} color="#fbbf24" opacity={0.8} />
              </group>
          )}

          {/* Final Excretion Geyser! */}
          {actP >= 0.90 && (
              <Sparkles position={[0, -6, 1.0]} count={250} scale={[1,3,1]} size={9} speed={30} color={uColor} />
          )}
        </group>
      )}

      {/* STATIC LABELS */}
      <Html position={[0.5, 6, -0.6]} center><div style={{ color: '#ef4444', fontFamily: '"DM Mono"', fontSize: '0.6rem', letterSpacing: 1 }}>Aorta (Blood Input)</div></Html>
      <Html position={[-0.5, 6, -0.6]} center><div style={{ color: '#3b82f6', fontFamily: '"DM Mono"', fontSize: '0.6rem', letterSpacing: 1 }}>Vena Cava</div></Html>
      <Html position={[3.6, 2.2, 0]} center><div style={{ color: '#b91c1c', fontFamily: '"DM Mono"', fontSize: '0.6rem', letterSpacing: 1 }}>Left Kidney</div></Html>
      <Html position={[-4.5, -1.0, 0]} center><div style={{ color: '#fef08a', fontFamily: '"DM Mono"', fontSize: '0.6rem', letterSpacing: 1 }}>Ureter</div></Html>
      <Html position={[-3.6, 3.2, 0]} center><div style={{ color: '#7f1d1d', fontFamily: '"DM Mono"', fontSize: '0.55rem', letterSpacing: 1 }}>Medullary Pyramids</div></Html>

    </group>
  )
}

export function ExcretionSimulator() {
  const [isPulsing, setIsPulsing] = useState(false)
  const [bloodPressure, setBloodPressure] = useState(120)
  const [bloodGlucose, setBloodGlucose] = useState(90)
  const [adhLevel, setAdhLevel] = useState(80) 
  const controlsRef = useRef()
  const telemetryRef = useRef() 

  const handlePulse = () => {
    setIsPulsing(true)
    if (controlsRef.current) {
        controlsRef.current.setLookAt(0, 4, 15, 0, 1, 0, true) // Aorta tracking
        setTimeout(() => controlsRef.current.setLookAt(-1.5, 2, 8, -2.8, 2, 0, true), 2000) // Zoom precisely into the left cross-sectional kidney
        setTimeout(() => controlsRef.current.setLookAt(0, -1, 10, 0, -1, 0, true), 6000) // Pan down Ureters
        setTimeout(() => controlsRef.current.setLookAt(0, -4, 12, 0, -4, 0, true), 10000) // Bladder filling
        setTimeout(() => controlsRef.current.setLookAt(0, 0, 16, 0, 0, 0, true), 14000) // Reset full view
    }
  }

  const gfrActive = bloodPressure >= 55
  const gfrCritical = bloodPressure >= 90
  const glucosuria = bloodGlucose > 180

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="🫀" title="Systemic Excretion Engine" subtitle="Gold Standard Anatomical Cross-Section Modeling" color="#ec4899" />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1rem', height: '600px' }}>
         <div style={{
           position: 'relative', width: '100%', height: '100%',
           background: 'radial-gradient(ellipse at bottom, #312e81 0%, #020617 100%)',
           borderRadius: 16, border: `1px solid #4338ca80`, overflow: 'hidden',
           boxShadow: `inset 0 0 100px #312e8140`
         }}>
           <Canvas camera={{ position: [0, 0, 16], fov: 50 }}>
             <ambientLight intensity={0.5} />
             <spotLight position={[10, 15, 10]} angle={0.5} intensity={1} color="#fff" />
             <pointLight position={[0, 4, 3]} intensity={1.5} color="#ef4444" decay={2} />
             <pointLight position={[-2.8, 2, 2]} intensity={0.8} color="#fca5a5" /> {/* Sliced Kidney structural light */}
             
             <Suspense fallback={<Html center><div style={{color: '#ec4899', fontFamily:'"DM Mono"', letterSpacing: 2}}>COMPILING CROSS SECTION...</div></Html>}>
               <Environment preset="city" resolution={256} />
               <Float speed={1} rotationIntensity={0.05} floatIntensity={0.1}>
                  <MacroscopicExcretorySystem activePulse={isPulsing} bloodPressure={bloodPressure} bloodGlucose={bloodGlucose} adhLevel={adhLevel} telemetryRef={telemetryRef} onComplete={() => setIsPulsing(false)} />
               </Float>
               <ContactShadows position={[0, -6, 0]} opacity={0.6} scale={20} blur={2.5} far={8} color="#000" />
               <CameraControls ref={controlsRef} minDistance={2} maxDistance={25} />
             </Suspense>
           </Canvas>
         </div>

         <div style={{ background: '#0f172a', padding: '16px', borderRadius: 16, border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Btn active={isPulsing} onClick={() => !isPulsing && handlePulse()} color="#ec4899">
               {isPulsing ? 'TRACKING VASCULAR INFLOW...' : 'SIMULATE VASCULAR INFLOW'}
            </Btn>
            <h3 style={{ color: '#fff', fontSize: '1rem', borderBottom: '1px solid #334155', paddingBottom: 12, marginTop: 12, margin: 0 }}>METABOLIC BOUNDARIES</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: gfrCritical ? '#ef4444' : gfrActive ? '#f472b6' : '#94a3b8', fontWeight: 'bold' }}>Blood Pressure (mmHg)</span>
                    <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{bloodPressure}</span>
                  </div>
                  <input type="range" min="20" max="180" step="5" value={bloodPressure} onChange={(e) => setBloodPressure(parseInt(e.target.value))} style={{ accentColor: gfrCritical ? '#ef4444' : gfrActive ? '#f472b6' : '#94a3b8' }} disabled={isPulsing} />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: glucosuria ? '#f87171' : '#22c55e', fontWeight: 'bold' }}>Blood Glucose Limit (mg/dL)</span>
                    <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{bloodGlucose}</span>
                  </div>
                  <input type="range" min="60" max="300" step="10" value={bloodGlucose} onChange={(e) => setBloodGlucose(parseInt(e.target.value))} style={{ accentColor: glucosuria ? '#f87171' : '#22c55e' }} disabled={isPulsing} />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 'bold' }}>ADH Levels (Vasopressin)</span>
                    <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{adhLevel}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={adhLevel} onChange={(e) => setAdhLevel(parseInt(e.target.value))} style={{ accentColor: '#a78bfa' }} disabled={isPulsing} />
               </div>
            </div>
            <h3 style={{ color: '#fff', fontSize: '1rem', borderBottom: '1px solid #334155', paddingBottom: 12, marginTop: 12, margin: 0 }}>LIVE TELEMETRY STREAM</h3>
            <div ref={telemetryRef} style={{ flex: 1, padding: '16px', background: '#020617', border: '1px solid #1e293b', borderRadius: 8, overflowY: 'auto', fontFamily: '"DM Mono", monospace' }}>
               <div style={{ color: '#94a3b8' }}>[ AWAITING VASCULAR INFLOW ]</div>
            </div>
         </div>
      </div>
    </div>
  )
}
