import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getSavedHotelsFull, unsaveHotel,
  getSavedTourCompaniesFull, unsaveTourCompany,
  getSavedGuidesFull, unsaveGuide
} from '../lib/supabase/saved'
import EntityCard from '../components/EntityCard'
import useIsMobile from '../hooks/useIsMobile'
import useSeo from '../hooks/useSeo'

const TABS = ['Hotels', 'Tour Companies', 'Guides']

export default function SavedPage() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { user, loading: authLoading } = useAuth()

  useSeo({ title: 'Your Saved Places', path: '/saved', noIndex: true })
  const [tab, setTab] = useState('Hotels')
  const [hotels, setHotels] = useState([])
  const [tourCompanies, setTourCompanies] = useState([])
  const [guides, setGuides] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login'); return }
    loadSavedItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading])

  function loadSavedItems() {
    if (!user) return
    setLoading(true)
    setError(null)
    Promise.all([
      getSavedHotelsFull(user.id),
      getSavedTourCompaniesFull(user.id),
      getSavedGuidesFull(user.id)
    ])
      .then(([hot, tours, guid]) => {
        setHotels(hot)
        setTourCompanies(tours)
        setGuides(guid)
      })
      .catch(err => { console.error('Failed to load saved items:', err); setError(err.message) })
      .finally(() => setLoading(false))
  }

  async function removeHotel(hotelId) {
    setHotels(current => current.filter(h => h.id !== hotelId))
    try { await unsaveHotel(user.id, hotelId) } catch (err) { console.error('Failed to remove hotel:', err) }
  }

  async function removeTourCompany(tourCompanyId) {
    setTourCompanies(current => current.filter(t => t.id !== tourCompanyId))
    try { await unsaveTourCompany(user.id, tourCompanyId) } catch (err) { console.error('Failed to remove tour company:', err) }
  }

  async function removeGuide(contentPageId) {
    setGuides(current => current.filter(g => g.id !== contentPageId))
    try { await unsaveGuide(user.id, contentPageId) } catch (err) { console.error('Failed to remove guide:', err) }
  }

  const counts = { Hotels: hotels.length, 'Tour Companies': tourCompanies.length, Guides: guides.length }

  function handleTabClick(t) {
    setTab(t)
    loadSavedItems()
  }

  const currentItems = tab === 'Hotels' ? hotels : tab === 'Tour Companies' ? tourCompanies : guides
  const emptyMessage = {
    Hotels: 'No saved hotels yet.',
    'Tour Companies': 'No saved tour companies yet.',
    Guides: 'No saved guides yet.'
  }[tab]

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '28px 16px 48px' : '48px 40px 80px' }}>
      <h1 style={{ fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif', fontSize: isMobile ? '24px' : '32px', fontWeight: 500, color: '#111827', margin: '0 0 24px' }}>
        Your Saved Places
      </h1>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px', borderBottom: '1px solid #e5e4e0', paddingBottom: '16px' }}>
        {TABS.map(t => (
          <span
            key={t}
            onClick={() => handleTabClick(t)}
            style={{
              padding: '8px 16px', borderRadius: '999px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              backgroundColor: tab === t ? '#0F2E1D' : '#f3f2ee',
              color: tab === t ? 'white' : '#374151'
            }}
          >
            {t} {counts[t] > 0 ? counts[t] : ''}
          </span>
        ))}
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: '15px', marginBottom: '16px' }}>{error}</p>}

      {loading ? (
        <p style={{ fontSize: '15px', color: '#6b7280' }}>Loading...</p>
      ) : currentItems.length === 0 ? (
        <p style={{ fontSize: '15px', color: '#9ca3af' }}>{emptyMessage}</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px', alignItems: 'stretch' }}>
          {tab === 'Hotels' && hotels.map(h => (
            <EntityCard
              key={h.id}
              image={h.image}
              title={h.name}
              subtitle={h.regions?.name}
              linkLabel="Book Now"
              onOpen={() => window.open(h.url, '_blank', 'noopener,noreferrer')}
              saved
              onToggleSave={() => removeHotel(h.id)}
            />
          ))}
          {tab === 'Tour Companies' && tourCompanies.map(t => (
            <EntityCard
              key={t.id}
              image={t.image}
              title={t.name}
              linkLabel="Visit site"
              onOpen={() => window.open(t.url, '_blank', 'noopener,noreferrer')}
              saved
              onToggleSave={() => removeTourCompany(t.id)}
            />
          ))}
          {tab === 'Guides' && guides.map(g => {
            const placeName = g.destinations?.name ?? g.regions?.name ?? g.title
            return (
              <EntityCard
                key={g.id}
                image={g.cover_image}
                title={placeName}
                subtitle={g.card_regions}
                tag={g.pillars?.length > 0 ? g.pillars.join(' · ') : null}
                linkLabel="Explore Itinerary"
                onOpen={() => navigate(`/articles/${g.slug}`)}
                saved
                onToggleSave={() => removeGuide(g.id)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
