import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Edges, Html } from '@react-three/drei'
import { tileToWorld } from '../../data/layout'
import useGameStore from '../../store/gameStore'
import { GitHubIcon, YouTubeIcon } from '../ui/Icons'

// ── tile geometry ──────────────────────────────────────────────────────────────
const TILE_H  = 0.80
const HALF_H  = TILE_H / 2
const GROUP_Y = 0.15 - HALF_H   // tile top at world y ≈ 0.15

// Light sits above the tile to cast down onto the surface.
const LIGHT_Y = HALF_H + 0.55  // local y = 0.95, above tile top face

// Card anchor Y in local space (top face of pedestal).
const CARD_Y  = HALF_H - 0.5

const CARD_SCALE = 0.65

export default function ProjectTile({ tileOrigin, active, project }) {
  const meshRef      = useRef()
  const setDetailProject = useGameStore(s => s.setDetailProject)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime
    meshRef.current.material.emissiveIntensity = active
      ? 0.25 + Math.sin(t * 3) * 0.10
      : 0.06
  })

  // Center of the 4×4 zone
  const [cx, , cz] = tileToWorld(tileOrigin.col + 1.5, tileOrigin.row + 1.5)

  const theme       = project?.theme
  const rgb         = theme?.rgb   ?? '168, 85, 247'
  const borderAlpha = active ? 0.85 : 0.45
  const glowAlpha   = active ? 0.90 : 0.55

  return (
    <group position={[cx, GROUP_Y, cz]}>

      {/* Pedestal — covers full 4×4 zone */}
      <RoundedBox
        ref={meshRef}
        args={[3.96, TILE_H, 3.96]}
        radius={0.06}
        smoothness={4}
        receiveShadow
      >
        <meshStandardMaterial
          color={theme?.tileDark   ?? '#2e1065'}
          emissive={theme?.tileEmissive ?? '#4c1d95'}
          emissiveIntensity={0.08}
          roughness={0.75}
          metalness={0.25}
        />
        <Edges color={theme?.edge ?? '#f0abfc'} threshold={15} />
      </RoundedBox>

      {project && (
        <>
          <pointLight
            position={[0, LIGHT_Y, 0]}
            color={theme.hex}
            intensity={active ? 4.0 : 2.0}
            distance={8}
            decay={2}
          />
          <mesh position={[0, LIGHT_Y, 0]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial
              emissive={theme.hex}
              emissiveIntensity={10}
              color="#000000"
              roughness={1}
              metalness={0}
            />
          </mesh>

          <Html
            transform
            wrapperClass="holo-card"
            position={[3.25, CARD_Y, 0]}
            rotation={[0, Math.PI / 4, 0]}
            scale={CARD_SCALE}
            style={{ pointerEvents: 'none' }}
            zIndexRange={[10, 0]}
          >
            <div style={{
              transform: `translate(-50%, -100%) scale(${active ? 1.05 : 1})`,
              transformOrigin: 'center bottom',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              width: '300px',
              height: '360px',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(5, 8, 15, 0.92)',
              border: `2px solid rgba(${rgb}, ${borderAlpha})`,
              borderRadius: '12px',
              padding: '22px 20px',
              color: '#fff',
              fontFamily: "'Segoe UI', system-ui, sans-serif",
              boxShadow: [
                `0 0 60px rgba(${rgb}, ${glowAlpha})`,
                `0 0 22px rgba(${rgb}, ${active ? 0.55 : 0.30})`,
                `inset 0 0 50px rgba(${rgb}, 0.06)`,
              ].join(', '),
              userSelect: 'none',
              boxSizing: 'border-box',
              pointerEvents: 'none',   // let the mouse reach the tiles behind the card
            }}>

              <div style={{
                fontSize: '24px',
                fontWeight: 700,
                marginBottom: '12px',
                letterSpacing: '-0.01em',
                color: '#fff',
                flexShrink: 0,
              }}>
                {project.name}
              </div>

              <p style={{
                margin: '0',
                color: theme.text,
                fontSize: '15px',
                lineHeight: 1.6,
                flexShrink: 0,
              }}>
                {project.description}
              </p>

              <div style={{ flex: 1 }} />

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                {project.tech.map(tag => (
                  <span key={tag} style={{
                    border: `1px solid rgba(${rgb}, ${borderAlpha})`,
                    color: theme.hex,
                    borderRadius: '999px',
                    padding: '4px 12px',
                    fontSize: '13px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    background: `rgba(${rgb}, 0.10)`,
                  }}>
                    {tag}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  className="holo-interactive"
                  onClick={() => setDetailProject(project)}
                  style={{
                    flex: 1,
                    background: active ? `rgba(${rgb}, 0.75)` : `rgba(${rgb}, 0.18)`,
                    border: `1px solid rgba(${rgb}, ${borderAlpha})`,
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '12px 0',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    letterSpacing: '0.05em',
                    transition: 'background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease',
                    pointerEvents: 'auto',   // …but the button itself stays clickable/hoverable
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `rgba(${rgb}, 0.95)`
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = `0 6px 18px rgba(${rgb}, 0.5)`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = active ? `rgba(${rgb}, 0.75)` : `rgba(${rgb}, 0.18)`
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  View More {active ? '(E) ' : ''}→
                </button>

                {[
                  project.repoUrl    && { href: project.repoUrl,    title: 'View source on GitHub', Icon: GitHubIcon },
                  project.youtubeUrl && { href: project.youtubeUrl, title: 'Watch gameplay',        Icon: YouTubeIcon },
                ].filter(Boolean).map(({ href, title, Icon }) => (
                  <a
                    key={href}
                    className="holo-interactive"
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    title={title}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '44px',
                      flexShrink: 0,
                      background: `rgba(${rgb}, 0.18)`,
                      border: `1px solid rgba(${rgb}, ${borderAlpha})`,
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      transition: 'background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease',
                      pointerEvents: 'auto',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = `rgba(${rgb}, 0.55)`
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = `0 6px 18px rgba(${rgb}, 0.5)`
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = `rgba(${rgb}, 0.18)`
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>
          </Html>
        </>
      )}
    </group>
  )
}
