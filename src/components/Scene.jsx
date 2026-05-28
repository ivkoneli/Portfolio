import { useEffect, useRef } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import Cube from './Cube'
import Grid from './Grid'
import useGameStore from '../store/gameStore'
import { tileToWorld, CUBE_START } from '../data/layout'

// ContactShadows centred on the cube so shadows appear everywhere on the grid
function FollowingShadow() {
  const groupRef = useRef()
  useFrame(() => {
    if (!groupRef.current) return
    const { cubePos } = useGameStore.getState()
    const [cx, , cz] = tileToWorld(cubePos.col, cubePos.row)
    groupRef.current.position.set(cx, 0, cz)
  })
  return (
    <group ref={groupRef}>
      <ContactShadows
        position={[0, 0.06, 0]}
        opacity={0.5}
        scale={16}
        blur={2}
        far={2}
      />
    </group>
  )
}

// World position the camera targets on startup (cube's initial tile)
const [INIT_X, , INIT_Z] = tileToWorld(CUBE_START.col, CUBE_START.row)

// Camera sits this far from its look-at target, preserving the angular offset
const CAM_DX = 14
const CAM_DY = 18
const CAM_DZ = 14

// Fraction of remaining distance closed per frame — lower = smoother/lazier follow
const LERP = 0.025

function CameraFollow() {
  const { camera } = useThree()
  const targetRef = useRef({ x: INIT_X, z: INIT_Z })

  useEffect(() => {
    camera.fov = 28
    camera.near = 0.1
    camera.far = 200
    camera.position.set(INIT_X + CAM_DX, CAM_DY, INIT_Z + CAM_DZ)
    camera.lookAt(INIT_X, 0, INIT_Z)
    camera.updateProjectionMatrix()
  }, [camera])

  useFrame(() => {
    const { cubePos } = useGameStore.getState()
    const [cx, , cz] = tileToWorld(cubePos.col, cubePos.row)
    const t = targetRef.current

    t.x += (cx - t.x) * LERP
    t.z += (cz - t.z) * LERP

    camera.position.set(t.x + CAM_DX, CAM_DY, t.z + CAM_DZ)
    camera.lookAt(t.x, 0, t.z)
    camera.updateMatrixWorld()
  })

  return null
}

export default function Scene() {
  return (
    <Canvas shadows>
      <CameraFollow />

      {/* ── Lighting ─────────────────────────────────────────────────────────
          1. hemisphereLight   — soft gradient fill (sky/ground). No shadow.
          2. directionalLight  — key light [14,20,-14]. Casts shadows.
             Shadow direction: (-0.707,0,+0.707) = camera-left/backward.
          3. directionalLight  — cool fill from camera-left, lifts +Z face.
      ──────────────────────────────────────────────────────────────────────── */}
      <hemisphereLight args={['#1e1b4b', '#0a0a12', 0.35]} />
      <directionalLight
        position={[14, 20, -14]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight
        position={[-10, 6, 14]}
        intensity={0.30}
        color="#a5b4fc"
      />

      <Grid />
      <Cube />

      <FollowingShadow />

      {/* Fog pushed back so foreground objects aren't washed out */}
      <fog attach="fog" args={['#0a0a0f', 24, 55]} />
    </Canvas>
  )
}
