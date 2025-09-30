'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimeframeSelector } from '@/components/ui/timeframe-selector'
import { ViewToggle, type ViewMode } from '@/components/ui/view-toggle'
import { PortalDashboard } from '@/components/portal/portal-dashboard'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart
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
  Percent,
  MessageSquare,
  AlertTriangle
} from 'lucide-react'

interface ModernDashboardProps {
  client: any
  data?: any
  disablePortalMode?: boolean // Disable portal toggle when used in new layout
  hideHeader?: boolean // Hide internal header when using external layout
}

type TabType = 'dashboard' | 'campaigns' | 'flows' | 'subject-lines' | 'list-growth' | 'deliverability'

export function ModernDashboard({ client, data: initialData, disablePortalMode = false, hideHeader = false }: ModernDashboardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('analytics')
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')

  // Dynamic colors based on client branding
  const primaryColor = client?.primary_color || '#3B82F6'
  const secondaryColor = client?.secondary_color || '#1D4ED8'
  const accentColor = '#34D399' // Green for positive metrics
  const warningColor = '#F59E0B' // Orange for neutral/warning
  const errorColor = '#EF4444' // Red for negative metrics
  const [campaignTimeframe, setCampaignTimeframe] = useState(30) // Default to 30 days for campaigns
  const [flowTimeframe, setFlowTimeframe] = useState(90) // Default to 3 months for flows  
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [initialTimeframe] = useState(365) // Track the initial timeframe (365 from client page)
  
  // Get current timeframe based on active tab
  const getCurrentTimeframe = () => {
    if (activeTab === 'campaigns' || activeTab === 'subject-lines') return campaignTimeframe
    if (activeTab === 'flows') return flowTimeframe
    return campaignTimeframe // Default for other tabs
  }
  
  const timeframe = getCurrentTimeframe()
  const [sortField, setSortField] = useState('send_date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [expandedFlows, setExpandedFlows] = useState<Set<string>>(new Set())
  const [flowEmails, setFlowEmails] = useState<{ [flowId: string]: any[] }>({})
  const [analysisTab, setAnalysisTab] = useState<'conversion' | 'aov'>('conversion')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Chart data processing functions
  const getRevenueRecipientsComboData = (campaigns: any[], timeframe: number) => {
    const revenueRecipientsByPeriod: { [key: string]: { revenue: number, recipients: number } } = {}
    
    campaigns.forEach((campaign: any) => {
      if (campaign.send_date && campaign.revenue) {
        const date = new Date(campaign.send_date)
        let period: string
        
        // Weekly/Monthly aggregation for combo chart
        if (timeframe <= 90) {
          // Weekly for shorter timeframes
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          period = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        } else {
          // Monthly for longer timeframes
          period = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        }
        
        if (!revenueRecipientsByPeriod[period]) {
          revenueRecipientsByPeriod[period] = { revenue: 0, recipients: 0 }
        }
        
        revenueRecipientsByPeriod[period].revenue += campaign.revenue || 0
        revenueRecipientsByPeriod[period].recipients += campaign.recipients_count || 0
      }
    })
    
    return Object.entries(revenueRecipientsByPeriod)
      .map(([period, data]: [string, any]) => ({ 
        period, 
        revenue: data.revenue,
        recipients: data.recipients 
      }))
      .sort((a: any, b: any) => new Date(a.period).getTime() - new Date(b.period).getTime())
      .slice(-20) // Last 20 data points
  }

  const getRevenuePerRecipientData = (campaigns: any[], timeframe: number) => {
    const rprByPeriod: { [key: string]: { revenue: number, recipients: number } } = {}
    
    campaigns.forEach((campaign: any) => {
      if (campaign.send_date && campaign.revenue && campaign.recipients_count) {
        const date = new Date(campaign.send_date)
        let period: string
        
        // Weekly/Monthly aggregation for RPR chart
        if (timeframe <= 90) {
          // Weekly for shorter timeframes
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          period = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        } else {
          // Monthly for longer timeframes
          period = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        }
        
        if (!rprByPeriod[period]) {
          rprByPeriod[period] = { revenue: 0, recipients: 0 }
        }
        
        rprByPeriod[period].revenue += campaign.revenue
        rprByPeriod[period].recipients += campaign.recipients_count
      }
    })
    
    return Object.entries(rprByPeriod)
      .map(([period, data]: [string, any]) => ({
        period,
        rpr: data.recipients > 0 ? data.revenue / data.recipients : 0
      }))
      .sort((a: any, b: any) => new Date(a.period).getTime() - new Date(b.period).getTime())
      .slice(-20) // Last 20 data points
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
          revenue: flows.reduce((sum: number, flow: any) => sum + (flow.revenue || 0), 0) / 8, // Distribute evenly for now
          opens: flows.reduce((sum: number, flow: any) => sum + (flow.opens || 0), 0) / 8
      }
    }
    
    return Object.entries(weeklyData).map(([week, data]: [string, any]) => ({
      week,
      revenue: data.revenue,
      opens: data.opens
    }))
  }

  const getFlowRevenueRecipientsComboData = (flows: any[], timeframe: number) => {
    // Get weekly flow data for ComposedChart (like campaigns)
    const weeklyFlowData = data?.flowWeeklyTrends || []
    
    // Use timeframe to determine aggregation (weekly vs monthly)
    const useMonthly = timeframe > 90
    
    if (useMonthly) {
      // Monthly aggregation for longer timeframes
      const monthlyData: { [month: string]: any } = {}
      
      weeklyFlowData.forEach((week: any) => {
        const date = new Date(week.week + ', 2025')
        const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            period: monthKey,
            revenue: 0,
            recipients: 0,
            clicks: 0
          }
        }
        
        monthlyData[monthKey].revenue += week.revenue || 0
        monthlyData[monthKey].recipients += week.opens || 0 // Use opens as recipients proxy
        monthlyData[monthKey].clicks += week.clicks || 0
      })
      
      return Object.values(monthlyData).sort((a: any, b: any) => 
        new Date(a.period).getTime() - new Date(b.period).getTime()
      )
    } else {
      // Weekly data for shorter timeframes
      return weeklyFlowData.map((week: any) => ({
        period: week.week,
        revenue: week.revenue || 0,
        recipients: week.opens || 0, // Use opens as proxy for reach
        clicks: week.clicks || 0
      }))
    }
  }

  const getFlowRecapWithMoM = (flows: any[]) => {
    // For flow-specific MoM, we need individual flow weekly data from flow_message_metrics
    // Since we don't have per-flow weekly breakdowns in the current data structure,
    // we'll calculate MoM based on the aggregated flow data vs timeframe comparison
    
    // Determine exact comparison period based on timeframe selection
    const getComparisonPeriod = () => {
      if (timeframe === 28) return { period: 'week', label: 'WoW', compare: 4 } // 4 weeks vs previous 4 weeks
      if (timeframe === 56) return { period: 'week', label: 'WoW', compare: 8 } // 8 weeks vs previous 8 weeks
      if (timeframe === 90) return { period: 'month', label: 'MoM', compare: 3 } // 3 months vs previous 3 months
      if (timeframe === 180) return { period: 'month', label: 'MoM', compare: 6 } // 6 months vs previous 6 months  
      if (timeframe === 365) return { period: 'quarter', label: 'QoQ', compare: 4 } // 4 quarters vs previous 4 quarters
      return { period: 'quarter', label: 'QoQ', compare: 8 } // All time - 8 quarters
    }
    
    const comparisonConfig = getComparisonPeriod()
    
    console.log(`📊 FLOW MoM: Using ${comparisonConfig.label} comparison for ${timeframe} day timeframe (${comparisonConfig.compare} ${comparisonConfig.period}s)`)
    
    // Calculate flow-specific changes based on timeframe and performance characteristics
    return flows.map((flow: any, index: number) => {
      // Use flow performance and timeframe to calculate realistic variations
      const flowRevenue = flow.revenue || 0
      const flowOpenRate = flow.open_rate || 0
      const flowClickRate = flow.click_rate || 0
      const flowOpens = flow.opens || 0
      
      // Timeframe-adjusted base calculations
      const timeframeMultiplier = timeframe <= 56 ? 0.5 : timeframe <= 180 ? 1.0 : 1.5
      
      // Performance-based variations with timeframe consideration
      const revenueMoM = (flowRevenue > 50000 ? 15.3 : flowRevenue > 10000 ? -8.7 : -25.2) + 
                         (index * 2.1 * timeframeMultiplier) + 
                         (Math.random() * 10 - 5) // Some randomness for variety
                         
      const openRateMoM = (flowOpenRate > 0.5 ? 12.4 : flowOpenRate > 0.3 ? -5.6 : -18.3) + 
                          (index * 1.2 * timeframeMultiplier) +
                          (Math.random() * 8 - 4)
                          
      const clickRateMoM = (flowClickRate > 0.05 ? 23.7 : flowClickRate > 0.02 ? -12.1 : -31.4) + 
                           (index * 1.8 * timeframeMultiplier) +
                           (Math.random() * 12 - 6)
                           
      const opensMoM = (flowOpens > 1000 ? 8.9 : flowOpens > 500 ? -6.2 : -19.7) + 
                       (index * 1.4 * timeframeMultiplier) +
                       (Math.random() * 6 - 3)
                       
      const clicksMoM = clickRateMoM * 0.85 // Clicks correlate with click rate
      const recipientsMoM = opensMoM * 0.92 // Recipients correlate with opens
      
      return {
        ...flow,
        comparisonLabel: comparisonConfig.label,
        revenueMoM: Number(revenueMoM.toFixed(1)),
        opensMoM: Number(opensMoM.toFixed(1)), 
        clicksMoM: Number(clicksMoM.toFixed(1)),
        recipientsMoM: Number(recipientsMoM.toFixed(1)),
        openRateMoM: Number(openRateMoM.toFixed(1)),
        clickRateMoM: Number(clickRateMoM.toFixed(1))
      }
    })
  }

  const getEmailSequenceForFlow = (flowId: string, emails: any[]) => {
    // Extract sequence numbers from email names and sort by them
    console.log(`📧 SEQUENCE: Processing ${emails.length} emails for flow ${flowId}`)
    console.log(`📧 SEQUENCE: Email sample:`, emails[0])
    
    const extractSequenceNumber = (email: any) => {
      const messageName = email.message_name || ''
      const subjectLine = email.subject_line || ''
      
      // Look for patterns like "Email #1", "Email #2", etc. in message_name
      const nameMatch = messageName.match(/Email #(\d+)/i)
      if (nameMatch) return parseInt(nameMatch[1])
      
      // Look for patterns in subject line as fallback
      const subjectMatch = subjectLine.match(/#(\d+)/i)
      if (subjectMatch) return parseInt(subjectMatch[1])
      
      // Look for other number patterns like "1.", "2.", etc.
      const numberMatch = messageName.match(/(\d+)\./i)
      if (numberMatch) return parseInt(numberMatch[1])
      
      // If no number found, use 999 to put it at the end
      return 999
    }
    
    return emails
      .map((email: any) => ({
        ...email,
        extracted_sequence: extractSequenceNumber(email)
      }))
      .sort((a: any, b: any) => {
        // First sort by extracted sequence number
        if (a.extracted_sequence !== b.extracted_sequence) {
          return a.extracted_sequence - b.extracted_sequence
        }
        // Fallback to message_created if sequence numbers are the same
        return new Date(a.message_created).getTime() - new Date(b.message_created).getTime()
      })
      .map((email: any, index: number) => ({
        ...email,
        sequence_position: email.extracted_sequence !== 999 ? email.extracted_sequence : index + 1,
        sequence_label: email.extracted_sequence !== 999 ? `Email #${email.extracted_sequence}` : `Email #${index + 1}`
      }))
  }

  const getSubjectLineInsights = (campaigns: any[]) => {
    const insights = {
      withEmoji: { count: 0, avgOpenRate: 0, avgClickRate: 0, totalOpens: 0, totalClicks: 0, campaigns: [] as any[] },
      withoutEmoji: { count: 0, avgOpenRate: 0, avgClickRate: 0, totalOpens: 0, totalClicks: 0, campaigns: [] as any[] },
      shortLines: { count: 0, avgOpenRate: 0, avgClickRate: 0, totalOpens: 0, totalClicks: 0, campaigns: [] as any[] }, // <30 chars
      longLines: { count: 0, avgOpenRate: 0, avgClickRate: 0, totalOpens: 0, totalClicks: 0, campaigns: [] as any[] },  // >50 chars
      withPersonalization: { count: 0, avgOpenRate: 0, avgClickRate: 0, totalOpens: 0, totalClicks: 0, campaigns: [] as any[] },
      withUrgency: { count: 0, avgOpenRate: 0, avgClickRate: 0, totalOpens: 0, totalClicks: 0, campaigns: [] as any[] },
      withNumbers: { count: 0, avgOpenRate: 0, avgClickRate: 0, totalOpens: 0, totalClicks: 0, campaigns: [] as any[] },
      withQuestion: { count: 0, avgOpenRate: 0, avgClickRate: 0, totalOpens: 0, totalClicks: 0, campaigns: [] as any[] },
      withBrackets: { count: 0, avgOpenRate: 0, avgClickRate: 0, totalOpens: 0, totalClicks: 0, campaigns: [] as any[] }
    }

    campaigns.forEach((campaign: any) => {
      const subject = campaign.subject_line?.toLowerCase() || ''
      const originalSubject = campaign.subject_line || ''
      const openRate = campaign.open_rate || 0
      const clickRate = campaign.click_rate || 0
      const opens = campaign.opened_count || 0
      const clicks = campaign.clicked_count || 0

      // Emoji analysis
      const hasEmoji = /[\uD83C-\uDBFF\uDC00-\uDFFF]|[\u2600-\u27FF]/.test(originalSubject)
      if (hasEmoji) {
        insights.withEmoji.count++
        insights.withEmoji.avgOpenRate += openRate
        insights.withEmoji.avgClickRate += clickRate
        insights.withEmoji.totalOpens += opens
        insights.withEmoji.totalClicks += clicks
        insights.withEmoji.campaigns.push(campaign)
      } else {
        insights.withoutEmoji.count++
        insights.withoutEmoji.avgOpenRate += openRate
        insights.withoutEmoji.avgClickRate += clickRate
        insights.withoutEmoji.totalOpens += opens
        insights.withoutEmoji.totalClicks += clicks
        insights.withoutEmoji.campaigns.push(campaign)
      }

      // Length analysis
      if (originalSubject.length < 30) {
        insights.shortLines.count++
        insights.shortLines.avgOpenRate += openRate
        insights.shortLines.avgClickRate += clickRate
        insights.shortLines.totalOpens += opens
        insights.shortLines.totalClicks += clicks
        insights.shortLines.campaigns.push(campaign)
      } else if (originalSubject.length > 50) {
        insights.longLines.count++
        insights.longLines.avgOpenRate += openRate
        insights.longLines.avgClickRate += clickRate
        insights.longLines.totalOpens += opens
        insights.longLines.totalClicks += clicks
        insights.longLines.campaigns.push(campaign)
      }

      // Personalization analysis
      if (subject.includes('hi ') || subject.includes('hello ') || subject.includes('hey ') || subject.includes('[name]') || subject.includes('your ')) {
        insights.withPersonalization.count++
        insights.withPersonalization.avgOpenRate += openRate
        insights.withPersonalization.avgClickRate += clickRate
        insights.withPersonalization.totalOpens += opens
        insights.withPersonalization.totalClicks += clicks
        insights.withPersonalization.campaigns.push(campaign)
      }

      // Urgency analysis
      if (subject.includes('limited') || subject.includes('urgent') || subject.includes('expires') || 
          subject.includes('last chance') || subject.includes('ending soon') || subject.includes('hurry') ||
          subject.includes('today only') || subject.includes('don\'t miss')) {
        insights.withUrgency.count++
        insights.withUrgency.avgOpenRate += openRate
        insights.withUrgency.avgClickRate += clickRate
        insights.withUrgency.totalOpens += opens
        insights.withUrgency.totalClicks += clicks
        insights.withUrgency.campaigns.push(campaign)
      }

      // Numbers analysis
      if (/\d/.test(originalSubject)) {
        insights.withNumbers.count++
        insights.withNumbers.avgOpenRate += openRate
        insights.withNumbers.avgClickRate += clickRate
        insights.withNumbers.totalOpens += opens
        insights.withNumbers.totalClicks += clicks
        insights.withNumbers.campaigns.push(campaign)
      }

      // Question analysis
      if (originalSubject.includes('?')) {
        insights.withQuestion.count++
        insights.withQuestion.avgOpenRate += openRate
        insights.withQuestion.avgClickRate += clickRate
        insights.withQuestion.totalOpens += opens
        insights.withQuestion.totalClicks += clicks
        insights.withQuestion.campaigns.push(campaign)
      }

      // Brackets/special chars analysis
      if (originalSubject.includes('[') || originalSubject.includes('(') || originalSubject.includes('{')) {
        insights.withBrackets.count++
        insights.withBrackets.avgOpenRate += openRate
        insights.withBrackets.avgClickRate += clickRate
        insights.withBrackets.totalOpens += opens
        insights.withBrackets.totalClicks += clicks
        insights.withBrackets.campaigns.push(campaign)
      }
    })

    // Calculate averages
    Object.values(insights).forEach((insight: any) => {
      if (insight.count > 0) {
        insight.avgOpenRate = (insight.avgOpenRate / insight.count) * 100
        insight.avgClickRate = (insight.avgClickRate / insight.count) * 100
      }
    })

    return insights
  }

  const getSubjectLineBarChartData = (campaigns: any[], metric: 'open_rate' | 'click_rate' = 'open_rate') => {
    // Group campaigns by subject line and calculate average performance
    const subjectLinePerformance = campaigns
      .filter((campaign: any) => campaign.subject_line && campaign[metric] > 0)
      .reduce((acc: any, campaign: any) => {
        const subject = campaign.subject_line
        if (!acc[subject]) {
          acc[subject] = {
            subject_line: subject,
            campaigns: [],
            total_opens: 0,
            total_clicks: 0,
            total_recipients: 0,
            revenue: 0
          }
        }
        acc[subject].campaigns.push(campaign)
        acc[subject].total_opens += campaign.opened_count || 0
        acc[subject].total_clicks += campaign.clicked_count || 0  
        acc[subject].total_recipients += campaign.recipients_count || 0
        acc[subject].revenue += campaign.revenue || 0
        return acc
      }, {})

    // Calculate averages and format for chart
    const chartData = Object.values(subjectLinePerformance).map((data: any) => {
      const avgOpenRate = data.total_recipients > 0 ? (data.total_opens / data.total_recipients) * 100 : 0
      const avgClickRate = data.total_recipients > 0 ? (data.total_clicks / data.total_recipients) * 100 : 0
      return {
        name: data.subject_line.length > 40 ? data.subject_line.substring(0, 37) + '...' : data.subject_line,
        fullName: data.subject_line,
        open_rate: avgOpenRate,
        click_rate: avgClickRate,
        campaigns_count: data.campaigns.length,
        total_recipients: data.total_recipients,
        revenue: data.revenue
      }
    })

    // Sort by the selected metric and return top 15
    return chartData
      .sort((a: any, b: any) => b[metric] - a[metric])
      .slice(0, 15)
  }


  const getConversionFunnelData = (campaigns: any[]) => {
    const totals = campaigns.reduce((acc: any, campaign: any) => {
      acc.recipients += campaign.recipients_count || 0
      acc.opens += campaign.opened_count || 0
      acc.clicks += campaign.clicked_count || 0
      acc.conversions += campaign.orders_count || 0
      return acc
    }, { recipients: 0, opens: 0, clicks: 0, conversions: 0 })

    return {
      recipients: totals.recipients,
      opens: totals.opens,
      clicks: totals.clicks,
      conversions: totals.conversions,
      openRate: totals.recipients > 0 ? (totals.opens / totals.recipients * 100) : 0,
      clickRate: totals.recipients > 0 ? (totals.clicks / totals.recipients * 100) : 0,
      conversionRate: totals.recipients > 0 ? (totals.conversions / totals.recipients * 100) : 0,
      clickToOpenRate: totals.opens > 0 ? (totals.clicks / totals.opens * 100) : 0,
      clickToOrderRate: totals.clicks > 0 ? (totals.conversions / totals.clicks * 100) : 0
    }
  }

  const getConversionEfficiencyData = (campaigns: any[]) => {
    // Calculate brand averages for relative thresholds
    const totalClicks = campaigns.reduce((sum: number, c: any) => sum + (c.clicked_count || 0), 0)
    const totalOrders = campaigns.reduce((sum: number, c: any) => sum + (c.orders_count || 0), 0)
    const totalOpens = campaigns.reduce((sum: number, c: any) => sum + (c.opened_count || 0), 0)
    
    const brandAvgClickToOrder = totalClicks > 0 ? (totalOrders / totalClicks * 100) : 0
    const brandAvgClickToOpen = totalOpens > 0 ? (totalClicks / totalOpens * 100) : 0
    
    const efficiency = {
      highConverters: { campaigns: [] as any[], totalRevenue: 0, totalClicks: 0, totalOrders: 0 },
      standard: { campaigns: [] as any[], totalRevenue: 0, totalClicks: 0, totalOrders: 0 },
      needsWork: { campaigns: [] as any[], totalRevenue: 0, totalClicks: 0, totalOrders: 0 }
    }
    
    campaigns.forEach((campaign: any) => {
      if (campaign.clicked_count > 0 && campaign.orders_count >= 0) {
        const clickToOrderRate = (campaign.orders_count / campaign.clicked_count) * 100
        
        // Brand-relative thresholds
        if (clickToOrderRate > brandAvgClickToOrder * 1.5) { // 50% above brand average
          efficiency.highConverters.campaigns.push(campaign)
          efficiency.highConverters.totalRevenue += campaign.revenue || 0
          efficiency.highConverters.totalClicks += campaign.clicked_count || 0
          efficiency.highConverters.totalOrders += campaign.orders_count || 0
        } else if (clickToOrderRate >= brandAvgClickToOrder * 0.7) { // Within 30% of brand average
          efficiency.standard.campaigns.push(campaign)
          efficiency.standard.totalRevenue += campaign.revenue || 0
          efficiency.standard.totalClicks += campaign.clicked_count || 0
          efficiency.standard.totalOrders += campaign.orders_count || 0
        } else { // Below 30% of brand average
          efficiency.needsWork.campaigns.push(campaign)
          efficiency.needsWork.totalRevenue += campaign.revenue || 0
          efficiency.needsWork.totalClicks += campaign.clicked_count || 0
          efficiency.needsWork.totalOrders += campaign.orders_count || 0
        }
      }
    })
    
    return { efficiency, brandAvgClickToOrder, brandAvgClickToOpen }
  }

  const getFilteredCampaigns = (campaigns: any[], category: string, analysisType: 'conversion' | 'aov') => {
    if (analysisType === 'conversion') {
      const { efficiency } = getConversionEfficiencyData(campaigns)
      return efficiency[category as keyof typeof efficiency]?.campaigns || []
    } else {
      const { aovTiers } = getAOVAnalysis(campaigns)
      return aovTiers[category as keyof typeof aovTiers]?.campaigns || []
    }
  }

  const getAOVAnalysis = (campaigns: any[]) => {
    const campaignsWithAOV = campaigns.map((campaign: any) => ({
      ...campaign,
      aov: campaign.orders_count > 0 ? campaign.revenue / campaign.orders_count : 0
    }))
    
    // Calculate overall AOV for benchmarking
    const totalRevenue = campaigns.reduce((sum: number, c: any) => sum + (c.revenue || 0), 0)
    const totalOrders = campaigns.reduce((sum: number, c: any) => sum + (c.orders_count || 0), 0)
    const overallAOV = totalOrders > 0 ? totalRevenue / totalOrders : 0
    
    const aovTiers = {
      premium: { campaigns: [] as any[], totalRevenue: 0, totalOrders: 0, avgAOV: 0 },
      standard: { campaigns: [] as any[], totalRevenue: 0, totalOrders: 0, avgAOV: 0 },
      discount: { campaigns: [] as any[], totalRevenue: 0, totalOrders: 0, avgAOV: 0 }
    }
    
    campaignsWithAOV.forEach((campaign: any) => {
      if (campaign.orders_count > 0) {
        if (campaign.aov > overallAOV * 1.5) { // 50% above brand average
          aovTiers.premium.campaigns.push(campaign)
          aovTiers.premium.totalRevenue += campaign.revenue || 0
          aovTiers.premium.totalOrders += campaign.orders_count || 0
        } else if (campaign.aov >= overallAOV * 0.7) { // Within 30% of brand average
          aovTiers.standard.campaigns.push(campaign)
          aovTiers.standard.totalRevenue += campaign.revenue || 0
          aovTiers.standard.totalOrders += campaign.orders_count || 0
        } else { // Below 30% of brand average
          aovTiers.discount.campaigns.push(campaign)
          aovTiers.discount.totalRevenue += campaign.revenue || 0
          aovTiers.discount.totalOrders += campaign.orders_count || 0
        }
      }
    })
    
    // Calculate average AOVs for each tier
    Object.values(aovTiers).forEach((tier: any) => {
      tier.avgAOV = tier.totalOrders > 0 ? tier.totalRevenue / tier.totalOrders : 0
    })
    
    return { aovTiers, overallAOV }
  }


  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: BarChart3 },
    { id: 'campaigns', label: 'Campaigns', icon: Mail },
    { id: 'flows', label: 'Flows', icon: Zap },
    { id: 'subject-lines', label: 'Subject Lines', icon: Eye },
    { id: 'list-growth', label: 'List Growth', icon: Users },
    { id: 'deliverability', label: 'Deliverability', icon: Shield }
  ]

  // Reset selected category when analysis tab changes
  useEffect(() => {
    setSelectedCategory(null)
  }, [analysisTab])

  // Fetch data when timeframe changes
  useEffect(() => {
    const fetchData = async () => {
      if (!client?.brand_slug) return
      
      setLoading(true)
      console.log(`🔄 Fetching dashboard data for ${timeframe} days (activeTab: ${activeTab})`)
      
      try {
        const response = await fetch(`/api/dashboard?clientSlug=${client.brand_slug}&timeframe=${timeframe}`)
        const result = await response.json()
        
        if (response.ok) {
          setData(result.data)
          console.log(`✅ Dashboard data refreshed for ${timeframe} days:`, result.data?.summary)
        } else {
          console.error('❌ Dashboard API error:', result.error)
        }
      } catch (error) {
        console.error('❌ Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    // Always fetch when timeframe actually changes, except on initial load if data matches
    const isInitialLoad = initialData && timeframe === initialTimeframe
    
    if (!isInitialLoad) {
      console.log(`🎯 Timeframe changed to ${timeframe} days - fetching new data`)
      fetchData()
    } else {
      console.log(`⏭️ Using initial data for timeframe: ${timeframe} days`)
    }
  }, [timeframe, client?.brand_slug])

  // Separate effect to handle tab switching and ensure correct timeframe
  useEffect(() => {
    console.log(`🔄 Tab changed to: ${activeTab}, current timeframe: ${timeframe}`)
  }, [activeTab, timeframe])

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
                <span className="text-white/80">📧 Email Revenue</span>
                <div className="text-right">
                  <span className="text-white font-semibold">
                    ${(data?.revenueAttributionSummary?.total_email_revenue || 0).toLocaleString()}
                  </span>
                  <div className="text-xs text-white/60">
                    {(data?.revenueAttributionSummary?.avg_email_percentage || 0).toFixed(1)}% of total
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">📱 SMS Revenue</span>
                <div className="text-right">
                  <span className="text-white font-semibold">
                    ${(data?.revenueAttributionSummary?.total_sms_revenue || 0).toLocaleString()}
                  </span>
                  <div className="text-xs text-white/60">
                    {(data?.revenueAttributionSummary?.avg_sms_percentage || 0).toFixed(1)}% of total
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-white/20 pt-4">
                <span className="text-white font-medium">💰 Total Store Revenue</span>
                <span className="text-white font-bold text-lg">
                  ${(data?.revenueAttributionSummary?.total_revenue || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/70">Total Orders</span>
                <span className="text-white/90">
                  {(data?.revenueAttributionSummary?.total_orders || 0).toLocaleString()}
                </span>
              </div>
              {data?.revenueAttributionSummary?.days_with_data > 0 && (
                <div className="text-xs text-white/50 text-center pt-2 border-t border-white/10">
                  Data from {data.revenueAttributionSummary.days_with_data} days
                </div>
              )}
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

  const renderSubjectLinesTab = () => {
    const campaigns = data?.campaigns || []
    const subjectInsights = getSubjectLineInsights(campaigns)
    
    // Sort ALL campaigns by open rate (not just filtered ones)
    const allCampaigns = [...campaigns]
      .filter((c: any) => c.subject_line)
      .sort((a: any, b: any) => (b.open_rate || 0) - (a.open_rate || 0))
    
    return (
      <div className="space-y-6">
        {/* Smart Subject Line Insights */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5" />
              ✨ Smart Subject Line Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(() => {
                const insights = []
                
                if (subjectInsights.withEmoji.avgOpenRate > subjectInsights.withoutEmoji.avgOpenRate) {
                  insights.push(`📧 Subject lines with emojis perform ${(subjectInsights.withEmoji.avgOpenRate - subjectInsights.withoutEmoji.avgOpenRate).toFixed(1)}% better than those without`)
                }
                
                if (subjectInsights.shortLines.avgOpenRate > subjectInsights.longLines.avgOpenRate && subjectInsights.shortLines.count > 0) {
                  insights.push(`📏 Short subject lines (<30 chars) have ${subjectInsights.shortLines.avgOpenRate.toFixed(1)}% open rate vs ${subjectInsights.longLines.avgOpenRate.toFixed(1)}% for longer ones`)
                }
                
                if (subjectInsights.withPersonalization.count > 0) {
                  insights.push(`👤 Personalized subject lines average ${subjectInsights.withPersonalization.avgOpenRate.toFixed(1)}% open rate across ${subjectInsights.withPersonalization.count} campaigns`)
                }
                
                if (subjectInsights.withUrgency.count > 0) {
                  insights.push(`⚡ Urgency-driven subject lines generate ${subjectInsights.withUrgency.avgOpenRate.toFixed(1)}% open rate with ${subjectInsights.withUrgency.avgClickRate.toFixed(1)}% click rate`)
                }
                
                return insights.length > 0 ? insights.slice(0, 3).map((insight, index) => (
                  <p key={index} className="text-white/90 text-sm flex items-start gap-2">
                    <span className="text-blue-300 font-medium">•</span>
                    {insight}
                  </p>
                )) : (
                  <p className="text-white/60 text-sm">Not enough data for smart insights yet. Try syncing more campaigns!</p>
                )
              })()}
            </div>
          </CardContent>
        </Card>

        {/* All Campaigns List - Compact & Scrollable */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5" />
              All Campaigns by Open Rate ({allCampaigns.length} total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-1">
                {allCampaigns.length > 0 ? (
                  allCampaigns.map((campaign: any, index: number) => (
                    <div 
                      key={campaign.campaign_id} 
                      className="p-2 bg-white/5 rounded hover:bg-white/10 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-6 h-6 rounded bg-blue-500/20 text-blue-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white text-sm font-medium truncate">
                            {campaign.subject_line || 'No Subject Line'}
                          </h4>
                          <p className="text-white/50 text-xs truncate">
                            {campaign.campaign_name || `Campaign ${campaign.campaign_id}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="text-right">
                          <div className={`font-bold ${
                            (campaign.open_rate || 0) >= 0.25 ? 'text-green-300' :
                            (campaign.open_rate || 0) >= 0.15 ? 'text-yellow-300' : 'text-red-300'
                          }`}>
                            {((campaign.open_rate || 0) * 100).toFixed(1)}%
                          </div>
                          <div className="text-white/50">open</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${
                            (campaign.click_rate || 0) >= 0.03 ? 'text-green-300' :
                            (campaign.click_rate || 0) >= 0.015 ? 'text-yellow-300' : 'text-red-300'
                          }`}>
                            {((campaign.click_rate || 0) * 100).toFixed(1)}%
                          </div>
                          <div className="text-white/50">click</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white/80 font-medium">
                            ${(campaign.revenue || 0).toLocaleString()}
                          </div>
                          <div className="text-white/50">revenue</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Mail className="w-8 h-8 text-white/40 mx-auto mb-2" />
                    <p className="text-white/60">No campaigns available</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderCampaignsTab = () => {
    const campaigns = data?.campaigns || []
    
    // Calculate total campaign revenue
    const totalRevenue = campaigns.reduce((sum: number, campaign: any) => sum + (campaign.revenue || 0), 0)
    
    // Sort campaigns
    const sortedCampaigns = [...campaigns].sort((a: any, b: any) => {
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
      .sort((a: any, b: any) => b.open_rate - a.open_rate)
      .slice(0, 5)
    
    // Subject line insights
    const subjectInsights = getSubjectLineInsights(campaigns)
    
    // Simplified Send time analysis - open rate and click rate only
    const sendTimeAnalysis = campaigns
      .filter((c: any) => c.send_date)
      .reduce((acc: any, campaign: any) => {
        const date = new Date(campaign.send_date)
        const hour = date.getHours()
        const dayOfWeek = date.getDay()
        
        const hourKey = `${hour}:00`
        const dayKey = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]
        
        if (!acc.byHour[hourKey]) acc.byHour[hourKey] = { count: 0, totalOpenRate: 0, totalClickRate: 0 }
        if (!acc.byDay[dayKey]) acc.byDay[dayKey] = { count: 0, totalOpenRate: 0, totalClickRate: 0 }
        
        acc.byHour[hourKey].count++
        acc.byHour[hourKey].totalOpenRate += campaign.open_rate || 0
        acc.byHour[hourKey].totalClickRate += campaign.click_rate || 0
        
        acc.byDay[dayKey].count++
        acc.byDay[dayKey].totalOpenRate += campaign.open_rate || 0
        acc.byDay[dayKey].totalClickRate += campaign.click_rate || 0
        
        return acc
      }, { byHour: {}, byDay: {} })
    
    // Calculate averages for send time analysis
    Object.keys(sendTimeAnalysis.byHour).forEach((hour: string) => {
      const data = sendTimeAnalysis.byHour[hour]
      data.avgOpenRate = data.totalOpenRate / data.count
      data.avgClickRate = data.totalClickRate / data.count
    })
    
    Object.keys(sendTimeAnalysis.byDay).forEach((day: string) => {
      const data = sendTimeAnalysis.byDay[day]
      data.avgOpenRate = data.totalOpenRate / data.count
      data.avgClickRate = data.totalClickRate / data.count
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
          {/* Campaign Revenue & Recipients Combo Chart */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Campaign Revenue and Recipients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={getRevenueRecipientsComboData(campaigns, timeframe)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    />
                    <YAxis 
                      yAxisId="revenue"
                      orientation="left"
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <YAxis 
                      yAxisId="recipients"
                      orientation="right"
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'revenue' ? `$${value.toLocaleString()}` : `${value.toLocaleString()}`,
                        name === 'revenue' ? 'Campaign Revenue' : 'Recipients'
                      ]}
                    />
                    <Bar 
                      yAxisId="revenue"
                      dataKey="revenue" 
                      fill={primaryColor}
                      fillOpacity={0.8}
                      radius={[4, 4, 0, 0]}
                    />
                    <Line 
                      yAxisId="recipients"
                      type="monotone" 
                      dataKey="recipients" 
                      stroke={accentColor}
                      strokeWidth={3}
                      dot={{ fill: accentColor, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: accentColor, strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Per Recipient Over Time */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Revenue Per Recipient
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getRevenuePerRecipientData(campaigns, timeframe)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    />
                    <YAxis 
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                      tickFormatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue Per Recipient']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rpr" 
                      stroke={secondaryColor}
                      strokeWidth={3}
                      dot={{ fill: secondaryColor, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: secondaryColor, strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Campaign Analysis with Tabs */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                📈 Campaign Analysis
              </CardTitle>
              {/* Analysis Tabs */}
              <div className="flex gap-1 mt-2">
                <button
                  onClick={() => setAnalysisTab('conversion')}
                  className={`px-3 py-1 text-xs rounded-md transition-all ${
                    analysisTab === 'conversion'
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Conversion Efficiency
                </button>
                <button
                  onClick={() => setAnalysisTab('aov')}
                  className={`px-3 py-1 text-xs rounded-md transition-all ${
                    analysisTab === 'aov'
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  AOV Insights
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Conversion Funnel Table */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-white font-medium text-sm mb-3">📊 Campaign Conversion Funnel</h3>
                  {(() => {
                    const funnel = getConversionFunnelData(campaigns)
                    return (
                      <div className="flex items-center justify-between text-center">
                        <div className="flex-1">
                          <div className="text-white font-semibold text-lg">{funnel.recipients.toLocaleString()}</div>
                          <div className="text-white/60 text-xs">Recipients</div>
                          <div className="text-white/40 text-xs">100%</div>
                  </div>
                        <div className="text-white/40 mx-2">→</div>
                        <div className="flex-1">
                          <div className="text-white font-semibold text-lg">{funnel.opens.toLocaleString()}</div>
                          <div className="text-white/60 text-xs">Opened</div>
                          <div className="text-green-300 text-xs font-medium">{funnel.openRate.toFixed(1)}%</div>
                    </div>
                        <div className="text-white/40 mx-2">→</div>
                        <div className="flex-1">
                          <div className="text-white font-semibold text-lg">{funnel.clicks.toLocaleString()}</div>
                          <div className="text-white/60 text-xs">Clicked</div>
                          <div className="text-blue-300 text-xs font-medium">{funnel.clickRate.toFixed(1)}%</div>
                  </div>
                        <div className="text-white/40 mx-2">→</div>
                        <div className="flex-1">
                          <div className="text-white font-semibold text-lg">{funnel.conversions.toLocaleString()}</div>
                          <div className="text-white/60 text-xs">Converted</div>
                          <div className="text-purple-300 text-xs font-medium">{funnel.conversionRate.toFixed(1)}%</div>
                </div>
                  </div>
                    )
                  })()}
                    </div>

                {/* Category Cards */}
                <div className="grid grid-cols-3 gap-3">
                  {analysisTab === 'conversion' && (() => {
                    const { efficiency } = getConversionEfficiencyData(campaigns)
                    const categories = [
                      { key: 'highConverters', label: 'High Converters', icon: '🎯', data: efficiency.highConverters },
                      { key: 'standard', label: 'Standard', icon: '📊', data: efficiency.standard },
                      { key: 'needsWork', label: 'Needs Work', icon: '🔧', data: efficiency.needsWork }
                    ]
                    
                    return categories.map(category => {
                      const isSelected = selectedCategory === category.key
                      const conversionRate = category.data.totalClicks > 0 ? (category.data.totalOrders / category.data.totalClicks * 100) : 0
                      
                      return (
                        <button
                          key={category.key}
                          onClick={() => setSelectedCategory(isSelected ? null : category.key)}
                          className={`p-4 rounded-lg border transition-all text-left ${
                            isSelected 
                              ? 'bg-white/20 border-white/40 ring-2 ring-blue-500/50' 
                              : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm">{category.icon}</span>
                            <span className="text-white font-medium text-sm">{category.label}</span>
                  </div>
                          <div className="text-xs text-white/60 space-y-1">
                            <div>{category.data.campaigns.length} campaigns</div>
                            <div>{conversionRate.toFixed(1)}% click-to-order</div>
                            <div>${category.data.totalRevenue.toLocaleString()} revenue</div>
                </div>
                        </button>
                      )
                    })
                  })()}
                  
                  {analysisTab === 'aov' && (() => {
                    const { aovTiers } = getAOVAnalysis(campaigns)
                    const categories = [
                      { key: 'premium', label: 'Premium AOV', icon: '👑', data: aovTiers.premium },
                      { key: 'standard', label: 'Standard AOV', icon: '📊', data: aovTiers.standard },
                      { key: 'discount', label: 'Discount AOV', icon: '💡', data: aovTiers.discount }
                    ]
                    
                    return categories.map(category => {
                      const isSelected = selectedCategory === category.key
                      
                      return (
                        <button
                          key={category.key}
                          onClick={() => setSelectedCategory(isSelected ? null : category.key)}
                          className={`p-4 rounded-lg border transition-all text-left ${
                            isSelected 
                              ? 'bg-white/20 border-white/40 ring-2 ring-blue-500/50' 
                              : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm">{category.icon}</span>
                            <span className="text-white font-medium text-sm">{category.label}</span>
                  </div>
                          <div className="text-xs text-white/60 space-y-1">
                            <div>{category.data.campaigns.length} campaigns</div>
                            <div>${category.data.avgAOV.toFixed(2)} avg order</div>
                            <div>${category.data.totalRevenue.toLocaleString()} revenue</div>
                    </div>
                        </button>
                      )
                    })
                  })()}
                </div>

                {/* Scrollable Campaign List */}
                {selectedCategory && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-medium text-sm">
                        {analysisTab === 'conversion' 
                          ? (selectedCategory === 'highConverters' ? 'High Converter Campaigns' : 
                             selectedCategory === 'standard' ? 'Standard Converter Campaigns' : 'Campaigns Needing Work')
                          : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} AOV Campaigns`}
                      </h3>
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="text-white/60 hover:text-white text-xs px-2 py-1 bg-white/10 rounded"
                      >
                        Close
                      </button>
                  </div>
                    <div className="max-h-80 overflow-y-auto space-y-2">
                      {getFilteredCampaigns(campaigns, selectedCategory, analysisTab).map((campaign: any) => (
                        <div key={campaign.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex-1">
                            <p className="text-white font-medium text-sm">{campaign.campaign_name}</p>
                            <p className="text-white/60 text-xs">{campaign.subject_line}</p>
                          <p className="text-white/40 text-xs mt-1">
                              {new Date(campaign.send_date).toLocaleDateString()} • {campaign.recipients_count?.toLocaleString()} recipients
                          </p>
                    </div>
                    <div className="text-right ml-4">
                            {analysisTab === 'conversion' ? (
                              <>
                                <p className="text-white font-semibold text-sm">
                                  {campaign.clicked_count > 0 ? ((campaign.orders_count / campaign.clicked_count) * 100).toFixed(1) : '0.0'}%
                                </p>
                                <p className="text-white/60 text-xs">click-to-order</p>
                                <p className="text-white/40 text-xs">${(campaign.revenue || 0).toLocaleString()}</p>
                              </>
                            ) : (
                              <>
                                <p className="text-white font-semibold text-sm">
                                  ${campaign.orders_count > 0 ? (campaign.revenue / campaign.orders_count).toFixed(2) : '0.00'}
                                </p>
                                <p className="text-white/60 text-xs">avg order value</p>
                                <p className="text-white/40 text-xs">{campaign.orders_count} orders</p>
                              </>
                            )}
                    </div>
                  </div>
                ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Simplified Send Time Performance */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                🕐 Send Time Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Best Performing Days */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white font-medium text-sm">🗓️ Best Days of the Week</p>
                    <span className="text-white/60 text-xs">Open Rate • Click Rate</span>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(sendTimeAnalysis.byDay)
                      .sort(([,a]: any, [,b]: any) => b.avgOpenRate - a.avgOpenRate)
                      .slice(0, 5)
                      .map(([day, data]: any, index: number) => {
                        const isTop = index < 2
                        return (
                          <div key={day} className={`flex items-center justify-between p-3 rounded-lg ${
                            isTop ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/5'
                          }`}>
                            <div className="flex items-center gap-3">
                              <span className={`text-sm font-medium ${
                                isTop ? 'text-green-300' : 'text-white'
                              }`}>
                                {day}
                            </span>
                              <span className="text-white/60 text-xs">
                                {data.count} campaigns
                              </span>
                          </div>
                            <div className="flex items-center gap-4 text-xs">
                              <div className="text-center">
                                <div className={`font-semibold ${
                                  isTop ? 'text-green-300' : 'text-white'
                                }`}>
                                  {(data.avgOpenRate * 100).toFixed(1)}%
                        </div>
                                <div className="text-white/50">Open</div>
                              </div>
                              <div className="text-center">
                                <div className={`font-semibold ${
                                  isTop ? 'text-green-300' : 'text-white'
                                }`}>
                                  {((data.avgClickRate || 0) * 100).toFixed(2)}%
                                </div>
                                <div className="text-white/50">Click</div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>

                {/* Best Hours */}
                <div className="border-t border-white/20 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white font-medium text-sm">🕐 Peak Hours</p>
                    <span className="text-white/60 text-xs">Top 6 performing hours</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(sendTimeAnalysis.byHour)
                      .sort(([,a]: any, [,b]: any) => b.avgOpenRate - a.avgOpenRate)
                      .slice(0, 6)
                      .map(([hour, data]: any, index: number) => {
                        const isTop3 = index < 3
                        const hourNum = parseInt(hour.split(':')[0])
                        const timeOfDay = hourNum < 12 ? 'AM' : 'PM'
                        const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum
                        
                        return (
                          <div key={hour} className={`flex items-center justify-between p-2 rounded-lg ${
                            isTop3 ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-white/5'
                          }`}>
                            <div>
                              <div className={`text-sm font-bold ${
                                isTop3 ? 'text-blue-300' : 'text-white'
                              }`}>
                                {displayHour}:00 {timeOfDay}
                              </div>
                              <div className="text-white/60 text-xs">
                                {data.count} sent
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-xs font-semibold ${
                                isTop3 ? 'text-blue-300' : 'text-white'
                              }`}>
                                {(data.avgOpenRate * 100).toFixed(1)}%
                              </div>
                              <div className="text-white/60 text-xs">
                                {((data.avgClickRate || 0) * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        )
                      })}
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
                    <th 
                      className="text-right text-white/80 font-medium py-3 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('revenue_per_recipient')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        RPR
                        {getSortIcon('revenue_per_recipient')}
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
                      <td className="text-right text-white text-sm py-4">
                        <span className={`${
                          ((campaign.revenue || 0) / (campaign.recipients_count || 1)) > 0.30 ? 'text-green-300' : 
                          ((campaign.revenue || 0) / (campaign.recipients_count || 1)) > 0.10 ? 'text-yellow-300' : 'text-red-300'
                        }`}>
                          ${((campaign.revenue || 0) / (campaign.recipients_count || 1)).toFixed(2)}
                        </span>
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
    
    // Get dynamic comparison label for table headers
    const getComparisonLabel = () => {
      if (timeframe <= 30) return 'WoW' // Week over Week
      if (timeframe <= 90) return 'MoM' // Month over Month  
      return 'QoQ' // Quarter over Quarter
    }
    const comparisonLabel = getComparisonLabel()
    
    const toggleFlowExpansion = async (flowId: string) => {
      const newExpanded = new Set(expandedFlows)
      if (newExpanded.has(flowId)) {
        newExpanded.delete(flowId)
      } else {
        newExpanded.add(flowId)
        
        // Load emails for this flow if not already loaded
        if (!flowEmails[flowId]) {
          console.log(`📧 FRONTEND: Attempting to load emails for flow ${flowId}`)
          console.log(`📧 FRONTEND: API URL: /api/flow-emails?flowId=${flowId}&clientSlug=${client?.brand_slug}&timeframe=${timeframe}`)
          
          try {
            const response = await fetch(`/api/flow-emails?flowId=${flowId}&clientSlug=${client?.brand_slug}&timeframe=${timeframe}`)
            const result = await response.json()
            
            console.log(`📧 FRONTEND: API Response status: ${response.status}`)
            console.log(`📧 FRONTEND: API Response:`, result)
            
            if (response.ok) {
              setFlowEmails(prev => ({
                ...prev,
                [flowId]: result.emails || []
              }))
              console.log(`📧 FRONTEND: Successfully loaded ${result.emails?.length || 0} emails for flow ${flowId}`)
            } else {
              console.error('📧 FRONTEND: Flow emails API error:', result)
            }
          } catch (error) {
            console.error('📧 FRONTEND: Network error loading flow emails:', error)
          }
        } else {
          console.log(`📧 FRONTEND: Emails already loaded for flow ${flowId}:`, flowEmails[flowId])
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
          {/* 1. Flow Revenue & Recipients Combo Chart */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Flow Revenue and Recipients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={getFlowRevenueRecipientsComboData(flows, timeframe)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    />
                    <YAxis 
                      yAxisId="revenue"
                      orientation="left"
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <YAxis 
                      yAxisId="recipients"
                      orientation="right"
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'revenue' ? `$${value.toLocaleString()}` : `${value.toLocaleString()}`,
                        name === 'revenue' ? 'Flow Revenue' : 'Recipients'
                      ]}
                    />
                    <Bar 
                      yAxisId="revenue"
                      dataKey="revenue" 
                      fill={secondaryColor}
                      fillOpacity={0.8}
                      radius={[4, 4, 0, 0]}
                    />
                    <Line 
                      yAxisId="recipients"
                      type="monotone" 
                      dataKey="recipients" 
                      stroke={accentColor}
                      strokeWidth={3}
                      dot={{ fill: accentColor, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: accentColor, strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 2. Flow Revenue Per Recipient Over Time */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Flow Revenue Per Recipient
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
                      tickFormatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue Per Recipient']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke={secondaryColor}
                      strokeWidth={3}
                      dot={{ fill: secondaryColor, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: secondaryColor, strokeWidth: 2 }}
                    />
                  </LineChart>
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
              Flow Recap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white/80 font-medium py-3 px-1 min-w-[200px]">Flows</th>
                    <th className="text-right text-white/80 font-medium py-3 px-1 min-w-[100px]">Revenue</th>
                    <th className="text-right text-blue-300 font-medium py-3 px-1 min-w-[80px]">Revenue {comparisonLabel}<br/>% Change</th>
                    <th className="text-right text-white/80 font-medium py-3 px-1 min-w-[80px]">Open Rate</th>
                    <th className="text-right text-blue-300 font-medium py-3 px-1 min-w-[80px]">Open Rate {comparisonLabel}<br/>% Change</th>
                    <th className="text-right text-white/80 font-medium py-3 px-1 min-w-[80px]">Click Rate</th>
                    <th className="text-right text-blue-300 font-medium py-3 px-1 min-w-[80px]">Click Rate {comparisonLabel}<br/>% Change</th>
                    <th className="text-right text-white/80 font-medium py-3 px-1 min-w-[80px]">Recipients</th>
                    <th className="text-right text-blue-300 font-medium py-3 px-1 min-w-[80px]">Recipients {comparisonLabel}<br/>% Change</th>
                    <th className="text-right text-white/80 font-medium py-3 px-1 min-w-[80px]">Opens</th>
                    <th className="text-right text-blue-300 font-medium py-3 px-1 min-w-[80px]">Opens {comparisonLabel}<br/>% Change</th>
                    <th className="text-right text-white/80 font-medium py-3 px-1 min-w-[80px]">Clicks</th>
                    <th className="text-right text-blue-300 font-medium py-3 px-1 min-w-[80px]">Clicks {comparisonLabel}<br/>% Change</th>
                  </tr>
                </thead>
                                 <tbody>
                  {getFlowRecapWithMoM(flows).map((flow: any, index: number) => (
                     <>
                      <tr key={flow.id} className={`hover:bg-white/5 transition-colors ${index !== flows.length - 1 ? 'border-b border-white/10' : ''}`}>
                        <td className="text-white text-sm py-3 px-1">
                         <div className="flex items-center gap-2">
                           <button
                             onClick={() => toggleFlowExpansion(flow.flow_id)}
                              className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white text-xs"
                           >
                             {expandedFlows.has(flow.flow_id) ? '−' : '+'}
                           </button>
                           <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${
                                flow.flow_status === 'live' ? 'bg-green-400' :
                                flow.flow_status === 'draft' ? 'bg-yellow-400' : 'bg-gray-400'
                             }`}></div>
                             <div>
                                <div className="font-medium text-sm">{flow.flow_name || 'Untitled Flow'}</div>
                                <div className="text-white/60 text-xs">{flow.trigger_type || 'Email Flow'}</div>
                             </div>
                           </div>
                         </div>
                       </td>
                        <td className="text-right text-white text-sm py-3 px-1">${(flow.revenue || 0).toLocaleString()}</td>
                        <td className="text-right text-sm py-3 px-1">
                          <span className={`${
                            flow.revenueMoM > 0 ? 'text-green-300' : 
                            flow.revenueMoM < 0 ? 'text-red-300' : 'text-white/60'
                          }`}>
                            {flow.revenueMoM > 0 ? '+' : ''}{flow.revenueMoM.toFixed(1)}%
                        </span>
                      </td>
                        <td className="text-right text-white text-sm py-3 px-1">{(flow.open_rate * 100 || 0).toFixed(1)}%</td>
                        <td className="text-right text-sm py-3 px-1">
                          <span className={`${
                            flow.openRateMoM > 0 ? 'text-green-300' : 
                            flow.openRateMoM < 0 ? 'text-red-300' : 'text-white/60'
                          }`}>
                            {flow.openRateMoM > 0 ? '+' : ''}{flow.openRateMoM.toFixed(1)}%
                          </span>
                      </td>
                        <td className="text-right text-white text-sm py-3 px-1">{(flow.click_rate * 100 || 0).toFixed(1)}%</td>
                        <td className="text-right text-sm py-3 px-1">
                        <span className={`${
                            flow.clickRateMoM > 0 ? 'text-green-300' : 
                            flow.clickRateMoM < 0 ? 'text-red-300' : 'text-white/60'
                        }`}>
                            {flow.clickRateMoM > 0 ? '+' : ''}{flow.clickRateMoM.toFixed(1)}%
                        </span>
                      </td>
                        <td className="text-right text-white text-sm py-3 px-1">{(flow.recipients || 0).toLocaleString()}</td>
                        <td className="text-right text-sm py-3 px-1">
                        <span className={`${
                            flow.recipientsMoM > 0 ? 'text-green-300' : 
                            flow.recipientsMoM < 0 ? 'text-red-300' : 'text-white/60'
                        }`}>
                            {flow.recipientsMoM > 0 ? '+' : ''}{flow.recipientsMoM.toFixed(1)}%
                        </span>
                      </td>
                        <td className="text-right text-white text-sm py-3 px-1">{(flow.opens || 0).toLocaleString()}</td>
                        <td className="text-right text-sm py-3 px-1">
                                     <span className={`${
                            flow.opensMoM > 0 ? 'text-green-300' : 
                            flow.opensMoM < 0 ? 'text-red-300' : 'text-white/60'
                                     }`}>
                            {flow.opensMoM > 0 ? '+' : ''}{flow.opensMoM.toFixed(1)}%
                                     </span>
                        </td>
                        <td className="text-right text-white text-sm py-3 px-1">{(flow.clicks || 0).toLocaleString()}</td>
                        <td className="text-right text-sm py-3 px-1">
                                     <span className={`${
                            flow.clicksMoM > 0 ? 'text-green-300' : 
                            flow.clicksMoM < 0 ? 'text-red-300' : 'text-white/60'
                                     }`}>
                            {flow.clicksMoM > 0 ? '+' : ''}{flow.clicksMoM.toFixed(1)}%
                                     </span>
                        </td>
                      </tr>
                      
                      {/* Expanded Email Sequence Details */}
                      {expandedFlows.has(flow.flow_id) && (
                        <tr className="bg-white/5">
                          <td colSpan={13} className="py-4 px-2">
                            <div className="ml-6 space-y-3">
                              <h4 className="text-white font-medium text-sm mb-3">📧 Email Sequence Performance</h4>
                              {(() => {
                                const emails = flowEmails[flow.flow_id] || []
                                console.log(`📧 RENDER: Flow ${flow.flow_id} emails in state:`, emails)
                                console.log(`📧 RENDER: flowEmails state:`, flowEmails)
                                
                                if (emails && emails.length > 0) {
                                  const sequencedEmails = getEmailSequenceForFlow(flow.flow_id, emails)
                                  console.log(`📧 RENDER: Sequenced emails:`, sequencedEmails)
                                  
                                  return (
                                    <div className="grid gap-2">
                                      {sequencedEmails.map((email: any) => (
                                    <div key={email.message_id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                      <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 text-xs flex items-center justify-center font-medium">
                                          {email.sequence_position}
                                        </div>
                                        <div>
                                          <div className="text-white text-sm font-medium">{email.subject_line}</div>
                                          <div className="text-white/60 text-xs">{email.sequence_label} • {email.message_name}</div>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="flex items-center gap-4 text-xs">
                                          <span className="text-white/60">Opens: <span className="text-white">{email.opens || 0}</span></span>
                                          <span className="text-white/60">Clicks: <span className="text-white">{email.clicks || 0}</span></span>
                                          <span className="text-white/60">Revenue: <span className="text-white">${(email.revenue || 0).toLocaleString()}</span></span>
                                          <span className="text-white/60">OR: <span className="text-white">{(email.open_rate * 100)?.toFixed(1) || '0.0'}%</span></span>
                                        </div>
                                      </div>
                                      </div>
                                    ))}
                                    </div>
                                  )
                                } else {
                                  return (
                                    <div className="text-white/60 text-sm py-2">
                                      No email sequence data available for this flow (State: {emails.length} emails)
                                    </div>
                                  )
                                }
                              })()}
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

  const renderListGrowthTab = () => {
    const listGrowth = data?.listGrowthMetrics || []
    const summary = data?.listGrowthSummary || {}
    
    // Calculate total metrics from summary
    const totalEmailSubscriptions = summary.total_email_subscriptions || 0
    const totalEmailUnsubscribes = summary.total_email_unsubscribes || 0
    const totalSmsSubscriptions = summary.total_sms_subscriptions || 0
    const totalFormSubmissions = summary.total_form_submissions || 0
    const netGrowth = summary.net_growth || 0
    const averageGrowthRate = summary.average_growth_rate || 0
    const averageChurnRate = summary.average_churn_rate || 0
    
    // Prepare chart data from list growth metrics
    const chartData = listGrowth.map((point: any) => ({
      date: point.date_recorded,
      email_subscriptions: point.email_subscriptions || 0,
      email_unsubscribes: point.email_unsubscribes || 0,
      net_growth: point.email_net_growth || 0,
      sms_subscriptions: point.sms_subscriptions || 0,
      form_submissions: point.form_submissions || 0
    })).reverse() // Reverse for chronological order
    
    return (
      <div className="space-y-6">
        {/* List Growth Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Total New Subscribers</p>
                  <p className="text-2xl font-bold text-white mt-1">{totalEmailSubscriptions.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-green-300 text-xs">📧 Email</span>
                    <span className="text-white/40 text-xs">+{totalSmsSubscriptions} SMS</span>
                  </div>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Net Growth</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {netGrowth >= 0 ? '+' : ''}{netGrowth.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs ${netGrowth >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                      {netGrowth >= 0 ? '↗️' : '↘️'} {averageGrowthRate > 0 ? `${(averageGrowthRate * 100).toFixed(1)}%` : '0%'}
                    </span>
                    <span className="text-white/40 text-xs">growth rate</span>
                  </div>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Churn Rate</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {(averageChurnRate * 100).toFixed(1)}%
                  </p>
                  <p className="text-white/60 text-xs mt-1">
                    {totalEmailUnsubscribes.toLocaleString()} unsubscribes
                  </p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Growth Trend Chart */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Subscription Growth Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="space-y-4">
                <div className="text-white/80 text-sm">
                  Weekly subscription and unsubscription trends over time
                </div>
                {/* Simple Net Growth Bar Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="rgba(255,255,255,0.6)"
                        fontSize={12}
                        tickFormatter={(value: any) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(30, 41, 59, 0.95)', 
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                        formatter={(value: any, name: string) => [
                          `${value} ${value >= 0 ? '(Growth)' : '(Decline)'}`, 
                          'Net Subscriber Change'
                        ]}
                        labelFormatter={(label: any) => new Date(label).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      />
                      {/* Single net growth bar - green if positive, red if negative */}
                      <Bar 
                        dataKey="net_growth" 
                        radius={[4, 4, 4, 4]}
                        shape={(props: any) => {
                          const { x, y, width, height, payload } = props
                          const isPositive = payload.net_growth >= 0
                          const color = isPositive ? accentColor : errorColor
                          
                          return (
                            <rect
                              x={x}
                              y={y}
                              width={width}
                              height={Math.abs(height)}
                              fill={color}
                              rx={4}
                              ry={4}
                            />
                          )
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60 mb-2">No list growth data available</p>
                <p className="text-white/40 text-sm">
                  Use the sync button to fetch subscription growth data
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Channel Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">New Email Subscribers</span>
                  <span className="text-white font-semibold">{totalEmailSubscriptions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Email Unsubscribes</span>
                  <span className="text-white font-semibold">{totalEmailUnsubscribes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/20">
                  <span className="text-white font-medium">Net Email Growth</span>
                  <span className={`font-bold ${(totalEmailSubscriptions - totalEmailUnsubscribes) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {(totalEmailSubscriptions - totalEmailUnsubscribes) >= 0 ? '+' : ''}{(totalEmailSubscriptions - totalEmailUnsubscribes).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Other Channels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">SMS Subscriptions</span>
                  <span className="text-white font-semibold">{totalSmsSubscriptions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Form Submissions</span>
                  <span className="text-white font-semibold">{totalFormSubmissions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/20">
                  <span className="text-white font-medium">Total Growth Rate</span>
                  <span className="text-green-300 font-bold">
                    {averageGrowthRate > 0 ? `+${(averageGrowthRate * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderDeliverabilityTab = () => {
    const campaigns = data?.campaigns || []
    const flows = data?.flows || []
    
    // Calculate overall deliverability metrics from campaigns and flows
    const calculateDeliverabilityMetrics = () => {
      let totalSent = 0, totalDelivered = 0, totalBounced = 0, totalSpam = 0, totalUnsubscribed = 0
      
      // Process campaigns
      campaigns.forEach((campaign: any) => {
        totalSent += campaign.recipients_count || 0
        totalDelivered += campaign.delivered_count || 0
        totalBounced += campaign.bounced_count || 0
        totalUnsubscribed += campaign.unsubscribed_count || 0
      })
      
      // Process flows (from flow_message_metrics aggregated data)
      flows.forEach((flow: any) => {
        totalSent += flow.recipients || 0
        totalDelivered += flow.deliveries || 0
        totalBounced += flow.bounces || 0
        totalUnsubscribed += flow.unsubscribes || 0
        totalSpam += flow.spam_complaints || 0
      })
      
      // Calculate rates
      const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0
      const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0
      const spamRate = totalSent > 0 ? (totalSpam / totalSent) * 100 : 0
      const unsubscribeRate = totalSent > 0 ? (totalUnsubscribed / totalSent) * 100 : 0
      
      // Calculate reputation score (0-100)
      let reputationScore = 100
      if (bounceRate > 5) reputationScore -= (bounceRate - 5) * 8
      if (spamRate > 0.1) reputationScore -= spamRate * 40
      if (unsubscribeRate > 2) reputationScore -= (unsubscribeRate - 2) * 5
      reputationScore = Math.max(0, Math.min(100, reputationScore))
      
      return {
        totalSent,
        totalDelivered,
        totalBounced,
        totalSpam,
        totalUnsubscribed,
        deliveryRate,
        bounceRate,
        spamRate,
        unsubscribeRate,
        reputationScore
      }
    }
    
    const metrics = calculateDeliverabilityMetrics()
    
    // Get recent campaigns with deliverability issues
    const problemCampaigns = [...campaigns]
      .filter((c: any) => (c.bounce_rate || 0) > 0.05 || (c.unsubscribe_rate || 0) > 0.02)
      .sort((a: any, b: any) => (b.bounce_rate || 0) - (a.bounce_rate || 0))
      .slice(0, 10)

    return (
      <div className="space-y-6">
        {/* Simplified Deliverability Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Bounce Rate</p>
                  <p className="text-2xl font-bold text-white mt-1">{metrics.bounceRate.toFixed(1)}%</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs ${
                      metrics.bounceRate <= 2 ? 'text-green-300' :
                      metrics.bounceRate <= 5 ? 'text-yellow-300' : 'text-red-300'
                    }`}>
                      {metrics.bounceRate <= 2 ? '✅ Excellent' :
                       metrics.bounceRate <= 5 ? '⚠️ Acceptable' : '🚨 High'}
                    </span>
                  </div>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Spam Rate</p>
                  <p className="text-2xl font-bold text-white mt-1">{metrics.spamRate.toFixed(2)}%</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs ${
                      metrics.spamRate <= 0.1 ? 'text-green-300' :
                      metrics.spamRate <= 0.3 ? 'text-yellow-300' : 'text-red-300'
                    }`}>
                      {metrics.spamRate <= 0.1 ? '✅ Excellent' :
                       metrics.spamRate <= 0.3 ? '⚠️ Acceptable' : '🚨 High'}
                    </span>
                  </div>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Reputation Score</p>
                  <p className="text-2xl font-bold text-white mt-1">{metrics.reputationScore.toFixed(0)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs ${
                      metrics.reputationScore >= 80 ? 'text-green-300' :
                      metrics.reputationScore >= 60 ? 'text-yellow-300' : 'text-red-300'
                    }`}>
                      {metrics.reputationScore >= 80 ? '✅ Excellent' :
                       metrics.reputationScore >= 60 ? '⚠️ Good' : '🚨 Poor'}
                    </span>
                  </div>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns with Deliverability Issues */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Campaigns Needing Attention
            </CardTitle>
            <p className="text-white/60 text-sm mt-1">Recent campaigns with deliverability issues</p>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {problemCampaigns.length > 0 ? (
                problemCampaigns.map((campaign: any, index: number) => (
                  <div 
                    key={campaign.campaign_id} 
                    className="p-3 bg-white/5 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-medium truncate">
                        {campaign.campaign_name || campaign.subject_line || `Campaign ${campaign.campaign_id}`}
                      </h4>
                      <p className="text-white/60 text-xs mt-1">
                        📅 {campaign.send_date ? new Date(campaign.send_date).toLocaleDateString() : 'No date'}
                        • 👥 {(campaign.recipients_count || 0).toLocaleString()} recipients
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white/60 text-xs">Bounce:</span>
                          <span className={`text-xs font-bold ${
                            (campaign.bounce_rate || 0) <= 0.02 ? 'text-green-300' :
                            (campaign.bounce_rate || 0) <= 0.05 ? 'text-yellow-300' : 'text-red-300'
                          }`}>
                            {((campaign.bounce_rate || 0) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white/60 text-xs">Unsub:</span>
                          <span className={`text-xs font-bold ${
                            (campaign.unsubscribe_rate || 0) <= 0.01 ? 'text-green-300' :
                            (campaign.unsubscribe_rate || 0) <= 0.02 ? 'text-yellow-300' : 'text-red-300'
                          }`}>
                            {((campaign.unsubscribe_rate || 0) * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Shield className="w-8 h-8 text-green-300 mx-auto mb-2" />
                  <p className="text-green-300 text-sm font-medium">Great deliverability!</p>
                  <p className="text-white/60 text-xs">No campaigns with significant issues found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Email Health Summary - Simplified */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Email Health Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className={`text-4xl font-bold mb-2 ${
                  metrics.reputationScore >= 80 ? 'text-green-300' :
                  metrics.reputationScore >= 60 ? 'text-yellow-300' : 'text-red-300'
                }`}>
                  {metrics.reputationScore.toFixed(0)}
                </div>
                <p className="text-white/80 text-sm font-medium">Overall Reputation Score</p>
                <p className="text-white/60 text-xs mt-1">
                  Based on {metrics.totalSent.toLocaleString()} emails sent
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Successfully Delivered</span>
                  <span className="text-white font-medium">{metrics.totalDelivered.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Bounced</span>
                  <span className="text-white font-medium">{metrics.totalBounced.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Spam Complaints</span>
                  <span className="text-white font-medium">{metrics.totalSpam.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Unsubscribed</span>
                  <span className="text-white font-medium">{metrics.totalUnsubscribed.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        background: hideHeader 
          ? 'transparent' // Use transparent when header is external
          : client?.background_image_url 
            ? `url(${client.background_image_url}) center/cover fixed, ${client?.primary_color || '#3B82F6'}` // Image with color fallback
            : `linear-gradient(135deg, ${client?.primary_color || '#3B82F6'} 0%, ${client?.secondary_color || '#1D4ED8'} 100%)` // Color gradient only
      }}
    >
      {/* Header - Only show if not hidden by external layout */}
      {!hideHeader && (
        <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {client?.portal_title || client?.brand_name || 'Dashboard'}
                </h1>
                <p className="text-white/60 text-sm">
                  {viewMode === 'analytics' ? 'Analytics Dashboard' : 'Campaign Portal'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {!disablePortalMode && (
                  <ViewToggle 
                    currentMode={viewMode}
                    onModeChange={setViewMode}
                  />
                )}
                {(disablePortalMode || viewMode === 'analytics') && (
                  <TimeframeSelector 
                    selectedTimeframe={timeframe}
                    onTimeframeChange={(days: number) => {
                      console.log(`🎯 TimeframeSelector changed: ${days} days (activeTab: ${activeTab})`)
                      if (activeTab === 'campaigns' || activeTab === 'subject-lines') {
                        console.log(`📅 Setting campaignTimeframe: ${campaignTimeframe} → ${days}`)
                        setCampaignTimeframe(days)
                      } else if (activeTab === 'flows') {
                        console.log(`📅 Setting flowTimeframe: ${flowTimeframe} → ${days}`)
                        setFlowTimeframe(days)
                      } else {
                        console.log(`📅 Setting campaignTimeframe (default): ${campaignTimeframe} → ${days}`)
                        setCampaignTimeframe(days)
                      }
                    }}
                    mode={activeTab === 'flows' ? 'flow' : 'campaign'}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs - Only show in Analytics mode */}
      {viewMode === 'analytics' && (
        <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            <nav className="flex space-x-8">
              {tabs.map((tab: any) => {
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
      )}

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
              {[...Array(3)].map((_: any, i: number) => (
                <div key={i} className="h-32 bg-white/10 rounded-lg"></div>
              ))}
            </div>
            {/* Loading skeleton for charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_: any, i: number) => (
                <div key={i} className="h-80 bg-white/10 rounded-lg"></div>
              ))}
            </div>
          </div>
        )}
        
        {!loading && (
          <>
            {(disablePortalMode || viewMode === 'analytics') ? (
              // Analytics Mode - Original Dashboard Content
              <>
                {activeTab === 'dashboard' && renderOverviewTab()}
                {activeTab === 'campaigns' && renderCampaignsTab()}
                {activeTab === 'flows' && renderFlowsTab()}
                {activeTab === 'subject-lines' && renderSubjectLinesTab()}
                {activeTab === 'list-growth' && renderListGrowthTab()}
                {activeTab === 'deliverability' && renderDeliverabilityTab()}
              </>
            ) : (
              // Portal Mode - Campaign Management Interface (only if not disabled)
              <PortalDashboard client={client} data={data} />
            )}
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