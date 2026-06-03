import { RoundedBox, Edges } from '@react-three/drei'
import { tileToWorld } from '../../data/layout'
import { PROJECTS } from '../../data/projects'
import Reveal from '../anim/Reveal'
import { REVEAL } from '../../anim/reveal'
import useGameStore from '../../store/gameStore'

const TILE_H   = 0.80
const HALF_H   = TILE_H / 2
const GROUP_Y  = 0.15 - HALF_H
const TILE_BOT = GROUP_Y - HALF_H       // y = -0.65

// 80% of the 3.96 project tile width → 3.17.
// The main tile (3.96) overhangs the pillar by ~0.40 on each side.
const PILLAR_W = 3.96 * 0.80

// Small gap between layers so the seams are visible.
const GAP = 0.10

const LAYERS = [0, 1, 2, 3].map(i => ({
  y:             TILE_BOT - HALF_H - i * (TILE_H + GAP),
  emissiveScale: 0.065 - i * 0.014,
}))

export default function DepthPillars() {
  const portfolioRevealed = useGameStore(s => s.portfolioRevealed)
  return (
    <>
      {PROJECTS.filter(p => p.id !== 'portfolio' || portfolioRevealed).map(project => {
        const [cx, , cz] = tileToWorld(
          project.tileOrigin.col + 1.5,
          project.tileOrigin.row + 1.5
        )
        const { theme } = project

        const pillars = LAYERS.map((layer, i) => (
          <RoundedBox
            key={`${project.id}-${i}`}
            args={[PILLAR_W, TILE_H, PILLAR_W]}
            radius={0.06}
            smoothness={4}
            position={[cx, layer.y, cz]}
          >
            <meshStandardMaterial
              color={theme.tileDark}
              emissive={theme.tileEmissive}
              emissiveIntensity={layer.emissiveScale}
              roughness={0.75}
              metalness={0.25}
            />
            <Edges color={theme.edge} threshold={15} />
          </RoundedBox>
        ))

        // Portfolio rises in with its platform (same config → one moving column).
        return project.id === 'portfolio'
          ? <Reveal key={`${project.id}-pillars`} {...REVEAL.rise}>{pillars}</Reveal>
          : pillars
      })}
    </>
  )
}
