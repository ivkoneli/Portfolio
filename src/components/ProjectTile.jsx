import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Edges, Text } from '@react-three/drei'
import { tileToWorld } from '../data/layout'

// ── tile geometry ─────────────────────────────────────────────────────────────
const TILE_H  = 0.5    // half the cube's height
const HALF_H  = 0.25
// GROUP_Y = −0.10 → tile top at world y=0.15 (elevated 0.10 above normal tiles at 0.05)
// cube bottom stays at 0.05 so only the bottom 0.10 of the cube clips into the top — barely visible
const GROUP_Y = -0.10

// ── text/chip layout ──────────────────────────────────────────────────────────
//  rotation [-PI/2, 0, PI/4]:
//    Step 1  Rz(PI/4) first  → text right  = (+0.707, 0, -0.707)  = camera right
//    Step 2  Ry(0)           → no change
//    Step 3  Rx(-PI/2) last  → text normal = (0, 1, 0)             = faces up ✓
//    Text "up" direction     = (−0.707, 0, −0.707)                 = away from camera ✓
const TEXT_ROT = [-Math.PI / 2, 0, Math.PI / 4]

// local Y inside the group — just above the tile's top face
const TEXT_Y = HALF_H + 0.015

// ── chip constants ────────────────────────────────────────────────────────────
const CHIP_FONT  = 0.10    // font size
const CHIP_H     = 0.17    // chip height along camera-up direction on the tile
const CHIP_THICK = 0.010   // depth perpendicular to tile (nearly flush)
const CHIP_GAP   = 0.12    // gap between chips
const CHAR_W     = 0.072   // approx world-width per character at CHIP_FONT

function chipWidth(tag) {
  return tag.length * CHAR_W + 0.22   // + left/right padding
}

// Camera-right unit vector in the tile's local (= world) XZ plane.
// Camera is at [14, 18, 14] → right direction = (+X, −Z) normalised.
const CR = 0.707   // cos/sin of 45°

// ── chip strip ────────────────────────────────────────────────────────────────
function TechChips({ tags }) {
  const widths = tags.map(chipWidth)
  const totalW = widths.reduce((s, w) => s + w, 0) + (tags.length - 1) * CHIP_GAP

  // Starting cursor so chips are centred along the camera-right axis
  let cursor = -totalW / 2

  // Base world-local position: lower part of tile (toward camera = +X,+Z in XZ)
  const bx = 0.18, bz = 0.18

  return tags.map((tag, i) => {
    const w  = widths[i]
    const cx = cursor + w / 2          // offset along camera-right axis
    cursor  += w + CHIP_GAP

    // Translate along camera-right (CR, 0, -CR) in local space
    const px = bx + cx * CR
    const pz = bz - cx * CR

    return (
      <group key={tag} position={[px, TEXT_Y, pz]} rotation={TEXT_ROT}>
        {/* Thin rounded-rect outline lying flat on the tile */}
        <RoundedBox args={[w, CHIP_THICK, CHIP_H]} radius={0.05} smoothness={3}>
          <meshBasicMaterial transparent opacity={0} />
          <Edges color="#c084fc" />
        </RoundedBox>

        {/* Tag label — positioned just above the chip surface in local Z (= world Y) */}
        <Text
          position={[0, 0, CHIP_THICK / 2 + 0.003]}
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

// ── main component ────────────────────────────────────────────────────────────
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
          color="#5b21b6"
          emissive="#7c3aed"
          emissiveIntensity={0.06}
          roughness={0.2}
          metalness={0.55}
        />
        <Edges color="#f0abfc" threshold={15} />
      </RoundedBox>

      {project && (
        <>
          {/* Project name — upper part of tile from camera's viewpoint */}
          <Text
            position={[-0.14, TEXT_Y, -0.14]}
            rotation={TEXT_ROT}
            fontSize={0.26}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            maxWidth={2.4}
            textAlign="center"
          >
            {project.name}
          </Text>

          {/* Outlined tech chips — lower part of tile */}
          <TechChips tags={project.tech} />
        </>
      )}
    </group>
  )
}
