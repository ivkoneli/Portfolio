import { useEffect, useRef } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, ToneMapping, Vignette } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import Cube from './Cube'
import Grid from './Grid'
import VolumetricFog from './VolumetricFog'
import DepthPillars from './DepthPillars'
import useGameStore from '../store/gameStore'
import { tileToWorld, CUBE_START } from '../data/layout'

const BLOOM_ENABLED = true

const [INIT_X, , INIT_Z] = tileToWorld(CUBE_START.col, CUBE_START.row)

const CAM_DX = 16
const CAM_DY = 21
const CAM_DZ = 16
const LERP = 0.025

function CameraFollow() {
  const { camera } = useThree()
  const targetRef = useRef({ x: INIT_X, z: INIT_Z })

  useEffect(() => {
    camera.fov = 34
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
  })

  return null
}

export default function Scene() {
  return (
    <Canvas shadows>
      <color attach="background" args={['#000000']} />
      <CameraFollow />

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
      <DepthPillars />
      <VolumetricFog />

      <fog attach="fog" args={['#000000', 26, 60]} />

      {BLOOM_ENABLED && (
        <EffectComposer multisampling={0}>
          <Bloom
            blendFunction={BlendFunction.ADD}
            intensity={2.0}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.02}
          />
          {/* Foggy bright centre, dark edges — vignette over the whole frame.
              offset = where darkening starts, darkness = how black the edges go. */}
          <Vignette offset={0.6} darkness={0.4} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
