import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLatestContentPages } from '../lib/supabase/api'
import PillarsSection from '../components/PillarsSection'
import ArticleGrid from '../components/ArticleGrid'
import HeroSearchBar from '../components/HeroSearchBar'
import useIsMobile from '../hooks/useIsMobile'
import useSeo from '../hooks/useSeo'

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

  useSeo({
    title: 'Curated Sustainable Travel',
    description: 'Handpicked eco-conscious hotels, tours and itineraries — every stay and experience researched and selected for community benefit, conservation or regeneration.',
    path: '/'
  })

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
                Every stay, guide and experience is manually researched and selected for community benefit, conservation or regeneration.
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

          {/* Curated destinations */}
          <div id="destinations" style={{ marginTop: '56px', scrollMarginTop: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: isMobile ? '22px' : '30px', color: '#111827', margin: '0 0 8px' }}>
                  Curated Itineraries
                </h2>
                <p style={{ fontSize: '15px', color: '#4b5563', margin: 0 }}>
                  Pick an itinerary to choose hotels, tours and build a trip.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/plan-a-trip')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, whiteSpace: 'nowrap', marginTop: '4px',
                  backgroundColor: '#faf9f6', border: '1px solid #e5e4e0', borderRadius: '999px',
                  padding: '10px 18px', fontSize: '15px', fontWeight: 600, color: '#111827', cursor: 'pointer'
                }}
              >
                View all itineraries <ArrowRight />
              </button>
            </div>

            <div style={{ marginTop: '24px' }}>
              <ArticleGrid articles={articles} loading={loading} />
            </div>
          </div>

          {/* Pillars */}
          <div style={{ marginTop: '56px' }}>
            <PillarsSection />
          </div>

      </div>
    </div>
  )
}
