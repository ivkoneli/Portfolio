import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import useGameStore from '../../store/gameStore'
import { ABOUT_ORIGIN, tileToWorld } from '../../data/layout'
import bustUrl from '../../assets/models/male_head.glb'

useGLTF.preload(bustUrl)

const AMBER        = '#f5a623'
const PEDESTAL_TOP = 1.125   // local top of the centre tile (CTR_Y + TILE_H/2)
const TARGET_H     = 6.0     // hologram height in world units
const ACTIVATE_R   = 3.2     // power on when the cube is within this radius (≈ the ring)
const FACE_OFFSET  = 0       // tweak if the head ends up facing away from the cube

// World centre of the island (the hologram sits here).
const [CX, , CZ] = tileToWorld(ABOUT_ORIGIN.col + 2, ABOUT_ORIGIN.row + 2)

export default function AboutHologram() {
  const { scene } = useGLTF(bustUrl)
  const spinRef  = useRef()
  const powerRef = useRef(0)
  const wasNear  = useRef(false)
  const latchRef = useRef(false)   // once switched on, the hologram stays on

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
      uTime:  { value: 0 },
      uPower: { value: 0.4 },
      uColor: { value: new THREE.Color(AMBER) },
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
      varying vec3 vN; varying vec3 vV; varying vec3 vW;
      void main() {
        float fres  = pow(1.0 - max(dot(normalize(vN), normalize(vV)), 0.0), 2.0);
        float scan  = 0.5 + 0.5 * sin(vW.y * 55.0 - uTime * 6.0);
        float flick = 0.9 + 0.1 * sin(uTime * 35.0 + vW.y * 8.0);
        float a = (0.05 + fres * 0.5) * (0.6 + 0.4 * scan) * flick * uPower;
        vec3 col = uColor * (0.55 + fres * 1.5) * flick;
        gl_FragColor = vec4(col, a);
      }
    `,
  }), [])

  // Glowing amber wireframe — the "edges only" structure. fog:false keeps the
  // whole model crisp (line materials otherwise fade into the scene fog).
  const wireMat = useMemo(() => new THREE.LineBasicMaterial({
    color: new THREE.Color(AMBER), transparent: true, opacity: 0.5,
    blending: THREE.NormalBlending, depthWrite: false, toneMapped: false, fog: false,
  }), [])

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    holoMat.uniforms.uTime.value = t

    // Switch on when the cube comes near; once on, it LATCHES and stays on.
    const { cubePos } = useGameStore.getState()
    const [wx, , wz] = tileToWorld(cubePos.col, cubePos.row)
    const dx = wx - CX, dz = wz - CZ
    const near = Math.hypot(dx, dz) <= ACTIVATE_R
    if (near) latchRef.current = true
    // aboutActive (E / click / prompt) tracks proximity; the visual stays latched.
    if (near !== wasNear.current) { wasNear.current = near; useGameStore.getState().setAboutActive(near) }

    const on = latchRef.current
    powerRef.current += ((on ? 1 : 0) - powerRef.current) * Math.min(1, dt * 3)
    holoMat.uniforms.uPower.value = powerRef.current
    wireMat.opacity = 0.55 * powerRef.current

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
