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
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [canSync, setCanSync] = useState(true)
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [syncProgress, setSyncProgress] = useState({
    step: 0,
    total: 4,
    currentTask: '',
    completed: [] as string[],
    failed: [] as string[]
  })
  const router = useRouter()

  // Check if client can sync (once per day limit)
  const checkSyncEligibility = () => {
    const lastSyncKey = `lastSync_${params.slug}`
    const lastSync = localStorage.getItem(lastSyncKey)
    
    if (!lastSync) return true
    
    const lastSyncTime = new Date(lastSync)
    const now = new Date()
    const hoursSinceLastSync = (now.getTime() - lastSyncTime.getTime()) / (1000 * 60 * 60)
    
    return hoursSinceLastSync >= 24 // Can sync if 24+ hours
  }

  const getNextSyncTime = () => {
    const lastSyncKey = `lastSync_${params.slug}`
    const lastSync = localStorage.getItem(lastSyncKey)
    
    if (!lastSync) return null
    
    const lastSyncTime = new Date(lastSync)
    const nextSyncTime = new Date(lastSyncTime.getTime() + 24 * 60 * 60 * 1000)
    
    return nextSyncTime
  }

  const handleSync = async () => {
    if (!checkSyncEligibility()) {
      const nextSync = getNextSyncTime()
      setSyncMessage(`⏱️ You can sync again after ${nextSync?.toLocaleString()}`)
      setTimeout(() => setSyncMessage(null), 5000)
      return
    }

    setSyncing(true)
    setShowSyncModal(true)
    setSyncMessage(null)
    setSyncProgress({ step: 0, total: 1, currentTask: '', completed: [], failed: [] })
    
    // Use single comprehensive sync endpoint
    const syncTasks = [
      { name: 'All Data (Campaigns, Flows, List Growth, Revenue)', api: '/api/sync' }
    ]

    try {
      const task = syncTasks[0]
      setSyncProgress(prev => ({ ...prev, step: 1, currentTask: task.name }))

      const response = await fetch(task.api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: params.slug })
      })

      if (!response.ok) {
        throw new Error('Sync failed')
      }

      setSyncProgress(prev => ({ ...prev, completed: [task.name] }))

      // Update last sync time only on success
      const lastSyncKey = `lastSync_${params.slug}`
      localStorage.setItem(lastSyncKey, new Date().toISOString())
      setCanSync(false)
      
      setSyncMessage('✅ Sync completed! Refreshing dashboard...')
      
      // Wait to show results, then refresh
      setTimeout(() => {
        window.location.reload()
      }, 3000)
    } catch (err) {
      console.error('Sync error:', err)
      setSyncProgress(prev => ({ ...prev, failed: ['All Data'] }))
      setSyncMessage('❌ Sync failed. Please try again later.')
      
      // Don't update last sync time on failure - allow immediate retry
      setTimeout(() => {
        setShowSyncModal(false)
        setSyncMessage(null)
      }, 5000)
    } finally {
      setSyncing(false)
    }
  }

  // Check sync eligibility on load
  useEffect(() => {
    setCanSync(checkSyncEligibility())
  }, [])

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
                  {/* Sync Button with Once-Per-Day Limit */}
                  <button
                    onClick={handleSync}
                    disabled={syncing || !canSync}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
                      canSync 
                        ? 'bg-blue-500/20 hover:bg-blue-500/30 text-white border border-blue-400/30' 
                        : 'bg-white/10 text-white/50 cursor-not-allowed'
                    }`}
                    title={canSync ? 'Sync all data from Klaviyo (once per day)' : 'Sync limit reached (once per 24 hours)'}
                  >
                    <svg className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {syncing ? 'Syncing...' : canSync ? 'Sync Data' : 'Synced'}
                  </button>
                </>
              )}
            </div>
            
            {/* Sync Status Modal */}
            {showSyncModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Syncing Data from Klaviyo
                  </h3>
                  
                  <div className="space-y-4 mb-6">
                    {/* Single Progress Item - All Data Sync */}
                    {syncProgress.completed.length > 0 ? (
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium text-green-700">
                            Syncing Campaigns, Flows, List Growth & Revenue
                          </span>
                        </div>
                        <span className="text-xs text-green-600">✓ Done</span>
                      </div>
                    ) : syncProgress.failed.length > 0 ? (
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium text-red-700">
                            Sync Failed - Please try again
                          </span>
                        </div>
                        <span className="text-xs text-red-600">✗ Error</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-blue-700">
                            Syncing Campaigns, Flows, List Growth & Revenue
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            This may take 30-60 seconds...
                          </p>
                        </div>
                        <span className="text-xs text-blue-600">⏳ In progress...</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          syncProgress.failed.length > 0 ? 'bg-red-600' : 'bg-blue-600'
                        }`}
                        style={{ width: syncProgress.completed.length > 0 ? '100%' : syncing ? '75%' : '0%' }}
                      />
                    </div>
                  </div>
                  
                  {syncMessage && (
                    <div className="text-center text-sm font-medium text-green-700 bg-green-50 rounded-lg py-3">
                      {syncMessage}
                    </div>
                  )}
                </div>
              </div>
            )}
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

