'use client'

import { useState, useEffect } from 'react'
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
  
  // Redirect if already logged in
  useEffect(() => {
    if (initialized && user) {
      console.log('LOGIN: User already authenticated, redirecting')
      handleRedirectAfterAuth()
    }
  }, [initialized, user, redirectTo, router])

  const handleRedirectAfterAuth = async () => {
    if (!supabase || !user) return

    setRedirecting(true)
    
    try {
      console.log('LOGIN: Determining redirect destination based on user role')
      
      // Get user profile to determine role and redirect destination
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*, agencies(slug), clients(brand_slug)')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('LOGIN: Error fetching user profile:', profileError)
        // Fallback to default redirect
        router.push(redirectTo || '/client/hydrus')
        return
      }

      console.log('LOGIN: User profile:', profile)

      // Redirect based on role
      if (profile.role === 'agency_admin') {
        const agencySlug = profile.agencies?.slug
        if (agencySlug) {
          console.log(`LOGIN: Redirecting agency admin to: /agency/${agencySlug}/admin`)
          router.push(`/agency/${agencySlug}/admin`)
        } else {
          console.error('LOGIN: Agency admin user has no agency slug')
          router.push('/unauthorized')
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
      // Fallback redirect
      router.push(redirectTo || '/client/hydrus')
    } finally {
      setRedirecting(false)
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
        return
      }

      if (data.user) {
        console.log('LOGIN: Authentication successful, determining redirect...')
        // Trigger the redirect logic immediately after successful login
        await handleRedirectAfterAuth()
      }
    } catch (err) {
      console.error('LOGIN: Unexpected error:', err)
      setError('An unexpected error occurred')
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
