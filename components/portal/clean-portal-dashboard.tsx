'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CampaignCalendar } from './campaign-calendar'
import { FlowProgressTracker } from './flow-progress-tracker'
import { ABTestManager } from './ab-test-manager'
import { EnhancedRequests } from './enhanced-requests'
import { DesignFeedback } from './design-feedback'
import { 
  Calendar, 
  Zap, 
  TestTube, 
  FileText,
  Building2,
  Image
} from 'lucide-react'

interface CleanPortalDashboardProps {
  user: any
  client?: any // For agency admins managing specific clients
  userRole: 'client_user' | 'agency_admin'
  allClients?: any[] // For agency admins to see all clients
}

type PortalTab = 'campaigns' | 'flows' | 'designs' | 'abtests' | 'requests'

export function CleanPortalDashboard({ user, client, userRole, allClients }: CleanPortalDashboardProps) {
  const [activeTab, setActiveTab] = useState<PortalTab>('campaigns')
  const [selectedClient, setSelectedClient] = useState<any>(client || allClients?.[0] || null)

  // Determine client info based on user role
  const clientInfo = userRole === 'agency_admin' 
    ? selectedClient 
    : { 
        brand_name: user.client?.brand_name || 'Your Brand',
        brand_slug: user.client?.brand_slug || 'unknown',
        ...client
      }

  const portalTabs = [
    { 
      id: 'campaigns', 
      label: userRole === 'agency_admin' ? 'Campaign Calendar' : 'Campaign Approvals', 
      icon: Calendar 
    },
    { 
      id: 'flows', 
      label: userRole === 'agency_admin' ? 'Flow Progress' : 'Flow Approvals', 
      icon: Zap 
    },
    { 
      id: 'designs', 
      label: userRole === 'agency_admin' ? 'Design Center' : 'Design Feedback', 
      icon: Image 
    },
    { 
      id: 'abtests', 
      label: userRole === 'agency_admin' ? 'A/B Test Manager' : 'A/B Test Results', 
      icon: TestTube 
    },
    { 
      id: 'requests', 
      label: userRole === 'agency_admin' ? 'Request Management' : 'Submit Requests', 
      icon: FileText 
    }
  ]

  return (
    <div className="space-y-6">
      {/* Portal Header */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-green-500/30 p-3 rounded-xl backdrop-blur-sm border border-green-400/30">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <CardTitle className="text-white text-xl font-bold">
                  {userRole === 'agency_admin' ? 'Agency Portal' : 'Client Portal'}
                </CardTitle>
                <p className="text-white/80 text-sm mt-1 font-medium">
                  {userRole === 'agency_admin' 
                    ? `Managing campaigns and flows • Auto-sync to Airtable` 
                    : `Approve campaigns and flows • Submit requests`
                  }
                </p>
              </div>
            </div>
            
            {/* Client Selector (Agency Admin Only) */}
            {userRole === 'agency_admin' && allClients && (
              <div className="flex items-center gap-4">
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
        {activeTab === 'campaigns' && (
          <CampaignCalendar 
            client={clientInfo}
            userRole={userRole}
            canEdit={userRole === 'agency_admin'}
            canCreate={userRole === 'agency_admin'}
            canApprove={userRole === 'client_user'}
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
        
        {activeTab === 'designs' && (
          <DesignFeedback 
            client={clientInfo}
            userRole={userRole}
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
      </div>

      {/* Status Info */}
      <Card className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-md border-white/30 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-green-500/30 p-3 rounded-xl backdrop-blur-sm border border-green-400/30">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="font-bold text-white text-lg">
                {userRole === 'agency_admin' ? 'Agency Portal - Full Management' : 'Client Portal - Approval & Requests'}
              </span>
              <p className="text-white/80 text-sm mt-2 font-medium leading-relaxed">
                {userRole === 'agency_admin' ? (
                  <>• Create and manage campaigns/flows for all clients<br/>
                  • View and manage all design files and feedback<br/>
                  • All changes auto-sync to Airtable instantly<br/>
                  • Perfect for live client collaboration</>
                ) : (
                  <>• Approve campaigns and flows when ready<br/>
                  • Review designs and provide feedback<br/>
                  • Submit requests for new campaigns/flows<br/>
                  • Add location-specific comments on designs</>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}