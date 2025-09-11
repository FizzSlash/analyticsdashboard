import { supabase, supabaseAdmin, Client, CampaignMetric, FlowMetric, AudienceMetric, RevenueAttribution, Agency, UserProfile } from './supabase'

export class DatabaseService {
  // Agency Management
  static async getAgencyBySlug(slug: string): Promise<Agency | null> {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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

    const { data, error } = await supabase
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
    const { error } = await supabaseAdmin
      .from('campaign_metrics')
      .upsert(metric, {
        onConflict: 'client_id,campaign_id',
        ignoreDuplicates: false
      })

    if (error) {
      console.error('Error upserting campaign metric:', error)
    }
  }

  // Flow Metrics
  static async getFlowMetrics(clientId: string, limit: number = 50): Promise<FlowMetric[]> {
    const { data, error } = await supabase
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
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('flow_metrics')
      .select('*')
      .eq('client_id', clientId)
      .gte('date_start', startDate.toISOString())
      .order('date_start', { ascending: false })

    if (error) {
      console.error('Error fetching recent flow metrics:', error)
      return []
    }

    return data || []
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

  // Audience Metrics
  static async getAudienceMetrics(clientId: string, days: number = 30): Promise<AudienceMetric[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
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
    const { data, error } = await supabase
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

    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
}
