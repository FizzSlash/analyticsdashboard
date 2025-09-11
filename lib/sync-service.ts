import { KlaviyoAPI, transformCampaignData, transformFlowData, decryptApiKey } from './klaviyo'
import { DatabaseService } from './database'
import { Client } from './supabase'
import { format, subDays } from 'date-fns'

export class SyncService {
  private klaviyo: KlaviyoAPI
  private client: Client

  constructor(client: Client) {
    this.client = client
    console.log(`🔑 SYNC INIT: Initializing sync for ${client.brand_name}`)
    
    try {
      // Decrypt the API key before using it
      console.log(`🔓 SYNC INIT: Decrypting Klaviyo API key...`)
      const decryptedApiKey = decryptApiKey(client.klaviyo_api_key)
      console.log(`✅ SYNC INIT: API key decrypted successfully (starts with: ${decryptedApiKey.substring(0, 6)}...)`)
      
      this.klaviyo = new KlaviyoAPI(decryptedApiKey)
      console.log(`🎯 SYNC INIT: Klaviyo API client initialized`)
    } catch (error) {
      console.error(`❌ SYNC INIT: Failed to initialize Klaviyo API:`, error)
      throw error
    }
  }

  // Main sync function
  async syncAllData() {
    console.log(`🚀 SYNC START: Starting comprehensive sync for client: ${this.client.brand_name}`)
    
    try {
      console.log(`📅 SYNC SCOPE: Pulling data from the past 365 days`)
      
      console.log(`📧 SYNC STEP 1: Starting campaigns sync...`)
      await this.syncCampaigns()
      console.log(`✅ SYNC STEP 1: Campaigns sync completed`)
      
      console.log(`🔄 SYNC STEP 2: Starting flows sync...`)
      await this.syncFlows()
      console.log(`✅ SYNC STEP 2: Flows sync completed`)
      
      console.log(`👥 SYNC STEP 3: Starting audience metrics sync...`)
      await this.syncAudienceMetrics()
      console.log(`✅ SYNC STEP 3: Audience metrics sync completed`)
      
      console.log(`💰 SYNC STEP 4: Starting revenue attribution sync...`)
      await this.syncRevenueAttribution()
      console.log(`✅ SYNC STEP 4: Revenue attribution sync completed`)

      // Update last sync timestamp
      await DatabaseService.updateClientSyncTime(this.client.id)
      
      console.log(`🎉 SYNC COMPLETE: All data synced successfully for ${this.client.brand_name}`)
    } catch (error) {
      console.error(`❌ SYNC FAILED for client ${this.client.brand_name}:`, error)
      throw error
    }
  }

  // Sync campaign data
  async syncCampaigns() {
    console.log('📧 CAMPAIGNS: Starting campaigns sync...')
    
    try {
      // Calculate date filter for past year
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      const dateFilter = oneYearAgo.toISOString()
      
      console.log(`📅 CAMPAIGNS: Filtering campaigns from ${oneYearAgo.toDateString()} onwards`)
      
      let allCampaigns: any[] = []
      let cursor: string | undefined
      let hasMore = true
      let pageCount = 0

      // Fetch campaigns with pagination (limited to past year)
      while (hasMore) {
        pageCount++
        console.log(`📄 CAMPAIGNS: Fetching page ${pageCount}...`)
        
        const response = await this.klaviyo.getCampaigns(50, cursor)
        const campaigns = response.data || []
        
        // Filter campaigns to past year only
        const recentCampaigns = campaigns.filter((campaign: any) => {
          const sendTime = campaign.attributes?.send_time
          return !sendTime || new Date(sendTime) >= oneYearAgo
        })
        
        allCampaigns = [...allCampaigns, ...recentCampaigns]
        console.log(`📊 CAMPAIGNS: Page ${pageCount} - Found ${campaigns.length} campaigns, ${recentCampaigns.length} within past year`)
        
        cursor = response.links?.next ? new URL(response.links.next).searchParams.get('page[cursor]') || undefined : undefined
        hasMore = !!cursor
        
        // Stop if we've gone back more than a year
        if (campaigns.length > 0 && campaigns.every((c: any) => c.attributes?.send_time && new Date(c.attributes.send_time) < oneYearAgo)) {
          console.log(`📅 CAMPAIGNS: Reached campaigns older than 1 year, stopping pagination`)
          break
        }
      }
      
      console.log(`📈 CAMPAIGNS: Total campaigns to process: ${allCampaigns.length}`)

      // Process each campaign
      for (let i = 0; i < allCampaigns.length; i++) {
        const campaign = allCampaigns[i]
        console.log(`🔄 CAMPAIGNS: Processing campaign ${i + 1}/${allCampaigns.length} - ${campaign.attributes?.name || 'Unnamed'}`)
        
        try {
          // Get campaign messages for subject line
          let messages: any[] = []
          try {
            console.log(`📩 CAMPAIGNS: Fetching messages for campaign ${campaign.id}`)
            const messagesResponse = await this.klaviyo.getCampaignMessages(campaign.id)
            messages = messagesResponse.data || []
            console.log(`📩 CAMPAIGNS: Found ${messages.length} messages`)
          } catch (error) {
            console.warn(`⚠️ CAMPAIGNS: Could not fetch messages for campaign ${campaign.id}:`, error)
          }

          // Get campaign metrics from events
          console.log(`📊 CAMPAIGNS: Calculating metrics for campaign ${campaign.id}`)
          const metrics = await this.getCampaignMetrics(campaign.id)
          console.log(`📊 CAMPAIGNS: Metrics calculated - Recipients: ${metrics.recipients_count}, Opens: ${metrics.opened_count}`)
          
          const campaignData = {
            ...transformCampaignData(campaign, messages),
            client_id: this.client.id,
            ...metrics
          }

          console.log(`💾 CAMPAIGNS: Saving campaign data to database`)
          await DatabaseService.upsertCampaignMetric(campaignData)
          console.log(`✅ CAMPAIGNS: Campaign ${i + 1} saved successfully`)
        } catch (error) {
          console.error(`❌ CAMPAIGNS: Error processing campaign ${campaign.id}:`, error)
          throw error // Stop on first error to see exactly what's failing
        }
      }

      console.log(`Synced ${allCampaigns.length} campaigns`)
    } catch (error) {
      console.error('Error syncing campaigns:', error)
      throw error
    }
  }

