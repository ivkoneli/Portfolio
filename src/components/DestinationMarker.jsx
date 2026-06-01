import { Edges } from '@react-three/drei'
import useGameStore from '../store/gameStore'
import { tileToWorld, LAYOUT } from '../data/layout'

// Marks the tile the cube is travelling to (set on click, cleared on arrival).
// Distinct green so it reads as "go here", separate from the cyan hover outline.
// Raised on normal tiles (taller + they lift on hover) so it stays clearly visible.
export default function DestinationMarker() {
  const dest = useGameStore(s => s.moveDest)
  if (!dest) return null

  const isProject = LAYOUT[dest.row]?.[dest.col] === 2
  const height = isProject ? 0.52 : 0.60
  const y      = isProject ? 0    : 0.04

  const [x, , z] = tileToWorld(dest.col, dest.row)
  return (
    <mesh position={[x, y, z]} renderOrder={3}>
      <boxGeometry args={[1.04, height, 1.04]} />
      <meshBasicMaterial color="#4ade80" transparent opacity={0.22} depthWrite={false} />
      <Edges color="#4ade80" lineWidth={3} />
    </mesh>
  )
}
