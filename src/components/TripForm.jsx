import { useState } from 'react'
import { buildItinerary, buildTripItinerary } from '../lib/itinerary'

const DAYS = 3

export default function TripForm({ hotels, regionId, tripTemplate, onItinerary }) {
  const [selectedHotel, setSelectedHotel] = useState(hotels[0]?.id || '')
  const [selectedLegHotels, setSelectedLegHotels] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    try {
      if (tripTemplate) {
        const orderedHotels = tripTemplate.legs.map(leg =>
          hotels.find(h => h.id === selectedLegHotels[leg.region_id])
        )
        if (orderedHotels.some(h => !h)) {
          throw new Error('Select a hotel for every leg')
        }
        const itinerary = await buildTripItinerary({ template: tripTemplate, hotels: orderedHotels })
        onItinerary(itinerary)
      } else {
        const hotel = hotels.find(h => h.id === selectedHotel)
        const itinerary = await buildItinerary({ regionId, days: DAYS, hotel })
        onItinerary(itinerary)
      }
    } catch (err) {
      console.error('Failed to build itinerary:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (tripTemplate) {
    const canSubmit = tripTemplate.legs.every(leg => selectedLegHotels[leg.region_id])

    return (
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
          {tripTemplate.name}
        </h2>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '28px' }}>
          {tripTemplate.body.length} days · pick a hotel for each leg of the trip.
        </p>

        {tripTemplate.legs.map(leg => (
          <div key={leg.region_id} style={{ marginBottom: '28px' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
              {leg.label}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {hotels.filter(hotel => hotel.region_id === leg.region_id).map(hotel => (
                <label
                  key={hotel.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: `1px solid ${selectedLegHotels[leg.region_id] === hotel.id ? '#0F6E56' : '#e5e7eb'}`,
                    backgroundColor: selectedLegHotels[leg.region_id] === hotel.id ? '#f0faf6' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name={`hotel-${leg.region_id}`}
                    value={hotel.id}
                    checked={selectedLegHotels[leg.region_id] === hotel.id}
                    onChange={() => setSelectedLegHotels(s => ({ ...s, [leg.region_id]: hotel.id }))}
                    style={{ accentColor: '#0F6E56' }}
                  />
                  <p style={{ margin: 0, fontWeight: 500, fontSize: '14px', color: '#111827' }}>
                    {hotel.name}
                  </p>
                </label>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={handleSubmit}
          disabled={loading || !canSubmit}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading || !canSubmit ? '#9ca3af' : '#0F6E56',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: loading || !canSubmit ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Generating...' : 'Generate Itinerary →'}
        </button>

        {error && (
          <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '12px' }}>{error}</p>
        )}
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
        Plan Your Trip
      </h2>
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '28px' }}>
        Select your stay and we'll build a day-by-day itinerary.
      </p>

      {/* Hotel selection */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
          Where will you stay?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {hotels.map(hotel => (
            <label
              key={hotel.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '10px',
                border: `1px solid ${selectedHotel === hotel.id ? '#0F6E56' : '#e5e7eb'}`,
                backgroundColor: selectedHotel === hotel.id ? '#f0faf6' : 'white',
                cursor: 'pointer'
              }}
            >
              <input
                type="radio"
                name="hotel"
                value={hotel.id}
                checked={selectedHotel === hotel.id}
                onChange={() => setSelectedHotel(hotel.id)}
                style={{ accentColor: '#0F6E56' }}
              />
              <p style={{ margin: 0, fontWeight: 500, fontSize: '14px', color: '#111827' }}>
                {hotel.name}
              </p>
            </label>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: loading ? '#9ca3af' : '#0F6E56',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Generating...' : 'Generate Itinerary →'}
      </button>

      {error && (
        <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '12px' }}>{error}</p>
      )}
    </div>
  )
}
