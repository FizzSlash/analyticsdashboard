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

  useEffect(() => {
    async function loadClient() {
      try {
        // Wait for auth to finish loading
        if (authLoading) {
          return
        }

        if (!supabase) {
          console.error('Supabase client not available - check environment variables')
          setError('Database connection failed. Please check configuration.')
          setLoading(false)
          return
        }

        // Get client data
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('brand_slug', params.slug)
          .single()

        if (clientError || !clientData) {
          console.error('Client not found:', clientError)
          router.push('/not-found')
          return
        }

        setClient(clientData)
      } catch (error) {
        console.error('Error loading client:', error)
        setError('Failed to load client data')
      } finally {
        setLoading(false)
      }
    }

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

