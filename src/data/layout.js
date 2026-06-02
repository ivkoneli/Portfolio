// ============================================================
//  TILE LAYOUT  (cross / T board, generated programmatically)
//
//  0 = void   1 = normal road/tile   2 = project platform cell
//
//  You spawn at the bottom on a START pad, cross the BRIDGE forward (north)
//  to the central HUB, then branch:
//     ← left  = GAMES  (MiniGames, TicTacToe, Knight's Gauntlet)
//     → right = a long zigzag arm of projects hanging off a horizontal road,
//               alternating above / below it:
//                       ↑ Domineering         ↑ PokémonGo
//                   ───────────────────────────────── (arm road, row 13)
//                   ↓ Shader Pipelines    ↓ TasKing
//     ↑ up    = ABOUT ME  (plaza placeholder for the stats holograms)
//
//  Each project sits on its OWN 3-tile spur off the arm road. Grid is
//  centered at the world origin by tileToWorld().
// ============================================================
export const ROWS = 27
export const COLS = 40

// Top-left corner of each project's 4×4 platform (single source of truth;
// projects.js reads these so data and layout never drift apart).
// The whole board sits 3 rows south of the top so the ABOUT plaza (pinned at
// rows 0–3) gets clear space above the Shader hologram. The three GAMES sit far
// left; the right arm is a zigzag: UP platforms (rows 6–9) and DOWN platforms
// (rows 17–20) hang off the row-13 road.
export const PROJECT_ORIGINS = {
  minigames:          { col: 1,  row: 5 },   // games — top of the left cluster
  tictactoe:          { col: 2,  row: 12 },  // games — middle (slightly inset)
  'knights-gauntlet': { col: 1,  row: 19 },  // games — bottom of the left cluster
  'shader-pipelines': { col: 20, row: 17 },  // right arm — DOWN (1st)
  domineering:        { col: 25, row: 6 },   // right arm — UP   (2nd)
  tasking:            { col: 30, row: 17 },  // right arm — DOWN (3rd)
  'pokemon-go':       { col: 35, row: 6 },   // right arm — UP   (4th)
}

// Spawn at the bottom of the bridge (empty surroundings).
export const CUBE_START = { col: 15, row: 24 }

// Top-left of the 5×5 About-Me island. Only the perimeter ring is walkable; the
// inner 3×3 is a raised dais drawn as meshes in AboutIsland.jsx. Centred on the
// spine (col 15) so the bridge meets it dead-centre. Centre = (15, 2).
export const ABOUT_ORIGIN = { col: 13, row: 0 }

function buildLayout() {
  const g = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  const set1  = (c, r) => { if (r >= 0 && r < ROWS && c >= 0 && c < COLS && g[r][c] === 0) g[r][c] = 1 }
  const hRoad = (c0, c1, r) => { for (let c = c0; c <= c1; c++) set1(c, r) }
  const vRoad = (c, r0, r1) => { for (let r = r0; r <= r1; r++) set1(c, r) }
  const plaza = (col, row, w, h) => { for (let r = row; r < row + h; r++) for (let c = col; c < col + w; c++) set1(c, r) }
  const platform = ({ col, row }) => { for (let r = row; r < row + 4; r++) for (let c = col; c < col + 4; c++) g[r][c] = 2 }

  // Spine: about plaza (north) → hub → bridge (south), all on col 15.
  vRoad(15, 4, 22)
  // Main walkway: hub → games collector (long, so the games sit well to the left).
  hRoad(9, 15, 13)
  // Collector at the cluster end (vertical link between the three game bridges).
  vRoad(9, 7, 20)
  // Each game's own little horizontal bridge out to the collector (varying).
  hRoad(5, 9, 7)    // minigames (top)
  hRoad(6, 9, 13)   // tictactoe (middle — shorter, inset)
  hRoad(5, 9, 20)   // knights   (bottom)
  // Right arm: one long road, four 3-tile spurs zigzagging off it (sits further right).
  hRoad(15, 36, 13)
  vRoad(21, 14, 16)  // shader      — DOWN spur
  vRoad(26, 10, 12)  // domineering — UP   spur
  vRoad(31, 14, 16)  // tasking     — DOWN spur
  vRoad(36, 10, 12)  // pokemon-go  — UP   spur
  // Start pad (empty around it).
  plaza(14, 23, 3, 3)
  // About-Me island: a 5×5 ring you walk around; the inner 3×3 is a raised dais
  // (drawn in AboutIsland.jsx), so only the perimeter is walkable. Cols 13–17 so
  // the spine (col 15) meets the south edge dead-centre.
  hRoad(13, 17, 0)   // ring — north edge
  hRoad(13, 17, 4)   // ring — south edge (the spine joins here at col 15, centre)
  vRoad(13, 0, 4)    // ring — west edge
  vRoad(17, 0, 4)    // ring — east edge

  // Project platforms.
  Object.values(PROJECT_ORIGINS).forEach(platform)

  return g
}

export const LAYOUT = buildLayout()

// Convert grid coordinates to world XZ position (grid centered at origin).
export function tileToWorld(col, row) {
  return [
    col - (COLS - 1) / 2,
    0,
    row - (ROWS - 1) / 2,
  ]
}

// Inverse of tileToWorld: nearest grid cell for a world XZ point.
export function worldToTile(x, z) {
  return {
    col: Math.round(x + (COLS - 1) / 2),
    row: Math.round(z + (ROWS - 1) / 2),
  }
}

export function isWalkable(col, row) {
  return row >= 0 && row < ROWS && col >= 0 && col < COLS && LAYOUT[row][col] !== 0
}

// BFS shortest path over walkable tiles. Returns an array of { dc, dr } steps
// from start to goal, [] if already there, or null if unreachable.
export function findPath(start, goal) {
  if (!isWalkable(goal.col, goal.row)) return null
  if (start.col === goal.col && start.row === goal.row) return []

  const key = (c, r) => `${c},${r}`
  const prev = { [key(start.col, start.row)]: null }
  const queue = [start]
  const dirs = [{ dc: 1, dr: 0 }, { dc: -1, dr: 0 }, { dc: 0, dr: 1 }, { dc: 0, dr: -1 }]

  while (queue.length) {
    const cur = queue.shift()
    if (cur.col === goal.col && cur.row === goal.row) {
      const steps = []
      let node = cur
      while (prev[key(node.col, node.row)]) {
        const p = prev[key(node.col, node.row)]
        steps.push({ dc: node.col - p.col, dr: node.row - p.row })
        node = p
      }
      return steps.reverse()
    }
    for (const d of dirs) {
      const nc = cur.col + d.dc, nr = cur.row + d.dr
      if (isWalkable(nc, nr) && !(key(nc, nr) in prev)) {
        prev[key(nc, nr)] = { col: cur.col, row: cur.row }
        queue.push({ col: nc, row: nr })
      }
    }
  }
  return null
}
