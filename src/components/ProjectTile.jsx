import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Edges, Html } from '@react-three/drei'
import { tileToWorld } from '../data/layout'

const chipStyle = {
  display: 'inline-block',
  border: '1px solid #a855f7',
  color: '#a855f7',
  borderRadius: '999px',
  padding: '2px 9px',
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.04em',
  whiteSpace: 'nowrap',
}

export default function ProjectTile({ tileOrigin, active, project }) {
  const meshRef = useRef()

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime
    meshRef.current.material.emissiveIntensity = active
      ? 0.45 + Math.sin(t * 3) * 0.2   // breathe when cube is on it
      : 0.14                             // subtle idle glow
  })

  const [cx, , cz] = tileToWorld(tileOrigin.col + 1, tileOrigin.row + 1)

  return (
    <group position={[cx, 0, cz]}>
      {/* Rounded tile body — RoundedBox keeps flat top/bottom so Edges shows
          a clean purple rim; the curved sides are smooth below the threshold  */}
      <RoundedBox
        ref={meshRef}
        args={[2.96, 0.32, 2.96]}
        radius={0.07}
        smoothness={4}
        receiveShadow
      >
        <meshStandardMaterial
          color="#1a0a2e"
          emissive="#7c3aed"
          emissiveIntensity={0.14}
          roughness={0.35}
          metalness={0.25}
        />
        <Edges color="#a855f7" threshold={15} />
      </RoundedBox>

      {/* Title + tech chips floating above the tile surface */}
      {project && (
        <Html
          position={[0, 0.42, 0]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div style={{
            textAlign: 'center',
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            userSelect: 'none',
          }}>
            <p style={{
              margin: '0 0 7px',
              fontSize: '15px',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.01em',
              textShadow: '0 0 14px rgba(168,85,247,0.9)',
              whiteSpace: 'nowrap',
            }}>
              {project.name}
            </p>
            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {project.tech.map(tag => (
                <span key={tag} style={chipStyle}>{tag}</span>
              ))}
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}
