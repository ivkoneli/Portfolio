// Tiny Web Audio SFX helper: low latency, overlapping playback, pitch variation.
// Buffers are prefetched on load and decoded once the AudioContext unlocks (first
// user gesture, as browsers require). Grid clicks hit the canvas (not a DOM
// button), so the global UI-click listener below only fires on real buttons/links.
import tileUrl     from '../assets/sounds/tileClick.wav'
import rollUrl     from '../assets/sounds/cuberoll2.wav'
import hologramUrl from '../assets/sounds/hologram.wav'
import uiUrl       from '../assets/sounds/Ui_click.wav'

const URLS = { tile: tileUrl, roll: rollUrl, hologram: hologramUrl, ui: uiUrl }

let ctx = null
let muted = false
const encoded = {}   // prefetched ArrayBuffers
const buffers = {}   // decoded AudioBuffers

// Prefetch the encoded audio immediately (no AudioContext needed yet).
Object.entries(URLS).forEach(([k, url]) => {
  fetch(url).then(r => r.arrayBuffer()).then(buf => { encoded[k] = buf; decode(k) }).catch(() => {})
})

function decode(k) {
  if (!ctx || !encoded[k] || buffers[k]) return
  ctx.decodeAudioData(encoded[k].slice(0)).then(b => { buffers[k] = b }).catch(() => {})
}

// Unlock + create the context on the first user gesture.
function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    ctx = new AC()
    Object.keys(URLS).forEach(decode)
  }
  if (ctx.state === 'suspended') ctx.resume()
}
window.addEventListener('pointerdown', unlock)
window.addEventListener('keydown', unlock)

export function play(name, { volume = 1, rate = 1 } = {}) {
  if (muted || !ctx || !buffers[name]) return
  const src = ctx.createBufferSource()
  src.buffer = buffers[name]
  src.playbackRate.value = rate
  const gain = ctx.createGain()
  gain.gain.value = volume
  src.connect(gain).connect(ctx.destination)
  src.start()
}

export const playTile     = () => play('tile',     { volume: 0.5 })
export const playRoll     = () => play('roll',     { volume: 0.5, rate: 0.95 + Math.random() * 0.1 })
export const playHologram = () => play('hologram', { volume: 0.7 })
export const playUi       = () => play('ui',       { volume: 0.5 })

export function setMuted(m) { muted = !!m }
export function getMuted()  { return muted }

// Any DOM button/link click → UI click. Grid clicks target the <canvas> (no button
// ancestor) so they don't trigger this; tiles play their own sound. Elements marked
// data-silent (e.g. the carousel arrows/dots) are skipped.
window.addEventListener('click', e => {
  const el = e.target
  if (el?.closest?.('button, a') && !el.closest('[data-silent]')) playUi()
})
