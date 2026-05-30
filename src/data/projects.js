// All project data lives here.
// tileOrigin = top-left corner of the 4×4 project zone in grid coordinates.
export const PROJECTS = [
  {
    id: 'tictactoe',
    name: 'TicTacToe',
    description: 'Classic TicTacToe built in Unity. Two-player local multiplayer with clean UI.',
    longDescription: 'A polished two-player local multiplayer TicTacToe built in Unity. It features a clean, minimal interface, smooth turn-based gameplay, automatic win and draw detection, and a responsive board that scales across screen sizes. Built as a hands-on exercise in Unity 2D fundamentals — input handling, game-state management, and UI layout — with an emphasis on tight, readable game logic and a frictionless player experience.',
    tech: ['Unity 2D', 'C#'],
    demoUrl: 'https://ivkoneli.github.io/TicTacToe/',
    tileOrigin: { col: 1, row: 0 },
    theme: {
      hex: '#38bdf8',        // sky blue
      rgb: '56, 189, 248',
      tileDark: '#071528',
      tileEmissive: '#0c2a52',
      edge: '#7dd3fc',
      text: '#bae6fd',
    },
  },
  {
    id: 'project-2',
    name: '???',
    description: 'Coming soon.',
    longDescription: 'This project is still in the works. Check back soon for screenshots, a full tech breakdown, and a playable demo. In the meantime, take a look at the other projects on the board.',
    tech: ['Coming Soon'],
    demoUrl: '',
    tileOrigin: { col: 14, row: 0 },
    theme: {
      hex: '#f59e0b',        // amber
      rgb: '245, 158, 11',
      tileDark: '#1c0e00',
      tileEmissive: '#3d1f00',
      edge: '#fcd34d',
      text: '#fde68a',
    },
  },
  {
    id: 'project-3',
    name: '???',
    description: 'Coming soon.',
    longDescription: 'This project is still in the works. Check back soon for screenshots, a full tech breakdown, and a playable demo. In the meantime, take a look at the other projects on the board.',
    tech: ['Coming Soon'],
    demoUrl: '',
    tileOrigin: { col: 14, row: 14 },
    theme: {
      hex: '#10b981',        // emerald
      rgb: '16, 185, 129',
      tileDark: '#021a0e',
      tileEmissive: '#044d29',
      edge: '#6ee7b7',
      text: '#a7f3d0',
    },
  },
  {
    id: 'project-4',
    name: '???',
    description: 'Coming soon.',
    longDescription: 'This project is still in the works. Check back soon for screenshots, a full tech breakdown, and a playable demo. In the meantime, take a look at the other projects on the board.',
    tech: ['Coming Soon'],
    demoUrl: '',
    tileOrigin: { col: 1, row: 14 },
    theme: {
      hex: '#f43f5e',        // rose
      rgb: '244, 63, 94',
      tileDark: '#1a0610',
      tileEmissive: '#4c0519',
      edge: '#fda4af',
      text: '#fecdd3',
    },
  },
]

// Returns the project whose 4×4 zone contains (col, row), or null.
export function findProjectAtTile(col, row) {
  return PROJECTS.find(p =>
    col >= p.tileOrigin.col && col <= p.tileOrigin.col + 3 &&
    row >= p.tileOrigin.row && row <= p.tileOrigin.row + 3
  ) ?? null
}
