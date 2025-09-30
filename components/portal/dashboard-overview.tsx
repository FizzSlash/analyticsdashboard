'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart3,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  FileText,
  Zap,
  ArrowRight,
  TrendingUp,
  Users,
  Activity,
  Star,
  Eye
} from 'lucide-react'
import { getBrandColorClasses } from '@/lib/brand-colors'

interface DashboardSummary {
  // Real analytics metrics instead of pending items
  totalRevenue: number
  totalSubscribers: number
  avgOpenRate: number
  avgClickRate: number
  netGrowth: number
  revenueGrowthRate: number
  monthlyMetrics: {
    campaignsSent: number
    emailsDelivered: number  
    totalClicks: number
  }
  topPerformers: {
    bestCampaign?: any
    bestFlow?: any
    topRevenue: number
  }
}

interface DashboardOverviewProps {
  client: any
  data: any // Real analytics data passed from parent
  userRole: 'client_user' | 'agency_admin'
  onNavigate: (tab: string, itemId?: string) => void
}

export function DashboardOverview({ client, data, userRole, onNavigate }: DashboardOverviewProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Get brand colors for this client
  const brandColors = getBrandColorClasses(client)

  useEffect(() => {
    loadDashboardSummary()
  }, [client, data])

  const loadDashboardSummary = async () => {
    setLoading(true)
    try {
      // Use real analytics data instead of mock pending items
      setSummary(processAnalyticsData(data))
    } catch (error) {
      console.error('Error processing dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processAnalyticsData = (data: any): DashboardSummary => {
    if (!data) return getEmptyDashboard()
    
    // Extract real metrics from analytics data
    const campaigns = data.campaigns || []
    const flows = data.flows || []
    const summary = data.summary || {}
    const audience = data.audience || []
    
    // Calculate key metrics
    const totalRevenue = summary.revenue?.total_revenue || 0
    const totalSubscribers = summary.audience?.total_subscribers || 0
    const avgOpenRate = summary.campaigns?.avg_open_rate || 0
    const avgClickRate = summary.campaigns?.avg_click_rate || 0
    
    // Calculate growth metrics
    const netGrowth = summary.audience?.net_growth || 0
    const previousRevenue = summary.revenue?.previous_period_revenue || totalRevenue
    const revenueGrowthRate = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0
    
    // Monthly activity metrics
    const campaignsSent = campaigns.length
    const emailsDelivered = campaigns.reduce((sum: number, c: any) => sum + (c.recipients_count || 0), 0)
    const totalClicks = campaigns.reduce((sum: number, c: any) => sum + (c.clicked_count || 0), 0)
    
    // Find top performers
    const bestCampaign = campaigns
      .filter((c: any) => c.revenue > 0)
      .sort((a: any, b: any) => b.revenue - a.revenue)[0]
    
    const bestFlow = flows
      .filter((f: any) => f.revenue > 0)
      .sort((a: any, b: any) => b.revenue - a.revenue)[0]
    
    const topRevenue = Math.max(
      bestCampaign?.revenue || 0,
      bestFlow?.revenue || 0
    )
    
    return {
      totalRevenue,
      totalSubscribers,
      avgOpenRate,
      avgClickRate,
      netGrowth,
      revenueGrowthRate,
      monthlyMetrics: {
        campaignsSent,
        emailsDelivered,
        totalClicks
      },
      topPerformers: {
        bestCampaign,
        bestFlow,
        topRevenue
      }
    }
  }

  const getEmptyDashboard = (): DashboardSummary => ({
    totalRevenue: 0,
    totalSubscribers: 0,
    avgOpenRate: 0,
    avgClickRate: 0,
    netGrowth: 0,
    revenueGrowthRate: 0,
    monthlyMetrics: {
      campaignsSent: 0,
      emailsDelivered: 0,
      totalClicks: 0
    },
    topPerformers: {
      topRevenue: 0
    }
  })

  // Utility functions removed - no longer needed with new analytics-focused dashboard

  if (loading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60 mx-auto mb-4"></div>
          <p className="text-white/70">Loading dashboard...</p>
        </CardContent>
      </Card>
    )
  }

  if (!summary) return null

  return (
    <div className="space-y-6">
      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/30">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              {summary.revenueGrowthRate !== 0 && (
                <div className={`text-xs font-medium px-3 py-1 rounded-full ${
                  summary.revenueGrowthRate > 0 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  {summary.revenueGrowthRate > 0 ? '+' : ''}{summary.revenueGrowthRate.toFixed(1)}%
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-white/70 text-sm font-medium">Total Revenue</p>
              <p className="text-white text-3xl font-bold">
                ${summary.totalRevenue.toLocaleString()}
              </p>
              <p className="text-white/60 text-sm">
                From campaigns & flows
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Subscribers */}
        <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/30">
                <Users className="h-6 w-6 text-white" />
              </div>
              {summary.netGrowth !== 0 && (
                <div className={`text-xs font-medium px-3 py-1 rounded-full ${
                  summary.netGrowth > 0 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  {summary.netGrowth > 0 ? '+' : ''}{summary.netGrowth.toLocaleString()}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-white/70 text-sm font-medium">Total Subscribers</p>
              <p className="text-white text-3xl font-bold">
                {summary.totalSubscribers.toLocaleString()}
              </p>
              <p className="text-white/60 text-sm">
                Active email list
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Rate */}
        <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/30">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full border border-white/30">
                AVG
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-white/70 text-sm font-medium">Open Rate</p>
              <p className="text-white text-3xl font-bold">
                {summary.avgOpenRate.toFixed(1)}%
              </p>
              <p className="text-white/60 text-sm">
                Click: {summary.avgClickRate.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Activity */}
        <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/30">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full border border-white/30">
                30D
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-white/70 text-sm font-medium">Campaigns Sent</p>
              <p className="text-white text-3xl font-bold">
                {summary.monthlyMetrics.campaignsSent}
              </p>
              <p className="text-white/60 text-sm">
                {summary.monthlyMetrics.emailsDelivered.toLocaleString()} emails delivered
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.topPerformers.topRevenue > 0 ? (
              <div className="space-y-4">
                {summary.topPerformers.bestCampaign && (
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Best Campaign</p>
                        <p className="text-white/70 text-sm">
                          {summary.topPerformers.bestCampaign.subject_line || 'Untitled Campaign'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-300 font-bold">
                          ${(summary.topPerformers.bestCampaign.revenue || 0).toLocaleString()}
                        </p>
                        <p className="text-white/60 text-xs">
                          {(summary.topPerformers.bestCampaign.open_rate || 0).toFixed(1)}% open
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {summary.topPerformers.bestFlow && (
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Best Flow</p>
                        <p className="text-white/70 text-sm">
                          {summary.topPerformers.bestFlow.flow_name || 'Untitled Flow'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-300 font-bold">
                          ${(summary.topPerformers.bestFlow.revenue || 0).toLocaleString()}
                        </p>
                        <p className="text-white/60 text-xs">
                          {(summary.topPerformers.bestFlow.conversion_rate || 0).toFixed(1)}% convert
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Zap className="w-10 h-10 text-white/30 mx-auto mb-3" />
                <p className="text-white/60">No performance data yet</p>
                <p className="text-white/40 text-sm">Launch campaigns to see results</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Insights */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Campaign Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Campaigns Sent</p>
                    <p className="text-white/70 text-sm">Last 30 days</p>
                  </div>
                  <p className="text-white text-2xl font-bold">
                    {summary.monthlyMetrics.campaignsSent}
                  </p>
                </div>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Emails Delivered</p>
                    <p className="text-white/70 text-sm">Total reach</p>
                  </div>
                  <p className="text-white text-2xl font-bold">
                    {summary.monthlyMetrics.emailsDelivered.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Total Clicks</p>
                    <p className="text-white/70 text-sm">Engagement metric</p>
                  </div>
                  <p className="text-white text-2xl font-bold">
                    {summary.monthlyMetrics.totalClicks.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => onNavigate('campaigns')}
              className="bg-white/10 hover:bg-white/15 border border-white/20 p-4 rounded-lg transition-all duration-300 text-left group"
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-white font-medium">View Campaigns</p>
                  <p className="text-white/60 text-sm">Review performance</p>
                </div>
                <ArrowRight className="h-4 w-4 text-white/60 ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
            
            <button
              onClick={() => onNavigate('flows')}
              className="bg-white/10 hover:bg-white/15 border border-white/20 p-4 rounded-lg transition-all duration-300 text-left group"
            >
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-white font-medium">Check Flows</p>
                  <p className="text-white/60 text-sm">Automated sequences</p>
                </div>
                <ArrowRight className="h-4 w-4 text-white/60 ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
            
            <button
              onClick={() => onNavigate('requests')}
              className="bg-white/10 hover:bg-white/15 border border-white/20 p-4 rounded-lg transition-all duration-300 text-left group"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-white font-medium">New Request</p>
                  <p className="text-white/60 text-sm">Submit project</p>
                </div>
                <ArrowRight className="h-4 w-4 text-white/60 ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}