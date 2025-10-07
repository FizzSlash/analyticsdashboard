'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ModernDashboard } from '@/components/dashboard/modern-dashboard'
import { Loader2, Lock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function SharedDashboardPage() {
  const params = useParams()
  const token = params.token as string
  
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSharedDashboard = async () => {
      try {
        const response = await fetch(`/api/share/${token}`)
        const result = await response.json()

        if (!response.ok) {
          setError(result.error || 'Failed to load dashboard')
          return
        }

        setDashboardData(result)
      } catch (err) {
        setError('Failed to load shared dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchSharedDashboard()
  }, [token])

  // Use agency colors for loading state (fallback if not loaded yet)
  const primaryColor = dashboardData?.agency?.primary_color || '#110E12'
  const secondaryColor = dashboardData?.agency?.secondary_color || '#23154B'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
      }}>
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-12">
            <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
            <p className="text-white/80 text-center">Loading shared dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-md">
          <CardContent className="p-12 text-center">
            <Lock className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-white/70 mb-4">{error}</p>
            <p className="text-white/50 text-sm">
              This link may have expired or been disabled. Contact the dashboard owner for access.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!dashboardData) {
    return null
  }

  const client = dashboardData.client
  const agency = dashboardData.agency
  const primaryColor = agency?.primary_color || '#110E12'
  const secondaryColor = agency?.secondary_color || '#23154B'
  const backgroundImage = agency?.background_image_url

  return (
    <div 
      className="min-h-screen"
      style={{
        background: backgroundImage 
          ? `url(${backgroundImage}) center/cover fixed, ${primaryColor}`
          : `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
      }}
    >
      {/* Header with "Shared Dashboard" badge */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              {agency?.logo_url && (
                <img src={agency.logo_url} alt="" className="h-8 w-auto mb-2" />
              )}
              <h1 className="text-2xl font-bold text-white">{client.brand_name}</h1>
              <p className="text-white/60 text-sm">Email Marketing Analytics</p>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20">
              <p className="text-white/80 text-sm font-medium">📊 Shared Dashboard (Read-Only)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <ModernDashboard 
        client={{ ...client, ...agency }}
        data={dashboardData.data}
        timeframe={365}
        disablePortalMode={true}
        hideHeader={true}
      />
    </div>
  )
}

