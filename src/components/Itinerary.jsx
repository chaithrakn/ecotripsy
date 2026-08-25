import CollapsibleSection from './CollapsibleSection'

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function groupDaysByRegion(days) {
  const groups = []
  let current = null
  for (const day of days) {
    const key = day.regionName || 'Itinerary'
    if (!current || current.regionName !== key) {
      current = { regionName: key, days: [] }
      groups.push(current)
    }
    current.days.push(day)
  }
  return groups
}

function DayCard({ day, highlightedId, onHighlight }) {
  return (
    <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #f3f4f6' }}>
      <p style={{ fontSize: '13px', fontWeight: 600, color: '#0F2E1D', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>
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
      {day.optionalActivities?.length > 0 && (
        <div style={{ margin: '0 0 8px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>
            Optional but recommended
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {day.optionalActivities.map((activity, i) => (
              <li
                key={i}
                onMouseEnter={() => onHighlight?.(activity.id)}
                onMouseLeave={() => onHighlight?.(null)}
                onClick={() => onHighlight?.(activity.id)}
                style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  lineHeight: 1.7,
                  marginBottom: '4px',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  padding: '2px 6px',
                  marginLeft: '-6px',
                  backgroundColor: highlightedId === activity.id ? '#f0faf6' : 'transparent'
                }}
              >
                <strong style={{ color: '#374151', fontWeight: 600 }}>{activity.name}</strong> — {activity.description}
              </li>
            ))}
          </ul>
        </div>
      )}
      {day.note && (
        <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.7, margin: '0 0 8px', fontStyle: 'italic' }}>
          {day.note}
        </p>
      )}
      {day.checkinNote && (
        <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', lineHeight: 1.7, margin: '0 0 8px' }}>
          {day.checkinNote}
        </p>
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
                style={{ color: '#0F2E1D' }}
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
  )
}

export default function Itinerary({ data, highlightedId, onHighlight }) {
  if (!data || !data.days) return null

  const groups = groupDaysByRegion(data.days)
  const hasMultipleRegions = groups.length > 1
  const totalDays = data.days.length

  function scrollToRegion(regionName) {
    document.getElementById(`itinerary-${slugify(regionName)}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div style={{ marginTop: '32px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
        Your Itinerary
      </h2>

      {hasMultipleRegions && (
        <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.8, marginBottom: '24px' }}>
          Your {totalDays}-day itinerary:{' '}
          {groups.map((group, i) => (
            <span key={i}>
              <span
                onClick={() => scrollToRegion(group.regionName)}
                style={{ color: '#0F2E1D', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
              >
                {group.regionName}
              </span>
              {' '}– {group.days.length} day{group.days.length > 1 ? 's' : ''}
              {i < groups.length - 1 ? ', ' : ''}
            </span>
          ))}
        </p>
      )}

      {groups.map((group, i) => {
        const dayCards = group.days.map((day, j) => (
          <DayCard key={j} day={day} highlightedId={highlightedId} onHighlight={onHighlight} />
        ))

        if (!hasMultipleRegions) {
          return <div key={i}>{dayCards}</div>
        }

        return (
          <CollapsibleSection
            key={i}
            id={`itinerary-${slugify(group.regionName)}`}
            heading={
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
                {group.regionName}{' '}
                <span style={{ fontWeight: 400, color: '#6b7280', fontSize: '13px' }}>
                  · {group.days.length} day{group.days.length > 1 ? 's' : ''}
                </span>
              </p>
            }
          >
            {dayCards}
          </CollapsibleSection>
        )
      })}
    </div>
  )
}
