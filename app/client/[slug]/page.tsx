'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ClientDashboard } from '@/components/dashboard/client-dashboard'
import { useRouter } from 'next/navigation'

interface PageProps {
  params: {
    slug: string
  }
}

export default function ClientDashboardPage({ params }: PageProps) {
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadClient() {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Get client data
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('brand_slug', params.slug)
          .single()

        if (clientError || !clientData) {
          router.push('/not-found')
          return
        }

        setClient(clientData)
      } catch (error) {
        console.error('Error loading client:', error)
        router.push('/not-found')
      } finally {
        setLoading(false)
      }
    }

    loadClient()
  }, [params.slug, router])

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

