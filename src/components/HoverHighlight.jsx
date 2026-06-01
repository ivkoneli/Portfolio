import { Edges } from '@react-three/drei'
import useGameStore from '../store/gameStore'
import { tileToWorld, LAYOUT } from '../data/layout'

// A single glowing outline that snaps to whichever tile the mouse is over.
// One mesh (not per-tile) so hovering doesn't re-render the whole grid.
// Normal tiles sit higher than project pedestals AND lift ~0.05 on hover, so
// the box is raised for them to clear the surface (no z-fighting / colour bleed).
export default function HoverHighlight() {
  const hovered = useGameStore(s => s.hoveredTile)
  if (!hovered) return null

  const isProject = LAYOUT[hovered.row]?.[hovered.col] === 2
  const height = isProject ? 0.5 : 0.58
  const y      = isProject ? 0   : 0.04

  const [x, , z] = tileToWorld(hovered.col, hovered.row)
  return (
    <mesh position={[x, y, z]} renderOrder={2}>
      <boxGeometry args={[1.02, height, 1.02]} />
      <meshBasicMaterial color="#7dd3fc" transparent opacity={0.18} depthWrite={false} />
      <Edges color="#7dd3fc" lineWidth={3} />
    </mesh>
  )
}
