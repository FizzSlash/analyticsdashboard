'use client'

import { useEffect, useState } from 'react'
import { ModernDashboard } from '@/components/dashboard/modern-dashboard'
import { CleanPortalDashboard } from '@/components/portal/clean-portal-dashboard'
import { ViewToggle, type ViewMode } from '@/components/ui/view-toggle'
import { TimeframeSelector } from '@/components/ui/timeframe-selector'
import { useRouter } from 'next/navigation'

interface PageProps {
  params: {
    slug: string
  }
}

interface DashboardData {
  client: any
  agency: any // Agency branding data
  data: {
    summary: any
    campaigns: any[]
    flows: any[]
    audience: any[]
    revenue: any[]
    topCampaigns: any[]
    topFlows: any[]
    // Add new data fields for comprehensive timeframe filtering
    flowMessages: any[]
    revenueAttributionMetrics: any[]
    listGrowthMetrics: any[]
    flowWeeklyTrends: any[]
  }
}

export default function ClientDashboardPage({ params }: PageProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('analytics')
  const [selectedTimeframe, setSelectedTimeframe] = useState<number>(30) // Default to 30 days
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
        const response = await fetch(`/api/dashboard?clientSlug=${params.slug}&timeframe=365`) // Load comprehensive dataset for client-side filtering
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
  const agency = dashboardData.agency

  // Use agency branding (colors, background)
  const primaryColor = agency?.primary_color || '#3B82F6'
  const secondaryColor = agency?.secondary_color || '#1D4ED8'
  const backgroundImage = agency?.background_image_url

  // Debug: Log the colors being used
  console.log('🎨 AGENCY BRANDING DEBUG:', {
    agency_name: agency?.agency_name,
    primary_color: primaryColor,
    secondary_color: secondaryColor,
    background_image: backgroundImage,
    final_gradient: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
  })

  return (
    <div 
      className="min-h-screen relative"
      style={{
        background: backgroundImage 
          ? `url(${backgroundImage}) center/cover fixed, ${primaryColor}` // Image with color fallback
          : `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` // Color gradient only
      }}
    >
      
      {/* Header with View Toggle */}
      <div className="py-6 relative z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Logo removed per user request */}
              <div>
                <h1 className="text-3xl font-bold mb-2 text-white">{client.brand_name}</h1>
                <p className="text-blue-100 text-lg">
                  {viewMode === 'analytics' ? 'Email Marketing Analytics Dashboard' : 'Campaign & Flow Portal'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <ViewToggle 
                currentMode={viewMode}
                onModeChange={setViewMode}
              />
              {viewMode === 'analytics' && (
                <>
                  <TimeframeSelector 
                    selectedTimeframe={selectedTimeframe}
                    onTimeframeChange={(days: number) => {
                      console.log('🎯 CLIENT PAGE: Timeframe changed from', selectedTimeframe, 'to', days)
                      setSelectedTimeframe(days)
                      console.log('🎯 CLIENT PAGE: State updated, will trigger ModernDashboard re-render')
                    }}
                  />
                  {/* Clear Cache Button (Debug Tool) */}
                  <button
                    onClick={() => {
                      console.log('🗑️ Clearing dashboard cache and reloading')
                      window.location.reload()
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                    title="Clear cache and reload data"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Clear Cache
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {viewMode === 'analytics' ? (
          <ModernDashboard 
            client={{ ...client, ...agency }} // Merge client data with agency branding
            data={dashboardData.data} 
            timeframe={selectedTimeframe}
            disablePortalMode={true} 
            hideHeader={true} 
          />
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

