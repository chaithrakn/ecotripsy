const PILLAR_COLORS = {
  Restore: { bg: '#E1F5EE', color: '#0F6E56' },
  Grow:    { bg: '#EAF3DE', color: '#3B6D11' },
  Protect: { bg: '#E6F1FB', color: '#185FA5' },
  Connect: { bg: '#FAEEDA', color: '#854F0B' },
  Explore: { bg: '#EEEDFE', color: '#534AB7' },
}

export default function PropertyCard({ hotel }) {
  return (
    <div style={{ display: 'flex', gap: '16px', padding: '24px 0', borderBottom: '1px solid #f3f4f6' }}>
      <img
        src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80"
        alt={hotel.name}
        style={{ width: '128px', height: '96px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontWeight: 600, color: '#111827', margin: 0 }}>{hotel.name}</h3>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '2px 0 8px' }}>{hotel.region}, Bali</p>
          </div>
          <a
            href={hotel.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '999px', border: '1px solid #d1d5db', color: '#374151', textDecoration: 'none', whiteSpace: 'nowrap', marginLeft: '16px' }}
          >
            Book Now
          </a>
        </div>
        <p style={{ fontSize: '13px', color: '#4b5563', marginBottom: '8px' }}>{hotel.description}</p>
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
      </div>
    </div>
  )
}