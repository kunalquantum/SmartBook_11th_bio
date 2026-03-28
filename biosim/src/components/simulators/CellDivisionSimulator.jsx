import { useState, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, ContactShadows, Environment, Sparkles } from '@react-three/drei'
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

const CHROMOSOMES = [
  { id: 0, y: 0.9, z: 0.5, color: '#f43f5e' },
  { id: 1, y: 0.35, z: -0.6, color: '#0ea5e9' },
  { id: 2, y: -0.35, z: 0.6, color: '#eab308' },
  { id: 3, y: -0.9, z: -0.4, color: '#a855f7' },
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

    if (cellRef.current) {
      let targetScaleX = 1
      let targetOpacity = 1
      if (step === 3) targetScaleX = 1.35 
      if (step === 4) targetScaleX = 1.7 
      if (step === 5) {
        targetScaleX = 2.5 
        targetOpacity = 0.05
      }
      cellRef.current.scale.x = THREE.MathUtils.lerp(cellRef.current.scale.x, targetScaleX, smoothFactor * delta)
      cellRef.current.material.opacity = THREE.MathUtils.lerp(cellRef.current.material.opacity, targetOpacity, smoothFactor * delta)
    }

    if (leftNucRef.current && rightNucRef.current) {
      let nucOpacity = 1
      let nucScale = 1
      let lx = 0, rx = 0
      let rNucOpacity = 0

      if (step === 0) { nucOpacity = 0.5; nucScale = 1.8 }
      if (step === 1) { nucOpacity = 0.15; nucScale = 2.1 } 
      if (step === 2 || step === 3) { nucOpacity = 0; nucScale = 0.1; } 

      if (step >= 4) { 
        lx = -2.8; rx = 2.8
        nucOpacity = 0.45; rNucOpacity = 0.45; nucScale = 1.5;
        if (step === 5) { lx = -3.2; rx = 3.2; }
      }

      leftNucRef.current.material.opacity = THREE.MathUtils.lerp(leftNucRef.current.material.opacity, nucOpacity, smoothFactor * delta)
      leftNucRef.current.scale.setScalar(THREE.MathUtils.lerp(leftNucRef.current.scale.x, nucScale, smoothFactor * delta))
      leftNucRef.current.position.x = THREE.MathUtils.lerp(leftNucRef.current.position.x, lx, smoothFactor * delta)

      rightNucRef.current.material.opacity = THREE.MathUtils.lerp(rightNucRef.current.material.opacity, rNucOpacity, smoothFactor * delta)
      rightNucRef.current.scale.setScalar(THREE.MathUtils.lerp(rightNucRef.current.scale.x, nucScale, smoothFactor * delta))
      rightNucRef.current.position.x = THREE.MathUtils.lerp(rightNucRef.current.position.x, rx, smoothFactor * delta)
    }

    if (poleLRef.current && poleRRef.current) {
      let px = 0.8
      let op = 0
      if (step >= 1) { px = 3.6; op = 1 } 
      if (step === 5) { px = 5.0; op = 0.2 }
      
      poleLRef.current.position.x = THREE.MathUtils.lerp(poleLRef.current.position.x, -px, smoothFactor * delta)
      poleRRef.current.position.x = THREE.MathUtils.lerp(poleRRef.current.position.x, px, smoothFactor * delta)
      poleLRef.current.material.opacity = THREE.MathUtils.lerp(poleLRef.current.material.opacity, op, smoothFactor * delta)
      poleRRef.current.material.opacity = THREE.MathUtils.lerp(poleRRef.current.material.opacity, op, smoothFactor * delta)
    }

    CHROMOSOMES.forEach((c, i) => {
      const l = chromRefs.current[i].left
      const r = chromRefs.current[i].right
      if (!l || !r) return

      let txL = 0, tyL = 0, tzL = 0, rzL = 0.4
      let txR = 0, tyR = 0, tzR = 0, rzR = -0.4
      let op = 1

      if (step === 0) { 
        op = 0; 
        txL = Math.sin(c.id*9)*0.6; tyL = Math.cos(c.id*7)*0.6;
        txR = Math.sin(c.id*9)*0.6; tyR = Math.cos(c.id*7)*0.6;
      } else if (step === 1) { 
        txL = Math.sin(c.id*2)*0.9; tyL = Math.cos(c.id*3)*0.9; tzL = c.z*0.5;
        txR = txL; tyR = tyL; tzR = tzL;
      } else if (step === 2) { 
        tyL = c.y; tzL = c.z;
        tyR = c.y; tzR = c.z;
      } else if (step === 3) { 
        txL = -2.0; tyL = c.y * 0.65; tzL = c.z; rzL = -0.15 
        txR =  2.0; tyR = c.y * 0.65; tzR = c.z; rzR = 0.15
      } else if (step >= 4) { 
        txL = -2.8 + Math.sin(c.id*2)*0.4; tyL = Math.cos(c.id*2)*0.4; tzL = c.z*0.5; rzL = Math.sin(c.id);
        txR =  2.8 + Math.sin(c.id*2)*0.4; tyR = Math.cos(c.id*2)*0.4; tzR = c.z*0.5; rzR = Math.cos(c.id);
        op = step === 5 ? 0 : 0.7
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
      {/* Clean Physical Cell Membrane */}
      <mesh ref={cellRef}>
        <sphereGeometry args={[3.2, 64, 64]} />
        <meshPhysicalMaterial 
          color="#bae6fd" 
          thickness={0.5} 
          roughness={0.1} 
          transmission={0.9} 
          ior={1.2} 
          clearcoat={0.5}
          side={THREE.DoubleSide}
          transparent opacity={0.3}
          depthWrite={false}
        />
      </mesh>

      <Sparkles count={60} scale={6} size={1.5} speed={0.2} opacity={0.3} color="#bae6fd" />

      {/* Clean Nuclei Envelopes */}
      <mesh ref={leftNucRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhysicalMaterial color="#8b5cf6" roughness={0.4} clearcoat={0.5} transparent depthWrite={false} />
      </mesh>
      <mesh ref={rightNucRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhysicalMaterial color="#8b5cf6" roughness={0.4} clearcoat={0.5} transparent depthWrite={false} />
      </mesh>

      <mesh ref={poleLRef} position={[-0.8, 0, 0]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.7]} />
        <meshPhysicalMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={0.8} clearcoat={1} transparent />
      </mesh>
      <mesh ref={poleRRef} position={[0.8, 0, 0]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.7]} />
        <meshPhysicalMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={0.8} clearcoat={1} transparent />
      </mesh>

      {/* Clean Chromosomes */}
      {CHROMOSOMES.map((c, i) => (
        <group key={c.id}>
          <mesh ref={el => chromRefs.current[i].left = el}>
            <capsuleGeometry args={[0.12, 0.9, 16, 32]} />
            <meshPhysicalMaterial color={c.color} roughness={0.3} emissive={c.color} emissiveIntensity={0.4} transparent opacity={0} clearcoat={0.8} />
            {(step === 2 || step === 3) && (
              <mesh position={[-1.7, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                <cylinderGeometry args={[0.015, 0.015, 3.4]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
              </mesh>
            )}
          </mesh>
          <mesh ref={el => chromRefs.current[i].right = el}>
            <capsuleGeometry args={[0.12, 0.9, 16, 32]} />
            <meshPhysicalMaterial color={c.color} roughness={0.3} emissive={c.color} emissiveIntensity={0.4} transparent opacity={0} clearcoat={0.8} />
            {(step === 2 || step === 3) && (
              <mesh position={[1.7, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                <cylinderGeometry args={[0.015, 0.015, 3.4]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
              </mesh>
            )}
          </mesh>
        </group>
      ))}

      {step === 2 && (
        <Html position={[0, 3.8, 0]} center zIndexRange={[100,0]}>
          <div style={{ background: 'rgba(5,10,15,0.8)', border: '1px solid #00e5ff', padding: '6px 14px', borderRadius: 12, color: '#fff', fontSize: '0.85rem', whiteSpace: 'nowrap', fontFamily: '"Outfit", sans-serif', fontWeight: 'bold' }}>METAPHASE PLATE</div>
        </Html>
      )}
      {step === 3 && (
        <Html position={[0, -3.8, 0]} center zIndexRange={[100,0]}>
          <div style={{ background: 'rgba(5,10,15,0.8)', border: '1px solid #00e099', padding: '6px 14px', borderRadius: 12, color: '#fff', fontSize: '0.85rem', whiteSpace: 'nowrap', fontFamily: '"Outfit", sans-serif', fontWeight: 'bold' }}>CHROMATIDS SEPARATING</div>
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
      <SimHeader icon="🔄" title="Medical 3D Mitosis" subtitle="Clean Geometric Cell Division Visualiser" color="#8b5cf6" />

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {MITOSIS_STEPS.map((ms, i) => (
          <StepPill key={ms.name} label={ms.name} active={step === i} color={ms.color}
            onClick={() => { setStep(i); setAuto(false) }} />
        ))}
      </div>

      <div style={{
        position: 'relative', width: '100%', height: 450,
        background: 'radial-gradient(ellipse at center, #020617 0%, #000000 100%)',
        borderRadius: 16, border: `1px solid ${s.color}60`, overflow: 'hidden',
        boxShadow: `inset 0 0 100px ${s.color}20`, transition: 'all 0.5s', marginTop: '0.5rem'
      }}>
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <color attach="background" args={['#020617']} />
          <Environment preset="city" resolution={256} />
          <ambientLight intensity={0.2} />
          
          <spotLight position={[15, 15, 15]} angle={0.3} penumbra={1} intensity={2} color="#bae6fd" />
          <pointLight position={[-15,  0, 0]} intensity={1.5} color="#8b5cf6" />
          <pointLight position={[ 15,  0, 0]} intensity={1.5} color="#00e5ff" />
          
          <Suspense fallback={<Html center><div style={{color: s.color, fontFamily:'"DM Mono"', letterSpacing: '2px'}}>MAPPING CHROMOSOMES...</div></Html>}>
            <Mitosis3DScene step={step} />
            <OrbitControls makeDefault enablePan={false} minDistance={5} maxDistance={15} autoRotate autoRotateSpeed={0.4} />
            <ContactShadows position={[0, -4, 0]} opacity={0.6} scale={20} blur={3} far={6} />
          </Suspense>
        </Canvas>

        <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', flexDirection: 'column', gap: '0.2rem', pointerEvents: 'none' }}>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.2rem', color: '#fff', textShadow: `0 2px 20px ${s.color}`, transition: 'all 0.5s' }}>
            {s.name}
          </div>
          <div style={{ fontFamily: '"Outfit", sans-serif', fontSize: '0.8rem', color: s.color, fontWeight: 700, textTransform: 'uppercase', transition: 'all 0.5s', letterSpacing: '1px' }}>
            {s.sub}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'center' }}>
        <Btn onClick={() => { setStep(s => (s - 1 + MITOSIS_STEPS.length) % MITOSIS_STEPS.length); setAuto(false) }} color="#475569">← Back</Btn>
        <Btn active={auto} onClick={() => setAuto(a => !a)} color={auto ? '#f43f5e' : '#8b5cf6'}>{auto ? '⏹ Halt' : '▶ Automate Division'}</Btn>
        <Btn onClick={() => { setStep(s => (s + 1) % MITOSIS_STEPS.length); setAuto(false) }} color="#475569">Advance →</Btn>
      </div>

      <div key={s.name} className="animate-fadeUp" style={{
        background: '#0f172a', border: `1px solid ${s.color}60`,
        borderRadius: 14, padding: '1.25rem 1.5rem', textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
      }}>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: '#e2e8f0' }}>{s.desc}</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
        <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#1e293b', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${((step + 1) / MITOSIS_STEPS.length) * 100}%`, background: s.color, borderRadius: 3, transition: 'width 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} />
        </div>
      </div>
    </div>
  )
}
