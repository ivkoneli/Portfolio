import { LAYOUT, tileToWorld } from '../../data/layout'
import { PROJECTS } from '../../data/projects'
import Tile from './Tile'
import ProjectTile from '../project/ProjectTile'
import HoverHighlight from '../interaction/HoverHighlight'
import DestinationMarker from '../interaction/DestinationMarker'
import PathDots from '../interaction/PathDots'
import ClickRipple from '../interaction/ClickRipple'
import InteractionPlane from '../interaction/InteractionPlane'
import useGameStore from '../../store/gameStore'

// Returns true if this cell is the TOP-LEFT corner of a project 3×3 zone.
function isProjectOrigin(rowIdx, colIdx) {
  const leftIsProject  = colIdx > 0 && LAYOUT[rowIdx][colIdx - 1] === 2
  const aboveIsProject = rowIdx > 0 && LAYOUT[rowIdx - 1][colIdx] === 2
  return !leftIsProject && !aboveIsProject
}

export default function Grid() {
  const activeProject = useGameStore(s => s.activeProject)

  return (
    <group>
      <InteractionPlane />
      <HoverHighlight />
      <DestinationMarker />
      <PathDots />
      <ClickRipple />
      {LAYOUT.flatMap((row, rowIdx) =>
        row.map((cell, colIdx) => {
          if (cell === 0) return null

          // Normal tile
          if (cell === 1) {
            const [x, y, z] = tileToWorld(colIdx, rowIdx)
            return <Tile key={`${colIdx}-${rowIdx}`} position={[x, y, z]} col={colIdx} row={rowIdx} />
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
