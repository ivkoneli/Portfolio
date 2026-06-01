import { useEffect, useState } from 'react'

// First-load controls hint. Fades out after a few seconds or on the first
// input (key / click), then unmounts. Purely informational — pointer-events off.
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

export default function IntroOverlay() {
  const [hidden, setHidden] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const hide = () => setHidden(true)
    const timer = setTimeout(hide, 5000)
    window.addEventListener('keydown', hide, { once: true })
    window.addEventListener('pointerdown', hide, { once: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', hide)
      window.removeEventListener('pointerdown', hide)
    }
  }, [])

  useEffect(() => {
    if (!hidden) return
    const t = setTimeout(() => setGone(true), 700)
    return () => clearTimeout(t)
  }, [hidden])

  if (gone) return null

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
      opacity: hidden ? 0 : 1,
      transform: `translateY(${hidden ? 8 : 0}px)`,
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
        <span style={kbd}>↑↓←→</span>
        <span>or</span>
        <span style={kbd}>click</span>
        <span>to move</span>
        <span style={{ opacity: 0.35, margin: '0 4px' }}>•</span>
        <span style={kbd}>E</span>
        <span>to view a project</span>
      </div>
    </div>
  )
}
