import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Edges, Text } from '@react-three/drei'
import { tileToWorld } from '../data/layout'

// Half the cube height (cube = 1 unit tall)
const TILE_H = 0.5
const HALF_H = TILE_H / 2  // 0.25

// Group Y = 0 → tile centre at y=0 → top face at y=+0.25
// Normal tiles top at y=0.05, so this pedestal rises 0.20 above the floor.
// Cube bottom stays at y=0.05 — it sits slightly inside the top of the
// pedestal, which is intentional and barely noticeable in a stylised scene.
const GROUP_Y = 0

// Text rotation: −90° X lays it flat, +45° Y turns it to face the camera
// (camera is at [14,18,14] = northeast corner, so text "up" → SW = −X,−Z)
const TEXT_ROT = [-Math.PI / 2, Math.PI / 4, 0]
const TEXT_Y   = HALF_H + 0.02  // just above the tile top in group-local space

export default function ProjectTile({ tileOrigin, active, project }) {
  const meshRef = useRef()

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime
    meshRef.current.material.emissiveIntensity = active
      ? 0.25 + Math.sin(t * 3) * 0.1  // breathe when cube is on it
      : 0.06                            // subtle idle glow
  })

  const [cx, , cz] = tileToWorld(tileOrigin.col + 1, tileOrigin.row + 1)

  return (
    <group position={[cx, GROUP_Y, cz]}>

      <RoundedBox
        ref={meshRef}
        args={[2.96, TILE_H, 2.96]}
        radius={0.06}
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
        <Edges color="#f0abfc" threshold={15} />
      </RoundedBox>

      {/* Project name — <Text> is real 3-D geometry, always visible,
          no CSS scale tricks needed. Lies flat on the tile surface.     */}
      {project && (
        <>
          <Text
            position={[0, TEXT_Y, -0.25]}
            rotation={TEXT_ROT}
            fontSize={0.28}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            maxWidth={2.5}
            textAlign="center"
          >
            {project.name}
          </Text>

          {/* Tech tags — joined with dots, lighter purple */}
          <Text
            position={[0, TEXT_Y, 0.28]}
            rotation={TEXT_ROT}
            fontSize={0.13}
            color="#c084fc"
            anchorX="center"
            anchorY="middle"
            maxWidth={2.5}
            textAlign="center"
          >
            {project.tech.join('  ·  ')}
          </Text>
        </>
      )}
    </group>
  )
}
