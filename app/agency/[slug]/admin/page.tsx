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

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function loadData() {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/login')
          return
        }

        // Get agency data
        const { data: agencyData, error: agencyError } = await supabase
          .from('agencies')
          .select('*')
          .eq('agency_slug', params.slug)
          .single()

        if (agencyError || !agencyData) {
          router.push('/not-found')
          return
        }

        setAgency(agencyData)

        // Get agency clients
        const { data: clientsData } = await supabase
          .from('clients')
          .select('*')
          .eq('agency_id', agencyData.id)
          .order('created_at', { ascending: false })

        setClients(clientsData || [])

        // Get client users for this agency
        const { data: usersData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('agency_id', agencyData.id)
          .eq('role', 'client_user')

        setClientUsers(usersData || [])

      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.slug, router, supabase])

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

