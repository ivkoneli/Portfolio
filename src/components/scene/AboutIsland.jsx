import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Edges, Text3D, Center } from '@react-three/drei'
import { tileToWorld, ABOUT_ORIGIN } from '../../data/layout'
import AboutHologram from './AboutHologram'
import Reveal from '../anim/Reveal'
import { REVEAL, introIslandDelay } from '../../anim/reveal'
import useGameStore from '../../store/gameStore'
import titleFont from '../../assets/fonts/helvetiker_bold.typeface.json?url'

// Amber centrepiece, distinct from the project sections.
const ACCENT = '#f5a623'

// Match the grid tile height; step the dais up in whole tile-heights.
const TILE_H  = 0.45
const INNER_Y = TILE_H        // inner 3×3 sits one tile higher than the walkable ring
const CTR_Y   = TILE_H * 2     // centre tile sits two tile-heights up
const OFFS    = [-1, 0, 1]

// Title: one opaque extruded 3D mesh (cheap — single draw call, early-Z).
const TITLE_Y = 8.4
const TITLE_Z = 0.2

export default function AboutIsland({ metalMaps, titleRef }) {
  const dotRef     = useRef()
  const lightRef   = useRef()
  const sceneReady = useGameStore(s => s.sceneReady)

  const [cx, , cz] = tileToWorld(ABOUT_ORIGIN.col + 2, ABOUT_ORIGIN.row + 2)

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
      {/* Only the orange dais tiles rise in with the intro */}
      <Reveal
        play={sceneReady}
        delay={introIslandDelay(ABOUT_ORIGIN)}
        duration={REVEAL.intro.riseDur}
        distance={REVEAL.intro.riseDist}
        easing={REVEAL.intro.riseEasing}
      >
        {/* Raised 3×3 dais */}
        {OFFS.flatMap(dr => OFFS.map(dc => {
          const y = dc === 0 && dr === 0 ? CTR_Y : INNER_Y

          return (
            <mesh
              key={`${dc}-${dr}`}
              position={[dc, y, dr]}
              material={tileMat}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.96, TILE_H, 0.96]} />
              <Edges color="#1a1205" threshold={15} />
            </mesh>
          )
        }))}
      </Reveal>

      <Suspense fallback={null}>
        <AboutHologram />
      </Suspense>

      <pointLight
        ref={lightRef}
        position={[0, CTR_Y + 0.35, 0]}
        color={ACCENT}
        intensity={6}
        distance={13}
        decay={2}
      />

      <mesh ref={dotRef} position={[0, CTR_Y + 0.35, 0]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial
          emissive={ACCENT}
          emissiveIntensity={13}
          color="#000000"
          roughness={1}
          metalness={0}
        />
      </mesh>

      <Suspense fallback={null}>
        <Center position={[0, TITLE_Y, TITLE_Z]}>
          <Text3D
            ref={titleRef}
            font={titleFont}
            size={0.95}
            height={0.32}
            curveSegments={4}
            bevelEnabled
            bevelThickness={0.03}
            bevelSize={0.02}
            bevelSegments={2}
          >
            ABOUT ME
            <meshStandardMaterial
              color="#ffd98a"
              emissive={ACCENT}
              emissiveIntensity={0.45}
              metalness={0.3}
              roughness={0.45}
              toneMapped={false}
            />
          </Text3D>
        </Center>
      </Suspense>
    </group>
  )
}

