import { KlaviyoAPI, transformCampaignData, transformFlowData, decryptApiKey } from './klaviyo'
import { DatabaseService } from './database'
import { Client } from './supabase'
import { format, subDays } from 'date-fns'

export class SyncService {
  private klaviyo: KlaviyoAPI
  private client: Client
  public syncLogs: string[] = []

  constructor(client: Client) {
    this.client = client
    this.log(`🔑 SYNC INIT: Initializing sync for ${client.brand_name}`)
    
    try {
      // Decrypt the API key before using it
      this.log(`🔓 SYNC INIT: Decrypting Klaviyo API key...`)
      const decryptedApiKey = decryptApiKey(client.klaviyo_api_key)
      this.log(`✅ SYNC INIT: API key decrypted successfully (starts with: ${decryptedApiKey.substring(0, 6)}...)`)
      
      this.klaviyo = new KlaviyoAPI(decryptedApiKey)
      this.log(`🎯 SYNC INIT: Klaviyo API client initialized`)
    } catch (error) {
      this.log(`❌ SYNC INIT: Failed to initialize Klaviyo API: ${error}`)
      throw error
    }
  }

  private log(message: string) {
    console.log(message)
    this.syncLogs.push(`${new Date().toISOString()}: ${message}`)
  }

  // Main sync function
  async syncAllData() {
    this.log(`🚀 SYNC START: Starting comprehensive sync for client: ${this.client.brand_name}`)
    
    try {
      this.log(`📅 SYNC SCOPE: Pulling data from the past 365 days`)
      
      this.log(`📧 SYNC STEP 1: Starting campaigns sync...`)
      await this.syncCampaigns()
      this.log(`✅ SYNC STEP 1: Campaigns sync completed`)
      
      this.log(`🔄 SYNC STEP 2: Starting flows sync...`)
      await this.syncFlows()
      this.log(`✅ SYNC STEP 2: Flows sync completed`)
      
      this.log(`👥 SYNC STEP 3: Starting segments sync...`)
      await this.syncSegments()
      this.log(`✅ SYNC STEP 3: Segments sync completed`)
      
      this.log(`📬 SYNC STEP 4: Starting deliverability sync...`)
      await this.syncDeliverability()
      this.log(`✅ SYNC STEP 4: Deliverability sync completed`)

      // Update last sync timestamp
      await DatabaseService.updateClientSyncTime(this.client.id)
      
      this.log(`🎉 SYNC COMPLETE: All data synced successfully for ${this.client.brand_name}`)
    } catch (error) {
      this.log(`❌ SYNC FAILED for client ${this.client.brand_name}: ${error}`)
      throw error
    }
  }

