import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import useGameStore from '../../store/gameStore'
import { tileToWorld } from '../../data/layout'

// Glowing green dots down the middle of the BFS path, shown only after a click.
// The cube consumes them as it lands (pathTiles shrinks in Cube's onRest), so the
// trail visibly disappears under the cube step by step.
const COLOR = '#4ade80'
const DOT_Y = 0.34   // just above the tile top face (~0.275)

export default function PathDots() {
  const path = useGameStore(s => s.pathTiles)
  const groupRef = useRef()

  // Subtle synced pulse so the dots read as live "lights".
  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.children.forEach((dot, i) => {
      const s = 1 + 0.22 * Math.sin(t * 4 - i * 0.6)
      dot.scale.setScalar(s)
    })
  })

  if (!path.length) return null

  return (
    <group ref={groupRef}>
      {path.map((tile) => {
        const [x, , z] = tileToWorld(tile.col, tile.row)
        return (
          <mesh key={`${tile.col}-${tile.row}`} position={[x, DOT_Y, z]}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshBasicMaterial color={COLOR} toneMapped={false} />
          </mesh>
        )
      })}
    </group>
  )
}
