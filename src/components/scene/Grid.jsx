import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { LAYOUT, portfolioBridgeTiles } from '../../data/layout'
import { PROJECTS } from '../../data/projects'
import InstancedTiles from './InstancedTiles'
import AboutIsland from './AboutIsland'
import Portal from './Portal'
import ProjectTile from '../project/ProjectTile'
import HoverHighlight from '../interaction/HoverHighlight'
import DestinationMarker from '../interaction/DestinationMarker'
import PathDots from '../interaction/PathDots'
import ClickRipple from '../interaction/ClickRipple'
import InteractionPlane from '../interaction/InteractionPlane'
import Reveal from '../anim/Reveal'
import RevealTiles from '../anim/RevealTiles'
import { REVEAL, introIslandDelay } from '../../anim/reveal'
import useGameStore from '../../store/gameStore'
import colorUrl  from '../../assets/textures/metalTile/Metal061B_1K-JPG_Color.jpg'
import normalUrl from '../../assets/textures/metalTile/Metal061B_1K-JPG_NormalGL.jpg'

// Returns true if this cell is the TOP-LEFT corner of a project 3×3 zone.
function isProjectOrigin(rowIdx, colIdx) {
  const leftIsProject  = colIdx > 0 && LAYOUT[rowIdx][colIdx - 1] === 2
  const aboveIsProject = rowIdx > 0 && LAYOUT[rowIdx - 1][colIdx] === 2
  return !leftIsProject && !aboveIsProject
}

export default function Grid() {
  const activeProject      = useGameStore(s => s.activeProject)
  const portfolioRevealed  = useGameStore(s => s.portfolioRevealed)
  const sceneReady         = useGameStore(s => s.sceneReady)
  const currentLevel       = useGameStore(s => s.currentLevel)
  const isTopFloor         = currentLevel === 0

  // Shared worn-metal material. COLOUR + NORMAL maps (the normal gives the worn
  // dents/scratches via diffuse shading) but NO roughness map — that one varies
  // shininess per-pixel and was the real flicker source. Reduced normalScale +
  // uniform soft roughness keep the reflective sheen gliding cleanly.
  const bridgeTiles = useMemo(() => portfolioBridgeTiles(), [])
  // The ABOUT-ME title occludes the portfolio card (it sits behind it), so the
  // HTML card stops drawing over the 3D text. Raycast occlude — NOT 'blending'.
  const aboutTitleRef = useRef()

  const tex = useTexture({ map: colorUrl, normalMap: normalUrl })
  const tileMaterial = useMemo(() => {
    tex.map.colorSpace = THREE.SRGBColorSpace
    ;[tex.map, tex.normalMap].forEach(t => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.anisotropy = 4
    })
    return new THREE.MeshStandardMaterial({
      map: tex.map,
      normalMap: tex.normalMap,
      normalScale: new THREE.Vector2(0.7, 0.7),   // worn relief, but soft enough not to sparkle
      metalness: 0.55,
      roughness: 0.72,
      color: new THREE.Color('#4a5562'),   // mid-tone so the worn detail reads
      envMapIntensity: 1.0,
    })
  }, [tex])

  return (
    <group>
      <InteractionPlane />
      <HoverHighlight />
      <DestinationMarker />
      {isTopFloor && <AboutIsland metalMaps={tex} titleRef={aboutTitleRef} />}
      <PathDots />
      <ClickRipple />
      <Portal material={tileMaterial} />

      {/* All walkable tiles in one instanced mesh (one draw call). */}
      <InstancedTiles material={tileMaterial} />

      {/* Stage 2 of the reveal: the bridge tiles pop in toward the platform. */}
      {isTopFloor && portfolioRevealed && (
        <RevealTiles tiles={bridgeTiles} material={tileMaterial} {...REVEAL.tiles} />
      )}

      {LAYOUT.flatMap((row, rowIdx) =>
        row.map((cell, colIdx) => {
          // Project tile — render ONE mesh per 3×3 zone (at the origin cell only)
          if (cell === 2 && isProjectOrigin(rowIdx, colIdx)) {
            const project = PROJECTS.find(p =>
              p.tileOrigin.col === colIdx && p.tileOrigin.row === rowIdx
            )
            // Portfolio platform stays hidden until it's revealed from the panel.
            const isPortfolio = project?.id === 'portfolio'
            if (isPortfolio && !portfolioRevealed) return null
            const isActive = activeProject?.id === project?.id
            const key = `proj-${colIdx}-${rowIdx}`
            // Card materialises (line-spread → content-pop). Portfolio plays on its
            // button reveal; intro cards stay paused until sceneReady, then each
            // forms just as its island finishes rising.
            const cardDelay = isPortfolio
              ? REVEAL.card.delay
              : introIslandDelay(project.tileOrigin) + REVEAL.intro.riseDur * REVEAL.intro.cardRiseFrac
            const tile = (
              <ProjectTile
                key={key}
                tileOrigin={{ col: colIdx, row: rowIdx }}
                active={isActive}
                project={project}
                metalMaps={tex}
                revealAnim
                cardDelay={cardDelay}
                cardPlay={isPortfolio || sceneReady}
                occludeRefs={isPortfolio ? [aboutTitleRef] : undefined}
              />
            )
            // Portfolio rises on its own button trigger; every other island rises
            // during the first-load intro, staggered as the ripple reaches it.
            if (isPortfolio) return <Reveal key={key} {...REVEAL.rise}>{tile}</Reveal>
            return (
              <Reveal
                key={key}
                play={sceneReady}
                delay={introIslandDelay(project.tileOrigin)}
                duration={REVEAL.intro.riseDur}
                distance={REVEAL.intro.riseDist}
                easing={REVEAL.intro.riseEasing}
              >
                {tile}
              </Reveal>
            )
          }

          // Non-origin cells of a project zone — skip (the 3×3 mesh covers them)
          return null
        })
      )}
    </group>
  )
}
