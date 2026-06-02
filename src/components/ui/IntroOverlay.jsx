import { useEffect, useState } from 'react'
import useGameStore from '../../store/gameStore'

// First-load controls hint. Appears ~1s AFTER the scene finished loading, then
// stays until the first input (key / click) before fading out. Pointer-events off.
const kbd = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '22px',
  padding: '3px 8px',
  background: 'rgba(192, 132, 252, 0.18)',
  border: '1px solid rgba(192, 132, 252, 0.5)',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: 700,
  color: '#e9d5ff',
}

// Touch-primary devices have no keyboard, so the hint speaks "tap" not "arrows".
const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

export default function IntroOverlay() {
  const sceneReady = useGameStore(s => s.sceneReady)
  const [ready, setReady] = useState(false)   // mounted ~1s after the scene loads
  const [shown, setShown] = useState(false)   // drives the fade-in
  const [hidden, setHidden] = useState(false) // dismissed by first input
  const [gone, setGone] = useState(false)

  // Appear 1s after the loading screen has finished.
  useEffect(() => {
    if (!sceneReady) return
    const t = setTimeout(() => setReady(true), 1000)
    return () => clearTimeout(t)
  }, [sceneReady])

  // Fade in on the next frame after mounting, then dismiss on the first input.
  useEffect(() => {
    if (!ready) return
    const raf = requestAnimationFrame(() => setShown(true))
    const hide = () => setHidden(true)
    const ARROWS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
    const onKey = e => { if (ARROWS.includes(e.key)) hide() }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', hide, { once: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', hide)
    }
  }, [ready])

  useEffect(() => {
    if (!hidden) return
    const t = setTimeout(() => setGone(true), 700)
    return () => clearTimeout(t)
  }, [hidden])

  if (!ready || gone) return null

  const visible = shown && !hidden

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: '12%',
      display: 'flex',
      justifyContent: 'center',
      zIndex: 10000,
      pointerEvents: 'none',
      opacity: visible ? 1 : 0,
      transform: `translateY(${visible ? 0 : 8}px)`,
      transition: 'opacity 0.7s ease, transform 0.7s ease',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 24px',
        background: 'rgba(5, 8, 20, 0.72)',
        border: '1px solid rgba(192, 132, 252, 0.3)',
        borderRadius: '999px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 0 40px rgba(108, 99, 255, 0.3)',
        color: '#e5e7eb',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        fontSize: '15px',
        whiteSpace: 'nowrap',
      }}>
        {isTouch ? (
          <>
            <span style={kbd}>tap</span>
            <span>to move</span>
            <span style={{ opacity: 0.35, margin: '0 4px' }}>•</span>
            <span style={kbd}>tap</span>
            <span>a project to view</span>
          </>
        ) : (
          <>
            <span style={kbd}>↑↓←→</span>
            <span>or</span>
            <span style={kbd}>click</span>
            <span>to move</span>
            <span style={{ opacity: 0.35, margin: '0 4px' }}>•</span>
            <span style={kbd}>E</span>
            <span>to view a project</span>
          </>
        )}
      </div>
    </div>
  )
}
