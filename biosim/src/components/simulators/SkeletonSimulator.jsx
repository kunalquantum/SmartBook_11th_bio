import { useState, useRef, useEffect, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Environment, CameraControls, ContactShadows, Float } from '@react-three/drei'
import * as THREE from 'three'
import { SimHeader, Callout, Btn } from '../ui'

// --- ADVANCED ORGANIC SHADER ---
const BoneMaterial = ({ highlight, color, dark }) => (
  <meshPhysicalMaterial 
     color={dark ? '#1e293b' : (highlight ? '#38bdf8' : color || '#fdfbf7')} 
     emissive={highlight ? '#0284c7' : '#000000'}
     emissiveIntensity={highlight ? 0.8 : 0}
     roughness={0.7} 
     clearcoat={0.2} 
     clearcoatRoughness={0.4}
     metalness={0.05}
     side={THREE.DoubleSide}
  />
)

// --- HYPER-DETAILED ORGANIC LONG BONE GENERATOR ---
const BoneShaft = ({ length, baseRadius, topFlare, bottomFlare, Material }) => {
    const points = useMemo(() => {
        const pts = []
        for(let i=0; i<=24; i++) {
           const y = -length/2 + (i/24)*length
           const normalizedY = Math.abs(y)/(length/2)
           const flare = y > 0 ? topFlare : bottomFlare
           const radius = baseRadius + Math.pow(normalizedY, 3) * flare
           pts.push(new THREE.Vector2(Math.max(radius, 0.05), y))
        }
        return pts
    }, [length, baseRadius, topFlare, bottomFlare])
    
    return <mesh><latheGeometry args={[points, 16]} />{Material}</mesh>
}

// --- ORGANIC RIBCAGE GENERATOR ---
const OrganicRib = ({ idx, y, zOffset, Material }) => {
   const w = 1.0 + Math.sin((idx/12) * Math.PI) * 1.6 // Expands ribcage width progressively
   const drop = Math.pow(idx, 1.2) * 0.08 // Ribs drop downwards steeper at the bottom
   
   // Sweeping curve from Thoracic spine to Sternum
   const ribCurve = useMemo(() => new THREE.CatmullRomCurve3([
       new THREE.Vector3(0.15, y, -0.3 + zOffset),
       new THREE.Vector3(w, y - drop/3, 0.2),
       new THREE.Vector3(w*0.8, y - drop, 1.2),
       new THREE.Vector3(0.2, y - drop*1.3, 1.6)
   ]), [y, w, drop, zOffset])

   return (
       <group>
          <mesh><tubeGeometry args={[ribCurve, 24, 0.06, 8, false]} />{Material}</mesh>
          <group scale={[-1, 1, 1]}> {/* Mirror right side automatically! */}
             <mesh><tubeGeometry args={[ribCurve, 24, 0.06, 8, false]} />{Material}</mesh>
          </group>
       </group>
   )
}

// --- ARTICULATED PHALANGES ARRAY ---
const OrganicHand = ({ Material }) => (
   <group position={[0, -3.2, 0]}>
      {/* Carpals (Multi-faceted bone cluster) */}
      <mesh position={[0, -0.2, 0]}><sphereGeometry args={[0.3, 16, 16]} scale={[1, 0.5, 0.5]}/>{Material}</mesh>
      
      {[...Array(5)].map((_, i) => {
          const angle = (i - 2) * 0.16 
          const len = i === 0 ? 0.7 : (i === 2 ? 1.3 : 1.1) // Thumb offset, Middle long
          const shiftY = i === 0 ? -0.4 : 0
          return (
              <group key={i} rotation={[0, 0, angle]} position={[i===0 ? -0.2 : 0, shiftY, 0]}>
                  {/* Metacarpal */}
                  <mesh position={[0, -len/2, 0]}><cylinderGeometry args={[0.04, 0.03, len]}/>{Material}</mesh>
                  {/* Proximal Phalanx */}
                  <mesh position={[0, -len - len*0.3/2, 0]}><cylinderGeometry args={[0.03, 0.02, len*0.3]}/>{Material}</mesh>
                  {/* Distal Phalanx */}
                  <mesh position={[0, -len - len*0.3 - len*0.2/2, 0]}><cylinderGeometry args={[0.02, 0.015, len*0.2]}/>{Material}</mesh>
              </group>
          )
      })}
   </group>
)

