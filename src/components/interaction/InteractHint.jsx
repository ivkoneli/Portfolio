import { useEffect } from 'react'
import useGameStore from '../../store/gameStore'

// Contextual "Press E" prompt at the bottom-centre. Shows while the cube is on a
// project tile OR next to the About hologram, and handles the E key to open the
// matching panel.
export default function InteractHint() {
  const activeProject    = useGameStore(s => s.activeProject)
  const detailProject    = useGameStore(s => s.detailProject)
  const setDetailProject = useGameStore(s => s.setDetailProject)
  const aboutActive      = useGameStore(s => s.aboutActive)
  const aboutOpen        = useGameStore(s => s.aboutOpen)
  const setAboutOpen     = useGameStore(s => s.setAboutOpen)

  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'e' && e.key !== 'E') return
      if (detailProject || aboutOpen) return
      if (activeProject) setDetailProject(activeProject)
      else if (aboutActive) setAboutOpen(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeProject, detailProject, aboutActive, aboutOpen, setDetailProject, setAboutOpen])

  const showProject = !!activeProject && !detailProject && !aboutOpen
  const showAbout   = !activeProject && aboutActive && !aboutOpen && !detailProject
  const show  = showProject || showAbout
  const accent = showAbout ? '245, 166, 35' : '192, 132, 252'

  // Tapping/clicking the prompt does the same as pressing E.
  const activate = () => {
    if (showProject) setDetailProject(activeProject)
    else if (showAbout) setAboutOpen(true)
  }

  return (
    <div
      onClick={show ? activate : undefined}
      style={{
        position: 'fixed',
        bottom: '40px',
        left: '50%',
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 18px',
        background: 'rgba(5, 8, 20, 0.8)',
        border: `1px solid rgba(${accent}, 0.3)`,
        borderRadius: '999px',
        color: '#e5e7eb',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        fontSize: '14px',
        whiteSpace: 'nowrap',
        backdropFilter: 'blur(8px)',
        boxShadow: `0 0 24px rgba(${accent}, 0.25)`,
        pointerEvents: show ? 'auto' : 'none',   // clickable only while visible
        cursor: 'pointer',
        opacity: show ? 1 : 0,
        transform: `translateX(-50%) translateY(${show ? 0 : 10}px)`,
        transition: 'opacity 0.2s ease, transform 0.2s ease',
      }}>

      <kbd style={{
        background: `rgba(${accent}, 0.2)`,
        border: `1px solid rgba(${accent}, 0.5)`,
        borderRadius: '6px',
        padding: '2px 9px',
        fontSize: '13px',
        fontWeight: 700,
        color: '#fff',
        fontFamily: 'inherit',
      }}>E</kbd>
      <span>{showProject ? <>View <strong style={{ color: '#fff' }}>{activeProject?.name ?? ''}</strong></> : <strong style={{ color: '#fff' }}>About Me</strong>}</span>
    </div>
  )
}
