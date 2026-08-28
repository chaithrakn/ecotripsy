import { useState, useEffect } from 'react'
import { submitInterest } from '../lib/supabase/interestSubmissions'

const STORAGE_KEY = 'greenlugg_interest_popup_shown'
const SHOW_DELAY_MS = 8000

const ROLES = ['Traveler', 'Property / Tour Company', 'Media', 'Other']

const INTERESTS = [
  { key: 'Grow', emoji: '🌱', label: 'Grow', desc: 'Farm & Local Food' },
  { key: 'Explore', emoji: '🏔️', label: 'Explore', desc: 'Nature & Adventure' },
  { key: 'Connect', emoji: '🤝', label: 'Connect', desc: 'Community & Culture' },
  { key: 'Protect', emoji: '🦋', label: 'Protect', desc: 'Conservation' },
  { key: 'Restore', emoji: '💧', label: 'Restore', desc: 'Wellness & Healing' },
  { key: 'Water', emoji: '🌊', label: 'Water', desc: 'Beaches & Coast' }
]

export default function InterestPopup() {
  const [visible, setVisible] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [interests, setInterests] = useState([])
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    let alreadyShown
    try { alreadyShown = localStorage.getItem(STORAGE_KEY) } catch { alreadyShown = null }
    if (alreadyShown) return
    const timer = setTimeout(() => {
      setVisible(true)
      try { localStorage.setItem(STORAGE_KEY, 'true') } catch { /* ignore */ }
    }, SHOW_DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  function toggleInterest(key) {
    setInterests(current => {
      if (current.includes(key)) return current.filter(k => k !== key)
      if (current.length >= 3) return current
      return [...current, key]
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (status === 'saving') return
    setStatus('saving')
    try {
      await submitInterest({ firstName, email, role, interests })
      setStatus('success')
    } catch (err) {
      console.error('Failed to submit interest form:', err)
      setStatus('error')
    }
  }

  if (!visible) return null

  return (
    <div
      onClick={() => setVisible(false)}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,20,0.55)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'white', borderRadius: '20px', maxWidth: '580px', width: '100%',
          maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative',
          boxShadow: '0 24px 64px rgba(0,0,0,0.3)', fontFamily: 'Inter, sans-serif'
        }}
      >
        <button
          onClick={() => setVisible(false)}
          aria-label="Close"
          style={{ position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px', borderRadius: '999px', border: 'none', backgroundColor: '#f3f2ee', color: '#374151', fontSize: '16px', cursor: 'pointer' }}
        >
          ✕
        </button>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ fontSize: '32px', margin: '0 0 12px' }}>🌿</p>
            <h2 style={{ fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif', fontSize: '22px', fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>
              Thanks for joining in
            </h2>
            <p style={{ fontSize: '15px', color: '#6b7280', margin: 0 }}>
              We'll be in touch as Greenlugg grows.
            </p>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif', fontSize: '24px', fontWeight: 600, color: '#111827', margin: '0 0 8px', lineHeight: 1.25 }}>
              Help Shape the Future of Sustainable Travel
            </h2>
            <p style={{ fontSize: '15px', color: '#6b7280', margin: '0 0 24px', lineHeight: 1.6 }}>
              We're building Greenlugg around a community of travelers and partners who care — tell us a bit about you.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>First name</label>
                <input
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>Who are you?</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {ROLES.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      style={{
                        padding: '7px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                        border: `1px solid ${role === r ? '#0F2E1D' : '#d1d5db'}`,
                        backgroundColor: role === r ? '#0F2E1D' : 'white',
                        color: role === r ? 'white' : '#374151'
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                  My interests <span style={{ fontWeight: 400, color: '#9ca3af' }}>(pick up to 3)</span>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {INTERESTS.map(item => {
                    const selected = interests.includes(item.key)
                    const disabled = !selected && interests.length >= 3
                    return (
                      <label
                        key={item.key}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px',
                          border: `1px solid ${selected ? '#0F2E1D' : '#e5e7eb'}`,
                          backgroundColor: selected ? '#f0faf6' : 'white',
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          opacity: disabled ? 0.5 : 1
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          disabled={disabled}
                          onChange={() => toggleInterest(item.key)}
                          style={{ accentColor: '#0F2E1D' }}
                        />
                        <span style={{ fontSize: '18px' }}>{item.emoji}</span>
                        <span style={{ fontSize: '14px', color: '#111827' }}>
                          <strong>{item.label}</strong> — {item.desc}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {status === 'error' && (
                <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '14px' }}>Something went wrong. Please try again.</p>
              )}

              <button
                type="submit"
                disabled={status === 'saving'}
                style={{
                  width: '100%', padding: '12px', backgroundColor: status === 'saving' ? '#9ca3af' : '#0F2E1D',
                  color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600,
                  cursor: status === 'saving' ? 'not-allowed' : 'pointer'
                }}
              >
                {status === 'saving' ? 'Submitting...' : 'Join in'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
