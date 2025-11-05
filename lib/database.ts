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

  static async getAgencyById(id: string): Promise<Agency | null> {
    const { data, error } = await supabaseAdmin
      .from('agencies')
      .select('*')
      .eq('id', id)
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

  // Get ALL campaigns including drafts (no date filter)
  static async getAllCampaigns(clientId: string): Promise<CampaignMetric[]> {
    let allCampaigns: any[] = []
    let hasMore = true
    let pageNumber = 0
    const pageSize = 1000
    
    while (hasMore) {
      const { data, error } = await supabaseAdmin
        .from('campaign_metrics')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .range(pageNumber * pageSize, (pageNumber + 1) * pageSize - 1)

      if (error) {
        console.error(`Error fetching all campaigns page ${pageNumber}:`, error)
        break
      }

      if (data && data.length > 0) {
        allCampaigns = allCampaigns.concat(data)
        
        if (data.length < pageSize) {
          hasMore = false
        } else {
          pageNumber++
        }
      } else {
        hasMore = false
      }
    }

    console.log(`✅ DATABASE: Fetched ${allCampaigns.length} total campaigns (including drafts)`)
    return allCampaigns
  }

  static async getRecentCampaignMetrics(clientId: string, days: number = 30): Promise<CampaignMetric[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Fetch campaign data with pagination to handle large datasets (Supabase has 1000 row limit per query)
    let allCampaigns: any[] = []
    let hasMore = true
    let pageNumber = 0
    const pageSize = 1000
    
    while (hasMore) {
      const { data, error } = await supabaseAdmin
        .from('campaign_metrics')
        .select('*')
        .eq('client_id', clientId)
        .gte('send_date', startDate.toISOString())
        .order('send_date', { ascending: false })
        .range(pageNumber * pageSize, (pageNumber + 1) * pageSize - 1)

      if (error) {
        console.error(`Error fetching campaign metrics page ${pageNumber}:`, error)
        break
      }

      if (data && data.length > 0) {
        allCampaigns = allCampaigns.concat(data)
        
        if (data.length < pageSize) {
          hasMore = false
        } else {
          pageNumber++
        }
      } else {
        hasMore = false
      }
    }

    return allCampaigns
  }

  static async upsertCampaignMetric(metric: Omit<CampaignMetric, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    console.log(`💾 DATABASE: Attempting to save campaign metric for campaign: ${metric.campaign_id}`)
    console.log(`💾 DATABASE: Campaign data:`, JSON.stringify(metric, null, 2))
    
    // Preserve existing email_html if not provided in metric
    let metricWithHtml = metric
    if (!metric.email_html) {
      const { data: existing } = await supabaseAdmin
        .from('campaign_metrics')
        .select('email_html')
        .eq('client_id', metric.client_id)
        .eq('campaign_id', metric.campaign_id)
        .single()
      
      if (existing?.email_html) {
        console.log(`📧 DATABASE: Preserving existing email_html for campaign ${metric.campaign_id}`)
        metricWithHtml = { ...metric, email_html: existing.email_html }
      }
    }
    
    const { data, error } = await supabaseAdmin
      .from('campaign_metrics')
      .upsert(metricWithHtml, {
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
    console.log(`📊 DATABASE: Getting flow metrics for CLIENT_ID: ${clientId}, ${days} days - aggregating from weekly message data`)
    
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    console.log(`📊 DATABASE: Cutoff date: ${cutoffDate.toISOString().split('T')[0]}`)

    // Get ONLY ACTIVE/LIVE flows from flow_metrics (exclude drafts)
    const flowMetaResult = await supabaseAdmin
      .from('flow_metrics')
      .select('flow_id, flow_name, flow_status, flow_type, opens, clicks, revenue, open_rate, click_rate, date_start')
      .eq('client_id', clientId)
      .in('flow_status', ['active', 'live'])  // Match frontend filter: active OR live, no drafts
      .order('date_start', { ascending: false })

    // Fetch weekly data with pagination to handle large datasets (Supabase has 1000 row limit per query)
    console.log(`📊 DATABASE: Fetching weekly data with pagination...`)
    let weeklyData: any[] = []
    let hasMore = true
    let pageNumber = 0
    const pageSize = 1000
    
    while (hasMore) {
      const { data, error } = await supabaseAdmin
        .from('flow_message_metrics')
        .select('*')
        .eq('client_id', clientId)
        .gte('week_date', cutoffDate.toISOString().split('T')[0])
        .order('week_date', { ascending: false })
        .range(pageNumber * pageSize, (pageNumber + 1) * pageSize - 1)
      
      if (error) {
        console.error(`📊 DATABASE: Error fetching page ${pageNumber}:`, error)
        break
      }
      
      if (data && data.length > 0) {
        weeklyData = weeklyData.concat(data)
        console.log(`📊 DATABASE: Fetched page ${pageNumber + 1}: ${data.length} records (total so far: ${weeklyData.length})`)
        
        // If we got less than pageSize records, we've reached the end
        if (data.length < pageSize) {
          hasMore = false
        } else {
          pageNumber++
        }
      } else {
        hasMore = false
      }
    }
    
    console.log(`📊 DATABASE: Pagination complete - fetched ${weeklyData.length} total records across ${pageNumber + 1} pages`)

    let flowMeta = flowMetaResult.data || []
    const error = flowMetaResult.error

    console.log(`📊 DATABASE: Raw query results - weeklyData: ${weeklyData?.length || 0} records, flowMeta: ${flowMeta?.length || 0} records`)
    console.log(`📊 DATABASE: Sample weeklyData:`, weeklyData?.slice(0, 2))
    console.log(`📊 DATABASE: Sample flowMeta:`, flowMeta?.slice(0, 2))
    console.log(`📊 DATABASE: WeeklyData null check:`, !weeklyData, `Length check:`, weeklyData?.length === 0)

    if (error) {
      console.error('Error fetching weekly flow message data:', error)
      return []
    }

    if (!weeklyData || weeklyData.length === 0) {
      console.log('📊 DATABASE: No weekly flow data found for timeframe, checking all data...')
      
      // Check if there's any data at all
      const { data: allData, error: allDataError } = await supabaseAdmin
        .from('flow_message_metrics')
        .select('flow_id, week_date, date_recorded, opens, revenue, client_id')
        .eq('client_id', clientId)
        .limit(10)
      
      console.log('📊 DATABASE: Sample of all flow_message_metrics data:', allData)
      console.log('📊 DATABASE: Cutoff date used:', cutoffDate.toISOString().split('T')[0])
      console.log('📊 DATABASE: Client ID being searched:', clientId)
      
      // Also check what client IDs actually exist in the table
      const { data: allClientIds } = await supabaseAdmin
        .from('flow_message_metrics')
        .select('DISTINCT client_id')
        .limit(5)
      console.log('📊 DATABASE: Available client IDs in flow_message_metrics:', allClientIds)
      
      if (!allData || allData.length === 0) {
        console.log('📊 DATABASE: No flow data exists at all for this client')
        return []
      }
      
      // If we have data but it's outside the date range, use all available data
      console.log('📊 DATABASE: Date filtering too restrictive, fetching all available flow data with pagination...')
      
      // Fetch flow metadata
      const allFlowMetaResult = await supabaseAdmin
        .from('flow_metrics')
        .select('flow_id, flow_name, flow_status, trigger_type')
        .eq('client_id', clientId)
      
      // Fetch all weekly data with pagination
      let allWeeklyData: any[] = []
      let hasMoreFallback = true
      let fallbackPage = 0
      const fallbackPageSize = 1000
      
      while (hasMoreFallback) {
        const { data, error } = await supabaseAdmin
          .from('flow_message_metrics')
          .select('*')
          .eq('client_id', clientId)
          .order('week_date', { ascending: false })
          .range(fallbackPage * fallbackPageSize, (fallbackPage + 1) * fallbackPageSize - 1)
        
        if (error) {
          console.error(`📊 DATABASE: Error fetching fallback page ${fallbackPage}:`, error)
          break
        }
        
        if (data && data.length > 0) {
          allWeeklyData = allWeeklyData.concat(data)
          console.log(`📊 DATABASE: Fallback page ${fallbackPage + 1}: ${data.length} records (total: ${allWeeklyData.length})`)
          
          if (data.length < fallbackPageSize) {
            hasMoreFallback = false
          } else {
            fallbackPage++
          }
        } else {
          hasMoreFallback = false
        }
      }
      
      weeklyData = allWeeklyData
      flowMeta = allFlowMetaResult.data || []
      console.log(`📊 DATABASE: Fallback query complete - weeklyData: ${weeklyData?.length || 0} records, flowMeta: ${flowMeta?.length || 0} records`)
      
      if (!weeklyData || weeklyData.length === 0) {
        return []
      }
    }

    // Create flow metadata lookup
    const flowMetaLookup: { [flowId: string]: any } = {}
    flowMeta.forEach((meta: any) => {
      flowMetaLookup[meta.flow_id] = meta
    })

    console.log(`📊 DATABASE: Flow metadata available for ${flowMeta.length} flows`)
    console.log(`📊 DATABASE: Weekly data available for ${weeklyData?.length || 0} records`)

    // Start with ALL flows from flow_metrics (includes flows with 0 messages)
    const flowAggregates: { [flowId: string]: any } = {}
    
    // STEP 1: Add ALL flows from flow_metrics (even those with 0 messages)
    flowMeta.forEach((flow: any) => {
      flowAggregates[flow.flow_id] = {
        id: `${flow.flow_id}_${days}d`,
          client_id: clientId,
        flow_id: flow.flow_id,
        flow_name: flow.flow_name || `Flow ${flow.flow_id}`,
        flow_type: flow.flow_type || 'email',
        flow_status: flow.flow_status || 'live',
        trigger_type: flow.flow_type,
        date_start: flow.date_start,
        date_end: flow.date_start,
        
        // Default values (will be updated if weekly data exists)
          triggered_count: 0,
          completed_count: 0,
          completion_rate: 0,
        revenue: flow.revenue || 0,
          orders_count: 0,
          revenue_per_trigger: 0,
        opens: flow.opens || 0,
        clicks: flow.clicks || 0,
        open_rate: flow.open_rate || 0,
        click_rate: flow.click_rate || 0,
        
        // Weekly aggregation fields (will be updated if weekly data exists)
        weeklyOpens: 0,
        weeklyClicks: 0,
        weeklyRevenue: 0,
        weeklyDelivered: 0,
        weeklyRecipients: 0,
        weeklyConversions: 0,
        averageOrderValue: 0,
        revenuePerRecipient: 0,
        created_at: flow.date_start
      }
    })
    
    console.log(`📊 DATABASE: Initialized ${Object.keys(flowAggregates).length} flows from flow_metrics`)
    
    // STEP 2: Enhance with weekly data where available
    let totalRevenueAggregated = 0
    let recordsProcessed = 0
    let flowsWithData = new Set()
    
    if (weeklyData && weeklyData.length > 0) {
      console.log(`📊 DATABASE: Processing ${weeklyData.length} weekly records for aggregation`)
      
      weeklyData.forEach((record: any) => {
        const flowId = record.flow_id
        const recordRevenue = parseFloat(record.revenue) || 0
        
        totalRevenueAggregated += recordRevenue
        recordsProcessed++
        flowsWithData.add(flowId)
        
        if (flowAggregates[flowId]) {
          // Update existing flow with weekly data
          const existing = flowAggregates[flowId]
          
          // Add weekly data to existing aggregates
          existing.weeklyOpens += record.opens || 0
          existing.weeklyClicks += record.clicks || 0
          existing.weeklyRevenue += recordRevenue
          existing.weeklyDelivered += record.delivered || 0
          existing.weeklyRecipients += record.recipients || 0
          
          // Update totals (override with weekly aggregated data)
          existing.opens = existing.weeklyOpens
          existing.clicks = existing.weeklyClicks
          existing.revenue = existing.weeklyRevenue
          
          // ✅ FIX: Calculate proper rates from aggregated totals
          existing.open_rate = existing.weeklyRecipients > 0 ? (existing.weeklyOpens / existing.weeklyRecipients) : 0
          existing.click_rate = existing.weeklyRecipients > 0 ? (existing.weeklyClicks / existing.weeklyRecipients) : 0
          
          // ✅ FIX: Calculate proper revenue per recipient from aggregated totals
          existing.revenuePerRecipient = existing.weeklyRecipients > 0 ? (existing.weeklyRevenue / existing.weeklyRecipients) : 0
          
          // Add weekly conversions tracking
          existing.weeklyConversions += record.conversions || 0
          
          // ✅ FIX: Calculate average order value from total aggregated data
          existing.averageOrderValue = existing.weeklyConversions > 0 ? (existing.weeklyRevenue / existing.weeklyConversions) : 0
        } else {
          console.log(`⚠️ DATABASE: Flow ${flowId} has weekly data but not in flow_metrics table!`)
        }
      })
      console.log(`📊 DATABASE: ========================================`)
      console.log(`📊 DATABASE: AGGREGATION COMPLETE FOR ${days} DAYS`)
      console.log(`📊 DATABASE: ========================================`)
      console.log(`   - Weekly records in query result: ${weeklyData.length}`)
      console.log(`   - Records actually processed: ${recordsProcessed}`)
      console.log(`   - Total revenue from raw records: $${totalRevenueAggregated.toLocaleString()}`)
      console.log(`   - Flows with weekly data: ${flowsWithData.size}`)
      console.log(`   - Flows in flow_metrics table: ${Object.keys(flowAggregates).length}`)
      console.log(`📊 DATABASE: ========================================`)
    } else {
      console.log(`📊 DATABASE: No weekly data available - showing flows with zero values`)
    }

    // Convert aggregates to array and return ALL flows (including those with 0 messages)
    const flows = Object.values(flowAggregates)
    const totalRevenueInFlows = flows.reduce((sum, f: any) => sum + (f.revenue || 0), 0)
    
    console.log(`📊 DATABASE: FINAL FLOW ARRAY:`)
    console.log(`   - Total flows returned: ${flows.length}`)
    console.log(`   - Total revenue in flow objects: $${totalRevenueInFlows.toLocaleString()}`)
    console.log(`   - Revenue match check: Aggregated($${totalRevenueAggregated.toLocaleString()}) vs Flow array($${totalRevenueInFlows.toLocaleString()})`)
    
    if (Math.abs(totalRevenueAggregated - totalRevenueInFlows) > 1) {
      console.log(`🚨 REVENUE MISMATCH! ${totalRevenueAggregated - totalRevenueInFlows} difference!`)
    }
    console.log(`📊 DATABASE: Flow breakdown:`, flows.map(f => ({ 
      id: f.flow_id, 
      name: f.flow_name, 
      status: f.flow_status,
      opens: f.opens,
      revenue: f.revenue
    })))
    
    return flows
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

  // Flow Actions Methods
  static async upsertFlowActions(clientId: string, flowId: string, actions: any[]): Promise<void> {
    console.log(`💾 DATABASE: Saving ${actions.length} flow actions for flow ${flowId}`)
    
    // Delete existing actions for this flow to avoid duplicates
    const { error: deleteError } = await supabaseAdmin
      .from('flow_actions')
      .delete()
      .eq('client_id', clientId)
      .eq('flow_id', flowId)
    
    if (deleteError) {
      console.error('Error deleting old flow actions:', deleteError)
    }
    
    // Insert new actions
    if (actions.length > 0) {
      const { error } = await supabaseAdmin
        .from('flow_actions')
        .insert(actions)
      
      if (error) {
        console.error('Error inserting flow actions:', error)
        throw error
      }
      
      console.log(`✅ DATABASE: Saved ${actions.length} flow actions for flow ${flowId}`)
    }
  }

  static async getFlowActions(clientId: string, flowId: string): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('flow_actions')
      .select('*')
      .eq('client_id', clientId)
      .eq('flow_id', flowId)
      .order('sequence_position', { ascending: true })
    
    if (error) {
      console.error('Error fetching flow actions:', error)
      return []
    }
    
    return data || []
  }

  // Get weekly flow trend data for charts
  static async getFlowWeeklyTrends(clientId: string, days: number = 30): Promise<any[]> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    console.log(`📊 FLOW WEEKLY TRENDS: Fetching for ${days} days, cutoff: ${cutoffDate.toISOString().split('T')[0]}`)

    // ✅ FIX: Fetch with PAGINATION to handle large datasets (Supabase has 1000 row limit)
    let allData: any[] = []
    let hasMore = true
    let pageNumber = 0
    const pageSize = 1000
    
    while (hasMore) {
      const { data, error } = await supabaseAdmin
        .from('flow_message_metrics')
        .select('week_date, opens, clicks, revenue, conversion_value')
        .eq('client_id', clientId)
        .gte('week_date', cutoffDate.toISOString().split('T')[0])
        .order('week_date', { ascending: true })
        .range(pageNumber * pageSize, (pageNumber + 1) * pageSize - 1)

      if (error) {
        console.error(`📊 FLOW WEEKLY TRENDS: Error fetching page ${pageNumber}:`, error)
        break
      }

      if (data && data.length > 0) {
        allData = allData.concat(data)
        console.log(`📊 FLOW WEEKLY TRENDS: Page ${pageNumber + 1}: ${data.length} records (total: ${allData.length})`)
        
        if (data.length < pageSize) {
          hasMore = false
        } else {
          pageNumber++
        }
      } else {
        hasMore = false
      }
    }

    console.log(`📊 FLOW WEEKLY TRENDS: Pagination complete - fetched ${allData.length} total records`)
    
    if (!allData || allData.length === 0) {
      console.log(`📊 FLOW WEEKLY TRENDS: NO DATA for ${days} days - returning empty array`)
      return []
    }

    console.log(`📊 FLOW WEEKLY TRENDS: Date range in results: ${allData[0]?.week_date} to ${allData[allData.length-1]?.week_date}`)

    // Aggregate by week_date (keeping actual database dates as keys)
    const weeklyTotals: { [week: string]: any } = {}
    
    allData.forEach((record: any) => {
      const week = record.week_date
      if (!weeklyTotals[week]) {
        weeklyTotals[week] = {
          week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          weekDate: week, // Keep ISO date for accurate parsing
          revenue: 0,
          opens: 0,
          clicks: 0
        }
      }
      
      weeklyTotals[week].revenue += parseFloat(record.conversion_value || record.revenue || 0)
      weeklyTotals[week].opens += record.opens || 0
      weeklyTotals[week].clicks += record.clicks || 0
    })

    const result = Object.values(weeklyTotals)
    console.log(`📊 FLOW WEEKLY TRENDS: Returning ${result.length} weeks with revenue total: $${result.reduce((sum, w) => sum + w.revenue, 0).toLocaleString()}`)
    console.log(`📊 FLOW WEEKLY TRENDS: Sample result:`, result.slice(0, 3))
    
    return result
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
  // DEPRECATED: Old revenue_attribution table methods (kept for backward compatibility)
  static async getRevenueAttribution(clientId: string, days: number = 30): Promise<RevenueAttribution[]> {
    console.log('⚠️ WARNING: Using deprecated getRevenueAttribution method. Use getRevenueAttributionMetrics instead.')
    return [] // Return empty array instead of calling old table
  }

  static async upsertRevenueAttribution(metric: Omit<RevenueAttribution, 'id' | 'created_at'>): Promise<void> {
    console.log('💾 DATABASE: Upserting Flow LUXE revenue attribution data to revenue_attribution table...')
    
    const { error } = await supabaseAdmin
      .from('revenue_attribution')
      .upsert(metric, {
        onConflict: 'client_id,date_recorded',
        ignoreDuplicates: false
      })

    if (error) {
      console.error('❌ DATABASE: Error upserting revenue attribution:', error)
      throw error
    }
    
    console.log('✅ DATABASE: Flow LUXE revenue attribution saved successfully')
  }

  // REVENUE ATTRIBUTION METRICS METHODS (Enhanced with Flow LUXE fields)
  static async upsertRevenueAttributionMetric(metric: {
    client_id: string;
    date: string;
    email_revenue: number;
    sms_revenue: number;
    total_revenue: number;
    email_orders: number;
    sms_orders: number;
    total_orders: number;
    email_percentage: number;
    sms_percentage: number;
    // Flow LUXE attribution fields
    flow_email_revenue?: number;
    flow_sms_revenue?: number;
    campaign_email_revenue?: number;
    campaign_sms_revenue?: number;
    flow_percentage?: number;
    campaign_percentage?: number;
  }): Promise<void> {
    const { error } = await supabaseAdmin
      .from('revenue_attribution_metrics')
      .upsert(metric, {
        onConflict: 'client_id,date',
        ignoreDuplicates: false
      })

    if (error) {
      console.error('Error upserting revenue attribution metric:', error)
      throw error
    }
  }

  static async getRevenueAttributionMetrics(clientId: string, days: number = 30): Promise<any[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabaseAdmin
      .from('revenue_attribution_metrics')
      .select('*')
      .eq('client_id', clientId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching revenue attribution metrics:', error)
      return []
    }

    return data || []
  }

  static async getRevenueAttributionSummary(clientId: string, days: number = 30): Promise<{
    total_email_revenue: number;
    total_sms_revenue: number;
    total_revenue: number;
    total_email_orders: number;
    total_sms_orders: number;
    total_orders: number;
    avg_email_percentage: number;
    avg_sms_percentage: number;
    days_with_data: number;
  }> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabaseAdmin
      .from('revenue_attribution_metrics')
      .select('*')
      .eq('client_id', clientId)
      .gte('date', startDate.toISOString().split('T')[0])

    if (error) {
      console.error('Error fetching revenue attribution summary:', error)
      return {
        total_email_revenue: 0,
        total_sms_revenue: 0,
        total_revenue: 0,
        total_email_orders: 0,
        total_sms_orders: 0,
        total_orders: 0,
        avg_email_percentage: 0,
        avg_sms_percentage: 0,
        days_with_data: 0
      }
    }

    const metrics = data || []
    
    if (metrics.length === 0) {
      return {
        total_email_revenue: 0,
        total_sms_revenue: 0,
        total_revenue: 0,
        total_email_orders: 0,
        total_sms_orders: 0,
        total_orders: 0,
        avg_email_percentage: 0,
        avg_sms_percentage: 0,
        days_with_data: 0
      }
    }

    const totals = metrics.reduce((acc: any, metric: any) => ({
      email_revenue: acc.email_revenue + Number(metric.email_revenue || 0),
      sms_revenue: acc.sms_revenue + Number(metric.sms_revenue || 0),
      total_revenue: acc.total_revenue + Number(metric.total_revenue || 0),
      email_orders: acc.email_orders + Number(metric.email_orders || 0),
      sms_orders: acc.sms_orders + Number(metric.sms_orders || 0),
      total_orders: acc.total_orders + Number(metric.total_orders || 0),
      email_percentage_sum: acc.email_percentage_sum + Number(metric.email_percentage || 0),
      sms_percentage_sum: acc.sms_percentage_sum + Number(metric.sms_percentage || 0)
    }), {
      email_revenue: 0,
      sms_revenue: 0,
      total_revenue: 0,
      email_orders: 0,
      sms_orders: 0,
      total_orders: 0,
      email_percentage_sum: 0,
      sms_percentage_sum: 0
    })

    return {
      total_email_revenue: totals.email_revenue,
      total_sms_revenue: totals.sms_revenue,
      total_revenue: totals.total_revenue,
      total_email_orders: totals.email_orders,
      total_sms_orders: totals.sms_orders,
      total_orders: totals.total_orders,
      avg_email_percentage: metrics.length > 0 ? totals.email_percentage_sum / metrics.length : 0,
      avg_sms_percentage: metrics.length > 0 ? totals.sms_percentage_sum / metrics.length : 0,
      days_with_data: metrics.length
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
    console.log(`🏆 DATABASE: Getting top ${limit} flows by ${metric}`)
    
    // Get all flows using the same aggregation logic as getRecentFlowMetrics
    const allFlows = await this.getRecentFlowMetrics(clientId, 365) // Use 1 year to get all data
    
    if (!allFlows || allFlows.length === 0) {
      console.log('🏆 DATABASE: No flows found for top flows ranking')
      return []
    }
    
    // Sort by the requested metric and return top results
    const sortedFlows = allFlows.sort((a: any, b: any) => {
      const aValue = a[metric] || 0
      const bValue = b[metric] || 0
      return bValue - aValue
    }).slice(0, limit)
    
    console.log(`🏆 DATABASE: Returning top ${sortedFlows.length} flows by ${metric}:`, 
      sortedFlows.map((f: any) => ({ name: f.flow_name, value: f[metric] })))
    
    return sortedFlows
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

  // Flow Email Methods
  static async getFlowEmails(clientId: string, flowId: string, days: number = 30): Promise<any[]> {
    console.log(`📧 DATABASE: Getting flow emails for flow ${flowId}, ${days} days`)
    
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const { data, error } = await supabaseAdmin
      .from('flow_message_metrics')
      .select('*')
      .eq('client_id', clientId)
      .eq('flow_id', flowId)
      .gte('week_date', cutoffDate.toISOString().split('T')[0])
      .order('week_date', { ascending: false })

    if (error) {
      console.error('Error fetching flow emails:', error)
      return []
    }

    if (!data || data.length === 0) {
      console.log('📧 DATABASE: No flow emails found, checking for any data...')
      
      // Check if there's any data for this flow at all
      const { data: allData } = await supabaseAdmin
        .from('flow_message_metrics')
        .select('message_id, message_name, subject_line, opens, clicks, revenue')
        .eq('client_id', clientId)
        .eq('flow_id', flowId)
        .limit(5)
      
      console.log('📧 DATABASE: Sample flow emails data:', allData)
      return []
    }

    // Group by message and aggregate weekly data
    const emailAggregates: { [messageId: string]: any } = {}
    
    data.forEach((record: any) => {
      const messageId = record.message_id
      
      if (!emailAggregates[messageId]) {
        emailAggregates[messageId] = {
          message_id: messageId,
          message_name: record.message_name || 'Untitled Email',
          subject_line: record.subject_line || 'No subject',
          preview_text: record.preview_text,
          from_email: record.from_email,
          opens: 0,
          opens_unique: 0,
          clicks: 0,
          clicks_unique: 0,
          revenue: 0,
          conversions: 0,
          recipients: 0,
          delivered: 0,
          bounced: 0,
          unsubscribes: 0,
          open_rate: 0,
          click_rate: 0,
          conversion_rate: 0,
          revenue_per_recipient: 0,
          weekly_records: 0
        }
      }
      
      const agg = emailAggregates[messageId]
      agg.opens += parseInt(record.opens) || 0
      agg.opens_unique += parseInt(record.opens_unique) || 0
      agg.clicks += parseInt(record.clicks) || 0
      agg.clicks_unique += parseInt(record.clicks_unique) || 0
      agg.conversions += parseInt(record.conversions) || 0
      agg.recipients += parseInt(record.recipients) || 0
      agg.delivered += parseInt(record.delivered) || 0
      agg.bounced += parseInt(record.bounced) || 0
      agg.unsubscribes += parseInt(record.unsubscribes) || 0
      
      const revenueValue = parseFloat(record.conversion_value || record.revenue || 0)
      agg.revenue += revenueValue
      agg.weekly_records++
    })
    
    // Calculate rates
    Object.values(emailAggregates).forEach((email: any) => {
      if (email.recipients > 0) {
        email.open_rate = email.opens / email.recipients
        email.click_rate = email.clicks / email.recipients
        email.conversion_rate = email.conversions / email.recipients
        email.revenue_per_recipient = email.revenue / email.recipients
      }
      
      // Clean up temporary field
      delete email.weekly_records
    })

    const emails = Object.values(emailAggregates)
    console.log(`📧 DATABASE: Aggregated ${emails.length} unique emails from ${data.length} weekly records`)
    
    return emails
  }

  // ===== LIST GROWTH METRICS METHODS =====

  static async upsertListGrowthMetric(metric: Omit<any, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabaseAdmin
      .from('list_growth_metrics')
      .upsert(metric, {
        onConflict: 'client_id,date_recorded,interval_type'
      })

    if (error) {
      console.error('Error upserting list growth metric:', error)
      throw error
    }
  }

  static async getListGrowthMetrics(clientId: string, days: number = 30): Promise<any[]> {
    console.log(`📈 DATABASE: Getting list growth metrics for CLIENT_ID: ${clientId}, ${days} days`)
    
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const { data, error } = await supabaseAdmin
      .from('list_growth_metrics')
      .select('*')
      .eq('client_id', clientId)
      .gte('date_recorded', cutoffDate.toISOString().split('T')[0])
      .order('date_recorded', { ascending: false })

    if (error) {
      console.error('Error fetching list growth metrics:', error)
      throw error
    }

    console.log(`📈 DATABASE: Found ${data?.length || 0} list growth data points`)
    return data || []
  }

  static async getListGrowthTrends(clientId: string, days: number = 90): Promise<any[]> {
    console.log(`📊 DATABASE: Getting list growth trends for CLIENT_ID: ${clientId}, ${days} days`)
    
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const { data, error } = await supabaseAdmin
      .from('list_growth_metrics')
      .select(`
        date_recorded,
        email_subscriptions,
        email_unsubscribes, 
        email_net_growth,
        sms_subscriptions,
        sms_unsubscribes,
        sms_net_growth,
        form_submissions,
        total_new_subscriptions,
        total_unsubscriptions,
        overall_net_growth,
        growth_rate,
        churn_rate
      `)
      .eq('client_id', clientId)
      .gte('date_recorded', cutoffDate.toISOString().split('T')[0])
      .order('date_recorded', { ascending: true }) // Ascending for trend charts

    if (error) {
      console.error('Error fetching list growth trends:', error)
      throw error
    }

    console.log(`📊 DATABASE: Found ${data?.length || 0} list growth trend points`)
    return data || []
  }

  static async getListGrowthSummary(clientId: string, days: number = 30): Promise<any> {
    console.log(`📋 DATABASE: Getting list growth summary for CLIENT_ID: ${clientId}, ${days} days`)
    
    const trends = await this.getListGrowthTrends(clientId, days)
    
    if (!trends || trends.length === 0) {
      return {
        total_email_subscriptions: 0,
        total_email_unsubscribes: 0,
        total_sms_subscriptions: 0, 
        total_form_submissions: 0,
        net_growth: 0,
        average_growth_rate: 0,
        average_churn_rate: 0
      }
    }

    // Calculate totals from trends
    const totals = trends.reduce((acc, trend) => ({
      total_email_subscriptions: acc.total_email_subscriptions + (trend.email_subscriptions || 0),
      total_email_unsubscribes: acc.total_email_unsubscribes + (trend.email_unsubscribes || 0),
      total_sms_subscriptions: acc.total_sms_subscriptions + (trend.sms_subscriptions || 0),
      total_form_submissions: acc.total_form_submissions + (trend.form_submissions || 0),
      net_growth: acc.net_growth + (trend.overall_net_growth || 0),
      growth_rate_sum: acc.growth_rate_sum + (trend.growth_rate || 0),
      churn_rate_sum: acc.churn_rate_sum + (trend.churn_rate || 0)
    }), {
      total_email_subscriptions: 0,
      total_email_unsubscribes: 0,
      total_sms_subscriptions: 0,
      total_form_submissions: 0,
      net_growth: 0,
      growth_rate_sum: 0,
      churn_rate_sum: 0
    })

    return {
      ...totals,
      average_growth_rate: totals.growth_rate_sum / trends.length,
      average_churn_rate: totals.churn_rate_sum / trends.length,
      data_points: trends.length,
      date_range: {
        start: trends[0]?.date_recorded,
        end: trends[trends.length - 1]?.date_recorded
      }
    }
  }
}
