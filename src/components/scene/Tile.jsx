import { useEffect } from 'react'
import { Edges } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import useGameStore from '../../store/gameStore'

// A single 1×1 grid tile. Hover/click is handled globally by InteractionPlane;
// the tile only reads whether it's the hovered cell (a boolean selector, so
// only the entering/leaving tile re-renders) and lifts ~0.05 for feedback.
export default function Tile({ position, col, row }) {
  const isHovered = useGameStore(s => s.hoveredTile?.col === col && s.hoveredTile?.row === row)
  const [{ lift }, api] = useSpring(() => ({ lift: 0, config: { tension: 320, friction: 22 } }))

  useEffect(() => { api.start({ lift: isHovered ? 0.05 : 0 }) }, [isHovered, api])

  const [x, y, z] = position
  return (
    <animated.mesh position-x={x} position-y={lift.to(l => y + l)} position-z={z} receiveShadow>
      <boxGeometry args={[0.96, 0.45, 0.96]} />
      <meshStandardMaterial color="#1a2535" roughness={0.75} metalness={0.25} />
      <Edges color="#000000" threshold={15} />
    </animated.mesh>
  )
}
