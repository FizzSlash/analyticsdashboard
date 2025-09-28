'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CampaignBuilder } from '../portal/campaign-builder'
import { ABTestManager } from '../portal/ab-test-manager'
import { EnhancedRequests } from '../portal/enhanced-requests'
import { EnhancedLiveCalendar } from '../portal/enhanced-live-calendar'
import { 
  Plus, 
  Mail,
  Zap,
  TestTube,
  FileText,
  BarChart3,
  Settings,
  Users,
  Calendar,
  Target,
  TrendingUp,
  Eye,
  Edit,
  Send,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react'

interface PortalManagementProps {
  agency: any
  clients: any[]
}

type ManagementTab = 'overview' | 'livecalendar' | 'campaigns' | 'flows' | 'abtests' | 'requests' | 'templates'
type ManagementView = 'dashboard' | 'campaign-builder' | 'flow-builder'

export function PortalManagement({ agency, clients }: PortalManagementProps) {
  const [activeTab, setActiveTab] = useState<ManagementTab>('overview')
  const [currentView, setCurrentView] = useState<ManagementView>('dashboard')
  const [selectedClient, setSelectedClient] = useState<any>(clients[0] || null)
  const [loading, setLoading] = useState(false)

  const managementTabs = [
    { id: 'overview', label: 'Portal Overview', icon: BarChart3 },
    { id: 'livecalendar', label: 'Live Calendar', icon: Calendar },
    { id: 'campaigns', label: 'Campaign Creator', icon: Mail },
    { id: 'flows', label: 'Flow Creator', icon: Zap },
    { id: 'abtests', label: 'A/B Test Manager', icon: TestTube },
    { id: 'requests', label: 'Client Requests', icon: FileText },
    { id: 'templates', label: 'Templates & Assets', icon: Settings }
  ]

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Portal Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Pending Approvals</p>
                <p className="text-gray-900 text-2xl font-bold">7</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Active Requests</p>
                <p className="text-gray-900 text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TestTube className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Running Tests</p>
                <p className="text-gray-900 text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Send className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Campaigns Sent</p>
                <p className="text-gray-900 text-2xl font-bold">43</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Portal Activity */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Recent Client Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clients.slice(0, 5).map(client => (
              <div key={client.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {client.brand_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-medium">{client.brand_name}</h4>
                    <p className="text-gray-600 text-sm">2 pending approvals • Last activity 3h ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full border border-orange-200">
                    Needs Review
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions for Admins */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-gray-900 text-lg">Create Campaign</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm mb-4">
              Create new campaigns for client approval
            </p>
            <button 
              onClick={() => setCurrentView('campaign-builder')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Start Campaign
            </button>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TestTube className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-gray-900 text-lg">Manage A/B Tests</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm mb-4">
              Create and monitor A/B tests across clients
            </p>
            <button 
              onClick={() => setActiveTab('abtests')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Manage Tests
            </button>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-gray-900 text-lg">View Requests</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm mb-4">
              Review and process client campaign requests
            </p>
            <button 
              onClick={() => setActiveTab('requests')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              View Requests
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Live CRUD Features Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-gray-900">🔴 Live Calendar CRUD</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              <strong>Add, Edit, Delete campaigns</strong> live during client calls. No external dependencies - fully self-contained. Sync to Airtable after the call.
            </p>
            <div className="text-sm text-gray-600 mb-4">
              ✅ Real-time campaign creation<br/>
              ✅ Instant editing and deletion<br/>
              ✅ Status management<br/>
              ✅ Sync to Airtable when ready
            </div>
            <button 
              onClick={() => setActiveTab('livecalendar')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Open Live Calendar
            </button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-gray-900">📝 Multi-Type Requests</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              <strong>Enhanced request system</strong> for campaigns, flows, popups, and misc projects. Full lifecycle tracking.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
              <div>📧 Campaign Requests</div>
              <div>🔄 Flow Requests</div>
              <div>🎯 Popup Requests</div>
              <div>⚙️ Misc Requests</div>
            </div>
            <button 
              onClick={() => setActiveTab('requests')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Manage Requests
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderCampaignCreatorTab = () => (
    <div className="space-y-6">
      {/* Client Selector */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Create Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block text-white text-sm font-medium mb-2">Select Client</label>
            <select 
              value={selectedClient?.id || ''}
              onChange={(e) => setSelectedClient(clients.find(c => c.id === e.target.value))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.brand_name}</option>
              ))}
            </select>
          </div>
          
          {selectedClient && (
            <div className="text-white/60 text-sm">
              Creating campaign for: <span className="text-white font-medium">{selectedClient.brand_name}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Builder */}
      {selectedClient && currentView === 'campaign-builder' ? (
        <CampaignBuilder 
          onBack={() => setCurrentView('dashboard')}
          onSave={(campaign) => {
            console.log('Saving campaign for client:', selectedClient.brand_slug, campaign)
            setCurrentView('dashboard')
          }}
        />
      ) : (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8 text-center">
            <div className="p-4 bg-blue-500/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Mail className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">Campaign Creator</h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              Create campaigns that will be sent to clients for approval through their portal calendar.
            </p>
            <button 
              onClick={() => setCurrentView('campaign-builder')}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              Start Creating
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderFlowCreatorTab = () => (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Flow Creator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="p-4 bg-purple-500/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Zap className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">Flow Creator</h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              Create automated flows that clients can review and approve through their portal.
            </p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors">
              Create Flow
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      {/* Template Library Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Email Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/60 text-sm mb-4">
              Manage reusable email templates for campaigns and flows
            </p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
              Manage Templates
            </button>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Brand Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/60 text-sm mb-4">
              Upload and organize brand assets for all clients
            </p>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
              Manage Assets
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-gray-900">Portal Management</CardTitle>
            {selectedClient && (
              <div className="text-gray-600 text-sm">
                Active Client: <span className="text-gray-900 font-medium">{selectedClient.brand_name}</span>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {currentView === 'dashboard' ? (
        <>
          {/* Management Navigation */}
          <div className="flex flex-wrap gap-2">
            {managementTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ManagementTab)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border
                    ${activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-lg border-blue-600' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Management Content */}
          <div className="min-h-[600px]">
            {!loading && (
              <>
                {activeTab === 'overview' && renderOverviewTab()}
                {activeTab === 'livecalendar' && <EnhancedLiveCalendar client={selectedClient} />}
                {activeTab === 'campaigns' && renderCampaignCreatorTab()}
                {activeTab === 'flows' && renderFlowCreatorTab()}
                {activeTab === 'abtests' && <ABTestManager client={selectedClient} />}
                {activeTab === 'requests' && <EnhancedRequests client={selectedClient} />}
                {activeTab === 'templates' && renderTemplatesTab()}
              </>
            )}
          </div>
        </>
      ) : currentView === 'campaign-builder' ? (
        <CampaignBuilder 
          onBack={() => setCurrentView('dashboard')}
          onSave={(campaign) => {
            console.log('Admin creating campaign for client:', selectedClient?.brand_slug, campaign)
            // TODO: Save to campaign_approvals table with 'client_approval' status
            setCurrentView('dashboard')
          }}
        />
      ) : (
        <div>Flow builder coming soon...</div>
      )}
    </div>
  )
}