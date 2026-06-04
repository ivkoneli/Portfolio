// ============================================================
//  REUSABLE REVEAL ANIMATION — shared easings + tunable config
//
//  Two building blocks consume this:
//    <Reveal>      — rises a group up out of the fog (the "pillar rising")
//    <RevealTiles> — pops a set of tiles in one-by-one (staggered)
//
//  Everything here is meant to be tweaked. Change a number, reload, watch it.
//  Re-use the same components anywhere (e.g. a full intro that rises every
//  island and lays every road) by feeding them a different config slice.
// ============================================================

import { tileToWorld, CUBE_START } from '../data/layout'

// ── Easing functions (t goes 0→1) ───────────────────────────────────────────
//  Swap any stage's `easing` to one of these names. `easeOutBack` /
//  `easeOutElastic` / `easeOutBounce` overshoot for a punchy "pop".
export const EASINGS = {
  linear:         t => t,
  easeInQuad:     t => t * t,
  easeOutQuad:    t => 1 - (1 - t) * (1 - t),
  easeInOutQuad:  t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  easeOutCubic:   t => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  easeOutQuart:   t => 1 - Math.pow(1 - t, 4),
  // BACK_OVERSHOOT controls how far easeOutBack overshoots before settling.
  easeOutBack:    t => { const c1 = BACK_OVERSHOOT, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) },
  easeOutElastic: t => { if (t === 0 || t === 1) return t; const c4 = (2 * Math.PI) / 3; return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1 },
  easeOutBounce:  t => { const n1 = 7.5625, d1 = 2.75; if (t < 1 / d1) return n1 * t * t; if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75; if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375; return n1 * (t -= 2.625 / d1) * t + 0.984375 },
}
export const BACK_OVERSHOOT = 1.9   // ↑ = bigger overshoot pop (default easeOutBack uses 1.70158)

export const ease = (name, t) => (EASINGS[name] ?? EASINGS.linear)(Math.min(1, Math.max(0, t)))

// ── Tunable reveal config ────────────────────────────────────────────────────
export const REVEAL = {
  // STAGE 1 — the island column rises out of the fog.
  rise: {
    delay:    0.0,            // s to wait before it starts rising
    duration: 1.40,          // s the rise takes
    distance: 11.0,          // world-units travelled up (it starts this far below)
    easing:   'easeOutCubic',// try 'easeOutBack' for a little overshoot at the top
  },

  // STAGE 2 — the connecting tiles pop in, one after another (after the rise).
  tiles: {
    delay:    1.15,          // s after the trigger before the FIRST tile (sequences after the rise)
    duration: 0.42,          // s for each tile's pop
    stagger:  0.10,          // s between consecutive tiles
    easing:   'easeOutBack', // bouncy pop; 'easeOutBounce' / 'easeOutElastic' are fun too
    mode:     'scale',       // 'scale' | 'rise' | 'drop'  (see recommendations below)
    riseFrom: 1.40,          // world-units below, for mode 'rise'
    dropFrom: 6.0,           // world-units above, for mode 'drop'
    reverse:  false,         // false = lay from the About side toward the island
  },

  // STAGE 3 — the holo card materialises (CSS, see index.css `holoReveal`).
  // Times are seconds, measured from when the card mounts (= the reveal trigger).
  card: {
    delay:      1.45,   // wait for the platform to finish rising, then start
    reveal:     0.80,   // line appears → spreads L/R → opens into the card
    contentGap: 0.00,   // extra pause after the card opens before content pops
    stagger:    0.09,   // between content blocks (title → blurb → chips → buttons)
    contentDur: 0.45,   // each content block's pop
  },

  // After a button-triggered reveal, wait this long (s) before the cube rolls
  // over — keeps the auto-walk from racing the animation. ≈ rise + tiles + card.
  autoRollAfter: 2.4,

  // FIRST-LOAD INTRO — the whole board builds itself once the loader is done.
  // Floor tiles pop outward from the cube start (a radial ripple); each project
  // island rises out of the fog as the ripple reaches it. Keep `total` ≥ the
  // slowest element so the movement hint waits for the build to finish.
  intro: {
    total:        3.0,          // s — whole build is done by here (gates the movement hint)
    tilePop:      0.40,         // s — each floor tile's pop
    tileSpread:   0.045,        // s of delay per world-unit from the cube start
    tileEasing:   'easeOutBack',
    riseDelay:    0.30,         // s base offset before an island starts rising
    riseSpread:   0.030,        // s per world-unit (island centre ← cube start)
    riseDur:      0.90,         // s — island rise duration
    riseDist:     11,           // world-units the island rises from below
    riseEasing:   'easeOutCubic',
    cardRiseFrac: 0.60,         // card starts materialising this far through its island's rise
  },
}

// Cube-start world position — the origin the intro ripples out from.
const [SX, , SZ] = tileToWorld(CUBE_START.col, CUBE_START.row)

// Per-floor-tile delay: farther from the cube start = later (radial ripple).
export function introTileDelay(x, z) {
  return Math.hypot(x - SX, z - SZ) * REVEAL.intro.tileSpread
}

// Per-island delay: an island rises as the ripple reaches its centre.
export function introIslandDelay(tileOrigin) {
  const [cx, , cz] = tileToWorld(tileOrigin.col + 1.5, tileOrigin.row + 1.5)
  return REVEAL.intro.riseDelay + Math.hypot(cx - SX, cz - SZ) * REVEAL.intro.riseSpread
}
