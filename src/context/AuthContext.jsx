import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase/client'
import { signIn, signUp, signOut } from '../lib/supabase/auth'
import { takePendingSave, executePendingSave } from '../lib/pendingSave'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)

      // Catches the case where a user confirms their email (or clicks a magic
      // link) and lands back in the app already signed in, bypassing the
      // login/signup forms' own pending-save handling entirely.
      if (event === 'SIGNED_IN' && session?.user) {
        const pending = takePendingSave()
        if (pending) {
          executePendingSave(session.user.id, pending)
            .catch(err => console.error('Failed to complete pending save:', err))
            .finally(() => navigate(pending.returnTo || '/'))
        }
      }
    })

    return () => listener.subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = {
    user,
    loading,
    isLoggedIn: Boolean(user),
    signIn,
    signUp,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
