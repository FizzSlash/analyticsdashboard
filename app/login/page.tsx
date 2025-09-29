'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/components/auth/auth-provider'
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || null
  const { user, supabase, initialized } = useAuth()
  
  // Prevent multiple redirects
  const redirectInProgress = useRef(false)
  
  // Redirect if already logged in
  useEffect(() => {
    if (initialized && user && !redirecting && !redirectInProgress.current) {
      console.log('LOGIN: User already authenticated, redirecting')
      redirectInProgress.current = true
      handleRedirectAfterAuth()
    }
  }, [initialized, user])

  const handleRedirectAfterAuth = async () => {
    if (!supabase || !user) return

    setRedirecting(true)
    
    try {
      console.log('LOGIN: Determining redirect destination based on user role')
      
      // Get user profile to determine role and redirect destination
      console.log('LOGIN: Fetching user profile with agency/client data...')
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      console.log('LOGIN: User profile fetched:', profile)

      // If profile exists, get agency/client data separately
      let agencyData = null
      let clientData = null
      
      if (profile?.agency_id) {
        console.log('LOGIN: Fetching agency data for agency_id:', profile.agency_id)
        const { data: agencyResult, error: agencyError } = await supabase
          .from('agencies')
          .select('agency_slug')
          .eq('id', profile.agency_id)
          .single()
          
        console.log('LOGIN: Agency query result:', { agencyResult, agencyError })
        agencyData = agencyResult
      }
      
      if (profile?.client_id) {
        console.log('LOGIN: Fetching client data for client_id:', profile.client_id)
        const { data: clientResult, error: clientError } = await supabase
          .from('clients')
          .select('brand_slug')
          .eq('id', profile.client_id)
          .single()
          
        console.log('LOGIN: Client query result:', { clientResult, clientError })
        clientData = clientResult
      }

      // Attach the related data to profile
      if (profile) {
        profile.agencies = agencyData
        profile.clients = clientData
      }

      if (profileError) {
        console.error('LOGIN: Error fetching user profile:', profileError)
        // Fallback to agency admin dashboard since we know you're an agency admin
        console.log('LOGIN: Profile error fallback - redirecting to agency dashboard')
        router.push(redirectTo || '/agency/retention-harbor/admin')
        return
      }

      console.log('LOGIN: User profile:', profile)

      // Redirect based on role
      if (profile.role === 'agency_admin') {
        const agencySlug = profile.agencies?.agency_slug
        console.log('LOGIN: Agency data:', profile.agencies)
        console.log('LOGIN: Looking for agency_slug in:', agencySlug)
        
        if (agencySlug) {
          console.log(`LOGIN: Redirecting agency admin to: /agency/${agencySlug}/admin`)
          router.push(`/agency/${agencySlug}/admin`)
        } else {
          console.error('LOGIN: Agency admin user has no agency slug. Profile:', profile)
          console.error('LOGIN: Agencies data:', profile.agencies)
          console.log('LOGIN: Using fallback - redirecting to retention-harbor since we know you own it')
          router.push('/agency/retention-harbor/admin')
        }
      } else if (profile.role === 'client_user') {
        const clientSlug = profile.clients?.brand_slug
        if (clientSlug) {
          console.log(`LOGIN: Redirecting client user to: /client/${clientSlug}`)
          router.push(`/client/${clientSlug}`)
        } else {
          console.error('LOGIN: Client user has no client slug')
          router.push('/unauthorized')
        }
      } else {
        console.error('LOGIN: Unknown user role:', profile.role)
        router.push('/unauthorized')
      }

    } catch (error) {
      console.error('LOGIN: Error during redirect logic:', error)
      // Reset flag and redirecting state on error
      redirectInProgress.current = false
      setRedirecting(false)
      
      // Fallback redirect - try agency admin first since that's most common
      console.log('LOGIN: Using fallback redirect to agency admin dashboard')
      router.push(redirectTo || '/agency/retention-harbor/admin')
    } finally {
      setRedirecting(false)
      redirectInProgress.current = false
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!supabase) {
        setError('Authentication service not available')
        return
      }

      console.log('LOGIN: Attempting to sign in')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('LOGIN: Auth error:', error)
        setError(error.message)
        redirectInProgress.current = false // Reset flag on auth error
        return
      }

      if (data.user) {
        console.log('LOGIN: Authentication successful - redirect will be handled by useEffect')
        // Don't call handleRedirectAfterAuth here - let the useEffect handle it
        // This prevents duplicate calls and infinite loops
      }
    } catch (err) {
      console.error('LOGIN: Unexpected error:', err)
      setError('An unexpected error occurred')
      redirectInProgress.current = false // Reset flag on error
    } finally {
      setLoading(false)
    }
  }

  // Show loading while auth initializes or redirecting
  if (!initialized || redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">
              {redirecting ? 'Redirecting to your dashboard...' : 'Initializing...'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Sign In
          </CardTitle>
          <p className="text-gray-600">
            Access your Klaviyo Analytics Dashboard
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Need access? Contact your agency administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
