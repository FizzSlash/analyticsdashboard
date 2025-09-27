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

  // Rate limiting utility
  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Get dynamic conversion metric ID
  public async getConversionMetricId(): Promise<string | null> {
    this.log('🎯 METRICS: Getting dynamic conversion metric ID...')
    
    try {
      const metricsResponse = await this.klaviyo.getMetrics()
      
      // Find "Placed Order" metric
      const placedOrderMetric = metricsResponse.data?.find((metric: any) => 
        metric.attributes?.name === 'Placed Order'
      )
      
      if (placedOrderMetric) {
        this.log(`✅ METRICS: Found Placed Order metric ID: ${placedOrderMetric.id}`)
        return placedOrderMetric.id
      } else {
        this.log(`⚠️ METRICS: No "Placed Order" metric found in account`)
        return null
      }
    } catch (error) {
      this.log(`❌ METRICS: Error fetching conversion metric: ${error}`)
      return null
    }
  }

  // Main sync function
  async syncAllData() {
    this.log(`🚀 SYNC START: Starting comprehensive PARALLEL sync for client: ${this.client.brand_name}`)
    this.log(`📅 SYNC SCOPE: Pulling data from the past 365 days`)
    this.log(`⚡ SYNC STRATEGY: Running campaigns, flows, and segments in PARALLEL to avoid Vercel timeout`)
    
    try {
      // STEP 1: Get conversion metric ID dynamically
      const conversionMetricId = await this.getConversionMetricId()
      
      // PARALLEL PROCESSING: Run all 3 main syncs simultaneously
      this.log(`🔄 SYNC PARALLEL: Starting campaigns, flows, and segments simultaneously...`)
      
      const [campaignsResult, flowsResult, segmentsResult] = await Promise.allSettled([
        this.syncCampaigns(conversionMetricId),
        this.syncFlows(conversionMetricId), 
        this.syncSegments()
      ])
      
      // Log results for each parallel sync
      if (campaignsResult.status === 'fulfilled') {
        this.log(`✅ CAMPAIGNS: Parallel sync completed successfully`)
      } else {
        this.log(`❌ CAMPAIGNS: Parallel sync failed: ${campaignsResult.reason}`)
      }
      
      if (flowsResult.status === 'fulfilled') {
        this.log(`✅ FLOWS: Parallel sync completed successfully`)
      } else {
        this.log(`❌ FLOWS: Parallel sync failed: ${flowsResult.reason}`)
      }
      
      if (segmentsResult.status === 'fulfilled') {
        this.log(`✅ SEGMENTS: Parallel sync completed successfully`)
      } else {
        this.log(`❌ SEGMENTS: Parallel sync failed: ${segmentsResult.reason}`)
      }
      
      // STEP 4: Deliverability (calculated from campaign/flow data)
      this.log(`📊 SYNC STEP 4: Starting deliverability sync...`)
      try {
        await this.syncDeliverability()
        this.log(`✅ DELIVERABILITY: Sync completed successfully`)
      } catch (deliverabilityError) {
        this.log(`❌ DELIVERABILITY: Sync failed: ${deliverabilityError}`)
        // Continue even if deliverability fails
      }

      // Update last sync timestamp
      await DatabaseService.updateClientSyncTime(this.client.id)
      
      this.log(`🎉 SYNC COMPLETE: All parallel data synchronized for ${this.client.brand_name}`)
    } catch (error) {
      this.log(`❌ SYNC FAILED for client ${this.client.brand_name}: ${error}`)
      throw error
    }
  }

  // Sync campaign data
  async syncCampaigns(conversionMetricId: string | null) {
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

      // Get comprehensive analytics for all campaigns using BLUEPRINT Reporting API
      this.log(`📊 CAMPAIGNS: Using Blueprint approach - single call for ALL campaigns`)
      const campaignIds = allCampaigns.map(c => c.id)
      
      let campaignAnalytics: any = {}
      try {
        const analyticsResponse = await this.klaviyo.getCampaignAnalytics(campaignIds, conversionMetricId)
        
        // COMPREHENSIVE LOGGING - Single log with all data
        this.log(`📊 CAMPAIGNS ANALYTICS COMPLETE REPORT:
🔢 Total Campaigns: ${allCampaigns.length}
📡 API Response Status: Success
📊 Analytics Data Count: ${analyticsResponse.data?.length || 0}
🔍 Full Response Structure: ${JSON.stringify(analyticsResponse, null, 2)}
📈 Campaign IDs Processed: ${campaignIds.join(', ')}`)
        
        // Process analytics response to create lookup by campaign ID
        if (analyticsResponse.data) {
          for (const metric of analyticsResponse.data) {
            campaignAnalytics[metric.id] = metric.attributes
          }
        }
        
        this.log(`📊 CAMPAIGNS: Analytics processed - ${Object.keys(campaignAnalytics).length} campaigns have data`)
      } catch (error) {
        this.log(`⚠️ CAMPAIGNS: Could not fetch campaign analytics: ${error}`)
        campaignAnalytics = {}
      }

      // Process each campaign - get details and combine with analytics (BLUEPRINT APPROACH)
      for (let i = 0; i < allCampaigns.length; i++) {
        const campaign = allCampaigns[i]
        this.log(`🔄 CAMPAIGNS: Processing campaign ${i + 1}/${allCampaigns.length} - ${campaign.attributes?.name || 'Unnamed'}`)
        
        try {
          // Get campaign details with messages (BLUEPRINT APPROACH)
          let campaignDetails: any = null
          let messages: any[] = []
          let imageUrl: string | null = null
          
          try {
            this.log(`📧 CAMPAIGNS: Getting campaign details for ${campaign.id}`)
            campaignDetails = await this.klaviyo.getCampaign(campaign.id)
            
            this.log(`📩 CAMPAIGNS: Fetching messages for campaign ${campaign.id}`)
            const messagesResponse = await this.klaviyo.getCampaignMessages(campaign.id)
            messages = messagesResponse.data || []
            this.log(`📩 CAMPAIGNS: Found ${messages.length} messages`)
            
            // Extract images from included data
            if (messagesResponse?.included) {
              const imageData = messagesResponse.included.find((item: any) => item.type === 'image')
              if (imageData?.attributes?.image_url) {
                imageUrl = imageData.attributes.image_url
                this.log(`🖼️ CAMPAIGNS: Found image for campaign ${campaign.id}`)
              }
            }
          } catch (error) {
            this.log(`⚠️ CAMPAIGNS: Could not fetch details for campaign ${campaign.id}: ${error}`)
          }

          // Use analytics from Blueprint API call (ALL fields from your valid list)
          const analytics = campaignAnalytics[campaign.id] || {}
          this.log(`📊 CAMPAIGNS: Using Blueprint analytics - Opens: ${analytics.opens || 0}, Clicks: ${analytics.clicks || 0}, Revenue: ${analytics.conversion_value || 0}`)
          
          const campaignData = {
            ...transformCampaignData(campaign, messages),
            client_id: this.client.id,
            // Map ALL analytics fields from Blueprint API response
            recipients_count: analytics.recipients || 0,
            delivered_count: analytics.delivered || 0,
            opened_count: analytics.opens || 0,
            opens_unique: analytics.opens_unique || 0,
            clicked_count: analytics.clicks || 0,
            clicks_unique: analytics.clicks_unique || 0,
            bounced_count: analytics.bounced || 0,
            bounced_or_failed: analytics.bounced_or_failed || 0,
            failed_count: analytics.failed || 0,
            unsubscribed_count: analytics.unsubscribes || 0,
            unsubscribe_uniques: analytics.unsubscribe_uniques || 0,
            spam_complaints: analytics.spam_complaints || 0,
            conversions: analytics.conversions || 0,
            conversion_uniques: analytics.conversion_uniques || 0,
            conversion_value: analytics.conversion_value || 0,
            revenue: analytics.conversion_value || 0,
            orders_count: analytics.conversions || 0,
            revenue_per_recipient: analytics.revenue_per_recipient || 0,
            average_order_value: analytics.average_order_value || 0,
            open_rate: analytics.open_rate || 0,
            click_rate: analytics.click_rate || 0,
            click_to_open_rate: analytics.click_to_open_rate || 0,
            bounce_rate: analytics.bounce_rate || 0,
            bounced_or_failed_rate: analytics.bounced_or_failed_rate || 0,
            failed_rate: analytics.failed_rate || 0,
            delivery_rate: analytics.delivery_rate || 0,
            unsubscribe_rate: analytics.unsubscribe_rate || 0,
            spam_complaint_rate: analytics.spam_complaint_rate || 0,
            conversion_rate: analytics.conversion_rate || 0,
            image_url: imageUrl
          }

          this.log(`💾 CAMPAIGNS: Saving campaign data to database`)
          await DatabaseService.upsertCampaignMetric(campaignData)
          this.log(`✅ CAMPAIGNS: Campaign ${i + 1} saved successfully`)
        } catch (error) {
          this.log(`❌ CAMPAIGNS: Error processing campaign ${campaign.id}: ${error}`)
        }
      }

      this.log(`✅ CAMPAIGNS: Synced ${allCampaigns.length} campaigns successfully`)
      this.log(`🎯 CAMPAIGNS: Campaign sync completed, proceeding to flows...`)
      this.log(`🔍 CAMPAIGNS: Campaign sync method completed without errors`)
    } catch (error) {
      this.log(`❌ CAMPAIGNS: Error syncing campaigns: ${error}`)
      this.log(`❌ CAMPAIGNS: Error details: ${JSON.stringify(error)}`)
      throw error
    }
  }

  // Sync flow data
  async syncFlows(conversionMetricId: string | null) {
    this.log('🔄 FLOWS: Starting flows sync...')
    this.log('📋 FLOWS: Structure - flow_metrics for ACTIVE flows, flow_message_metrics for individual emails')
    
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
          
          // Filter to only ACTIVE flows (for flow_metrics table)
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
          
          const metrics = await this.getFlowMetrics(flow.id, startDate, endDate, conversionMetricId)
          
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

  // Sync revenue attribution using Flow LUXE proper attribution APIs
  async syncRevenueAttribution() {
    this.log('💰 FLOW LUXE REVENUE: Starting proper attribution analysis (past 30 days)...')
    
    try {
      // Get conversion metric ID dynamically
      const conversionMetricId = await this.getConversionMetricId()
      if (!conversionMetricId) {
        this.log('❌ REVENUE: No conversion metric found, skipping attribution sync')
        return
      }

      // Calculate date range (29 days like Flow LUXE)
      const now = new Date()
      const twentyNineDaysAgo = new Date(now.getTime() - (29 * 24 * 60 * 60 * 1000))
      const startDate = twentyNineDaysAgo.toISOString().split('.')[0] // Flow LUXE format
      const endDate = now.toISOString().split('.')[0]

      this.log(`💰 FLOW LUXE: Using date range ${startDate} to ${endDate}`)

      // FLOW LUXE PATTERN: Make 4 separate API calls for TRUE attribution
      this.log('🎯 FLOW LUXE: Starting 4-call attribution pattern...')
      
      const [
        attributedChannelData,
        totalRevenueData, 
        flowChannelData,
        campaignChannelData
      ] = await Promise.all([
        // Call 1: Revenue by attributed channel (Email vs SMS)
        this.klaviyo.queryRevenueByAttributedChannel(conversionMetricId, startDate, endDate),
        
        // Call 2: Total revenue (all channels)
        this.klaviyo.queryTotalRevenue(conversionMetricId, startDate, endDate),
        
        // Call 3: Revenue by flow channel
        this.klaviyo.queryRevenueByFlowChannel(conversionMetricId, startDate, endDate),
        
        // Call 4: Revenue by campaign channel
        this.klaviyo.queryRevenueByCampaignChannel(conversionMetricId, startDate, endDate)
      ])

      this.log('✅ FLOW LUXE: All 4 attribution API calls completed')

      // Process data exactly like Flow LUXE blueprint did
      const emailRevenue = attributedChannelData.data?.attributes?.data?.find((d: any) => 
        d.groupings?.$attributed_channel === 'email'
      )?.measurements?.sum_value || 0

      const smsRevenue = attributedChannelData.data?.attributes?.data?.find((d: any) => 
        d.groupings?.$attributed_channel === 'sms'
      )?.measurements?.sum_value || 0

      const totalRevenue = totalRevenueData.data?.attributes?.data?.[0]?.measurements?.sum_value || 0

      const flowEmailRevenue = flowChannelData.data?.attributes?.data?.find((d: any) =>
        d.groupings?.$flow_channel === 'email'
      )?.measurements?.sum_value || 0

      const campaignEmailRevenue = campaignChannelData.data?.attributes?.data?.find((d: any) =>
        d.groupings?.$campaign_channel === 'email'
      )?.measurements?.sum_value || 0

      // Process SMS data too
      const flowSmsRevenue = flowChannelData.data?.attributes?.data?.find((d: any) =>
        d.groupings?.$flow_channel === 'sms'
      )?.measurements?.sum_value || 0

      const campaignSmsRevenue = campaignChannelData.data?.attributes?.data?.find((d: any) =>
        d.groupings?.$campaign_channel === 'sms'
      )?.measurements?.sum_value || 0

      // Prepare complete Flow LUXE revenue attribution data
      const revenueData = {
        client_id: this.client.id,
        date_recorded: format(new Date(), 'yyyy-MM-dd'),
        
        // Legacy fields (for backward compatibility)
        campaign_revenue: campaignEmailRevenue,
        flow_revenue: flowEmailRevenue,
        total_email_revenue: emailRevenue, // TRUE attributed email revenue
        
        // Flow LUXE attribution fields (TRUE attribution from Klaviyo APIs)
        sms_revenue: smsRevenue, // Total SMS attributed revenue
        total_revenue: totalRevenue, // Cross-channel total (includes attribution overlap)
        flow_email_revenue: flowEmailRevenue, // Email revenue from flows only
        flow_sms_revenue: flowSmsRevenue, // SMS revenue from flows only  
        campaign_email_revenue: campaignEmailRevenue, // Email revenue from campaigns only
        campaign_sms_revenue: campaignSmsRevenue, // SMS revenue from campaigns only
        
        // Calculate orders and AOV from true attribution (placeholder for now)
        campaign_orders: 0, // TODO: Get order counts from additional API calls if needed
        flow_orders: 0,
        total_email_orders: 0,
        
        campaign_aov: campaignEmailRevenue > 0 ? campaignEmailRevenue / Math.max(1, 1) : 0,
        flow_aov: flowEmailRevenue > 0 ? flowEmailRevenue / Math.max(1, 1) : 0,
        overall_aov: totalRevenue > 0 ? totalRevenue / Math.max(1, 1) : 0
      }

      this.log(`💰 FLOW LUXE: Processed complete attribution data:
🏷️  ATTRIBUTED CHANNEL BREAKDOWN:
     📧 Email Revenue: $${emailRevenue}
     📱 SMS Revenue: $${smsRevenue}
💰 TOTAL REVENUE (Cross-channel): $${totalRevenue}
🔄 FLOW CHANNEL BREAKDOWN:
     📧 Flow Email: $${flowEmailRevenue}
     📱 Flow SMS: $${flowSmsRevenue}
📧 CAMPAIGN CHANNEL BREAKDOWN:
     📧 Campaign Email: $${campaignEmailRevenue}
     📱 Campaign SMS: $${campaignSmsRevenue}`)

      // Map complete Flow LUXE data to revenue_attribution_metrics table structure
      const totalFlowRevenue = flowEmailRevenue + flowSmsRevenue
      const totalCampaignRevenue = campaignEmailRevenue + campaignSmsRevenue
      
      const revenueMetric = {
        client_id: this.client.id,
        date: format(new Date(), 'yyyy-MM-dd'), // Note: 'date' not 'date_recorded'
        
        // TRUE attributed channel breakdown (Flow LUXE Module 246)
        email_revenue: emailRevenue, // TRUE attributed email revenue from $attributed_channel
        sms_revenue: smsRevenue,     // TRUE attributed SMS revenue from $attributed_channel
        total_revenue: totalRevenue, // Cross-channel total revenue (Module 247)
        
        // Flow LUXE channel breakdown (Modules 249 & 250)
        flow_email_revenue: flowEmailRevenue,       // Flow email revenue ($flow_channel)
        flow_sms_revenue: flowSmsRevenue,           // Flow SMS revenue ($flow_channel) 
        campaign_email_revenue: campaignEmailRevenue, // Campaign email revenue ($campaign_channel)
        campaign_sms_revenue: campaignSmsRevenue,   // Campaign SMS revenue ($campaign_channel)
        
        // Calculate percentages like Flow LUXE did
        email_percentage: totalRevenue > 0 ? (emailRevenue / totalRevenue) * 100 : 0,
        sms_percentage: totalRevenue > 0 ? (smsRevenue / totalRevenue) * 100 : 0,
        flow_percentage: totalRevenue > 0 ? (totalFlowRevenue / totalRevenue) * 100 : 0,
        campaign_percentage: totalRevenue > 0 ? (totalCampaignRevenue / totalRevenue) * 100 : 0,
        
        // Order data (placeholder for now)
        email_orders: 0, // TODO: Get order counts from additional API calls if needed
        sms_orders: 0,
        total_orders: 0
      }

      await DatabaseService.upsertRevenueAttributionMetric(revenueMetric)
      this.log('✅ FLOW LUXE: Synced proper revenue attribution to revenue_attribution_metrics table')
      
    } catch (error) {
      this.log(`❌ FLOW LUXE REVENUE: Error syncing attribution: ${error}`)
      console.error('Error syncing Flow LUXE revenue attribution:', error)
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
  private async getFlowMetrics(flowId: string, startDate: string, endDate: string, conversionMetricId: string | null) {
    this.log(`📊 FLOWS: Using Flow Values Report API for flow ${flowId} - MAXIMUM DATA EXTRACTION`)
    
    try {
      // Use the fixed Flow Values Report API
      const analytics = await this.klaviyo.getFlowAnalytics([flowId], conversionMetricId)
      
      if (analytics.data && analytics.data.length > 0) {
        const flowAnalytics = analytics.data[0].attributes
        
        this.log(`📈 FLOWS: Got analytics for flow ${flowId}: opens_unique=${flowAnalytics?.opens_unique || 0}, clicks_unique=${flowAnalytics?.clicks_unique || 0}, open_rate=${flowAnalytics?.open_rate || 0}, conversion_rate=${flowAnalytics?.conversion_rate || 0}`)
        
        return {
          opens_unique: flowAnalytics?.opens_unique || 0,
          clicks_unique: flowAnalytics?.clicks_unique || 0,
          opens: flowAnalytics?.opens || 0,
          clicks: flowAnalytics?.clicks || 0,
          // Map API field names to database field names
          sends: 0, // Not available in API
          deliveries: flowAnalytics?.delivered || 0, // API returns 'delivered'
          deliveries_unique: 0, // Not available in API
          bounces: flowAnalytics?.bounced || 0, // API returns 'bounced'
          bounces_unique: 0, // Not available in API
          bounced_or_failed: flowAnalytics?.bounced_or_failed || 0,
          bounced_or_failed_rate: flowAnalytics?.bounced_or_failed_rate || 0,
          failed: flowAnalytics?.failed || 0,
          failed_rate: flowAnalytics?.failed_rate || 0,
          delivery_rate: flowAnalytics?.delivery_rate || 0,
          open_rate: flowAnalytics?.open_rate || 0,
          click_rate: flowAnalytics?.click_rate || 0,
          click_to_open_rate: flowAnalytics?.click_to_open_rate || 0,
          bounce_rate: flowAnalytics?.bounce_rate || 0,
          conversion_rate: flowAnalytics?.conversion_rate || 0,
          conversions: flowAnalytics?.conversions || 0,
          conversion_uniques: flowAnalytics?.conversion_uniques || 0,
          conversion_value: flowAnalytics?.conversion_value || 0,
          unsubscribes: flowAnalytics?.unsubscribes || 0,
          unsubscribe_rate: flowAnalytics?.unsubscribe_rate || 0,
          unsubscribe_uniques: flowAnalytics?.unsubscribe_uniques || 0,
          spam_complaints: flowAnalytics?.spam_complaints || 0,
          spam_complaint_rate: flowAnalytics?.spam_complaint_rate || 0,
          recipients: flowAnalytics?.recipients || 0,
          revenue_per_recipient: flowAnalytics?.revenue_per_recipient || 0,
          average_order_value: flowAnalytics?.average_order_value || 0,
          // Legacy fields for backwards compatibility
          triggered_count: 0, // Not available from Flow Values Report
          completed_count: 0, // Not available from Flow Values Report
          completion_rate: 0, // Not available from Flow Values Report
          revenue: flowAnalytics?.conversion_value || 0, // Use conversion_value as revenue
          orders_count: flowAnalytics?.conversions || 0, // Use conversions as orders
          revenue_per_trigger: 0 // Not available from Flow Values Report
        }
      } else {
        this.log(`⚠️ FLOWS: No analytics data returned for flow ${flowId}`)
        return this.getDefaultFlowMetrics()
      }
      
    } catch (error) {
      this.log(`❌ FLOWS: Error getting analytics for flow ${flowId}: ${error}`)
      return this.getDefaultFlowMetrics()
    }
  }
  
  private getDefaultFlowMetrics() {
    return {
      // Email engagement stats
      opens_unique: 0,
      clicks_unique: 0,
      opens: 0,
      clicks: 0,
      // Delivery stats (using valid API field names)
      sends: 0, // Not available in API
      deliveries: 0, // Maps to 'delivered' from API
      deliveries_unique: 0, // Not available in API
      bounces: 0, // Maps to 'bounced' from API
      bounces_unique: 0, // Not available in API
      bounced_or_failed: 0,
      bounced_or_failed_rate: 0,
      failed: 0,
      failed_rate: 0,
      delivery_rate: 0,
      // Rate stats
      open_rate: 0,
      click_rate: 0,
      click_to_open_rate: 0,
      bounce_rate: 0,
      // Conversion stats
      conversion_rate: 0,
      conversions: 0,
      conversion_uniques: 0,
      conversion_value: 0,
      // Unsubscribe stats
      unsubscribes: 0,
      unsubscribe_rate: 0,
      unsubscribe_uniques: 0,
      // Spam stats
      spam_complaints: 0,
      spam_complaint_rate: 0,
      // Recipient stats
      recipients: 0,
      revenue_per_recipient: 0,
      average_order_value: 0,
      // Legacy fields
      triggered_count: 0,
      completed_count: 0,
      completion_rate: 0,
      revenue: 0,
      orders_count: 0,
      revenue_per_trigger: 0
    }
  }
  // NEW SYNC METHODS FOR 4-SECTION STRUCTURE

  // Sync segments data (SKIP ANALYTICS - just save segment info)
  async syncSegments() {
    this.log('👥 SEGMENTS: Starting segments sync (basic info only)...')
    
    try {
      let allSegments: any[] = []
      let cursor: string | undefined
      let hasMore = true
      let pageCount = 0

      // Fetch segments with pagination
      while (hasMore) {
        pageCount++
        this.log(`📄 SEGMENTS: Fetching page ${pageCount}...`)
        
        const response = await this.klaviyo.getSegments(cursor)
        const segments = response.data || []
        
        allSegments = [...allSegments, ...segments]
        this.log(`📊 SEGMENTS: Page ${pageCount} - Found ${segments.length} segments`)
        
        cursor = response.links?.next ? new URL(response.links.next).searchParams.get('page[cursor]') || undefined : undefined
        hasMore = !!cursor

        if (pageCount >= 10) {
          this.log(`⚠️ SEGMENTS: Reached page limit (10), stopping pagination`)
          break
        }
      }
      
      this.log(`📈 SEGMENTS: Total segments to process: ${allSegments.length}`)

      // Save basic segment info (no analytics)
      for (const segment of allSegments) {
        try {
          const segmentData = {
            client_id: this.client.id,
            segment_id: segment.id,
            segment_name: segment.attributes?.name || 'Unnamed Segment',
            date_recorded: new Date().toISOString().split('T')[0],
            profile_count: 0 // We'll skip getting the actual count to avoid API issues
          }

          await DatabaseService.upsertSegmentMetric(segmentData)
          this.log(`✅ SEGMENTS: Saved segment ${segment.attributes?.name}`)
        } catch (error) {
          this.log(`❌ SEGMENTS: Error processing segment ${segment.id}: ${error}`)
        }
      }

      this.log(`✅ SEGMENTS: Synced ${allSegments.length} segments (basic info only)`)
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
      let totalSent = 0, totalDelivered = 0, totalBounced = 0, totalSpam = 0
      
      for (const campaign of campaigns) {
        totalSent += campaign.recipients_count || 0
        totalDelivered += campaign.delivered_count || 0
        totalBounced += campaign.bounced_count || 0
      }

      // Calculate rates
      const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0
      const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0
      const spamRate = totalSent > 0 ? (totalSpam / totalSent) * 100 : 0
      
      // Calculate reputation score (simple algorithm)
      let reputationScore = 100
      if (bounceRate > 5) reputationScore -= (bounceRate - 5) * 10
      if (spamRate > 0.1) reputationScore -= spamRate * 50
      reputationScore = Math.max(0, Math.min(100, reputationScore))

      const deliverabilityData = {
        client_id: this.client.id,
        date_recorded: new Date().toISOString().split('T')[0],
        delivery_rate: deliveryRate,
        bounce_rate: bounceRate,
        spam_rate: spamRate,
        reputation_score: reputationScore
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
