import { PILLAR_COLORS } from '../lib/pillars'
import useIsMobile from '../hooks/useIsMobile'
import HeartButton from './HeartButton'

export default function PropertyCard({ hotel, highlighted, onHighlight, saved, onToggleSave }) {
  const isMobile = useIsMobile()
  return (
    <div
      onMouseEnter={() => onHighlight?.(hotel.id)}
      onMouseLeave={() => onHighlight?.(null)}
      onClick={() => onHighlight?.(hotel.id)}
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '16px',
        padding: isMobile ? '16px' : '24px',
        margin: isMobile ? '0 -16px' : '0 -24px',
        borderRadius: '10px',
        borderBottom: '1px solid #f3f4f6',
        backgroundColor: highlighted ? '#f0faf6' : 'transparent',
        cursor: 'pointer'
      }}
    >
      <img
        src={hotel.image}
        alt={hotel.name}
        style={{ width: isMobile ? '100%' : '200px', height: isMobile ? '160px' : 'auto', objectFit: 'cover', borderRadius: '8px', flexShrink: 0, alignSelf: isMobile ? 'auto' : 'stretch' }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontWeight: 600, color: '#111827', margin: 0 }}>{hotel.name}</h3>
            {hotel.certification && (
              <p style={{ fontSize: '15px', color: '#0F6E56', fontWeight: 500, margin: '2px 0 0' }}>
                {hotel.certification}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px', flexShrink: 0 }}>
            {onToggleSave && <HeartButton saved={saved} onClick={() => onToggleSave(hotel.id)} />}
            <a
              href={hotel.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '999px', border: '1px solid #d1d5db', color: '#374151', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              Book Now
            </a>
          </div>
        </div>
        <p style={{ fontSize: '15px', color: '#4b5563', marginBottom: '8px' }}>{hotel.description}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {hotel.pillars.map((pillar) => (
              <span
                key={pillar}
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontWeight: 500,
                  backgroundColor: PILLAR_COLORS[pillar]?.bg,
                  color: PILLAR_COLORS[pillar]?.color,
                }}
              >
                {pillar}
              </span>
            ))}
          </div>
          {hotel.price_min != null && hotel.price_max != null && (
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0, whiteSpace: 'nowrap' }}>
              ${hotel.price_min}–${hotel.price_max}<span style={{ fontWeight: 400, color: '#6b7280' }}>/night</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}