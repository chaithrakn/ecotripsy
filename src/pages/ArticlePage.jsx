import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import MapView from '../components/MapView'
import PropertyCard from '../components/PropertyCard'
import TripForm from '../components/TripForm'
import Itinerary from '../components/Itinerary'
import CollapsibleSection from '../components/CollapsibleSection'
import { AccountNavLinks, LogoutButton, GuestNavLinks } from '../components/AccountRail'
import { getContentPageBySlug, getAttractionsByRegions, getTripTemplatesByDestination } from '../lib/supabase/api'
import { getSavedHotelIds, saveHotel, unsaveHotel, getSavedTourCompanyIds, saveTourCompany, unsaveTourCompany, getSavedGuideIds, saveGuide, unsaveGuide } from '../lib/supabase/saved'
import { useAuth } from '../context/AuthContext'
import HeartButton from '../components/HeartButton'
import useIsMobile from '../hooks/useIsMobile'
import { setPendingSave } from '../lib/pendingSave'
import useSeo, { SITE_URL } from '../hooks/useSeo'

function TourCompanyList({ tours, savedIds, onToggleSave }) {
  if (!tours?.length) return null
  return (
    <>
      {tours.map(tour => (
        <div key={tour.id} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontWeight: 600, color: '#111827', margin: 0, fontSize: '15px' }}>{tour.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px', flexShrink: 0 }}>
              {onToggleSave && <HeartButton saved={savedIds?.has(tour.id)} onClick={() => onToggleSave(tour.id)} />}
              <a
                href={tour.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '999px', border: '1px solid #d1d5db', color: '#374151', textDecoration: 'none', whiteSpace: 'nowrap' }}
              >
                Visit site
              </a>
            </div>
          </div>
          <p style={{ fontSize: '15px', color: '#4b5563', margin: '4px 0 0' }}>{tour.description}</p>
        </div>
      ))}
    </>
  )
}

function groupBodyIntoSections(body) {
  const sections = []
  let current = null
  for (const block of body) {
    if (block.type === 'text') {
      current = { heading: block, blocks: [] }
      sections.push(current)
    } else {
      if (!current) {
        current = { heading: null, blocks: [] }
        sections.push(current)
      }
      current.blocks.push(block)
    }
  }
  return sections
}

