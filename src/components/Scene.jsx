import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { useThree } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import Cube from './Cube'

// Positions the camera and calls lookAt — Drei's PerspectiveCamera only sets
// position, it never calls lookAt, so the camera stares off into empty space.
function CameraSetup() {
  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(14, 18, 14)
    camera.fov = 20
    camera.near = 0.1
    camera.far = 200
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera])
  return null
}

export default function Scene() {
  return (
    <Canvas shadows>
      <CameraSetup />

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
