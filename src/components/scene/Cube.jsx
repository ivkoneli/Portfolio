import { useCallback, useEffect, useRef } from 'react'
import { useSpring, animated } from '@react-spring/three'
import { Edges } from '@react-three/drei'
import useGameStore from '../../store/gameStore'
import useKeyboard from '../../hooks/useKeyboard'
import { LAYOUT, ROWS, COLS, tileToWorld, CUBE_START, findPath } from '../../data/layout'
import { findProjectAtTile } from '../../data/projects'

const GLOW_COLOR = '#c084fc'

// ── constants ────────────────────────────────────────────────────────────────
const TILE_Y    = 0.275   // top face of a tile (tile height 0.1, centered at y=0)
const CUBE_HALF = 0.5    // half of the 1×1×1 cube
const CUBE_CY   = TILE_Y + CUBE_HALF  // cube centre height = 0.55

function isValid(col, row) {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return false
  return LAYOUT[row][col] !== 0
}

// Stable starting world position (computed once, never changes)
const [SX, , SZ] = tileToWorld(CUBE_START.col, CUBE_START.row)

// ── component ─────────────────────────────────────────────────────────────────
export default function Cube() {
  const setIsAnimating   = useGameStore(s => s.setIsAnimating)
  const setCubePos       = useGameStore(s => s.setCubePos)
  const setActiveProject = useGameStore(s => s.setActiveProject)
  const moveTarget       = useGameStore(s => s.moveTarget)
  const pendingMove      = useRef(null)   // buffers at most 1 keypress during animation
  const pathQueue        = useRef([])     // remaining click-to-move steps

  // react-spring manages ALL transform state.
  // api.set()   → instant jump  (no animation, used for position/offset resets)
  // api.start() → animated      (used for the 90° rotation only)
  const [spring, api] = useSpring(() => ({
    pivotPos:   [SX, CUBE_CY, SZ],  // world position of the pivot group
    meshOffset: [0,  0,       0 ],  // mesh position inside the pivot group
    rotation:   [0,  0,       0 ],  // pivot group rotation (only this animates)
    config: { tension: 3000, friction: 150, clamp: true }, // fast roll, fires onRest immediately at target
  }))

  const move = useCallback((dc, dr) => {
    // Read fresh state via getState() — no stale closure risk
    const { cubePos, isAnimating, detailProject } = useGameStore.getState()
    if (detailProject) {        // freeze the cube while a project panel is open
      pathQueue.current = []
      useGameStore.getState().setMoveDest(null)
      return
    }
    if (isAnimating) {
      pendingMove.current = { dc, dr }  // remember the last key pressed
      return
    }

    const nextCol = cubePos.col + dc
    const nextRow = cubePos.row + dr
    if (!isValid(nextCol, nextRow)) return

    setIsAnimating(true)

    // Current cube world centre
    const [cx, , cz] = tileToWorld(cubePos.col, cubePos.row)

    // Pivot point: bottom-leading edge of the cube, sitting on the tile surface.
    //   Moving right (+X): right edge  → pivotX = cx + 0.5
    //   Moving left  (-X): left edge   → pivotX = cx - 0.5
    //   Moving fwd   (+Z): front edge  → pivotZ = cz + 0.5
    //   Moving back  (-Z): back edge   → pivotZ = cz - 0.5
    const pivotX = cx + dc * CUBE_HALF
    const pivotZ = cz + dr * CUBE_HALF

    // 1. Teleport pivot group to the pivot edge (instant)
    api.set({ pivotPos: [pivotX, TILE_Y, pivotZ] })

    // 2. Offset the mesh so it appears at its CURRENT world position
    //    (cube centre relative to the new pivot group origin)
    api.set({ meshOffset: [cx - pivotX, CUBE_CY - TILE_Y, cz - pivotZ] })

    // 3. Animate the roll:
    //    X movement → rotate around Z axis  (−dc keeps the sign right)
    //    Z movement → rotate around X axis  (+dr keeps the sign right)
    //
    //    Verified for all 4 directions:
    //      right (dc=1):  rotZ = -π/2  cube tips over right edge ✓
    //      left  (dc=-1): rotZ = +π/2  cube tips over left edge  ✓
    //      fwd   (dr=1):  rotX = +π/2  cube tips over front edge ✓
    //      back  (dr=-1): rotX = -π/2  cube tips over back edge  ✓
    api.start({
      from:     { rotation: [0, 0, 0] },
      rotation: [dr * (Math.PI / 2), 0, -dc * (Math.PI / 2)],
      onRest: () => {
        // Snap everything back to the clean idle state for the new position
        const [nx, , nz] = tileToWorld(nextCol, nextRow)
        api.set({ pivotPos:   [nx, CUBE_CY, nz] })
        api.set({ meshOffset: [0,  0,       0 ] })
        api.set({ rotation:   [0,  0,       0 ] })

        setCubePos({ col: nextCol, row: nextRow })
        setActiveProject(
          LAYOUT[nextRow][nextCol] === 2
            ? findProjectAtTile(nextCol, nextRow)
            : null
        )
        setIsAnimating(false)

        // Continue a click-to-move path first, then any buffered keypress.
        // Zustand state is synchronous so cubePos is already updated here.
        if (pathQueue.current.length > 0) {
          const step = pathQueue.current.shift()
          move(step.dc, step.dr)
        } else {
          useGameStore.getState().setMoveDest(null)   // arrived — clear destination marker
          const next = pendingMove.current
          if (next) {
            pendingMove.current = null
            move(next.dc, next.dr)
          }
        }
      },
    })
  }, [api, setCubePos, setIsAnimating, setActiveProject])

  useKeyboard(move)

  // Click-to-move: BFS a path to the clicked tile, then roll along it.
  useEffect(() => {
    if (!moveTarget) return
    const { cubePos, isAnimating, detailProject, setMoveTarget } = useGameStore.getState()
    setMoveTarget(null)                 // consume the request
    if (detailProject || isAnimating) return
    const path = findPath(cubePos, moveTarget)
    if (!path || path.length === 0) return
    useGameStore.getState().setMoveDest(moveTarget)   // mark destination until we arrive
    pathQueue.current = path
    const step = pathQueue.current.shift()
    move(step.dc, step.dr)
  }, [moveTarget, move])

  return (
    <animated.group position={spring.pivotPos} rotation={spring.rotation}>
      <animated.mesh position={spring.meshOffset} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#0a0818" roughness={0.55} metalness={0.05} />
        <Edges color={GLOW_COLOR} lineWidth={3} />
        {/* Light lives inside the mesh → always at cube centre, survives the roll */}
        <pointLight color={GLOW_COLOR} intensity={5} distance={7} decay={2} />
      </animated.mesh>
    </animated.group>
  )
}
