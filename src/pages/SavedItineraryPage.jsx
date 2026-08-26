import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSavedItineraryById, deleteSavedItinerary } from '../lib/supabase/saved'
import Itinerary from '../components/Itinerary'

export default function SavedItineraryPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [entry, setEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login'); return }
    let cancelled = false
    setLoading(true)
    getSavedItineraryById(user.id, id)
      .then(data => { if (!cancelled) setEntry(data) })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [user, authLoading, id])

  async function handleRemove() {
    if (!user) return
    try {
      await deleteSavedItinerary(user.id, id)
      navigate('/trips')
    } catch (err) {
      setError(err.message)
    }
  }

  if (authLoading || loading) return (
    <div style={{ padding: '48px 40px', fontFamily: 'Inter, sans-serif' }}>Loading...</div>
  )

  if (error || !entry) return (
    <div style={{ padding: '48px 40px', fontFamily: 'Inter, sans-serif' }}>Itinerary not found.</div>
  )

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 40px 80px' }}>
      <span
        onClick={() => navigate('/trips')}
        style={{ display: 'inline-block', fontSize: '15px', color: '#6b7280', cursor: 'pointer', marginBottom: '24px' }}
      >
        ← Back to trips
      </span>

      {entry.content_pages?.cover_image && (
        <img
          src={entry.content_pages.cover_image}
          alt={entry.title}
          style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: '16px', marginBottom: '24px' }}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '8px' }}>
        <h1 style={{ fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif', fontSize: '28px', fontWeight: 500, color: '#111827', margin: 0 }}>
          {entry.title}
        </h1>
        <button
          type="button"
          onClick={handleRemove}
          style={{ flexShrink: 0, padding: '8px 16px', borderRadius: '999px', border: '1px solid #d1d5db', backgroundColor: 'white', color: '#ef4444', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
        >
          Remove
        </button>
      </div>

      <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 8px' }}>
        Saved on {new Date(entry.created_at).toLocaleDateString()}
      </p>

      {entry.content_pages?.slug && (
        <span
          onClick={() => navigate(`/articles/${entry.content_pages.slug}`)}
          style={{ fontSize: '15px', color: '#0F2E1D', fontWeight: 600, cursor: 'pointer' }}
        >
          View original guide: {entry.content_pages.title} →
        </span>
      )}

      <Itinerary data={entry.body} hideSaveButton />
    </div>
  )
}
