import { subDays } from 'date-fns'

/**
 * Comprehensive timeframe filtering utilities for all dashboard data types
 * Handles different date field formats and aggregation patterns
 */

export const filterAndAggregateData = {
  /**
   * Campaigns: Filter by send_date, exclude drafts
   * Only includes campaigns that have actually been sent
   */
  campaigns: (items: any[], days: number) => {
    const cutoff = subDays(new Date(), days)
    return items.filter(item => {
      // Filter out drafts (send_date: null) and campaigns outside timeframe
      if (!item.send_date) return false
      
      try {
        const sendDate = new Date(item.send_date)
        return sendDate >= cutoff && !isNaN(sendDate.getTime())
      } catch (error) {
        console.warn('Invalid send_date format:', item.send_date)
        return false
      }
    })
  },

  /**
   * Flows: Use already-aggregated flows data from DatabaseService.getRecentFlowMetrics
   * The backend already properly joins flow_metrics and flow_message_metrics
   */
  flows: (flows: any[], days: number) => {
    // Flows are already aggregated and filtered by the backend DatabaseService
    // Just return them as-is since they're already properly calculated
    // The backend getRecentFlowMetrics handles the timeframe filtering
    console.log('🔍 TIMEFRAME-UTILS: Processing flows:', flows.length)
    console.log('🔍 TIMEFRAME-UTILS: Sample flow data:', flows.slice(0, 1))
    
    const filteredFlows = flows.filter(flow => {
      // ✅ FIX: Less strict filtering - include flows with any activity
      const hasActivity = flow && (
        (flow.revenue && flow.revenue > 0) || 
        (flow.weeklyRevenue && flow.weeklyRevenue > 0) ||
        (flow.opens && flow.opens > 0) || 
        (flow.weeklyOpens && flow.weeklyOpens > 0) ||
        (flow.clicks && flow.clicks > 0) ||
        (flow.weeklyClicks && flow.weeklyClicks > 0) ||
        (flow.weeklyRecipients && flow.weeklyRecipients > 0)
      )
      console.log(`🔍 Flow ${flow?.flow_name}: hasActivity=${hasActivity}, revenue=${flow?.revenue}, weeklyRevenue=${flow?.weeklyRevenue}`)
      return hasActivity
    })
    
    console.log('🔍 TIMEFRAME-UTILS: Filtered flows:', filteredFlows.length)
    return filteredFlows
  },

  /**
   * Revenue Attribution: Filter by date field
   */
  revenueAttribution: (items: any[], days: number) => {
    const cutoff = subDays(new Date(), days)
    return items.filter(item => {
      if (!item.date) return false
      
      try {
        const date = new Date(item.date)
        return date >= cutoff && !isNaN(date.getTime())
      } catch (error) {
        console.warn('Invalid date format in revenue attribution:', item.date)
        return false
      }
    })
  },

  /**
   * List Growth: Filter by date_recorded field
   */
  listGrowth: (items: any[], days: number) => {
    const cutoff = subDays(new Date(), days)
    return items.filter(item => {
      if (!item.date_recorded) return false
      
      try {
        const date = new Date(item.date_recorded)
        return date >= cutoff && !isNaN(date.getTime())
      } catch (error) {
        console.warn('Invalid date_recorded format in list growth:', item.date_recorded)
        return false
      }
    })
  },

  /**
   * Audience Metrics: Filter by date_recorded field
   */
  audience: (items: any[], days: number) => {
    const cutoff = subDays(new Date(), days)
    return items.filter(item => {
      if (!item.date_recorded) return false
      
      try {
        const date = new Date(item.date_recorded)
        return date >= cutoff && !isNaN(date.getTime())
      } catch (error) {
        console.warn('Invalid date_recorded format in audience:', item.date_recorded)
        return false
      }
    })
  },

  /**
   * Segment Metrics: Filter by date_recorded field
   */
  segments: (items: any[], days: number) => {
    const cutoff = subDays(new Date(), days)
    return items.filter(item => {
      if (!item.date_recorded) return false
      
      try {
        const date = new Date(item.date_recorded)
        return date >= cutoff && !isNaN(date.getTime())
      } catch (error) {
        console.warn('Invalid date_recorded format in segments:', item.date_recorded)
        return false
      }
    })
  },

  /**
   * Deliverability Metrics: Filter by date_recorded field
   */
  deliverability: (items: any[], days: number) => {
    const cutoff = subDays(new Date(), days)
    return items.filter(item => {
      if (!item.date_recorded) return false
      
      try {
        const date = new Date(item.date_recorded)
        return date >= cutoff && !isNaN(date.getTime())
      } catch (error) {
        console.warn('Invalid date_recorded format in deliverability:', item.date_recorded)
        return false
      }
    })
  }
}

