import { useMemo } from 'react'
import { Clouds, Cloud } from '@react-three/drei'
import * as THREE from 'three'

// Dense field of cheap billboard clouds (drei) below the grid, generated in
// rings around the centre:
//   - colour: light tints in the middle → dark at the edges (some clouds biased
//     extra dark), but floored to EDGE (never pure black, texture stays visible)
//   - size: bigger toward the edges, with per-cloud variation
// Static, instanced — cheap on the GPU.

const EDGE = new THREE.Color('#0e1336')   // dark but NOT black — texture still reads
const CENTER_TINTS = ['#7c8ade', '#8a76dc', '#6a95de', '#9a86d6', '#6f80d0']

const RINGS = [
  { r: 0,  count: 3 },
  { r: 8,  count: 7 },
  { r: 16, count: 11 },
  { r: 25, count: 14 },
  { r: 35, count: 16 },
  { r: 45, count: 18 },
]
const MAX_R = 47

export default function VolumetricFog() {
  const clouds = useMemo(() => {
    const out = []
    let n = 0
    RINGS.forEach((ring, ri) => {
      for (let i = 0; i < ring.count; i++) {
        n++
        const r1 = Math.sin(n * 12.9) * 0.5 + 0.5      // per-cloud pseudo-randoms
        const r2 = Math.sin(n * 45.3) * 0.5 + 0.5
        const ang = (i / ring.count) * Math.PI * 2 + ri * 0.7
        const rr = Math.max(0, ring.r + (r1 - 0.5) * 3.0)
        const x = Math.cos(ang) * rr
        const z = Math.sin(ang) * rr
        const t = Math.min(1, Math.hypot(x, z) / MAX_R)   // 0 centre → 1 edge

        // Colour: light centre → dark edge; some clouds biased darker, floored to EDGE.
        const darkBias = (n % 4 === 0 ? 0.30 : 0) + r2 * 0.15
        const tt = Math.min(1, t + darkBias)
        const tint = new THREE.Color(CENTER_TINTS[n % CENTER_TINTS.length])
        const color = '#' + tint.lerp(EDGE, tt).getHexString()

        // Size: bigger toward the edges, plus per-cloud variation.
        const size = 5 + t * 9 + r1 * 2.5
        out.push({
          seed: n,
          position: [x, -2.6 - t * 0.8 - (n % 3) * 0.25, z],
          bounds: [size, 2.4 + t * 1.4, size],
          segments: Math.round(12 + t * 7),
          volume: 4 + t * 5 + r2 * 1.5,
          opacity: 0.6 - t * 0.14,
          color,
        })
      }
    })
    return out
  }, [])

  return (
    <Clouds material={THREE.MeshLambertMaterial} limit={1600} frustumCulled={false}>
      {clouds.map(c => (
        <Cloud
          key={c.seed}
          seed={c.seed}
          position={c.position}
          bounds={c.bounds}
          segments={c.segments}
          volume={c.volume}
          opacity={c.opacity}
          color={c.color}
          growth={5}
          speed={0}
          fade={28}
        />
      ))}
    </Clouds>
  )
}
