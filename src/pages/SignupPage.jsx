import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { takePendingSave, executePendingSave } from '../lib/pendingSave'
import useSeo from '../hooks/useSeo'

export default function SignupPage() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState(null)

  useSeo({ title: 'Sign Up', path: '/signup', noIndex: true })

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await signUp(email, password)
      if (data.session) {
        const pending = takePendingSave()
        if (pending && data.user) {
          try { await executePendingSave(data.user.id, pending) } catch (err) { console.error('Failed to complete pending save:', err) }
        }
        navigate(pending?.returnTo || '/')
      } else {
        setConfirmMessage('Check your email to confirm your account, then log in.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '380px', margin: '0 auto', padding: '64px 20px 80px' }}>
      <h1 style={{ fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif', fontSize: '28px', fontWeight: 500, color: '#111827', margin: '0 0 24px' }}>
        Create an account
      </h1>

      {confirmMessage ? (
        <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.6 }}>{confirmMessage}</p>
      ) : (
        <>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
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
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', boxSizing: 'border-box' }}
              />
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px' }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#9ca3af' : '#0F2E1D', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p style={{ fontSize: '15px', color: '#6b7280', marginTop: '20px' }}>
            Already have an account? <Link to="/login" style={{ color: '#0F2E1D', fontWeight: 600 }}>Log in</Link>
          </p>
        </>
      )}
    </div>
  )
}
