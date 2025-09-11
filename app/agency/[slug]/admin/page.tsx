'use client'

import { useEffect, useState } from 'react'
import { AgencyAdminDashboard } from '@/components/agency/agency-admin-dashboard'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'

interface PageProps {
  params: {
    slug: string
  }
}

export default function AgencyAdminPage({ params }: PageProps) {
  const [agency, setAgency] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [clientUsers, setClientUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { supabase, loading: authLoading } = useAuth() // Use centralized Supabase client

  useEffect(() => {
    async function loadData() {
      try {
        console.log('DASHBOARD LOAD: Step 1 - Starting dashboard data load for slug:', params.slug)
        
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
        console.log('DASHBOARD LOAD: Step 2 - Supabase client created')

        // Get current user
        console.log('DASHBOARD LOAD: Step 3 - Skipping session check for now')

        // Get agency data
        console.log('DASHBOARD LOAD: Step 4 - Getting agency data for slug:', params.slug)
        const { data: agencyData, error: agencyError } = await supabase
          .from('agencies')
          .select('*')
          .eq('agency_slug', params.slug)
          .single()

        console.log('DASHBOARD LOAD: Step 5 - Agency query result:', { agencyData, agencyError })

        if (agencyError || !agencyData) {
          console.log('DASHBOARD LOAD: Step 5.1 - Agency not found, redirecting')
          router.push('/not-found')
          return
        }

        setAgency(agencyData)
        console.log('DASHBOARD LOAD: Step 6 - Agency set:', agencyData.agency_name)

        // Get agency clients
        console.log('DASHBOARD LOAD: Step 7 - Getting clients for agency:', agencyData.id)
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('*')
          .eq('agency_id', agencyData.id)
          .order('created_at', { ascending: false })

        console.log('DASHBOARD LOAD: Step 8 - Clients query result:', { clientsData, clientsError })

        if (clientsError) {
          console.error('DASHBOARD LOAD: Step 8.1 - Error loading clients:', clientsError)
          setError('Failed to load clients')
        } else {
          setClients(clientsData || [])
          console.log('DASHBOARD LOAD: Step 9 - Clients set, count:', clientsData?.length || 0)
        }

        // Get client users for this agency
        console.log('DASHBOARD LOAD: Step 10 - Getting client users for agency:', agencyData.id)
        const { data: usersData, error: usersError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('agency_id', agencyData.id)
          .eq('role', 'client_user')

        console.log('DASHBOARD LOAD: Step 11 - Users query result:', { usersData, usersError })
        
        if (usersError) {
          console.error('DASHBOARD LOAD: Step 11.1 - Error loading users:', usersError)
        } else {
          setClientUsers(usersData || [])
          console.log('DASHBOARD LOAD: Step 12 - Users set, count:', usersData?.length || 0)
        }

        console.log('DASHBOARD LOAD: Step 13 - All data loaded successfully!')

      } catch (error) {
        console.error('DASHBOARD LOAD: Error loading data:', error)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
        console.log('DASHBOARD LOAD: Step 14 - Loading complete')
      }
    }

    loadData()
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

  if (!agency) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Agency not found</p>
        </div>
      </div>
    )
  }

  return (
    <AgencyAdminDashboard 
      agency={agency}
      clients={clients}
      clientUsers={clientUsers}
    />
  )
}

