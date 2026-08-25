import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllContentPages } from '../lib/supabase/api'

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function placeName(article) {
  return article.destinations?.name ?? article.regions?.name ?? article.title
}

export default function HeroSearchBar({ isMobile }) {
  const navigate = useNavigate()
  const [articles, setArticles] = useState([])
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const blurTimeout = useRef(null)

  useEffect(() => {
    let cancelled = false
    getAllContentPages()
      .then(data => { if (!cancelled) setArticles(data) })
      .catch(err => console.error('Failed to load destinations for search:', err))
    return () => { cancelled = true }
  }, [])

  const destOptions = articles.map(a => ({ type: 'dest', label: placeName(a), value: a.slug }))

  const filtered = query.trim()
    ? destOptions.filter(o => o.label.toLowerCase().includes(query.trim().toLowerCase()))
    : destOptions

  const popular = destOptions.slice(0, 5)

  function select(option) {
    if (!option) return
    setQuery(option.label)
    setOpen(false)
    navigate(`/articles/${option.value}`)
  }

  function handleKeyDown(e) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightIndex >= 0) select(filtered[highlightIndex])
      else if (filtered.length === 1) select(filtered[0])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  function handleBlur() {
    blurTimeout.current = setTimeout(() => setOpen(false), 150)
  }

  function handleFocus() {
    if (blurTimeout.current) clearTimeout(blurTimeout.current)
    setOpen(true)
  }

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: isMobile ? '100%' : '620px' }}>
      <div style={{
        backgroundColor: '#faf9f6',
        borderRadius: '18px',
        padding: '14px 20px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); setHighlightIndex(-1) }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Where do you want to go?"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '15px',
              color: '#111827',
              padding: '4px 0'
            }}
          />
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={() => select(highlightIndex >= 0 ? filtered[highlightIndex] : filtered[0])}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
              backgroundColor: '#0F2E1D', color: 'white', border: 'none', borderRadius: '10px',
              padding: '10px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
            }}
          >
            <SearchIcon /> Search
          </button>
        </div>

        {!query.trim() && popular.length > 0 && (
          <>
            <div style={{ height: '1px', backgroundColor: '#e5e4e0', margin: '12px 0 10px' }} />
            <p style={{ fontSize: '12px', color: '#374151', margin: 0 }}>
              Popular:{' '}
              {popular.map((option, i) => (
                <span key={option.value}>
                  <span
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => select(option)}
                    style={{ fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {option.label}
                  </span>
                  {i < popular.length - 1 ? ' · ' : ''}
                </span>
              ))}
            </p>
          </>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
          backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 12px 32px rgba(0,0,0,0.16)',
          padding: '8px', maxHeight: '320px', overflowY: 'auto', zIndex: 10
        }}>
          {filtered.map((option, index) => (
            <div
              key={option.value}
              onMouseDown={e => e.preventDefault()}
              onClick={() => select(option)}
              onMouseEnter={() => setHighlightIndex(index)}
              style={{
                padding: '10px 10px', borderRadius: '8px', fontSize: '14px', color: '#111827', cursor: 'pointer',
                backgroundColor: highlightIndex === index ? '#f0faf6' : 'transparent'
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
