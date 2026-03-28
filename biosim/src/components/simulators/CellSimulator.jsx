import { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Float, Environment, Sparkles, CameraControls, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { SimHeader, Callout, Btn } from '../ui'

const ORGANELLES_3D = [
  { id: 'nucleus', label: 'Nucleus', pos: [0, 0, 0], color: '#381c85', scale: 1.5, type: 'nucleus', 
    desc: 'Control centre of the cell. Contains DNA as chromatin. Bounded by a double nuclear envelope with nuclear pores. Dissection reveals the inner Nucleolus generating ribosomal RNA, enclosed by spiraling chromatin (DNA).' },
  { id: 'mito', label: 'Mitochondria', pos: [2.5, 1.2, 1.2], color: '#c2410c', scale: 0.65, type: 'mito', 
    desc: 'Powerhouse of the cell. Dissection exposes the highly folded inner membrane (cristae). The glowing yellow particles represent active synthesis and rapid release of ATP energy.' },
  { id: 'mito2', label: 'Mitochondria', pos: [-2.0, -1.5, -1.2], color: '#c2410c', scale: 0.55, type: 'mito', desc: '' },
  { id: 'mito3', label: 'Mitochondria', pos: [-1.2, 2.5, -0.5], color: '#c2410c', scale: 0.5, type: 'mito', desc: '' },
  { id: 'rer', label: 'Rough ER', pos: [-1.8, 0.5, 1.5], color: '#6d28d9', scale: 1.1, type: 'er', 
    desc: 'Rough Endoplasmic Reticulum — studded with ribosomes. Inside the folds, raw polypeptide chains are synthesised and modified into functional protein structures.' },
  { id: 'ser', label: 'Smooth ER', pos: [1.5, -2.0, -0.8], color: '#4c1d95', scale: 0.8, type: 'er', 
    desc: 'Smooth ER — lacks ribosomes. Its tubular networks act as a factory constantly synthesising lipids and detoxifying chemical hazards.' },
  { id: 'golgi', label: 'Golgi Complex', pos: [0, 2.2, -1.8], color: '#d97706', scale: 0.9, type: 'golgi', 
    desc: 'Cis–trans stack of cisternae. As it operates, you can see it pinching off glowing vesicles at the edges, actively dispatching packaged proteins toward the cell membrane.' },
  { id: 'lyso', label: 'Lysosome', pos: [-1.5, -0.2, -2.0], color: '#be123c', scale: 0.4, type: 'lyso', 
    desc: '"Suicidal bags" — contain potent acidic hydrolytic enzymes. Opening it reveals the aggressively bubbling acidic environment used to disintegrate and recycle cellular waste.' },
  { id: 'lyso2', label: 'Lysosome', pos: [2.2, 0.2, -1.5], color: '#be123c', scale: 0.35, type: 'lyso', desc: '' },
  { id: 'vacuole', label: 'Vacuole', pos: [1.8, -0.6, 2.0], color: '#0369a1', scale: 0.85, type: 'vacuole', 
    desc: 'Fluid-filled sac maintaining turgor pressure. Dissecting it reveals the pure liquid vacuolar sap separating from the cytoplasm.' }
]

function OrganelleDissector({ data, selected, onSelect }) {
  const isPrimary = !data.id.match(/\d+$/)
  const actualId = data.id.replace(/\d+$/, '')
  const isSelected = selected === actualId
  const isMuted = selected !== null && !isSelected

  const baseOpacity = isMuted ? 0.15 : 1

  // Generic animation refs
  const shellLRef = useRef()
  const shellRRef = useRef()
  const innerRef = useRef()
  const particleRef = useRef()

  // Golgi specific
  const stackRefs = useRef([])

  useFrame((state, delta) => {
    // 1. Clam-shell dissect animation for closed organelles
    if (shellLRef.current && shellRRef.current) {
      const targetAngle = isSelected ? Math.PI / 2.2 : 0 // Open wide
      shellLRef.current.rotation.y = THREE.MathUtils.lerp(shellLRef.current.rotation.y, targetAngle, 4 * delta)
      shellRRef.current.rotation.y = THREE.MathUtils.lerp(shellRRef.current.rotation.y, -targetAngle, 4 * delta)
    }

    // 2. Interior Functional Animations
    if (innerRef.current && isSelected) {
      if (data.type === 'nucleus') {
        // DNA Chromatin spinning rapidly
        innerRef.current.rotation.z += delta * 2.5
        innerRef.current.rotation.y += delta * 1.5
      } else if (data.type === 'mito') {
        // Inner cristae throbbing (ATP synthesis engine)
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.08
        innerRef.current.scale.setScalar(pulse)
      } else if (data.type === 'lyso') {
        // Acid enzymes bubbling violently
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.15
        innerRef.current.scale.setScalar(pulse)
      }
    }

    // 3. Golgi specific separation dissection
    if (data.type === 'golgi' && stackRefs.current.length > 0) {
      stackRefs.current.forEach((mesh, index) => {
        if (!mesh) return
        const originalY = (index - 1) * 0.35
        const expandedY = originalY * 2.5 // Spread out vertically
        const targetY = isSelected ? expandedY : originalY
        mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, targetY, 4 * delta)
        
        if (isSelected) {
          // Inner waves of processing
          mesh.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3 + index) * 0.05)
        }
      })
    }
  })

  return (
    <Float speed={isSelected ? 0.2 : 1} rotationIntensity={isPrimary ? 0.5 : 1} floatIntensity={0.5}>
      <mesh 
        position={data.pos} 
        scale={data.scale * (isSelected ? 1.3 : 1)} // Scales up slightly for clarity
        onClick={(e) => { e.stopPropagation(); onSelect(isSelected ? null : actualId) }} 
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'default'}
      >
        {/* === NUCLEUS DISSECTION (Nuclear Pores & Nucleolus) === */}
        {data.type === 'nucleus' && (
          <group>
            <mesh ref={shellLRef}>
              <sphereGeometry args={[1, 32, 32, 0, Math.PI]} />
              <meshPhysicalMaterial color={data.color} roughness={0.6} clearcoat={0.2} transparent opacity={baseOpacity * 0.9} side={THREE.DoubleSide} />
            </mesh>
            <mesh ref={shellRRef}>
              <sphereGeometry args={[1, 32, 32, Math.PI, Math.PI]} />
              <meshPhysicalMaterial color={data.color} roughness={0.6} clearcoat={0.2} transparent opacity={baseOpacity * 0.9} side={THREE.DoubleSide} />
            </mesh>
            {/* Structural Detail: Nuclear Pore Network */}
            <mesh scale={1.015}>
              <icosahedronGeometry args={[1, 4]} />
              <meshBasicMaterial color="#a78bfa" wireframe transparent opacity={baseOpacity * 0.15} />
            </mesh>
            {isSelected && (
              <group>
                 <mesh scale={0.35} position={[0,0,0]}>
                  {/* Heavily textured nucleolus surface */}
                  <dodecahedronGeometry args={[1, 2]} />
                  <meshPhysicalMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.8} />
                </mesh>
                <mesh ref={innerRef} scale={0.5}>
                  <torusKnotGeometry args={[1, 0.1, 100, 16, 3, 4]} />
                  <meshPhysicalMaterial color="#a78bfa" clearcoat={1} emissive="#a78bfa" emissiveIntensity={0.4} opacity={0.8} transparent />
                </mesh>
                <Sparkles count={50} scale={1.5} size={1} speed={1} color="#fb7185" />
              </group>
            )}
          </group>
        )}

        {/* === MITOCHONDRIA DISSECTION (Detailed Cristae) === */}
        {data.type === 'mito' && (
          <group rotation={[Math.PI/2, Math.PI/4, 0]}>
            <mesh ref={shellLRef}>
              <cylinderGeometry args={[0.4, 0.4, 1.6, 32, 1, false, 0, Math.PI]} />
              <meshPhysicalMaterial color={data.color} roughness={0.3} clearcoat={0.5} transparent opacity={baseOpacity} side={THREE.DoubleSide} />
              <mesh position={[0,0.8,0]}><sphereGeometry args={[0.4, 32, 32, 0, Math.PI]} /><meshPhysicalMaterial color={data.color} roughness={0.3} clearcoat={0.5} transparent opacity={baseOpacity} side={THREE.DoubleSide} /></mesh>
              <mesh position={[0,-0.8,0]}><sphereGeometry args={[0.4, 32, 32, 0, Math.PI]} /><meshPhysicalMaterial color={data.color} roughness={0.3} clearcoat={0.5} transparent opacity={baseOpacity} side={THREE.DoubleSide} /></mesh>
            </mesh>
            <mesh ref={shellRRef}>
              <cylinderGeometry args={[0.4, 0.4, 1.6, 32, 1, false, Math.PI, Math.PI]} />
              <meshPhysicalMaterial color={data.color} roughness={0.3} clearcoat={0.5} transparent opacity={baseOpacity} side={THREE.DoubleSide} />
              <mesh position={[0,0.8,0]}><sphereGeometry args={[0.4, 32, 32, Math.PI, Math.PI]} /><meshPhysicalMaterial color={data.color} roughness={0.3} clearcoat={0.5} transparent opacity={baseOpacity} side={THREE.DoubleSide} /></mesh>
              <mesh position={[0,-0.8,0]}><sphereGeometry args={[0.4, 32, 32, Math.PI, Math.PI]} /><meshPhysicalMaterial color={data.color} roughness={0.3} clearcoat={0.5} transparent opacity={baseOpacity} side={THREE.DoubleSide} /></mesh>
            </mesh>
            {(isSelected || true) && (
              <group scale={0.85}>
                {/* Advanced complex folded inner cristae tube */}
                <mesh ref={innerRef} scale={[0.3, 1.0, 0.3]}>
                  <torusKnotGeometry args={[1, 0.45, 128, 32, 2, 7]} />
                  <meshPhysicalMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={isSelected ? 0.6 : 0.1} transparent opacity={baseOpacity * 0.9} />
                </mesh>
                {isSelected && <Sparkles count={40} scale={[0.5, 1.5, 0.5]} size={3} speed={6} color="#fbbf24" />}
              </group>
            )}
          </group>
        )}

        {/* === ENDOPLASMIC RETICULUM (Ribosome Points & Tubular Knots) === */}
        {data.type === 'er' && (
          <group>
            {data.id.includes('rer') ? (
              <group>
                <mesh>
                  <torusKnotGeometry args={[0.7, 0.25, 128, 32]} />
                  <meshPhysicalMaterial color={data.color} roughness={0.3} clearcoat={0.5} transparent opacity={isSelected ? 0.4 : baseOpacity} />
                </mesh>
                {/* Millions of fixed Ribosomes dotting the RER surface visually using points! */}
                <points scale={1.01}>
                  <torusKnotGeometry args={[0.7, 0.25, 80, 24]} />
                  <pointsMaterial color="#fca5a5" size={0.02} sizeAttenuation transparent opacity={baseOpacity} />
                </points>
              </group>
            ) : (
              // Smooth ER is heavily folded and tubular without ribosomes
              <mesh>
                <torusKnotGeometry args={[0.8, 0.15, 128, 16, 3, 8]} />
                <meshPhysicalMaterial color={data.color} roughness={0.2} clearcoat={0.8} transparent opacity={isSelected ? 0.4 : baseOpacity} />
              </mesh>
            )}
            {isSelected && (
              <group>
                <mesh>
                  <torusKnotGeometry args={data.id.includes('rer') ? [0.7, 0.08, 128, 16] : [0.8, 0.04, 128, 16, 3, 8]} />
                  <meshPhysicalMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
                </mesh>
                <Sparkles count={100} scale={2} size={1.5} speed={4} color={data.id.includes('rer') ? '#fca5a5' : '#86efac'} />
              </group>
            )}
          </group>
        )}

        {/* === GOLGI COMPLEX (Vesicular Stack Rims) === */}
        {data.type === 'golgi' && (
          <group rotation={[Math.PI / 2, Math.PI, 0]}>
            {[1.2, 0.9, 0.6].map((r, i) => (
              <group key={i} position={[0, (i - 1) * 0.35, 0]} ref={el => stackRefs.current[i] = el}>
                <mesh>
                  <torusGeometry args={[r, 0.2, 32, 64, Math.PI]} />
                  <meshPhysicalMaterial color={data.color} roughness={0.2} clearcoat={0.8} transparent opacity={baseOpacity} />
                </mesh>
                {/* Visual pinched transport vesicles / cisterna edges */}
                <mesh position={[r, 0, 0]}>
                  <sphereGeometry args={[0.22, 16, 16]} />
                  <meshPhysicalMaterial color={data.color} roughness={0.2} clearcoat={0.8} transparent opacity={baseOpacity} />
                </mesh>
                <mesh position={[-r, 0, 0]}>
                  <sphereGeometry args={[0.22, 16, 16]} />
                  <meshPhysicalMaterial color={data.color} roughness={0.2} clearcoat={0.8} transparent opacity={baseOpacity} />
                </mesh>
              </group>
            ))}
            {isSelected && (
              <group position={[0, 1.5, 0]}>
                <Sparkles count={30} scale={[2, 2, 2]} size={4} speed={5} color="#fbbf24" />
              </group>
            )}
          </group>
        )}

        {/* === LYSOSOME & VACUOLE (Inner Enzyme/Chemical Chunks) === */}
        {(data.type === 'lyso' || data.type === 'vacuole') && (
          <group>
            <mesh ref={shellLRef}>
              <sphereGeometry args={[1, 32, 32, 0, Math.PI]} />
              <meshPhysicalMaterial color={data.color} roughness={0.1} clearcoat={1} transparent opacity={baseOpacity * 0.8} side={THREE.DoubleSide} />
            </mesh>
            <mesh ref={shellRRef}>
              <sphereGeometry args={[1, 32, 32, Math.PI, Math.PI]} />
              <meshPhysicalMaterial color={data.color} roughness={0.1} clearcoat={1} transparent opacity={baseOpacity * 0.8} side={THREE.DoubleSide} />
            </mesh>
            {isSelected && (
              <group ref={data.type === 'lyso' ? innerRef : null}>
                <mesh scale={0.7} position={[0,-0.1,0]}>
                  <sphereGeometry args={[1, 32, 32]} />
                  <meshPhysicalMaterial 
                    color={data.type === 'lyso' ? '#10b981' : '#bae6fd'} 
                    emissive={data.type === 'lyso' ? '#10b981' : '#bae6fd'} 
                    emissiveIntensity={0.4} 
                    transparent opacity={0.6}
                  />
                </mesh>
                {/* Floating enzyme crystals or waste inside the sac */}
                {[...Array(6)].map((_, i) => (
                   <mesh key={i} position={[Math.sin(i*4)*0.3, Math.cos(i*3)*0.3 - 0.1, Math.sin(i*7)*0.3]} scale={0.15}>
                      <dodecahedronGeometry args={[1, 0]} />
                      <meshPhysicalMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} transparent opacity={0.6} />
                   </mesh>
                ))}
              </group>
            )}
          </group>
        )}

        {/* Target Indicator Ring */}
        {isSelected && (
          <mesh rotation={[Math.PI/2, 0, 0]}>
            <ringGeometry args={[1.5, 1.55, 64]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
        )}
        
        {/* Floating Tooltip */}
        {isPrimary && (
          <Html position={[0, 2.0, 0]} center zIndexRange={[100, 0]}>
            <div style={{
              background: isSelected ? data.color : 'rgba(5, 10, 15, 0.85)',
              color: isSelected ? '#fff' : '#cbd5e1',
              padding: '6px 14px', borderRadius: 12, fontSize: '0.9rem',
              fontFamily: '"Outfit", sans-serif', fontWeight: 600,
              pointerEvents: 'none', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              border: `1px solid ${data.color}80`, whiteSpace: 'nowrap',
              boxShadow: isSelected ? `0 0 30px ${data.color}` : 'none',
              opacity: isMuted ? 0.05 : 1, transform: isSelected ? 'scale(1.1)' : 'scale(1)',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}>
              {data.label}
            </div>
          </Html>
        )}
      </mesh>
    </Float>
  )
}

