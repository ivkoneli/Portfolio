// ============================================================
//  TILE LAYOUT  (cross / T board, generated programmatically)
//
//  0 = void   1 = normal road/tile   2 = project platform cell
//
//  You spawn at the bottom on a START pad, cross the BRIDGE forward (north)
//  to the central HUB, then branch:
//     ← left  = GAMES  (MiniGames, TicTacToe, Knight's Gauntlet)
//     → right = TECH   (Shader Pipelines)
//     ↑ up    = ABOUT ME  (plaza placeholder for the stats holograms)
//
//  Each project sits on its OWN short spur off the arm road, spaced apart.
//  Grid is centered at the world origin by tileToWorld().
// ============================================================
export const ROWS = 24
export const COLS = 27

// Top-left corner of each project's 4×4 platform (single source of truth;
// projects.js reads these so data and layout never drift apart).
// The three GAMES sit far left, well spaced, each joined to the collector by
// its OWN little horizontal bridge; SHADER sits at the right.
export const PROJECT_ORIGINS = {
  minigames:          { col: 1,  row: 2 },   // games — top of the left cluster
  tictactoe:          { col: 2,  row: 9 },   // games — middle (slightly inset)
  'knights-gauntlet': { col: 1,  row: 16 },  // games — bottom of the left cluster
  'shader-pipelines': { col: 19, row: 5 },   // tech  — right
}

// Spawn at the bottom of the bridge (empty surroundings).
export const CUBE_START = { col: 13, row: 21 }

function buildLayout() {
  const g = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  const set1  = (c, r) => { if (r >= 0 && r < ROWS && c >= 0 && c < COLS && g[r][c] === 0) g[r][c] = 1 }
  const hRoad = (c0, c1, r) => { for (let c = c0; c <= c1; c++) set1(c, r) }
  const vRoad = (c, r0, r1) => { for (let r = r0; r <= r1; r++) set1(c, r) }
  const plaza = (col, row, w, h) => { for (let r = row; r < row + h; r++) for (let c = col; c < col + w; c++) set1(c, r) }
  const platform = ({ col, row }) => { for (let r = row; r < row + 4; r++) for (let c = col; c < col + 4; c++) g[r][c] = 2 }

  // Spine: about road (north) → hub → bridge (south), all on col 13.
  vRoad(13, 4, 19)
  // Main walkway: hub → games collector.
  hRoad(9, 13, 10)
  // Collector at the cluster end (vertical link between the three game bridges).
  vRoad(9, 4, 17)
  // Each game's own little horizontal bridge out to the collector (varying).
  hRoad(5, 9, 4)    // minigames (top)
  hRoad(6, 9, 10)   // tictactoe (middle — shorter, inset)
  hRoad(5, 9, 17)   // knights   (bottom)
  // Right arm + short spur up to the Shader platform.
  hRoad(13, 20, 10)
  vRoad(20, 9, 9)
  // Start pad (empty around it) and About-Me plaza up top.
  plaza(12, 20, 3, 3)
  plaza(12, 0, 4, 4)

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
