import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { useThree } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import Cube from './Cube'
import Grid from './Grid'
import ProjectPanel from './ProjectPanel'

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

      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <Grid />
      <Cube />
      <ProjectPanel />

      <ContactShadows
        position={[0, 0.06, 0]}
        opacity={0.5}
        scale={16}
        blur={2}
        far={2}
      />

      <fog attach="fog" args={['#0a0a0f', 18, 40]} />
    </Canvas>
  )
}
