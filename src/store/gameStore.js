import { create } from 'zustand'
import { CUBE_START } from '../data/layout'

const useGameStore = create((set) => ({
  cubePos:      { ...CUBE_START },  // { col, row } — grid coordinates
  isAnimating:  false,
  activeProject: null,
  detailProject: null,
  hoveredTile:  null,   // { col, row } under the mouse, or null
  moveTarget:   null,   // { col, row } clicked request (consumed once), or null
  moveDest:     null,   // { col, row } the cube is currently travelling to, or null

  setCubePos:        (pos) => set({ cubePos: pos }),
  setIsAnimating:    (v)   => set({ isAnimating: v }),
  setActiveProject:  (p)   => set({ activeProject: p }),
  setDetailProject:  (p)   => set({ detailProject: p }),
  setHoveredTile:    (t)   => set({ hoveredTile: t }),
  setMoveTarget:     (t)   => set({ moveTarget: t }),
  setMoveDest:       (t)   => set({ moveDest: t }),
}))

export default useGameStore
