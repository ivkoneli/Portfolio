import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import useGameStore from '../../store/gameStore'
import { ABOUT_ORIGIN, tileToWorld } from '../../data/layout'
import { playHologram } from '../../audio/sound'
import bustUrl from '../../assets/models/male_head.glb'

useGLTF.preload(bustUrl)

const AMBER        = '#f5a623'
const PEDESTAL_TOP = 1.125   // local top of the centre tile (CTR_Y + TILE_H/2)
const TARGET_H     = 6.0     // hologram height in world units
const ACTIVATE_R   = 3.2     // power on when the cube is within this radius (≈ the ring)
const FACE_OFFSET  = 0       // tweak if the head ends up facing away from the cube
const REVEAL_TIME  = 1.3     // seconds for the bottom-to-top fire-up
const BASE_Y       = PEDESTAL_TOP                 // world Y of the model base
const TOP_Y        = PEDESTAL_TOP + TARGET_H      // world Y of the model top

// World centre of the island (the hologram sits here).
const [CX, , CZ] = tileToWorld(ABOUT_ORIGIN.col + 2, ABOUT_ORIGIN.row + 2)

export default function AboutHologram() {
  const { scene } = useGLTF(bustUrl)
  const spinRef  = useRef()
  const powerRef = useRef(0)
  const wasNear  = useRef(false)
  const latchRef = useRef(false)   // once switched on, the hologram stays on
  const revealRef = useRef(0)      // 0→1 bottom-to-top fire-up

  // Bake node transforms into world-space geometry, then derive a scale + offset
  // so the model is centred in X/Z with its base on the pedestal.
  const { meshGeos, wireGeos, scaleFit, posFit } = useMemo(() => {
    scene.updateMatrixWorld(true)
    const meshGeos = []
    scene.traverse(o => {
      if (o.isMesh && o.geometry) {
        const g = o.geometry.clone()
        g.applyMatrix4(o.matrixWorld)
        meshGeos.push(g)
      }
    })
    const box = new THREE.Box3()
    meshGeos.forEach(g => { g.computeBoundingBox(); box.union(g.boundingBox) })
    const size = new THREE.Vector3(); box.getSize(size)
    const ctr  = new THREE.Vector3(); box.getCenter(ctr)
    const s = TARGET_H / (size.y || 1)
    return {
      meshGeos,
      wireGeos: meshGeos.map(g => new THREE.WireframeGeometry(g)),
      scaleFit: s,
      posFit: [-s * ctr.x, -s * box.min.y, -s * ctr.z],
    }
  }, [scene])

  // Translucent body: fresnel rim + horizontal scanlines, additive so overlapping
  // faces brighten the silhouette. Bloom turns it into a glow.
  const holoMat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    side: THREE.FrontSide, toneMapped: false,   // FrontSide: back faces don't add through the front
    uniforms: {
      uTime:   { value: 0 },
      uPower:  { value: 0.4 },
      uColor:  { value: new THREE.Color(AMBER) },
      uReveal: { value: 0 },
      uBaseY:  { value: BASE_Y },
      uTopY:   { value: TOP_Y },
    },
    vertexShader: `
      varying vec3 vN; varying vec3 vV; varying vec3 vW;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vW = wp.xyz;
        vN = normalize(mat3(modelMatrix) * normal);
        vV = normalize(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform float uTime; uniform float uPower; uniform vec3 uColor;
      uniform float uReveal; uniform float uBaseY; uniform float uTopY;
      varying vec3 vN; varying vec3 vV; varying vec3 vW;
      void main() {
        // Bottom-to-top fire-up: only the part below the reveal line is drawn.
        float h = clamp((vW.y - uBaseY) / (uTopY - uBaseY), 0.0, 1.0);
        if (h > uReveal) discard;
        float build = 1.0 - smoothstep(0.96, 1.0, uReveal);          // edge fades once built
        float edge  = smoothstep(uReveal - 0.06, uReveal, h) * build; // glowing construction line

        float fres  = pow(1.0 - max(dot(normalize(vN), normalize(vV)), 0.0), 2.0);
        float scan  = 0.5 + 0.5 * sin(vW.y * 55.0 - uTime * 6.0);
        float flick = 0.9 + 0.1 * sin(uTime * 35.0 + vW.y * 8.0);
        float a = (0.05 + fres * 0.5) * (0.6 + 0.4 * scan) * flick * uPower + edge * 0.7 * uPower;
        vec3 col = uColor * (0.55 + fres * 1.5 + edge * 2.5) * flick;
        gl_FragColor = vec4(col, a);
      }
    `,
  }), [])

  // Glowing amber wireframe — same height reveal as the body so they fire up
  // together (a ShaderMaterial so the lines can clip + glow at the build line).
  const wireMat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.NormalBlending, toneMapped: false,
    uniforms: {
      uColor:   { value: new THREE.Color(AMBER) },
      uOpacity: { value: 0 },
      uReveal:  { value: 0 },
      uBaseY:   { value: BASE_Y },
      uTopY:    { value: TOP_Y },
    },
    vertexShader: `
      varying vec3 vW;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vW = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor; uniform float uOpacity; uniform float uReveal; uniform float uBaseY; uniform float uTopY;
      varying vec3 vW;
      void main() {
        float h = clamp((vW.y - uBaseY) / (uTopY - uBaseY), 0.0, 1.0);
        if (h > uReveal) discard;
        float build = 1.0 - smoothstep(0.96, 1.0, uReveal);
        float edge  = smoothstep(uReveal - 0.06, uReveal, h) * build;
        gl_FragColor = vec4(uColor * (1.0 + edge * 1.8), uOpacity + edge * 0.5);
      }
    `,
  }), [])

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    holoMat.uniforms.uTime.value = t

    // Switch on when the cube comes near; once on, it LATCHES and stays on.
    const { cubePos } = useGameStore.getState()
    const [wx, , wz] = tileToWorld(cubePos.col, cubePos.row)
    const dx = wx - CX, dz = wz - CZ
    const near = Math.hypot(dx, dz) <= ACTIVATE_R
    if (near && !latchRef.current) { latchRef.current = true; playHologram() }   // fire-up sound, once
    // aboutActive (E / click / prompt) tracks proximity; the visual stays latched.
    if (near !== wasNear.current) { wasNear.current = near; useGameStore.getState().setAboutActive(near) }

    const on = latchRef.current
    powerRef.current += ((on ? 1 : 0) - powerRef.current) * Math.min(1, dt * 3)
    if (on) revealRef.current = Math.min(1, revealRef.current + dt / REVEAL_TIME)
    holoMat.uniforms.uPower.value = powerRef.current
    holoMat.uniforms.uReveal.value = revealRef.current
    wireMat.uniforms.uReveal.value = revealRef.current
    wireMat.uniforms.uOpacity.value = 0.55 * powerRef.current

    // Once on, the head keeps turning to watch the cube wherever it goes.
    if (spinRef.current) {
      const target = on ? Math.atan2(dx, dz) + FACE_OFFSET : FACE_OFFSET
      let diff = target - spinRef.current.rotation.y
      diff = Math.atan2(Math.sin(diff), Math.cos(diff))   // shortest way round
      spinRef.current.rotation.y += diff * Math.min(1, dt * 2.2)   // gentler ease
    }
  })

  const onModelClick = e => {
    if (!useGameStore.getState().aboutActive || useGameStore.getState().suppressClick) return
    e.stopPropagation()
    useGameStore.getState().setAboutOpen(true)
  }
  const onModelOver = e => {
    if (!useGameStore.getState().aboutActive) return
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
  }
  const onModelOut = () => { document.body.style.cursor = '' }

  return (
    <group position={[0, PEDESTAL_TOP, 0]}>
      <group ref={spinRef}>
        <group scale={scaleFit} position={posFit}>
          {meshGeos.map((g, i) => (
            <mesh key={i} geometry={g} material={holoMat} renderOrder={3}
              onClick={onModelClick} onPointerOver={onModelOver} onPointerOut={onModelOut} />
          ))}
          {wireGeos.map((g, i) => <lineSegments key={`w${i}`} geometry={g} material={wireMat} renderOrder={4} />)}
        </group>
      </group>
    </group>
  )
}
