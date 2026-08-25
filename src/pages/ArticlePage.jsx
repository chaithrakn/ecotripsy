import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import MapView from '../components/MapView'
import PropertyCard from '../components/PropertyCard'
import TripForm from '../components/TripForm'
import Itinerary from '../components/Itinerary'
import CollapsibleSection from '../components/CollapsibleSection'
import { getContentPageBySlug, getDestinations, getAttractionsByRegions, getTripTemplatesByDestination } from '../lib/supabase/api'

function TourCompanyList({ tours }) {
  if (!tours?.length) return null
  return (
    <>
      {tours.map(tour => (
        <div key={tour.id} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontWeight: 600, color: '#111827', margin: 0, fontSize: '15px' }}>{tour.name}</h3>
            <a
              href={tour.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '999px', border: '1px solid #d1d5db', color: '#374151', textDecoration: 'none', whiteSpace: 'nowrap', marginLeft: '16px' }}
            >
              Visit site
            </a>
          </div>
          <p style={{ fontSize: '13px', color: '#4b5563', margin: '4px 0 0' }}>{tour.description}</p>
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

function renderBodyBlock(block, key, { highlightedId, setHighlightedId }) {
  if (block.type === 'text') {
    return (
      <div key={key} style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.8, marginBottom: '24px', maxWidth: '680px' }}>
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
        <TourCompanyList tours={block.tours} />
      </div>
    )
  }
  return null
}

export default function ArticlePage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [view, setView] = useState('list')
  const [itinerary, setItinerary] = useState(null)
  const [article, setArticle] = useState(null)
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [highlightedId, setHighlightedId] = useState(null)
  const [attractions, setAttractions] = useState([])
  const [tripTemplate, setTripTemplate] = useState(null)
  const planScrollRef = useRef(null)

  useEffect(() => {
    if (itinerary) planScrollRef.current?.scrollTo({ top: 0 })
  }, [itinerary])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([getContentPageBySlug(slug), getDestinations()])
      .then(([articleData, destinationsData]) => {
        if (cancelled) return
        setArticle(articleData)
        setDestinations(destinationsData)
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

  const currentDestSlug = article.destinations?.slug ?? article.regions?.destinations?.slug
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
              [day.hotel.id, { id: day.hotel.id, name: day.hotel.name, description: day.hotel.description, url: day.hotel.url, image: day.hotel.image, lat: day.hotel.lat, lng: day.hotel.lng, kind: 'hotel' }]
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
      height: '100vh',
      overflow: 'hidden',
      fontFamily: 'Inter, sans-serif', width: '100vw', position: 'fixed',
      top: 0,
      left: 0,
    }}>

      {/* SIDEBAR */}
      <div style={{
        width: '200px',
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
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', margin: '2px 0 0', letterSpacing: '0.03em' }}>
            curated sustainable travel
          </p>
        </div>

        <div style={{ height: '1px', backgroundColor: '#f3f4f6', margin: '0 20px 16px' }} />

        <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', padding: '0 20px', marginBottom: '8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Destinations
        </p>

        {destinations.map(d => {
          const isActive = d.slug === currentDestSlug
          return (
            <div
              key={d.id}
              onClick={() => d.available && navigate('/')}
              style={{
                padding: '8px 20px',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#0F2E1D' : d.available ? '#374151' : '#9ca3af',
                cursor: d.available ? 'pointer' : 'default',
                backgroundColor: isActive ? '#f0faf6' : 'transparent',
                borderLeft: isActive ? '3px solid #0F2E1D' : '3px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {d.name}
              {!d.available && (
                <span style={{ fontSize: '10px', color: '#d1d5db' }}>soon</span>
              )}
            </div>
          )
        })}

        <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid #f3f4f6' }}>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px', cursor: 'pointer' }}>About</p>
          <p style={{ fontSize: '13px', color: '#6b7280', cursor: 'pointer' }}>Contact</p>
        </div>
      </div>

      {/* ARTICLE */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {view === 'list' && (
          <div style={{ flex: 1, overflowY: 'auto' }}>

            {/* Hero */}
            <div style={{ position: 'relative', height: '380px' }}>
              <img
                src={article.cover_image}
                alt={article.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px' }}>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '28px', fontWeight: 600, color: 'white', margin: '0 0 6px' }}>
                  {article.title}
                </h1>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: '0 0 20px' }}>
                  {hotels.length} curated properties
                </p>
                <button
                  onClick={() => { setView('plan'); setItinerary(null) }}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'white', color: '#111827', border: 'none', borderRadius: '999px', padding: '10px 22px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                >
                  <img src="/greenlugg-mark.png" alt="" style={{ height: '26px', width: 'auto' }} />
                  Plan trip
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '32px 48px' }}>
              {article.intro && (
                <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.8, marginBottom: '32px', maxWidth: '680px' }}>
                  <ReactMarkdown>{article.intro}</ReactMarkdown>
                </div>
              )}

              {article.tourCompanies?.length > 0 && (
                <div style={{ marginBottom: '32px', maxWidth: '680px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
                    Suggested Tours
                  </h2>
                  <TourCompanyList tours={article.tourCompanies} />
                </div>
              )}

              {groupBodyIntoSections(article.body).map((section, i) =>
                section.heading ? (
                  <CollapsibleSection
                    key={i}
                    heading={
                      <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.8, maxWidth: '680px' }}>
                        <ReactMarkdown>{section.heading.content}</ReactMarkdown>
                      </div>
                    }
                  >
                    {section.blocks.map((block, j) => renderBodyBlock(block, j, { highlightedId, setHighlightedId }))}
                  </CollapsibleSection>
                ) : (
                  <div key={i}>
                    {section.blocks.map((block, j) => renderBodyBlock(block, j, { highlightedId, setHighlightedId }))}
                  </div>
                )
              )}
            </div>
            <div style={{ height: '60px' }} />
          </div>
        )}

        {view === 'plan' && (
          <div ref={planScrollRef} style={{ flex: 1, overflowY: 'auto', padding: '32px 48px' }}>
            <button
              onClick={() => { setView('list'); setItinerary(null) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#6b7280', marginBottom: '24px', padding: 0 }}
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
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#6b7280', marginBottom: '24px', padding: 0 }}
                >
                  ← Back to form
                </button>
                <Itinerary data={itinerary} highlightedId={highlightedId} onHighlight={setHighlightedId} />
              </>
            )}
            <div style={{ height: '60px' }} />
          </div>
        )}
      </div>

      {/* MAP */}
      <div style={{ width: '40%', flexShrink: 0, height: '100vh' }}>
        <MapView places={mapPlaces} highlightedId={highlightedId} />
      </div>

    </div>
  )
}