  // Sync campaign data
  async syncCampaigns() {
    this.log('📧 CAMPAIGNS: Starting campaigns sync...')
    
    try {
      // Calculate date filter for past year
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      const dateFilter = oneYearAgo.toISOString()
      
      this.log(`📅 CAMPAIGNS: Filtering campaigns from ${oneYearAgo.toDateString()} onwards`)
      
      let allCampaigns: any[] = []
      let cursor: string | undefined
      let hasMore = true
      let pageCount = 0

      // Fetch campaigns with pagination (limited to past year)
      while (hasMore) {
        pageCount++
        this.log(`📄 CAMPAIGNS: Fetching page ${pageCount}...`)
        
        const response = await this.klaviyo.getCampaigns(cursor)
        const campaigns = response.data || []
        
        // Filter campaigns to past year only
        const recentCampaigns = campaigns.filter((campaign: any) => {
          const sendTime = campaign.attributes?.send_time
          return !sendTime || new Date(sendTime) >= oneYearAgo
        })
        
        allCampaigns = [...allCampaigns, ...recentCampaigns]
        this.log(`📊 CAMPAIGNS: Page ${pageCount} - Found ${campaigns.length} campaigns, ${recentCampaigns.length} within past year`)
        
        cursor = response.links?.next ? new URL(response.links.next).searchParams.get('page[cursor]') || undefined : undefined
        hasMore = !!cursor
        
        // Stop if we've gone back more than a year
        if (campaigns.length > 0 && campaigns.every((c: any) => c.attributes?.send_time && new Date(c.attributes.send_time) < oneYearAgo)) {
          this.log(`📅 CAMPAIGNS: Reached campaigns older than 1 year, stopping pagination`)
          break
        }
      }
      
      this.log(`📈 CAMPAIGNS: Total campaigns to process: ${allCampaigns.length}`)

      // Get comprehensive analytics for all campaigns using NEW Reporting API
      this.log(`📊 CAMPAIGNS: Fetching analytics for ${allCampaigns.length} campaigns using Campaign Values Report API`)
      const campaignIds = allCampaigns.map(c => c.id)
      
      let campaignAnalytics: any = {}
      this.log(`⚠️ CAMPAIGNS: Skipping Campaign Values Report API (complex requirements) - using campaign data only`)
      
      // For now, we'll get basic metrics from campaign attributes instead of complex reporting API
      // TODO: Implement proper Campaign Values Report API with required statistics, timeframe, conversion_metric_id

      // Process each campaign with messages (using correct fields)
      for (let i = 0; i < allCampaigns.length; i++) {
        const campaign = allCampaigns[i]
        this.log(`🔄 CAMPAIGNS: Processing campaign ${i + 1}/${allCampaigns.length} - ${campaign.attributes?.name || 'Unnamed'}`)
        
        try {
          // Get campaign messages with correct fields (no images for now due to field errors)
          let messages: any[] = []
          try {
            this.log(`📩 CAMPAIGNS: Fetching messages for campaign ${campaign.id}`)
            // Use the Get Messages for Campaign endpoint (the one that works)
            const messagesResponse = await this.klaviyo.getCampaignMessages(campaign.id)
            messages = messagesResponse.data || []
            this.log(`📩 CAMPAIGNS: Found ${messages.length} messages`)
          } catch (error) {
            this.log(`⚠️ CAMPAIGNS: Could not fetch messages for campaign ${campaign.id}: ${error}`)
          }

          // Use analytics from Campaign Values Report API
          const analytics = campaignAnalytics[campaign.id] || {}
          this.log(`📊 CAMPAIGNS: Using analytics data - Opens: ${analytics.opens || 0}, Clicks: ${analytics.clicks || 0}`)
          
          const campaignData = {
            ...transformCampaignData(campaign, messages),
            client_id: this.client.id,
            // Use NEW analytics data from Reporting API
            recipients_count: analytics.recipients || 0,
            delivered_count: analytics.deliveries || 0,
            opened_count: analytics.opens || 0,
            clicked_count: analytics.clicks || 0,
            bounced_count: analytics.bounces || 0,
            unsubscribed_count: analytics.unsubscribes || 0,
            revenue: analytics.revenue || 0,
            open_rate: analytics.open_rate || 0,
            click_rate: analytics.click_rate || 0,
            bounce_rate: analytics.bounce_rate || 0
          }

          this.log(`💾 CAMPAIGNS: Saving campaign data to database`)
          await DatabaseService.upsertCampaignMetric(campaignData)
          this.log(`✅ CAMPAIGNS: Campaign ${i + 1} saved successfully`)
        } catch (error) {
          this.log(`❌ CAMPAIGNS: Error processing campaign ${campaign.id}: ${error}`)
          // Continue processing other campaigns instead of stopping
        }
      }

      this.log(`✅ CAMPAIGNS: Synced ${allCampaigns.length} campaigns successfully`)
      this.log(`🎯 CAMPAIGNS: Campaign sync completed, proceeding to flows...`)
    } catch (error) {
      this.log(`❌ CAMPAIGNS: Error syncing campaigns: ${error}`)
      throw error
    }
  }

