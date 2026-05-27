// ============================================================
//  TILE LAYOUT
//  0 = void (no tile — cube falls off here later)
//  1 = normal tile
//  2 = project tile (marks top-left corner of a 3×3 zone)
//
//  Read the grid visually: left→right = west→east (+X)
//                          top→bottom = north→south (+Z)
//
//  col →   0  1  2  3  4  5  6  7  8  9
// ============================================================
export const LAYOUT = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // row 0
  [1, 2, 2, 2, 1, 1, 1, 1, 1, 1], // row 1  ← TicTacToe project tile (3×3)
  [1, 2, 2, 2, 1, 1, 1, 1, 1, 1], // row 2
  [1, 2, 2, 2, 1, 1, 1, 1, 1, 1], // row 3
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // row 4  (cube starts at col 4)
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // row 5
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // row 6
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // row 7
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // row 8
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // row 9
]

export const ROWS = LAYOUT.length       // 10
export const COLS = LAYOUT[0].length    // 10

// Convert grid coordinates to world XZ position.
// Grid is centered at world origin.
export function tileToWorld(col, row) {
  return [
    col - (COLS - 1) / 2,  // x: -4.5 … +4.5
    0,
    row - (ROWS - 1) / 2,  // z: -4.5 … +4.5
  ]
}

// Cube starting grid position (center-ish of the 10×10 grid)
export const CUBE_START = { col: 4, row: 4 }