function renderBodyBlock(block, key, { highlightedId, setHighlightedId, savedHotelIds, onToggleSaveHotel, savedTourCompanyIds, onToggleSaveTourCompany }) {
  if (block.type === 'text') {
    return (
      <div key={key} style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.8, marginBottom: '24px', maxWidth: '680px' }}>
        <ReactMarkdown>{block.content}</ReactMarkdown>
      </div>
    )
  }
  if (block.type === 'hotel_list') {
    return (
      <div key={key} style={{ marginBottom: '24px' }}>
        {block.hotels.map(hotel => (
          <PropertyCard
            key={hotel.id}
            hotel={hotel}
            highlighted={highlightedId === hotel.id}
            onHighlight={setHighlightedId}
            saved={savedHotelIds?.has(hotel.id)}
            onToggleSave={onToggleSaveHotel}
          />
        ))}
      </div>
    )
  }
  if (block.type === 'tour_list') {
    return (
      <div key={key} style={{ marginBottom: '24px', maxWidth: '680px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
          {block.title || 'Suggested Tours'}
        </h2>
        <TourCompanyList tours={block.tours} savedIds={savedTourCompanyIds} onToggleSave={onToggleSaveTourCompany} />
      </div>
    )
  }
  return null
}

export default function ArticlePage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [view, setView] = useState('list')
  const [itinerary, setItinerary] = useState(null)
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [highlightedId, setHighlightedId] = useState(null)
  const [attractions, setAttractions] = useState([])
  const [tripTemplate, setTripTemplate] = useState(null)
  const planScrollRef = useRef(null)
  const isMobile = useIsMobile()
  const { user, isLoggedIn, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [savedHotelIds, setSavedHotelIds] = useState(new Set())
  const [savedTourCompanyIds, setSavedTourCompanyIds] = useState(new Set())
  const [savedGuideIds, setSavedGuideIds] = useState(new Set())

  useSeo({
    title: article?.title,
    description: article?.excerpt || article?.intro,
    path: `/articles/${slug}`,
    structuredData: article ? {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.excerpt || article.intro,
      image: article.cover_image,
      datePublished: article.created_at,
      author: { '@type': 'Organization', name: 'Greenlugg' },
      publisher: {
        '@type': 'Organization',
        name: 'Greenlugg',
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/greenlugg-mark.png` }
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/articles/${slug}` }
    } : null
  })

  useEffect(() => {
    if (itinerary) planScrollRef.current?.scrollTo({ top: 0 })
  }, [itinerary])

  useEffect(() => {
    if (!user) {
      setSavedHotelIds(new Set())
      setSavedTourCompanyIds(new Set())
      setSavedGuideIds(new Set())
      return
    }
    let cancelled = false
    Promise.all([getSavedHotelIds(user.id), getSavedTourCompanyIds(user.id), getSavedGuideIds(user.id)])
      .then(([hotelIds, tourIds, guideIds]) => {
        if (cancelled) return
        setSavedHotelIds(new Set(hotelIds))
        setSavedTourCompanyIds(new Set(tourIds))
        setSavedGuideIds(new Set(guideIds))
      })
      .catch(err => console.error('Failed to load saved items:', err))
    return () => { cancelled = true }
  }, [user])

  async function handleMobileSignOut() {
    setMobileMenuOpen(false)
    await signOut()
    navigate('/')
  }

  async function toggleSaveGuide() {
    if (!article) return
    if (!user) {
      setPendingSave({ type: 'guide', id: article.id, returnTo: location.pathname })
      navigate('/login')
      return
    }
    const isSaved = savedGuideIds.has(article.id)
    setSavedGuideIds(current => {
      const next = new Set(current)
      isSaved ? next.delete(article.id) : next.add(article.id)
      return next
    })
    try {
      if (isSaved) await unsaveGuide(user.id, article.id)
      else await saveGuide(user.id, article.id)
    } catch (err) {
      console.error('Failed to save guide:', err)
      setSavedGuideIds(current => {
        const next = new Set(current)
        isSaved ? next.add(article.id) : next.delete(article.id)
        return next
      })
    }
  }

  async function toggleSaveHotel(hotelId) {
    if (!user) {
      setPendingSave({ type: 'hotel', id: hotelId, returnTo: location.pathname })
      navigate('/login')
      return
    }
    const isSaved = savedHotelIds.has(hotelId)
    setSavedHotelIds(current => {
      const next = new Set(current)
      isSaved ? next.delete(hotelId) : next.add(hotelId)
      return next
    })
    try {
      if (isSaved) await unsaveHotel(user.id, hotelId)
      else await saveHotel(user.id, hotelId)
    } catch (err) {
      console.error('Failed to save hotel:', err)
      setSavedHotelIds(current => {
        const next = new Set(current)
        isSaved ? next.add(hotelId) : next.delete(hotelId)
        return next
      })
    }
  }

  async function toggleSaveTourCompany(tourCompanyId) {
    if (!user) {
      setPendingSave({ type: 'tourCompany', id: tourCompanyId, returnTo: location.pathname })
      navigate('/login')
      return
    }
    const isSaved = savedTourCompanyIds.has(tourCompanyId)
    setSavedTourCompanyIds(current => {
      const next = new Set(current)
      isSaved ? next.delete(tourCompanyId) : next.add(tourCompanyId)
      return next
    })
    try {
      if (isSaved) await unsaveTourCompany(user.id, tourCompanyId)
      else await saveTourCompany(user.id, tourCompanyId)
    } catch (err) {
      console.error('Failed to save tour company:', err)
      setSavedTourCompanyIds(current => {
        const next = new Set(current)
        isSaved ? next.add(tourCompanyId) : next.delete(tourCompanyId)
        return next
      })
    }
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getContentPageBySlug(slug)
      .then(articleData => {
        if (cancelled) return
        setArticle(articleData)
      })
      .catch(err => { if (!cancelled) console.error('Failed to load article:', err) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [slug])

  useEffect(() => {
    if (!article) return
    const regionIds = [...new Set(
      article.body
        .filter(block => block.type === 'hotel_list')
        .flatMap(block => block.hotels)
        .map(hotel => hotel.region_id)
        .filter(Boolean)
    )]
    if (regionIds.length === 0) { setAttractions([]); return }

    let cancelled = false
    getAttractionsByRegions(regionIds)
      .then(data => { if (!cancelled) setAttractions(data) })
      .catch(err => console.error('Failed to load attractions:', err))
    return () => { cancelled = true }
  }, [article])

  useEffect(() => {
    if (!article?.destination_id) { setTripTemplate(null); return }
    let cancelled = false
    getTripTemplatesByDestination(article.destination_id)
      .then(data => { if (!cancelled) setTripTemplate(data[0] || null) })
      .catch(err => console.error('Failed to load trip templates:', err))
    return () => { cancelled = true }
  }, [article])

  if (loading) return (
    <div style={{ padding: '40px', fontFamily: 'Inter, sans-serif' }}>Loading...</div>
  )

  if (!article) return (
    <div style={{ padding: '40px', fontFamily: 'Inter, sans-serif' }}>Article not found.</div>
  )

  const hotels = article.body
    .filter(block => block.type === 'hotel_list')
    .flatMap(block => block.hotels)

  const alternativePlaces = (parentId, alts) =>
    (alts || []).map((alt, i) => ({
      id: `${parentId}-alt-${i}`,
      name: alt.name,
      description: alt.description,
      entryFee: alt.entry_fee,
      lat: alt.lat,
      lng: alt.lng,
      kind: 'alternative'
    }))

  const mapPlaces = itinerary
    ? Object.values(
        Object.fromEntries(
          itinerary.days.flatMap(day => {
            const allActivities = [...day.activities, ...(day.optionalActivities || [])]
            return [
              ...allActivities.map(a => [a.id, { id: a.id, name: a.name, description: a.description, lat: a.lat, lng: a.lng, kind: 'attraction' }]),
              ...allActivities.flatMap(a => alternativePlaces(a.id, a.alternatives)).map(p => [p.id, p]),
              ...(day.hotel ? [[day.hotel.id, { id: day.hotel.id, name: day.hotel.name, description: day.hotel.description, url: day.hotel.url, image: day.hotel.image, lat: day.hotel.lat, lng: day.hotel.lng, kind: 'hotel' }]] : [])
            ]
          })
        )
      )
    : [
        ...hotels.map(hotel => ({ id: hotel.id, name: hotel.name, description: hotel.description, url: hotel.url, image: hotel.image, lat: hotel.lat, lng: hotel.lng, kind: 'hotel' })),
        ...attractions.map(a => ({ id: a.id, name: a.name, description: a.description, lat: a.lat, lng: a.lng, kind: 'attraction' })),
        ...attractions.flatMap(a => alternativePlaces(a.id, a.alternatives))
      ]

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      height: isMobile ? 'auto' : '100vh',
      minHeight: isMobile ? '100vh' : undefined,
      overflow: isMobile ? 'visible' : 'hidden',
      fontFamily: 'Inter, sans-serif',
      width: isMobile ? '100%' : '100vw',
      position: isMobile ? 'static' : 'fixed',
      top: 0,
      left: 0,
    }}>

      {/* SIDEBAR */}
      {isMobile ? (
        <div style={{ backgroundColor: 'white', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
          }}>
            <img
              src="/logo2.png"
              alt="Greenlugg"
              style={{ height: '30px', width: 'auto', cursor: 'pointer' }}
              onClick={() => navigate('/')}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => navigate('/')}
                style={{ background: 'none', border: '1px solid #e5e4e0', borderRadius: '999px', padding: '6px 14px', fontSize: '15px', color: '#374151', cursor: 'pointer' }}
              >
                ← All destinations
              </button>
              <button
                onClick={() => setMobileMenuOpen(o => !o)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '999px', border: '1px solid #e5e4e0', backgroundColor: 'white', cursor: 'pointer', flexShrink: 0, padding: 0 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round">
                  {mobileMenuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                </svg>
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div style={{ padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid #f3f4f6' }}>
              {isLoggedIn ? (
                <>
                  <span style={{ padding: '10px 4px 4px', fontSize: '13px', color: '#9ca3af' }}>{user.email}</span>
                  <span onClick={() => { setMobileMenuOpen(false); navigate('/saved') }} style={{ padding: '10px 4px', fontSize: '15px', color: '#374151', cursor: 'pointer' }}>Saved</span>
                  <span onClick={() => { setMobileMenuOpen(false); navigate('/trips') }} style={{ padding: '10px 4px', fontSize: '15px', color: '#374151', cursor: 'pointer' }}>Trips</span>
                  <span onClick={handleMobileSignOut} style={{ padding: '10px 4px', fontSize: '15px', color: '#ef4444', cursor: 'pointer' }}>Log out</span>
                </>
              ) : (
                <span onClick={() => { setMobileMenuOpen(false); navigate('/login') }} style={{ padding: '10px 4px', fontSize: '15px', color: '#374151', cursor: 'pointer' }}>Log in</span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div style={{
          width: '260px',
          flexShrink: 0,
          backgroundColor: 'white',
          borderRight: '1px solid #f3f4f6',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 0',
        }}>
          <div onClick={() => navigate('/')} style={{ padding: '0 20px 24px', cursor: 'pointer' }}>
            <span style={{ fontWeight: 700, fontSize: '18px', color: '#111827' }}>
              <img
                src="/logo2.png"
                alt="Greenlugg"
                style={{ height: '40px', width: 'auto', cursor: 'pointer' }}
                onClick={() => navigate('/')}
              />
            </span>
          </div>

          <div style={{ height: '1px', backgroundColor: '#f3f4f6', margin: '0 20px 16px' }} />

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 16px' }}>
            {isLoggedIn ? (
              <>
                <AccountNavLinks />
                <div style={{ marginTop: 'auto' }}>
                  <LogoutButton />
                </div>
              </>
            ) : (
              <GuestNavLinks />
            )}
          </div>
        </div>
      )}

      {/* ARTICLE */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: isMobile ? 'visible' : 'hidden', minWidth: 0 }}>

        {view === 'list' && (
          <div style={{ flex: 1, overflowY: isMobile ? 'visible' : 'auto' }}>

            {/* Hero */}
            <div style={{ position: 'relative', height: isMobile ? '260px' : '380px' }}>
              <img
                src={article.cover_image}
                alt={article.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }} />
              <HeartButton
                saved={savedGuideIds.has(article.id)}
                onClick={toggleSaveGuide}
                style={{ position: 'absolute', top: isMobile ? '16px' : '24px', right: isMobile ? '16px' : '24px' }}
              />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: isMobile ? '20px' : '32px' }}>
                <h1 style={{ fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif', fontSize: isMobile ? '22px' : '28px', fontWeight: 600, color: 'white', margin: '0 0 6px', textShadow: '0 2px 10px rgba(0,0,0,0.55)' }}>
                  {article.title}
                </h1>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', margin: '0 0 20px', textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
                  {hotels.length} curated properties
                </p>
                <button
                  onClick={() => { setView('plan'); setItinerary(null) }}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'white', color: '#111827', border: 'none', borderRadius: '999px', padding: '10px 22px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
                >
                  <img src="/greenlugg-mark.png" alt="" style={{ height: '26px', width: 'auto' }} />
                  Plan trip
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: isMobile ? '24px 16px' : '32px 48px' }}>
              {article.intro && (
                <div style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.8, marginBottom: '32px', maxWidth: '680px' }}>
                  <ReactMarkdown>{article.intro}</ReactMarkdown>
                </div>
              )}

              {article.tourCompanies?.length > 0 && (
                <div style={{ marginBottom: '32px', maxWidth: '680px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
                    Suggested Tours
                  </h2>
                  <TourCompanyList
                    tours={article.tourCompanies}
                    savedIds={savedTourCompanyIds}
                    onToggleSave={toggleSaveTourCompany}
                  />
                </div>
              )}

              {groupBodyIntoSections(article.body).map((section, i) =>
                section.heading ? (
                  <CollapsibleSection
                    key={i}
                    heading={
                      <div style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.8, maxWidth: '680px' }}>
                        <ReactMarkdown>{section.heading.content}</ReactMarkdown>
                      </div>
                    }
                  >
                    {section.blocks.map((block, j) => renderBodyBlock(block, j, {
                      highlightedId, setHighlightedId,
                      savedHotelIds, onToggleSaveHotel: toggleSaveHotel,
                      savedTourCompanyIds, onToggleSaveTourCompany: toggleSaveTourCompany
                    }))}
                  </CollapsibleSection>
                ) : (
                  <div key={i}>
                    {section.blocks.map((block, j) => renderBodyBlock(block, j, {
                      highlightedId, setHighlightedId,
                      savedHotelIds, onToggleSaveHotel: toggleSaveHotel,
                      savedTourCompanyIds, onToggleSaveTourCompany: toggleSaveTourCompany
                    }))}
                  </div>
                )
              )}
            </div>
            <div style={{ height: '60px' }} />
          </div>
        )}

        {view === 'plan' && (
          <div ref={planScrollRef} style={{ flex: 1, overflowY: isMobile ? 'visible' : 'auto', padding: isMobile ? '20px 16px' : '32px 48px' }}>
            <button
              onClick={() => { setView('list'); setItinerary(null) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', color: '#6b7280', marginBottom: '24px', padding: 0 }}
            >
              ← Back to list
            </button>
            {!itinerary ? (
              <TripForm
                hotels={hotels}
                tripTemplate={tripTemplate}
                onItinerary={(result) => setItinerary(result)}
              />
            ) : (
              <>
                <button
                  onClick={() => setItinerary(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', color: '#6b7280', marginBottom: '24px', padding: 0 }}
                >
                  ← Back to form
                </button>
                <Itinerary data={itinerary} highlightedId={highlightedId} onHighlight={setHighlightedId} contentPageId={article.id} scrollContainerRef={planScrollRef} />
              </>
            )}
            <div style={{ height: '60px' }} />
          </div>
        )}
      </div>

      {/* MAP */}
      <div style={{ width: isMobile ? '100%' : '40%', flexShrink: 0, height: isMobile ? '320px' : '100vh' }}>
        <MapView places={mapPlaces} highlightedId={highlightedId} />
      </div>

    </div>
  )
}
