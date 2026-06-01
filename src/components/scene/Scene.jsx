import { useEffect, useRef } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, ToneMapping, Vignette } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import Cube from './Cube'
import Grid from './Grid'
import VolumetricFog from './VolumetricFog'
import DepthPillars from './DepthPillars'
import useGameStore from '../../store/gameStore'
import { tileToWorld, CUBE_START } from '../../data/layout'

const BLOOM_ENABLED = true

const [INIT_X, , INIT_Z] = tileToWorld(CUBE_START.col, CUBE_START.row)

// Base camera offset from the follow target. The live zoom multiplier scales it,
// so the whole rig moves in/out along the same diagonal.
const CAM_DX = 16
const CAM_DY = 21
const CAM_DZ = 16
const LERP = 0.025

// Zoom: 1 = the old default. We start a touch further out, and pinch / wheel can
// push it between ZOOM_MIN (closest) and ZOOM_MAX (farthest).
const ZOOM_START = 1.3
const ZOOM_MIN   = 0.7
const ZOOM_MAX   = 2.6
const clampZoom  = v => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, v))

// Base fog band (matches the <fog> below). Three.js fog is distance-from-camera,
// so we scale it by the zoom each frame — otherwise zooming out sinks the whole
// board deeper into the fog and darkens it. Scaling keeps fog coverage constant.
const FOG_NEAR = 26
const FOG_FAR  = 60

// How far the one-finger pan can drift the view from the cube (world units),
// and how many world units one screen pixel of drag moves it.
const PAN_LIMIT  = 22
const PAN_PER_PX = 0.03
const clampPan   = v => Math.min(PAN_LIMIT, Math.max(-PAN_LIMIT, v))

function CameraFollow() {
  const { camera, gl, scene } = useThree()
  const targetRef = useRef({ x: INIT_X, z: INIT_Z })
  const zoomRef   = useRef(ZOOM_START)
  const panRef    = useRef({ x: 0, z: 0 })   // view offset from the cube, set by drag
  const recenterRef = useRef(false)          // glide pan back to the cube after a move
  const wasAnimRef  = useRef(false)

  useEffect(() => {
    const z = zoomRef.current
    camera.fov = 34
    camera.near = 0.1
    camera.far = 200
    camera.position.set(INIT_X + CAM_DX * z, CAM_DY * z, INIT_Z + CAM_DZ * z)
    camera.lookAt(INIT_X, 0, INIT_Z)
    camera.updateProjectionMatrix()
  }, [camera])

  // Touch gestures: one finger drags to pan, two fingers pinch to zoom. Mouse
  // wheel also zooms (handy on desktop).
  useEffect(() => {
    const el = gl.domElement
    let lastDist = null      // two-finger pinch distance
    let lastPan  = null      // { x, y } last one-finger position

    const onTouchStart = e => {
      if (e.touches.length === 1) lastPan = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const onTouchMove = e => {
      if (e.touches.length === 2) {
        lastPan = null
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const dist = Math.hypot(dx, dy)
        // Spread fingers (dist grows) → zoom in; pinch together → zoom out.
        if (lastDist != null && dist > 0) zoomRef.current = clampZoom(zoomRef.current * (lastDist / dist))
        lastDist = dist
        e.preventDefault()
      } else if (e.touches.length === 1 && lastPan) {
        const tch = e.touches[0]
        panByPixels(tch.clientX - lastPan.x, tch.clientY - lastPan.y)
        lastPan = { x: tch.clientX, y: tch.clientY }
        e.preventDefault()
      }
    }
    const onTouchEnd = e => {
      if (e.touches.length < 2)  lastDist = null
      if (e.touches.length === 0) lastPan = null
      else if (e.touches.length === 1) lastPan = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const onWheel = e => {
      zoomRef.current = clampZoom(zoomRef.current * (e.deltaY > 0 ? 1.1 : 0.9))
      e.preventDefault()
    }

    // Drag in screen pixels → shift the view across the ground plane, using the
    // camera's own right / forward(projected) axes so it tracks the iso angle.
    const panByPixels = (dx, dy) => {
      const m = camera.matrixWorld.elements
      let rX = m[0], rZ = m[2]                      // camera right axis (world XZ)
      let fX = -m[8], fZ = -m[10]                   // forward, projected to ground
      const rl = Math.hypot(rX, rZ) || 1; rX /= rl; rZ /= rl
      const fl = Math.hypot(fX, fZ) || 1; fX /= fl; fZ /= fl
      const k = PAN_PER_PX * zoomRef.current        // pan feels constant at any zoom
      const p = panRef.current
      recenterRef.current = false                   // grabbing to pan cancels a recenter
      p.x = clampPan(p.x + (-dx * rX + dy * fX) * k)
      p.z = clampPan(p.z + (-dx * rZ + dy * fZ) * k)
    }

    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove',  onTouchMove,  { passive: false })
    el.addEventListener('touchend',   onTouchEnd)
    el.addEventListener('wheel',      onWheel, { passive: false })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove',  onTouchMove)
      el.removeEventListener('touchend',   onTouchEnd)
      el.removeEventListener('wheel',      onWheel)
    }
  }, [gl, camera])

  useFrame(() => {
    const { cubePos, isAnimating } = useGameStore.getState()
    const [cx, , cz] = tileToWorld(cubePos.col, cubePos.row)
    const t = targetRef.current
    t.x += (cx - t.x) * LERP
    t.z += (cz - t.z) * LERP

    // When the cube finishes a move, glide the pan offset back onto the cube.
    if (wasAnimRef.current && !isAnimating) recenterRef.current = true
    wasAnimRef.current = isAnimating
    if (recenterRef.current) {
      const p = panRef.current
      p.x += (0 - p.x) * 0.12
      p.z += (0 - p.z) * 0.12
      if (Math.abs(p.x) < 0.02 && Math.abs(p.z) < 0.02) { p.x = 0; p.z = 0; recenterRef.current = false }
    }

    const z = zoomRef.current
    // View target = cube (lerped) + the user's pan offset.
    const tx = t.x + panRef.current.x
    const tz = t.z + panRef.current.z
    camera.position.set(tx + CAM_DX * z, CAM_DY * z, tz + CAM_DZ * z)
    camera.lookAt(tx, 0, tz)
    // Keep the fog locked to the board's depth as the camera moves in/out.
    if (scene.fog) {
      scene.fog.near = FOG_NEAR * z
      scene.fog.far  = FOG_FAR * z
    }
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
