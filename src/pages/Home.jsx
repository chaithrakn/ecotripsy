import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLatestContentPages } from '../lib/supabase/api'

export default function Home() {
  const navigate = useNavigate()
  const [articles, setArticles] = useState([])
  const [loadingArticles, setLoadingArticles] = useState(true)

  useEffect(() => {
    let cancelled = false
    getLatestContentPages()
      .then(data => { if (!cancelled) setArticles(data) })
      .catch(err => { if (!cancelled) console.error('Failed to load articles:', err) })
      .finally(() => { if (!cancelled) setLoadingArticles(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ padding: '60px 40px', fontFamily: 'Inter, sans-serif' }}>
      {loadingArticles ? (
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading...</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
        }}>
          {articles.map((article) => (
            <div
              key={article.id}
              onClick={() => navigate(`/articles/${article.slug}`)}
              style={{
                position: 'relative',
                width: '80%',
                margin: '0 auto',
                borderRadius: '12px',
                overflow: 'hidden',
                aspectRatio: '4/3',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.02)'
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <img src={article.cover_image} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {article.author}
                </p>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'white', lineHeight: 1.3 }}>
                  {article.title}
                </h2>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}