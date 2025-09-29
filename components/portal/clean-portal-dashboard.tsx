'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CampaignCalendar } from './campaign-calendar'
import { FlowProgressTracker } from './flow-progress-tracker'
import { ABTestManager } from './ab-test-manager'
import { EnhancedRequests } from './enhanced-requests'
import { 
  Calendar, 
  Zap, 
  TestTube, 
  FileText,
  Building2
} from 'lucide-react'

interface CleanPortalDashboardProps {
  user: any
  client?: any // For agency admins managing specific clients
  userRole: 'client_user' | 'agency_admin'
  allClients?: any[] // For agency admins to see all clients
}

type PortalTab = 'campaigns' | 'flows' | 'abtests' | 'requests'

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
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div>
                <CardTitle className="text-white">
                  {userRole === 'agency_admin' ? 'Agency Portal' : 'Client Portal'}
                </CardTitle>
                <p className="text-white/70 text-sm mt-1">
                  {userRole === 'agency_admin' 
                    ? `Managing campaigns and flows • Auto-sync to Airtable` 
                    : `Approve campaigns and flows • Submit requests`
                  }
                </p>
              </div>
            </div>
            
            {/* Client Selector (Agency Admin Only) */}
            {userRole === 'agency_admin' && allClients && (
              <div className="flex items-center gap-3">
                <span className="text-white/70 text-sm">Client:</span>
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
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-400"
                >
                  <option value="all">All Clients</option>
                  {allClients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.brand_name}
                    </option>
                  ))}
                </select>
                {selectedClient && selectedClient.id !== 'all' && (
                  <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-2">
                    <Building2 className="h-4 w-4 text-white/80" />
                    <span className="text-white font-medium text-sm">{selectedClient.brand_name}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Portal Navigation Tabs */}
      <div className="flex gap-2">
        {portalTabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as PortalTab)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab.id 
                  ? 'bg-white/20 text-white shadow-lg' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <Icon className="h-4 w-4" />
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
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mt-2"></div>
            <div>
              <span className="font-medium text-white">
                {userRole === 'agency_admin' ? 'Agency Portal - Full Management' : 'Client Portal - Approval & Requests'}
              </span>
              <p className="text-white/70 text-sm mt-1">
                {userRole === 'agency_admin' ? (
                  <>• Create and manage campaigns/flows for all clients<br/>
                  • All changes auto-sync to Airtable instantly<br/>
                  • Perfect for live client collaboration</>
                ) : (
                  <>• Approve campaigns and flows when ready<br/>
                  • Submit requests for new campaigns/flows<br/>
                  • Add feedback and notes on existing items</>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}