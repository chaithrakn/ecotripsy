import { useState } from 'react'

export default function TripForm({ hotels, onItinerary }) {
  const [days, setDays] = useState(2)
  const [selectedHotel, setSelectedHotel] = useState(hotels[0]?.id || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

   /*async function handleSubmit() {
    setLoading(true)
    setError(null)

    const hotel = hotels.find(h => h.id === selectedHotel)

    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days, hotel })
      })
      const data = await response.json()
      onItinerary(data)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  } */

    async function handleSubmit() {
  setLoading(true)

  await new Promise(r => setTimeout(r, 1000))

  const hotel = hotels.find(h => h.id === selectedHotel)

  onItinerary({
    days: Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      title: i === 0 ? 'Arrive & Settle In' : i === 1 ? 'Rice Terraces & Culture' : 'Healing & Farewell',
      narrative: i === 0
        ? `Check into ${hotel.name} and spend the afternoon exploring the riverside gardens and sacred springs nearby.`
        : i === 1
        ? `Morning walk through Tegalalang rice terraces, afternoon traditional cooking class using organic produce.`
        : `Begin the day with sunrise yoga, followed by a traditional Balinese healing ceremony before heading out.`,
      hotel: hotel.name
    }))
  })

  setLoading(false)
}

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
        Plan Your Ubud Trip
      </h2>
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '28px' }}>
        Select your stay and we'll build a day-by-day itinerary.
      </p>

      {/* Number of days */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
          How many days?
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          {[1, 2, 3].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              style={{
                padding: '8px 20px',
                borderRadius: '999px',
                border: `1px solid ${days === d ? '#0F6E56' : '#d1d5db'}`,
                backgroundColor: days === d ? '#0F6E56' : 'white',
                color: days === d ? 'white' : '#374151',
                fontWeight: days === d ? 600 : 400,
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {d} {d === 1 ? 'day' : 'days'}
            </button>
          ))}
        </div>
      </div>

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
              <div>
                <p style={{ margin: 0, fontWeight: 500, fontSize: '14px', color: '#111827' }}>
                  {hotel.name}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                  {hotel.region}
                </p>
              </div>
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