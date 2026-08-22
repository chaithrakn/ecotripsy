import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MapView from '../components/MapView'
import PropertyCard from '../components/PropertyCard'
import TripForm from '../components/TripForm'
import Itinerary from '../components/Itinerary'
import { destinations } from '../data/destinations'

const navItems = [
  { label: 'Bali', route: '/bali', id: 'bali-ubud' },
  { label: 'Dolomites', route: '/dolomites', id: 'dolomites' },
  { label: 'Morocco', route: '/morocco', id: 'morocco' },
  { label: 'Peru', route: '/peru', id: 'peru' },
  { label: 'Porto', route: '/porto', id: 'porto' },
  { label: 'Costa Rica', route: '/costa-rica', id: 'costa-rica' },
]

export default function InspirationPage({ destinationId, hotels }) {
  const navigate = useNavigate()
  const [view, setView] = useState('list')
  const [itinerary, setItinerary] = useState(null)

  const dest = destinations.find(d => d.id === destinationId)

  if (!dest) return (
    <div style={{ padding: '40px', fontFamily: 'Inter, sans-serif' }}>
      Destination not found.
    </div>
  )

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
          <span style={{ fontWeight: 700, fontSize: '18px', color: '#111827' }}>Sustivo</span>
          <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0', letterSpacing: '0.03em' }}>
            curated sustainable travel
          </p>
        </div>

        <div style={{ height: '1px', backgroundColor: '#f3f4f6', margin: '0 20px 16px' }} />

        <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', padding: '0 20px', marginBottom: '8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Destinations
        </p>

        {navItems.map(item => {
          const isActive = item.id === destinationId
          const destConfig = destinations.find(d => d.id === item.id)
          const isAvailable = destConfig?.available ?? false

          return (
            <div
              key={item.id}
              onClick={() => isAvailable && navigate(item.route)}
              style={{
                padding: '8px 20px',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#0F6E56' : isAvailable ? '#374151' : '#9ca3af',
                cursor: isAvailable ? 'pointer' : 'default',
                backgroundColor: isActive ? '#f0faf6' : 'transparent',
                borderLeft: isActive ? '3px solid #0F6E56' : '3px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {item.label}
              {!isAvailable && (
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
                src={dest.image}
                alt={dest.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', margin: '0 0 6px' }}>
                  {dest.title}
                </h1>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: '0 0 20px' }}>
                  {hotels.length} curated properties · {dest.location}
                </p>
                <button
                  onClick={() => { setView('plan'); setItinerary(null) }}
                  style={{ backgroundColor: 'white', color: '#111827', border: 'none', borderRadius: '999px', padding: '10px 22px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                >
                  ✦ Plan a trip
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '32px 48px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '10px' }}>
                Overview
              </h2>
              <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.8, marginBottom: '32px', maxWidth: '680px' }}>
                {dest.overview}
              </p>

              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                Where to Stay
              </h2>
              {hotels.map(hotel => (
                <PropertyCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
            <div style={{ height: '60px' }} />
          </div>
        )}

        {view === 'plan' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px 48px' }}>
            <button
              onClick={() => { setView('list'); setItinerary(null) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#6b7280', marginBottom: '24px', padding: 0 }}
            >
              ← Back to list
            </button>
            {!itinerary ? (
              <TripForm
                hotels={hotels}
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
                <Itinerary data={itinerary} />
              </>
            )}
            <div style={{ height: '60px' }} />
          </div>
        )}
      </div>

      {/* MAP */}
      <div style={{ width: '40%', flexShrink: 0, height: '100vh' }}>
        <MapView hotels={hotels} />
      </div>

    </div>
  )
}