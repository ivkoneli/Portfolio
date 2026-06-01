import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import useGameStore from '../../store/gameStore'
import { tileToWorld } from '../../data/layout'

// A single green ring that expands and fades on each tile click, then hides.
// Reused per click (a new clickPing id restarts the animation) — no spawning.
const COLOR = '#4ade80'
const DURATION = 0.5   // seconds

export default function ClickRipple() {
  const ping = useGameStore(s => s.clickPing)
  const meshRef = useRef()
  const matRef  = useRef()
  const tRef    = useRef(DURATION)   // start finished/hidden
  const posRef  = useRef([0, 0.3, 0])

  useEffect(() => {
    if (!ping) return
    const [x, , z] = tileToWorld(ping.col, ping.row)
    posRef.current = [x, 0.31, z]
    tRef.current = 0   // restart
  }, [ping])

  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (!mesh) return
    if (tRef.current >= DURATION) { mesh.visible = false; return }

    tRef.current = Math.min(DURATION, tRef.current + delta)
    const p = tRef.current / DURATION   // 0 → 1
    mesh.visible = true
    mesh.position.set(...posRef.current)
    const s = 0.35 + p * 1.1
    mesh.scale.set(s, s, s)
    if (matRef.current) matRef.current.opacity = (1 - p) * 0.85
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <ringGeometry args={[0.38, 0.56, 48]} />
      <meshBasicMaterial
        ref={matRef}
        color={COLOR}
        transparent
        opacity={0}
        depthWrite={false}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  )
}
