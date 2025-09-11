'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { UserProfile } from '@/lib/supabase'
import { getSupabaseClient } from '@/lib/supabase-client'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  supabase: any
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    // Initialize Supabase client on the client side
    const initSupabase = () => {
      try {
        const client = getSupabaseClient()
        setSupabase(client)
        return client
      } catch (error) {
        console.error('Failed to initialize Supabase:', error)
        setLoading(false)
        return null
      }
    }

    const client = initSupabase()
    if (!client) return

    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await client.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // Fetch user profile
        const { data: profileData } = await client
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        setProfile(profileData)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event: any, session: any) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Fetch user profile
          const { data: profileData } = await client
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          setProfile(profileData)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, supabase }}>
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

// Export the shared supabase client
export { getSupabaseClient }