/**
 * Calculate summary metrics from filtered data
 * Replaces backend summaries with client-side calculations from filtered data
 */
export const calculateTimeframeSummary = (filteredData: {
  campaigns: any[]
  flows: any[]
  revenueAttribution: any[]
  listGrowth: any[]
}) => {
  const { campaigns, flows, revenueAttribution, listGrowth } = filteredData

  // Campaign summary
  const campaignSummary = {
    total_campaigns: campaigns.length,
    total_sent: campaigns.reduce((sum, c) => sum + (c.recipients_count || 0), 0),
    total_revenue: campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0),
    avg_open_rate: campaigns.length > 0 
      ? campaigns.reduce((sum, c) => sum + (c.open_rate || 0), 0) / campaigns.length * 100
      : 0,
    avg_click_rate: campaigns.length > 0 
      ? campaigns.reduce((sum, c) => sum + (c.click_rate || 0), 0) / campaigns.length * 100
      : 0
  }

  // Flow summary
  const flowSummary = {
    active_flows: flows.length,
    total_triggered: flows.reduce((sum, f) => sum + (f.recipients || 0), 0),
    total_revenue: flows.reduce((sum, f) => sum + (f.revenue || 0), 0),
    avg_completion_rate: flows.length > 0
      ? flows.reduce((sum, f) => sum + (f.conversion_rate || 0), 0) / flows.length
      : 0
  }

  // Revenue attribution summary
  const revenueAttributionSummary = revenueAttribution.length > 0 ? {
    total_email_revenue: revenueAttribution.reduce((sum, r) => sum + (r.email_revenue || 0), 0),
    total_sms_revenue: revenueAttribution.reduce((sum, r) => sum + (r.sms_revenue || 0), 0),
    total_revenue: revenueAttribution.reduce((sum, r) => sum + (r.total_revenue || 0), 0),
    total_orders: revenueAttribution.reduce((sum, r) => sum + (r.total_orders || 0), 0),
    avg_email_percentage: revenueAttribution.reduce((sum, r) => sum + (r.email_percentage || 0), 0) / revenueAttribution.length,
    avg_sms_percentage: revenueAttribution.reduce((sum, r) => sum + (r.sms_percentage || 0), 0) / revenueAttribution.length,
    days_with_data: revenueAttribution.length
  } : null

  // List growth summary
  const listGrowthSummary = listGrowth.length > 0 ? {
    net_growth: listGrowth.reduce((sum, lg) => sum + (lg.overall_net_growth || 0), 0),
    average_growth_rate: listGrowth.reduce((sum, lg) => sum + (lg.growth_rate || 0), 0) / listGrowth.length,
    total_subscriptions: listGrowth.reduce((sum, lg) => sum + (lg.total_new_subscriptions || 0), 0),
    total_unsubscriptions: listGrowth.reduce((sum, lg) => sum + (lg.total_unsubscriptions || 0), 0),
    days_with_data: listGrowth.length
  } : null

  return {
    campaigns: campaignSummary,
    flows: flowSummary,
    revenueAttributionSummary,
    listGrowthSummary
  }
}

/**
 * Helper function to get date range label for UI display
 */
export const getTimeframeLabel = (days: number): string => {
  switch (days) {
    case 7: return 'Last 7 days'
    case 30: return 'Last 30 days'
    case 60: return 'Last 60 days'
    case 90: return 'Last 90 days'
    case 180: return 'Last 180 days'
    case 365: return 'Last 365 days'
    default: return `Last ${days} days`
  }
}

/**
 * Detect and filter outliers from chart data to improve visualization
 */
export const removeOutliers = (data: any[], valueKey: string, threshold: number = 2.5) => {
  if (data.length === 0) return data
  
  // Calculate mean and standard deviation
  const values = data.map(item => Math.abs(item[valueKey] || 0))
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)
  
  // Filter out values more than N standard deviations from mean
  return data.filter(item => {
    const value = Math.abs(item[valueKey] || 0)
    const isOutlier = Math.abs(value - mean) > threshold * stdDev
    if (isOutlier) {
      console.log(`📊 OUTLIER REMOVED: ${item[valueKey]} (mean: ${mean.toFixed(0)}, threshold: ${(threshold * stdDev).toFixed(0)})`)
    }
    return !isOutlier
  })
}

/**
 * Calculate smart Y-axis domain for charts with mixed positive/negative values
 */
export const getSmartYAxisDomain = (data: any[], valueKey: string): [number, number] => {
  if (data.length === 0) return [0, 100]
  
  const values = data.map(item => item[valueKey] || 0)
  const min = Math.min(...values)
  const max = Math.max(...values)
  
  // Add 10% padding to both ends
  const range = Math.abs(max - min)
  const padding = Math.max(range * 0.1, 1) // At least 1 unit padding
  
  return [min - padding, max + padding]
}