// Day 1: Static cube placeholder — movement added Day 3, animation Day 4
export default function Cube() {
  return (
    <mesh position={[0, 0.5, 0]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6c63ff" roughness={0.3} metalness={0.4} />
    </mesh>
  )
}
