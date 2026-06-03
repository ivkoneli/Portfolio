import { useEffect } from 'react'
import useGameStore from '../../store/gameStore'
import { PORTFOLIO_ENTRY } from '../../data/layout'
import { REVEAL } from '../../anim/reveal'
import { GitHubIcon, MailIcon } from '../ui/Icons'

const PORTFOLIO_RGB = '192, 132, 252'   // the cube's violet — matches the secret island

const ACCENT = '#f5a623'
const RGB    = '245, 166, 35'

// Placeholder profile content — swap for the real details any time.
const PROFILE = {
  name: 'Andrija Ivkovic (Ivkoneli)',
  tagline: 'Software Engineer · Game & Graphics Developer',
  bio: "I build interactive 3D experiences, games, and full-stack apps. I like shaders, clever algorithms , and turning weird ideas into things you can actually click on , like this portfolio you're rolling a cube around in.",
  facts: [
    ['Role', 'Software / Game Developer'],
    ['Based in', 'Nis , Serbia'],
    ['Currently', 'Shipping pixels'],
  ],
  skills: ['React', 'Three.js', 'TypeScript', 'C# / Unity', 'Python', '.NET', 'GLSL/HLSL', 'Kotlin',"Pixi.js"],
  githubUrl: 'https://github.com/ivkoneli',
  email: 'ivkoneli.ai@gmail.com',
}

// Initials from the name (ignoring any parenthetical), e.g. "Andrija Ivkovic" → "AI".
const INITIALS = PROFILE.name.replace(/\(.*?\)/g, '').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()

export default function ProfilePanel() {
  const aboutOpen    = useGameStore(s => s.aboutOpen)
  const setAboutOpen = useGameStore(s => s.setAboutOpen)

  useEffect(() => {
    if (!aboutOpen) return
    const onKey = e => { if (e.key === 'Escape') setAboutOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [aboutOpen, setAboutOpen])

  // Close the profile and unseal the Portfolio (it rises + the bridge pops in),
  // then — once the reveal has played — roll the cube over; Cube opens its card
  // when it lands there (portfolioAutoOpen).
  const explorePortfolio = () => {
    const s = useGameStore.getState()
    s.setAboutOpen(false)
    s.setPortfolioRevealed(true)
    s.setPortfolioAutoOpen(true)
    setTimeout(() => useGameStore.getState().setMoveTarget({ ...PORTFOLIO_ENTRY }), REVEAL.autoRollAfter * 1000)
  }

  if (!aboutOpen) return null

  return (
    <div className="project-panel" style={{
      position: 'fixed',
      right: 0,
      top: 0,
      width: '30%',
      height: '100%',
      background: 'rgba(14, 10, 4, 0.94)',
      borderLeft: `1px solid rgba(${RGB}, 0.25)`,
      color: '#fff',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 24px',
      boxShadow: `-6px 0 48px rgba(${RGB}, 0.18)`,
      backdropFilter: 'blur(16px)',
      boxSizing: 'border-box',
      overflowY: 'auto',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px', flexShrink: 0 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.15 }}>
            {PROFILE.name}
          </h2>
          <div style={{ marginTop: '4px', fontSize: '13px', color: ACCENT, fontWeight: 600 }}>{PROFILE.tagline}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, marginLeft: '12px' }}>
          <span style={{ fontSize: '11px', color: '#6b5a3a' }}>Esc</span>
          <button
            onClick={() => setAboutOpen(false)}
            aria-label="Close panel"
            style={{
              width: '42px', height: '42px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `rgba(${RGB}, 0.22)`,
              border: `1.5px solid rgba(${RGB}, 0.85)`,
              color: '#fff', borderRadius: '10px',
              fontSize: '20px', fontWeight: 700, cursor: 'pointer', lineHeight: 1, flexShrink: 0,
              transition: 'background 0.15s ease, transform 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `rgba(${RGB}, 0.45)`; e.currentTarget.style.transform = 'scale(1.06)' }}
            onMouseLeave={e => { e.currentTarget.style.background = `rgba(${RGB}, 0.22)`; e.currentTarget.style.transform = 'scale(1)' }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Avatar ring — monogram (swap for an <img src> avatar any time) */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', flexShrink: 0 }}>
        <div style={{
          width: '120px', height: '120px', borderRadius: '50%',
          border: `2px solid rgba(${RGB}, 0.7)`,
          background: `radial-gradient(circle at 50% 35%, rgba(${RGB}, 0.35), rgba(${RGB}, 0.05))`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 40px rgba(${RGB}, 0.35), inset 0 0 30px rgba(${RGB}, 0.15)`,
          fontSize: '42px', fontWeight: 700, letterSpacing: '0.04em',
          color: '#ffe6b8', textShadow: `0 0 16px rgba(${RGB}, 0.6)`,
          userSelect: 'none',
        }}>
          {INITIALS}
        </div>
      </div>

      {/* Bio */}
      <p style={{ margin: '0 0 18px', color: '#cbb893', fontSize: '14px', lineHeight: 1.65, flexShrink: 0 }}>
        {PROFILE.bio}
      </p>

      {/* Quick facts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginBottom: '18px', flexShrink: 0 }}>
        {PROFILE.facts.map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '13px', borderBottom: `1px solid rgba(${RGB}, 0.12)`, paddingBottom: '6px' }}>
            <span style={{ color: '#8a7752' }}>{k}</span>
            <span style={{ color: '#fff', textAlign: 'right' }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px', flexShrink: 0 }}>
        {PROFILE.skills.map(s => (
          <span key={s} style={{
            border: `1px solid rgba(${RGB}, 0.55)`, color: ACCENT,
            borderRadius: '999px', padding: '3px 12px', fontSize: '11px', fontWeight: 500,
            letterSpacing: '0.03em', whiteSpace: 'nowrap', background: `rgba(${RGB}, 0.08)`,
          }}>
            {s}
          </span>
        ))}
      </div>

      {/* Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0, marginTop: 'auto' }}>
        {/* Primary CTA — opens the secret Portfolio island behind this one. */}
        <button
          onClick={explorePortfolio}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: `rgba(${PORTFOLIO_RGB}, 0.9)`, color: '#15102a', borderRadius: '8px',
            padding: '12px 20px', fontSize: '13px', fontWeight: 800, letterSpacing: '0.02em',
            border: 'none', cursor: 'pointer',
            boxShadow: `0 0 26px rgba(${PORTFOLIO_RGB}, 0.45)`,
            transition: 'background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `rgba(${PORTFOLIO_RGB}, 1)`; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 30px rgba(${PORTFOLIO_RGB}, 0.6)` }}
          onMouseLeave={e => { e.currentTarget.style.background = `rgba(${PORTFOLIO_RGB}, 0.9)`; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 0 26px rgba(${PORTFOLIO_RGB}, 0.45)` }}
        >
          Explore This Portfolio →
        </button>
        <a href={PROFILE.githubUrl} target="_blank" rel="noreferrer" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          background: '#24292e', color: '#fff', borderRadius: '8px', padding: '11px 20px',
          fontSize: '13px', fontWeight: 700, textDecoration: 'none',
        }}>
          <GitHubIcon size={16} /> GitHub
        </a>
        <a href={`mailto:${PROFILE.email}`} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          background: `rgba(${RGB}, 0.85)`, color: '#1a1205', borderRadius: '8px', padding: '11px 20px',
          fontSize: '13px', fontWeight: 700, textDecoration: 'none',
        }}>
          <MailIcon size={16} /> {PROFILE.email}
        </a>
      </div>
    </div>
  )
}
