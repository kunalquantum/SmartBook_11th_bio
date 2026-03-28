import { useState, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, Float, ContactShadows, Environment, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { SimHeader, Btn, Slider, ProgressBar, Callout } from '../ui'
import { useInterval } from '../../hooks/useInterval'

const STEPS = ['Free Enzyme', 'Substrate Binds', 'ES Complex', 'Product Released']

const MODEL_INFO = {
  lockkey: {
    color: '#fbbf24',
    title: 'Lock & Key Model',
    author: 'Emil Fischer, 1894',
    desc: 'The active site has a rigid, pre-formed shape that exactly matches the substrate geometry. The shape does not change upon binding.',
  },
  induced: {
    color: '#a78bfa',
    title: 'Induced Fit Model',
    author: 'Daniel Koshland, 1958',
    desc: 'The active site is flexible and moulds itself around the substrate upon binding, changing shape to optimise the interaction.',
  },
}

function Enzyme3DScene({ model, animStep, temp, ph }) {
  const enzymeRef = useRef()
  const subRef = useRef()
  const prod1Ref = useRef()
  const prod2Ref = useRef()

  const isDenatured = temp > 55 || ph < 4 || ph > 10

  useFrame((state, delta) => {
    if (enzymeRef.current) {
      enzymeRef.current.rotation.y += delta * 0.15
      let targetScaleY = 1
      let targetScaleX = 1
      let targetScaleZ = 1
      
      if (isDenatured) {
        targetScaleY = 0.3
        targetScaleX = 1.4
        targetScaleZ = 1.4
      } else if (model === 'induced' && animStep === 2) {
        targetScaleY = 0.85
        targetScaleX = 0.95
        targetScaleZ = 1.1
      }

      enzymeRef.current.scale.y = THREE.MathUtils.lerp(enzymeRef.current.scale.y, targetScaleY, 5 * delta)
      enzymeRef.current.scale.x = THREE.MathUtils.lerp(enzymeRef.current.scale.x, targetScaleX, 5 * delta)
      enzymeRef.current.scale.z = THREE.MathUtils.lerp(enzymeRef.current.scale.z, targetScaleZ, 5 * delta)
    }

    if (subRef.current && prod1Ref.current && prod2Ref.current) {
      let subPos = new THREE.Vector3(0, 0, 0)
      let subScale = 1
      let p1Pos = new THREE.Vector3(0, 0, 0)
      let p2Pos = new THREE.Vector3(0, 0, 0)

      if (isDenatured) {
        subPos.set(2, 3, 0)
        p1Pos.set(2, 3, 0)
        p2Pos.set(2, 3, 0)
        subScale = 1
      } else {
        switch (animStep) {
          case 0: // Free
            subPos.set(-2.5, 2.5, 0.5)
            p1Pos.set(-2.5, 2.5, 0.5)
            p2Pos.set(-2.5, 2.5, 0.5)
            subScale = 1
            break
          case 1: // Binds
            subPos.set(0, 0.9, 0.4) 
            p1Pos.set(0, 0.9, 0.4)
            p2Pos.set(0, 0.9, 0.4)
            subScale = 1
            break
          case 2: // Complex
            subPos.set(0, 0.35, 0.2) 
            p1Pos.set(0, 0.35, 0.2)
            p2Pos.set(0, 0.35, 0.2)
            subScale = 1
            break
          case 3: // Released
            subPos.set(0, 0.8, 0.4)
            subScale = 0
            p1Pos.set(-2, 2.5, 1)
            p2Pos.set(2, 2.8, -1)
            break
        }
      }

      subRef.current.position.lerp(subPos, 5 * delta)
      subRef.current.scale.setScalar(THREE.MathUtils.lerp(subRef.current.scale.x, subScale, 10 * delta))
      prod1Ref.current.position.lerp(p1Pos, 4 * delta)
      prod2Ref.current.position.lerp(p2Pos, 4 * delta)
      
      const prodScale = animStep === 3 && !isDenatured ? 1 : 0
      prod1Ref.current.scale.setScalar(THREE.MathUtils.lerp(prod1Ref.current.scale.x, prodScale, 10 * delta))
      prod2Ref.current.scale.setScalar(THREE.MathUtils.lerp(prod2Ref.current.scale.x, prodScale, 10 * delta))
    }
  })

  const enzColor = isDenatured ? '#3f3f46' : (model === 'lockkey' ? '#f59e0b' : '#8b5cf6')
  const subColor = '#06b6d4'

  return (
    <group>
      {/* Clean Physical Enzyme */}
      <Float speed={isDenatured ? 0 : 1} rotationIntensity={isDenatured ? 0 : 0.2} floatIntensity={isDenatured ? 0 : 0.3}>
        <mesh ref={enzymeRef} position={[0, -0.5, 0]}>
          <torusGeometry args={[1.4, 0.8, 64, 128]} />
          <meshPhysicalMaterial 
            color={enzColor} 
            roughness={isDenatured ? 0.9 : 0.15} 
            clearcoat={isDenatured ? 0 : 0.8} 
            clearcoatRoughness={0.1}
            transmission={isDenatured ? 0 : 0.2} 
            thickness={isDenatured ? 0 : 1.5} 
            ior={1.3}
          />
        </mesh>
      </Float>

      <Sparkles count={40} scale={10} size={1.5} speed={0.1} color="#38bdf8" opacity={0.3} />

      {/* Clean Substrate */}
      <mesh ref={subRef}>
        <icosahedronGeometry args={[0.55, 2]} />
        <meshPhysicalMaterial color={subColor} roughness={0.1} clearcoat={1} emissive={subColor} emissiveIntensity={animStep === 2 ? 0.8 : 0.1} />
      </mesh>

      {/* Clean Products */}
      <mesh ref={prod1Ref} scale={0}>
        <tetrahedronGeometry args={[0.4, 1]} />
        <meshPhysicalMaterial color="#f43f5e" roughness={0.2} emissive="#f43f5e" emissiveIntensity={0.6} />
      </mesh>
      <mesh ref={prod2Ref} scale={0}>
        <tetrahedronGeometry args={[0.4, 1]} />
        <meshPhysicalMaterial color="#10b981" roughness={0.2} emissive="#10b981" emissiveIntensity={0.6} />
      </mesh>

      {isDenatured && (
        <Html position={[0, -0.5, 2.5]} center zIndexRange={[100, 0]}>
          <div style={{ background: '#e11d48cc', padding: '6px 16px', borderRadius: 8, color: '#fff', fontFamily: '"Outfit", sans-serif', fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(225,29,72,0.4)', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Proteins Coagulated
          </div>
        </Html>
      )}
    </group>
  )
}

export function EnzymeSimulator() {
  const [model, setModel] = useState('lockkey')
  const [temp, setTemp] = useState(37)
  const [ph, setPh] = useState(7)
  const [animStep, setAnimStep] = useState(0)

  const isDenatured = temp > 55 || ph < 4 || ph > 10
  useInterval(() => {
    if (!isDenatured) {
      setAnimStep(s => (s + 1) % 4)
    } else {
      setAnimStep(0)
    }
  }, 1200)

  const m = MODEL_INFO[model]

  const tempEffect = Math.max(0, 1 - Math.abs(temp - 37) * 0.04)
  const phEffect   = Math.max(0, 1 - Math.abs(ph - 7) * 0.18)
  const activity   = isDenatured ? 0 : Math.round(tempEffect * phEffect * 100)
  const actColor = activity > 65 ? 'var(--emerald)' : activity > 35 ? 'var(--amber)' : 'var(--rose)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="⚗️" title="Medical 3D Catalysis" subtitle="Clean Geometric Enzyme Dynamics" color={m.color} />

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        <Btn active={model === 'lockkey'} onClick={() => setModel('lockkey')} color="#f59e0b">🔒 Rigid Match</Btn>
        <Btn active={model === 'induced'} onClick={() => setModel('induced')} color="#a78bfa">🔄 Induced Deformation</Btn>
      </div>

      <div style={{
        position: 'relative', width: '100%', height: 400,
        background: 'radial-gradient(ellipse at center, #0f172a 0%, #020617 100%)',
        borderRadius: 16, border: `1px solid ${m.color}40`, overflow: 'hidden',
        boxShadow: `inset 0 0 80px ${m.color}15`
      }}>
        <Canvas camera={{ position: [0, 2, 7], fov: 45 }}>
          <Environment preset="night" resolution={256} />
          <ambientLight intensity={0.4} />
          <spotLight position={[15, 15, 15]} angle={0.2} penumbra={1} intensity={1.5} color={m.color} />
          <pointLight position={[-15, -15, -15]} intensity={0.5} />
          
          <Suspense fallback={<Html center><div style={{color: m.color, fontFamily:'"DM Mono"'}}>LOADING PROTEINS...</div></Html>}>
            <Enzyme3DScene model={model} animStep={animStep} temp={temp} ph={ph} />
            <OrbitControls makeDefault enablePan={false} minDistance={3.5} maxDistance={10} autoRotate={!isDenatured} autoRotateSpeed={0.8} />
            <ContactShadows position={[0, -2.5, 0]} opacity={0.6} scale={12} blur={2.5} far={4.5} />
          </Suspense>
        </Canvas>

        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
            Biochemical State
          </div>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: animStep === i ? m.color : 'transparent',
                border: `1px solid ${m.color}`, transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transform: animStep === i ? 'scale(1.2)' : 'scale(1)',
                boxShadow: animStep === i ? `0 0 10px ${m.color}` : 'none'
              }} />
              <div style={{
                fontSize: '0.8rem', fontFamily: '"Outfit", sans-serif',
                color: animStep === i ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: animStep === i ? 600 : 400,
                transition: 'all 0.3s'
              }}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: 'var(--surface)', border: `1px solid ${m.color}30`,
        borderRadius: 10, padding: '1rem', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '0.95rem', color: m.color }}>{m.title}</div>
          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.65rem', color: 'var(--muted)' }}>{m.author}</div>
        </div>
        <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text)', marginTop: '0.6rem' }}>{m.desc}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', background: '#0f172a', padding: '1.25rem', borderRadius: 12, border: '1px solid #1e293b' }}>
        <Slider label="Incubator Temp (°C)" value={temp} min={0} max={70} onChange={setTemp} color={temp > 55 ? '#f43f5e' : '#10b981'} />
        <Slider label="Fluid pH" value={ph} min={0} max={14} step={0.5} onChange={setPh} color={(ph < 4 || ph > 10) ? '#f43f5e' : '#a78bfa'} />
        <ProgressBar value={activity} label="Catalytic Turnover Rate (%)" color={actColor} />
      </div>

      <Callout color={actColor}>
        {temp > 55 && <><strong style={{ color: '#f43f5e' }}>⚠️ Extreme Heat Coagulation</strong> — H-bonds holding the tertiary structure break. The active site completely physically collapses.</>}
        {temp <= 55 && temp < 10 && <><strong style={{ color: '#38bdf8' }}>❄️ Slow Thermodynamics</strong> — Low kinetic energy restricts substrate collision frequency in the fluid medium.</>}
        {temp <= 55 && temp >= 10 && ph < 4 && <><strong style={{ color: '#f43f5e' }}>⚠️ Acidic Disruption</strong> — Protons flood the active site residues, physically repelling the substrate.</>}
        {temp <= 55 && temp >= 10 && ph > 10 && <><strong style={{ color: '#f43f5e' }}>⚠️ Alkaline Geometry Distortion</strong> — Hydroxide ions mutate the geometric binding pocket.</>}
        {activity >= 80 && <>✅ <strong style={{ color: '#10b981' }}>Perfect Homeostasis ({temp}°C / pH {ph})</strong> — Maximum 3D structural stability.</>}
        {activity > 0 && activity < 80 && temp >= 10 && temp <= 55 && ph >= 4 && ph <= 10 && <>Reaction is unstable. Adjust constraints to achieve physical optimality.</>}
        {activity === 0 && temp <= 55 && temp >= 10 && ph >= 4 && ph <= 10 && <>Bonds degraded under current conditions.</>}
      </Callout>
    </div>
  )
}
