'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-provider'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
  requireAuth?: boolean
}

export function AuthGuard({ children, redirectTo = '/login', requireAuth = true }: AuthGuardProps) {
  const { user, loading, initialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!initialized || loading) {
      // Still initializing, wait
      return
    }

    if (requireAuth && !user) {
      console.log('AUTH GUARD: User not authenticated, redirecting to login')
      const currentPath = encodeURIComponent(window.location.pathname + window.location.search)
      router.push(`${redirectTo}?redirectTo=${currentPath}`)
      return
    }

    if (!requireAuth && user) {
      // User is logged in but trying to access a page that doesn't require auth (like login page)
      console.log('AUTH GUARD: User already authenticated, redirecting to dashboard')
      router.push('/agency/retention-harbor/admin')
      return
    }
  }, [user, loading, initialized, requireAuth, redirectTo, router])

  // Show loading while auth is initializing
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If auth is required but user is not authenticated, show loading while redirect happens
  if (requireAuth && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // If no auth is required but user is authenticated, show loading while redirect happens
  if (!requireAuth && user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}