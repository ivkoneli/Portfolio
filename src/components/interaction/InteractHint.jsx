import { useEffect } from 'react'
import useGameStore from '../../store/gameStore'

// Contextual "Press E" prompt at the bottom-centre of the screen. Appears only
// while the cube is standing on a project tile (activeProject set) and the
// detail panel isn't already open — and handles the E key to open it.
export default function InteractHint() {
  const activeProject    = useGameStore(s => s.activeProject)
  const detailProject    = useGameStore(s => s.detailProject)
  const setDetailProject = useGameStore(s => s.setDetailProject)

  useEffect(() => {
    function onKey(e) {
      if ((e.key === 'e' || e.key === 'E') && activeProject && !detailProject) {
        setDetailProject(activeProject)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeProject, detailProject, setDetailProject])

  const show = !!activeProject && !detailProject

  return (
    <div style={{
      position: 'fixed',
      bottom: '40px',
      left: '50%',
      zIndex: 9998,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 18px',
      background: 'rgba(5, 8, 20, 0.8)',
      border: '1px solid rgba(192, 132, 252, 0.3)',
      borderRadius: '999px',
      color: '#e5e7eb',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      fontSize: '14px',
      whiteSpace: 'nowrap',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 0 24px rgba(108, 99, 255, 0.25)',
      pointerEvents: 'none',
      // Fade + slide in/out based on whether there's something to interact with.
      opacity: show ? 1 : 0,
      transform: `translateX(-50%) translateY(${show ? 0 : 10}px)`,
      transition: 'opacity 0.2s ease, transform 0.2s ease',
    }}>
      <kbd style={{
        background: 'rgba(192, 132, 252, 0.2)',
        border: '1px solid rgba(192, 132, 252, 0.5)',
        borderRadius: '6px',
        padding: '2px 9px',
        fontSize: '13px',
        fontWeight: 700,
        color: '#e9d5ff',
        fontFamily: 'inherit',
      }}>E</kbd>
      <span>View <strong style={{ color: '#fff' }}>{activeProject?.name ?? ''}</strong></span>
    </div>
  )
}
