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
import { FlowManager } from '@/components/ops/flow-manager'
import { RoleViewsCalendar } from '@/components/ops/role-views-calendar'
import { PopupManager } from '@/components/ops/popup-manager'
import { CampaignDetailModal } from '@/components/ops/campaign-detail-modal'
import { AIPromptsSettings } from '@/components/ops/ai-prompts-settings'
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
  TestTube,
  Eye,
  MousePointer
} from 'lucide-react'

type OpsTab = 'overview' | 'campaigns' | 'flows' | 'popups' | 'content' | 'forms' | 'abtests' | 'view' | 'scope' | 'settings'
type CampaignView = 'calendar' | 'pipeline'

interface Campaign {
  id: string
  campaign_name: string
  client_id: string
  client_name: string
  client_color: string
  send_date: Date
  status: 'strategy' | 'copy' | 'design' | 'ready_for_imp_qa' | 'qa' | 'client_approval' | 'approved' | 'scheduled' | 'sent' | 'revisions'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  campaign_type: 'email' | 'plaintext' | 'sms'
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
  const [sharedFlows, setSharedFlows] = useState<any[]>([]) // Shared flows data
  const [selectedCampaignForModal, setSelectedCampaignForModal] = useState<Campaign | null>(null)
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useAuth()

  // Main tabs - core workflow
  const mainTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'campaigns', label: 'Campaigns', icon: Calendar },
    { id: 'flows', label: 'Flows', icon: Zap },
    { id: 'popups', label: 'Popups', icon: MousePointer },
    { id: 'abtests', label: 'A/B Tests', icon: TestTube }
  ]

  // Secondary tabs - admin/resources
  const secondaryTabs = [
    { id: 'content', label: 'Content Hub', icon: FolderOpen },
    { id: 'forms', label: 'Forms', icon: FileText },
    { id: 'view', label: 'View', icon: Eye },
    { id: 'scope', label: 'Scope', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  useEffect(() => {
    async function loadData() {
      try {
        console.log('OPS: Loading operations dashboard for agency:', params.slug)

        // Wait for auth to finish loading
        if (authLoading) {
          return
        }

        // Require authentication for Ops page
        if (!user) {
          console.log('OPS: No user, redirecting to login')
          router.push(`/login?redirectTo=/agency/${params.slug}/ops`)
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
          // Filter to only clients with portal enabled
          const portalClients = (clientsData || []).filter((c: any) => c.enable_portal !== false)
          setClients(portalClients)
          
          // Fetch real campaigns from database
          try {
            const campaignsResponse = await fetch(`/api/ops/campaigns?clientId=all`)
            const campaignsData = await campaignsResponse.json()
            
            if (campaignsData.success && campaignsData.campaigns) {
              const transformedCampaigns = campaignsData.campaigns.map((c: any) => ({
                ...c,
                send_date: new Date(c.send_date),
                client_name: portalClients.find((cl: any) => cl.id === c.client_id)?.brand_name || 'Unknown',
                client_color: portalClients.find((cl: any) => cl.id === c.client_id)?.primary_color || '#3B82F6'
              }))
              setSharedCampaigns(transformedCampaigns)
              console.log('✅ OPS: Loaded', transformedCampaigns.length, 'campaigns')
            }
            
            const flowsResponse = await fetch(`/api/ops/flows?clientId=all`)
            const flowsData = await flowsResponse.json()
            
            if (flowsData.success && flowsData.flows) {
              setSharedFlows(flowsData.flows)
              console.log('✅ OPS: Loaded', flowsData.flows.length, 'flows')
            }
          } catch (err) {
            console.error('❌ Error fetching campaigns/flows:', err)
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
            {/* Main Tabs */}
            <div className="flex gap-2 p-2 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
              {mainTabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as OpsTab)}
                    className={`
                      flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300
                      ${activeTab === tab.id 
                        ? 'bg-white/30 text-white shadow-lg border border-white/40' 
                        : 'text-white/80 hover:text-white hover:bg-white/15'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Secondary Tabs (Smaller) */}
            <div className="flex gap-2 p-1.5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20">
              {secondaryTabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as OpsTab)}
                    className={`
                      flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all
                      ${activeTab === tab.id 
                        ? 'bg-white/20 text-white border border-white/30' 
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                      }
                    `}
                    title={tab.label}
                  >
                    <Icon className="h-3.5 w-3.5" />
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

          {/* Flows Tab */}
          {activeTab === 'flows' && (
            <FlowManager
              clients={clients}
              selectedClient={selectedClient}
            />
          )}

          {/* Content Hub Tab */}
          {/* Popups Tab */}
          {activeTab === 'popups' && (
            <PopupManager
              clients={clients}
              selectedClient={selectedClient}
            />
          )}

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

          {/* View Tab (Role Dashboards) */}
          {activeTab === 'view' && (
            <RoleViewsCalendar
              clients={clients}
              campaigns={sharedCampaigns}
              flows={sharedFlows}
              selectedClient={selectedClient}
              onCampaignClick={(campaign) => {
                console.log('🎯 Campaign clicked in View tab:', campaign)
                setSelectedCampaignForModal(campaign)
              }}
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

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <AIPromptsSettings agencyId={agency?.id || ''} />
          )}

        </div>
      </div>

      {/* Campaign Detail Modal (for clicking campaigns in View tab) */}
      {selectedCampaignForModal && (
        <CampaignDetailModal
          campaign={selectedCampaignForModal}
          clients={clients}
          onClose={() => setSelectedCampaignForModal(null)}
          onSave={async (updatedCampaign) => {
            // Save campaign
            try {
              const response = await fetch('/api/ops/campaigns', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedCampaign)
              })
              const data = await response.json()
              if (data.success) {
                // Refresh campaigns
                const refreshRes = await fetch(`/api/ops/campaigns?clientId=${selectedClient}`)
                const refreshData = await refreshRes.json()
                if (refreshData.success) {
                  setSharedCampaigns(refreshData.campaigns.map((c: any) => ({
                    ...c,
                    send_date: new Date(c.send_date),
                    client_name: clients.find(cl => cl.id === c.client_id)?.brand_name || 'Unknown',
                    client_color: clients.find(cl => cl.id === c.client_id)?.primary_color || '#3B82F6'
                  })))
                }
                setSelectedCampaignForModal(null)
              }
            } catch (error) {
              console.error('Error saving campaign:', error)
              alert('Failed to save campaign')
            }
          }}
          onDelete={async (campaignId) => {
            if (confirm('Delete this campaign?')) {
              try {
                const response = await fetch(`/api/ops/campaigns?id=${campaignId}`, {
                  method: 'DELETE'
                })
                if (response.ok) {
                  setSharedCampaigns(sharedCampaigns.filter(c => c.id !== campaignId))
                  setSelectedCampaignForModal(null)
                }
              } catch (error) {
                console.error('Error deleting campaign:', error)
              }
            }
          }}
        />
      )}
    </div>
  )
}

