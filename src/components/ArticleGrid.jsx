import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSavedGuideIds, saveGuide, unsaveGuide } from '../lib/supabase/saved'
import { setPendingSave } from '../lib/pendingSave'
import EntityCard from './EntityCard'
import useIsMobile from '../hooks/useIsMobile'

export default function ArticleGrid({ articles, loading, emptyMessage }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const { user } = useAuth()
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
    if (!user) {
      setPendingSave({ type: 'guide', id: contentPageId, returnTo: location.pathname })
      navigate('/login')
      return
    }
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
      {articles.map(article => {
        const placeName = article.destinations?.name ?? article.regions?.name ?? article.title

        return (
          <EntityCard
            key={article.id}
            image={article.cover_image}
            title={placeName}
            subtitle={article.card_regions}
            tag={article.pillars?.length > 0 ? article.pillars.join(' · ') : null}
            linkLabel="Explore Itinerary"
            onOpen={() => navigate(`/articles/${article.slug}`)}
            saved={savedIds.has(article.id)}
            onToggleSave={() => toggleSave(article.id)}
          />
        )
      })}
    </div>
  )
}
