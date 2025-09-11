'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { UserProfile } from '@/lib/supabase'
import { getSupabaseClient } from '@/lib/supabase'

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
    console.log('AUTH PROVIDER: useEffect triggered')
    
    // Initialize Supabase client on the client side
    const initSupabase = () => {
      console.log('AUTH PROVIDER: Initializing Supabase client')
      try {
        const client = getSupabaseClient()
        if (!client) {
          console.warn('AUTH PROVIDER: Supabase client could not be initialized - missing environment variables')
          setLoading(false)
          return null
        }
        console.log('AUTH PROVIDER: Supabase client initialized successfully')
        setSupabase(client)
        return client
      } catch (error) {
        console.error('AUTH PROVIDER: Failed to initialize Supabase:', error)
        setLoading(false)
        return null
      }
    }

    const client = initSupabase()
    if (!client) {
      console.log('AUTH PROVIDER: No client available, exiting')
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      console.log('AUTH PROVIDER: Getting initial session')
      try {
        const { data: { session } } = await client.auth.getSession()
        console.log('AUTH PROVIDER: Session result:', !!session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('AUTH PROVIDER: User found, fetching profile')
          // Fetch user profile
          const { data: profileData } = await client
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          console.log('AUTH PROVIDER: Profile data:', !!profileData)
          setProfile(profileData)
        }
        
        console.log('AUTH PROVIDER: Setting loading to false')
        setLoading(false)
      } catch (error) {
        console.error('AUTH PROVIDER: Error getting initial session:', error)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    console.log('AUTH PROVIDER: Setting up auth state listener')
    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event: any, session: any) => {
        console.log('AUTH PROVIDER: Auth state changed:', event, !!session)
        console.log('AUTH PROVIDER: Processing auth state change...')
        try {
          setUser(session?.user ?? null)
          console.log('AUTH PROVIDER: User state updated')
          
          if (session?.user) {
            console.log('AUTH PROVIDER: User exists, fetching profile')
            // Fetch user profile
            const { data: profileData } = await client
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            console.log('AUTH PROVIDER: Profile fetched:', !!profileData)
            setProfile(profileData)
          } else {
            console.log('AUTH PROVIDER: No user, setting profile to null')
            setProfile(null)
          }
          
          // CRITICAL FIX: Always set loading to false after auth state change
          console.log('AUTH PROVIDER: Setting loading to false after auth state change')
          setLoading(false)
          console.log('AUTH PROVIDER: Loading state set to false - auth processing complete')
        } catch (error) {
          console.error('AUTH PROVIDER: Error handling auth state change:', error)
          console.log('AUTH PROVIDER: Setting loading to false due to error')
          setLoading(false)
        }
      }
    )

    return () => {
      console.log('AUTH PROVIDER: Cleaning up auth listener')
      subscription.unsubscribe()
    }
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
