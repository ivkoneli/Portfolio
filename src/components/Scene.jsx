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

      {/* ── Lighting ─────────────────────────────────────────────────────────
          Three sources so every face of every object gets shaped light:

          1. hemisphereLight   — soft gradient from sky above to ground below.
             Fills shadows without flattening them. Works on ALL meshes.

          2. directionalLight  — main key light (top-right-front). Creates the
             bright highlight and cast shadows.

          3. directionalLight  — fill light (opposite side, cooler/dimmer).
             Softens the shadowed faces so they're dark but not black.
      ──────────────────────────────────────────────────────────────────────── */}
      <hemisphereLight
        args={['#1e1b4b', '#0a0a12', 0.7]}
      />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight
        position={[-8, 6, -8]}
        intensity={0.35}
        color="#a5b4fc"
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

      {/* Fog pushed back so foreground objects aren't washed out */}
      <fog attach="fog" args={['#0a0a0f', 24, 55]} />
    </Canvas>
  )
}
