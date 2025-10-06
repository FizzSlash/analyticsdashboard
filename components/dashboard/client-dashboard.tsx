'use client'

import { useEffect, useState } from 'react'
/**
 * @deprecated This component is no longer used. Use ModernDashboard instead.
 * Kept for backwards compatibility only.
 */

import { DatabaseService } from '@/lib/database'
import { MetricCard } from './metric-card'
import { CustomLineChart, CustomBarChart, CustomAreaChart } from './charts'
import { PerformanceTable } from './performance-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Mail, 
  Users, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Zap,
  Calendar,
  Target
} from 'lucide-react'
import { formatCurrency, formatNumber, formatPercentage, aggregateMetricsByDate } from '@/lib/utils'
import { UnifiedCampaignPortal } from '../portal/unified-campaign-portal'

interface ClientDashboardProps {
  client: any // Changed from Client to any since this component is deprecated
  data?: {
    summary: any
    campaigns: any[]
    flows: any[]
    audience: any[]
    revenue: any[]
    topCampaigns: any[]
    topFlows: any[]
  }
}

interface DashboardData {
  summary: any
  campaigns: any[]
  flows: any[]
  audience: any[]
  revenue: any[]
  topCampaigns: any[]
  topFlows: any[]
  loading: boolean
}

export function ClientDashboard({ client, data: providedData }: ClientDashboardProps) {
  // Safety: Ensure colors exist (inherited from agency or defaults)
  const primaryColor = client.primary_color || '#3B82F6'
  const secondaryColor = client.secondary_color || '#1D4ED8'
  
  const [data, setData] = useState<DashboardData>({
    summary: null,
    campaigns: [],
    flows: [],
    audience: [],
    revenue: [],
    topCampaigns: [],
    topFlows: [],
    loading: true
  })

  useEffect(() => {
    // If data is provided as prop, use it directly
    if (providedData) {
      setData({
        ...providedData,
        loading: false
      })
      return
    }

    // Otherwise, fetch data (legacy behavior)
    async function fetchDashboardData() {
      try {
        const [
          summary,
          campaigns,
          flows,
          audience,
          revenue,
          topCampaigns,
          topFlows
        ] = await Promise.all([
          DatabaseService.getDashboardSummary(client.id),
          DatabaseService.getRecentCampaignMetrics(client.id, 30),
          DatabaseService.getRecentFlowMetrics(client.id, 30),
          DatabaseService.getAudienceMetrics(client.id, 30),
          DatabaseService.getRevenueAttribution(client.id, 30),
          DatabaseService.getTopCampaigns(client.id, 'open_rate', 5),
          DatabaseService.getTopFlows(client.id, 'revenue', 5)
        ])

        setData({
          summary,
          campaigns,
          flows,
          audience,
          revenue,
          topCampaigns,
          topFlows,
          loading: false
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setData(prev => ({ ...prev, loading: false }))
      }
    }

    fetchDashboardData()
  }, [client.id, providedData])

  if (data.loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const campaignTrendData = aggregateMetricsByDate(
    data.campaigns, 
    'send_date', 
    ['revenue', 'recipients_count', 'opened_count', 'clicked_count']
  ).map(item => ({
    ...item,
    open_rate: item.recipients_count > 0 ? (item.opened_count / item.recipients_count) * 100 : 0,
    click_rate: item.recipients_count > 0 ? (item.clicked_count / item.recipients_count) * 100 : 0
  }))

  const audienceGrowthData = data.audience.map(item => ({
    date: item.date_recorded,
    subscribers: item.subscribed_profiles,
    growth: item.net_growth
  })).reverse()

  const revenueData = data.revenue.map(item => ({
    date: item.date_recorded,
    campaign_revenue: item.campaign_revenue,
    flow_revenue: item.flow_revenue,
    total_revenue: item.total_email_revenue
  })).reverse()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div 
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{client.brand_name}</h1>
              <p className="text-blue-100 text-lg">Email Marketing Analytics Dashboard</p>
            </div>
            {client.logo_url && (
              <img 
                src={client.logo_url} 
                alt={`${client.brand_name} logo`}
                className="h-16 w-auto"
              />
            )}
          </div>
          {client.last_sync && (
            <p className="text-blue-200 text-sm mt-4">
              Last updated: {new Date(client.last_sync).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Campaigns"
            value={data.summary?.campaigns?.total_sent || 0}
            icon={<Mail className="h-4 w-4" />}
            description="Campaigns sent in last 30 days"
          />
          <MetricCard
            title="Total Subscribers"
            value={data.summary?.audience?.total_subscribers || 0}
            change={data.summary?.audience?.growth_rate}
            icon={<Users className="h-4 w-4" />}
            description="Active email subscribers"
          />
          <MetricCard
            title="Average Open Rate"
            value={data.summary?.campaigns?.avg_open_rate || 0}
            format="percentage"
            icon={<Target className="h-4 w-4" />}
            description="Across all campaigns"
          />
          <MetricCard
            title="Total Revenue"
            value={data.summary?.revenue?.total_revenue || 0}
            format="currency"
            icon={<DollarSign className="h-4 w-4" />}
            description="From email marketing"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Active Flows"
            value={data.summary?.flows?.active_flows || 0}
            icon={<Zap className="h-4 w-4" />}
            description="Automated email flows"
          />
          <MetricCard
            title="Engagement Rate"
            value={data.summary?.audience?.engagement_rate || 0}
            format="percentage"
            icon={<TrendingUp className="h-4 w-4" />}
            description="30-day engagement"
          />
          <MetricCard
            title="Click Rate"
            value={data.summary?.campaigns?.avg_click_rate || 0}
            format="percentage"
            icon={<BarChart3 className="h-4 w-4" />}
            description="Average across campaigns"
          />
          <MetricCard
            title="Total Orders"
            value={data.summary?.revenue?.total_orders || 0}
            icon={<Calendar className="h-4 w-4" />}
            description="From email campaigns"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CustomAreaChart
            title="Revenue Trend"
            data={revenueData}
            xKey="date"
            yKey="total_revenue"
            format="currency"
            color={primaryColor}
          />
          
          <CustomLineChart
            title="Subscriber Growth"
            data={audienceGrowthData}
            xKey="date"
            yKey="subscribers"
            format="number"
            color={secondaryColor}
          />
          
          <CustomBarChart
            title="Campaign Performance"
            data={campaignTrendData.slice(-7)}
            xKey="date"
            yKey="open_rate"
            format="percentage"
            color={primaryColor}
          />
          
          <CustomLineChart
            title="Daily Revenue"
            data={revenueData.slice(-14)}
            xKey="date"
            yKey="total_revenue"
            format="currency"
            color={secondaryColor}
          />
        </div>

        {/* Performance Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PerformanceTable
            title="Top Performing Campaigns"
            data={data.topCampaigns}
            type="campaigns"
          />
          
          <PerformanceTable
            title="Top Performing Flows"
            data={data.topFlows}
            type="flows"
          />
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Campaign Revenue</span>
                  <span className="text-sm font-semibold">
                    {formatCurrency(data.summary?.revenue?.campaign_revenue || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Flow Revenue</span>
                  <span className="text-sm font-semibold">
                    {formatCurrency(data.summary?.revenue?.flow_revenue || 0)}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Revenue</span>
                    <span className="text-lg font-bold" style={{ color: primaryColor }}>
                      {formatCurrency(data.summary?.revenue?.total_revenue || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Campaign Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Total Recipients</span>
                  <span className="text-sm font-semibold">
                    {formatNumber(data.summary?.campaigns?.total_recipients || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Avg Open Rate</span>
                  <span className="text-sm font-semibold">
                    {formatPercentage(data.summary?.campaigns?.avg_open_rate || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Avg Click Rate</span>
                  <span className="text-sm font-semibold">
                    {formatPercentage(data.summary?.campaigns?.avg_click_rate || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Flow Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Active Flows</span>
                  <span className="text-sm font-semibold">
                    {formatNumber(data.summary?.flows?.active_flows || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Total Triggered</span>
                  <span className="text-sm font-semibold">
                    {formatNumber(data.summary?.flows?.total_triggered || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Completion Rate</span>
                  <span className="text-sm font-semibold">
                    {formatPercentage(data.summary?.flows?.completion_rate || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Portal */}
        <div className="mt-8">
          <UnifiedCampaignPortal 
            user={{ client: client }}
            userRole="client_user"
          />
        </div>
      </div>
    </div>
  )
}
