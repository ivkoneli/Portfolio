import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Edges, Text } from '@react-three/drei'
import { tileToWorld, ABOUT_ORIGIN } from '../../data/layout'
import AboutHologram from './AboutHologram'

// Amber centrepiece, distinct from the project sections.
const ACCENT  = '#f5a623'
const OUTLINE = '#6b3d00'

// Match the grid tile height; step the dais up in whole tile-heights.
const TILE_H  = 0.45
const INNER_Y = TILE_H        // inner 3×3 sits one tile higher than the walkable ring
const CTR_Y   = TILE_H * 2     // centre tile sits two tile-heights up
const OFFS    = [-1, 0, 1]

// Title: stacked text layers extruded backward (−Z) to fake real 3D depth.
const TITLE_Y      = 8.4
const TITLE_Z      = 0.25
const TITLE_DEPTH  = 0.32
const TITLE_LAYERS = 10

export default function AboutIsland({ metalMaps }) {
  const dotRef   = useRef()
  const lightRef = useRef()

  const [cx, , cz] = tileToWorld(ABOUT_ORIGIN.col + 2, ABOUT_ORIGIN.row + 2)

  // Front layer bright, layers behind it fade darker to read as extruded sides.
  const titleColors = useMemo(() => {
    const front = new THREE.Color('#ffd98a'), back = new THREE.Color('#7a4408')
    return Array.from({ length: TITLE_LAYERS }, (_, i) =>
      '#' + front.clone().lerp(back, i / (TITLE_LAYERS - 1)).getHexString())
  }, [])

  // One shared orange metal material for the dais tiles — same maps as the floor
  // (so it actually reflects), just tinted warm.
  const tileMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: metalMaps?.map,
    normalMap: metalMaps?.normalMap,
    normalScale: new THREE.Vector2(0.7, 0.7),
    color: new THREE.Color('#9a5a1a'),
    emissive: new THREE.Color(ACCENT),
    emissiveIntensity: 0.1,
    roughness: 0.72,
    metalness: 0.55,
    envMapIntensity: 1.0,
  }), [metalMaps])

  // Gentle pulse on the centre light (livelier than the project orbs).
  useFrame(({ clock }) => {
    const p = 0.85 + Math.sin(clock.elapsedTime * 2.2) * 0.15
    if (dotRef.current)   dotRef.current.material.emissiveIntensity = 13 * p
    if (lightRef.current) lightRef.current.intensity = 6 * p
  })

  return (
    <group position={[cx, 0, cz]}>
      {/* Raised 3×3 dais from individual grid-height tiles (0.96 wide → grid gaps).
          Inner tiles step up one tile-height; the centre tile steps up two. */}
      {OFFS.flatMap(dr => OFFS.map(dc => {
        const y = dc === 0 && dr === 0 ? CTR_Y : INNER_Y
        return (
          <mesh key={`${dc}-${dr}`} position={[dc, y, dr]} material={tileMat} castShadow receiveShadow>
            <boxGeometry args={[0.96, TILE_H, 0.96]} />
            <Edges color="#1a1205" threshold={15} />
          </mesh>
        )
      }))}

      {/* Holographic bust on the raised centre tile (its own Suspense so the
          model load doesn't block the rest of the board). */}
      <Suspense fallback={null}>
        <AboutHologram />
      </Suspense>

      {/* Light dot at the pedestal base — reads as the hologram projector.
          Bigger + stronger than the project orbs. */}
      <pointLight ref={lightRef} position={[0, CTR_Y + 0.35, 0]} color={ACCENT} intensity={6} distance={13} decay={2} />
      <mesh ref={dotRef} position={[0, CTR_Y + 0.35, 0]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial emissive={ACCENT} emissiveIntensity={13} color="#000000" roughness={1} metalness={0} />
      </mesh>

      {/* Big title — axis-aligned (not angled like the holo cards), facing the
          player coming up the spine (+Z). Layered for real depth, raised high. */}
      {titleColors.map((c, i) => {
        const f = i / (TITLE_LAYERS - 1)
        return (
          <Text
            key={i}
            position={[0, TITLE_Y, TITLE_Z - f * TITLE_DEPTH]}
            fontSize={0.95}
            color={c}
            anchorX="center"
            anchorY="middle"
            outlineWidth={i === 0 ? 0.02 : 0}
            outlineColor={OUTLINE}
            toneMapped={false}
          >
            ABOUT ME
          </Text>
        )
      })}
    </group>
  )
}
