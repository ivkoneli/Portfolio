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
//     ↑ up    = ABOUT ME, and a bridge behind it to the PORTFOLIO platform.
//
//  Each project sits on its OWN 3-tile spur off the arm road. Grid is
//  centered at the world origin by tileToWorld().
//
//  PAD carves empty rows NORTH of the About-Me island (for the bridge +
//  Portfolio platform). We pad the SOUTH by the same amount so the board stays
//  centred on the origin → camera, fog and pillars keep their exact position.
//  Every authored row below is written `PAD + <original row>` so the original
//  numbers (and their comments) still read true.
// ============================================================
const PAD = 9
export const ROWS = 27 + PAD * 2
export const COLS = 40

// Top-left corner of each project's 4×4 platform (single source of truth;
// projects.js reads these so data and layout never drift apart).
// The whole board sits 3 rows south of the top so the ABOUT plaza (pinned at
// rows 0–3) gets clear space above the Shader hologram. The three GAMES sit far
// left; the right arm is a zigzag: UP platforms (rows 6–9) and DOWN platforms
// (rows 17–20) hang off the row-13 road.
export const PROJECT_ORIGINS = {
  minigames:          { col: 1,  row: PAD + 5 },   // games — top of the left cluster
  tictactoe:          { col: 2,  row: PAD + 12 },  // games — middle (slightly inset)
  'knights-gauntlet': { col: 1,  row: PAD + 19 },  // games — bottom of the left cluster
  'shader-pipelines': { col: 20, row: PAD + 17 },  // right arm — DOWN (1st)
  domineering:        { col: 25, row: PAD + 6 },   // right arm — UP   (2nd)
  tasking:            { col: 30, row: PAD + 17 },  // right arm — DOWN (3rd)
  'pokemon-go':       { col: 35, row: PAD + 6 },   // right arm — UP   (4th)
  portfolio:          { col: 13, row: PAD - 9 },   // behind ABOUT ME (rows 0–3), reached by the back bridge
}

// Spawn at the bottom of the bridge (empty surroundings).
export const CUBE_START = { col: 15, row: PAD + 24 }

// Top-left of the 5×5 About-Me island. Only the perimeter ring is walkable; the
// inner 3×3 is a raised dais drawn as meshes in AboutIsland.jsx. Centred on the
// spine (col 15) so the bridge meets it dead-centre. Centre = (15, PAD + 2).
export const ABOUT_ORIGIN = { col: 13, row: PAD + 0 }

// Tile the cube is sent to when "Explore This Portfolio" is pressed — on the
// Portfolio platform (rows PAD-9..PAD-6), so landing there activates the card.
export const PORTFOLIO_ENTRY = { col: 15, row: PAD - 7 }

function buildLayout() {
  const g = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  const set1  = (c, r) => { if (r >= 0 && r < ROWS && c >= 0 && c < COLS && g[r][c] === 0) g[r][c] = 1 }
  const hRoad = (c0, c1, r) => { for (let c = c0; c <= c1; c++) set1(c, r) }
  const vRoad = (c, r0, r1) => { for (let r = r0; r <= r1; r++) set1(c, r) }
  const plaza = (col, row, w, h) => { for (let r = row; r < row + h; r++) for (let c = col; c < col + w; c++) set1(c, r) }
  const platform = ({ col, row }) => { for (let r = row; r < row + 4; r++) for (let c = col; c < col + 4; c++) g[r][c] = 2 }

  // Spine: about plaza (north) → hub → bridge (south), all on col 15.
  vRoad(15, PAD + 4, PAD + 22)
  // Main walkway: hub → games collector (long, so the games sit well to the left).
  hRoad(9, 15, PAD + 13)
  // Collector at the cluster end (vertical link between the three game bridges).
  vRoad(9, PAD + 7, PAD + 20)
  // Each game's own little horizontal bridge out to the collector (varying).
  hRoad(5, 9, PAD + 7)    // minigames (top)
  hRoad(6, 9, PAD + 13)   // tictactoe (middle — shorter, inset)
  hRoad(5, 9, PAD + 20)   // knights   (bottom)
  // Right arm: one long road, four 3-tile spurs zigzagging off it (sits further right).
  hRoad(15, 36, PAD + 13)
  vRoad(21, PAD + 14, PAD + 16)  // shader      — DOWN spur
  vRoad(26, PAD + 10, PAD + 12)  // domineering — UP   spur
  vRoad(31, PAD + 14, PAD + 16)  // tasking     — DOWN spur
  vRoad(36, PAD + 10, PAD + 12)  // pokemon-go  — UP   spur
  // Start pad (empty around it).
  plaza(14, PAD + 23, 3, 3)
  // About-Me island: a 5×5 ring you walk around; the inner 3×3 is a raised dais
  // (drawn in AboutIsland.jsx), so only the perimeter is walkable. Cols 13–17 so
  // the spine (col 15) meets the south edge dead-centre.
  hRoad(13, 17, PAD + 0)   // ring — north edge
  hRoad(13, 17, PAD + 4)   // ring — south edge (the spine joins here at col 15, centre)
  vRoad(13, PAD + 0, PAD + 4)    // ring — west edge
  vRoad(17, PAD + 0, PAD + 4)    // ring — east edge

  // Portfolio: a 5-tile bridge north off the About-Me back edge to its platform.
  vRoad(15, PAD - 5, PAD - 1)   // bridge (rows 4–8, joins the platform's south edge)

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

// The Portfolio (its 4×4 platform + the bridge linking it to About-Me) stays
// sealed and hidden until the user reveals it from the profile panel. Renderers
// (InstancedTiles, Grid, DepthPillars) skip these tiles while it's hidden.
let portfolioRevealed = false
export function revealPortfolio() { portfolioRevealed = true }
export function isPortfolioRevealed() { return portfolioRevealed }

export function isPortfolioTile(col, row) {
  const p = PROJECT_ORIGINS.portfolio
  const onPlatform = col >= p.col && col <= p.col + 3 && row >= p.row && row <= p.row + 3
  const onBridge   = col === 15 && row >= PAD - 5 && row <= PAD - 1
  return onPlatform || onBridge
}

// World positions of the Portfolio's bridge tiles, ordered from the About-Me
// side toward the platform (so a staggered reveal lays the path toward the
// island). The RevealTiles animation renders these; InstancedTiles skips them.
export function portfolioBridgeTiles() {
  const out = []
  LAYOUT.forEach((row, r) => row.forEach((cell, c) => {
    if (cell === 1 && isPortfolioTile(c, r)) { const [x, y, z] = tileToWorld(c, r); out.push({ x, y, z }) }
  }))
  return out.sort((a, b) => b.z - a.z)   // higher z (About side) first
}

export function isWalkable(col, row) {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false
  if (LAYOUT[row][col] === 0) return false
  if (!portfolioRevealed && isPortfolioTile(col, row)) return false
  return true
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
