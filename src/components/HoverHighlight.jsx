import { Edges } from '@react-three/drei'
import useGameStore from '../store/gameStore'
import { tileToWorld } from '../data/layout'

// A single glowing outline that snaps to whichever tile the mouse is over.
// One mesh (not per-tile) so hovering doesn't re-render the whole grid.
export default function HoverHighlight() {
  const hovered = useGameStore(s => s.hoveredTile)
  if (!hovered) return null

  const [x, , z] = tileToWorld(hovered.col, hovered.row)
  return (
    <mesh position={[x, 0, z]} renderOrder={2}>
      <boxGeometry args={[1.0, 0.5, 1.0]} />
      <meshBasicMaterial color="#7dd3fc" transparent opacity={0.12} depthWrite={false} />
      <Edges color="#7dd3fc" lineWidth={2} />
    </mesh>
  )
}
