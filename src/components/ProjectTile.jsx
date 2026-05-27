import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Edges, Html } from '@react-three/drei'
import { tileToWorld } from '../data/layout'

const TILE_H    = 0.96   // 3× the original 0.32
const HALF_H    = TILE_H / 2   // 0.48
const GROUP_Y   = 0.05 - HALF_H  // −0.43 → keeps top face at y=0.05 (same as normal tiles)

const chipStyle = {
  display:      'inline-block',
  border:       '1px solid #c084fc',
  color:        '#c084fc',
  borderRadius: '999px',
  padding:      '2px 10px',
  fontSize:     '11px',
  fontWeight:   500,
  letterSpacing:'0.04em',
  whiteSpace:   'nowrap',
}

export default function ProjectTile({ tileOrigin, active, project }) {
  const meshRef = useRef()

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime
    // Keep emissive LOW so directional light controls the 3-D shading.
    // Idle: barely there. Active: subtle breathing glow.
    meshRef.current.material.emissiveIntensity = active
      ? 0.22 + Math.sin(t * 3) * 0.1
      : 0.06
  })

  const [cx, , cz] = tileToWorld(tileOrigin.col + 1, tileOrigin.row + 1)

  return (
    <group position={[cx, GROUP_Y, cz]}>

      {/* Tall rounded-box body.
          A lighter purple base + low emissive lets the directional light
          create proper highlight / shadow on each face → reads as 3-D.      */}
      <RoundedBox
        ref={meshRef}
        args={[2.96, TILE_H, 2.96]}
        radius={0.09}
        smoothness={4}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial
          color="#5b21b6"
          emissive="#7c3aed"
          emissiveIntensity={0.06}
          roughness={0.2}
          metalness={0.55}
        />
        {/* Bright edge rim — #f0abfc is a high-contrast light-pink-purple;
            far more visible against dark scene than a deeper purple.         */}
        <Edges color="#f0abfc" threshold={15} />
      </RoundedBox>

      {/* Text lying flat ON the tile surface.
          <Html transform> renders the div as a real 3-D plane so it rotates
          with the scene. rotation X = −90° makes it face upward.
          scale converts CSS px → world units (0.01 → 100 px = 1 world unit). */}
      {project && (
        <Html
          transform
          position={[0, HALF_H + 0.015, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={0.01}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div style={{
            width:      '240px',
            textAlign:  'center',
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            userSelect: 'none',
          }}>
            <p style={{
              margin:     '0 0 9px',
              fontSize:   '28px',
              fontWeight: 700,
              color:      '#ffffff',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
            }}>
              {project.name}
            </p>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
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
