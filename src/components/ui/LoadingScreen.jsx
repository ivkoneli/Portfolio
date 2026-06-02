import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'
import useGameStore from '../../store/gameStore'

// Branded overlay shown while textures / model / font load (drei tracks the THREE
// loading manager via useProgress). Stays up for a minimum time so it's actually
// seen, then commits to a one-way fade (the commit avoids flicker when loaders
// finish in waves). Signals sceneReady when fully gone.
const FONT    = "'Segoe UI', system-ui, sans-serif"
const MIN_MS  = 2000   // minimum time on screen
const FADE_MS = 700

export default function LoadingScreen() {
  const { progress, active } = useProgress()
  const setSceneReady = useGameStore(s => s.setSceneReady)
  const startedRef = useRef(false)
  const startTime  = useRef(performance.now())
  const [fading, setFading] = useState(false)
  const [gone, setGone] = useState(false)

  // Mark that loading actually began (so we don't finish on the very first frame).
  useEffect(() => { if (active) startedRef.current = true }, [active])
  const done = startedRef.current && !active && progress >= 100

  // Begin the fade once loaded AND the minimum display time has elapsed.
  useEffect(() => {
    if (!done || fading) return
    const remaining = Math.max(0, MIN_MS - (performance.now() - startTime.current))
    const t = setTimeout(() => setFading(true), remaining)
    return () => clearTimeout(t)
  }, [done, fading])

  // Safety net — never hang on the loader.
  useEffect(() => {
    const t = setTimeout(() => setFading(true), 12000)
    return () => clearTimeout(t)
  }, [])

  // After the fade completes, unmount and tell the app the scene is ready.
  useEffect(() => {
    if (!fading) return
    const t = setTimeout(() => { setGone(true); setSceneReady(true) }, FADE_MS)
    return () => clearTimeout(t)
  }, [fading, setSceneReady])

  if (gone) return null

  // While fading we still show 100%, so the bar doesn't snap backward.
  const shownPct = fading ? 100 : Math.round(progress)

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10001,
      background: '#05060a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '22px',
      opacity: fading ? 0 : 1,
      transition: `opacity ${FADE_MS}ms ease`,
      pointerEvents: fading ? 'none' : 'auto',
    }}>
      <div style={{ fontFamily: FONT, fontSize: '14px', fontWeight: 700, letterSpacing: '0.35em', color: '#f5a623', textShadow: '0 0 18px rgba(245,166,35,0.5)' }}>
        PORTFOLIO
      </div>
      <div style={{ width: '210px', height: '3px', background: 'rgba(245,166,35,0.15)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: `${shownPct}%`, height: '100%', background: '#f5a623', boxShadow: '0 0 12px #f5a623', transition: 'width 0.2s ease' }} />
      </div>
      <div style={{ fontFamily: FONT, fontSize: '11px', color: '#6b5a3a' }}>
        {shownPct}%
      </div>
    </div>
  )
}
