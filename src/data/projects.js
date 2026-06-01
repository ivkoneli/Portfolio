import * as THREE from 'three'
import { PROJECT_ORIGINS } from './layout'
import ttt1 from '../assets/projects/tictactoe/1.png'
import ttt2 from '../assets/projects/tictactoe/2.png'
import ttt3 from '../assets/projects/tictactoe/3.png'
import ttt4 from '../assets/projects/tictactoe/4.png'
import kg1 from '../assets/projects/knights-gauntlet/KG1.png'
import kg2 from '../assets/projects/knights-gauntlet/KG2.png'
import kg3 from '../assets/projects/knights-gauntlet/KG3.png'
import kg4 from '../assets/projects/knights-gauntlet/KG4.png'
import kg5 from '../assets/projects/knights-gauntlet/KG5.png'
import shp1 from '../assets/projects/shader-pipelines/shp1.png'
import shp2 from '../assets/projects/shader-pipelines/shp2.png'
import shp3 from '../assets/projects/shader-pipelines/shp3.png'
import shp4 from '../assets/projects/shader-pipelines/shp4.png'
import shp5 from '../assets/projects/shader-pipelines/shp5.png'
import mg1 from '../assets/projects/minigamesplatform/mg1.png'
import mg2 from '../assets/projects/minigamesplatform/mg2.png'
import mg3 from '../assets/projects/minigamesplatform/mg3.png'
import mg4 from '../assets/projects/minigamesplatform/mg4.png'
import mg5 from '../assets/projects/minigamesplatform/mg5.png'
import mg6 from '../assets/projects/minigamesplatform/mg6.png'

// Build a full tile/card theme from a single base colour. Sections share a base
// hue and each project gets a slight variation, so the board reads as grouped.
function makeTheme(hex) {
  const c = new THREE.Color(hex)
  const rgb = `${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}`
  const shade = f => '#' + c.clone().multiplyScalar(f).getHexString()
  const tint  = f => '#' + c.clone().lerp(new THREE.Color('#ffffff'), f).getHexString()
  return {
    hex,
    rgb,
    tileDark:     shade(0.10),
    tileEmissive: shade(0.32),
    edge:         tint(0.35),
    text:         tint(0.60),
  }
}

// Section colours: GAMES = blues (slight per-project variation), TECH = emerald.
// (ABOUT ME, when built, will use amber.)
export const PROJECTS = [
  {
    id: 'minigames',
    name: 'MiniGames Platform',
    description: 'A web platform of puzzle minigames and trivia, built with TypeScript + Phaser.',
    longDescription: 'A web-based minigames platform built with TypeScript and the Phaser game engine. It collects a handful of puzzle games alongside trivia across science, history, and math, all under one playable hub. Bundled with Vite and deployed to GitHub Pages — a self-contained showcase of small, focused browser games.',
    tech: ['TypeScript', 'Phaser', 'Vite'],
    demoUrl: 'https://ivkoneli.github.io/MiniGames/',
    repoUrl: 'https://github.com/ivkoneli/MiniGames',
    images: [mg1, mg2, mg3, mg4, mg5, mg6],
    tileOrigin: PROJECT_ORIGINS.minigames,
    theme: makeTheme('#22d3ee'),   // games — cyan
  },
  {
    id: 'tictactoe',
    name: 'TicTacToe',
    description: 'Classic TicTacToe built in Unity. Two-player local multiplayer with clean UI.',
    longDescription: 'A polished two-player local multiplayer TicTacToe built in Unity. It features a clean, minimal interface, smooth turn-based gameplay, automatic win and draw detection, and a responsive board that scales across screen sizes. Built as a hands-on exercise in Unity 2D fundamentals — input handling, game-state management, and UI layout — with an emphasis on tight, readable game logic and a frictionless player experience.',
    tech: ['Unity 2D', 'C#'],
    demoUrl: 'https://ivkoneli.github.io/TicTacToe/',
    repoUrl: 'https://github.com/ivkoneli/TicTacToe',
    images: [ttt1, ttt2, ttt3, ttt4],
    tileOrigin: PROJECT_ORIGINS.tictactoe,
    theme: makeTheme('#38bdf8'),   // games — sky blue
  },
  {
    id: 'knights-gauntlet',
    name: "Knight's Gauntlet",
    description: 'A Unity action game with a Python backend deployed on Railway.',
    longDescription: "Knight's Gauntlet is a Unity (C#) action game where you fight your way through waves of enemies as a knight. What sets it apart from a typical client-only game is a Python backend deployed on Railway: the game talks to a live API for online features like persistent scores and a leaderboard, so it spans the full stack — gameplay and UI on the client, plus a real deployed server behind it.",
    tech: ['Unity', 'C#', 'Python', 'Railway'],
    demoUrl: 'https://ivkoneli.github.io/KnightsGauntlet/',
    repoUrl: 'https://github.com/ivkoneli/KnightsGauntlet',
    youtubeUrl: 'https://youtu.be/eRDzjGHHvr8',
    images: [kg1, kg2, kg3, kg4, kg5],
    tileOrigin: PROJECT_ORIGINS['knights-gauntlet'],
    theme: makeTheme('#6366f1'),   // games — indigo
  },
  {
    id: 'shader-pipelines',
    name: 'Shader Pipelines',
    description: 'Bachelor\'s thesis: a Unity showcase of post-processing, NPR and procedural shaders.',
    longDescription: "My bachelor's thesis — a Unity project exploring real-time shader pipelines across multiple scenes. It demonstrates post-processing effects, non-photorealistic rendering (NPR), and procedural shader effects, applied to both low-poly and high-quality assets so each technique can be compared in context. Written primarily in ShaderLab/HLSL with C# driving the scenes, it's a deep-dive into how custom shaders shape the look of a rendered scene.",
    tech: ['Unity', 'ShaderLab', 'HLSL', 'C#'],
    repoUrl: 'https://github.com/ivkoneli/ShaderPipelinesDiplomski',
    youtubeUrl: 'https://youtu.be/gyD2RhK9JoE',
    images: [shp1, shp2, shp3, shp4, shp5],
    tileOrigin: PROJECT_ORIGINS['shader-pipelines'],
    theme: makeTheme('#10b981'),   // tech — emerald
  },
]

// Returns the project whose 4×4 zone contains (col, row), or null.
export function findProjectAtTile(col, row) {
  return PROJECTS.find(p =>
    col >= p.tileOrigin.col && col <= p.tileOrigin.col + 3 &&
    row >= p.tileOrigin.row && row <= p.tileOrigin.row + 3
  ) ?? null
}
