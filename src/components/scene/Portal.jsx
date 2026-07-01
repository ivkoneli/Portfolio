import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import useGameStore from '../../store/gameStore'
import { PORTAL, tileToWorld } from '../../data/layout'

// The link between the two floors, drawn on the PORTAL tile:
//   • top floor  → a glowing HATCH/grate the cube drops through
//   • lower floor → a LAUNCH PAD: a circular light that flings the cube back up
// It also owns the "cube is on the portal" detection that drives the prompt.
const [PX, , PZ] = tileToWorld(PORTAL.col, PORTAL.row)
const TILE_TOP = 0.23

const HATCH_GLOW  = '#c084fc'   // matches the cube's glow
const LAUNCH_GLOW = '#84cc16'   // lime, matches LuckySlimes / the lower floor

function Hatch() {
  const ref = useRef()
  // Gentle emissive pulse so the hatch reads as "interactable".
  useFrame(({ clock }) => {
    if (ref.current) ref.current.material.emissiveIntensity = 1.4 + Math.sin(clock.elapsedTime * 2.5) * 0.6
  })
  return (
    <group position={[PX, 0, PZ]}>
      {/* Grate frame */}
      <mesh position={[0, TILE_TOP, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.035, 8, 24]} />
        <meshStandardMaterial color="#1a1030" emissive={HATCH_GLOW} emissiveIntensity={1.2} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Grate bars */}
      {[-0.22, 0, 0.22].map((z, i) => (
        <mesh key={i} position={[0, TILE_TOP, z]}>
          <boxGeometry args={[0.72, 0.05, 0.06]} />
          <meshStandardMaterial color="#1a1030" emissive={HATCH_GLOW} emissiveIntensity={1.0} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {/* A dark glowing disc just below → the sense of a shaft dropping away */}
      <mesh ref={ref} position={[0, TILE_TOP - 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.38, 24]} />
        <meshStandardMaterial color="#05030f" emissive={HATCH_GLOW} emissiveIntensity={1.4} metalness={0} roughness={1} />
      </mesh>
    </group>
  )
}

function LaunchPad() {
  const discRef  = useRef()
  const ring1Ref = useRef()
  const ring2Ref = useRef()
  const beamRef  = useRef()
  // Pulse the disc + send two rings drifting upward on a loop — a "charging to
  // launch you upward" read.
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (discRef.current) discRef.current.material.emissiveIntensity = 1.6 + Math.sin(t * 3) * 0.7
    const rise = (h, speed) => {
      const p = (t * speed) % 1                 // 0→1 loop
      return { y: TILE_TOP + 0.02 + p * h, op: 0.7 * (1 - p) }   // fade as it climbs
    }
    if (ring1Ref.current) {
      const r = rise(1.6, 0.6)
      ring1Ref.current.position.y = r.y
      ring1Ref.current.material.opacity = r.op
    }
    if (ring2Ref.current) {
      const r = rise(1.6, 0.6)
      const p2 = ((t * 0.6) + 0.5) % 1          // half-phase offset
      ring2Ref.current.position.y = TILE_TOP + 0.02 + p2 * 1.6
      ring2Ref.current.material.opacity = 0.7 * (1 - p2)
    }
    if (beamRef.current) beamRef.current.material.opacity = 0.12 + Math.sin(t * 3) * 0.05
  })
  return (
    <group position={[PX, 0, PZ]}>
      {/* Glowing disc — WIDER than the cube (half-width 0.5) so its light rings
          out around the cube instead of being fully covered by it. */}
      <mesh ref={discRef} position={[0, TILE_TOP, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.66, 32]} />
        <meshStandardMaterial color="#0d1405" emissive={LAUNCH_GLOW} emissiveIntensity={1.8} metalness={0} roughness={1} />
      </mesh>
      {/* Two rings drifting upward (looped in useFrame), wider than the cube */}
      <mesh ref={ring1Ref} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.58, 0.035, 8, 32]} />
        <meshBasicMaterial color={LAUNCH_GLOW} transparent opacity={0.6} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.58, 0.035, 8, 32]} />
        <meshBasicMaterial color={LAUNCH_GLOW} transparent opacity={0.6} />
      </mesh>
      {/* Faint upward beam → the launch direction */}
      <mesh ref={beamRef} position={[0, TILE_TOP + 1.2, 0]}>
        <cylinderGeometry args={[0.46, 0.66, 2.4, 24, 1, true]} />
        <meshBasicMaterial color={LAUNCH_GLOW} transparent opacity={0.14} side={2} depthWrite={false} />
      </mesh>
      {/* Real light in the beam column → actually lights the cube standing here
          (from above, so its body doesn't block it). */}
      <pointLight color={LAUNCH_GLOW} intensity={7} distance={4.5} decay={2} position={[0, 1.7, 0]} />
    </group>
  )
}

export default function Portal({ material }) {
  const cubePos       = useGameStore(s => s.cubePos)
  const currentLevel  = useGameStore(s => s.currentLevel)
  const transitioning = useGameStore(s => s.transitioning)
  const setPortalActive = useGameStore(s => s.setPortalActive)

  // Drive the prompt: the cube sits on the portal cell and nothing is animating.
  useEffect(() => {
    const onPortal = cubePos.col === PORTAL.col && cubePos.row === PORTAL.row
    setPortalActive(onPortal && !transitioning ? (currentLevel === 0 ? 'descend' : 'ascend') : null)
  }, [cubePos, currentLevel, transitioning, setPortalActive])

  const isTop = currentLevel === 0
  // The launch (ascend) tile is slightly bigger than the rest so the pad's glow
  // reads around the cube. The hatch tile stays the normal tile size.
  const size = isTop ? 0.96 : 1.34
  return (
    <group>
      {/* The portal tile itself (InstancedTiles skips this cell). Nudged up a
          hair on the lower floor so the oversized tile doesn't z-fight neighbours. */}
      <mesh position={[PX, isTop ? 0 : 0.012, PZ]} material={material} receiveShadow>
        <boxGeometry args={[size, 0.45, size]} />
      </mesh>
      {isTop ? <Hatch /> : <LaunchPad />}
    </group>
  )
}
