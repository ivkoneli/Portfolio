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
import dom1 from '../assets/projects/domineering/dom1.png'
import dom2 from '../assets/projects/domineering/dom2.png'
import dom3 from '../assets/projects/domineering/dom3.png'
import dom4 from '../assets/projects/domineering/dom4.png'
import dom5 from '../assets/projects/domineering/dom5.png'
import dom6 from '../assets/projects/domineering/dom6.png'
import tking1 from '../assets/projects/tasking/tking1.jpg'
import tking2 from '../assets/projects/tasking/tking2.jpg'
import tking3 from '../assets/projects/tasking/tking3.jpg'
import tking4 from '../assets/projects/tasking/tking4.jpg'
import tking5 from '../assets/projects/tasking/tking5.jpg'
import pgo1 from '../assets/projects/pokemon-go/pgo1.jpg'
import pgo2 from '../assets/projects/pokemon-go/pgo2.jpg'
import pgo3 from '../assets/projects/pokemon-go/pgo3.jpg'
import pgo4 from '../assets/projects/pokemon-go/pgo4.jpg'
import pgo5 from '../assets/projects/pokemon-go/pgo5.jpg'
import pgo6 from '../assets/projects/pokemon-go/pgo6.jpg'
import pgo7 from '../assets/projects/pokemon-go/pgo7.jpg'
import portfolio from '../assets/portfolio.png'

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
    tileBase:     shade(0.60),   // mid-tone so the metal texture reads in the project's colour
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
    longDescription: 'A web-based minigames platform built with TypeScript and the Phaser game engine. It collects a handful of puzzle games alongside trivia across science, history, and math, all under one playable hub. Bundled with Vite and deployed to GitHub Pages, it\'s a self-contained showcase of small, focused browser games.',
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
    longDescription: 'A polished two-player local multiplayer TicTacToe built in Unity. It features a clean, minimal interface, smooth turn-based gameplay, automatic win and draw detection, and a responsive board that scales across screen sizes. Built as a hands-on exercise in Unity 2D fundamentals like input handling, game-state management, and UI layout, with an emphasis on tight, readable game logic and a frictionless player experience.',
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
    longDescription: "Knight's Gauntlet is a Unity (C#) action game where you fight your way through waves of enemies as a knight. What sets it apart from a typical client-only game is a Python backend deployed on Railway: the game talks to a live API for online features like persistent scores and a leaderboard, so it spans the full stack, with gameplay and UI on the client plus a real deployed server behind it.",
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
    longDescription: "My bachelor's thesis: a Unity project exploring real-time shader pipelines across multiple scenes. It demonstrates post-processing effects, non-photorealistic rendering (NPR), and procedural shader effects, applied to both low-poly and high-quality assets so each technique can be compared in context. Written primarily in ShaderLab/HLSL with C# driving the scenes, it's a deep-dive into how custom shaders shape the look of a rendered scene.",
    tech: ['Unity', 'ShaderLab', 'HLSL', 'C#'],
    repoUrl: 'https://github.com/ivkoneli/ShaderPipelinesDiplomski',
    youtubeUrl: 'https://youtu.be/gyD2RhK9JoE',
    images: [shp1, shp2, shp3, shp4, shp5],
    tileOrigin: PROJECT_ORIGINS['shader-pipelines'],
    theme: makeTheme('#10b981'),   // emerald — graphics
  },
  {
    id: 'domineering',
    name: 'Domineering',
    description: 'A Python/pygame clone of the classic Domineering board game, with local multiplayer and a custom A* CPU.',
    longDescription: "A Python clone of Domineering, the classic combinatorial board game where two players place dominoes in opposing orientations until one of them can't move. Built with pygame for the UI and board interaction, it supports local two-player matches as well as a CPU opponent driven by a custom A*-style search: difficulty scales with how deep the search goes and how far ahead the algorithm predicts. Old-school game AI, the clever hand-written kind from before the LLM era.",
    tech: ['Python', 'pygame', 'A*'],
    repoUrl: 'https://github.com/ivkoneli/Domineering',
    images: [dom1, dom2, dom3, dom4, dom5, dom6],
    tileOrigin: PROJECT_ORIGINS.domineering,
    theme: makeTheme('#8b5cf6'),   // violet — AI
  },
  {
    id: 'tasking',
    name: 'TasKing',
    description: 'A React + .NET work-management app for organizations to split work and track tasks, like a homegrown Jira or ClickUp.',
    longDescription: "TasKing is a work-management web app for organizations, basically a homegrown Jira or ClickUp, built with a React front end and a .NET back end. It lets teams break work into projects and track tasks through their lifecycle, with a MySQL database and hosting on Azure. Built around four years ago; the repository is currently being re-populated, so the full source will land here soon.",
    tech: ['React', '.NET', 'Azure', 'MySQL'],
    repoUrl: 'https://github.com/ivkoneli/TasKing',
    images: [tking1, tking2, tking3, tking4, tking5],
    tileOrigin: PROJECT_ORIGINS.tasking,
    theme: makeTheme('#14b8a6'),   // teal — full-stack web
  },
  {
    id: 'pokemon-go',
    name: 'PokémonGo',
    description: 'A Pokémon-inspired Android app: explore real city spots, catch and battle creatures, and track your progress.',
    longDescription: "MyPlaces is a Pokémon-inspired Android app built in Kotlin. Explore your city to discover creatures tied to real locations, then catch and battle them in turn-based combat with live damage and XP logs. It tracks per-user profiles (levels, experience, win/loss records) backed by Firebase (Firestore, Authentication, Storage), and rounds it out with a map, leaderboard, and customizable avatars. Built on Android Jetpack with a clean MVVM architecture.",
    tech: ['Kotlin', 'Firebase'],
    repoUrl: 'https://github.com/ivkoneli/PokemonGo',
    releasesUrl: 'https://github.com/ivkoneli/PokemonGo/releases/tag/v2.0r',
    images: [pgo1, pgo2, pgo3, pgo4, pgo5, pgo6, pgo7],
    tileOrigin: PROJECT_ORIGINS['pokemon-go'],
    theme: makeTheme('#ef4444'),   // red — mobile
  },
  {
    id: 'portfolio',
    name: 'This Portfolio',
    description: 'A 3D portfolio you explore by rolling a block around the board, inspired by Bloxorz.',
    longDescription: "I wanted a portfolio you play instead of scroll, where every project is a place you roll the cube to. Built with React and Three.js (React-Three-Fiber), a hand-written GLSL shader for the holograms, an instanced metal floor, and BFS pathfinding for click-to-move. State runs on Zustand, the cube on react-spring, bundled with Vite.",
    tech: ['React', 'Three.js', 'React-Three-Fiber', 'GLSL', 'Zustand', 'Vite'],
    repoUrl: 'https://github.com/ivkoneli/Portfolio',
    images: [portfolio],
    tileOrigin: PROJECT_ORIGINS.portfolio,
    theme: makeTheme('#c084fc'),   // violet — matches the cube's glow
    // Attribution for the About-Me hologram bust (CC BY 4.0). Rendered as a small
    // footer in ProjectPanel; segments with `href` become links.
    credits: [
      { text: 'About-Me hologram bust: ' },
      { text: '“Male Head”', href: 'https://sketchfab.com/3d-models/male-head-0247a25a04ba46b99629130277fe39b7' },
      { text: ' by Alexander Antipov, licensed ' },
      { text: 'CC BY 4.0', href: 'https://creativecommons.org/licenses/by/4.0/' },
      { text: '.' },
    ],
  },
]

// Returns the project whose 4×4 zone contains (col, row), or null.
export function findProjectAtTile(col, row) {
  return PROJECTS.find(p =>
    col >= p.tileOrigin.col && col <= p.tileOrigin.col + 3 &&
    row >= p.tileOrigin.row && row <= p.tileOrigin.row + 3
  ) ?? null
}