  // Sync flow data
  async syncFlows() {
    console.log('Syncing flows...')
    
    try {
      let allFlows: any[] = []
      let cursor: string | undefined
      let hasMore = true

      // Fetch all flows with pagination
      while (hasMore) {
        const response = await this.klaviyo.getFlows(50, cursor)
        allFlows = [...allFlows, ...response.data]
        
        cursor = response.links?.next ? new URL(response.links.next).searchParams.get('page[cursor]') || undefined : undefined
        hasMore = !!cursor
      }

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

      console.log(`Synced ${allFlows.length} flows`)
    } catch (error) {
      console.error('Error syncing flows:', error)
      throw error
    }
  }

  // Sync audience metrics
  async syncAudienceMetrics() {
    console.log('Syncing audience metrics...')
    
    try {
      // Get current profile count
      const profilesResponse = await this.klaviyo.getProfiles(1)
      const totalProfiles = profilesResponse.data?.length || 0

      // Get subscribed profiles (you may need to adjust this based on your list setup)
      const listsResponse = await this.klaviyo.getLists(50)
      let totalSubscribed = 0
      
      for (const list of listsResponse.data || []) {
        try {
          const listProfilesResponse = await this.klaviyo.getListProfiles(list.id, 1)
          // This is a simplified count - in reality you'd need to paginate through all profiles
          totalSubscribed += listProfilesResponse.data?.length || 0
        } catch (error) {
          console.warn(`Could not fetch profiles for list ${list.id}:`, error)
        }
      }

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
      console.log('Synced audience metrics')
    } catch (error) {
      console.error('Error syncing audience metrics:', error)
      throw error
    }
  }

  // Sync revenue attribution
  async syncRevenueAttribution() {
    console.log('Syncing revenue attribution...')
    
    try {
      // Get recent campaign metrics to calculate revenue
      const campaigns = await DatabaseService.getRecentCampaignMetrics(this.client.id, 1)
      const flows = await DatabaseService.getRecentFlowMetrics(this.client.id, 1)

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
      console.log('Synced revenue attribution')
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
      const events = await this.klaviyo.getEvents(100, undefined, filter, '-datetime')
      
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

  // Helper: Get flow metrics
  private async getFlowMetrics(flowId: string, startDate: string, endDate: string) {
    try {
      // This would need to be implemented based on your specific flow tracking
      // You'd query events related to this flow within the date range
      const filter = `equals(flow_id,"${flowId}") and greater-than(datetime,"${startDate}") and less-than(datetime,"${endDate}")`
      const events = await this.klaviyo.getEvents(100, undefined, filter, '-datetime')
      
      let triggered = 0, completed = 0, revenue = 0, orders = 0

      // Process events to calculate metrics
      for (const event of events.data || []) {
        const eventType = event.attributes?.metric?.data?.attributes?.name
        
        switch (eventType) {
          case 'Flow Started':
            triggered++
            break
          case 'Flow Completed':
            completed++
            break
          case 'Placed Order':
            orders++
            revenue += event.attributes?.properties?.value || 0
            break
        }
      }

      return {
        triggered_count: triggered,
        completed_count: completed,
        completion_rate: triggered > 0 ? (completed / triggered) * 100 : 0,
        revenue,
        orders_count: orders,
        revenue_per_trigger: triggered > 0 ? revenue / triggered : 0
      }
    } catch (error) {
      console.warn(`Could not fetch metrics for flow ${flowId}:`, error)
      return {
        triggered_count: 0,
        completed_count: 0,
        completion_rate: 0,
        revenue: 0,
        orders_count: 0,
        revenue_per_trigger: 0
      }
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
