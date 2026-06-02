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
  pathTiles:    [],     // [{ col, row }] upcoming trail tiles, shrinks as cube lands
  clickPing:    null,   // { col, row, id } last walkable click (drives the ripple)
  suppressClick: false, // true after a drag-pan so the release doesn't move the cube
  aboutActive:  false,  // cube is right next to the About hologram (it's powered on)
  aboutOpen:    false,  // the About / profile panel is open

  setCubePos:        (pos) => set({ cubePos: pos }),
  setIsAnimating:    (v)   => set({ isAnimating: v }),
  setActiveProject:  (p)   => set({ activeProject: p }),
  setDetailProject:  (p)   => set({ detailProject: p }),
  setHoveredTile:    (t)   => set({ hoveredTile: t }),
  setMoveTarget:     (t)   => set({ moveTarget: t }),
  setMoveDest:       (t)   => set({ moveDest: t }),
  setPathTiles:      (t)   => set({ pathTiles: t }),
  setClickPing:      (t)   => set({ clickPing: t }),
  setSuppressClick:  (v)   => set({ suppressClick: v }),
  setAboutActive:    (v)   => set({ aboutActive: v }),
  setAboutOpen:      (v)   => set({ aboutOpen: v }),
}))

export default useGameStore
