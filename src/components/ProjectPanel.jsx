import { useEffect } from 'react'
import useGameStore from '../store/gameStore'

// Rendered outside the Canvas (in main.jsx) so it's guaranteed DOM — no Drei Html needed.
export default function ProjectPanel() {
  const detailProject    = useGameStore(s => s.detailProject)
  const setDetailProject = useGameStore(s => s.setDetailProject)

  useEffect(() => {
    if (!detailProject) return
    function onKey(e) { if (e.key === 'Escape') setDetailProject(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [detailProject, setDetailProject])

  if (!detailProject) return null

  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: 0,
      width: '30%',
      height: '100%',
      background: 'rgba(5, 8, 20, 0.94)',
      borderLeft: '1px solid rgba(192, 132, 252, 0.25)',
      color: '#fff',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 24px',
      boxShadow: '-6px 0 48px rgba(108, 99, 255, 0.18)',
      backdropFilter: 'blur(16px)',
      boxSizing: 'border-box',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
          {detailProject.name}
        </h2>
        <button
          onClick={() => setDetailProject(null)}
          style={{
            flexShrink: 0,
            marginLeft: '12px',
            background: 'none',
            border: '1px solid rgba(192, 132, 252, 0.35)',
            color: '#a78bfa',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '13px',
            cursor: 'pointer',
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      {/* Description */}
      <p style={{ margin: '0 0 20px', color: '#9ca3af', fontSize: '13px', lineHeight: 1.6, flexShrink: 0 }}>
        {detailProject.description}
      </p>

      {/* Carousel placeholder — flex: 1 fills remaining space */}
      <div style={{
        flex: 1,
        minHeight: '160px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '10px',
        border: '1px solid rgba(192, 132, 252, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
      }}>
        <span style={{ color: '#374151', fontSize: '12px', letterSpacing: '0.05em' }}>
          [ media carousel ]
        </span>
      </div>

      {/* Tech chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px', flexShrink: 0 }}>
        {detailProject.tech.map(tag => (
          <span key={tag} style={{
            border: '1px solid rgba(192, 132, 252, 0.6)',
            color: '#c084fc',
            borderRadius: '999px',
            padding: '3px 12px',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.03em',
            whiteSpace: 'nowrap',
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* CTA */}
      {detailProject.demoUrl && (
        <a
          href={detailProject.demoUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'block',
            background: '#6c63ff',
            color: '#fff',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '13px',
            fontWeight: 700,
            textDecoration: 'none',
            textAlign: 'center',
            flexShrink: 0,
            marginBottom: '14px',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#7c74ff'}
          onMouseLeave={e => e.currentTarget.style.background = '#6c63ff'}
        >
          ▶ Play Demo
        </a>
      )}

      <p style={{ margin: 0, color: '#1f2937', fontSize: '11px', flexShrink: 0 }}>
        Press Esc to close
      </p>
    </div>
  )
}
