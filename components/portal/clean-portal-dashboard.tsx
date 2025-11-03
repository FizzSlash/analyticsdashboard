'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardOverview } from './dashboard-overview'
import { CampaignApprovalCalendar } from './campaign-approval-calendar-v3'
import { FlowProgressTracker } from './flow-progress-tracker-v2'
import { ABTestManager } from './ab-test-manager'
import { EnhancedRequests } from './enhanced-requests'
import { DynamicForms } from './dynamic-forms'
import { 
  BarChart3,
  Calendar, 
  Zap, 
  TestTube, 
  FileText,
  Building2,
  ClipboardList,
  Figma,
  ExternalLink
} from 'lucide-react'

interface CleanPortalDashboardProps {
  user: any
  client?: any // For agency admins managing specific clients
  userRole: 'client_user' | 'agency_admin'
  allClients?: any[] // For agency admins to see all clients
}

type PortalTab = 'overview' | 'campaigns' | 'flows' | 'abtests' | 'requests' | 'forms'

export function CleanPortalDashboard({ user, client, userRole, allClients }: CleanPortalDashboardProps) {
  const [activeTab, setActiveTab] = useState<PortalTab>('overview')
  const [selectedClient, setSelectedClient] = useState<any>(client || allClients?.[0] || null)

  // Determine client info based on user role
  const clientInfo = userRole === 'agency_admin' 
    ? selectedClient 
    : { 
        id: user.client?.id || client?.id, // CRITICAL: Ensure client.id is always included
        brand_name: user.client?.brand_name || client?.brand_name || 'Your Brand',
        brand_slug: user.client?.brand_slug || client?.brand_slug || 'unknown',
        figma_url: user.client?.figma_url || client?.figma_url,
        ...client,
        ...user.client // Override with user.client if it exists
      }
  
  // Debug logging to verify client ID is passed
  if (typeof window !== 'undefined') {
    console.log('🔍 PORTAL DEBUG: clientInfo =', {
      id: clientInfo.id,
      brand_name: clientInfo.brand_name,
      brand_slug: clientInfo.brand_slug,
      userRole
    })
  }

  // Agency info for logo display
  const agencyInfo = userRole === 'agency_admin' 
    ? { logo_url: user?.agency?.logo_url }
    : { logo_url: user?.agency?.logo_url || client?.agency?.logo_url }

  const portalTabs = [
    { 
      id: 'overview', 
      label: userRole === 'agency_admin' ? 'Dashboard' : 'Overview', 
      icon: BarChart3 
    },
    { 
      id: 'campaigns', 
      label: userRole === 'agency_admin' ? 'Campaign Calendar' : 'Campaigns', 
      icon: Calendar 
    },
    { 
      id: 'flows', 
      label: userRole === 'agency_admin' ? 'Flow Progress' : 'Flows', 
      icon: Zap 
    },
    { 
      id: 'abtests', 
      label: userRole === 'agency_admin' ? 'A/B Test Manager' : 'A/B Tests', 
      icon: TestTube 
    },
    { 
      id: 'requests', 
      label: userRole === 'agency_admin' ? 'Request Management' : 'Requests', 
      icon: FileText 
    },
    { 
      id: 'forms', 
      label: userRole === 'agency_admin' ? 'Form Templates' : 'Forms', 
      icon: ClipboardList 
    }
  ]

  return (
    <div className="space-y-6">
      {/* Portal Header */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/30 p-3 rounded-xl backdrop-blur-sm border border-blue-400/30">
                <Building2 className="h-6 w-6 text-blue-300" />
              </div>
              <div>
                <CardTitle className="text-white text-xl font-bold flex items-center gap-3">
                  {userRole === 'agency_admin' 
                    ? 'Agency Portal' 
                    : (clientInfo.portal_title || clientInfo.brand_name || 'Client Portal')
                  }
                </CardTitle>
                <p className="text-white/80 text-sm mt-1 font-medium">
                  {userRole === 'agency_admin' 
                    ? `Management Dashboard • Auto-sync to Airtable` 
                    : `Campaign approvals and project management`
                  }
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Agency Logo - Shows on all client boards */}
              {agencyInfo.logo_url && (
                <div className="bg-white/15 backdrop-blur-sm p-2 rounded-lg border border-white/30">
                  <img 
                    src={agencyInfo.logo_url} 
                    alt="Agency logo"
                    className="h-6 w-auto opacity-90"
                    title="Powered by your agency"
                  />
                </div>
              )}

              {/* Figma Button */}
              {clientInfo.figma_url && (
                <a
                  href={clientInfo.figma_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 backdrop-blur-sm border border-white/30 shadow-lg hover:scale-105"
                  title="Open Figma Designs"
                >
                  <Figma className="h-4 w-4" />
                  Design Files
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}

              {/* Client Selector (Agency Admin Only) */}
              {userRole === 'agency_admin' && allClients && (
                <div className="flex items-center gap-3">
                  <span className="text-white/80 text-sm font-medium">Client:</span>
                  <select
                    value={selectedClient?.id || 'all'}
                    onChange={(e) => {
                      if (e.target.value === 'all') {
                        setSelectedClient({ brand_name: 'All Clients', brand_slug: 'all', id: 'all' })
                      } else {
                        const selected = allClients.find(c => c.id === e.target.value)
                        setSelectedClient(selected)
                      }
                    }}
                    className="bg-white/15 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 text-white font-medium focus:ring-2 focus:ring-blue-400 shadow-lg"
                  >
                    <option value="all">All Clients</option>
                    {allClients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.brand_name}
                      </option>
                    ))}
                  </select>
                  {selectedClient && selectedClient.id !== 'all' && (
                    <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 shadow-lg">
                      <Building2 className="h-5 w-5 text-white" />
                      <span className="text-white font-semibold text-sm">{selectedClient.brand_name}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Portal Navigation Tabs */}
      <div className="flex gap-3 p-2 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
        {portalTabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as PortalTab)}
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

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'overview' && (
          <DashboardOverview 
            client={clientInfo}
            userRole={userRole}
            onNavigate={(tab, itemId) => setActiveTab(tab as PortalTab)}
          />
        )}

        {activeTab === 'campaigns' && (
          <CampaignApprovalCalendar 
            client={clientInfo}
            userRole={userRole}
          />
        )}
        
        {activeTab === 'flows' && (
          <FlowProgressTracker 
            client={clientInfo}
            userRole={userRole}
            canEdit={userRole === 'agency_admin'}
            canCreate={userRole === 'agency_admin'}
            canApprove={userRole === 'client_user'}
          />
        )}
        
        {activeTab === 'abtests' && (
          <ABTestManager 
            client={clientInfo}
          />
        )}
        
        {activeTab === 'requests' && (
          <EnhancedRequests 
            client={clientInfo}
          />
        )}
        
        {activeTab === 'forms' && (
          <DynamicForms 
            client={clientInfo}
            userRole={userRole}
          />
        )}
      </div>

      {/* Status Info - Only for Agency Admins */}
      {userRole === 'agency_admin' && (
        <Card className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-md border-white/30 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-500/30 p-3 rounded-xl backdrop-blur-sm border border-green-400/30">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="font-bold text-white text-lg">Agency Portal - Full Management</span>
                <p className="text-white/80 text-sm mt-2 font-medium leading-relaxed">
                  • Create and manage campaigns/flows for all clients<br/>
                  • Manage client Figma access and design files<br/>
                  • Create dynamic forms and track responses<br/>
                  • All changes auto-sync to Airtable instantly
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}