import useGameStore from '../store/gameStore'
import { worldToTile, isWalkable } from '../data/layout'

// One invisible plane over the whole grid handles all hover/click, instead of
// raycasting ~50 separate tile meshes. The mouse always hits it, so there are
// no gaps, no per-tile precision, and nothing (pedestals/cards) competes for
// the ray. The hit point maps back to a grid cell.
const SIZE = 26

export default function InteractionPlane() {
  const setHoveredTile = useGameStore(s => s.setHoveredTile)
  const setMoveTarget  = useGameStore(s => s.setMoveTarget)

  const update = e => {
    const cell = worldToTile(e.point.x, e.point.z)
    if (!isWalkable(cell.col, cell.row)) {
      if (useGameStore.getState().hoveredTile) setHoveredTile(null)
      return
    }
    const cur = useGameStore.getState().hoveredTile
    if (!cur || cur.col !== cell.col || cur.row !== cell.row) setHoveredTile(cell)
  }
  const out   = () => setHoveredTile(null)
  const click = e => {
    const cell = worldToTile(e.point.x, e.point.z)
    if (isWalkable(cell.col, cell.row)) setMoveTarget(cell)
  }

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.26, 0]}
      onPointerMove={update}
      onPointerOut={out}
      onClick={click}
    >
      <planeGeometry args={[SIZE, SIZE]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}
