import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Layout({ children, hideNav = false }) {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        backgroundColor: 'white',
        borderBottom: '1px solid #f3f4f6',
        padding: '14px 40px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            onClick={() => navigate('/')}
            style={{ fontWeight: 700, fontSize: '18px', color: '#111827', cursor: 'pointer' }}
          >
                Sustivo
          </span>
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#2e3034', letterSpacing: '0.08em', margin: '6px 0 0' }}>
                curated sustainable travel
         </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <span onClick={() => navigate('/')} style={{ fontSize: '14px', color: '#374151', cursor: 'pointer' }}>All</span>
            <span onClick={() => navigate('/')} style={{ fontSize: '14px', color: '#374151', cursor: 'pointer' }}>Destinations</span>
            <span style={{ fontSize: '14px', color: '#374151', cursor: 'pointer' }}>About</span>
            <span style={{ fontSize: '14px', color: '#374151', cursor: 'pointer' }}>🔍</span>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <div style={{ flex: 1, marginTop: '53px' }}>
        {children}
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#111827', color: 'white', padding: '48px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '48px' }}>
          <div style={{ maxWidth: '400px' }}>
            <p style={{ fontWeight: 700, fontSize: '18px', marginBottom: '12px' }}>Sustivo</p>
            <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.7 }}>
              We curate the world's best sustainable travel experiences — eco lodges, farm stays, and conservation experiences that do more good than harm.
            </p>
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '16px' }}>Contact Us</p>
            <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
              <input placeholder="Your name" style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#1f2937', color: 'white', fontSize: '14px', outline: 'none', width: '280px' }} />
              <input placeholder="Your email" style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#1f2937', color: 'white', fontSize: '14px', outline: 'none', width: '280px' }} />
              <button style={{ padding: '10px 14px', backgroundColor: '#0F6E56', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                Submit
              </button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}