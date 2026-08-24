export default function Itinerary({ data, highlightedId, onHighlight }) {
  if (!data || !data.days) return null

  return (
    <div style={{ marginTop: '32px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
        Your Itinerary
      </h2>
      {data.days.map((day, index) => (
        <div
          key={index}
          style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #f3f4f6' }}
        >
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#0F6E56', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>
            Day {day.day}
          </p>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
            {day.title}
          </h3>
          {day.arrivalNote && (
            <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.7, margin: '0 0 8px' }}>
              {day.arrivalNote}
            </p>
          )}
          {day.activities.length > 0 && (
            <ul style={{ margin: '0 0 8px', paddingLeft: '20px' }}>
              {day.activities.map((activity, i) => (
                <li
                  key={i}
                  onMouseEnter={() => onHighlight?.(activity.id)}
                  onMouseLeave={() => onHighlight?.(null)}
                  onClick={() => onHighlight?.(activity.id)}
                  style={{
                    fontSize: '14px',
                    color: '#4b5563',
                    lineHeight: 1.7,
                    marginBottom: '4px',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    padding: '2px 6px',
                    marginLeft: '-6px',
                    backgroundColor: highlightedId === activity.id ? '#f0faf6' : 'transparent'
                  }}
                >
                  <strong style={{ color: '#111827', fontWeight: 600 }}>{activity.name}</strong> — {activity.description}
                </li>
              ))}
            </ul>
          )}
          {day.departNote && (
            <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.7, margin: '0 0 8px' }}>
              {day.departNote}
            </p>
          )}
          {day.tourSuggestions.length > 0 && (
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px' }}>
              🧭 Suggested tours:{' '}
              {day.tourSuggestions.map((tour, i) => (
                <span key={tour.id}>
                  <a
                    href={tour.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#0F6E56' }}
                  >
                    {tour.name}
                  </a>
                  {i < day.tourSuggestions.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
          )}
          <div
            onMouseEnter={() => onHighlight?.(day.hotel.id)}
            onMouseLeave={() => onHighlight?.(null)}
            onClick={() => onHighlight?.(day.hotel.id)}
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              padding: '10px',
              borderRadius: '10px',
              cursor: 'pointer',
              backgroundColor: highlightedId === day.hotel.id ? '#dbeee8' : '#eef7f4'
            }}
          >
            {day.hotel.image && (
              <img
                src={day.hotel.image}
                alt={day.hotel.name}
                style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
              />
            )}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: 0 }}>
                🏨 {day.hotel.name}
              </p>
              {day.hotel.description && (
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>
                  {day.hotel.description}
                </p>
              )}
            </div>
            <a
              href={day.hotel.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '999px', border: '1px solid #d1d5db', color: '#374151', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              Book Now
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}