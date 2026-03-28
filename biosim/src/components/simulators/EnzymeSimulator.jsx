import { useState, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, Float, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { SimHeader, Btn, Slider, ProgressBar, Callout } from '../ui'
import { useInterval } from '../../hooks/useInterval'

const STEPS = ['Free Enzyme', 'Substrate Binds', 'ES Complex', 'Product Released']

const MODEL_INFO = {
  lockkey: {
    color: 'var(--amber)',
    title: 'Lock & Key Model',
    author: 'Emil Fischer, 1894',
    desc: 'The active site has a rigid, pre-formed shape that exactly matches the substrate geometry. The shape does not change upon binding.',
  },
  induced: {
    color: 'var(--violet)',
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
    // 1. Enzyme logic (Denaturation & Induced Fit)
    if (enzymeRef.current) {
      // Base rotation
      enzymeRef.current.rotation.y += delta * 0.2
      
      let targetScaleY = 1
      let targetScaleX = 1
      
      if (isDenatured) {
        // Unfolds / collapses
        targetScaleY = 0.2
        targetScaleX = 1.5
      } else if (model === 'induced' && animStep === 2) {
        // Induced fit squeezes the active site (scales down slightly to "hug")
        targetScaleY = 0.8
        targetScaleX = 0.9
      }

      enzymeRef.current.scale.y = THREE.MathUtils.lerp(enzymeRef.current.scale.y, targetScaleY, 4 * delta)
      enzymeRef.current.scale.x = THREE.MathUtils.lerp(enzymeRef.current.scale.x, targetScaleX, 4 * delta)
    }

    // 2. Substrate / Product logic
    if (subRef.current && prod1Ref.current && prod2Ref.current) {
      let subPos = new THREE.Vector3(0, 0, 0)
      let subScale = 1
      let p1Pos = new THREE.Vector3(0, 0, 0)
      let p2Pos = new THREE.Vector3(0, 0, 0)

      if (isDenatured) {
        // Substrate floats away if denatured
        subPos.set(2, 3, 0)
        p1Pos.set(2, 3, 0)
        p2Pos.set(2, 3, 0)
        subScale = 1
      } else {
        switch (animStep) {
          case 0: // Free
            subPos.set(-2, 2.5, 0)
            p1Pos.set(-2, 2.5, 0)
            p2Pos.set(-2, 2.5, 0)
            subScale = 1
            break
          case 1: // Binds
            subPos.set(0, 0.8, 0.4) // Enters active site
            p1Pos.set(0, 0.8, 0.4)
            p2Pos.set(0, 0.8, 0.4)
            subScale = 1
            break
          case 2: // Complex
            subPos.set(0, 0.4, 0.2) // Deep in active site
            p1Pos.set(0, 0.4, 0.2)
            p2Pos.set(0, 0.4, 0.2)
            subScale = 1
            break
          case 3: // Released
            subPos.set(0, 0.8, 0.4)
            subScale = 0 // Original substrate disappears
            p1Pos.set(-1.5, 2.5, 1) // Product 1 flies left
            p2Pos.set(1.5, 2.8, -1) // Product 2 flies right
            break
        }
      }

      subRef.current.position.lerp(subPos, 4 * delta)
      subRef.current.scale.setScalar(THREE.MathUtils.lerp(subRef.current.scale.x, subScale, 8 * delta))
      
      prod1Ref.current.position.lerp(p1Pos, 4 * delta)
      prod2Ref.current.position.lerp(p2Pos, 4 * delta)
      
      const prodScale = animStep === 3 && !isDenatured ? 1 : 0
      prod1Ref.current.scale.setScalar(THREE.MathUtils.lerp(prod1Ref.current.scale.x, prodScale, 8 * delta))
      prod2Ref.current.scale.setScalar(THREE.MathUtils.lerp(prod2Ref.current.scale.x, prodScale, 8 * delta))
    }
  })

  // Material setup
  const enzColor = isDenatured ? '#555555' : (model === 'lockkey' ? '#ffb300' : '#8b5cf6')
  const subColor = '#00e5ff'

  return (
    <group>
      {/* The Enzyme (Kidney shape using bent Torus or grouped geometries) */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={enzymeRef} position={[0, -0.5, 0]}>
          <torusGeometry args={[1.2, 0.6, 32, 64]} />
          <meshPhysicalMaterial color={enzColor} roughness={0.3} clearcoat={1} transmission={0.2} opacity={0.9} transparent />
        </mesh>
      </Float>

      {/* The Substrate */}
      <mesh ref={subRef}>
        <octahedronGeometry args={[0.5]} />
        <meshPhysicalMaterial color={subColor} clearcoat={1} emissive={subColor} emissiveIntensity={animStep === 2 ? 0.8 : 0.1} />
      </mesh>

      {/* Product 1 */}
      <mesh ref={prod1Ref} scale={0}>
        <tetrahedronGeometry args={[0.4]} />
        <meshPhysicalMaterial color="#ff4d6d" clearcoat={1} emissive="#ff4d6d" emissiveIntensity={0.5} />
      </mesh>

      {/* Product 2 */}
      <mesh ref={prod2Ref} scale={0}>
        <tetrahedronGeometry args={[0.4]} />
        <meshPhysicalMaterial color="#00e099" clearcoat={1} emissive="#00e099" emissiveIntensity={0.5} />
      </mesh>

      {/* HTML Labels */}
      {isDenatured && (
        <Html position={[0, -0.5, 2]} center zIndexRange={[100, 0]}>
          <div style={{ background: '#ff333390', padding: '4px 12px', borderRadius: 8, color: '#fff', fontFamily: '"DM Mono"', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
            DENATURED ENZYME
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

  // Only animate if not denatured
  const isDenatured = temp > 55 || ph < 4 || ph > 10
  useInterval(() => {
    if (!isDenatured) {
      setAnimStep(s => (s + 1) % 4)
    } else {
      setAnimStep(0)
    }
  }, 1200)

  const m = MODEL_INFO[model]

  // Activity calculation
  const tempEffect = Math.max(0, 1 - Math.abs(temp - 37) * 0.04)
  const phEffect   = Math.max(0, 1 - Math.abs(ph - 7) * 0.18)
  const activity   = isDenatured ? 0 : Math.round(tempEffect * phEffect * 100)
  const actColor = activity > 65 ? 'var(--emerald)' : activity > 35 ? 'var(--amber)' : 'var(--rose)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="⚗️" title="3D Enzyme Mechanism" subtitle="Live WebGL Catalysis under dynamic conditions" color={m.color} />

      {/* Model selector */}
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        <Btn active={model === 'lockkey'} onClick={() => setModel('lockkey')} color="var(--amber)">🔒 Lock & Key</Btn>
        <Btn active={model === 'induced'} onClick={() => setModel('induced')} color="var(--violet)">🔄 Induced Fit</Btn>
      </div>

      {/* 3D Canvas rendering the Enzyme */}
      <div style={{
        position: 'relative', width: '100%', height: 350,
        background: 'radial-gradient(circle at center, #0a0a0a 0%, #000000 100%)',
        borderRadius: 16, border: `1px solid ${m.color}50`, overflow: 'hidden',
        boxShadow: `inset 0 0 60px ${m.color}15`
      }}>
        <Canvas camera={{ position: [0, 2, 6], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <Suspense fallback={<Html center><div style={{color: m.color, fontFamily:'"DM Mono"'}}>Loading 3D Engine...</div></Html>}>
            <Enzyme3DScene model={model} animStep={animStep} temp={temp} ph={ph} />
            <OrbitControls makeDefault enablePan={false} minDistance={3} maxDistance={10} autoRotate={!isDenatured} autoRotateSpeed={1} />
            <ContactShadows position={[0, -2, 0]} opacity={0.6} scale={10} blur={2} far={4} />
          </Suspense>
        </Canvas>

        {/* Reaction Progress Overlay */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase' }}>
            Live Mechanism
          </div>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: animStep === i ? m.color : 'transparent',
                border: `1px solid ${m.color}`, transition: 'all 0.3s'
              }} />
              <div style={{
                fontSize: '0.75rem', fontFamily: '"Outfit", sans-serif',
                color: animStep === i ? '#fff' : 'var(--muted)', fontWeight: animStep === i ? 600 : 400,
                transition: 'all 0.3s'
              }}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Model description */}
      <div style={{
        background: 'var(--surface)', border: `1px solid ${m.color}30`,
        borderRadius: 10, padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '0.9rem', color: m.color }}>{m.title}</div>
          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.62rem', color: 'var(--muted)' }}>{m.author}</div>
        </div>
        <p style={{ fontSize: '0.78rem', lineHeight: 1.7, color: 'var(--text)', marginTop: '0.4rem' }}>{m.desc}</p>
      </div>

      {/* Environmental factors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--surface)', padding: '1rem', borderRadius: 12, border: '1px solid var(--border)' }}>
        <Slider label="Temperature (°C)" value={temp} min={0} max={70} onChange={setTemp} color={temp > 55 ? 'var(--rose)' : 'var(--emerald)'} />
        <Slider label="pH" value={ph} min={0} max={14} step={0.5} onChange={setPh} color={(ph < 4 || ph > 10) ? 'var(--rose)' : 'var(--violet)'} />
        <ProgressBar value={activity} label="Relative Catalytic Activity (%)" color={actColor} />
      </div>

      {/* Dynamic callout */}
      <Callout color={actColor}>
        {temp > 55 && <><strong style={{ color: 'var(--rose)' }}>⚠️ Denaturation</strong> — Above ~50°C, H-bonds holding the enzyme's 3D tertiary structure break. The active site collapses.</>}
        {temp <= 55 && temp < 10 && <><strong style={{ color: 'var(--cyan)' }}>❄️ Low Activity</strong> — Low kinetic energy restricts substrate collisions.</>}
        {temp <= 55 && temp >= 10 && ph < 4 && <><strong style={{ color: 'var(--rose)' }}>⚠️ Acidic pH</strong> — Extreme acidity protonates active site residues, preventing binding.</>}
        {temp <= 55 && temp >= 10 && ph > 10 && <><strong style={{ color: 'var(--rose)' }}>⚠️ Alkaline pH</strong> — Extreme alkalinity deprotonates residues, distorting geometry.</>}
        {activity >= 80 && <>✅ <strong style={{ color: 'var(--emerald)' }}>Optimal conditions ({temp}°C / pH {ph})</strong> — Maximum 3D structural stability and catalytic turnover.</>}
        {activity > 0 && activity < 80 && temp >= 10 && temp <= 55 && ph >= 4 && ph <= 10 && <>Activity is moderate. Adjust Temperature and pH to achieve the optimal geometric fit.</>}
        {activity === 0 && temp <= 55 && temp >= 10 && ph >= 4 && ph <= 10 && <>Enzyme inactive under these conditions.</>}
      </Callout>
    </div>
  )
}
