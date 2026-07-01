import { useEffect, useRef, useState } from 'react'
import useGameStore from '../../store/gameStore'

// A cloud-coloured veil that ramps up as the cube falls into the fog, holds
// opaque across the level swap, then fades as the cube drops onto the new floor.
// It hides the instant the board data is exchanged (masking any 1-frame pop),
// and reads as diving through a thick bank of cloud.
export default function TransitionVeil() {
  const transitioning = useGameStore(s => s.transitioning)
  const [opacity, setOpacity] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    clearTimeout(timer.current)
    if (transitioning) {
      // Ramp up to opaque by the time the fall/climb finishes (~600ms), hold a
      // beat across the swap, then fade back out during the drop-in.
      requestAnimationFrame(() => setOpacity(0.94))
      timer.current = setTimeout(() => setOpacity(0), 640)
    } else {
      setOpacity(0)
    }
    return () => clearTimeout(timer.current)
  }, [transitioning])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9990,
        pointerEvents: 'none',
        opacity,
        transition: 'opacity 0.5s ease',
        background:
          'radial-gradient(circle at 50% 55%, rgba(150, 160, 214, 0.95) 0%, rgba(60, 62, 120, 0.96) 42%, rgba(12, 15, 45, 0.98) 78%)',
        backdropFilter: opacity > 0.02 ? 'blur(6px)' : 'none',
      }}
    />
  )
}
