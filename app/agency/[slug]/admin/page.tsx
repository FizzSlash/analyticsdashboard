'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { AgencyAdminDashboard } from '@/components/agency/agency-admin-dashboard'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        console.log('DASHBOARD LOAD: Step 1 - Starting dashboard data load for slug:', params.slug)
        
        // Create supabase client inside useEffect to avoid re-renders
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
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
        setClients(clientsData || [])

        // Get client users for this agency
        console.log('DASHBOARD LOAD: Step 9 - Getting client users for agency:', agencyData.id)
        const { data: usersData, error: usersError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('agency_id', agencyData.id)
          .eq('role', 'client_user')

        console.log('DASHBOARD LOAD: Step 10 - Users query result:', { usersData, usersError })
        setClientUsers(usersData || [])

        console.log('DASHBOARD LOAD: Step 11 - All data loaded successfully!')

      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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

