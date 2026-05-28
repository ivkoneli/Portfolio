import { Edges } from '@react-three/drei'

// A single 1×1 grid tile.
// Tile geometry is 0.96×0.1×0.96 so there's a small gap between tiles,
// which makes each tile's neon border fully visible (no overlapping edges).
export default function Tile({ position }) {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={[0.96, 0.45, 0.96]} />
      <meshStandardMaterial color="#1a2535" roughness={0.75} metalness={0.25} />
      <Edges color="#000000" threshold={15} />
    </mesh>
  )
}
