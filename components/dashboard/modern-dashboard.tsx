'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimeframeSelector } from '@/components/ui/timeframe-selector'
import { 
  BarChart3, 
  Mail, 
  Users, 
  TrendingUp, 
  DollarSign,
  Zap,
  Shield,
  Calendar,
  ArrowUp,
  ArrowDown,
  Activity,
  Eye,
  MousePointer,
  Target,
  Percent
} from 'lucide-react'

interface ModernDashboardProps {
  client: any
  data?: any
}

type TabType = 'dashboard' | 'campaigns' | 'flows' | 'list-growth' | 'deliverability'

export function ModernDashboard({ client, data: initialData }: ModernDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [timeframe, setTimeframe] = useState(365) // Default to 365 days
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)

  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: BarChart3 },
    { id: 'campaigns', label: 'Campaigns', icon: Mail },
    { id: 'flows', label: 'Flows', icon: Zap },
    { id: 'list-growth', label: 'List Growth', icon: Users },
    { id: 'deliverability', label: 'Deliverability', icon: Shield }
  ]

  // Fetch data when timeframe changes
  useEffect(() => {
    const fetchData = async () => {
      if (!client?.brand_slug) return
      
      setLoading(true)
      try {
        const response = await fetch(`/api/dashboard?clientSlug=${client.brand_slug}&timeframe=${timeframe}`)
        const result = await response.json()
        
        if (response.ok) {
          setData(result.data)
          console.log(`Dashboard data refreshed for ${timeframe} days:`, result.data)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    // Only fetch if timeframe changed from initial load
    if (timeframe !== 365 || !initialData) {
      fetchData()
    }
  }, [timeframe, client?.brand_slug, initialData])

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${(data?.summary?.revenue?.total_revenue || 0).toLocaleString()}`}
          change="+12.5%"
          icon={DollarSign}
          trend="up"
        />
        <MetricCard
          title="Total Subscribers"
          value={(data?.summary?.audience?.total_subscribers || 0).toLocaleString()}
          change={`${(data?.summary?.audience?.growth_rate || 0).toFixed(1)}%`}
          icon={Users}
          trend="up"
        />
        <MetricCard
          title="Avg Open Rate"
          value={`${(data?.summary?.campaigns?.avg_open_rate || 0).toFixed(1)}%`}
          change="+2.1%"
          icon={Eye}
          trend="up"
        />
        <MetricCard
          title="Avg Click Rate"
          value={`${(data?.summary?.campaigns?.avg_click_rate || 0).toFixed(1)}%`}
          change="+0.8%"
          icon={MousePointer}
          trend="up"
        />
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Revenue Attribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Campaign Revenue</span>
                <span className="text-white font-semibold">
                  ${(data?.summary?.revenue?.campaign_revenue || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Flow Revenue</span>
                <span className="text-white font-semibold">
                  ${(data?.summary?.revenue?.flow_revenue || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-white/20 pt-4">
                <span className="text-white font-medium">Total Orders</span>
                <span className="text-white font-bold">
                  {(data?.summary?.revenue?.total_orders || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Engagement Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Campaigns Sent</span>
                <span className="text-white font-semibold">
                  {data?.summary?.campaigns?.total_sent || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Active Flows</span>
                <span className="text-white font-semibold">
                  {data?.summary?.flows?.active_flows || 0}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-white/20 pt-4">
                <span className="text-white font-medium">Engagement Rate</span>
                <span className="text-white font-bold">
                  {(data?.summary?.audience?.engagement_rate || 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Top Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data?.topCampaigns || []).slice(0, 5).map((campaign: any, index: number) => (
                <div key={campaign.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0">
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm truncate">{campaign.campaign_name}</p>
                    <p className="text-white/60 text-xs">{campaign.subject_line}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-white font-semibold text-sm">{(campaign.open_rate * 100).toFixed(1)}%</p>
                    <p className="text-white/60 text-xs">Open Rate</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Top Flows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data?.topFlows || []).slice(0, 5).map((flow: any, index: number) => (
                <div key={flow.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0">
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm truncate">{flow.flow_name}</p>
                    <p className="text-white/60 text-xs">{flow.flow_type}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-white font-semibold text-sm">${flow.revenue?.toLocaleString()}</p>
                    <p className="text-white/60 text-xs">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderCampaignsTab = () => (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Campaign Performance ({(data?.campaigns || []).length} campaigns)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Campaign Performance Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white/80 font-medium py-3">Campaign</th>
                    <th className="text-right text-white/80 font-medium py-3">Sent</th>
                    <th className="text-right text-white/80 font-medium py-3">Open Rate</th>
                    <th className="text-right text-white/80 font-medium py-3">Click Rate</th>
                    <th className="text-right text-white/80 font-medium py-3">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.campaigns || []).slice(0, 10).map((campaign: any) => (
                    <tr key={campaign.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3">
                        <div>
                          <p className="text-white font-medium text-sm">{campaign.campaign_name}</p>
                          <p className="text-white/60 text-xs">{campaign.subject_line}</p>
                        </div>
                      </td>
                      <td className="text-right text-white text-sm">{campaign.recipients_count?.toLocaleString()}</td>
                      <td className="text-right text-white text-sm">{(campaign.open_rate * 100)?.toFixed(1)}%</td>
                      <td className="text-right text-white text-sm">{(campaign.click_rate * 100)?.toFixed(1)}%</td>
                      <td className="text-right text-white font-semibold text-sm">${campaign.revenue?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderFlowsTab = () => (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Flow Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/80">Flow analytics will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  )

  const renderListGrowthTab = () => (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            List Growth Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/80">List growth metrics will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  )

  const renderDeliverabilityTab = () => (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Deliverability Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/80">Deliverability metrics will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{client?.brand_name || 'Dashboard'}</h1>
              <p className="text-white/60 text-sm">Analytics Dashboard</p>
            </div>
            <TimeframeSelector 
              selectedTimeframe={timeframe}
              onTimeframeChange={setTimeframe}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-white text-white bg-white/10'
                      : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-3 text-white/80">Updating data...</span>
          </div>
        )}
        
        {!loading && (
          <>
            {activeTab === 'dashboard' && renderOverviewTab()}
            {activeTab === 'campaigns' && renderCampaignsTab()}
            {activeTab === 'flows' && renderFlowsTab()}
            {activeTab === 'list-growth' && renderListGrowthTab()}
            {activeTab === 'deliverability' && renderDeliverabilityTab()}
          </>
        )}
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  change: string
  icon: any
  trend: 'up' | 'down'
}

function MetricCard({ title, value, change, icon: Icon, trend }: MetricCardProps) {
  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <ArrowUp className="w-4 h-4 text-green-400" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm font-medium ml-1 ${
                trend === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                {change}
              </span>
            </div>
          </div>
          <div className="bg-white/10 p-3 rounded-lg">
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 