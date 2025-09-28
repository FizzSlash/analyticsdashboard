'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CampaignBuilder } from './campaign-builder'
import { CampaignApprovalCalendar } from './campaign-approval-calendar'
import { FlowEmailReview } from './flow-email-review'
import { ABTestManager } from './ab-test-manager'
import { CampaignRequests } from './campaign-requests'
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Send,
  Eye,
  Edit3,
  Zap,
  Mail,
  Users,
  Calendar,
  ArrowRight,
  TestTube,
  MessageSquare,
  BarChart3,
  Settings
} from 'lucide-react'

interface PortalDashboardProps {
  client: any
  data?: any
}

type PortalTab = 'overview' | 'approvals' | 'campaigns' | 'flows' | 'abtests' | 'requests' | 'misc'
type PortalView = 'dashboard' | 'campaign-builder' | 'flow-builder'

export function PortalDashboard({ client, data }: PortalDashboardProps) {
  const [activeTab, setActiveTab] = useState<PortalTab>('overview')
  const [currentView, setCurrentView] = useState<PortalView>('dashboard')
  const [loading, setLoading] = useState(false)

  const portalTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle },
    { id: 'campaigns', label: 'Campaign Builder', icon: Mail },
    { id: 'flows', label: 'Flow Reviews', icon: Zap },
    { id: 'abtests', label: 'A/B Tests', icon: TestTube },
    { id: 'requests', label: 'Requests', icon: FileText },
    { id: 'misc', label: 'Misc', icon: Settings }
  ]

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <CardTitle className="text-white text-lg">Approvals</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-white/60 text-sm mb-4">
              Review and approve pending campaigns with calendar view
            </p>
            <button 
              onClick={() => setActiveTab('approvals')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              View Calendar
            </button>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Zap className="h-5 w-5 text-purple-400" />
              </div>
              <CardTitle className="text-white text-lg">Flow Reviews</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-white/60 text-sm mb-4">
              Review individual emails in flows and leave feedback
            </p>
            <button 
              onClick={() => setActiveTab('flows')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Review Flows
            </button>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Plus className="h-5 w-5 text-blue-400" />
              </div>
              <CardTitle className="text-white text-lg">New Request</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-white/60 text-sm mb-4">
              Submit new campaign requests and track progress
            </p>
            <button 
              onClick={() => setActiveTab('requests')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Make Request
            </button>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <TestTube className="h-5 w-5 text-orange-400" />
              </div>
              <CardTitle className="text-white text-lg">A/B Tests</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-white/60 text-sm mb-4">
              Manage and review A/B test results
            </p>
            <button 
              onClick={() => setActiveTab('abtests')}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              View Tests
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Active Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Campaign in Progress */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Mail className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium">Black Friday Campaign 2025</h4>
                  <p className="text-white/60 text-sm">Draft • Last edited 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                  Pending Review
                </span>
                <ArrowRight className="h-4 w-4 text-white/40" />
              </div>
            </div>

            {/* Flow in Progress */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Zap className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium">Holiday Retargeting Flow</h4>
                  <p className="text-white/60 text-sm">Flow • 3 emails configured</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                  Ready to Launch
                </span>
                <ArrowRight className="h-4 w-4 text-white/40" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Drafts</p>
                <p className="text-white text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Pending</p>
                <p className="text-white text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Send className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Sent</p>
                <p className="text-white text-2xl font-bold">47</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Issues</p>
                <p className="text-white text-2xl font-bold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderCampaignBuilderTab = () => (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Campaign Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="p-4 bg-blue-500/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Mail className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">Create Your First Campaign</h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              Use our intuitive drag-and-drop builder to create beautiful email campaigns that convert.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors">
              Start Building
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderFlowBuilderTab = () => (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Flow Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="p-4 bg-purple-500/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Zap className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">Build Automated Flows</h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              Create sophisticated email automation sequences that nurture leads and increase revenue.
            </p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors">
              Build Flow
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderDraftsTab = () => (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Drafts & Templates</CardTitle>
            <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
              New Template
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="p-4 bg-gray-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FileText className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-white/60">No drafts yet. Start creating campaigns and flows to see them here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderMiscTab = () => (
    <div className="space-y-6">
      {/* Misc Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Campaign Performance Archive</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/60 text-sm mb-4">
              View detailed performance reports for all past campaigns
            </p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
              View Archive
            </button>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Template Library</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/60 text-sm mb-4">
              Manage and organize your email and SMS templates
            </p>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
              Manage Templates
            </button>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Subscriber Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/60 text-sm mb-4">
              Analyze subscriber behavior and engagement patterns
            </p>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
              View Insights
            </button>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Integration Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/60 text-sm mb-4">
              Configure integrations and webhook settings
            </p>
            <button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
              Configure
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {currentView === 'dashboard' ? (
        <>
          {/* Portal Navigation */}
          <div className="flex flex-wrap gap-2">
            {portalTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as PortalTab)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
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
                {activeTab === 'overview' && renderOverviewTab()}
                {activeTab === 'approvals' && <CampaignApprovalCalendar client={client} />}
                {activeTab === 'campaigns' && renderCampaignBuilderTab()}
                {activeTab === 'flows' && <FlowEmailReview client={client} />}
                {activeTab === 'abtests' && <ABTestManager client={client} />}
                {activeTab === 'requests' && <CampaignRequests client={client} />}
                {activeTab === 'misc' && renderMiscTab()}
              </>
            )}
          </div>
        </>
      ) : currentView === 'campaign-builder' ? (
        <CampaignBuilder 
          onBack={() => setCurrentView('dashboard')}
          onSave={(campaign) => {
            console.log('Saving campaign:', campaign)
            setCurrentView('dashboard')
          }}
        />
      ) : (
        <div>Flow builder coming soon...</div>
      )}
    </div>
  )
}