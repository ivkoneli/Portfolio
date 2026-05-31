import { Edges } from '@react-three/drei'
import useGameStore from '../store/gameStore'
import { tileToWorld } from '../data/layout'

// Marks the tile the cube is travelling to (set on click, cleared on arrival).
// Distinct green so it reads as "go here", separate from the cyan hover outline.
export default function DestinationMarker() {
  const dest = useGameStore(s => s.moveDest)
  if (!dest) return null

  const [x, , z] = tileToWorld(dest.col, dest.row)
  return (
    <mesh position={[x, 0, z]} renderOrder={3}>
      <boxGeometry args={[1.02, 0.54, 1.02]} />
      <meshBasicMaterial color="#4ade80" transparent opacity={0.18} depthWrite={false} />
      <Edges color="#4ade80" lineWidth={2.5} />
    </mesh>
  )
}
