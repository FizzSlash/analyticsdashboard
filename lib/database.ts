import { supabaseAdmin, Client, CampaignMetric, FlowMetric, AudienceMetric, RevenueAttribution, Agency, UserProfile, SegmentMetric, DeliverabilityMetric } from './supabase'
import { format, subDays } from 'date-fns'

export class DatabaseService {
  // Agency Management
  static async getAgencyBySlug(slug: string): Promise<Agency | null> {
    const { data, error } = await supabaseAdmin
      .from('agencies')
      .select('*')
      .eq('agency_slug', slug)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching agency:', error)
      return null
    }

    return data
  }

  static async createAgency(agency: Omit<Agency, 'id' | 'created_at'>): Promise<Agency | null> {
    const { data, error } = await supabaseAdmin
      .from('agencies')
      .insert(agency)
      .select()
      .single()

    if (error) {
      console.error('Error creating agency:', error)
      return null
    }

    return data
  }

  static async getAgencyClients(agencyId: string): Promise<Client[]> {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching agency clients:', error)
      return []
    }

    return data || []
  }

  // User Profile Management
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  }

  static async createUserProfile(profile: Omit<UserProfile, 'created_at' | 'updated_at'>): Promise<UserProfile | null> {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .insert(profile)
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      return null
    }

    return data
  }

  // Client Management
  static async getClientBySlug(slug: string): Promise<Client | null> {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('brand_slug', slug)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching client:', error)
      return null
    }

    return data
  }

  static async getAllClients(): Promise<Client[]> {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching clients:', error)
      return []
    }

    return data || []
  }

  static async createClient(client: Omit<Client, 'id' | 'created_at'>): Promise<Client | null> {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .insert(client)
      .select()
      .single()

    if (error) {
      console.error('Error creating client:', error)
      return null
    }

    return data
  }

  static async updateClientSyncTime(clientId: string): Promise<void> {
    await supabaseAdmin
      .from('clients')
      .update({ last_sync: new Date().toISOString() })
      .eq('id', clientId)
  }

  // Campaign Metrics
  static async getCampaignMetrics(clientId: string, limit: number = 50): Promise<CampaignMetric[]> {
    const { data, error } = await supabaseAdmin
      .from('campaign_metrics')
      .select('*')
      .eq('client_id', clientId)
      .order('send_date', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching campaign metrics:', error)
      return []
    }

    return data || []
  }

  static async getRecentCampaignMetrics(clientId: string, days: number = 30): Promise<CampaignMetric[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabaseAdmin
      .from('campaign_metrics')
      .select('*')
      .eq('client_id', clientId)
      .gte('send_date', startDate.toISOString())
      .order('send_date', { ascending: false })

    if (error) {
      console.error('Error fetching recent campaign metrics:', error)
      return []
    }

    return data || []
  }

  static async upsertCampaignMetric(metric: Omit<CampaignMetric, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    console.log(`💾 DATABASE: Attempting to save campaign metric for campaign: ${metric.campaign_id}`)
    console.log(`💾 DATABASE: Campaign data:`, JSON.stringify(metric, null, 2))
    
    const { data, error } = await supabaseAdmin
      .from('campaign_metrics')
      .upsert(metric, {
        onConflict: 'client_id,campaign_id',
        ignoreDuplicates: false
      })
      .select()

    if (error) {
      console.error('❌ DATABASE: Error upserting campaign metric:', error)
      console.error('❌ DATABASE: Failed metric data:', metric)
    } else {
      console.log(`✅ DATABASE: Campaign metric saved successfully:`, data)
    }
  }

  // Flow Metrics
  static async getFlowMetrics(clientId: string, limit: number = 50): Promise<FlowMetric[]> {
    const { data, error } = await supabaseAdmin
      .from('flow_metrics')
      .select('*')
      .eq('client_id', clientId)
      .order('date_start', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching flow metrics:', error)
      return []
    }

    return data || []
  }

  static async getRecentFlowMetrics(clientId: string, days: number = 30): Promise<FlowMetric[]> {
    console.log(`📊 DATABASE: Getting flow metrics for ${days} days - aggregating from weekly message data`)
    
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    // Get weekly data from flow_message_metrics and flow metadata
    const [weeklyResult, flowMetaResult] = await Promise.all([
      supabaseAdmin
        .from('flow_message_metrics')
        .select('*')
        .eq('client_id', clientId)
        .gte('week_date', cutoffDate.toISOString().split('T')[0])
        .order('week_date', { ascending: false }),
      supabaseAdmin
        .from('flow_metrics')
        .select('flow_id, flow_name, flow_status, trigger_type')
        .eq('client_id', clientId)
    ])

    const weeklyData = weeklyResult.data
    const flowMeta = flowMetaResult.data || []
    const error = weeklyResult.error || flowMetaResult.error

    if (error) {
      console.error('Error fetching weekly flow message data:', error)
      return []
    }

    if (!weeklyData || weeklyData.length === 0) {
      console.log('📊 DATABASE: No weekly flow data found, returning empty array')
      return []
    }

    // Create flow metadata lookup
    const flowMetaLookup: { [flowId: string]: any } = {}
    flowMeta.forEach((meta: any) => {
      flowMetaLookup[meta.flow_id] = meta
    })

    // Aggregate weekly data by flow_id
    const flowAggregates: { [flowId: string]: any } = {}
    
    weeklyData.forEach((record: any) => {
      const flowId = record.flow_id
      const meta = flowMetaLookup[flowId] || {}
      
      if (!flowAggregates[flowId]) {
        flowAggregates[flowId] = {
          id: `${flowId}_${days}d`, // Unique ID for this timeframe
          client_id: clientId,
          flow_id: flowId,
          flow_name: meta.flow_name || `Flow ${flowId}`,
          flow_type: 'email',
          flow_status: meta.flow_status || 'live',
          trigger_type: meta.trigger_type,
          date_start: record.week_date,
          date_end: record.week_date,
          triggered_count: 0,
          completed_count: 0,
          completion_rate: 0,
          revenue: 0,
          orders_count: 0,
          revenue_per_trigger: 0,
          opens: 0,
          opens_unique: 0,
          clicks: 0,
          clicks_unique: 0,
          open_rate: 0,
          click_rate: 0,
          click_to_open_rate: 0,
          conversions: 0,
          conversion_value: 0,
          recipients: 0,
          revenue_per_recipient: 0,
          average_order_value: 0,
          delivery_rate: 0,
          bounce_rate: 0,
          created_at: record.created_at,
          updated_at: record.updated_at,
          recordCount: 0
        }
      }
      
      // Aggregate the weekly data
      const agg = flowAggregates[flowId]
      agg.opens += record.opens || 0
      agg.opens_unique += record.opens_unique || 0
      agg.clicks += record.clicks || 0
      agg.clicks_unique += record.clicks_unique || 0
      agg.conversions += record.conversions || 0
      agg.conversion_value += parseFloat(record.conversion_value || 0)
      agg.revenue += parseFloat(record.conversion_value || 0)
      agg.recipients += record.recipients || 0
      agg.delivered += record.delivered || 0
      agg.bounced += record.bounced || 0
      agg.recordCount++
      
      // Update date range
      if (record.week_date > agg.date_end) {
        agg.date_end = record.week_date
      }
      if (record.week_date < agg.date_start) {
        agg.date_start = record.week_date
      }
    })
    
    // Calculate rates and finalize aggregates
    Object.values(flowAggregates).forEach((agg: any) => {
      if (agg.recipients > 0) {
        agg.open_rate = agg.opens / agg.recipients
        agg.click_rate = agg.clicks / agg.recipients
        agg.delivery_rate = agg.delivered / agg.recipients
        agg.bounce_rate = agg.bounced / agg.recipients
        agg.revenue_per_recipient = agg.revenue / agg.recipients
      }
      
      if (agg.opens > 0) {
        agg.click_to_open_rate = agg.clicks / agg.opens
      }
      
      if (agg.conversions > 0) {
        agg.average_order_value = agg.revenue / agg.conversions
      }
      
      // Clean up temporary fields
      delete agg.recordCount
    })

    const result = Object.values(flowAggregates) as FlowMetric[]
    console.log(`📊 DATABASE: Aggregated ${weeklyData.length} weekly records into ${result.length} flows for ${days} days`)
    
    return result
  }

  static async upsertFlowMetric(metric: Omit<FlowMetric, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const { error } = await supabaseAdmin
      .from('flow_metrics')
      .upsert(metric, {
        onConflict: 'client_id,flow_id,date_start',
        ignoreDuplicates: false
      })

    if (error) {
      console.error('Error upserting flow metric:', error)
    }
  }

  static async upsertFlowMessageMetric(metric: any): Promise<void> {
    const { error } = await supabaseAdmin
      .from('flow_message_metrics')
      .upsert(metric, {
        onConflict: 'client_id,message_id,week_date',
        ignoreDuplicates: false
      })

    if (error) {
      console.error('Error upserting flow message metric:', error)
    }
  }

  // Audience Metrics
  static async getAudienceMetrics(clientId: string, days: number = 30): Promise<AudienceMetric[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabaseAdmin
      .from('audience_metrics')
      .select('*')
      .eq('client_id', clientId)
      .gte('date_recorded', startDate.toISOString().split('T')[0])
      .order('date_recorded', { ascending: false })

    if (error) {
      console.error('Error fetching audience metrics:', error)
      return []
    }

    return data || []
  }

  static async getLatestAudienceMetric(clientId: string): Promise<AudienceMetric | null> {
    const { data, error } = await supabaseAdmin
      .from('audience_metrics')
      .select('*')
      .eq('client_id', clientId)
      .order('date_recorded', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching latest audience metric:', error)
      return null
    }

    return data
  }

  static async upsertAudienceMetric(metric: Omit<AudienceMetric, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabaseAdmin
      .from('audience_metrics')
      .upsert(metric, {
        onConflict: 'client_id,date_recorded',
        ignoreDuplicates: false
      })

    if (error) {
      console.error('Error upserting audience metric:', error)
    }
  }

  // Revenue Attribution
  static async getRevenueAttribution(clientId: string, days: number = 30): Promise<RevenueAttribution[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabaseAdmin
      .from('revenue_attribution')
      .select('*')
      .eq('client_id', clientId)
      .gte('date_recorded', startDate.toISOString().split('T')[0])
      .order('date_recorded', { ascending: false })

    if (error) {
      console.error('Error fetching revenue attribution:', error)
      return []
    }

    return data || []
  }

  static async upsertRevenueAttribution(metric: Omit<RevenueAttribution, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabaseAdmin
      .from('revenue_attribution')
      .upsert(metric, {
        onConflict: 'client_id,date_recorded',
        ignoreDuplicates: false
      })

    if (error) {
      console.error('Error upserting revenue attribution:', error)
    }
  }

  // Dashboard Summary Data
  static async getDashboardSummary(clientId: string, days: number = 30) {
    const [campaigns, flows, audience, revenue] = await Promise.all([
      this.getRecentCampaignMetrics(clientId, days),
      this.getRecentFlowMetrics(clientId, days),
      this.getAudienceMetrics(clientId, days),
      this.getRevenueAttribution(clientId, days)
    ])

    // Calculate totals and averages
    const campaignTotals = campaigns.reduce((acc, campaign) => ({
      recipients: acc.recipients + campaign.recipients_count,
      opens: acc.opens + campaign.opened_count,
      clicks: acc.clicks + campaign.clicked_count,
      revenue: acc.revenue + campaign.revenue,
      campaigns: acc.campaigns + 1
    }), { recipients: 0, opens: 0, clicks: 0, revenue: 0, campaigns: 0 })

    const flowTotals = flows.reduce((acc, flow) => ({
      triggered: acc.triggered + flow.triggered_count,
      completed: acc.completed + flow.completed_count,
      revenue: acc.revenue + flow.revenue,
      flows: acc.flows + 1
    }), { triggered: 0, completed: 0, revenue: 0, flows: 0 })

    const latestAudience = audience[0] || null
    const previousAudience = audience[1] || null

    const totalRevenue = revenue.reduce((sum, r) => sum + r.total_email_revenue, 0)

    return {
      campaigns: {
        total_sent: campaignTotals.campaigns,
        total_recipients: campaignTotals.recipients,
        avg_open_rate: campaignTotals.recipients > 0 ? (campaignTotals.opens / campaignTotals.recipients) * 100 : 0,
        avg_click_rate: campaignTotals.recipients > 0 ? (campaignTotals.clicks / campaignTotals.recipients) * 100 : 0,
        total_revenue: campaignTotals.revenue
      },
      flows: {
        active_flows: flowTotals.flows,
        total_triggered: flowTotals.triggered,
        completion_rate: flowTotals.triggered > 0 ? (flowTotals.completed / flowTotals.triggered) * 100 : 0,
        total_revenue: flowTotals.revenue
      },
      audience: {
        total_subscribers: latestAudience?.subscribed_profiles || 0,
        growth_rate: latestAudience?.growth_rate || 0,
        engagement_rate: latestAudience?.engagement_rate || 0,
        net_growth: latestAudience && previousAudience ? 
          latestAudience.subscribed_profiles - previousAudience.subscribed_profiles : 0
      },
      revenue: {
        total_revenue: totalRevenue,
        campaign_revenue: revenue.reduce((sum, r) => sum + r.campaign_revenue, 0),
        flow_revenue: revenue.reduce((sum, r) => sum + r.flow_revenue, 0),
        total_orders: revenue.reduce((sum, r) => sum + r.total_email_orders, 0)
      }
    }
  }

  // Top Performers
  static async getTopCampaigns(clientId: string, metric: 'open_rate' | 'click_rate' | 'revenue' = 'open_rate', limit: number = 5): Promise<CampaignMetric[]> {
    const { data, error } = await supabaseAdmin
      .from('campaign_metrics')
      .select('*')
      .eq('client_id', clientId)
      .order(metric, { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching top campaigns:', error)
      return []
    }

    return data || []
  }

  static async getTopFlows(clientId: string, metric: 'completion_rate' | 'revenue_per_trigger' | 'revenue' = 'revenue', limit: number = 5): Promise<FlowMetric[]> {
    const { data, error } = await supabaseAdmin
      .from('flow_metrics')
      .select('*')
      .eq('client_id', clientId)
      .order(metric, { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching top flows:', error)
      return []
    }

    return data || []
  }

  // NEW METHODS FOR 4-SECTION STRUCTURE

  // Segment Metrics
  static async upsertSegmentMetric(metric: Omit<SegmentMetric, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const { error } = await supabaseAdmin
      .from('segment_metrics')
      .upsert(metric, {
        onConflict: 'client_id,segment_id,date_recorded',
        ignoreDuplicates: false
      })

    if (error) {
      console.error('Error upserting segment metric:', error)
    }
  }

  static async getSegmentMetrics(clientId: string, days: number = 30): Promise<SegmentMetric[]> {
    const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd')
    
    const { data, error } = await supabaseAdmin
      .from('segment_metrics')
      .select('*')
      .eq('client_id', clientId)
      .gte('date_recorded', startDate)
      .order('date_recorded', { ascending: false })

    if (error) {
      console.error('Error fetching segment metrics:', error)
      return []
    }

    return data || []
  }

  // Deliverability Metrics
  static async upsertDeliverabilityMetric(metric: Omit<DeliverabilityMetric, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabaseAdmin
      .from('deliverability_metrics')
      .upsert(metric, {
        onConflict: 'client_id,date_recorded',
        ignoreDuplicates: false
      })

    if (error) {
      console.error('Error upserting deliverability metric:', error)
    }
  }

  static async getDeliverabilityMetrics(clientId: string, days: number = 30): Promise<DeliverabilityMetric[]> {
    const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd')
    
    const { data, error } = await supabaseAdmin
      .from('deliverability_metrics')
      .select('*')
      .eq('client_id', clientId)
      .gte('date_recorded', startDate)
      .order('date_recorded', { ascending: false })

    if (error) {
      console.error('Error fetching deliverability metrics:', error)
      return []
    }

    return data || []
  }
}
