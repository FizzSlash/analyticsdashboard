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
  initialized: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [supabase, setSupabase] = useState<any>(null)

  // Helper function to update user and profile
  const updateUserAndProfile = async (client: any, session: any) => {
    try {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        console.log('AUTH PROVIDER: Fetching user profile')
        const { data: profileData, error: profileError } = await client
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profileError) {
          console.warn('AUTH PROVIDER: Profile fetch error:', profileError)
          setProfile(null)
        } else {
          console.log('AUTH PROVIDER: Profile loaded')
          setProfile(profileData)
        }
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.error('AUTH PROVIDER: Error updating user/profile:', error)
    }
  }

  useEffect(() => {
    console.log('AUTH PROVIDER: useEffect triggered')
    let mounted = true
    let subscription: any = null
    
    // Initialize Supabase client
    const initAuth = async () => {
      console.log('AUTH PROVIDER: Initializing Supabase client')
      try {
        const client = getSupabaseClient()
        if (!client) {
          console.warn('AUTH PROVIDER: Supabase client could not be initialized')
          if (mounted) {
            setLoading(false)
            setInitialized(true)
          }
          return
        }
        
        console.log('AUTH PROVIDER: Supabase client initialized successfully')
        if (mounted) {
          setSupabase(client)
        }
        
        // Get initial session
        console.log('AUTH PROVIDER: Getting initial session')
        let session = null
        try {
          const sessionResponse = await Promise.race([
            client.auth.getSession(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Session timeout after 5 seconds')), 5000)
            )
          ])
          
          const { data: sessionData, error: sessionError } = sessionResponse as any
          session = sessionData?.session
          
          if (sessionError) {
            console.error('AUTH PROVIDER: Session error:', sessionError)
            if (mounted) {
              setLoading(false)
              setInitialized(true)
            }
            return
          }
          
          console.log('AUTH PROVIDER: Initial session:', !!session)
          console.log('AUTH PROVIDER: Session details:', session?.user?.email || 'No user')
        } catch (error) {
          console.error('AUTH PROVIDER: Session call failed or timed out:', error)
          // Continue with null session - don't return, let the app load
          session = null
        }
        
        // Set user and profile
        if (mounted) {
          await updateUserAndProfile(client, session)
        }
        
        // Set up auth state listener
        console.log('AUTH PROVIDER: Setting up auth state listener')
        const { data: { subscription: authSubscription } } = client.auth.onAuthStateChange(
          async (event: any, newSession: any) => {
            console.log('AUTH PROVIDER: Auth state changed:', event)
            if (mounted) {
              await updateUserAndProfile(client, newSession)
            }
          }
        )
        subscription = authSubscription
        
        // Mark as initialized and stop loading
        if (mounted) {
          setInitialized(true)
          setLoading(false)
          console.log('AUTH PROVIDER: Initialization complete')
        }
      } catch (error) {
        console.error('AUTH PROVIDER: Failed to initialize:', error)
        if (mounted) {
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    initAuth()

    return () => {
      console.log('AUTH PROVIDER: Cleaning up')
      mounted = false
      if (subscription) {
        subscription.unsubscribe()
      }
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
    <AuthContext.Provider value={{ user, profile, loading, signOut, supabase, initialized }}>
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
