import { useMemo } from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { LAYOUT, tileToWorld } from '../../data/layout'
import { PROJECTS } from '../../data/projects'
import Tile from './Tile'
import AboutIsland from './AboutIsland'
import ProjectTile from '../project/ProjectTile'
import HoverHighlight from '../interaction/HoverHighlight'
import DestinationMarker from '../interaction/DestinationMarker'
import PathDots from '../interaction/PathDots'
import ClickRipple from '../interaction/ClickRipple'
import InteractionPlane from '../interaction/InteractionPlane'
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
  const activeProject = useGameStore(s => s.activeProject)

  // Shared worn-metal material. COLOUR + NORMAL maps (the normal gives the worn
  // dents/scratches via diffuse shading) but NO roughness map — that one varies
  // shininess per-pixel and was the real flicker source. Reduced normalScale +
  // uniform soft roughness keep the reflective sheen gliding cleanly.
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
      <AboutIsland metalMaps={tex} />
      <PathDots />
      <ClickRipple />
      {LAYOUT.flatMap((row, rowIdx) =>
        row.map((cell, colIdx) => {
          if (cell === 0) return null

          // Normal tile
          if (cell === 1) {
            const [x, y, z] = tileToWorld(colIdx, rowIdx)
            return <Tile key={`${colIdx}-${rowIdx}`} position={[x, y, z]} col={colIdx} row={rowIdx} material={tileMaterial} />
          }

          // Project tile — render ONE mesh per 3×3 zone (at the origin cell only)
          if (cell === 2 && isProjectOrigin(rowIdx, colIdx)) {
            const project = PROJECTS.find(p =>
              p.tileOrigin.col === colIdx && p.tileOrigin.row === rowIdx
            )
            const isActive = activeProject?.id === project?.id
            return (
              <ProjectTile
                key={`proj-${colIdx}-${rowIdx}`}
                tileOrigin={{ col: colIdx, row: rowIdx }}
                active={isActive}
                project={project}
                metalMaps={tex}
              />
            )
          }

          // Non-origin cells of a project zone — skip (the 3×3 mesh covers them)
          return null
        })
      )}
    </group>
  )
}
