import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllContentPages } from '../lib/supabase/api'

export default function AllArticlesPage() {
  const navigate = useNavigate()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getAllContentPages()
      .then(data => { if (!cancelled) setArticles(data) })
      .catch(err => console.error('Failed to load articles:', err))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 40px 80px' }}>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '32px', fontWeight: 500, color: '#111827', margin: '0 0 32px' }}>
        Curated Destinations
      </h1>

      {loading ? (
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading...</p>
      ) : articles.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#9ca3af' }}>No stories published yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
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
                <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
                  {article.excerpt}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
