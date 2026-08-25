import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useIsMobile from '../hooks/useIsMobile'

function TripCard({ article, onClick }) {
  const [hovered, setHovered] = useState(false)
  const placeName = article.destinations?.name ?? article.regions?.name ?? article.title
  const heading = article.trip_days
    ? `${placeName} — ${article.trip_days} day${article.trip_days === 1 ? '' : 's'}`
    : placeName

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
        padding: '12px',
        borderRadius: '18px',
        border: `1px solid ${hovered ? '#e5e4e0' : 'transparent'}`,
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.08)' : 'none',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '14px', aspectRatio: '4/3', minWidth: 0, width: '100%' }}>
        <img src={article.cover_image} alt={placeName} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <h3 style={{ fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif', fontSize: '21px', fontWeight: 600, color: '#111827', margin: '0 0 6px', lineHeight: 1.3 }}>
        {heading}
      </h3>

      {article.card_intro && (
        <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.6, margin: '0 0 10px' }}>
          {article.card_intro}
        </p>
      )}

      {article.card_regions && (
        <p style={{
          fontSize: '13px', color: '#6b7280', margin: '0 0 2px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>
          {article.card_regions}
        </p>
      )}

      {article.pillars?.length > 0 && (
        <p style={{
          fontSize: '12px', fontWeight: 600, color: '#0F2E1D', margin: '0 0 10px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>
          {article.pillars.join(' · ')}
        </p>
      )}

      <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: '10px' }}>
        <button
          type="button"
          onClick={onClick}
          style={{
            padding: '10px 24px',
            backgroundColor: '#0F2E1D',
            color: 'white',
            border: 'none',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          View trip →
        </button>
      </div>
    </div>
  )
}

export default function ArticleGrid({ articles, loading, emptyMessage }) {
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  if (loading) return <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading...</p>
  if (articles.length === 0) return <p style={{ fontSize: '13px', color: '#9ca3af' }}>{emptyMessage || 'No stories published yet.'}</p>

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px', alignItems: 'stretch' }}>
      {articles.map(article => (
        <TripCard key={article.id} article={article} onClick={() => navigate(`/articles/${article.slug}`)} />
      ))}
    </div>
  )
}
