import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSavedGuideIds, saveGuide, unsaveGuide } from '../lib/supabase/saved'
import { getExperiencesByRegions } from '../lib/supabase/api'
import { setPendingSave } from '../lib/pendingSave'
import EntityCard from './EntityCard'
import useIsMobile from '../hooks/useIsMobile'

export default function ArticleGrid({ articles, loading, emptyMessage }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const [savedIds, setSavedIds] = useState(new Set())
  const [experienceDaysByRegion, setExperienceDaysByRegion] = useState({})

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

  const regionIds = [...new Set(articles.map(a => a.region_id).filter(Boolean))]
  const regionIdsKey = regionIds.slice().sort().join(',')

  useEffect(() => {
    let cancelled = false
    if (regionIds.length === 0) { setExperienceDaysByRegion({}); return }
    getExperiencesByRegions(regionIds)
      .then(data => {
        if (cancelled) return
        const sums = {}
        for (const experience of data) {
          sums[experience.region_id] = (sums[experience.region_id] || 0) + experience.days
        }
        setExperienceDaysByRegion(sums)
      })
      .catch(err => console.error('Failed to load experiences:', err))
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionIdsKey])

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
        const maxExtraDays = experienceDaysByRegion[article.region_id] || 0
        const heading = article.trip_days
          ? maxExtraDays > 0
            ? `${placeName} — ${article.trip_days}-${article.trip_days + maxExtraDays} days`
            : `${placeName} — ${article.trip_days} day${article.trip_days === 1 ? '' : 's'}`
          : placeName

        return (
          <EntityCard
            key={article.id}
            image={article.cover_image}
            title={heading}
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
