// ============================================================
//  TILE LAYOUT  (20 × 20)
//  0 = void   (no tile — cube can't step here)
//  1 = normal tile
//  2 = project tile (marks top-left corner of a 4×4 zone)
//
//  Read the grid visually: left→right = west→east (+X)
//                          top→bottom = north→south (+Z)
//
//  Project zones (4×4 each, value 2):
//    P1 TicTacToe   — tileOrigin { col:1,  row:0  }  (top-left)
//    P2 Placeholder — tileOrigin { col:14, row:0  }  (top-right)
//    P3 Placeholder — tileOrigin { col:14, row:14 }  (bottom-right)
//    P4 Placeholder — tileOrigin { col:1,  row:14 }  (bottom-left)
//
//  Roads:
//    Top    — row 4,  cols 2–16  (connects P1 ↔ P2)
//    Spokes — cols 9 & 10, rows 5–12  (hub between the two roads)
//    Bottom — row 13, cols 2–16  (connects P4 ↔ P3)
//
//  col →   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19
// ============================================================
export const LAYOUT = [
  [0,2,2,2,2,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0], // row 0   P1 & P2 (4×4 top rows)
  [0,2,2,2,2,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0], // row 1
  [0,2,2,2,2,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0], // row 2
  [0,2,2,2,2,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0], // row 3
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0], // row 4   top road (cols 2-16)
  [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0], // row 5   vertical spokes
  [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0], // row 6
  [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0], // row 7
  [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0], // row 8
  [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0], // row 9
  [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0], // row 10
  [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0], // row 11
  [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0], // row 12
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0], // row 13  bottom road (cols 2-16)
  [0,2,2,2,2,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0], // row 14  P4 & P3 (4×4 bottom rows)
  [0,2,2,2,2,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0], // row 15
  [0,2,2,2,2,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0], // row 16
  [0,2,2,2,2,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0], // row 17
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // row 18
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // row 19
]

export const ROWS = LAYOUT.length       // 20
export const COLS = LAYOUT[0].length    // 20

// Convert grid coordinates to world XZ position.
// Grid is centered at world origin: x ∈ [-9.5, 9.5], z ∈ [-9.5, 9.5]
export function tileToWorld(col, row) {
  return [
    col - (COLS - 1) / 2,
    0,
    row - (ROWS - 1) / 2,
  ]
}

// Cube starts on the top road, near P1
export const CUBE_START = { col: 4, row: 4 }

// Convert a world XZ point back to the nearest grid cell (inverse of tileToWorld).
export function worldToTile(x, z) {
  return {
    col: Math.round(x + (COLS - 1) / 2),
    row: Math.round(z + (ROWS - 1) / 2),
  }
}

function isWalkable(col, row) {
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
