import { useMemo, useRef, useLayoutEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { ease } from '../../anim/reveal'

// Pops a set of tiles in one-by-one. `tiles` is an ordered list of world
// positions ({ x, y, z }); each tile animates `stagger` seconds after the
// previous, so the set lays itself out as a sweep. Instanced → one draw call,
// scales to a whole board for an intro.
//
// modes:
//   'scale' — each tile scales up from 0 (use a back/bounce easing for a pop)
//   'rise'  — each tile slides up from `riseFrom` below (mini pillars)
//   'drop'  — each tile falls in from `dropFrom` above (use bounce to land it)
export default function RevealTiles({
  tiles,
  material,
  play = true,
  delay = 0,
  duration = 0.42,
  stagger = 0.1,
  easing = 'easeOutBack',
  mode = 'scale',
  riseFrom = 1.4,
  dropFrom = 6,
  reverse = false,
  size = 0.96,
  height = 0.45,
}) {
  const ref   = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const t0    = useRef(null)
  const done  = useRef(false)

  const ordered = useMemo(() => (reverse ? [...tiles].reverse() : tiles), [tiles, reverse])

  const place = (i, p) => {
    const t = ordered[i]
    dummy.position.set(t.x, t.y, t.z)
    dummy.scale.setScalar(1)
    if (mode === 'scale')      dummy.scale.setScalar(Math.max(0.0001, p))
    else if (mode === 'rise')  dummy.position.y = t.y - riseFrom * (1 - p)
    else if (mode === 'drop')  dummy.position.y = t.y + dropFrom * (1 - p)
    dummy.updateMatrix()
    ref.current.setMatrixAt(i, dummy.matrix)
  }

  // Seed hidden before first paint (scale 0 / offset), so nothing flashes in.
  useLayoutEffect(() => {
    ordered.forEach((_, i) => place(i, 0))
    ref.current.instanceMatrix.needsUpdate = true
    t0.current = null
    done.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordered, mode])

  useFrame((state) => {
    if (!ref.current || !play || done.current) return
    if (t0.current === null) t0.current = state.clock.elapsedTime
    const now = state.clock.elapsedTime - t0.current - delay

    let allDone = true
    for (let i = 0; i < ordered.length; i++) {
      const local = (now - i * stagger) / duration
      if (local < 1) allDone = false
      place(i, ease(easing, local))
    }
    ref.current.instanceMatrix.needsUpdate = true
    if (allDone) done.current = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, tiles.length]} material={material} receiveShadow castShadow>
      <boxGeometry args={[size, height, size]} />
    </instancedMesh>
  )
}
