import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSavedGuideIds, saveGuide, unsaveGuide } from '../lib/supabase/saved'
import HeartButton from './HeartButton'
import useIsMobile from '../hooks/useIsMobile'

function TripCard({ article, onClick, saved, onToggleSave }) {
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
      <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', marginBottom: '14px', aspectRatio: '4/3', minWidth: 0, width: '100%' }}>
        <img src={article.cover_image} alt={placeName} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
        {onToggleSave && (
          <HeartButton
            saved={saved}
            onClick={() => onToggleSave(article.id)}
            style={{ position: 'absolute', top: '10px', right: '10px' }}
          />
        )}
      </div>

      <h3 style={{ fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif', fontSize: '21px', fontWeight: 600, color: '#111827', margin: '0 0 6px', lineHeight: 1.3 }}>
        {heading}
      </h3>

      {article.card_regions && (
        <p style={{
          fontSize: '15px', color: '#6b7280', margin: '0 0 2px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>
          {article.card_regions}
        </p>
      )}

      {article.pillars?.length > 0 && (
        <p style={{
          fontSize: '15px', fontWeight: 600, color: '#0F2E1D', margin: '0 0 10px',
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
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Explore Itinerary →
        </button>
      </div>
    </div>
  )
}

export default function ArticleGrid({ articles, loading, emptyMessage }) {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { user, isLoggedIn } = useAuth()
  const [savedIds, setSavedIds] = useState(new Set())

  useEffect(() => {
    if (!user) {
      setSavedIds(new Set())
      return
    }
    let cancelled = false
    getSavedGuideIds(user.id)
      .then(ids => { if (!cancelled) setSavedIds(new Set(ids)) })
      .catch(err => console.error('Failed to load saved guides:', err))
    return () => { cancelled = true }
  }, [user])

  async function toggleSave(contentPageId) {
    if (!user) return
    const wasSaved = savedIds.has(contentPageId)
    setSavedIds(current => {
      const next = new Set(current)
      wasSaved ? next.delete(contentPageId) : next.add(contentPageId)
      return next
    })
    try {
      if (wasSaved) await unsaveGuide(user.id, contentPageId)
      else await saveGuide(user.id, contentPageId)
    } catch (err) {
      console.error('Failed to save guide:', err)
      setSavedIds(current => {
        const next = new Set(current)
        wasSaved ? next.add(contentPageId) : next.delete(contentPageId)
        return next
      })
    }
  }

  if (loading) return <p style={{ color: '#6b7280', fontSize: '15px' }}>Loading...</p>
  if (articles.length === 0) return <p style={{ fontSize: '15px', color: '#9ca3af' }}>{emptyMessage || 'No stories published yet.'}</p>

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px', alignItems: 'stretch' }}>
      {articles.map(article => (
        <TripCard
          key={article.id}
          article={article}
          onClick={() => navigate(`/articles/${article.slug}`)}
          saved={savedIds.has(article.id)}
          onToggleSave={isLoggedIn ? toggleSave : undefined}
        />
      ))}
    </div>
  )
}
