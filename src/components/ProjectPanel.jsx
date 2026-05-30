import { useEffect, useState } from 'react'
import useGameStore from '../store/gameStore'
import portfolioShot from '../data/PortfolioWithFog.png'

// Carousel slides — the same shot ×5 for now (swap to per-project images later).
const SLIDES = [portfolioShot, portfolioShot, portfolioShot, portfolioShot, portfolioShot]

const ACCENT = '#c084fc'

// Rendered outside the Canvas (in main.jsx) so it's guaranteed DOM — no Drei Html needed.
export default function ProjectPanel() {
  const detailProject    = useGameStore(s => s.detailProject)
  const setDetailProject = useGameStore(s => s.setDetailProject)
  const [slide, setSlide] = useState(0)

  // Reset to the first slide whenever a different project is opened.
  useEffect(() => { setSlide(0) }, [detailProject])

  useEffect(() => {
    if (!detailProject) return
    function onKey(e) {
      if (e.key === 'Escape') setDetailProject(null)
      if (e.key === 'ArrowRight') setSlide(s => (s + 1) % SLIDES.length)
      if (e.key === 'ArrowLeft')  setSlide(s => (s - 1 + SLIDES.length) % SLIDES.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [detailProject, setDetailProject])

  if (!detailProject) return null

  const next = () => setSlide(s => (s + 1) % SLIDES.length)
  const prev = () => setSlide(s => (s - 1 + SLIDES.length) % SLIDES.length)

  const arrowStyle = side => ({
    position: 'absolute',
    top: '50%',
    [side]: '8px',
    transform: 'translateY(-50%)',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '1px solid rgba(192, 132, 252, 0.3)',
    background: 'rgba(5, 8, 20, 0.55)',
    color: '#fff',
    fontSize: '18px',
    lineHeight: '30px',
    cursor: 'pointer',
    backdropFilter: 'blur(4px)',
  })

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
      overflow: 'hidden',   // panel itself never scrolls; the description does
    }}>

      {/* Stylized scrollbar for the description (webkit; Firefox via inline props) */}
      <style>{`
        .pp-desc::-webkit-scrollbar { width: 6px; }
        .pp-desc::-webkit-scrollbar-track { background: transparent; }
        .pp-desc::-webkit-scrollbar-thumb { background: rgba(192,132,252,0.35); border-radius: 3px; }
        .pp-desc::-webkit-scrollbar-thumb:hover { background: rgba(192,132,252,0.6); }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px', flexShrink: 0 }}>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
          {detailProject.name}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '12px' }}>
          <span style={{ fontSize: '11px', color: '#4b5563' }}>Esc</span>
          <button
            onClick={() => setDetailProject(null)}
            style={{
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
      </div>

      {/* Media carousel — fixed at 40vh so it stays a tidy focal point on any screen */}
      <div style={{ flexShrink: 0, marginBottom: '16px' }}>
        <div style={{
          position: 'relative',
          height: '40vh',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid rgba(192, 132, 252, 0.18)',
          background: '#05080f',
        }}>
          {/* Sliding track — all slides side by side, shifted by translateX */}
          <div style={{
            display: 'flex',
            height: '100%',
            transform: `translateX(-${slide * 100}%)`,
            transition: 'transform 0.35s ease',
            willChange: 'transform',          // own compositing layer — don't re-raster siblings
            backfaceVisibility: 'hidden',
          }}>
            {SLIDES.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${detailProject.name} screenshot ${i + 1}`}
                style={{ flex: '0 0 100%', width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ))}
          </div>
          <button onClick={prev} style={arrowStyle('left')} aria-label="Previous">‹</button>
          <button onClick={next} style={arrowStyle('right')} aria-label="Next">›</button>
        </div>

        {/* Instagram-style dots — grey, accent on the current slide */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === slide ? '9px' : '8px',
                height: i === slide ? '9px' : '8px',
                borderRadius: '50%',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                background: i === slide ? ACCENT : '#374151',
                transition: 'background 0.15s ease, width 0.15s ease, height 0.15s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* Description — the only flexible element: takes the leftover space and
          scrolls internally (stylized) so the panel itself never overflows. */}
      <p className="pp-desc" style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        margin: '0 0 16px',
        paddingRight: '8px',
        color: '#9ca3af',
        fontSize: '13px',
        lineHeight: 1.6,
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(192,132,252,0.35) transparent',
        transform: 'translateZ(0)',   // pin text to its own layer so the slide can't jitter it
      }}>
        {detailProject.longDescription ?? detailProject.description}
      </p>

      {/* Tech chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px', flexShrink: 0 }}>
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

      {/* CTA — pinned at the bottom (the panel's bottom padding is the margin) */}
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
            padding: '12px 20px',
            fontSize: '13px',
            fontWeight: 700,
            textDecoration: 'none',
            textAlign: 'center',
            flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#7c74ff'}
          onMouseLeave={e => e.currentTarget.style.background = '#6c63ff'}
        >
          ▶ Play Demo
        </a>
      )}
    </div>
  )
}
