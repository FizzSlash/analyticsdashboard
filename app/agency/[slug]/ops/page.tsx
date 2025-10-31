'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OpsCalendar } from '@/components/ops/ops-calendar'
import { OpsPipeline } from '@/components/ops/ops-pipeline'
import { OpsOverview } from '@/components/ops/ops-overview'
import { ContentHub } from '@/components/ops/content-hub'
import { OpsForms } from '@/components/ops/ops-forms'
import { ScopeTracker } from '@/components/ops/scope-tracker'
import { ABTestTracker } from '@/components/ops/ab-test-tracker'
import { 
  Settings, 
  ArrowLeft, 
  BarChart3, 
  Calendar, 
  Columns, 
  FolderOpen, 
  Target,
  X,
  Zap,
  FileText,
  TestTube
} from 'lucide-react'

type OpsTab = 'overview' | 'campaigns' | 'flows' | 'content' | 'forms' | 'abtests' | 'scope'
type CampaignView = 'calendar' | 'pipeline'

interface Campaign {
  id: string
  campaign_name: string
  client_id: string
  client_name: string
  client_color: string
  send_date: Date
  status: 'strategy' | 'copy' | 'design' | 'qa' | 'client_approval' | 'approved' | 'scheduled' | 'sent'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  campaign_type: 'email' | 'sms'
}

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
  const [activeTab, setActiveTab] = useState<OpsTab>('overview')
  const [campaignView, setCampaignView] = useState<CampaignView>('calendar')
  const [selectedClient, setSelectedClient] = useState<string>('all') // 'all' or client ID
  const [sharedCampaigns, setSharedCampaigns] = useState<Campaign[]>([]) // Shared across calendar/pipeline/overview
  const [selectedCampaignForModal, setSelectedCampaignForModal] = useState<Campaign | null>(null)
  const router = useRouter()
  const { supabase, loading: authLoading } = useAuth()

  // Define tabs (matching portal style)
  const opsTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'campaigns', label: 'Campaigns', icon: Calendar },
    { id: 'flows', label: 'Flows', icon: Zap },
    { id: 'content', label: 'Content Hub', icon: FolderOpen },
    { id: 'forms', label: 'Forms', icon: FileText },
    { id: 'abtests', label: 'A/B Tests', icon: TestTube },
    { id: 'scope', label: 'Scope', icon: Target }
  ]

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
          
          // Initialize mock campaigns (will be from database later)
          if (clientsData && clientsData.length > 0) {
            const mockCampaigns: Campaign[] = [
              {
                id: '1',
                campaign_name: 'Black Friday Launch',
                client_id: clientsData[0]?.id || '1',
                client_name: clientsData[0]?.brand_name || 'Client',
                client_color: clientsData[0]?.primary_color || '#3B82F6',
                send_date: new Date(2025, 10, 24, 9, 0),
                status: 'design',
                priority: 'urgent',
                campaign_type: 'email'
              },
              {
                id: '2',
                campaign_name: 'Welcome Series',
                client_id: clientsData[1]?.id || clientsData[0]?.id,
                client_name: clientsData[1]?.brand_name || clientsData[0]?.brand_name,
                client_color: clientsData[1]?.primary_color || '#10B981',
                send_date: new Date(2025, 10, 28, 14, 0),
                status: 'qa',
                priority: 'normal',
                campaign_type: 'email'
              },
              {
                id: '3',
                campaign_name: 'Product Launch',
                client_id: clientsData[2]?.id || clientsData[0]?.id,
                client_name: clientsData[2]?.brand_name || clientsData[0]?.brand_name,
                client_color: clientsData[2]?.primary_color || '#8B5CF6',
                send_date: new Date(2025, 10, 30, 10, 0),
                status: 'client_approval',
                priority: 'high',
                campaign_type: 'email'
              }
            ]
            setSharedCampaigns(mockCampaigns)
          }
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
          
          {/* Navigation Tabs & Client Selector */}
          <div className="flex items-center justify-between gap-4 mb-6">
            {/* Tabs */}
            <div className="flex gap-3 p-2 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg flex-1">
              {opsTabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as OpsTab)}
                    className={`
                      flex items-center gap-3 px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-300 backdrop-blur-sm
                      ${activeTab === tab.id 
                        ? 'bg-white/30 text-white shadow-lg border border-white/40 transform scale-105' 
                        : 'text-white/80 hover:text-white hover:bg-white/15 hover:scale-102 hover:shadow-md'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Client Selector */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2 shadow-lg">
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg px-4 py-3 pr-10 font-semibold focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/40 cursor-pointer min-w-[200px]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.25rem',
                  appearance: 'none'
                }}
              >
                <option value="all" className="bg-gray-800 text-white">All Clients</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id} className="bg-gray-800 text-white">
                    {client.brand_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <OpsOverview
              clients={clients}
              selectedClient={selectedClient}
              campaigns={sharedCampaigns}
              onCampaignClick={(campaign: any) => setSelectedCampaignForModal(campaign)}
            />
          )}

          {/* Campaigns Tab (Calendar + Pipeline Toggle) */}
          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              {/* View Toggle */}
              <div className="flex justify-end">
                <div className="inline-flex gap-2 p-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                  <button
                    onClick={() => setCampaignView('calendar')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      campaignView === 'calendar'
                        ? 'bg-white/30 text-white shadow-lg'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Calendar View
                  </button>
                  <button
                    onClick={() => setCampaignView('pipeline')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      campaignView === 'pipeline'
                        ? 'bg-white/30 text-white shadow-lg'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Columns className="h-4 w-4 inline mr-2" />
                    Pipeline View
                  </button>
                </div>
              </div>

              {/* Show either calendar or pipeline */}
              {campaignView === 'calendar' ? (
                <OpsCalendar 
                  clients={clients}
                  selectedClient={selectedClient}
                />
              ) : (
                <OpsPipeline 
                  clients={clients}
                  selectedClient={selectedClient}
                />
              )}
            </div>
          )}

          {/* Flows Tab (Placeholder for future) */}
          {activeTab === 'flows' && (
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Flow Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-white/60 text-center py-12">
                  <Zap className="h-16 w-16 mx-auto mb-4 text-white/40" />
                  <p className="text-lg">Flow pipeline coming after campaigns are complete</p>
                  <p className="text-sm mt-2">Will track flow creation, approval, and performance</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Content Hub Tab */}
          {activeTab === 'content' && (
            <ContentHub
              clients={clients}
              selectedClient={selectedClient}
            />
          )}

          {/* Forms Tab */}
          {activeTab === 'forms' && (
            <OpsForms
              clients={clients}
              selectedClient={selectedClient}
            />
          )}

          {/* A/B Tests Tab */}
          {activeTab === 'abtests' && (
            <ABTestTracker
              clients={clients}
              selectedClient={selectedClient}
              campaigns={sharedCampaigns}
            />
          )}

          {/* Scope Tab */}
          {activeTab === 'scope' && (
            <ScopeTracker
              clients={clients}
              selectedClient={selectedClient}
              campaigns={sharedCampaigns}
            />
          )}

        </div>
      </div>
    </div>
  )
}