function CellMembrane() {
  return (
    <mesh>
      <sphereGeometry args={[4.8, 64, 64]} />
      <meshPhysicalMaterial 
        color="#bae6fd"
        transparent opacity={0.25}
        roughness={0.1}
        transmission={0.9}
        thickness={0.5}
        ior={1.2}
        clearcoat={0.5}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export function CellSimulator() {
  const [selected, setSelected] = useState(null)
  const controlsRef = useRef()

  // Camera Zoom (Lerp via CameraControls API)
  useEffect(() => {
    if (selected) {
      const sel = ORGANELLES_3D.find(o => o.id === selected)
      // Fly directly to the organelle, offset slightly in Z and Y for perfect inspection view
      controlsRef.current?.setLookAt(
        sel.pos[0], sel.pos[1] + 1.5, sel.pos[2] + 4, // Intended camera pos
        sel.pos[0], sel.pos[1], sel.pos[2],           // Look at point
        true // Animate gracefully
      )
    } else {
      // Return to full cell view smoothly
      controlsRef.current?.setLookAt(
        0, 0, 11, // Base camera pos
        0, 0, 0,  // Look at center
        true 
      )
    }
  }, [selected])

  const sel = ORGANELLES_3D.find(o => o.id === selected)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SimHeader icon="🔬" title="Medical 3D Cell" subtitle="Interactive Organelle Dissection & Function" color="#38bdf8" />

      {/* 3D Canvas rendering the Interactive Cell */}
      <div style={{
        position: 'relative', width: '100%', height: 500,
        background: 'radial-gradient(circle at center, #020617 0%, #000000 100%)',
        borderRadius: 16, border: '1px solid #1e293b', overflow: 'hidden',
        boxShadow: 'inset 0 0 100px rgba(56, 189, 248, 0.05)'
      }}>
        <Canvas camera={{ position: [0, 0, 11], fov: 45 }}>
          <color attach="background" args={['#020617']} />
          <ambientLight intensity={0.2} />
          <spotLight position={[15, 15, 15]} angle={0.3} penumbra={1} intensity={1.5} color="#e0f2fe" />
          <pointLight position={[-15, -15, -15]} intensity={1} color="#38bdf8" />
          <pointLight position={[0, 0, 0]} intensity={0.8} color="#818cf8" />
          
          <Suspense fallback={<Html center><div style={{color:'#38bdf8', fontFamily:'"DM Mono"', letterSpacing: 2}}>LOADING CELL BIO...</div></Html>}>
            <Environment preset="night" resolution={256} />
            
            <group onClick={() => setSelected(null)}>
              <CellMembrane />
              
              <Sparkles count={60} scale={8} size={1.5} speed={0.2} opacity={0.4} color="#a7f3d0" />
              <Sparkles count={40} scale={6} size={2.5} speed={0.1} opacity={0.2} color="#fcd34d" />
              
              {ORGANELLES_3D.map(o => (
                <OrganelleDissector key={o.id} data={o} selected={selected} onSelect={setSelected} />
              ))}
            </group>
            
            {/* CameraControls is significantly smoother for transition-zooming than OrbitControls */}
            <CameraControls ref={controlsRef} minDistance={2} maxDistance={20} />
            <ContactShadows position={[0, -5, 0]} opacity={0.4} scale={20} blur={2.5} far={6} />
          </Suspense>
        </Canvas>
        
        {/* Overlay Helper Text */}
        <div style={{ position: 'absolute', bottom: 12, right: 12, fontFamily: '"DM Mono", monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }}>
          Select an Organelle to Dissect and Reveal Biology
        </div>
      </div>

      {/* Dissection Details Panel */}
      {sel ? (
        <Callout color={sel.color}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ color: sel.color, fontSize: '1.2rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{sel.label}</strong>
            <Btn onClick={() => setSelected(null)} color="#64748b" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>✖ Close Dissection</Btn>
          </div>
          <p style={{ marginTop: 8, lineHeight: 1.7, fontSize: '0.9rem' }}>{sel.desc}</p>
        </Callout>
      ) : (
        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--muted)', fontStyle: 'italic', padding: '0.5rem' }}>
          Tap on any structure inside the cytoplasm to automatically zoom in, dissect it, and watch its biological function!
        </div>
      )}

      {/* Quick-select UI Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center', marginTop: '0.5rem' }}>
        {ORGANELLES_3D.filter(o => !o.id.match(/\d+$/)).map(o => (
          <button key={o.id} onClick={() => setSelected(selected === o.id ? null : o.id)} style={{
            fontFamily: '"Outfit", sans-serif', fontSize: '0.8rem', fontWeight: 600,
            padding: '8px 16px', borderRadius: 12, cursor: 'pointer',
            border: `1px solid ${selected === o.id ? o.color : '#1e293b'}`,
            background: selected === o.id ? `${o.color}30` : '#0f172a',
            color: selected === o.id ? '#fff' : '#94a3b8',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: selected === o.id ? 'translateY(-3px)' : 'none',
            boxShadow: selected === o.id ? `0 8px 16px ${o.color}40` : '0 2px 4px rgba(0,0,0,0.2)'
          }}>{o.label}</button>
        ))}
      </div>
    </div>
  )
}
