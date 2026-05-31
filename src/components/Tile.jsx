import { Edges } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import useGameStore from '../store/gameStore'
import { worldToTile } from '../data/layout'

// A single 1×1 grid tile.
// Tile geometry is 0.96×0.45×0.96 so there's a small gap between tiles,
// which makes each tile's neon border fully visible (no overlapping edges).
// Pointer handlers drive hover-highlight, a small hover lift, and click-to-move
// (the hit point maps back to a grid cell, so this works for any tile mesh).
export default function Tile({ position }) {
  const setHoveredTile = useGameStore(s => s.setHoveredTile)
  const setMoveTarget  = useGameStore(s => s.setMoveTarget)
  const [{ lift }, api] = useSpring(() => ({ lift: 0, config: { tension: 320, friction: 22 } }))

  const setCell = e => {
    const cell = worldToTile(e.point.x, e.point.z)
    const cur = useGameStore.getState().hoveredTile
    if (!cur || cur.col !== cell.col || cur.row !== cell.row) setHoveredTile(cell)
  }
  const over  = e => { e.stopPropagation(); setCell(e); api.start({ lift: 0.05 }) }
  const move  = e => { e.stopPropagation(); setCell(e) }
  const out   = e => { e.stopPropagation(); setHoveredTile(null); api.start({ lift: 0 }) }
  const click = e => { e.stopPropagation(); setMoveTarget(worldToTile(e.point.x, e.point.z)) }

  const [x, y, z] = position
  return (
    <animated.mesh
      position-x={x}
      position-y={lift.to(l => y + l)}
      position-z={z}
      receiveShadow
      onPointerOver={over}
      onPointerMove={move}
      onPointerOut={out}
      onClick={click}
    >
      <boxGeometry args={[0.96, 0.45, 0.96]} />
      <meshStandardMaterial color="#1a2535" roughness={0.75} metalness={0.25} />
      <Edges color="#000000" threshold={15} />
    </animated.mesh>
  )
}
