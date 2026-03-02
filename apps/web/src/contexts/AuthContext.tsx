// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { AuthUser } from '../lib/types'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  guestMode: (deliveryCode: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  async function syncUserFromSession(userId: string, email?: string | null) {
    try {
      await fetchUserProfile(userId)
    } catch (profileError) {
      if (email) {
        await ensureProfileForUser(userId, email)
        await fetchUserProfile(userId)
      } else {
        throw profileError
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    const loadingSafetyTimeout = setTimeout(() => {
      if (isMounted) {
        setLoading(false)
      }
    }, 8000)

    // Check active session on mount
    ;(async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error

        if (session) {
          try {
            await syncUserFromSession(session.user.id, session.user.email)
          } catch (profileError) {
            setUser(null)
            setLoading(false)
          }
        } else {
          setUser(null)
          setLoading(false)
        }
      } catch (sessionError) {
        setUser(null)
        setLoading(false)
      } finally {
        if (!isMounted) return
      }
    })()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return

      if (session) {
        if (event === 'SIGNED_IN') {
          setLoading(true)
        }
        // Do not await Supabase queries directly in auth callback.
        setTimeout(() => {
          if (!isMounted) return
          void syncUserFromSession(session.user.id, session.user.email).catch(() => {
            if (event === 'SIGNED_IN') {
              setUser(null)
            }
            setLoading(false)
          })
        }, 0)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      clearTimeout(loadingSafetyTimeout)
      subscription.unsubscribe()
    }
  }, [])

  async function fetchUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      throw error
    }
    if (!data) {
      throw new Error('Profile not found')
    }

    setUser(data)
  }

  async function ensureProfileForUser(userId: string, email: string) {
    const fallbackName = email.includes('@') ? email.split('@')[0] : 'User'
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email,
        full_name: fallbackName,
        role: 'user',
        building_id: null,
      }, { onConflict: 'id' })

    if (error) {
      throw error
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  async function guestMode(deliveryCode: string) {
    // For guest tracking without auth
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .eq('delivery_code', deliveryCode)
      .single()

    if (error) throw error

    // Create temporary guest user object
    await fetchUserProfile(data.user_id)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, guestMode }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
