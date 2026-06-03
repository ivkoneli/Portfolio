import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import useGameStore from '../../store/gameStore'
import { LAYOUT, tileToWorld, isPortfolioTile } from '../../data/layout'

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
      if (cell === 1 && !isPortfolioTile(c, r)) {
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

  const lifts = useRef(new Float32Array(tiles.length))

  // Seed the instance matrices once (layout effect → set before first paint).
  useLayoutEffect(() => {
    const mesh = meshRef.current
    tiles.forEach((t, i) => {
      dummy.position.set(t.x, t.y, t.z)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [tiles, dummy])

  // Animate only the hovered tile (and the one easing back).
  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh) return
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
