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
   * Flows: Filter flow_message_metrics by week_date, then aggregate by flow_id
   * This is the correct data source for flow performance analytics
   */
  flows: (flowMessages: any[], days: number) => {
    const cutoff = subDays(new Date(), days)
    
    // 1. Filter flow messages by week_date within timeframe
    const filteredMessages = flowMessages.filter(msg => {
      if (!msg.week_date) return false
      
      try {
        const weekDate = new Date(msg.week_date)
        return weekDate >= cutoff && !isNaN(weekDate.getTime())
      } catch (error) {
        console.warn('Invalid week_date format:', msg.week_date)
        return false
      }
    })
    
    // 2. Aggregate by flow_id to get flow-level metrics
    const aggregated = filteredMessages.reduce((acc: any, msg: any) => {
      const flowId = msg.flow_id
      if (!acc[flowId]) {
        acc[flowId] = {
          flow_id: flowId,
          flow_name: msg.flow_name || 'Unknown Flow',
          flow_type: 'email',
          revenue: 0,
          opens: 0,
          clicks: 0,
          recipients: 0,
          conversions: 0,
          conversion_value: 0,
          delivered: 0,
          bounced: 0,
          unsubscribes: 0,
          messages_count: 0,
          // Calculated fields
          open_rate: 0,
          click_rate: 0,
          conversion_rate: 0,
          revenue_per_recipient: 0,
          average_order_value: 0
        }
      }
      
      // Sum up all metrics
      acc[flowId].revenue += msg.revenue || 0
      acc[flowId].opens += msg.opens || 0
      acc[flowId].clicks += msg.clicks || 0
      acc[flowId].recipients += msg.recipients || 0
      acc[flowId].conversions += msg.conversions || 0
      acc[flowId].conversion_value += msg.conversion_value || 0
      acc[flowId].delivered += msg.delivered || 0
      acc[flowId].bounced += msg.bounced || 0
      acc[flowId].unsubscribes += msg.unsubscribes || 0
      acc[flowId].messages_count += 1
      
      return acc
    }, {})
    
    // 3. Calculate derived metrics for each flow
    return Object.values(aggregated).map((flow: any) => {
      if (flow.recipients > 0) {
        flow.open_rate = flow.opens / flow.recipients
        flow.click_rate = flow.clicks / flow.recipients
        flow.revenue_per_recipient = flow.revenue / flow.recipients
      }
      
      if (flow.conversions > 0) {
        flow.average_order_value = flow.revenue / flow.conversions
      }
      
      if (flow.recipients > 0) {
        flow.conversion_rate = flow.conversions / flow.recipients
      }
      
      return flow
    })
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