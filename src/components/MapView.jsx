import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useEffect, useState } from 'react'
import L from 'leaflet'

function pinSvg(color, size) {
  const w = size
  const h = Math.round(size * 30 / 22)
  return `<svg width="${w}" height="${h}" viewBox="0 0 22 30" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 0C4.9 0 0 4.9 0 11c0 8.25 11 19 11 19s11-10.75 11-19C22 4.9 17.1 0 11 0z" fill="${color}"/>
    <circle cx="11" cy="11" r="4.5" fill="white"/>
  </svg>`
}

function outlinePinSvg(color, size) {
  const w = size
  const h = Math.round(size * 30 / 22)
  return `<svg width="${w}" height="${h}" viewBox="0 0 22 30" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 1C5.5 1 1 5.5 1 11c0 8 10 18 10 18s10-10 10-18C21 5.5 16.5 1 11 1z" fill="white" stroke="${color}" stroke-width="2"/>
    <circle cx="11" cy="11" r="3.5" fill="${color}"/>
  </svg>`
}

const hotelIcon = L.divIcon({
  className: '',
  html: '<div style="width:14px;height:14px;border-radius:50%;background:#0F6E56;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.35);"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  tooltipAnchor: [0, -7],
})

const hotelHighlightedIcon = L.divIcon({
  className: '',
  html: '<div style="width:20px;height:20px;border-radius:50%;background:#F59E0B;border:3px solid white;box-shadow:0 0 0 2px #F59E0B;"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  tooltipAnchor: [0, -10],
})

const attractionIcon = L.divIcon({
  className: '',
  html: pinSvg('#4F46E5', 16),
  iconSize: [16, 22],
  iconAnchor: [8, 22],
  popupAnchor: [0, -22],
  tooltipAnchor: [0, -22],
})

const attractionHighlightedIcon = L.divIcon({
  className: '',
  html: pinSvg('#F59E0B', 20),
  iconSize: [20, 27],
  iconAnchor: [10, 27],
  popupAnchor: [0, -27],
  tooltipAnchor: [0, -27],
})

const alternativeIcon = L.divIcon({
  className: '',
  html: outlinePinSvg('#4F46E5', 13),
  iconSize: [13, 18],
  iconAnchor: [7, 18],
  popupAnchor: [0, -18],
  tooltipAnchor: [0, -18],
})

const alternativeHighlightedIcon = L.divIcon({
  className: '',
  html: outlinePinSvg('#F59E0B', 17),
  iconSize: [17, 23],
  iconAnchor: [9, 23],
  popupAnchor: [0, -23],
  tooltipAnchor: [0, -23],
})

function iconFor(place, highlightedId) {
  const isHighlighted = place.id === highlightedId
  if (place.kind === 'hotel') return isHighlighted ? hotelHighlightedIcon : hotelIcon
  if (place.kind === 'alternative') return isHighlighted ? alternativeHighlightedIcon : alternativeIcon
  return isHighlighted ? attractionHighlightedIcon : attractionIcon
}

function FitBounds({ places }) {
  const map = useMap()
  const key = places.map(p => `${p.id}:${p.lat},${p.lng}`).join('|')

  useEffect(() => {
    if (places.length === 0) return
    if (places.length === 1) {
      map.setView([places[0].lat, places[0].lng], 13)
      return
    }
    const bounds = L.latLngBounds(places.map(p => [p.lat, p.lng]))
    map.fitBounds(bounds, { padding: [40, 40] })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map])

  return null
}

export default function MapView({ places, highlightedId }) {
  const plottable = places.filter(p => p.lat != null && p.lng != null)
  const fallbackCenter = [-8.5069, 115.2625]
  const [clickedId, setClickedId] = useState(null)

  return (
    <MapContainer
      center={fallbackCenter}
      zoom={12}
      style={{ height: '100%', width: '100%', minHeight: '500px' }}
      scrollWheelZoom={false}
    >
      <FitBounds places={plottable} />
      <TileLayer
        url={`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${import.meta.env.VITE_CARTO_API_KEY}`}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {plottable.map((place) => (
        <Marker
          key={place.id}
          position={[place.lat, place.lng]}
          icon={iconFor(place, highlightedId)}
          eventHandlers={{
            mouseover: (e) => e.target.openPopup(),
            mouseout: (e) => { if (clickedId !== place.id) e.target.closePopup() },
            click: (e) => { setClickedId(place.id); e.target.openPopup() },
            popupclose: () => setClickedId(id => (id === place.id ? null : id)),
          }}
        >
          <Popup>
            <div style={{ width: place.image ? '180px' : 'auto' }}>
              {place.image && (
                <img
                  src={place.image}
                  alt={place.name}
                  style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px', marginBottom: '6px' }}
                />
              )}
              {place.kind === 'alternative' && (
                <p style={{ color: '#4F46E5', fontSize: '11px', fontWeight: 600, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Alternative
                </p>
              )}
              <p style={{ fontWeight: 600 }}>{place.name}</p>
              {place.description && (
                <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>{place.description}</p>
              )}
              {place.entryFee && (
                <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Entry: {place.entryFee}</p>
              )}
              {place.url && clickedId === place.id && (
                <a
                  href={place.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-block', marginTop: '4px', fontSize: '12px', padding: '4px 12px', borderRadius: '999px', border: '1px solid #d1d5db', color: '#374151', textDecoration: 'none', whiteSpace: 'nowrap' }}
                >
                  {place.kind === 'hotel' ? 'Book Now' : 'Visit site'}
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
