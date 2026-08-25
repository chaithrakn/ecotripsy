import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLatestContentPages } from '../lib/supabase/api'
import PillarsSection from '../components/PillarsSection'

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

const DUMMY_STORIES = [
  { tag: 'GUIDE', title: 'Story coming soon' },
  { tag: 'PHILOSOPHY', title: 'Story coming soon' },
  { tag: 'UPDATE', title: 'Story coming soon' }
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

  useEffect(() => {
    let cancelled = false
    getLatestContentPages(6)
      .then(data => { if (!cancelled) setArticles(data) })
      .catch(err => console.error('Failed to load homepage data:', err))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  function scrollToDestinations() {
    document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', padding: '32px 40px 64px 70px', display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1100px 280px', gap: '32px', alignItems: 'start' }}>

        {/* MAIN COLUMN */}
        <div>

          {/* Hero */}
          <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', height: '560px' }}>
            <img
              src="/images/header2.avif"
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 45%, rgba(0,0,0,0.05) 100%)' }} />

            <div style={{ position: 'relative', padding: '56px 48px 0', maxWidth: '600px' }}>
              <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '38px', fontWeight: 500, fontOpticalSizing: 'none', color: '#111827', lineHeight: 1.15, margin: 0, whiteSpace: 'nowrap' }}>
                Curated sustainable travel,
              </h1>
              <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '38px', fontWeight: 500, fontOpticalSizing: 'none', color: '#111827', lineHeight: 1.15, margin: 0, fontStyle: 'italic' }}>
                built around experiences.
              </h1>
              <p style={{ fontSize: '15px', color: '#111827', lineHeight: 1.7, margin: '18px 0 24px', maxWidth: '420px' }}>
                Handpicked stays, meaningful experiences and local discoveries — all in one place to help you travel better.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={scrollToDestinations}
                  style={{ width: '190px', padding: '12px 0', backgroundColor: 'white', color: '#111827', border: '1px solid #e5e4e0', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                >
                  View all destinations
                </button>
                <button
                  onClick={() => navigate('/plan-a-trip')}
                  style={{ width: '190px', padding: '12px 0', backgroundColor: '#0F2E1D', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Plan a trip
                </button>
              </div>
            </div>
          </div>

          {/* Pillars */}
          <div style={{ marginTop: '56px' }}>
            <PillarsSection />
          </div>

          {/* Curated destinations */}
          <div id="destinations" style={{ marginTop: '56px', scrollMarginTop: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '24px', fontWeight: 500, color: '#111827', margin: 0 }}>
                Inspiration Guides
              </h2>
              <span
                onClick={() => navigate('/plan-a-trip')}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: '#111827', cursor: 'pointer' }}
              >
                View all guides <ArrowRight />
              </span>
            </div>

            {loading ? (
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading...</p>
            ) : articles.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#9ca3af' }}>No stories published yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '24px' }}>
                {articles.map(article => (
                  <div
                    key={article.id}
                    onClick={() => navigate(`/articles/${article.slug}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '12px', aspectRatio: '4/3' }}>
                      <img src={article.cover_image} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '17px', fontWeight: 600, color: '#111827', margin: '0 0 6px', lineHeight: 1.35 }}>
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6, margin: '0 0 8px' }}>
                        {article.excerpt}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3-step process */}
          <div style={{ marginTop: '64px', textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '22px', fontWeight: 500, color: '#111827', margin: '0 0 32px' }}>
              From discovery to your itinerary
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '8px' }}>
              {STEPS.map((step, i) => (
                <div key={step.title} style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{ width: '220px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f0ede4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        {step.icon}
                      </svg>
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
                      {i + 1}. {step.title}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
                      {step.description}
                    </p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ width: '48px', height: '1px', borderTop: '2px dashed #d1cfc4', marginTop: '28px' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* SIDEBAR: Travel stories (dummy placeholder for now) */}
        <div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '20px', fontWeight: 500, color: '#111827', margin: '0 0 4px' }}>
            Travel stories
          </h2>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 20px' }}>
            Inspiration and guides for the thoughtful traveler.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {DUMMY_STORIES.map((story, i) => (
              <div key={i}>
                <div style={{ borderRadius: '10px', backgroundColor: '#eeece5', marginBottom: '8px', aspectRatio: '16/10' }} />
                <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', color: '#9ca3af', margin: '0 0 4px' }}>
                  {story.tag}
                </p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: 0, lineHeight: 1.4 }}>
                  {story.title}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
