import { create } from 'zustand'
import { CUBE_START } from '../data/layout'

const useGameStore = create((set) => ({
  cubePos:      { ...CUBE_START },  // { col, row } — grid coordinates
  isAnimating:  false,
  activeProject: null,
  detailProject: null,

  setCubePos:        (pos) => set({ cubePos: pos }),
  setIsAnimating:    (v)   => set({ isAnimating: v }),
  setActiveProject:  (p)   => set({ activeProject: p }),
  setDetailProject:  (p)   => set({ detailProject: p }),
}))

export default useGameStore
