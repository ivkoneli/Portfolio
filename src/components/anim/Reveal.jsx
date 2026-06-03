import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ease } from '../../anim/reveal'

// Rises its children up out of the fog — the reusable "pillar rising from the
// ground" move. Plays once when `play` is true (default), starting `delay`
// seconds in. Drive it by mounting the component (e.g. on a reveal flag) or by
// toggling `play`. Wrap an island's platform + pillars in one of these.
export default function Reveal({
  play = true,
  delay = 0,
  duration = 1.2,
  distance = 10,
  easing = 'easeOutCubic',
  onDone,
  children,
}) {
  const ref  = useRef()
  const t0   = useRef(null)   // clock time when the rise began
  const done = useRef(false)

  useFrame((state) => {
    const g = ref.current
    if (!g) return
    if (!play) { g.position.y = -distance; t0.current = null; done.current = false; return }
    if (done.current) return
    if (t0.current === null) t0.current = state.clock.elapsedTime

    const t = (state.clock.elapsedTime - t0.current - delay) / duration
    const p = ease(easing, t)
    g.position.y = -distance * (1 - p)

    if (t >= 1) { done.current = true; g.position.y = 0; onDone?.() }
  })

  // Starts submerged so there's no pre-first-frame flash.
  return <group ref={ref} position={[0, -distance, 0]}>{children}</group>
}
