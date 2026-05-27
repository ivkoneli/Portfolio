import { useCallback } from 'react'
import { useSpring, animated } from '@react-spring/three'
import useGameStore from '../store/gameStore'
import useKeyboard from '../hooks/useKeyboard'
import { LAYOUT, ROWS, COLS, tileToWorld, CUBE_START } from '../data/layout'
import { findProjectAtTile } from '../data/projects'

// ── constants ────────────────────────────────────────────────────────────────
const TILE_Y    = 0.05   // top face of a tile (tile height 0.1, centered at y=0)
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

  // react-spring manages ALL transform state.
  // api.set()   → instant jump  (no animation, used for position/offset resets)
  // api.start() → animated      (used for the 90° rotation only)
  const [spring, api] = useSpring(() => ({
    pivotPos:   [SX, CUBE_CY, SZ],  // world position of the pivot group
    meshOffset: [0,  0,       0 ],  // mesh position inside the pivot group
    rotation:   [0,  0,       0 ],  // pivot group rotation (only this animates)
    config: { tension: 800, friction: 40 }, // crisp roll, no bounce
  }))

  const move = useCallback((dc, dr) => {
    // Read fresh state via getState() — no stale closure risk
    const { cubePos, isAnimating } = useGameStore.getState()
    if (isAnimating) return

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
        // Show panel if landing on a project tile, clear if leaving one
        setActiveProject(
          LAYOUT[nextRow][nextCol] === 2
            ? findProjectAtTile(nextCol, nextRow)
            : null
        )
        setIsAnimating(false)
      },
    })
  }, [api, setCubePos, setIsAnimating, setActiveProject])

  useKeyboard(move)

  return (
    <animated.group position={spring.pivotPos} rotation={spring.rotation}>
      <animated.mesh position={spring.meshOffset} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#6c63ff" roughness={0.55} metalness={0.05} />
      </animated.mesh>
    </animated.group>
  )
}
