import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getAllContentPages } from '../lib/supabase/api'
import PillarsSection from '../components/PillarsSection'
import ArticleGrid from '../components/ArticleGrid'
import { PILLAR_COLORS } from '../lib/pillars'
import useIsMobile from '../hooks/useIsMobile'
import useSeo from '../hooks/useSeo'

export default function PlanATripPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const isMobile = useIsMobile()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const pillarFilter = searchParams.get('pillar')

  useSeo({
    title: 'Curated Itineraries',
    description: 'Browse curated sustainable travel itineraries by destination — pick hotels, tours and build your trip.',
    path: '/plan-a-trip'
  })

  useEffect(() => {
    let cancelled = false
    getAllContentPages()
      .then(data => { if (!cancelled) setArticles(data) })
      .catch(err => console.error('Failed to load articles:', err))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const visibleArticles = pillarFilter
    ? articles.filter(a => a.pillars?.includes(pillarFilter))
    : articles

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '28px 16px 48px' : '48px 40px 80px' }}>
      <h1 style={{ fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif', fontSize: isMobile ? '24px' : '32px', fontWeight: 500, color: '#111827', margin: '0 0 8px' }}>
        Curated Itineraries
      </h1>
      <p style={{ fontSize: '15px', color: '#4b5563', margin: '0 0 24px' }}>
        Pick an itinerary to choose hotels, tours and build a trip.
      </p>

      {pillarFilter && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <span style={{ fontSize: '15px', color: '#6b7280' }}>Showing trips tagged</span>
          <span style={{
            fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '999px',
            backgroundColor: PILLAR_COLORS[pillarFilter]?.bg, color: PILLAR_COLORS[pillarFilter]?.color
          }}>
            {pillarFilter}
          </span>
          <span
            onClick={() => navigate('/plan-a-trip')}
            style={{ fontSize: '15px', color: '#6b7280', textDecoration: 'underline', cursor: 'pointer' }}
          >
            Clear
          </span>
        </div>
      )}

      <ArticleGrid
        articles={visibleArticles}
        loading={loading}
        emptyMessage={pillarFilter ? `No trips tagged "${pillarFilter}" yet.` : undefined}
      />

      <div style={{ marginTop: isMobile ? '40px' : '56px' }}>
        <PillarsSection />
      </div>
    </div>
  )
}
