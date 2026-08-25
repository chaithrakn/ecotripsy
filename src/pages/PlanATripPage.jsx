import { useState, useEffect } from 'react'
import { getAllContentPages } from '../lib/supabase/api'
import PillarsSection from '../components/PillarsSection'
import ArticleGrid from '../components/ArticleGrid'
import useIsMobile from '../hooks/useIsMobile'

export default function PlanATripPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const isMobile = useIsMobile()

  useEffect(() => {
    let cancelled = false
    getAllContentPages()
      .then(data => { if (!cancelled) setArticles(data) })
      .catch(err => console.error('Failed to load articles:', err))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '28px 16px 48px' : '48px 40px 80px' }}>
      <div style={{ marginBottom: isMobile ? '40px' : '56px' }}>
        <PillarsSection />
      </div>

      <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: isMobile ? '24px' : '32px', fontWeight: 500, color: '#111827', margin: '0 0 12px' }}>
        Inspiration Guides
      </h1>
      <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.7, maxWidth: '680px', margin: '0 0 32px' }}>
        Every guide on Greenlugg is built around a place we have researched in depth — curated stays, local experiences, and a day-by-day plan that connects them. Pick a guide to choose your hotels, tours and build your trip.
      </p>

      <ArticleGrid articles={articles} loading={loading} />
    </div>
  )
}
