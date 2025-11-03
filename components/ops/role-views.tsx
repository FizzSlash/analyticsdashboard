'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Eye,
  FileText,
  Palette,
  Rocket,
  Briefcase,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Mail
} from 'lucide-react'

type RoleView = 'overview' | 'copywriter' | 'designer' | 'implementor' | 'pm'

interface RoleViewsProps {
  clients: any[]
  campaigns: any[]
  flows: any[]
  onCampaignClick?: (campaign: any) => void
  onFlowClick?: (flow: any) => void
}

export function RoleViews({ clients, campaigns, flows, onCampaignClick, onFlowClick }: RoleViewsProps) {
  const [activeView, setActiveView] = useState<RoleView>('overview')

  const roleViews = [
    { id: 'overview', label: 'Production Overview', icon: TrendingUp },
    { id: 'copywriter', label: 'Copywriter', icon: FileText },
    { id: 'designer', label: 'Designer', icon: Palette },
    { id: 'implementor', label: 'Implementor', icon: Rocket },
    { id: 'pm', label: 'Project Manager', icon: Briefcase }
  ]

  // Calculate real metrics from actual data
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  
  const metrics = {
    campaigns_written: campaigns.filter(c => 
      new Date(c.created_at || c.send_date) >= oneWeekAgo && 
      ['copy', 'design', 'qa', 'client_approval', 'approved', 'scheduled', 'sent'].includes(c.status)
    ).length,
    campaigns_designed: campaigns.filter(c => 
      new Date(c.created_at || c.send_date) >= oneWeekAgo && 
      ['design', 'qa', 'client_approval', 'approved', 'scheduled', 'sent'].includes(c.status)
    ).length,
    flows_written: flows.filter(f => 
      new Date(f.created_at || Date.now()) >= oneWeekAgo
    ).length,
    flows_designed: flows.filter(f => 
      new Date(f.created_at || Date.now()) >= oneWeekAgo && 
      ['design', 'qa', 'client_approval', 'approved'].includes(f.status)
    ).length
  }

  return (
    <div className="space-y-6">
      {/* View Selector */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Role Views
              </CardTitle>
              <div className="text-white/70 text-sm mt-1">
                Different perspectives on your work (everyone can access all views)
              </div>
            </div>
            <select
              value={activeView}
              onChange={(e) => setActiveView(e.target.value as RoleView)}
              className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg font-semibold focus:ring-2 focus:ring-white/40 min-w-[200px]"
            >
              {roleViews.map(view => (
                <option key={view.id} value={view.id} className="bg-gray-800">
                  {view.label}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
      </Card>

      {/* Overview (Production Board) */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* This Week Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="text-white/70 text-sm mb-1">Campaigns Written</div>
                <div className="text-3xl font-bold text-white">{metrics.campaigns_written}</div>
                <div className="text-white/60 text-xs mt-2">This week</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="text-white/70 text-sm mb-1">Campaigns Designed</div>
                <div className="text-3xl font-bold text-purple-400">{metrics.campaigns_designed}</div>
                <div className="text-white/60 text-xs mt-2">This week</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="text-white/70 text-sm mb-1">Flows Written</div>
                <div className="text-3xl font-bold text-blue-400">{metrics.flows_written}</div>
                <div className="text-white/60 text-xs mt-2">This week</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="text-white/70 text-sm mb-1">Flows Designed</div>
                <div className="text-3xl font-bold text-green-400">{metrics.flows_designed}</div>
                <div className="text-white/60 text-xs mt-2">This week</div>
              </CardContent>
            </Card>
          </div>

          {/* By Client Breakdown */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Production by Client (This Week)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clients.map((client) => {
                  const clientCampaigns = campaigns.filter(c => 
                    c.client_id === client.id && 
                    new Date(c.created_at || c.send_date) >= oneWeekAgo
                  ).length
                  const clientFlows = flows.filter(f => 
                    f.client_id === client.id && 
                    new Date(f.created_at || Date.now()) >= oneWeekAgo
                  ).length
                  
                  if (clientCampaigns === 0 && clientFlows === 0) return null
                  
                  return (
                    <div key={client.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{client.brand_name}</span>
                        <div className="text-sm text-gray-600">
                          {clientCampaigns} campaigns • {clientFlows} flows
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="bg-blue-200 rounded-full h-2" style={{ 
                          width: clientCampaigns > 0 ? `${Math.min((clientCampaigns / 12) * 100, 100)}%` : '0%' 
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Copywriter View */}
      {activeView === 'copywriter' && (
        <div className="space-y-6">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Copy Queue ({campaigns.filter(c => c.status === 'copy').length + flows.filter(f => f.status === 'copy').length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {campaigns.filter(c => c.status === 'copy').length === 0 && flows.filter(f => f.status === 'copy').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No items in copy queue</p>
                  </div>
                ) : (
                  <>
                    {campaigns.filter(c => c.status === 'copy').map(campaign => (
                      <div 
                        key={campaign.id} 
                        className="p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                        onClick={() => onCampaignClick?.(campaign)}
                      >
                        <div className="font-semibold text-gray-900">{campaign.campaign_name}</div>
                        <div className="text-sm text-gray-600">{campaign.client_name} • {new Date(campaign.send_date).toLocaleDateString()}</div>
                        {campaign.copy_doc_url && (
                          <a 
                            href={campaign.copy_doc_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 text-sm flex items-center gap-1 mt-1 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3 w-3" />
                            Open Copy Doc
                          </a>
                        )}
                      </div>
                    ))}
                    {flows.filter(f => f.status === 'copy').map(flow => (
                      <div key={flow.id} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="font-semibold text-gray-900">{flow.flow_name} (Flow)</div>
                        <div className="text-sm text-gray-600">{flow.num_emails} emails</div>
                        {flow.copy_doc_url && (
                          <a href={flow.copy_doc_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 text-sm flex items-center gap-1 mt-1">
                            <ExternalLink className="h-3 w-3" />
                            Open Copy Doc
                          </a>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Designer View */}
      {activeView === 'designer' && (
        <div className="space-y-6">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-600" />
                Design Queue ({campaigns.filter(c => c.status === 'design').length + flows.filter(f => f.status === 'design').length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {campaigns.filter(c => c.status === 'design').length === 0 && flows.filter(f => f.status === 'design').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Palette className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No items in design queue</p>
                  </div>
                ) : (
                  <>
                    {campaigns.filter(c => c.status === 'design').map(campaign => (
                      <div 
                        key={campaign.id} 
                        className="p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer"
                        onClick={() => onCampaignClick?.(campaign)}
                      >
                        <div className="font-semibold text-gray-900">{campaign.campaign_name}</div>
                        <div className="text-sm text-gray-600">{campaign.client_name} • {new Date(campaign.send_date).toLocaleDateString()}</div>
                        {campaign.copy_doc_url && (
                          <a 
                            href={campaign.copy_doc_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-purple-600 text-sm flex items-center gap-1 mt-1 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3 w-3" />
                            View Copy
                          </a>
                        )}
                      </div>
                    ))}
                    {flows.filter(f => f.status === 'design').map(flow => (
                      <div key={flow.id} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="font-semibold text-gray-900">{flow.flow_name} (Flow)</div>
                        <div className="text-sm text-gray-600">{flow.num_emails} emails</div>
                        {flow.copy_doc_url && (
                          <a href={flow.copy_doc_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 text-sm flex items-center gap-1 mt-1">
                            <ExternalLink className="h-3 w-3" />
                            View Copy
                          </a>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Implementor View */}
      {activeView === 'implementor' && (
        <div className="space-y-6">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Rocket className="h-5 w-5 text-green-600" />
                Ready to Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {campaigns.filter(c => c.status === 'approved').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Rocket className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No campaigns ready to schedule</p>
                  </div>
                ) : (
                  campaigns.filter(c => c.status === 'approved').map(campaign => (
                    <div 
                      key={campaign.id} 
                      className="p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors cursor-pointer"
                      onClick={() => onCampaignClick?.(campaign)}
                    >
                      <div className="font-semibold text-gray-900">{campaign.campaign_name}</div>
                      <div className="text-sm text-gray-600">{campaign.client_name} • Send: {new Date(campaign.send_date).toLocaleDateString()}</div>
                      {campaign.preview_url && (
                        <a 
                          href={campaign.preview_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-green-600 text-sm flex items-center gap-1 mt-1 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Design
                        </a>
                      )}
                    </div>
                  ))
                )}
                <div className="text-sm">
                  Will display: Campaigns in "Approved" status + Flows in "Approved" status
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Project Manager View */}
      {activeView === 'pm' && (
        <div className="space-y-6">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-orange-600" />
                Revision Requests from Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-600">
                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-orange-400" />
                <div className="text-lg mb-2">Client revision requests will show here</div>
                <div className="text-sm">
                  Will display: Campaigns/Flows with status "revision_needed"
                </div>
                <div className="text-sm mt-4 text-orange-600">
                  PM assigns back to Copy or Design, adds internal notes
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Handoff Tracker</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="font-semibold text-blue-900 mb-1">Copy → Design</div>
                  <div className="text-2xl font-bold text-blue-600">5</div>
                  <div className="text-xs text-blue-700">Ready for design</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="font-semibold text-purple-900 mb-1">Design → QA</div>
                  <div className="text-2xl font-bold text-purple-600">3</div>
                  <div className="text-xs text-purple-700">Ready for QA</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="font-semibold text-green-900 mb-1">QA → Client</div>
                  <div className="text-2xl font-bold text-green-600">2</div>
                  <div className="text-xs text-green-700">Ready to send</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Client Approvals Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-600">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <div className="text-sm">
                  Campaigns/Flows awaiting client approval will show here
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