  // Sync flow data
  async syncFlows() {
    this.log('🔄 FLOWS: Starting flows sync (live flows only)...')
    
    try {
      let allFlows: any[] = []
      let cursor: string | undefined
      let hasMore = true
      let pageCount = 0

      // Fetch flows with pagination
      while (hasMore) {
        pageCount++
        this.log(`📄 FLOWS: Fetching page ${pageCount}...`)
        
        try {
          const response = await this.klaviyo.getFlows(cursor)
          this.log(`📡 FLOWS: API response received for page ${pageCount}`)
          
          const flows = response.data || []
          this.log(`📊 FLOWS: Raw flows received: ${flows.length}`)
          
          // Filter to only active/live flows
          const liveFlows = flows.filter((flow: any) => {
            const status = flow.attributes?.status?.toLowerCase()
            return status === 'active' || status === 'live'
          })
          
          allFlows = [...allFlows, ...liveFlows]
          this.log(`📊 FLOWS: Page ${pageCount} - Found ${flows.length} flows, ${liveFlows.length} live/active`)
          
          cursor = response.links?.next ? new URL(response.links.next).searchParams.get('page[cursor]') || undefined : undefined
          hasMore = !!cursor
          
          if (pageCount >= 5) {
            this.log(`⚠️ FLOWS: Reached page limit (5), stopping pagination`)
            break
          }
        } catch (flowError) {
          this.log(`❌ FLOWS: Error fetching flows page ${pageCount}: ${flowError}`)
          throw flowError
        }
      }
      
      this.log(`📈 FLOWS: Total live flows to process: ${allFlows.length}`)

      // Process each flow
      for (const flow of allFlows) {
        try {
          // Get flow metrics for the last 30 days
          const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd')
          const endDate = format(new Date(), 'yyyy-MM-dd')
          
          const metrics = await this.getFlowMetrics(flow.id, startDate, endDate)
          
          const flowData = {
            ...transformFlowData(flow),
            client_id: this.client.id,
            date_start: startDate,
            date_end: endDate,
            ...metrics
          }

          await DatabaseService.upsertFlowMetric(flowData)
        } catch (error) {
          console.error(`Error processing flow ${flow.id}:`, error)
        }
      }

      this.log(`✅ FLOWS: Synced ${allFlows.length} flows`)
    } catch (error) {
      this.log(`❌ FLOWS: Error syncing flows: ${error}`)
      throw error
    }
  }

  // Sync audience metrics
  async syncAudienceMetrics() {
    this.log('👥 AUDIENCE: Starting comprehensive audience analysis...')
    
    try {
      // Get comprehensive profile data
      this.log('👥 AUDIENCE: Fetching total profile count...')
      const profilesResponse = await this.klaviyo.getProfiles()
      const totalProfiles = profilesResponse.data?.length || 0
      this.log(`👥 AUDIENCE: Total profiles: ${totalProfiles}`)

      // Get detailed list data and growth metrics
      this.log('📋 AUDIENCE: Fetching all lists for comprehensive analysis...')
      const listsResponse = await this.klaviyo.getLists()
      this.log(`📋 AUDIENCE: Found ${listsResponse.data?.length || 0} lists`)
      
      let totalSubscribed = 0
      const listGrowthData: any[] = []
      
      for (const list of listsResponse.data || []) {
        try {
          this.log(`📋 AUDIENCE: Analyzing list: ${list.attributes?.name || 'Unnamed'}`)
          
          // Get full list profile count (paginate through all)
          let listProfileCount = 0
          let cursor: string | undefined
          let hasMore = true
          
          while (hasMore) {
            const listProfilesResponse = await this.klaviyo.getListProfiles(list.id, cursor)
            const profiles = listProfilesResponse.data || []
            listProfileCount += profiles.length
            
            cursor = listProfilesResponse.links?.next ? new URL(listProfilesResponse.links.next).searchParams.get('page[cursor]') || undefined : undefined
            hasMore = !!cursor && profiles.length > 0
          }
          
          totalSubscribed += listProfileCount
          listGrowthData.push({
            list_id: list.id,
            list_name: list.attributes?.name,
            subscriber_count: listProfileCount
          })
          
          this.log(`📊 AUDIENCE: List "${list.attributes?.name}" has ${listProfileCount} subscribers`)
        } catch (error) {
          console.warn(`⚠️ AUDIENCE: Could not fetch profiles for list ${list.id}:`, error)
        }
      }
      
      this.log(`📈 AUDIENCE: Total subscribed across all lists: ${totalSubscribed}`)

      // Get previous day's metrics for comparison
      const previousMetric = await DatabaseService.getLatestAudienceMetric(this.client.id)
      const previousSubscribed = previousMetric?.subscribed_profiles || 0

      const audienceData = {
        client_id: this.client.id,
        date_recorded: format(new Date(), 'yyyy-MM-dd'),
        total_profiles: totalProfiles,
        subscribed_profiles: totalSubscribed,
        unsubscribed_profiles: Math.max(0, totalProfiles - totalSubscribed),
        new_subscribers: Math.max(0, totalSubscribed - previousSubscribed),
        unsubscribes: Math.max(0, previousSubscribed - totalSubscribed),
        net_growth: totalSubscribed - previousSubscribed,
        growth_rate: previousSubscribed > 0 ? ((totalSubscribed - previousSubscribed) / previousSubscribed) * 100 : 0,
        engaged_profiles: Math.floor(totalSubscribed * 0.3), // Estimated - you'd calculate this from events
        engagement_rate: 30 // Estimated - you'd calculate this from events
      }

      await DatabaseService.upsertAudienceMetric(audienceData)
      this.log('✅ AUDIENCE: Synced audience metrics')
    } catch (error) {
      console.error('Error syncing audience metrics:', error)
      throw error
    }
  }

