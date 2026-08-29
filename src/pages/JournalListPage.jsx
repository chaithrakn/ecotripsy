import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllJournalEntries } from '../lib/supabase/api'
import useIsMobile from '../hooks/useIsMobile'
import useSeo from '../hooks/useSeo'

export default function JournalListPage() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const isMobile = useIsMobile()

  useSeo({
    title: 'Field Notes',
    description: 'Short reads and reflections from the road — stories from sustainable travel across the world.',
    path: '/journal'
  })

  useEffect(() => {
    let cancelled = false
    getAllJournalEntries()
      .then(data => { if (!cancelled) setEntries(data) })
      .catch(err => console.error('Failed to load journal entries:', err))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '28px 16px 48px' : '48px 40px 80px' }}>
      <h1 style={{ fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif', fontSize: isMobile ? '24px' : '32px', fontWeight: 500, color: '#111827', margin: '0 0 12px' }}>
        Field Notes
      </h1>
      <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.7, maxWidth: '680px', margin: '0 0 32px' }}>
        Short reads and reflections from the road — no itineraries, just stories.
      </p>

      {loading ? (
        <p style={{ color: '#6b7280', fontSize: '15px' }}>Loading...</p>
      ) : entries.length === 0 ? (
        <p style={{ fontSize: '15px', color: '#9ca3af' }}>No field notes yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {entries.map(entry => (
            <div
              key={entry.id}
              onClick={() => navigate(`/journal/${entry.slug}`)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '12px', aspectRatio: '4/3', backgroundColor: '#eeece5' }}>
                {entry.cover_image && (
                  <img src={entry.cover_image} alt={entry.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <h3 style={{ fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif', fontSize: '17px', fontWeight: 600, color: '#111827', margin: '0 0 6px', lineHeight: 1.35 }}>
                {entry.title}
              </h3>
              {entry.excerpt && (
                <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
                  {entry.excerpt}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
