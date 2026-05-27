import { useEffect } from 'react'

const ARROW_TO_DIR = {
  ArrowRight: { dc:  1, dr:  0 },
  ArrowLeft:  { dc: -1, dr:  0 },
  ArrowDown:  { dc:  0, dr:  1 },
  ArrowUp:    { dc:  0, dr: -1 },
}

// Fires onMove(dc, dr) on arrow key press.
// isAnimating check lives in the caller (Cube) so the hook stays generic.
export default function useKeyboard(onMove) {
  useEffect(() => {
    function handleKey(e) {
      const dir = ARROW_TO_DIR[e.key]
      if (!dir) return
      e.preventDefault()   // stop the page from scrolling
      onMove(dir.dc, dir.dr)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onMove])
}
