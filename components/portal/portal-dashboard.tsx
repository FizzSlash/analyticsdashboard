'use client'

import { useState } from 'react'
import { CampaignApprovalCalendar } from './campaign-approval-calendar'
import { FlowEmailReview } from './flow-email-review'
import { ABTestManager } from './ab-test-manager'
import { CampaignRequests } from './campaign-requests'
import { CheckCircle, Zap, TestTube, FileText } from 'lucide-react'

interface PortalDashboardProps {
  client: any
  data?: any
}

type PortalTab = 'approvals' | 'flows' | 'abtests' | 'requests'

export function PortalDashboard({ client, data }: PortalDashboardProps) {
  const [activeTab, setActiveTab] = useState<PortalTab>('approvals')
  const [loading, setLoading] = useState(false)

  const portalTabs = [
    { id: 'approvals', label: 'Campaign Approvals', icon: CheckCircle },
    { id: 'flows', label: 'Flow Approvals', icon: Zap },
    { id: 'abtests', label: 'A/B Test Results', icon: TestTube },
    { id: 'requests', label: 'Make Requests', icon: FileText }
  ]

  return (
    <div className="space-y-6">
      {/* Simplified Portal Navigation */}
      <div className="flex gap-2">
        {portalTabs.map((tab) => {
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

      {/* Portal Content */}
      <div className="min-h-[600px]">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-3 text-white/80">Loading...</span>
          </div>
        )}
        
        {!loading && (
          <>
            {activeTab === 'approvals' && <CampaignApprovalCalendar client={client} />}
            {activeTab === 'flows' && <FlowEmailReview client={client} />}
            {activeTab === 'abtests' && <ABTestManager client={client} />}
            {activeTab === 'requests' && <CampaignRequests client={client} />}
          </>
        )}
      </div>
    </div>
  )
}