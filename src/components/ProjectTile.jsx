import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import { tileToWorld } from '../data/layout'

// Renders a single 3×3 project tile mesh.
// tileOrigin = { col, row } of the top-left corner in the grid.
export default function ProjectTile({ tileOrigin, active }) {
  const meshRef = useRef()

  // Pulse the emissive intensity when the cube is on this tile
  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime
    meshRef.current.material.emissiveIntensity = active
      ? 0.4 + Math.sin(t * 3) * 0.2   // active: breathe brighter
      : 0.12                            // idle: subtle glow
  })

  // World position = center of the 3×3 zone (origin + 1 in each axis)
  const [cx, , cz] = tileToWorld(tileOrigin.col + 1, tileOrigin.row + 1)

  // 2.96 spans 3 grid units minus the 0.02 border gap on each side
  return (
    <mesh ref={meshRef} position={[cx, 0, cz]} receiveShadow>
      <boxGeometry args={[2.96, 0.14, 2.96]} />
      <meshStandardMaterial
        color="#1a0a2e"
        emissive="#7c3aed"
        emissiveIntensity={0.12}
        roughness={0.4}
        metalness={0.2}
      />
      <Edges color="#a855f7" threshold={15} />
    </mesh>
  )
}
