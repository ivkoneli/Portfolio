import { useEffect } from 'react'
import { Html } from '@react-three/drei'
import { tileToWorld } from '../data/layout'
import useGameStore from '../store/gameStore'

const chipStyle = {
  display: 'inline-block',
  border: '1px solid #00c8ff',
  color: '#00c8ff',
  borderRadius: '999px',
  padding: '3px 12px',
  fontSize: '11px',
  fontWeight: 500,
  letterSpacing: '0.03em',
  whiteSpace: 'nowrap',
}

const btnStyle = {
  display: 'inline-block',
  background: '#6c63ff',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '9px 20px',
  fontSize: '13px',
  fontWeight: 700,
  textDecoration: 'none',
  cursor: 'pointer',
  letterSpacing: '0.02em',
  transition: 'background 0.15s',
}

export default function ProjectPanel() {
  const activeProject   = useGameStore(s => s.activeProject)
  const setActiveProject = useGameStore(s => s.setActiveProject)

  // Escape closes the panel
  useEffect(() => {
    if (!activeProject) return
    function onKey(e) { if (e.key === 'Escape') setActiveProject(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeProject, setActiveProject])

  if (!activeProject) return null

  // Float the panel to the right of the project tile's centre
  const [tx, , tz] = tileToWorld(
    activeProject.tileOrigin.col + 1,
    activeProject.tileOrigin.row + 1,
  )

  return (
    <Html
      position={[tx + 3, 1.8, tz]}
      center
      style={{ pointerEvents: 'auto' }}
    >
      <div style={{
        background: 'rgba(8, 8, 20, 0.92)',
        border: '1px solid rgba(0, 200, 255, 0.35)',
        borderRadius: '14px',
        padding: '22px 26px',
        color: '#fff',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        width: '280px',
        boxShadow: '0 0 40px rgba(108, 99, 255, 0.25)',
        backdropFilter: 'blur(8px)',
        userSelect: 'none',
      }}>

        {/* Title */}
        <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
          {activeProject.name}
        </h2>

        {/* Description */}
        <p style={{ margin: '0 0 16px', color: '#9ca3af', fontSize: '13px', lineHeight: 1.5 }}>
          {activeProject.description}
        </p>

        {/* Tech chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
          {activeProject.tech.map(tag => (
            <span key={tag} style={chipStyle}>{tag}</span>
          ))}
        </div>

        {/* CTA */}
        <a
          href={activeProject.demoUrl}
          target="_blank"
          rel="noreferrer"
          style={btnStyle}
          onMouseEnter={e => e.currentTarget.style.background = '#7c74ff'}
          onMouseLeave={e => e.currentTarget.style.background = '#6c63ff'}
        >
          ▶ Play Demo
        </a>

        {/* Hint */}
        <p style={{ marginTop: '14px', marginBottom: 0, color: '#4b5563', fontSize: '11px' }}>
          Press Esc or roll off to close
        </p>
      </div>
    </Html>
  )
}
