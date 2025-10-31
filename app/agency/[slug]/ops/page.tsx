'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, ArrowLeft } from 'lucide-react'

interface PageProps {
  params: {
    slug: string
  }
}

export default function OperationsPage({ params }: PageProps) {
  const [agency, setAgency] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { supabase, loading: authLoading } = useAuth()

  useEffect(() => {
    async function loadData() {
      try {
        console.log('OPS: Loading operations dashboard for agency:', params.slug)

        // Wait for auth to finish loading
        if (authLoading) {
          return
        }

        if (!supabase) {
          console.error('Supabase client not available')
          setError('Database connection failed. Please check configuration.')
          setLoading(false)
          return
        }

        // Get agency data using slug from URL (same as admin page)
        const { data: agencyData, error: agencyError } = await supabase
          .from('agencies')
          .select('*')
          .eq('agency_slug', params.slug)
          .single()

        console.log('OPS: Agency data:', { agencyData, agencyError })

        if (agencyError || !agencyData) {
          console.error('OPS: Agency not found')
          setError('Agency not found')
          setLoading(false)
          return
        }

        setAgency(agencyData)

        // Get all clients for this agency
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('*')
          .eq('agency_id', agencyData.id)
          .order('brand_name', { ascending: true })

        console.log('OPS: Clients loaded:', { count: clientsData?.length, clientsError })

        if (clientsError) {
          console.error('OPS: Error loading clients:', clientsError)
          setError('Failed to load clients')
        } else {
          setClients(clientsData || [])
        }

      } catch (error) {
        console.error('OPS: Error loading data:', error)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.slug, supabase, authLoading])

  // Use agency branding colors (same pattern as client dashboard)
  const primaryColor = agency?.primary_color || '#3B82F6'
  const secondaryColor = agency?.secondary_color || '#1D4ED8'
  const backgroundImage = agency?.background_image_url

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading operations dashboard...</p>
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
            onClick={() => router.push(`/agency/${params.slug}/admin`)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Admin Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen relative"
      style={{
        background: backgroundImage 
          ? `url(${backgroundImage}) center/cover fixed, ${primaryColor}`
          : `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
      }}
    >
      {/* Header */}
      <div className="py-6 relative z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Back Button */}
              <button
                onClick={() => router.push(`/agency/${params.slug}/admin`)}
                className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors border border-white/20"
                title="Back to admin"
              >
                <ArrowLeft className="h-5 w-5 text-white" />
              </button>

              {/* Title */}
              <div>
                <h1 className="text-3xl font-bold text-white">Operations Dashboard</h1>
                <p className="text-blue-100 text-lg">
                  {agency?.agency_name || 'Agency'} • Internal campaign & workflow management
                </p>
              </div>
            </div>
            
            {/* Stats Badge */}
            <div className="flex items-center gap-4">
              <div className="bg-white/15 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2">
                <div className="text-white/80 text-sm">Active Clients</div>
                <div className="text-white text-2xl font-bold">{clients.length}</div>
              </div>

              {/* Settings Icon */}
              <button 
                onClick={() => router.push(`/agency/${params.slug}/admin`)}
                className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-colors border border-white/20"
                title="Agency settings"
              >
                <Settings className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          {/* Welcome Card */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white text-xl">
                Welcome to the Operations Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-white/80">
                <p className="mb-4">
                  This is your internal workspace for managing campaigns, workflows, and team operations.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="text-white font-semibold mb-2">📅 Campaign Management</div>
                    <div className="text-white/70 text-sm">
                      View calendar, manage pipeline, track status
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="text-white font-semibold mb-2">🗂️ Content Hub</div>
                    <div className="text-white/70 text-sm">
                      Store assets, guidelines, and client notes
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="text-white font-semibold mb-2">📊 Scope Tracking</div>
                    <div className="text-white/70 text-sm">
                      Monitor monthly usage and limits
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clients List (Temporary - will be replaced with tabs) */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl mt-6">
            <CardHeader>
              <CardTitle className="text-white">Your Clients ({clients.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {clients.length === 0 ? (
                <div className="text-white/60 text-center py-8">
                  <p>No clients found. Add clients in the agency admin dashboard.</p>
                  <button
                    onClick={() => router.push(`/agency/${params.slug}/admin`)}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Go to Admin Dashboard
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clients.map((client) => (
                    <div
                      key={client.id}
                      className="bg-white/5 hover:bg-white/10 p-4 rounded-lg border border-white/20 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                          style={{ 
                            backgroundColor: client.primary_color || primaryColor
                          }}
                        >
                          {client.brand_name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{client.brand_name}</h3>
                          <p className="text-white/60 text-sm">{client.brand_slug}</p>
                        </div>
                      </div>
                      <div className="text-white/40 text-xs mt-2">
                        Click to manage campaigns →
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Info */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              🚧 Task 1 Complete • Tabs and features coming in Tasks 2-20...
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

