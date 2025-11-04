'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { OpsCalendar } from '@/components/ops/ops-calendar'
import { OpsPipeline } from '@/components/ops/ops-pipeline'
import { OpsOverview } from '@/components/ops/ops-overview'
import { FlowManager } from '@/components/ops/flow-manager'
import { PopupManager } from '@/components/ops/popup-manager'
import { ContentHub } from '@/components/ops/content-hub'
import { OpsForms } from '@/components/ops/ops-forms'
import { ABTestTracker } from '@/components/ops/ab-test-tracker'
import { ScopeTracker } from '@/components/ops/scope-tracker'
import { RoleViewsCalendar } from '@/components/ops/role-views-calendar'
import { CampaignDetailModal } from '@/components/ops/campaign-detail-modal'
import { AIPromptsSettings } from '@/components/ops/ai-prompts-settings'
import { Loader2, Lock, Calendar, Columns, BarChart3, Zap, MousePointer, FolderOpen, FileText, TestTube, Eye, Target, Settings } from 'lucide-react'

type OpsTab = 'overview' | 'campaigns' | 'flows' | 'popups' | 'content' | 'forms' | 'abtests' | 'view' | 'scope' | 'settings'

export default function OpsSharePage() {
  const params = useParams()
  const token = params.token as string
  
  const [agency, setAgency] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<OpsTab>('campaigns')
  const [campaignView, setCampaignView] = useState<'calendar' | 'pipeline'>('calendar')
  const [selectedClient, setSelectedClient] = useState<string>('all')
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [flows, setFlows] = useState<any[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null)

  useEffect(() => {
    fetchOpsData()
  }, [token])
  
  // Refetch campaigns/flows when client selection changes
  useEffect(() => {
    if (clients.length > 0) {
      fetchCampaignsAndFlows()
    }
  }, [selectedClient, clients])

  const fetchOpsData = async () => {
    try {
      const response = await fetch(`/api/ops-share/${token}`)
      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Invalid or expired share link')
        return
      }

      setAgency(result.agency)
      setClients(result.clients)
      
      // Fetch campaigns and flows for all views
      if (result.clients && result.clients.length > 0) {
        await fetchCampaignsAndFlows()
      }
    } catch (err) {
      setError('Failed to load Ops dashboard')
    } finally {
      setLoading(false)
    }
  }
  
  const fetchCampaignsAndFlows = async () => {
    try {
      // Fetch campaigns
      const campaignsRes = await fetch(`/api/ops/campaigns?clientId=${selectedClient}`)
      const campaignsData = await campaignsRes.json()
      if (campaignsData.success) {
        // Transform campaigns to match expected format (same as main ops page)
        const transformedCampaigns = campaignsData.campaigns.map((c: any) => ({
          ...c,
          send_date: new Date(c.send_date), // Convert string to Date object
          client_name: clients.find(cl => cl.id === c.client_id)?.brand_name || 'Unknown',
          client_color: clients.find(cl => cl.id === c.client_id)?.primary_color || '#3B82F6'
        }))
        setCampaigns(transformedCampaigns)
      }
      
      // Fetch flows
      const flowsRes = await fetch(`/api/ops/flows?clientId=${selectedClient}`)
      const flowsData = await flowsRes.json()
      if (flowsData.success) {
        setFlows(flowsData.flows || [])
      }
    } catch (error) {
      console.error('Error fetching campaigns/flows:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md border-white/20 rounded-xl p-12 text-center max-w-md">
          <Lock className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-white/70">{error}</p>
        </div>
      </div>
    )
  }

  const primaryColor = agency?.primary_color || '#3B82F6'
  const secondaryColor = agency?.secondary_color || '#1D4ED8'

  return (
    <div className="min-h-screen" style={{
      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
    }}>
      {/* Header */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-white">Operations Dashboard</h1>
          <p className="text-white/70">{agency?.agency_name} • Shared Access (Read/Edit)</p>
        </div>
      </div>

      {/* Tabs & Client Selector */}
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <div className="flex items-center justify-between gap-4">
          {/* Main Tabs */}
          <div className="flex gap-2 p-2 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'campaigns', label: 'Campaigns', icon: Calendar },
              { id: 'flows', label: 'Flows', icon: Zap },
              { id: 'popups', label: 'Popups', icon: MousePointer },
              { id: 'abtests', label: 'A/B Tests', icon: TestTube }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as OpsTab)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-white/30 text-white shadow-lg border border-white/40' 
                      : 'text-white/80 hover:text-white hover:bg-white/15'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Secondary Tabs */}
          <div className="flex gap-2 p-1.5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20">
            {[
              { id: 'content', label: 'Content', icon: FolderOpen },
              { id: 'forms', label: 'Forms', icon: FileText },
              { id: 'view', label: 'View', icon: Eye },
              { id: 'scope', label: 'Scope', icon: Target },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as OpsTab)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab.id 
                      ? 'bg-white/20 text-white border border-white/30' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
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
              className="bg-transparent text-white font-semibold border-none focus:ring-0 cursor-pointer"
            >
              <option value="all" className="bg-gray-800">All Clients</option>
              {clients.map(client => (
                <option key={client.id} value={client.id} className="bg-gray-800">
                  {client.brand_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && <OpsOverview clients={clients} selectedClient={selectedClient} campaigns={campaigns} onCampaignClick={(campaign) => console.log('Campaign clicked:', campaign)} />}
        
        {activeTab === 'campaigns' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setCampaignView('calendar')}
                className={`px-4 py-2 rounded-lg ${campaignView === 'calendar' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70'}`}
              >
                Calendar
              </button>
              <button
                onClick={() => setCampaignView('pipeline')}
                className={`px-4 py-2 rounded-lg ${campaignView === 'pipeline' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70'}`}
              >
                Pipeline
              </button>
            </div>
            {campaignView === 'calendar' ? (
              <OpsCalendar clients={clients} selectedClient={selectedClient} />
            ) : (
              <OpsPipeline clients={clients} selectedClient={selectedClient} />
            )}
          </div>
        )}
        
        {activeTab === 'flows' && <FlowManager clients={clients} selectedClient={selectedClient} />}
        {activeTab === 'popups' && <PopupManager clients={clients} selectedClient={selectedClient} />}
        {activeTab === 'content' && <ContentHub clients={clients} selectedClient={selectedClient} />}
        {activeTab === 'forms' && <OpsForms clients={clients} selectedClient={selectedClient} />}
        {activeTab === 'abtests' && <ABTestTracker clients={clients} selectedClient={selectedClient} campaigns={campaigns} />}
        {activeTab === 'view' && (
          <RoleViewsCalendar 
            clients={clients} 
            campaigns={campaigns} 
            flows={flows} 
            selectedClient={selectedClient}
            onCampaignClick={(campaign) => {
              console.log('🎯 Opening campaign modal:', campaign)
              setSelectedCampaign(campaign)
            }}
          />
        )}
        {activeTab === 'scope' && <ScopeTracker clients={clients} selectedClient={selectedClient} campaigns={campaigns} />}
        {activeTab === 'settings' && <AIPromptsSettings agencyId={agency?.id || ''} />}
      </div>

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <CampaignDetailModal
          campaign={selectedCampaign}
          clients={clients}
          onClose={() => setSelectedCampaign(null)}
          onSave={async (updatedCampaign) => {
            try {
              const response = await fetch('/api/ops/campaigns', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedCampaign)
              })
              const data = await response.json()
              if (data.success) {
                // Refresh campaigns
                await fetchCampaignsAndFlows()
                setSelectedCampaign(null)
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
                  setCampaigns(campaigns.filter(c => c.id !== campaignId))
                  setSelectedCampaign(null)
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

