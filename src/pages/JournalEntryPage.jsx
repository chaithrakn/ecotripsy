import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { getJournalEntryBySlug } from '../lib/supabase/api'

export default function JournalEntryPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [entry, setEntry] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getJournalEntryBySlug(slug)
      .then(data => { if (!cancelled) setEntry(data) })
      .catch(err => console.error('Failed to load journal entry:', err))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [slug])

  if (loading) return (
    <div style={{ padding: '48px 40px', fontFamily: 'Inter, sans-serif' }}>Loading...</div>
  )

  if (!entry) return (
    <div style={{ padding: '48px 40px', fontFamily: 'Inter, sans-serif' }}>Entry not found.</div>
  )

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 40px 80px' }}>
      <span
        onClick={() => navigate('/')}
        style={{ display: 'inline-block', fontSize: '15px', color: '#6b7280', cursor: 'pointer', marginBottom: '24px' }}
      >
        ← Back to home
      </span>

      {entry.cover_image && (
        <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '28px', aspectRatio: '16/9' }}>
          <img src={entry.cover_image} alt={entry.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <h1 style={{ fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif', fontSize: '30px', fontWeight: 500, color: '#111827', margin: '0 0 12px' }}>
        {entry.title}
      </h1>

      {entry.excerpt && (
        <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.7, margin: '0 0 28px' }}>
          {entry.excerpt}
        </p>
      )}

      <div style={{ fontSize: '15px', color: '#374151', lineHeight: 1.8 }}>
        <ReactMarkdown
          components={{
            img: ({ node, ...props }) => (
              <img {...props} style={{ width: '100%', borderRadius: '12px', margin: '20px 0' }} />
            )
          }}
        >
          {entry.body}
        </ReactMarkdown>
      </div>
    </div>
  )
}
