'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimeframeSelector } from '@/components/ui/timeframe-selector'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  BarChart,
  Bar
} from 'recharts'
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
  const [sortField, setSortField] = useState('send_date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [expandedFlows, setExpandedFlows] = useState<Set<string>>(new Set())
  const [flowEmails, setFlowEmails] = useState<{ [flowId: string]: any[] }>({})

  // Chart data processing functions
  const getRevenueChartData = (campaigns: any[]) => {
    const revenueByDate: { [key: string]: number } = {}
    
    campaigns.forEach(campaign => {
      if (campaign.send_date && campaign.revenue) {
        const date = new Date(campaign.send_date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
        revenueByDate[date] = (revenueByDate[date] || 0) + parseFloat(campaign.revenue)
      }
    })
    
    return Object.entries(revenueByDate)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30) // Last 30 data points
  }

  const getScatterPlotData = (campaigns: any[]) => {
    return campaigns
      .filter(campaign => campaign.open_rate > 0 && campaign.click_rate > 0)
      .map(campaign => ({
        openRate: parseFloat(campaign.open_rate) * 100,
        clickRate: parseFloat(campaign.click_rate) * 100,
        name: campaign.campaign_name?.substring(0, 20) + '...' || 'Campaign'
      }))
  }

  const getFlowTrendData = (flows: any[]) => {
    // For now, create sample weekly data - will be replaced with real weekly aggregation
    const weeklyData: { [week: string]: { revenue: number, opens: number } } = {}
    
    // Generate last 8 weeks of data
    for (let i = 7; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - (i * 7))
      const weekKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      
      weeklyData[weekKey] = {
        revenue: flows.reduce((sum, flow) => sum + (flow.revenue || 0), 0) / 8, // Distribute evenly for now
        opens: flows.reduce((sum, flow) => sum + (flow.opens || 0), 0) / 8
      }
    }
    
    return Object.entries(weeklyData).map(([week, data]) => ({
      week,
      revenue: data.revenue,
      opens: data.opens
    }))
  }

  const getSubjectLineInsights = (campaigns: any[]) => {
    const insights = {
      withEmoji: { count: 0, avgOpenRate: 0, totalOpens: 0 },
      withoutEmoji: { count: 0, avgOpenRate: 0, totalOpens: 0 },
      shortLines: { count: 0, avgOpenRate: 0, totalOpens: 0 }, // <30 chars
      longLines: { count: 0, avgOpenRate: 0, totalOpens: 0 },  // >50 chars
      withPersonalization: { count: 0, avgOpenRate: 0, totalOpens: 0 },
      withUrgency: { count: 0, avgOpenRate: 0, totalOpens: 0 }
    }

    campaigns.forEach(campaign => {
      const subject = campaign.subject_line?.toLowerCase() || ''
      const openRate = campaign.open_rate || 0
      const opens = campaign.opened_count || 0

      // Emoji analysis
      const hasEmoji = /[\uD83C-\uDBFF\uDC00-\uDFFF]|[\u2600-\u27FF]/.test(subject)
      if (hasEmoji) {
        insights.withEmoji.count++
        insights.withEmoji.avgOpenRate += openRate
        insights.withEmoji.totalOpens += opens
      } else {
        insights.withoutEmoji.count++
        insights.withoutEmoji.avgOpenRate += openRate
        insights.withoutEmoji.totalOpens += opens
      }

      // Length analysis
      if (subject.length < 30) {
        insights.shortLines.count++
        insights.shortLines.avgOpenRate += openRate
        insights.shortLines.totalOpens += opens
      } else if (subject.length > 50) {
        insights.longLines.count++
        insights.longLines.avgOpenRate += openRate
        insights.longLines.totalOpens += opens
      }

      // Personalization analysis
      if (subject.includes('hi ') || subject.includes('hello ') || subject.includes('hey ') || subject.includes('[name]')) {
        insights.withPersonalization.count++
        insights.withPersonalization.avgOpenRate += openRate
        insights.withPersonalization.totalOpens += opens
      }

      // Urgency analysis
      if (subject.includes('limited') || subject.includes('urgent') || subject.includes('expires') || 
          subject.includes('last chance') || subject.includes('ending soon') || subject.includes('hurry')) {
        insights.withUrgency.count++
        insights.withUrgency.avgOpenRate += openRate
        insights.withUrgency.totalOpens += opens
      }
    })

    // Calculate averages
    Object.values(insights).forEach((insight: any) => {
      if (insight.count > 0) {
        insight.avgOpenRate = (insight.avgOpenRate / insight.count) * 100
      }
    })

    return insights
  }

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

  const renderCampaignsTab = () => {
    const campaigns = data?.campaigns || []
    
    // Calculate total campaign revenue
    const totalRevenue = campaigns.reduce((sum: number, campaign: any) => sum + (campaign.revenue || 0), 0)
    
    // Sort campaigns
    const sortedCampaigns = [...campaigns].sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]
      
      // Handle different data types
      if (typeof aVal === 'string') aVal = aVal.toLowerCase()
      if (typeof bVal === 'string') bVal = bVal.toLowerCase()
      
      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
      }
    })
    
    // Top performing subject lines (by open rate)
    const topSubjectLines = [...campaigns]
      .filter((c: any) => c.open_rate > 0)
      .sort((a, b) => b.open_rate - a.open_rate)
      .slice(0, 5)
    
    // Subject line insights
    const subjectInsights = getSubjectLineInsights(campaigns)
    
    // Send time analysis
    const sendTimeAnalysis = campaigns
      .filter((c: any) => c.send_date)
      .reduce((acc: any, campaign: any) => {
        const date = new Date(campaign.send_date)
        const hour = date.getHours()
        const dayOfWeek = date.getDay()
        
        const hourKey = `${hour}:00`
        const dayKey = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]
        
        if (!acc.byHour[hourKey]) acc.byHour[hourKey] = { count: 0, totalOpenRate: 0 }
        if (!acc.byDay[dayKey]) acc.byDay[dayKey] = { count: 0, totalOpenRate: 0 }
        
        acc.byHour[hourKey].count++
        acc.byHour[hourKey].totalOpenRate += campaign.open_rate || 0
        
        acc.byDay[dayKey].count++
        acc.byDay[dayKey].totalOpenRate += campaign.open_rate || 0
        
        return acc
      }, { byHour: {}, byDay: {} })
    
    // Calculate averages for send time analysis
    Object.keys(sendTimeAnalysis.byHour).forEach(hour => {
      const data = sendTimeAnalysis.byHour[hour]
      data.avgOpenRate = data.totalOpenRate / data.count
    })
    
    Object.keys(sendTimeAnalysis.byDay).forEach(day => {
      const data = sendTimeAnalysis.byDay[day]
      data.avgOpenRate = data.totalOpenRate / data.count
    })
    
    const handleSort = (field: string) => {
      if (sortField === field) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
      } else {
        setSortField(field)
        setSortDirection('desc')
      }
    }
    
    const getSortIcon = (field: string) => {
      if (sortField !== field) return null
      return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
    }

    return (
      <div className="space-y-6">
        {/* Campaign Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Total Campaign Revenue</p>
                  <p className="text-2xl font-bold text-white mt-1">${totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Total Campaigns</p>
                  <p className="text-2xl font-bold text-white mt-1">{campaigns.length}</p>
                  <p className="text-white/60 text-xs mt-1">
                    {campaigns.filter((c: any) => c.campaign_status === 'Sent').length} sent, {campaigns.filter((c: any) => c.campaign_status === 'Draft').length} draft
                  </p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Avg Performance</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {campaigns.length > 0 ? (campaigns.reduce((sum: number, c: any) => sum + (c.open_rate || 0), 0) / campaigns.length * 100).toFixed(1) : 0}%
                  </p>
                  <p className="text-white/60 text-xs mt-1">Average open rate</p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Campaign Revenue Chart */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Campaign Revenue Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getRevenueChartData(campaigns)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    />
                    <YAxis 
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#60A5FA"
                      strokeWidth={3}
                      dot={{ fill: '#60A5FA', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#60A5FA', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Open Rate vs Click Rate Scatter Plot */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5" />
                Open Rate vs Click Rate Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={getScatterPlotData(campaigns)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      type="number"
                      dataKey="openRate"
                      name="Open Rate"
                      unit="%"
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                      domain={[0, 'dataMax + 5']}
                    />
                    <YAxis 
                      type="number"
                      dataKey="clickRate"
                      name="Click Rate"
                      unit="%"
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                      domain={[0, 'dataMax + 2']}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(1)}%`, 
                        name === 'openRate' ? 'Open Rate' : 'Click Rate'
                      ]}
                    />
                    <Scatter 
                      dataKey="clickRate" 
                      fill="#A78BFA"
                      fillOpacity={0.8}
                      stroke="#A78BFA"
                      strokeWidth={2}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Cards Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subject Line Intelligence */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Subject Line Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Emoji Analysis */}
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-white text-sm font-medium">📧 With Emojis</div>
                    <div className="text-white/60 text-xs">{subjectInsights.withEmoji.count} campaigns</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${
                      subjectInsights.withEmoji.avgOpenRate > subjectInsights.withoutEmoji.avgOpenRate 
                        ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {subjectInsights.withEmoji.avgOpenRate.toFixed(1)}%
                    </div>
                    <div className="text-white/60 text-xs">vs {subjectInsights.withoutEmoji.avgOpenRate.toFixed(1)}% without</div>
                  </div>
                </div>

                {/* Length Analysis */}
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-white text-sm font-medium">📏 Short Lines</div>
                    <div className="text-white/60 text-xs">&lt;30 chars • {subjectInsights.shortLines.count} campaigns</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${
                      subjectInsights.shortLines.avgOpenRate > subjectInsights.longLines.avgOpenRate 
                        ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {subjectInsights.shortLines.avgOpenRate.toFixed(1)}%
                    </div>
                    <div className="text-white/60 text-xs">vs {subjectInsights.longLines.avgOpenRate.toFixed(1)}% long</div>
                  </div>
                </div>

                {/* Personalization Analysis */}
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-white text-sm font-medium">👤 Personalized</div>
                    <div className="text-white/60 text-xs">{subjectInsights.withPersonalization.count} campaigns</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-300 text-sm font-semibold">
                      {subjectInsights.withPersonalization.avgOpenRate.toFixed(1)}%
                    </div>
                    <div className="text-white/60 text-xs">open rate</div>
                  </div>
                </div>

                {/* Urgency Analysis */}
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-white text-sm font-medium">⚡ Urgency Words</div>
                    <div className="text-white/60 text-xs">{subjectInsights.withUrgency.count} campaigns</div>
                  </div>
                  <div className="text-right">
                    <div className="text-purple-300 text-sm font-semibold">
                      {subjectInsights.withUrgency.avgOpenRate.toFixed(1)}%
                    </div>
                    <div className="text-white/60 text-xs">avg performance</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Top Performing Subject Lines */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Performing Subject Lines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topSubjectLines.map((campaign: any, index: number) => (
                  <div key={campaign.id} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="text-white font-medium text-sm">{campaign.subject_line}</p>
                          <p className="text-white/60 text-xs">{campaign.campaign_name}</p>
                          <p className="text-white/40 text-xs mt-1">
                            👥 {campaign.recipients_count?.toLocaleString()} recipients • 💰 ${campaign.revenue?.toLocaleString() || '0'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-white font-semibold text-sm">{(campaign.open_rate * 100).toFixed(1)}%</p>
                      <p className="text-white/60 text-xs">{(campaign.click_rate * 100).toFixed(1)}% CTR</p>
                      <p className="text-white/40 text-xs">{campaign.opened_count?.toLocaleString()} opens</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Send Time Analysis */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Send Time Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Best Day Analysis */}
                <div>
                  <p className="text-white/80 text-sm font-medium mb-2">Best Performing Days</p>
                  <div className="space-y-2">
                    {Object.entries(sendTimeAnalysis.byDay)
                      .sort(([,a]: any, [,b]: any) => b.avgOpenRate - a.avgOpenRate)
                      .slice(0, 3)
                      .map(([day, data]: any) => (
                        <div key={day} className="flex justify-between items-center">
                          <span className="text-white/70 text-sm">{day}</span>
                          <div className="text-right">
                            <span className="text-white font-semibold text-sm">
                              {(data.avgOpenRate * 100).toFixed(1)}%
                            </span>
                            <span className="text-white/60 text-xs ml-2">({data.count} campaigns)</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Complete Hour Analysis - Show ALL times */}
                <div className="border-t border-white/20 pt-4">
                  <p className="text-white/80 text-sm font-medium mb-2">Send Time Performance (All Hours)</p>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {Object.entries(sendTimeAnalysis.byHour)
                      .sort(([,a]: any, [,b]: any) => b.avgOpenRate - a.avgOpenRate)
                      .map(([hour, data]: any, index: number) => {
                        const isTop3 = index < 3
                        const isBottom3 = index >= Object.keys(sendTimeAnalysis.byHour).length - 3
                        return (
                          <div key={hour} className={`flex justify-between items-center p-2 rounded ${
                            isTop3 ? 'bg-green-500/20 border border-green-500/30' :
                            isBottom3 ? 'bg-red-500/20 border border-red-500/30' :
                            'bg-white/5'
                          }`}>
                            <span className="text-white/70 text-xs">{hour}</span>
                            <div className="text-right">
                              <span className={`font-semibold text-xs ${
                                isTop3 ? 'text-green-300' :
                                isBottom3 ? 'text-red-300' :
                                'text-white'
                              }`}>
                                {(data.avgOpenRate * 100).toFixed(1)}%
                              </span>
                              <div className="text-white/40 text-xs">({data.count})</div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                  <div className="mt-3 text-white/60 text-xs">
                    🟢 Top performers • 🔴 Underperformers • Compare all send times
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Performance Table */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Campaign Performance ({campaigns.length} campaigns)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th 
                      className="text-left text-white/80 font-medium py-3 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('campaign_name')}
                    >
                      <div className="flex items-center gap-1">
                        Campaign
                        {getSortIcon('campaign_name')}
                      </div>
                    </th>
                    <th 
                      className="text-left text-white/80 font-medium py-3 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('campaign_status')}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        {getSortIcon('campaign_status')}
                      </div>
                    </th>
                    <th 
                      className="text-right text-white/80 font-medium py-3 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('send_date')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Send Date
                        {getSortIcon('send_date')}
                      </div>
                    </th>
                    <th 
                      className="text-right text-white/80 font-medium py-3 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('recipients_count')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Recipients
                        {getSortIcon('recipients_count')}
                      </div>
                    </th>
                    <th 
                      className="text-right text-white/80 font-medium py-3 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('open_rate')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Open Rate
                        {getSortIcon('open_rate')}
                      </div>
                    </th>
                    <th 
                      className="text-right text-white/80 font-medium py-3 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('click_rate')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Click Rate
                        {getSortIcon('click_rate')}
                      </div>
                    </th>
                    <th 
                      className="text-right text-white/80 font-medium py-3 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('revenue')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Revenue
                        {getSortIcon('revenue')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCampaigns.map((campaign: any) => (
                    <tr key={campaign.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="py-4">
                        <div>
                          <p className="text-white font-medium text-sm">{campaign.campaign_name}</p>
                          <p className="text-white/60 text-xs mt-1">{campaign.subject_line}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.campaign_status === 'Sent' 
                            ? 'bg-green-500/20 text-green-300' 
                            : campaign.campaign_status === 'Draft'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {campaign.campaign_status}
                        </span>
                      </td>
                      <td className="text-right text-white/80 text-sm py-4">
                        {campaign.send_date ? new Date(campaign.send_date).toLocaleDateString() : 'Not scheduled'}
                      </td>
                      <td className="text-right text-white text-sm py-4">
                        {campaign.recipients_count?.toLocaleString() || '0'}
                      </td>
                      <td className="text-right text-white text-sm py-4">
                        <span className={`${
                          (campaign.open_rate * 100) > 25 ? 'text-green-300' : 
                          (campaign.open_rate * 100) > 15 ? 'text-yellow-300' : 'text-red-300'
                        }`}>
                          {(campaign.open_rate * 100)?.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-right text-white text-sm py-4">
                        <span className={`${
                          (campaign.click_rate * 100) > 3 ? 'text-green-300' : 
                          (campaign.click_rate * 100) > 1 ? 'text-yellow-300' : 'text-red-300'
                        }`}>
                          {(campaign.click_rate * 100)?.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-right text-white font-semibold text-sm py-4">
                        ${campaign.revenue?.toLocaleString() || '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderFlowsTab = () => {
    const flows = data?.flows || []
    
    // Calculate total flow revenue
    const totalFlowRevenue = flows.reduce((sum: number, flow: any) => sum + (flow.revenue || 0), 0)
    
    const toggleFlowExpansion = async (flowId: string) => {
      const newExpanded = new Set(expandedFlows)
      if (newExpanded.has(flowId)) {
        newExpanded.delete(flowId)
      } else {
        newExpanded.add(flowId)
        
        // Load emails for this flow if not already loaded
        if (!flowEmails[flowId]) {
          try {
            const response = await fetch(`/api/flow-emails?flowId=${flowId}&clientSlug=${client?.brand_slug}`)
            const result = await response.json()
            
            if (response.ok) {
              setFlowEmails(prev => ({
                ...prev,
                [flowId]: result.emails || []
              }))
              console.log(`📧 FRONTEND: Loaded ${result.count} emails for flow ${flowId}`)
            }
          } catch (error) {
            console.error('Error loading flow emails:', error)
          }
        }
      }
      setExpandedFlows(newExpanded)
    }
    
    // Get flow performance data for charts
    const flowRevenueData = flows.map((flow: any) => ({
      name: flow.flow_name?.substring(0, 15) + '...' || 'Untitled',
      revenue: parseFloat(flow.revenue || 0),
      opens: flow.opens || 0,
      clicks: flow.clicks || 0
    })).sort((a: any, b: any) => b.revenue - a.revenue)

    // Get real weekly trend data from dashboard API
    const weeklyTrendData = data?.flowWeeklyTrends || getFlowTrendData(flows)

    return (
      <div className="space-y-6">
        {/* Flow Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Total Flow Revenue</p>
                  <p className="text-2xl font-bold text-white mt-1">${totalFlowRevenue.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-green-300 text-xs">↗️ +12.5%</span>
                    <span className="text-white/40 text-xs">vs last period</span>
                  </div>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Active Flows</p>
                  <p className="text-2xl font-bold text-white mt-1">{flows.length}</p>
                  <p className="text-white/60 text-xs mt-1">
                    {flows.filter((f: any) => f.flow_status === 'live').length} live, {flows.filter((f: any) => f.flow_status === 'draft').length} draft
                  </p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Avg Performance</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {flows.length > 0 ? (flows.reduce((sum: number, f: any) => sum + (f.open_rate || 0), 0) / flows.length * 100).toFixed(1) : 0}%
                  </p>
                  <p className="text-white/60 text-xs mt-1">Average open rate</p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Flow Performance Over Time */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Flow Performance Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="week" 
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    />
                    <YAxis 
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#A78BFA"
                      strokeWidth={3}
                      dot={{ fill: '#A78BFA', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="opens" 
                      stroke="#60A5FA"
                      strokeWidth={2}
                      dot={{ fill: '#60A5FA', strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 2. Flow Revenue Comparison */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Flow Revenue Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={flowRevenueData.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill="#A78BFA"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 10. Flow Performance Table */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Flow Performance Table
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white/80 font-medium text-sm py-3 px-2">Flow Name</th>
                    <th className="text-right text-white/80 font-medium text-sm py-3 px-2">Status</th>
                    <th className="text-right text-white/80 font-medium text-sm py-3 px-2">Opens</th>
                    <th className="text-right text-white/80 font-medium text-sm py-3 px-2">Clicks</th>
                    <th className="text-right text-white/80 font-medium text-sm py-3 px-2">Open Rate</th>
                    <th className="text-right text-white/80 font-medium text-sm py-3 px-2">Click Rate</th>
                                         <th className="text-right text-white/80 font-medium text-sm py-3 px-2" title="Total revenue generated by this flow">Revenue 💰</th>
                  </tr>
                </thead>
                                 <tbody>
                   {flows.map((flow: any, index: number) => (
                     <>
                       <tr key={flow.id} className={index !== flows.length - 1 ? 'border-b border-white/10' : ''}>
                                                <td className="text-white text-sm py-4 px-2">
                         <div className="flex items-center gap-2">
                           <button
                             onClick={() => toggleFlowExpansion(flow.flow_id)}
                             className="text-white/60 hover:text-white transition-colors"
                           >
                             {expandedFlows.has(flow.flow_id) ? '−' : '+'}
                           </button>
                           <div className="flex items-center gap-2">
                             {/* Performance Badge */}
                             <div className={`w-2 h-2 rounded-full ${
                               (flow.open_rate * 100) > 50 ? 'bg-green-400' :
                               (flow.open_rate * 100) > 25 ? 'bg-yellow-400' : 'bg-red-400'
                             }`}></div>
                             <div>
                               <div className="font-medium">{flow.flow_name || 'Untitled Flow'}</div>
                               <div className="text-white/60 text-xs flex items-center gap-2">
                                 <span>{flow.trigger_type || 'Unknown trigger'}</span>
                                 <span className={`px-2 py-0.5 rounded-full text-xs ${
                                   (flow.open_rate * 100) > 50 ? 'bg-green-500/20 text-green-300' :
                                   (flow.open_rate * 100) > 25 ? 'bg-yellow-500/20 text-yellow-300' : 
                                   'bg-red-500/20 text-red-300'
                                 }`}>
                                   {(flow.open_rate * 100) > 50 ? '🟢 Excellent' :
                                    (flow.open_rate * 100) > 25 ? '🟡 Good' : '🔴 Needs Attention'}
                                 </span>
                               </div>
                             </div>
                           </div>
                         </div>
                       </td>
                      <td className="text-right text-white text-sm py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          flow.flow_status === 'live' ? 'bg-green-500/20 text-green-300' : 
                          flow.flow_status === 'draft' ? 'bg-yellow-500/20 text-yellow-300' : 
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {flow.flow_status || 'Unknown'}
                        </span>
                      </td>
                      <td className="text-right text-white text-sm py-4">
                        {flow.opens?.toLocaleString() || '0'}
                      </td>
                      <td className="text-right text-white text-sm py-4">
                        {flow.clicks?.toLocaleString() || '0'}
                      </td>
                      <td className="text-right text-white text-sm py-4">
                        <span className={`${
                          (flow.open_rate * 100) > 25 ? 'text-green-300' : 
                          (flow.open_rate * 100) > 15 ? 'text-yellow-300' : 'text-red-300'
                        }`}>
                          {(flow.open_rate * 100)?.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-right text-white text-sm py-4">
                        <span className={`${
                          (flow.click_rate * 100) > 3 ? 'text-green-300' : 
                          (flow.click_rate * 100) > 1 ? 'text-yellow-300' : 'text-red-300'
                        }`}>
                          {(flow.click_rate * 100)?.toFixed(1)}%
                        </span>
                      </td>
                                             <td className="text-right text-white font-semibold text-sm py-4">
                         ${flow.revenue?.toLocaleString() || '0'}
                       </td>
                     </tr>
                     
                     {/* Expandable email rows */}
                     {expandedFlows.has(flow.flow_id) && (
                       <tr>
                         <td colSpan={7} className="bg-white/5 px-4 py-3">
                           <div className="text-white/80 text-sm">
                             <div className="font-medium mb-2">Emails in this flow ({flow.emails?.length || 0}):</div>
                             {flow.emails && flow.emails.length > 0 ? (
                               <div className="space-y-2">
                                 <div className="text-white/60 text-xs grid grid-cols-6 gap-4 font-medium border-b border-white/20 pb-2">
                                   <span>Subject Line</span>
                                   <span>Opens</span>
                                   <span>Clicks</span>
                                   <span>Open Rate</span>
                                   <span>Click Rate</span>
                                   <span>Revenue</span>
                                 </div>
                                 {flow.emails.map((email: any, emailIndex: number) => (
                                   <div key={email.message_id} className="text-white/70 text-xs grid grid-cols-6 gap-4 py-1">
                                     <span className="truncate">{email.subject_line}</span>
                                     <span>{email.opens?.toLocaleString()}</span>
                                     <span>{email.clicks?.toLocaleString()}</span>
                                     <span className={`${
                                       email.open_rate > 25 ? 'text-green-300' :
                                       email.open_rate > 15 ? 'text-yellow-300' : 'text-red-300'
                                     }`}>
                                       {email.open_rate?.toFixed(1)}%
                                     </span>
                                     <span className={`${
                                       email.click_rate > 3 ? 'text-green-300' :
                                       email.click_rate > 1 ? 'text-yellow-300' : 'text-red-300'
                                     }`}>
                                       {email.click_rate?.toFixed(1)}%
                                     </span>
                                     <span>${email.revenue?.toLocaleString()}</span>
                                   </div>
                                 ))}
                               </div>
                             ) : (
                               <div className="text-white/60 text-xs">
                                 No email data available for this flow
                               </div>
                             )}
                           </div>
                         </td>
                       </tr>
                     )}
                   </>
                   ))}
                 </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

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
        
        {loading && (
          <div className="space-y-6 animate-pulse">
            {/* Loading skeleton for cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-white/10 rounded-lg"></div>
              ))}
            </div>
            {/* Loading skeleton for charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-80 bg-white/10 rounded-lg"></div>
              ))}
            </div>
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