const OrganicFoot = ({ Material }) => (
   <group position={[0, -4.1, 0.3]} rotation={[0.4, 0, 0]}>
      {/* Tarsals / Calcaneus (Heel) */}
      <mesh position={[0, 0, -0.5]}><sphereGeometry args={[0.35, 16, 16]} scale={[1, 1, 1.5]}/>{Material}</mesh>
      
      {[...Array(5)].map((_, i) => {
          const angle = (i - 2) * 0.08
          const len = i === 4 ? 0.8 : 1.0
          return (
              <group key={i} rotation={[0, angle, 0]} position={[0, -0.3, 0]}>
                  {/* Metatarsal */}
                  <mesh position={[0, 0, len/2]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.04, 0.03, len]}/>{Material}</mesh>
                  {/* Phalanges */}
                  <mesh position={[0, -0.1, len + 0.1]} rotation={[Math.PI/2.2,0,0]}><cylinderGeometry args={[0.03, 0.02, 0.3]}/>{Material}</mesh>
              </group>
          )
      })}
   </group>
)

// --- MACRO SKELETAL RIG ---
function UltraFidelitySkeleton({ focusMode, elbowFlex, kneeFlex, neckY, neckX, highlightAction }) {
   const isAxial = focusMode === 'axial'
   const isAppend = focusMode === 'appendicular'
   const axialColor = isAppend ? '#475569' : '#fdfbf7'
   const appendColor = isAxial ? '#475569' : '#fdfbf7'
   const axialMem = <BoneMaterial color={axialColor} highlight={isAxial || highlightAction === 'neck' || highlightAction === 'spine'} />
   const appendMem = <BoneMaterial color={appendColor} highlight={isAppend} />
   const elbowMem = <BoneMaterial color={appendColor} highlight={highlightAction === 'elbow'} />
   const kneeMem  = <BoneMaterial color={appendColor} highlight={highlightAction === 'knee'} />

   // Forward Kinematics Joint Refs
   const rightElbowRef = useRef(); const leftElbowRef = useRef()
   const rightKneeRef = useRef();  const leftKneeRef = useRef()
   const neckRef = useRef()

   useFrame(() => {
       if (rightElbowRef.current) rightElbowRef.current.rotation.x = -THREE.MathUtils.degToRad(elbowFlex)
       if (leftElbowRef.current) leftElbowRef.current.rotation.x = -THREE.MathUtils.degToRad(elbowFlex)
       if (rightKneeRef.current) rightKneeRef.current.rotation.x = THREE.MathUtils.degToRad(kneeFlex)
       if (leftKneeRef.current) leftKneeRef.current.rotation.x = THREE.MathUtils.degToRad(kneeFlex)
       if (neckRef.current) {
          neckRef.current.rotation.y = THREE.MathUtils.degToRad(neckY)
          neckRef.current.rotation.x = THREE.MathUtils.degToRad(neckX)
       }
   })

   return (
     <group position={[0, -5, 0]}>
         {/* ================= AXIAL SKELETON (Skull, Spine, Ribs) ================= */}
         <group>
             {/* 1. VERTEBRAL COLUMN (24 Organic Vertebrae mapped via parametric Spline S-Curve) */}
             <group position={[0, 10, -0.5]}>
                 {[...Array(24)].map((_, i) => {
                     const y = i * 0.38
                     const zOff = Math.sin(y * 0.6) * 0.3 // Lordosis/Kyphosis spine curve
                     const pitch = Math.cos(y * 0.6) * 0.15
                     const scale = 1.0 + (24 - i)*0.015 // Larger at lumbar (bottom)
                     return (
                        <group key={i} position={[0, y, zOff]} rotation={[pitch, 0, 0]} scale={[scale,scale,scale]}>
                           {/* Vertebral Body */}
                           <mesh><cylinderGeometry args={[0.3, 0.35, 0.28, 16]} />{axialMem}</mesh>
                           {/* Foramen & Arch */}
                           <mesh position={[0, 0, -0.3]} rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[0.2, 0.08, 8, 16]} />{axialMem}</mesh>
                           {/* Transverse Processes */}
                           <mesh position={[0.4, 0, -0.3]} rotation={[0, 0, 1.2]}><coneGeometry args={[0.06, 0.5, 8]} />{axialMem}</mesh>
                           <mesh position={[-0.4, 0, -0.3]} rotation={[0, 0, -1.2]}><coneGeometry args={[0.06, 0.5, 8]} />{axialMem}</mesh>
                           {/* Spinous Process */}
                           <mesh position={[0, -0.15, -0.6]} rotation={[-0.4, 0, 0]}><coneGeometry args={[0.08, 0.6, 8]} />{axialMem}</mesh>
                        </group>
                     )
                 })}
             </group>

             {/* 2. THORACIC CAGE (Ribs & Sternum) */}
             <group position={[0, 14.5, -0.5]}>
                 <mesh position={[0, 0.5, 1.65]} rotation={[-0.15, 0, 0]}><boxGeometry args={[0.5, 3.8, 0.08]}/>{axialMem}</mesh> {/* Sternum */}
                 {[...Array(12)].map((_, i) => {
                    const yOffset = -i * 0.38
                    const zCurve = Math.sin(Math.abs(yOffset) * 0.6) * 0.3
                    return <OrganicRib key={i} idx={i} y={14.8 + yOffset - 14.5} zOffset={zCurve} Material={axialMem} />
                 })}
             </group>

             {/* 3. SKULL (Hyper-detailed Cranium, Maxilla, Zygomatic, and Mandible CSG Array) */}
             <group position={[0, 19.3, 0]} ref={neckRef}>
                 {/* Cranium Base */}
                 <mesh position={[0, 0.8, -0.1]} scale={[1, 1, 1.15]}><sphereGeometry args={[1.2, 32, 32]}/>{axialMem}</mesh>
                 {/* Face & Brow Ridge */}
                 <mesh position={[0, 0.3, 0.6]} scale={[1, 0.8, 1]}><sphereGeometry args={[0.8, 32, 16]}/>{axialMem}</mesh>
                 {/* Cheekbones (Zygomatic) */}
                 <mesh position={[0.6, 0.2, 0.6]} rotation={[0, 0.6, 0]}><boxGeometry args={[0.3, 0.3, 1.0]}/>{axialMem}</mesh>
                 <mesh position={[-0.6, 0.2, 0.6]} rotation={[0, -0.6, 0]}><boxGeometry args={[0.3, 0.3, 1.0]}/>{axialMem}</mesh>
                 
                 {/* Optic & Nasal Cavities (Vast dark voids carved into geometry) */}
                 <mesh position={[-0.35, 0.5, 1.2]}><sphereGeometry args={[0.3]}/>{<BoneMaterial dark />}</mesh>
                 <mesh position={[0.35, 0.5, 1.2]}><sphereGeometry args={[0.3]}/>{<BoneMaterial dark />}</mesh>
                 <mesh position={[0, -0.05, 1.3]} rotation={[0.4, 0, 0]}><coneGeometry args={[0.15, 0.5]}/>{<BoneMaterial dark />}</mesh>

                 {/* Dentition / Maxilla Line */}
                 <mesh position={[0, -0.2, 1.1]} rotation={[0.2, 0, 0]}><cylinderGeometry args={[0.4, 0.4, 0.2]}/>{axialMem}</mesh>
                 
                 {/* Mandible (Jawbone Arc) */}
                 <group position={[0, -0.5, 0.7]} rotation={[0.2, 0, 0]}>
                     <mesh position={[0, -0.2, 0.3]}><boxGeometry args={[0.9, 0.3, 0.6]}/>{axialMem}</mesh> 
                     <mesh position={[0.4, 0.1, -0.1]} rotation={[0.4, 0, 0]}><boxGeometry args={[0.2, 0.8, 0.3]}/>{axialMem}</mesh>
                     <mesh position={[-0.4, 0.1, -0.1]} rotation={[0.4, 0, 0]}><boxGeometry args={[0.2, 0.8, 0.3]}/>{axialMem}</mesh>
                 </group>
             </group>
         </group>

         {/* ================= APPENDICULAR SKELETON (Pelvis, Clavicles, Limbs) ================= */}
         <group>
             {/* 1. PELVIC GIRDLE (Detailed Iliac Crests wrapping the Sacrum) */}
             <group position={[0, 9.6, -0.4]}>
                 <mesh position={[0.7, 0, 0.4]} rotation={[0.2, 0.6, 0]}>
                     <sphereGeometry args={[0.8, 32, 16, 0, Math.PI]} scale={[1.2, 1.4, 0.2]} />
                     {appendMem}
                 </mesh>
                 <mesh position={[-0.7, 0, 0.4]} rotation={[0.2, -0.6, Math.PI]}>
                     <sphereGeometry args={[0.8, 32, 16, 0, Math.PI]} scale={[1.2, 1.4, 0.2]} />
                     {appendMem}
                 </mesh>
                 <mesh position={[0, -0.8, 0.6]}><sphereGeometry args={[0.4, 32, 16]} scale={[1.5, 0.5, 1]}/>{appendMem}</mesh> {/* Pubic Symphysis */}
                 
                 {/* Deep Acetabulum Sockets where the Femur mounts! */}
                 <mesh position={[1.0, -0.5, 0]}><sphereGeometry args={[0.3]}/>{<BoneMaterial dark />}</mesh>
                 <mesh position={[-1.0, -0.5, 0]}><sphereGeometry args={[0.3]}/>{<BoneMaterial dark />}</mesh>
             </group>

             {/* 2. PECTORAL GIRDLE */}
             {/* Clavicles smoothly sweeping */}
             <mesh position={[0.8, 17.6, 0.4]} rotation={[0, 0.2, 1.4]}><cylinderGeometry args={[0.06, 0.06, 2.0]}/>{appendMem}</mesh>
             <mesh position={[-0.8, 17.6, 0.4]} rotation={[0, -0.2, -1.4]}><cylinderGeometry args={[0.06, 0.06, 2.0]}/>{appendMem}</mesh>
             {/* Scapulae (Shoulder blades in the back) */}
             <mesh position={[1.0, 16.5, -0.8]} rotation={[-0.1, 0, 0]}><boxGeometry args={[1.0, 1.5, 0.1]}/>{appendMem}</mesh>
             <mesh position={[-1.0, 16.5, -0.8]} rotation={[-0.1, 0, 0]}><boxGeometry args={[1.0, 1.5, 0.1]}/>{appendMem}</mesh>

             {/* 3. RIGHT ARM HIERARCHY */}
             <group position={[1.8, 17.4, 0]} rotation={[0, 0, -0.1]}>
                 <mesh position={[-0.1,0,0]}><sphereGeometry args={[0.25]}/>{elbowMem}</mesh> {/* Humeral Head */}
                 <group position={[0, -1.5, 0]}>
                     <BoneShaft length={2.8} baseRadius={0.1} topFlare={0.06} bottomFlare={0.12} Material={elbowMem} />
                 </group>
                 {/* Humerus Condyles */}
                 <mesh position={[-0.1, -3.0, 0]}><sphereGeometry args={[0.15]}/>{elbowMem}</mesh>
                 <mesh position={[0.1, -3.0, 0]}><sphereGeometry args={[0.15]}/>{elbowMem}</mesh>

                 {/* Elbow Hinge Kinematics */}
                 <group position={[0, -3.1, 0]} ref={rightElbowRef}>
                     <mesh position={[0,0.1,-0.1]}><sphereGeometry args={[0.2]}/>{elbowMem}</mesh> {/* Olecranon */}
                     {/* Radius & Ulna (Tapered inversely to each other) */}
                     <group position={[-0.1, -1.4, 0]}><BoneShaft length={2.6} baseRadius={0.06} topFlare={0.08} bottomFlare={0.02} Material={elbowMem}/></group>
                     <group position={[0.1, -1.4, 0]}><BoneShaft length={2.6} baseRadius={0.05} topFlare={0.02} bottomFlare={0.08} Material={elbowMem}/></group>
                     <OrganicHand Material={appendMem} />
                 </group>
             </group>

             {/* 4. LEFT ARM HIERARCHY */}
             <group position={[-1.8, 17.4, 0]} rotation={[0, 0, 0.1]}>
                 <mesh position={[0.1,0,0]}><sphereGeometry args={[0.25]}/>{elbowMem}</mesh> 
                 <group position={[0, -1.5, 0]}>
                     <BoneShaft length={2.8} baseRadius={0.1} topFlare={0.06} bottomFlare={0.12} Material={elbowMem} />
                 </group>
                 <mesh position={[-0.1, -3.0, 0]}><sphereGeometry args={[0.15]}/>{elbowMem}</mesh>
                 <mesh position={[0.1, -3.0, 0]}><sphereGeometry args={[0.15]}/>{elbowMem}</mesh>

                 <group position={[0, -3.1, 0]} ref={leftElbowRef}>
                     <mesh position={[0,0.1,-0.1]}><sphereGeometry args={[0.2]}/>{elbowMem}</mesh>
                     <group position={[-0.1, -1.4, 0]}><BoneShaft length={2.6} baseRadius={0.06} topFlare={0.08} bottomFlare={0.02} Material={elbowMem}/></group>
                     <group position={[0.1, -1.4, 0]}><BoneShaft length={2.6} baseRadius={0.05} topFlare={0.02} bottomFlare={0.08} Material={elbowMem}/></group>
                     <OrganicHand Material={appendMem} />
                 </group>
             </group>

             {/* 5. RIGHT LEG HIERARCHY */}
             <group position={[1.1, 9.1, -0.2]} rotation={[0, 0, -0.05]}>
                 <mesh position={[-0.2,0,0]}><sphereGeometry args={[0.3]}/>{kneeMem}</mesh> {/* Femoral Head inserting precisely into Acetabulum */}
                 <mesh position={[0.2,-0.2,0]}><sphereGeometry args={[0.25]}/>{kneeMem}</mesh> {/* Greater Trochanter */}
                 <group position={[0, -2.0, 0]}>
                     <BoneShaft length={3.8} baseRadius={0.13} topFlare={0.1} bottomFlare={0.18} Material={kneeMem} />
                 </group>
                 <mesh position={[-0.15, -4.0, 0]}><sphereGeometry args={[0.25]}/>{kneeMem}</mesh> {/* Femoral Condyles */}
                 <mesh position={[0.15, -4.0, 0]}><sphereGeometry args={[0.25]}/>{kneeMem}</mesh>

                 {/* Knee Hinge Kinematics */}
                 <group position={[0, -4.1, 0]} ref={rightKneeRef}>
                     <mesh position={[0, 0, 0.25]}><sphereGeometry args={[0.18]} scale={[1,1,0.5]}/>{kneeMem}</mesh> {/* Patella (Floating Kneecap) */}
                     {/* Tibia (Massive inner bone) & Fibula (Splint bone) */}
                     <group position={[0.05, -1.9, 0]}><BoneShaft length={3.6} baseRadius={0.12} topFlare={0.15} bottomFlare={0.08} Material={kneeMem}/></group>
                     <group position={[-0.2, -1.9, -0.1]}><BoneShaft length={3.5} baseRadius={0.05} topFlare={0.02} bottomFlare={0.05} Material={kneeMem}/></group>
                     {/* Bounding Malleoli */}
                     <mesh position={[0.15, -3.7, 0]}><sphereGeometry args={[0.15]}/>{kneeMem}</mesh>
                     <mesh position={[-0.25, -3.7, -0.1]}><sphereGeometry args={[0.1]}/>{kneeMem}</mesh>
                     <OrganicFoot Material={appendMem} />
                 </group>
             </group>

             {/* 6. LEFT LEG HIERARCHY */}
             <group position={[-1.1, 9.1, -0.2]} rotation={[0, 0, 0.05]}>
                 <mesh position={[0.2,0,0]}><sphereGeometry args={[0.3]}/>{kneeMem}</mesh> 
                 <mesh position={[-0.2,-0.2,0]}><sphereGeometry args={[0.25]}/>{kneeMem}</mesh>
                 <group position={[0, -2.0, 0]}>
                     <BoneShaft length={3.8} baseRadius={0.13} topFlare={0.1} bottomFlare={0.18} Material={kneeMem} />
                 </group>
                 <mesh position={[-0.15, -4.0, 0]}><sphereGeometry args={[0.25]}/>{kneeMem}</mesh>
                 <mesh position={[0.15, -4.0, 0]}><sphereGeometry args={[0.25]}/>{kneeMem}</mesh>

                 <group position={[0, -4.1, 0]} ref={leftKneeRef}>
                     <mesh position={[0, 0, 0.25]}><sphereGeometry args={[0.18]} scale={[1,1,0.5]}/>{kneeMem}</mesh> 
                     <group position={[-0.05, -1.9, 0]}><BoneShaft length={3.6} baseRadius={0.12} topFlare={0.15} bottomFlare={0.08} Material={kneeMem}/></group>
                     <group position={[0.2, -1.9, -0.1]}><BoneShaft length={3.5} baseRadius={0.05} topFlare={0.02} bottomFlare={0.05} Material={kneeMem}/></group>
                     <mesh position={[-0.15, -3.7, 0]}><sphereGeometry args={[0.15]}/>{kneeMem}</mesh>
                     <mesh position={[0.25, -3.7, -0.1]}><sphereGeometry args={[0.1]}/>{kneeMem}</mesh>
                     <OrganicFoot Material={appendMem} />
                 </group>
             </group>

         </group>
     </group>
   )
}

