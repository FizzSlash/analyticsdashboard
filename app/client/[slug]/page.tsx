'use client'

import { useEffect, useState } from 'react'
import { ModernDashboard } from '@/components/dashboard/modern-dashboard'
import { CleanPortalDashboard } from '@/components/portal/clean-portal-dashboard'
import { ViewToggle, type ViewMode } from '@/components/ui/view-toggle'
import { useRouter } from 'next/navigation'

interface PageProps {
  params: {
    slug: string
  }
}

interface DashboardData {
  client: any
  data: {
    summary: any
    campaigns: any[]
    flows: any[]
    audience: any[]
    revenue: any[]
    topCampaigns: any[]
    topFlows: any[]
  }
}

export default function ClientDashboardPage({ params }: PageProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('analytics')
  const router = useRouter()

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
    async function fetchDashboardData() {
      console.log('CLIENT DASHBOARD: Starting dashboard data fetch for slug:', params.slug)
      
      try {
        const response = await fetch(`/api/dashboard?clientSlug=${params.slug}&timeframe=365`)
        const result = await response.json()

        console.log('CLIENT DASHBOARD: API response:', result)

        if (!response.ok) {
          if (response.status === 404) {
            console.log('CLIENT DASHBOARD: Client not found, redirecting to not-found')
            router.push('/not-found')
            return
          }
          throw new Error(result.message || 'Failed to fetch dashboard data')
        }

        console.log('CLIENT DASHBOARD: Setting dashboard data')
        setDashboardData(result)
      } catch (error) {
        console.error('CLIENT DASHBOARD: Error fetching dashboard data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load dashboard data')
      } finally {
        console.log('CLIENT DASHBOARD: Setting loading to false')
        setLoading(false)
      }
    }

    fetchDashboardData()
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

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">No dashboard data available</p>
        </div>
      </div>
    )
  }

  const client = dashboardData.client

  return (
    <div 
      className="min-h-screen relative"
      style={{
        background: `linear-gradient(135deg, ${client.primary_color || '#3B82F6'} 0%, ${client.secondary_color || '#1D4ED8'} 100%)`
      }}
    >
      {/* Background Image Overlay (only if explicitly set) */}
      {(client.background_image_url || process.env.NEXT_PUBLIC_PORTAL_BACKGROUND_IMAGE_URL) && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${
              client.background_image_url || 
              process.env.NEXT_PUBLIC_PORTAL_BACKGROUND_IMAGE_URL
            })`,
            opacity: parseFloat(process.env.NEXT_PUBLIC_PORTAL_BACKGROUND_OPACITY || '0.15')
          }}
        />
      )}
      
      {/* Header with View Toggle */}
      <div className="py-6 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Logo */}
              {client.logo_url && (
                <img 
                  src={client.logo_url} 
                  alt={`${client.brand_name} logo`}
                  className="h-12 w-auto"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold mb-2 text-white">{client.brand_name}</h1>
                <p className="text-blue-100 text-lg">
                  {viewMode === 'analytics' ? 'Email Marketing Analytics Dashboard' : 'Campaign & Flow Portal'}
                </p>
              </div>
            </div>
            
            <ViewToggle 
              currentMode={viewMode}
              onModeChange={setViewMode}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {viewMode === 'analytics' ? (
          <ModernDashboard client={client} data={dashboardData.data} disablePortalMode={true} />
        ) : (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <CleanPortalDashboard 
              user={{ client: client }}
              userRole="client_user"
            />
          </div>
        )}
      </div>
    </div>
  )
}

