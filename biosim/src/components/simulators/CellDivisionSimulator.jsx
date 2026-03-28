import { useState, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { SimHeader, StepPill, Btn } from '../ui'
import { useInterval } from '../../hooks/useInterval'

const MITOSIS_STEPS = [
  {
    name: 'Interphase', color: '#64748b', icon: '⭕', sub: 'G1 → S → G2',
    desc: 'Cell grows, DNA replicates. Chromatin is diffuse inside the nucleus. Cell prepares for division.',
  },
  {
    name: 'Prophase', color: '#8b5cf6', icon: '🔵', sub: 'Chromatin condenses',
    desc: 'Chromatin condenses into visible chromosomes. Centrioles move to poles. Nuclear envelope breaks down.',
  },
  {
    name: 'Metaphase', color: '#00e5ff', icon: '➡️', sub: 'Chromosomes align',
    desc: 'Chromosomes are maximally condensed and align perfectly at the metaphase plate (equator).',
  },
  {
    name: 'Anaphase', color: '#00e099', icon: '↕️', sub: 'Chromatids separate',
    desc: 'Centromeres split. Sister chromatids are rapidly pulled apart toward opposite poles by spindle fibers.',
  },
  {
    name: 'Telophase', color: '#ffb300', icon: '🔵🔵', sub: 'Two nuclei reform',
    desc: 'Chromatids reach poles and decondense. Two new nuclear envelopes reform. Cell elongates significantly.',
  },
  {
    name: 'Cytokinesis', color: '#ff4d6d', icon: '✂️', sub: 'Cytoplasm divides',
    desc: 'Cleavage furrow constricts, physically pinching and dividing the cell into two identical daughter cells.',
  },
]

// 4 Chromosomes for representation
const CHROMOSOMES = [
  { id: 0, y: 0.8, z: 0.5, color: '#ff4d6d' },
  { id: 1, y: 0.3, z: -0.5, color: '#00e5ff' },
  { id: 2, y: -0.3, z: 0.6, color: '#ffb300' },
  { id: 3, y: -0.8, z: -0.4, color: '#8b5cf6' },
]

function Mitosis3DScene({ step }) {
  const cellRef = useRef()
  const leftNucRef = useRef()
  const rightNucRef = useRef()
  const chromRefs = useRef(CHROMOSOMES.map(() => ({ left: null, right: null })))
  
  const poleLRef = useRef()
  const poleRRef = useRef()

  useFrame((state, delta) => {
    const smoothFactor = 4

    // 1. Cell Membrane Animation
    if (cellRef.current) {
      let targetScaleX = 1
      let targetOpacity = 0.12
      if (step === 3) targetScaleX = 1.3 // Anaphase
      if (step === 4) targetScaleX = 1.6 // Telophase
      if (step === 5) {
        targetScaleX = 2.4 // Cytokinesis
        targetOpacity = 0.05
      }
      cellRef.current.scale.x = THREE.MathUtils.lerp(cellRef.current.scale.x, targetScaleX, smoothFactor * delta)
      cellRef.current.material.opacity = THREE.MathUtils.lerp(cellRef.current.material.opacity, targetOpacity, smoothFactor * delta)
    }

    // 2. Nucleus Breakdown / Reform
    if (leftNucRef.current && rightNucRef.current) {
      let nucOpacity = 1
      let nucScale = 1
      let lx = 0, rx = 0
      let rNucOpacity = 0

      if (step === 0) { nucOpacity = 0.5; nucScale = 1.8 } // Interphase
      if (step === 1) { nucOpacity = 0.1; nucScale = 2.0 } // Prophase breaking
      if (step === 2 || step === 3) { nucOpacity = 0; nucScale = 0.1; } // Metaphase/Anaphase gone

      if (step >= 4) { // Telophase/Cyto reforming
        lx = -2.5; rx = 2.5
        nucOpacity = 0.4; rNucOpacity = 0.4; nucScale = 1.5;
        if (step === 5) { lx = -3; rx = 3; }
      }

      leftNucRef.current.material.opacity = THREE.MathUtils.lerp(leftNucRef.current.material.opacity, nucOpacity, smoothFactor * delta)
      leftNucRef.current.scale.setScalar(THREE.MathUtils.lerp(leftNucRef.current.scale.x, nucScale, smoothFactor * delta))
      leftNucRef.current.position.x = THREE.MathUtils.lerp(leftNucRef.current.position.x, lx, smoothFactor * delta)

      rightNucRef.current.material.opacity = THREE.MathUtils.lerp(rightNucRef.current.material.opacity, rNucOpacity, smoothFactor * delta)
      rightNucRef.current.scale.setScalar(THREE.MathUtils.lerp(rightNucRef.current.scale.x, nucScale, smoothFactor * delta))
      rightNucRef.current.position.x = THREE.MathUtils.lerp(rightNucRef.current.position.x, rx, smoothFactor * delta)
    }

    // 3. Poles (Centrioles)
    if (poleLRef.current && poleRRef.current) {
      let px = 0.6
      let op = 0
      if (step >= 1) { px = 3.2; op = 1 } // Move to poles in Prophase
      if (step === 5) { px = 4.5; op = 0.3 }
      
      poleLRef.current.position.x = THREE.MathUtils.lerp(poleLRef.current.position.x, -px, smoothFactor * delta)
      poleRRef.current.position.x = THREE.MathUtils.lerp(poleRRef.current.position.x, px, smoothFactor * delta)
      poleLRef.current.material.opacity = THREE.MathUtils.lerp(poleLRef.current.material.opacity, op, smoothFactor * delta)
      poleRRef.current.material.opacity = THREE.MathUtils.lerp(poleRRef.current.material.opacity, op, smoothFactor * delta)
    }

    // 4. Chromosomes
    CHROMOSOMES.forEach((c, i) => {
      const l = chromRefs.current[i].left
      const r = chromRefs.current[i].right
      if (!l || !r) return

      let txL = 0, tyL = 0, tzL = 0, rzL = 0.4
      let txR = 0, tyR = 0, tzR = 0, rzR = -0.4
      let op = 1

      if (step === 0) { // Interphase
        op = 0; 
        txL = Math.sin(c.id*9)*0.5; tyL = Math.cos(c.id*7)*0.5;
        txR = Math.sin(c.id*9)*0.5; tyR = Math.cos(c.id*7)*0.5;
      } else if (step === 1) { // Prophase
        txL = Math.sin(c.id*2)*0.8; tyL = Math.cos(c.id*3)*0.8; tzL = c.z*0.5;
        txR = txL; tyR = tyL; tzR = tzL;
      } else if (step === 2) { // Metaphase
        tyL = c.y; tzL = c.z;
        tyR = c.y; tzR = c.z;
      } else if (step === 3) { // Anaphase
        txL = -1.8; tyL = c.y * 0.6; tzL = c.z; rzL = -0.1 // V shape dragging
        txR =  1.8; tyR = c.y * 0.6; tzR = c.z; rzR = 0.1
      } else if (step >= 4) { // Telophase/Cyto
        txL = -2.5 + Math.sin(c.id*2)*0.4; tyL = Math.cos(c.id*2)*0.4; tzL = c.z*0.5; rzL = Math.sin(c.id);
        txR =  2.5 + Math.sin(c.id*2)*0.4; tyR = Math.cos(c.id*2)*0.4; tzR = c.z*0.5; rzR = Math.cos(c.id);
        op = step === 5 ? 0 : 0.6
      }

      l.position.lerp(new THREE.Vector3(txL, tyL, tzL), smoothFactor * delta)
      l.rotation.z = THREE.MathUtils.lerp(l.rotation.z, rzL, smoothFactor * delta)
      l.material.opacity = THREE.MathUtils.lerp(l.material.opacity, op, smoothFactor * delta)

      r.position.lerp(new THREE.Vector3(txR, tyR, tzR), smoothFactor * delta)
      r.rotation.z = THREE.MathUtils.lerp(r.rotation.z, rzR, smoothFactor * delta)
      r.material.opacity = THREE.MathUtils.lerp(r.material.opacity, op, smoothFactor * delta)
    })
  })

  return (
    <group>
      {/* Dynamic Cell Membrane */}
      <mesh ref={cellRef}>
        <sphereGeometry args={[3.2, 64, 64]} />
        <meshPhysicalMaterial color="#00e5ff" transparent opacity={0.12} transmission={0.9} roughness={0.1} depthWrite={false} />
      </mesh>

      {/* Reforming Nuclei */}
      <mesh ref={leftNucRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.4} depthWrite={false} />
      </mesh>
      <mesh ref={rightNucRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Poles (Centrioles) */}
      <mesh ref={poleLRef} position={[-0.8, 0, 0]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.6]} />
        <meshBasicMaterial color="#ffb300" transparent />
      </mesh>
      <mesh ref={poleRRef} position={[0.8, 0, 0]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.6]} />
        <meshBasicMaterial color="#ffb300" transparent />
      </mesh>

      {/* Chromosomes */}
      {CHROMOSOMES.map((c, i) => (
        <group key={c.id}>
          {/* Left Chromatid */}
          <mesh ref={el => chromRefs.current[i].left = el}>
            <capsuleGeometry args={[0.08, 0.8, 4, 16]} />
            <meshStandardMaterial color={c.color} roughness={0.4} transparent opacity={0} emissive={c.color} emissiveIntensity={0.5} />
            {(step === 2 || step === 3) && (
              <mesh position={[-1.6, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                <cylinderGeometry args={[0.015, 0.015, 3.2]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.25} />
              </mesh>
            )}
          </mesh>
          {/* Right Chromatid */}
          <mesh ref={el => chromRefs.current[i].right = el}>
            <capsuleGeometry args={[0.08, 0.8, 4, 16]} />
            <meshStandardMaterial color={c.color} roughness={0.4} transparent opacity={0} emissive={c.color} emissiveIntensity={0.5} />
            {(step === 2 || step === 3) && (
              <mesh position={[1.6, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                <cylinderGeometry args={[0.015, 0.015, 3.2]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.25} />
              </mesh>
            )}
          </mesh>
        </group>
      ))}

      {/* Dynamic Annotations */}
      {step === 2 && (
        <Html position={[0, 3.5, 0]} center zIndexRange={[100,0]}>
          <div style={{ background: '#00e5ff40', border: '1px solid #00e5ff', padding: '4px 12px', borderRadius: 8, color: '#fff', fontSize: '10px', whiteSpace: 'nowrap', fontFamily: '"DM Mono"' }}>Metaphase Plate</div>
        </Html>
      )}
      {step === 3 && (
        <Html position={[0, -3.5, 0]} center zIndexRange={[100,0]}>
          <div style={{ background: '#00e09940', border: '1px solid #00e099', padding: '4px 12px', borderRadius: 8, color: '#fff', fontSize: '10px', whiteSpace: 'nowrap', fontFamily: '"DM Mono"' }}>Sister Chromatids separating</div>
        </Html>
      )}
    </group>
  )
}

export function CellDivisionSimulator() {
  const [step, setStep] = useState(0)
  const [auto, setAuto] = useState(false)

  useInterval(() => {
    if (auto) {
      setStep(s => (s + 1) % MITOSIS_STEPS.length)
    }
  }, 3500)

  const s = MITOSIS_STEPS[step]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="🔄" title="3D Mitosis Choreography" subtitle="Observe the beautiful mechanics of cell division" color="var(--violet)" />

      {/* Phase pills */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {MITOSIS_STEPS.map((ms, i) => (
          <StepPill key={ms.name} label={ms.name} active={step === i} color={ms.color}
            onClick={() => { setStep(i); setAuto(false) }} />
        ))}
      </div>

      {/* 3D Canvas rendering the Mitosis Phase */}
      <div style={{
        position: 'relative', width: '100%', height: 400,
        background: 'radial-gradient(ellipse at center, #0b0f19 0%, #000000 100%)',
        borderRadius: 16, border: `1px solid ${s.color}40`, overflow: 'hidden',
        boxShadow: `inset 0 0 80px ${s.color}15`, transition: 'all 0.5s', marginTop: '0.5rem'
      }}>
        <Canvas camera={{ position: [0, 0, 9], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={1} />
          
          <Suspense fallback={<Html center><div style={{color: s.color, fontFamily:'"DM Mono"'}}>Loading Mitosis Engine...</div></Html>}>
            <Mitosis3DScene step={step} />
            <OrbitControls makeDefault enablePan={false} minDistance={4} maxDistance={15} autoRotate autoRotateSpeed={0.5} />
            <ContactShadows position={[0, -3.5, 0]} opacity={0.6} scale={15} blur={2.5} far={5} />
          </Suspense>
        </Canvas>

        {/* HUD Overlay */}
        <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', flexDirection: 'column', gap: '0.2rem', pointerEvents: 'none' }}>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.6rem', color: '#fff', textShadow: `0 2px 10px ${s.color}`, transition: 'all 0.5s' }}>
            {s.name}
          </div>
          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.7rem', color: s.color, fontWeight: 600, textTransform: 'uppercase', transition: 'all 0.5s' }}>
            {s.sub}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
        <Btn onClick={() => { setStep(s => (s - 1 + MITOSIS_STEPS.length) % MITOSIS_STEPS.length); setAuto(false) }} color="var(--muted)">← Prev Phase</Btn>
        <Btn active={auto} onClick={() => setAuto(a => !a)} color={auto ? 'var(--rose)' : 'var(--violet)'}>{auto ? '⏹ Stop' : '▶ Play Choreography'}</Btn>
        <Btn onClick={() => { setStep(s => (s + 1) % MITOSIS_STEPS.length); setAuto(false) }} color="var(--muted)">Next Phase →</Btn>
      </div>

      {/* Description Panel */}
      <div key={s.name} className="animate-fadeUp" style={{
        background: 'var(--surface)', border: `1px solid ${s.color}40`,
        borderRadius: 14, padding: '1rem 1.25rem', textAlign: 'center'
      }}>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text)' }}>{s.desc}</p>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--dim)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${((step + 1) / MITOSIS_STEPS.length) * 100}%`, background: s.color, borderRadius: 2, transition: 'width 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} />
        </div>
      </div>
    </div>
  )
}
