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
import { RoleViews } from '@/components/ops/role-views'
import { Loader2, Lock, Calendar, Columns, BarChart3, Zap, MousePointer, FolderOpen, FileText, TestTube, Eye, Target } from 'lucide-react'

type OpsTab = 'overview' | 'campaigns' | 'flows' | 'popups' | 'content' | 'forms' | 'abtests' | 'view' | 'scope'

export default function OpsSharePage() {
  const params = useParams()
  const token = params.token as string
  
  const [agency, setAgency] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<OpsTab>('campaigns')
  const [campaignView, setCampaignView] = useState<'calendar' | 'pipeline'>('calendar')

  useEffect(() => {
    fetchOpsData()
  }, [token])

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
    } catch (err) {
      setError('Failed to load Ops dashboard')
    } finally {
      setLoading(false)
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

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <div className="flex gap-2 p-2 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'campaigns', label: 'Campaigns', icon: Calendar },
            { id: 'flows', label: 'Flows', icon: Zap },
            { id: 'popups', label: 'Popups', icon: MousePointer },
            { id: 'abtests', label: 'A/B Tests', icon: TestTube },
            { id: 'content', label: 'Content', icon: FolderOpen },
            { id: 'forms', label: 'Forms', icon: FileText },
            { id: 'view', label: 'View', icon: Eye },
            { id: 'scope', label: 'Scope', icon: Target }
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
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && <OpsOverview clients={clients} selectedClient="all" campaigns={[]} onCampaignClick={() => {}} />}
        
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
              <OpsCalendar clients={clients} selectedClient="all" />
            ) : (
              <OpsPipeline clients={clients} selectedClient="all" />
            )}
          </div>
        )}
        
        {activeTab === 'flows' && <FlowManager clients={clients} selectedClient="all" />}
        {activeTab === 'popups' && <PopupManager clients={clients} selectedClient="all" />}
        {activeTab === 'content' && <ContentHub clients={clients} selectedClient="all" />}
        {activeTab === 'forms' && <OpsForms clients={clients} selectedClient="all" />}
        {activeTab === 'abtests' && <ABTestTracker clients={clients} selectedClient="all" campaigns={[]} />}
        {activeTab === 'view' && <RoleViews clients={clients} campaigns={[]} flows={[]} />}
        {activeTab === 'scope' && <ScopeTracker clients={clients} selectedClient="all" campaigns={[]} />}
      </div>
    </div>
  )
}

