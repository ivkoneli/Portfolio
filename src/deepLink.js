// Shareable project links: /Portfolio/LuckySlimes drops the cube straight onto
// that project's platform (switching floors if needed) and opens its panel.
// Opening / closing a project panel keeps the address bar in sync.
//
// Imported FIRST in main.jsx, and deliberately free of the store import, so
// CUBE_START and the active floor are set before anything else reads them
// (store's initial cubePos, camera start, cube spawn, intro ripple origin).
import { CUBE_START, setActiveLevel } from './data/layout'
import { PROJECTS_BY_LEVEL, setActiveProjectsLevel } from './data/projects'

const BASE = import.meta.env.BASE_URL   // '/' in dev, '/Portfolio/' in prod

// "Knight's Gauntlet" → "KnightsGauntlet", "PokémonGo" → "PokemonGo"
const slugOf = (s) => s.normalize('NFD').replace(/[^A-Za-z0-9]/g, '')

function findBySlug(slug) {
  const want = slug.toLowerCase()
  for (let level = 0; level < PROJECTS_BY_LEVEL.length; level++) {
    const project = PROJECTS_BY_LEVEL[level].find(p =>
      slugOf(p.name).toLowerCase() === want || slugOf(p.id).toLowerCase() === want)
    if (project) return { project, level }
  }
  return null
}

const path = decodeURIComponent(window.location.pathname)
const slug = (path.startsWith(BASE) ? path.slice(BASE.length) : path).replace(/\/+$/, '')
const hit  = slug ? findBySlug(slug) : null

if (hit) {
  setActiveLevel(hit.level)
  setActiveProjectsLevel(hit.level)
  // Spawn on the platform (front-middle tile) so it's the active project.
  const o = hit.project.tileOrigin
  Object.assign(CUBE_START, { col: o.col + 1, row: o.row + 2 })
} else if (slug) {
  window.history.replaceState(null, '', BASE)   // unknown link → plain home URL
}

export function bindDeepLink(useGameStore) {
  if (hit) {
    const st = useGameStore.getState()
    st.setCurrentLevel(hit.level)
    if (hit.project.id === 'portfolio') st.setPortfolioRevealed(true)   // sealed by default
    st.setActiveProject(hit.project)

    // Open the panel once the intro build animation has played.
    const unsub = useGameStore.subscribe(s => {
      if (!s.introDone) return
      unsub()
      s.setDetailProject(hit.project)
    })
  }

  // Keep the URL in step with the open panel.
  useGameStore.subscribe((s, prev) => {
    if (s.detailProject === prev.detailProject) return
    const url = s.detailProject ? BASE + slugOf(s.detailProject.name) : BASE
    if (window.location.pathname !== url) window.history.replaceState(null, '', url)
  })
}
