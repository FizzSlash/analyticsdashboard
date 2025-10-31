'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Mail,
  AlertCircle,
  Send,
  Clock,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowRight,
  Plus,
  MessageSquare,
  Upload,
  User
} from 'lucide-react'

interface Campaign {
  id: string
  campaign_name: string
  client_id: string
  client_name: string
  client_color: string
  send_date: Date
  status: 'strategy' | 'copy' | 'design' | 'qa' | 'client_approval' | 'approved' | 'scheduled' | 'sent'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  campaign_type: 'email' | 'sms'
}

interface OpsOverviewProps {
  clients: any[]
  selectedClient: string
  campaigns: Campaign[]
  onCampaignClick: (campaign: Campaign) => void
}

export function OpsOverview({ 
  clients, 
  selectedClient, 
  campaigns,
  onCampaignClick 
}: OpsOverviewProps) {
  
  // Filter campaigns by selected client
  const filteredCampaigns = campaigns.filter(campaign => 
    selectedClient === 'all' || campaign.client_id === selectedClient
  )

  // Calculate stats
  const activeCampaigns = filteredCampaigns.filter(c => c.status !== 'sent').length
  const needsAttention = filteredCampaigns.filter(c => 
    c.priority === 'urgent' || c.priority === 'high' ||
    (c.send_date < new Date() && c.status !== 'sent')
  ).length
  const sentThisWeek = filteredCampaigns.filter(c => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return c.status === 'sent' && c.send_date > weekAgo
  }).length
  const clientApprovals = filteredCampaigns.filter(c => c.status === 'client_approval').length

  // Get campaigns that need attention
  const urgentCampaigns = filteredCampaigns
    .filter(c => {
      const isPastDue = c.send_date < new Date() && c.status !== 'sent'
      const isUrgent = c.priority === 'urgent' || c.priority === 'high'
      const waitingApproval = c.status === 'client_approval'
      return isPastDue || isUrgent || waitingApproval
    })
    .sort((a, b) => {
      // Sort: past due first, then urgent, then by date
      const aPastDue = a.send_date < new Date() && a.status !== 'sent'
      const bPastDue = b.send_date < new Date() && b.status !== 'sent'
      if (aPastDue && !bPastDue) return -1
      if (!aPastDue && bPastDue) return 1
      if (a.priority === 'urgent' && b.priority !== 'urgent') return -1
      if (a.priority !== 'urgent' && b.priority === 'urgent') return 1
      return a.send_date.getTime() - b.send_date.getTime()
    })
    .slice(0, 5)

  // Recent activity (mock - will be from ops_activity table later)
  const recentActivity = [
    {
      id: '1',
      type: 'status_change',
      description: 'Black Friday Launch moved to Design',
      user: 'Sarah',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      campaignName: 'Black Friday Launch'
    },
    {
      id: '2',
      type: 'created',
      description: 'New campaign created',
      user: 'Mike',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      campaignName: 'Holiday Strategy'
    },
    {
      id: '3',
      type: 'approved',
      description: 'Client approved Newsletter',
      user: 'Client',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      campaignName: 'Newsletter'
    },
    {
      id: '4',
      type: 'uploaded',
      description: 'Image uploaded to Product Launch',
      user: 'Design Team',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      campaignName: 'Product Launch'
    }
  ]

  // Upcoming sends
  const upcomingSends = filteredCampaigns
    .filter(c => c.send_date >= new Date() && (c.status === 'scheduled' || c.status === 'approved'))
    .sort((a, b) => a.send_date.getTime() - b.send_date.getTime())
    .slice(0, 5)

  const formatRelativeTime = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created': return <Plus className="h-4 w-4 text-green-600" />
      case 'status_change': return <ArrowRight className="h-4 w-4 text-blue-600" />
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'uploaded': return <Upload className="h-4 w-4 text-purple-600" />
      default: return <MessageSquare className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats - 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl backdrop-blur-sm border border-blue-400/30">
                <Mail className="h-6 w-6 text-blue-300" />
              </div>
              <div>
                <div className="text-white/70 text-sm">Active Campaigns</div>
                <div className="text-3xl font-bold text-white">{activeCampaigns}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/20 rounded-xl backdrop-blur-sm border border-orange-400/30">
                <AlertCircle className="h-6 w-6 text-orange-300" />
              </div>
              <div>
                <div className="text-white/70 text-sm">Needs Attention</div>
                <div className="text-3xl font-bold text-orange-400">{needsAttention}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl backdrop-blur-sm border border-green-400/30">
                <Send className="h-6 w-6 text-green-300" />
              </div>
              <div>
                <div className="text-white/70 text-sm">Sent This Week</div>
                <div className="text-3xl font-bold text-green-400">{sentThisWeek}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-xl backdrop-blur-sm border border-purple-400/30">
                <Clock className="h-6 w-6 text-purple-300" />
              </div>
              <div>
                <div className="text-white/70 text-sm">Client Approvals</div>
                <div className="text-3xl font-bold text-purple-400">{clientApprovals}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Needs Attention */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-400" />
                Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              {urgentCampaigns.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-400" />
                  <div className="text-white/70">All caught up! 🎉</div>
                  <div className="text-white/50 text-sm mt-1">No urgent campaigns or past due items</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {urgentCampaigns.map(campaign => {
                    const isPastDue = campaign.send_date < new Date() && campaign.status !== 'sent'
                    const isWaiting = campaign.status === 'client_approval'
                    
                    return (
                      <div
                        key={campaign.id}
                        onClick={() => onCampaignClick(campaign)}
                        className="p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 cursor-pointer transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div 
                            className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                            style={{ backgroundColor: campaign.client_color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium flex items-center gap-2">
                              {campaign.campaign_name}
                              {isPastDue && <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 rounded-full border border-red-400/30">Past Due</span>}
                              {campaign.priority === 'urgent' && <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded-full border border-orange-400/30">Urgent</span>}
                              {isWaiting && <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full border border-blue-400/30">Awaiting Client</span>}
                            </div>
                            <div className="text-white/60 text-sm mt-1">
                              {campaign.client_name} • {campaign.send_date.toLocaleDateString()}
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-white/40 flex-shrink-0" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Sends */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-400" />
                Upcoming Sends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingSends.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-white/30" />
                  <div className="text-white/70">No upcoming sends</div>
                  <div className="text-white/50 text-sm mt-1">Schedule campaigns to see them here</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingSends.map(campaign => (
                    <div
                      key={campaign.id}
                      onClick={() => onCampaignClick(campaign)}
                      className="p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 cursor-pointer transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                          style={{ backgroundColor: campaign.client_color }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="text-white font-medium">{campaign.campaign_name}</div>
                            <div className={`text-xs px-2 py-0.5 rounded-full border ${
                              campaign.status === 'scheduled' 
                                ? 'bg-teal-500/20 text-teal-300 border-teal-400/30'
                                : 'bg-green-500/20 text-green-300 border-green-400/30'
                            }`}>
                              {campaign.status}
                            </div>
                          </div>
                          <div className="text-white/60 text-sm mt-1">
                            {campaign.client_name}
                          </div>
                          <div className="text-white/80 text-sm mt-2 flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {campaign.send_date.toLocaleDateString('en-US', { 
                              weekday: 'short',
                              month: 'short', 
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white/90 text-sm">
                        {activity.description}
                      </div>
                      <div className="text-white/50 text-xs mt-1">
                        {activity.user} • {formatRelativeTime(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* This Week Summary */}
          <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-sm">Campaigns Created</span>
                  <span className="text-white font-bold text-lg">
                    {filteredCampaigns.filter(c => {
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return new Date(c.id) > weekAgo // Mock: using ID as creation date
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-sm">Campaigns Sent</span>
                  <span className="text-white font-bold text-lg">{sentThisWeek}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-sm">Client Approvals</span>
                  <span className="text-white font-bold text-lg">
                    {filteredCampaigns.filter(c => c.status === 'approved').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-sm">Pending Review</span>
                  <span className="text-white font-bold text-lg">{clientApprovals}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button className="w-full p-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-between">
                  <span>View All Campaigns</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button className="w-full p-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-between">
                  <span>Content Hub</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button className="w-full p-3 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-between">
                  <span>Scope Tracking</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

