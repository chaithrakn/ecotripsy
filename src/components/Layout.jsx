import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllContentPages } from '../lib/supabase/api'
import { subscribeEmail } from '../lib/supabase/subscribers'
import { useAuth } from '../context/AuthContext'
import useIsMobile from '../hooks/useIsMobile'
import AccountRail from './AccountRail'

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function placeName(article) {
  return article.destinations?.name ?? article.regions?.name ?? article.title
}

function PlacesDropdown() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [articles, setArticles] = useState([])
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const ref = useRef(null)

  useEffect(() => {
    let cancelled = false
    getAllContentPages()
      .then(data => { if (!cancelled) setArticles(data) })
      .catch(err => console.error('Failed to load places:', err))
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function go(slug) {
    setOpen(false)
    navigate(`/articles/${slug}`)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <span
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '15px', color: '#374151', cursor: 'pointer' }}
      >
        Places <ChevronDown />
      </span>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 16px)', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 12px 32px rgba(0,0,0,0.16)',
          padding: '8px', minWidth: '220px', maxHeight: '320px', overflowY: 'auto', zIndex: 50
        }}>
          {articles.length === 0 ? (
            <div style={{ padding: '10px 14px', fontSize: '14px', color: '#9ca3af' }}>Loading...</div>
          ) : (
            articles.map((article, index) => (
              <div
                key={article.id}
                onClick={() => go(article.slug)}
                onMouseEnter={() => setHighlightIndex(index)}
                style={{
                  padding: '10px 14px', borderRadius: '8px', fontSize: '15px', color: '#111827', cursor: 'pointer',
                  backgroundColor: highlightIndex === index ? '#f0faf6' : 'transparent'
                }}
              >
                {placeName(article)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function AccountMenu() {
  const navigate = useNavigate()
  const { user, isLoggedIn, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!isLoggedIn) {
    return (
      <span
        onClick={() => navigate('/login')}
        style={{ fontSize: '15px', color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap' }}
      >
        Log in
      </span>
    )
  }

  async function handleSignOut() {
    setOpen(false)
    await signOut()
    navigate('/')
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <span
        onClick={() => setOpen(o => !o)}
        style={{ fontSize: '15px', color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap' }}
      >
        {user.email}
      </span>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 12px)', right: 0,
          backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 12px 32px rgba(0,0,0,0.16)',
          padding: '8px', minWidth: '160px', zIndex: 50
        }}>
          <div
            onClick={handleSignOut}
            style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '15px', color: '#111827', cursor: 'pointer' }}
          >
            Sign out
          </div>
        </div>
      )}
    </div>
  )
}

const SOCIALS = [
  { name: 'Instagram', path: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm5.5-1a1 1 0 1 1 0-2 1 1 0 0 1 0 2z' },
  { name: 'Facebook', path: 'M14 8h3V4h-3a5 5 0 0 0-5 5v2H6v4h3v7h4v-7h3l1-4h-4V9a1 1 0 0 1 1-1z' },
  { name: 'Pinterest', path: 'M12 2a10 10 0 0 0-3.6 19.3c0-.8-.03-2 .2-2.85.22-.85 1.4-5.95 1.4-5.95a3.5 3.5 0 0 1-.3-1.45c0-1.35.8-2.4 1.75-2.4.85 0 1.25.6 1.25 1.35 0 .8-.5 2-.8 3.15-.25 1 .5 1.8 1.45 1.8 1.75 0 3.1-1.85 3.1-4.5 0-2.35-1.7-4-4.1-4-2.8 0-4.45 2.1-4.45 4.25 0 .85.3 1.75.75 2.25.1.1.1.2.05.35l-.3 1.15c-.05.2-.15.25-.35.15-1.3-.6-2.1-2.5-2.1-4 0-3.3 2.4-6.3 6.9-6.3 3.6 0 6.45 2.6 6.45 6.05 0 3.6-2.3 6.5-5.45 6.5-1.05 0-2.05-.55-2.4-1.2l-.65 2.5c-.25.9-.9 2.05-1.35 2.75A10 10 0 1 0 12 2z' }
]

export default function Layout({ children }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [subscribeStatus, setSubscribeStatus] = useState('idle')
  const isMobile = useIsMobile()
  const { isLoggedIn } = useAuth()

  async function handleSubscribe() {
    if (!email.trim() || subscribeStatus === 'saving') return
    setSubscribeStatus('saving')
    try {
      const { alreadySubscribed } = await subscribeEmail(email.trim())
      setSubscribeStatus(alreadySubscribed ? 'already' : 'success')
      setEmail('')
    } catch (err) {
      console.error('Failed to subscribe:', err)
      setSubscribeStatus('error')
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#faf9f6' }}>

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: '#faf9f6',
        borderBottom: '1px solid #e5e4e0',
        padding: isMobile ? '14px 20px' : '16px 40px',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'auto auto' : '1fr auto 1fr', alignItems: 'center', justifyContent: isMobile ? 'space-between' : 'stretch' }}>
          <img
            src="/logo2.png"
            alt="Greenlugg"
            onClick={() => navigate('/')}
            style={{ height: isMobile ? '32px' : '40px', width: 'auto', cursor: 'pointer', justifySelf: 'start' }}
          />
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px', justifySelf: 'center' }}>
              <span onClick={() => navigate('/plan-a-trip')} style={{ fontSize: '15px', color: '#374151', cursor: 'pointer' }}>Explore</span>
              <PlacesDropdown />
              <span onClick={() => navigate('/journal')} style={{ fontSize: '15px', color: '#374151', cursor: 'pointer' }}>Field Notes</span>
              <span onClick={() => navigate('/about')} style={{ fontSize: '15px', color: '#374151', cursor: 'pointer' }}>About</span>
              <span onClick={() => navigate('/partner')} style={{ fontSize: '15px', color: '#374151', cursor: 'pointer' }}>Partner</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', justifySelf: 'end' }}>
            {!isMobile && <AccountMenu />}
            <button
              onClick={() => navigate('/plan-a-trip')}
              style={{ width: isMobile ? 'auto' : '190px', padding: isMobile ? '9px 16px' : '10px 0', backgroundColor: '#0F2E1D', color: 'white', border: 'none', borderRadius: '999px', fontSize: isMobile ? '13px' : '14px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Plan a trip
            </button>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <div style={{ flex: 1, display: 'flex' }}>
        {!isMobile && isLoggedIn && (
          <div style={{ position: 'sticky', top: '73px', height: 'calc(100vh - 73px)', alignSelf: 'flex-start' }}>
            <AccountRail />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#f3f2ee', color: '#111827', padding: isMobile ? '40px 20px 24px' : '56px 40px 32px' }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: isMobile ? '32px' : '48px', flexWrap: 'wrap', maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ maxWidth: isMobile ? 'none' : '340px' }}>
            <img src="/logo2.png" alt="Greenlugg" style={{ height: '32px', width: 'auto', marginBottom: '10px' }} />
            <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6 }}>
              At Greenlugg, we are passionate about preserving the environments and communities we travel through. We are building the ecosystem to curate the world's best sustainable and regenerative hotels and experiences, to make your travel more meaningful.
            </p>
            <div style={{ display: 'flex', gap: '14px', marginTop: '20px' }}>
              {SOCIALS.map(social => (
                <svg key={social.name} width="18" height="18" viewBox="0 0 24 24" fill="#374151" aria-label={social.name}>
                  <path d={social.path} />
                </svg>
              ))}
            </div>
          </div>

          <div style={{ maxWidth: isMobile ? 'none' : '320px' }}>
            <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '6px' }}>Travel inspiration, straight to your inbox</p>
            <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '14px' }}>
              Stories, guides and sustainable travel ideas.
            </p>
            {subscribeStatus === 'success' || subscribeStatus === 'already' ? (
              <p style={{ fontSize: '15px', color: '#0F6E56', fontWeight: 600, margin: 0 }}>
                {subscribeStatus === 'already' ? "You're already subscribed." : "You're on the list!"}
              </p>
            ) : (
              <form onSubmit={e => { e.preventDefault(); handleSubscribe() }} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white', color: '#111827', fontSize: '15px', outline: 'none', width: isMobile ? '100%' : '220px', boxSizing: 'border-box' }}
                />
                <button
                  type="submit"
                  disabled={subscribeStatus === 'saving'}
                  style={{ padding: '10px 18px', backgroundColor: '#0F2E1D', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: subscribeStatus === 'saving' ? 'default' : 'pointer', whiteSpace: 'nowrap', opacity: subscribeStatus === 'saving' ? 0.7 : 1 }}
                >
                  {subscribeStatus === 'saving' ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            )}
            {subscribeStatus !== 'success' && subscribeStatus !== 'already' && (
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '8px 0 0' }}>
                No spam, ever. Unsubscribe anytime.
              </p>
            )}
            {subscribeStatus === 'error' && (
              <p style={{ fontSize: '13px', color: '#ef4444', margin: '8px 0 0' }}>Something went wrong. Please try again.</p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '48px' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '14px' }}>Explore</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Places', 'Field Notes', 'Plan a trip'].map(item => (
                  <span key={item} style={{ fontSize: '15px', color: '#6b7280', cursor: 'pointer' }}>{item}</span>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '14px' }}>Company</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['About us', 'Our approach', 'Partner with us', 'Careers'].map(item => (
                  <span key={item} style={{ fontSize: '15px', color: '#6b7280', cursor: 'pointer' }}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1280px', margin: '32px auto 0', paddingTop: '20px', borderTop: '1px solid #e5e4e0' }}>
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>© 2026 greenlugg. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}
