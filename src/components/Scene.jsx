import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, ContactShadows } from '@react-three/drei'
import Cube from './Cube'

export default function Scene() {
  return (
    <Canvas shadows>
      {/* Telephoto-style camera: low FOV gives clean near-orthographic 2.5D look */}
      <PerspectiveCamera
        makeDefault
        fov={20}
        position={[14, 18, 14]}
        near={0.1}
        far={200}
      />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Placeholder floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      <Cube />

      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.6}
        scale={20}
        blur={2}
        far={4}
      />

      <fog attach="fog" args={['#0a0a0f', 20, 60]} />
    </Canvas>
  )
}
