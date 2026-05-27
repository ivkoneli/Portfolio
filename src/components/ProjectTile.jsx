import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Edges, Text, Line } from '@react-three/drei'
import { tileToWorld } from '../data/layout'

// ── tile geometry ──────────────────────────────────────────────────────────────
const TILE_H  = 0.80                    // pedestal height (cube = 1.0 for reference)
const HALF_H  = TILE_H / 2             // 0.40
const GROUP_Y = 0.15 - HALF_H          // -0.25 → tile top stays at world y = 0.15

// ── text rotation ──────────────────────────────────────────────────────────────
// Lies flat on tile surface, reads along world +X (grid edge direction)
const TEXT_ROT = [-Math.PI / 2, 0, 0]

// Local Y just above tile top face
const TEXT_Y = HALF_H + 0.02           // 0.42 → world y = 0.17 (above tile top)

// ── chip constants ─────────────────────────────────────────────────────────────
const CHIP_FONT  = 0.20
const CHIP_GAP   = 0.14
const CHAR_W     = 0.12     // world-width per character at CHIP_FONT=0.20
const CHIP_PAD_X = 0.12
const CHIP_PAD_Y = 0.07

function chipWidth(tag) {
  return tag.length * CHAR_W + CHIP_PAD_X * 2
}
const CHIP_H = CHIP_FONT + CHIP_PAD_Y * 2   // total chip height (local Y = world -Z)

// ── rounded rect line points (in local XY plane) ───────────────────────────────
function roundedRectPoints(w, h, r = 0.06, segs = 8) {
  const hw = w / 2 - r
  const hh = h / 2 - r
  const pts = []

  const corners = [
    { cx:  hw, cy:  hh, start: 0               },   // bottom-right
    { cx: -hw, cy:  hh, start: Math.PI / 2     },   // bottom-left
    { cx: -hw, cy: -hh, start: Math.PI         },   // top-left
    { cx:  hw, cy: -hh, start: Math.PI * 3 / 2 },   // top-right
  ]

  for (const { cx, cy, start } of corners) {
    for (let s = 0; s <= segs; s++) {
      const a = start + (s / segs) * (Math.PI / 2)
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a), 0])
    }
  }
  pts.push([...pts[0]])   // close the loop
  return pts
}

// ── chip strip ─────────────────────────────────────────────────────────────────
function TechChips({ tags }) {
  const widths = tags.map(chipWidth)
  const totalW = widths.reduce((s, w) => s + w, 0) + (tags.length - 1) * CHIP_GAP
  let cursor = -totalW / 2

  return tags.map((tag, i) => {
    const w   = widths[i]
    const cx  = cursor + w / 2
    cursor   += w + CHIP_GAP
    const pts = roundedRectPoints(w, CHIP_H)

    return (
      <group key={tag} position={[cx, TEXT_Y, 0.45]} rotation={TEXT_ROT}>

        {/* Explicit rounded-rect outline via Line — always visible */}
        <Line
          points={pts}
          color="#c084fc"
          lineWidth={1.5}
        />

        {/* Label — same flat approach as the title */}
        <Text
          position={[0, 0, 0.002]}
          fontSize={CHIP_FONT}
          color="#c084fc"
          anchorX="center"
          anchorY="middle"
        >
          {tag}
        </Text>

      </group>
    )
  })
}

// ── main component ─────────────────────────────────────────────────────────────
export default function ProjectTile({ tileOrigin, active, project }) {
  const meshRef = useRef()

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime
    meshRef.current.material.emissiveIntensity = active
      ? 0.25 + Math.sin(t * 3) * 0.10
      : 0.06
  })

  const [cx, , cz] = tileToWorld(tileOrigin.col + 1, tileOrigin.row + 1)

  return (
    <group position={[cx, GROUP_Y, cz]}>

      {/* Pedestal body */}
      <RoundedBox
        ref={meshRef}
        args={[2.96, TILE_H, 2.96]}
        radius={0.06}
        smoothness={4}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial
          color="#6d28d9"
          emissive="#7c3aed"
          emissiveIntensity={0.05}
          roughness={0.55}
          metalness={0.10}
        />
        <Edges color="#f0abfc" threshold={15} />
      </RoundedBox>

      {project && (
        <>
          {/* Title — upper area (far side = -Z = upper in screen) */}
          <Text
            position={[0, TEXT_Y, -0.42]}
            rotation={TEXT_ROT}
            fontSize={0.40}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            maxWidth={2.4}
            textAlign="center"
          >
            {project.name}
          </Text>

          {/* Tech chips — lower area (near side = +Z = lower in screen) */}
          <TechChips tags={project.tech} />
        </>
      )}
    </group>
  )
}