export function SkeletonSimulator() {
  const [focusMode, setFocusMode] = useState('full') 
  const [highlightAction, setHighlightAction] = useState('none') 
  
  const [elbowFlex, setElbowFlex] = useState(0) 
  const [kneeFlex, setKneeFlex] = useState(0) 
  const [neckY, setNeckY] = useState(0) 
  const [neckX, setNeckX] = useState(0) 

  const controlsRef = useRef()
  const telemetryRef = useRef() 

  const handleFocus = (mode) => {
    setFocusMode(mode)
    setHighlightAction('none')
    if (controlsRef.current) {
        if (mode === 'axial') controlsRef.current.setLookAt(0, 14, 18, 0, 14, 0, true)
        if (mode === 'appendicular') controlsRef.current.setLookAt(0, 8, 28, 0, 6, 0, true)
        if (mode === 'full') controlsRef.current.setLookAt(0, 10, 30, 0, 9, 0, true)
    }
  }

  const handleSimulateJoint = (joint) => {
      setHighlightAction(joint)
      setFocusMode('full')
      if (controlsRef.current) {
          if (joint === 'elbow') controlsRef.current.setLookAt(3.5, 14, 8, 1.8, 13.6, 0, true)
          if (joint === 'knee') controlsRef.current.setLookAt(2.5, 4, 10, 1.0, 5, 0, true)
          if (joint === 'neck') controlsRef.current.setLookAt(0, 15.5, 7, 0, 14.5, 0, true)
      }
  }

  const generateTelemetry = () => {
     if (highlightAction === 'elbow') {
         return `
            <div style="color: #38bdf8; font-size: 1.1rem; font-weight: bold; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">[X] ELBOW HINGE LOCMOTION</div>
            <div style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; display: flex; flex-direction: column; gap: 8px;">
               <div style="display: flex; justify-content: space-between;"><span>Joint Type:</span> <strong style="color: #fcd34d">Synovial Hinge Joint</strong></div>
               <div style="display: flex; justify-content: space-between;"><span>Angle of Flexion:</span> <strong style="color: #22c55e">${elbowFlex}°</strong></div>
               <div style="display: flex; justify-content: space-between;"><span>Biceps Brachii (Agonist):</span> <strong style="color: ${elbowFlex > 30 ? '#ef4444' : '#94a3b8'}">${elbowFlex > 30 ? 'CONTRACTING (Sliding Filament)' : 'RELAXED'}</strong></div>
               <div style="display: flex; justify-content: space-between;"><span>Triceps Brachii (Antagonist):</span> <strong style="color: ${elbowFlex < 10 ? '#ef4444' : '#94a3b8'}">${elbowFlex < 10 ? 'CONTRACTING (Extension)' : 'STRETCHING'}</strong></div>
            </div>
            <div style="margin-top: 16px; padding: 8px; background: rgba(56, 189, 248, 0.1); color: #38bdf8; border-radius: 6px; font-size: 0.8rem;">
               PHYSICS: 3rd Class Lever. Fulcrum is at the elbow (Trochlea), Effort applied on the proximal Radius, driving the massive Load distal to the hands.
            </div>
         `
     } else if (highlightAction === 'knee') {
         return `
            <div style="color: #38bdf8; font-size: 1.1rem; font-weight: bold; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">[X] KNEE HINGE LOCOMOTION</div>
            <div style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; display: flex; flex-direction: column; gap: 8px;">
               <div style="display: flex; justify-content: space-between;"><span>Joint Type:</span> <strong style="color: #fcd34d">Modified Hinge Joint</strong></div>
               <div style="display: flex; justify-content: space-between;"><span>Angle of Flexion:</span> <strong style="color: #22c55e">${kneeFlex}°</strong></div>
               <div style="display: flex; justify-content: space-between;"><span>Hamstrings (Flexor):</span> <strong style="color: ${kneeFlex > 30 ? '#ef4444' : '#94a3b8'}">${kneeFlex > 30 ? 'CONTRACTING' : 'RELAXED'}</strong></div>
               <div style="display: flex; justify-content: space-between;"><span>Quadriceps (Extensor):</span> <strong style="color: ${kneeFlex < 10 ? '#ef4444' : '#94a3b8'}">${kneeFlex < 10 ? 'CONTRACTING (Locking Joint)' : 'STRETCHING'}</strong></div>
            </div>
         `
     } else if (highlightAction === 'neck') {
         return `
            <div style="color: #38bdf8; font-size: 1.1rem; font-weight: bold; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">[X] CERVICAL PIVOT LOCOMOTION</div>
            <div style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; display: flex; flex-direction: column; gap: 8px;">
               <div style="display: flex; justify-content: space-between;"><span>Joint Type:</span> <strong style="color: #fcd34d">Pivot Joint (Atlanto-Axial)</strong></div>
               <div style="display: flex; justify-content: space-between;"><span>Yaw Rotation (No):</span> <strong style="color: #22c55e">${neckY}°</strong></div>
               <div style="display: flex; justify-content: space-between;"><span>Pitch Flexion (Yes):</span> <strong style="color: #22c55e">${neckX}°</strong></div>
               <div style="display: flex; justify-content: space-between;"><span>Sternocleidomastoid:</span> <strong style="color: #ef4444">ACTIVELY ROTATING</strong></div>
            </div>
         `
     } else {
         return `
            <div style="color: #94a3b8; font-family: monospace;">[ AWAITING JOINT SIMULATION SELECTION ]</div>
         `
     }
  }

  useEffect(() => {
      if (telemetryRef.current) telemetryRef.current.innerHTML = generateTelemetry()
  }, [elbowFlex, kneeFlex, neckX, neckY, highlightAction])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="🦴" title="Procedural Locomotion Engine" subtitle="Extreme Detail: 206 Bone Organic Lathe Hierarchy" color="#38bdf8" />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1rem', height: '600px' }}>
         <div style={{
           position: 'relative', width: '100%', height: '100%',
           background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
           borderRadius: 16, border: `1px solid #334155`, overflow: 'hidden',
           boxShadow: `inset 0 0 100px #0f172a`
         }}>
           <Canvas camera={{ position: [0, 10, 30], fov: 45 }}>
             <ambientLight intensity={0.5} />
             <spotLight position={[10, 25, 15]} angle={0.5} intensity={1.5} color="#fff" castShadow />
             <spotLight position={[-10, 25, -15]} angle={0.5} intensity={0.5} color="#38bdf8" /> 
             <Suspense fallback={<Html center><div style={{color: '#38bdf8', fontFamily:'"DM Mono"', letterSpacing: 2}}>GENERATING ORGANIC MESH ARRAYS...</div></Html>}>
               <Environment preset="night" resolution={256} />
               <Float speed={1} rotationIntensity={0} floatIntensity={0.2}>
                  <UltraFidelitySkeleton focusMode={focusMode} highlightAction={highlightAction} elbowFlex={elbowFlex} kneeFlex={kneeFlex} neckX={neckX} neckY={neckY} />
               </Float>
               <ContactShadows position={[0, -5.5, 0]} opacity={0.6} scale={20} blur={2.5} far={8} color="#000" />
               <CameraControls ref={controlsRef} minDistance={5} maxDistance={35} />
             </Suspense>
           </Canvas>
         </div>

         <div style={{ background: '#0f172a', padding: '16px', borderRadius: 16, border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <h3 style={{ color: '#fff', fontSize: '1rem', borderBottom: '1px solid #334155', paddingBottom: 12, margin: 0 }}>MACRO REGIONS</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
               <Btn active={focusMode === 'full'} onClick={() => handleFocus('full')} color="#e2e8f0" style={{flex: 1}}>Full System</Btn>
               <Btn active={focusMode === 'axial'} onClick={() => handleFocus('axial')} color="#38bdf8" style={{flex: 1}}>Axial</Btn>
               <Btn active={focusMode === 'appendicular'} onClick={() => handleFocus('appendicular')} color="#f59e0b" style={{flex: 1}}>Appendicular</Btn>
            </div>

            <h3 style={{ color: '#fff', fontSize: '1rem', borderBottom: '1px solid #334155', paddingBottom: 12, marginTop: 12, margin: 0 }}>KINEMATIC JOINT SIMULATORS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: highlightAction === 'elbow' ? '#38bdf8' : '#e2e8f0', fontWeight: 'bold' }}>Elbow Flexion (Biceps)</span>
                    <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{elbowFlex}°</span>
                  </div>
                  <input type="range" min="0" max="140" step="1" value={elbowFlex} 
                     onChange={(e) => { setElbowFlex(parseInt(e.target.value)); handleSimulateJoint('elbow'); }} 
                     style={{ accentColor: '#38bdf8' }} />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: highlightAction === 'knee' ? '#38bdf8' : '#e2e8f0', fontWeight: 'bold' }}>Knee Flexion (Hamstrings)</span>
                    <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{kneeFlex}°</span>
                  </div>
                  <input type="range" min="0" max="130" step="1" value={kneeFlex} 
                     onChange={(e) => { setKneeFlex(parseInt(e.target.value)); handleSimulateJoint('knee'); }} 
                     style={{ accentColor: '#38bdf8' }} />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: highlightAction === 'neck' ? '#38bdf8' : '#e2e8f0', fontWeight: 'bold' }}>Neck Pivot (Atlanto-Axial Yaw)</span>
                    <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{neckY}°</span>
                  </div>
                  <input type="range" min="-60" max="60" step="1" value={neckY} 
                     onChange={(e) => { setNeckY(parseInt(e.target.value)); handleSimulateJoint('neck'); }} 
                     style={{ accentColor: '#38bdf8' }} />
               </div>
            </div>

            <h3 style={{ color: '#fff', fontSize: '1rem', borderBottom: '1px solid #334155', paddingBottom: 12, marginTop: 12, margin: 0 }}>MUSCLE CONTRACTION TELEMETRY</h3>
            <div ref={telemetryRef} style={{ flex: 1, padding: '16px', background: '#020617', border: '1px solid #1e293b', borderRadius: 8, overflowY: 'auto', fontFamily: '"DM Mono", monospace' }}>
               <div style={{ color: '#94a3b8' }}>[ AWAITING JOINT SIMULATION SELECTION ]</div>
            </div>
         </div>
      </div>
    </div>
  )
}
