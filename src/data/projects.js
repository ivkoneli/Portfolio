// All project data lives here.
// tileOrigin = top-left corner of the 3×3 project zone in grid coordinates.
export const PROJECTS = [
  {
    id: 'tictactoe',
    name: 'TicTacToe',
    description: 'Classic TicTacToe built in Unity. Two-player local multiplayer with clean UI.',
    tech: ['Unity 2D', 'C#'],
    demoUrl: 'https://ivkoneli.github.io/TicTacToe/',
    tileOrigin: { col: 1, row: 1 }, // occupies cols 1-3, rows 1-3
  },
]

// Returns the project whose 3×3 zone contains (col, row), or null.
export function findProjectAtTile(col, row) {
  return PROJECTS.find(p =>
    col >= p.tileOrigin.col && col <= p.tileOrigin.col + 2 &&
    row >= p.tileOrigin.row && row <= p.tileOrigin.row + 2
  ) ?? null
}
