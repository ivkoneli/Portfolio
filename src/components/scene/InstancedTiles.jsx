import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import useGameStore from '../../store/gameStore'
import { LAYOUT, tileToWorld, isPortfolioTile, PORTAL } from '../../data/layout'
import { REVEAL, ease, introTileDelay } from '../../anim/reveal'

// Every walkable tile (cell === 1) drawn as ONE instanced mesh instead of one
// <mesh> each — hundreds of draw calls collapse to a single one. The hovered
// tile still lifts; only changed instances get their matrix rewritten per frame.
const HOVER_LIFT = 0.05

export default function InstancedTiles({ material }) {
  const meshRef = useRef()
  const dummy   = useMemo(() => new THREE.Object3D(), [])

  // Skip the Portfolio bridge tiles — they're drawn (and animated in) by the
  // RevealTiles reveal, not by the static floor.
  const tiles = useMemo(() => {
    const out = []
    LAYOUT.forEach((row, r) => row.forEach((cell, c) => {
      // Skip the portal cell — Portal.jsx draws it (custom size + hatch/pad glow).
      if (cell === 1 && !isPortfolioTile(c, r) && !(c === PORTAL.col && r === PORTAL.row)) {
        const [x, y, z] = tileToWorld(c, r); out.push({ c, r, x, y, z })
      }
    }))
    return out
  }, [])

  const indexMap = useMemo(() => {
    const m = new Map()
    tiles.forEach((t, i) => m.set(`${t.c},${t.r}`, i))
    return m
  }, [tiles])

  // Per-tile intro delay — the radial ripple out from the cube start.
  const delays = useMemo(() => tiles.map(t => introTileDelay(t.x, t.z)), [tiles])

  const lifts    = useRef(new Float32Array(tiles.length))
  const introT0  = useRef(null)    // clock time the ripple began
  const introOff = useRef(false)   // intro finished → resume hover-only updates

  // Seed the instances HIDDEN (scale ~0) so they can pop in with the intro.
  useLayoutEffect(() => {
    const mesh = meshRef.current
    tiles.forEach((t, i) => {
      dummy.position.set(t.x, t.y, t.z)
      dummy.scale.setScalar(0.0001)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [tiles, dummy])

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return

    // ── First-load ripple: hold until the loader is gone, then pop each tile
    //    in at its distance-based delay; hand off to hover once they've all landed.
    if (!introOff.current) {
      if (!useGameStore.getState().sceneReady) return
      if (introT0.current === null) introT0.current = state.clock.elapsedTime
      const now = state.clock.elapsedTime - introT0.current
      let allDone = true
      for (let i = 0; i < tiles.length; i++) {
        const local = (now - delays[i]) / REVEAL.intro.tilePop
        if (local < 1) allDone = false
        const p = ease(REVEAL.intro.tileEasing, local)
        const t = tiles[i]
        dummy.position.set(t.x, t.y, t.z)
        dummy.scale.setScalar(Math.max(0.0001, p))
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
      if (allDone) { introOff.current = true; dummy.scale.set(1, 1, 1) }
      return
    }

    // ── Steady state: animate only the hovered tile (and the one easing back).
    const hov = useGameStore.getState().hoveredTile
    const hi  = hov ? (indexMap.get(`${hov.col},${hov.row}`) ?? -1) : -1
    let dirty = false
    for (let i = 0; i < tiles.length; i++) {
      const target = i === hi ? HOVER_LIFT : 0
      const cur = lifts.current[i]
      if (Math.abs(cur - target) > 0.0005) {
        const nv = cur + (target - cur) * 0.25
        lifts.current[i] = nv
        const t = tiles[i]
        dummy.position.set(t.x, t.y + nv, t.z)
        dummy.scale.set(1, 1, 1)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
        dirty = true
      }
    }
    if (dirty) mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, tiles.length]} material={material} receiveShadow>
      <boxGeometry args={[0.96, 0.45, 0.96]} />
    </instancedMesh>
  )
}
