import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PILLARS } from '../lib/pillars'
import useIsMobile from '../hooks/useIsMobile'

const PILLAR_ICONS = {
  Grow: (
    <>
      <path d="M12 22V12" />
      <path d="M12 12C12 8 9 6 5 6c0 4 3 6 7 6z" />
      <path d="M12 12c0-4 3-6 7-6 0 4-3 6-7 6z" />
    </>
  ),
  Explore: (
    <>
      <path d="m3 20 6-11 4 7 3-5 5 9H3z" />
      <circle cx="17" cy="6" r="2" />
    </>
  ),
  Connect: (
    <>
      <circle cx="9" cy="8" r="3" />
      <circle cx="16" cy="9" r="2.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M15 14.5c2.5.3 4.5 2.4 4.5 5.5" />
    </>
  ),
  Protect: (
    <path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3z" />
  ),
  Restore: (
    <path d="M12 3s5 5.5 5 10a5 5 0 0 1-10 0c0-4.5 5-10 5-10z" />
  )
}

function PillarCard({ pillar, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minWidth: 0,
        padding: '16px',
        borderRadius: '16px',
        backgroundColor: hovered ? pillar.bg : 'transparent',
        transition: 'background-color 0.2s ease'
      }}
    >
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: pillar.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={pillar.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {PILLAR_ICONS[pillar.key]}
        </svg>
      </div>
      <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: pillar.color, margin: '0 0 4px' }}>
        {pillar.eyebrow}
      </p>
      <p style={{ fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif', fontSize: '17px', fontWeight: 600, color: '#111827', margin: '0 0 6px' }}>
        {pillar.title}
      </p>
      <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6, margin: '0 0 10px' }}>
        {pillar.description}
      </p>
      <span style={{ marginTop: 'auto', paddingTop: '4px', fontSize: '15px', fontWeight: 600, color: pillar.color, opacity: hovered ? 1 : 0, transition: 'opacity 0.2s ease' }}>
        View trips →
      </span>
    </div>
  )
}

export default function PillarsSection() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  return (
    <div>
      <h2 style={{ fontSize: isMobile ? '22px' : '30px', color: '#111827', margin: '0 0 28px' }}>
        Travel by what moves you
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: isMobile ? '24px 16px' : '20px', alignItems: 'stretch' }}>
        {PILLARS.map(pillar => (
          <PillarCard
            key={pillar.key}
            pillar={pillar}
            onClick={() => navigate(`/plan-a-trip?pillar=${encodeURIComponent(pillar.key)}`)}
          />
        ))}
      </div>
    </div>
  )
}