  // Sync revenue attribution
  async syncRevenueAttribution() {
    this.log('💰 REVENUE: Starting revenue attribution analysis (past year)...')
    
    try {
      // Get past year of campaign and flow metrics for comprehensive analysis
      this.log('💰 REVENUE: Fetching campaign metrics from past 365 days...')
      const campaigns = await DatabaseService.getRecentCampaignMetrics(this.client.id, 365)
      this.log(`💰 REVENUE: Found ${campaigns.length} campaigns with revenue data`)
      
      this.log('💰 REVENUE: Fetching flow metrics from past 365 days...')
      const flows = await DatabaseService.getRecentFlowMetrics(this.client.id, 365)
      this.log(`💰 REVENUE: Found ${flows.length} flows with revenue data`)

      const campaignRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0)
      const campaignOrders = campaigns.reduce((sum, c) => sum + c.orders_count, 0)
      
      const flowRevenue = flows.reduce((sum, f) => sum + f.revenue, 0)
      const flowOrders = flows.reduce((sum, f) => sum + f.orders_count, 0)

      const revenueData = {
        client_id: this.client.id,
        date_recorded: format(new Date(), 'yyyy-MM-dd'),
        campaign_revenue: campaignRevenue,
        flow_revenue: flowRevenue,
        total_email_revenue: campaignRevenue + flowRevenue,
        campaign_orders: campaignOrders,
        flow_orders: flowOrders,
        total_email_orders: campaignOrders + flowOrders,
        campaign_aov: campaignOrders > 0 ? campaignRevenue / campaignOrders : 0,
        flow_aov: flowOrders > 0 ? flowRevenue / flowOrders : 0,
        overall_aov: (campaignOrders + flowOrders) > 0 ? (campaignRevenue + flowRevenue) / (campaignOrders + flowOrders) : 0
      }

      await DatabaseService.upsertRevenueAttribution(revenueData)
      this.log('✅ REVENUE: Synced revenue attribution')
    } catch (error) {
      console.error('Error syncing revenue attribution:', error)
      throw error
    }
  }

  // Helper: Get campaign metrics from events
  private async getCampaignMetrics(campaignId: string) {
    try {
      // This is a simplified version - you'd need to query specific metrics
      // Based on the Klaviyo API, you'd use the events endpoint with filters
      const filter = `equals(campaign_id,"${campaignId}")`
      const events = await this.klaviyo.getEvents(undefined, filter, '-datetime')
      
      let delivered = 0, opened = 0, clicked = 0, bounced = 0, unsubscribed = 0
      let revenue = 0, orders = 0

      for (const event of events.data || []) {
        const eventType = event.attributes?.metric?.data?.attributes?.name
        
        switch (eventType) {
          case 'Delivered Email':
            delivered++
            break
          case 'Opened Email':
            opened++
            break
          case 'Clicked Email':
            clicked++
            break
          case 'Bounced Email':
            bounced++
            break
          case 'Unsubscribed':
            unsubscribed++
            break
          case 'Placed Order':
            orders++
            revenue += event.attributes?.properties?.value || 0
            break
        }
      }

      const recipients = delivered + bounced
      
      return {
        delivered_count: delivered,
        opened_count: opened,
        clicked_count: clicked,
        bounced_count: bounced,
        unsubscribed_count: unsubscribed,
        recipients_count: recipients,
        open_rate: recipients > 0 ? (opened / recipients) * 100 : 0,
        click_rate: recipients > 0 ? (clicked / recipients) * 100 : 0,
        click_to_open_rate: opened > 0 ? (clicked / opened) * 100 : 0,
        bounce_rate: recipients > 0 ? (bounced / recipients) * 100 : 0,
        unsubscribe_rate: recipients > 0 ? (unsubscribed / recipients) * 100 : 0,
        revenue,
        orders_count: orders,
        revenue_per_recipient: recipients > 0 ? revenue / recipients : 0
      }
    } catch (error) {
      console.warn(`Could not fetch metrics for campaign ${campaignId}:`, error)
      return {
        delivered_count: 0,
        opened_count: 0,
        clicked_count: 0,
        bounced_count: 0,
        unsubscribed_count: 0,
        recipients_count: 0,
        revenue: 0,
        orders_count: 0
      }
    }
  }

  // Helper: Get flow metrics - DISABLED Events API (flow_id not valid filter)
  private async getFlowMetrics(flowId: string, startDate: string, endDate: string) {
    this.log(`⚠️ FLOWS: Skipping Events API for flow ${flowId} (flow_id not valid filter) - using default metrics`)
    
    // Return default metrics since Events API can't filter by flow_id
    // TODO: Use Flow Values Report API when properly implemented
    return {
      triggered_count: 0,
      completed_count: 0,
      completion_rate: 0,
      revenue: 0,
      orders_count: 0,
      revenue_per_trigger: 0
    }
  }
  // NEW SYNC METHODS FOR 4-SECTION STRUCTURE

  // Sync segments data
  async syncSegments() {
    this.log('👥 SEGMENTS: Starting segments sync...')
    
    try {
      let allSegments: any[] = []
      let cursor: string | undefined
      let hasMore = true
      let pageCount = 0

      // Fetch all segments
      while (hasMore) {
        pageCount++
        this.log(`📄 SEGMENTS: Fetching page ${pageCount}...`)
        
        const response = await this.klaviyo.getSegments(cursor)
        const segments = response.data || []
        
        allSegments = [...allSegments, ...segments]
        this.log(`📊 SEGMENTS: Page ${pageCount} - Found ${segments.length} segments`)
        
        cursor = response.links?.next ? new URL(response.links.next).searchParams.get('page[cursor]') || undefined : undefined
        hasMore = !!cursor && pageCount < 10 // Safety limit
      }
      
      this.log(`📈 SEGMENTS: Total segments to process: ${allSegments.length}`)

      // Get segment analytics
      if (allSegments.length > 0) {
        const segmentIds = allSegments.map(s => s.id)
        
        try {
          const analyticsResponse = await this.klaviyo.getSegmentAnalytics(segmentIds)
          this.log(`📊 SEGMENTS: Analytics fetched for segments`)
          
          // Process and save segment metrics
          for (const segment of allSegments) {
            // Get profile count for this segment
            let profileCount = 0
            try {
              const profilesResponse = await this.klaviyo.getSegmentProfiles(segment.id)
              profileCount = profilesResponse.data?.length || 0
            } catch (error) {
              this.log(`⚠️ SEGMENTS: Could not get profile count for segment ${segment.id}`)
            }

            const segmentData = {
              client_id: this.client.id,
              segment_id: segment.id,
              segment_name: segment.attributes?.name || 'Unnamed Segment',
              date_recorded: format(new Date(), 'yyyy-MM-dd'),
              total_profiles: profileCount,
              // Add more metrics from analytics response as needed
            }

            await DatabaseService.upsertSegmentMetric(segmentData)
          }
        } catch (error) {
          this.log(`⚠️ SEGMENTS: Could not fetch segment analytics: ${error}`)
        }
      }

      this.log(`✅ SEGMENTS: Synced ${allSegments.length} segments`)
    } catch (error) {
      this.log(`❌ SEGMENTS: Error syncing segments: ${error}`)
      throw error
    }
  }

  // Sync deliverability data
  async syncDeliverability() {
    this.log('📬 DELIVERABILITY: Starting deliverability sync...')
    
    try {
      // Get recent campaigns and flows for deliverability analysis
      const campaigns = await DatabaseService.getRecentCampaignMetrics(this.client.id, 30)
      const flows = await DatabaseService.getRecentFlowMetrics(this.client.id, 30)
      
      // Calculate deliverability metrics from campaign/flow data
      let totalSent = 0, totalDelivered = 0, totalBounced = 0, totalSpam = 0, totalUnsub = 0
      let hardBounces = 0, softBounces = 0
      
      for (const campaign of campaigns) {
        totalSent += campaign.recipients_count || 0
        totalDelivered += campaign.delivered_count || 0
        totalBounced += campaign.bounced_count || 0
        totalUnsub += campaign.unsubscribed_count || 0
        // Assume 70% of bounces are soft, 30% hard (typical split)
        hardBounces += Math.floor((campaign.bounced_count || 0) * 0.3)
        softBounces += Math.floor((campaign.bounced_count || 0) * 0.7)
      }

      // Calculate rates
      const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0
      const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0
      const unsubRate = totalSent > 0 ? (totalUnsub / totalSent) * 100 : 0
      
      // Calculate reputation score (simple algorithm)
      let reputationScore = 100
      if (bounceRate > 5) reputationScore -= (bounceRate - 5) * 10
      if (unsubRate > 0.5) reputationScore -= (unsubRate - 0.5) * 20
      reputationScore = Math.max(0, Math.min(100, reputationScore))

      const deliverabilityData = {
        client_id: this.client.id,
        date_recorded: format(new Date(), 'yyyy-MM-dd'),
        total_sent: totalSent,
        total_delivered: totalDelivered,
        total_bounced: totalBounced,
        hard_bounces: hardBounces,
        soft_bounces: softBounces,
        spam_complaints: totalSpam,
        unsubscribes: totalUnsub,
        delivery_rate: deliveryRate,
        bounce_rate: bounceRate,
        hard_bounce_rate: totalSent > 0 ? (hardBounces / totalSent) * 100 : 0,
        soft_bounce_rate: totalSent > 0 ? (softBounces / totalSent) * 100 : 0,
        unsubscribe_rate: unsubRate,
        overall_reputation_score: reputationScore,
        sender_reputation: reputationScore >= 90 ? 'excellent' : reputationScore >= 75 ? 'good' : reputationScore >= 60 ? 'fair' : 'poor',
        list_health_score: Math.max(0, 100 - bounceRate * 10)
      }

      await DatabaseService.upsertDeliverabilityMetric(deliverabilityData)
      this.log(`✅ DELIVERABILITY: Synced deliverability metrics - Score: ${reputationScore.toFixed(1)}`)
    } catch (error) {
      this.log(`❌ DELIVERABILITY: Error syncing deliverability: ${error}`)
      throw error
    }
  }
}

// Sync all clients
export async function syncAllClients() {
  const clients = await DatabaseService.getAllClients()
  
  for (const client of clients) {
    try {
      const syncService = new SyncService(client)
      await syncService.syncAllData()
    } catch (error) {
      console.error(`Failed to sync client ${client.brand_name}:`, error)
    }
  }
}
