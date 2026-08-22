import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function MapView({ hotels }) {
  const center = [-8.5069, 115.2625]

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: '100%', width: '100%', minHeight: '500px' }}
      scrollWheelZoom={false}
    >
      <TileLayer
      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        //url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        //attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        
        //attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        //url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {hotels.map((hotel) => (
        <Marker key={hotel.id} position={[hotel.lat, hotel.lng]}>
          <Popup>
            <div>
              <p style={{ fontWeight: 600 }}>{hotel.name}</p>
              <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>{hotel.region}</p>
              <a href={hotel.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0F6E56', fontSize: '12px' }}>
                Visit website
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}