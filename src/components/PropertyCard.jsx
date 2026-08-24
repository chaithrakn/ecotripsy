const PILLAR_COLORS = {
  Restore: { bg: '#E1F5EE', color: '#0F6E56' },
  Grow:    { bg: '#EAF3DE', color: '#3B6D11' },
  Protect: { bg: '#E6F1FB', color: '#185FA5' },
  Connect: { bg: '#FAEEDA', color: '#854F0B' },
  Explore: { bg: '#EEEDFE', color: '#534AB7' },
}

export default function PropertyCard({ hotel, highlighted, onHighlight }) {
  return (
    <div
      onMouseEnter={() => onHighlight?.(hotel.id)}
      onMouseLeave={() => onHighlight?.(null)}
      onClick={() => onHighlight?.(hotel.id)}
      style={{
        display: 'flex',
        gap: '16px',
        padding: '24px',
        margin: '0 -24px',
        borderRadius: '10px',
        borderBottom: '1px solid #f3f4f6',
        backgroundColor: highlighted ? '#f0faf6' : 'transparent',
        cursor: 'pointer'
      }}
    >
      <img
        src={hotel.image}
        alt={hotel.name}
        style={{ width: '200px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0, alignSelf: 'stretch' }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontWeight: 600, color: '#111827', margin: 0 }}>{hotel.name}</h3>
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