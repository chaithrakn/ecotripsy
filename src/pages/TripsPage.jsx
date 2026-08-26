import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSavedItineraries, deleteSavedItinerary } from '../lib/supabase/saved'
import SavedCard from '../components/SavedCard'
import useIsMobile from '../hooks/useIsMobile'

export default function TripsPage() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { user, loading: authLoading } = useAuth()
  const [itineraries, setItineraries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login'); return }
    let cancelled = false
    setLoading(true)
    getSavedItineraries(user.id)
      .then(data => { if (!cancelled) setItineraries(data) })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [user, authLoading])

  async function removeItinerary(id) {
    setItineraries(current => current.filter(it => it.id !== id))
    try { await deleteSavedItinerary(user.id, id) } catch (err) { console.error('Failed to remove itinerary:', err) }
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '28px 16px 48px' : '48px 40px 80px' }}>
      <h1 style={{ fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif', fontSize: isMobile ? '24px' : '32px', fontWeight: 500, color: '#111827', margin: '0 0 24px' }}>
        Your Trips
      </h1>

      {error && <p style={{ color: '#ef4444', fontSize: '15px', marginBottom: '16px' }}>{error}</p>}

      {loading ? (
        <p style={{ fontSize: '15px', color: '#6b7280' }}>Loading...</p>
      ) : itineraries.length === 0 ? (
        <p style={{ fontSize: '15px', color: '#9ca3af' }}>No saved itineraries yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px', alignItems: 'stretch' }}>
          {itineraries.map(it => (
            <SavedCard
              key={it.id}
              title={it.title}
              subtitle={`Saved ${new Date(it.created_at).toLocaleDateString()}`}
              linkLabel="View itinerary"
              onOpen={() => navigate(`/saved-itineraries/${it.id}`)}
              onRemove={() => removeItinerary(it.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
