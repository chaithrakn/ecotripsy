export default function Itinerary({ data }) {
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
          <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.7, margin: '0 0 8px' }}>
            {day.narrative}
          </p>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
            🏨 {day.hotel}
          </p>
        </div>
      ))}
    </div>
  )
}