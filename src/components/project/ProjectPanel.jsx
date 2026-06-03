import { useEffect, useState } from 'react'
import useGameStore from '../../store/gameStore'
import portfolioShot from '../../assets/fallback.png'
import { GitHubIcon, YouTubeIcon, DownloadIcon } from '../ui/Icons'

// A full-width action button (Play Demo / View Source / Watch Gameplay).
function ActionButton({ href, bg, bgHover, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        background: bg,
        color: '#fff',
        borderRadius: '8px',
        padding: '11px 20px',
        fontSize: '13px',
        fontWeight: 700,
        textDecoration: 'none',
        flexShrink: 0,
        transition: 'background 0.15s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = bgHover }}
      onMouseLeave={e => { e.currentTarget.style.background = bg }}
    >
      {children}
    </a>
  )
}

const ACCENT = '#c084fc'

// Rendered outside the Canvas (in main.jsx) so it's guaranteed DOM — no Drei Html needed.
export default function ProjectPanel() {
  const detailProject    = useGameStore(s => s.detailProject)
  const setDetailProject = useGameStore(s => s.setDetailProject)
  const [slide, setSlide] = useState(0)

  // Per-project screenshots; fall back to the shared shot if a project has none.
  const slides = detailProject?.images?.length ? detailProject.images : [portfolioShot]

  // Reset to the first slide whenever a different project is opened.
  useEffect(() => { setSlide(0) }, [detailProject])

  useEffect(() => {
    if (!detailProject) return
    const count = detailProject.images?.length || 1
    function onKey(e) {
      if (e.key === 'Escape') setDetailProject(null)
      if (e.key === 'ArrowRight') setSlide(s => (s + 1) % count)
      if (e.key === 'ArrowLeft')  setSlide(s => (s - 1 + count) % count)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [detailProject, setDetailProject])

  if (!detailProject) return null

  const next = () => setSlide(s => (s + 1) % slides.length)
  const prev = () => setSlide(s => (s - 1 + slides.length) % slides.length)

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
    <div className="project-panel" style={{
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, marginLeft: '12px' }}>
          <span style={{ fontSize: '11px', color: '#4b5563' }}>Esc</span>
          <button
            onClick={() => setDetailProject(null)}
            aria-label="Close panel"
            style={{
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(192, 132, 252, 0.22)',
              border: '1.5px solid rgba(192, 132, 252, 0.85)',
              color: '#fff',
              borderRadius: '10px',
              fontSize: '20px',
              fontWeight: 700,
              cursor: 'pointer',
              lineHeight: 1,
              flexShrink: 0,
              transition: 'background 0.15s ease, transform 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(192, 132, 252, 0.45)'; e.currentTarget.style.transform = 'scale(1.06)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(192, 132, 252, 0.22)'; e.currentTarget.style.transform = 'scale(1)' }}
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
            {slides.map((src, i) => (
              // Each slide: the image shown FULLY (contain) over a blurred copy
              // that fills the letterbox bars, so any aspect ratio looks clean.
              <div key={i} style={{ flex: '0 0 100%', position: 'relative', height: '100%', overflow: 'hidden' }}>
                <img
                  src={src}
                  aria-hidden="true"
                  style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%',
                    objectFit: 'cover', transform: 'scale(1.15)',
                    filter: 'blur(20px) brightness(0.45)',
                  }}
                />
                <img
                  src={src}
                  alt={`${detailProject.name} screenshot ${i + 1}`}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            ))}
          </div>
          <button data-silent onClick={prev} style={arrowStyle('left')} aria-label="Previous">‹</button>
          <button data-silent onClick={next} style={arrowStyle('right')} aria-label="Next">›</button>
        </div>

        {/* Instagram-style dots — grey, accent on the current slide */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
          {slides.map((_, i) => (
            <button
              key={i}
              data-silent
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

      {/* Action buttons — pinned at the bottom (the panel's bottom padding is the margin) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
        {detailProject.demoUrl && (
          <ActionButton href={detailProject.demoUrl} bg="#6c63ff" bgHover="#7c74ff">
            ▶ Play Demo
          </ActionButton>
        )}
        {detailProject.repoUrl && (
          <ActionButton href={detailProject.repoUrl} bg="#24292e" bgHover="#30363d">
            <GitHubIcon size={16} /> View Source
          </ActionButton>
        )}
        {detailProject.releasesUrl && (
          <ActionButton href={detailProject.releasesUrl} bg="#1f7a4d" bgHover="#2a9d63">
            <DownloadIcon size={16} /> Download Release
          </ActionButton>
        )}
        {detailProject.youtubeUrl && (
          <ActionButton href={detailProject.youtubeUrl} bg="#cc0000" bgHover="#e60000">
            <YouTubeIcon size={16} /> Watch Gameplay
          </ActionButton>
        )}
      </div>

      {/* Optional attribution footer (e.g. the CC BY 4.0 hologram bust). */}
      {detailProject.credits && (
        <div style={{
          marginTop: '14px', paddingTop: '12px', flexShrink: 0,
          borderTop: '1px solid rgba(192, 132, 252, 0.12)',
          fontSize: '10px', lineHeight: 1.5, color: '#6b7280',
        }}>
          {detailProject.credits.map((c, i) => c.href
            ? <a key={i} href={c.href} target="_blank" rel="noreferrer" style={{ color: '#9ca3af' }}>{c.text}</a>
            : <span key={i}>{c.text}</span>
          )}
        </div>
      )}
    </div>
  )
}
