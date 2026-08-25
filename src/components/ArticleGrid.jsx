import { useNavigate } from 'react-router-dom'

export default function ArticleGrid({ articles, loading }) {
  const navigate = useNavigate()

  if (loading) return <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading...</p>
  if (articles.length === 0) return <p style={{ fontSize: '13px', color: '#9ca3af' }}>No stories published yet.</p>

  return (
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
  )
}
