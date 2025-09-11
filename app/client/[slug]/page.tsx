'use client'

import { useEffect, useState } from 'react'
import { ClientDashboard } from '@/components/dashboard/client-dashboard'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'

interface PageProps {
  params: {
    slug: string
  }
}

export default function ClientDashboardPage({ params }: PageProps) {
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { supabase, loading: authLoading } = useAuth() // Use centralized Supabase client

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('CLIENT DASHBOARD: Loading timeout reached, forcing error state')
        setError('Loading timeout - please check your internet connection and try again')
        setLoading(false)
      }
    }, 15000) // 15 second timeout

    return () => clearTimeout(timeout)
  }, [loading])

  useEffect(() => {
    async function loadClient() {
      console.log('CLIENT DASHBOARD: Starting loadClient function')
      console.log('CLIENT DASHBOARD: authLoading =', authLoading)
      console.log('CLIENT DASHBOARD: supabase =', !!supabase)
      
      try {
        // Wait for auth to finish loading
        if (authLoading) {
          console.log('CLIENT DASHBOARD: Auth still loading, returning early')
          return
        }

        if (!supabase) {
          console.error('CLIENT DASHBOARD: Supabase client not available - check environment variables')
          setError('Database connection failed. Please check configuration.')
          setLoading(false)
          return
        }

        console.log('CLIENT DASHBOARD: Querying for client with slug:', params.slug)
        
        // Get client data
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('brand_slug', params.slug)
          .single()

        console.log('CLIENT DASHBOARD: Query result:', { clientData, clientError })

        if (clientError || !clientData) {
          console.error('CLIENT DASHBOARD: Client not found:', clientError)
          router.push('/not-found')
          return
        }

        console.log('CLIENT DASHBOARD: Setting client data:', clientData)
        setClient(clientData)
      } catch (error) {
        console.error('CLIENT DASHBOARD: Error loading client:', error)
        setError('Failed to load client data')
      } finally {
        console.log('CLIENT DASHBOARD: Setting loading to false')
        setLoading(false)
      }
    }

    console.log('CLIENT DASHBOARD: useEffect triggered, calling loadClient')
    loadClient()
  }, [params.slug, router, supabase, authLoading])

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Client not found</p>
        </div>
      </div>
    )
  }

  return <ClientDashboard client={client} />
}

