import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLatestContentPages } from '../lib/supabase/api'
import PillarsSection from '../components/PillarsSection'
import ArticleGrid from '../components/ArticleGrid'
import HeroSearchBar from '../components/HeroSearchBar'
import useIsMobile from '../hooks/useIsMobile'

const STEPS = [
  {
    title: 'Discover',
    description: 'Browse curated stays and experiences handpicked for quality, not quantity.',
    icon: (
      <>
        <circle cx="7" cy="16" r="3" />
        <circle cx="17" cy="16" r="3" />
        <path d="M10 16h4" />
        <path d="M9 16 8 6h2l1 6" />
        <path d="M15 16l1-10h-2l-1 6" />
      </>
    )
  },
  {
    title: 'Plan',
    description: "Select what moves you and we'll build a day-by-day itinerary that flows.",
    icon: (
      <>
        <path d="M9 20 3 18V6l6 2 6-2 6 2v12l-6-2-6 2z" />
        <path d="M9 8v12" />
        <path d="M15 6v12" />
      </>
    )
  },
  {
    title: 'Travel',
    description: 'Go with clarity — every stay, experience, and hidden gem already mapped out.',
    icon: (
      <>
        <rect x="4" y="8" width="16" height="12" rx="2" />
        <path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        <path d="M4 13h16" />
      </>
    )
  }
]

function ArrowRight({ color = '#111827' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const isMobile = useIsMobile()

  useEffect(() => {
    let cancelled = false
    getLatestContentPages(6)
      .then(data => { if (!cancelled) setArticles(data) })
      .catch(err => console.error('Failed to load homepage data:', err))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', padding: isMobile ? '20px 16px 48px' : '32px 40px 64px' }}>
      <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto' }}>

          {/* Hero */}
          <div style={{ position: 'relative' }}>
          <div style={{ position: 'relative', borderRadius: isMobile ? '18px' : '24px', overflow: 'hidden', height: isMobile ? 'auto' : '560px' }}>
            <img
              src="/images/header2.avif"
              alt=""
              style={{ position: isMobile ? 'static' : 'absolute', inset: 0, width: '100%', height: isMobile ? '260px' : '100%', objectFit: 'cover' }}
            />
            {!isMobile && (
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 45%, rgba(0,0,0,0.05) 100%)' }} />
            )}

            <div style={{
              position: isMobile ? 'static' : 'relative',
              padding: isMobile ? '20px 4px 0' : '56px 48px 0',
              maxWidth: isMobile ? 'none' : '600px',
              backgroundColor: isMobile ? '#faf9f6' : 'transparent'
            }}>
              <h1 style={{ fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif', fontSize: isMobile ? '26px' : '38px', fontWeight: 500, color: '#111827', lineHeight: 1.15, margin: 0, whiteSpace: isMobile ? 'normal' : 'nowrap' }}>
                Curated sustainable travel,
              </h1>
              <h1 style={{ fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif', fontSize: isMobile ? '24px' : '36px', fontWeight: 500, color: '#111827', lineHeight: 1.15, margin: 0, fontStyle: 'italic' }}>
                built around experiences.
              </h1>
              <p style={{ fontSize: '15px', color: '#111827', lineHeight: 1.7, margin: '18px 0 24px', maxWidth: isMobile ? 'none' : '420px' }}>
                Handpicked stays, meaningful experiences and local discoveries — all in one place to help you travel better.
              </p>
            </div>
          </div>

          <div style={isMobile
            ? { display: 'flex', justifyContent: 'center', marginTop: '20px' }
            : { position: 'absolute', bottom: '47px', left: '50%', transform: 'translateX(-50%)', display: 'flex', justifyContent: 'center', width: '100%' }
          }>
            <HeroSearchBar isMobile={isMobile} />
          </div>
          </div>

          {/* Pillars */}
          <div style={{ marginTop: '56px' }}>
            <PillarsSection />
          </div>

          {/* Curated destinations */}
          <div id="destinations" style={{ marginTop: '56px', scrollMarginTop: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: isMobile ? '22px' : '30px', color: '#111827', margin: '0 0 8px' }}>
                  Inspiration Guides
                </h2>
                <p style={{ fontSize: '15px', color: '#4b5563', margin: 0 }}>
                  Pick a guide to choose hotels, tours and build a trip.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/plan-a-trip')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, whiteSpace: 'nowrap', marginTop: '4px',
                  backgroundColor: '#faf9f6', border: '1px solid #e5e4e0', borderRadius: '999px',
                  padding: '10px 18px', fontSize: '13px', fontWeight: 600, color: '#111827', cursor: 'pointer'
                }}
              >
                View all guides <ArrowRight />
              </button>
            </div>

            <div style={{ marginTop: '24px' }}>
              <ArticleGrid articles={articles} loading={loading} />
            </div>
          </div>

          {/* 3-step process */}
          <div style={{ marginTop: '64px', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '22px' : '30px', color: '#111827', margin: '0 0 32px' }}>
              From discovery to your itinerary
            </h2>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'center', alignItems: isMobile ? 'stretch' : 'flex-start', gap: isMobile ? '28px' : '8px' }}>
              {STEPS.map((step, i) => (
                <div key={step.title} style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{ width: isMobile ? '100%' : '220px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f0ede4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        {step.icon}
                      </svg>
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
                      {i + 1}. {step.title}
                    </p>
                    <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
                      {step.description}
                    </p>
                  </div>
                  {!isMobile && i < STEPS.length - 1 && (
                    <div style={{ width: '48px', height: '1px', borderTop: '2px dashed #d1cfc4', marginTop: '28px' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

      </div>
    </div>
  )
}
