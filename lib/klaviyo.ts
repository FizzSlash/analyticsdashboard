// Klaviyo API Integration
export class KlaviyoAPI {
  private apiKey: string
  private baseURL = 'https://a.klaviyo.com/api'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<any> {
    const url = `${this.baseURL}${endpoint}`
    const maxRetries = 3
    
    console.log(`🌐 KLAVIYO API: Making request to ${endpoint}`)
    console.log(`🔑 KLAVIYO API: Using API key starting with: ${this.apiKey.substring(0, 8)}...`)
    console.log(`🔗 KLAVIYO API: Full URL: ${url}`)
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Klaviyo-API-Key ${this.apiKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'revision': '2025-07-15',
          ...options.headers,
        },
      })

      console.log(`📡 KLAVIYO API: Response status: ${response.status} ${response.statusText}`)
      
      if (response.status === 429) {
        // Rate limited - retry with exponential backoff
        if (retryCount < maxRetries) {
          const delayMs = Math.min(2000 * Math.pow(2, retryCount), 60000) // Start at 2s, max 60s
          console.log(`⏱️ KLAVIYO API: Rate limited, waiting ${delayMs}ms before retry ${retryCount + 1}/${maxRetries}`)
          await new Promise(resolve => setTimeout(resolve, delayMs))
          return this.makeRequest(endpoint, options, retryCount + 1)
        } else {
          throw new Error(`Rate limit exceeded after ${maxRetries} attempts`)
        }
      }
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ KLAVIYO API: Error response body:`, errorText)
        throw new Error(`Klaviyo API Error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      console.log(`✅ KLAVIYO API: Success - Data keys:`, Object.keys(data))
      console.log(`📊 KLAVIYO API: Data count: ${data.data ? data.data.length : 'N/A'}`)
      
      return data
    } catch (error) {
      if (retryCount < maxRetries && (error as Error).message.includes('fetch')) {
        // Network error - retry
        const delayMs = 1000 * (retryCount + 1)
        console.log(`🔄 KLAVIYO API: Network error, retrying in ${delayMs}ms`)
        await new Promise(resolve => setTimeout(resolve, delayMs))
        return this.makeRequest(endpoint, options, retryCount + 1)
      }
      throw error
    }
  }

  // Get Campaigns - ENHANCED with includes for complete data
  async getCampaigns(cursor?: string, channel: 'email' | 'sms' | 'mobile_push' = 'email', includes?: string[]) {
    let endpoint = `/campaigns`
    const params = new URLSearchParams()
    
    // REQUIRED: Channel filter per Klaviyo API documentation
    params.set('filter', `equals(messages.channel,'${channel}')`)
    
    // Optional: Cursor for pagination
    if (cursor) {
      params.set('page[cursor]', cursor)
    }
    
    // Optional: Include related data (campaign-messages, tags, images, templates)
    if (includes && includes.length > 0) {
      params.set('include', includes.join(','))
    }
    
    // Optional: Specific fields to reduce payload size
    params.set('fields[campaign]', 'name,status,send_time,audiences,tracking_options,send_strategy,created_at,updated_at,scheduled_at,archived')
    params.set('fields[campaign-message]', 'definition,send_times,created_at,updated_at')
    
    const queryString = params.toString()
    endpoint += `?${queryString}`
    
    console.log(`📧 CAMPAIGNS API: Enhanced endpoint: ${endpoint}`)
    console.log(`📧 CAMPAIGNS API: Channel filter: ${channel}`)
    console.log(`📧 CAMPAIGNS API: Includes: ${includes?.join(', ') || 'none'}`)
    return this.makeRequest(endpoint)
  }

  // Get Campaign by ID
  async getCampaign(campaignId: string) {
    return this.makeRequest(`/campaigns/${campaignId}`)
  }

  // Get Campaign Messages - MAXIMUM DATA EXTRACTION
  async getCampaignMessages(campaignId: string) {
    let endpoint = `/campaigns/${campaignId}/campaign-messages`
    const params = new URLSearchParams()
    
    // Request only VALID fields (remove invalid template.subject)
    params.set('fields[campaign-message]', 'definition,send_times,id,created_at,updated_at')
    params.set('fields[template]', 'name,html')
    params.set('fields[image]', 'image_url,name')
    params.set('include', 'template,image')
    
    endpoint += `?${params.toString()}`
    
    console.log(`📧 CAMPAIGN MESSAGES API: Full endpoint: ${endpoint}`)
    console.log(`📧 CAMPAIGN MESSAGES API: Maximum data extraction - definition,send_times,template,images`)
    return this.makeRequest(endpoint)
  }

  // Get Flows
  async getFlows(cursor?: string) {
    // Klaviyo uses cursor-based pagination ONLY
    let endpoint = `/flows`
    const params = new URLSearchParams()
    
    if (cursor) {
      params.set('page[cursor]', cursor)
    }
    
    const queryString = params.toString()
    if (queryString) {
      endpoint += `?${queryString}`
    }
    
    console.log(`🔄 FLOWS API: Full endpoint: ${endpoint}`)
    return this.makeRequest(endpoint)
  }

  // Get Flow by ID
  async getFlow(flowId: string) {
    return this.makeRequest(`/flows/${flowId}`)
  }

  // Get Flow Messages by message IDs (direct API calls)
  async getFlowMessages(messageIds: string[]) {
    console.log(`🔄 FLOW MESSAGES: Getting ${messageIds.length} messages directly by ID`)
    
    const allMessages: any[] = []
    
    for (const messageId of messageIds) {
      try {
        // Direct API call to get message details
        const messageResponse = await this.makeRequest(`/flow-messages/${messageId}`)
        
        if (messageResponse.data) {
          allMessages.push(messageResponse.data)
          console.log(`✅ FLOW MESSAGES: Got message ${messageId}`)
        }
        
        // Rate limiting: 3/s = 333ms, use 400ms for safety
        if (messageIds.indexOf(messageId) < messageIds.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 400))
        }
        
      } catch (error) {
        console.log(`❌ FLOW MESSAGES: Error getting message ${messageId}:`, error)
      }
    }
    
    console.log(`✅ FLOW MESSAGES: Found ${allMessages.length} total messages`)
    return { data: allMessages }
  }

  // Get Metrics (fixed - no page size)
  async getMetrics(cursor?: string) {
    let endpoint = `/metrics`
    const params = new URLSearchParams()
    
    if (cursor) {
      params.set('page[cursor]', cursor)
    }
    
    const queryString = params.toString()
    if (queryString) {
      endpoint += `?${queryString}`
    }
    
    console.log(`📊 METRICS API: Full endpoint: ${endpoint}`)
    return this.makeRequest(endpoint)
  }

  // Query Metric Aggregates - For subscription growth tracking (FIXED API FORMAT)
  async queryMetricAggregates(metricId: string, interval: string = 'day', startDate?: string, endDate?: string) {
    console.log(`📈 METRIC AGGREGATES API: Querying metric ${metricId} with ${interval} interval`)
    
    // Default to last 365 days if no dates provided
    const defaultEndDate = new Date().toISOString()
    const defaultStartDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
    
    const actualStartDate = startDate || defaultStartDate
    const actualEndDate = endDate || defaultEndDate
    
    console.log(`📅 METRIC AGGREGATES: Date range: ${actualStartDate} to ${actualEndDate}`)
    
    try {
      const requestBody = {
        data: {
          type: 'metric-aggregate',
          attributes: {
            metric_id: metricId,
            measurements: ['count'],
            interval: interval, // 'day', 'week', 'month'
            filter: [
              `greater-or-equal(datetime,${actualStartDate})`,
              `less-than(datetime,${actualEndDate})`
            ],
            page_size: 500,
            timezone: 'UTC'
          }
        }
      }
      
      console.log(`📊 METRIC AGGREGATES: Request body:`, JSON.stringify(requestBody, null, 2))
      
      const result = await this.makeRequest('/metric-aggregates', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })
      
      console.log(`✅ METRIC AGGREGATES API: Successfully retrieved data for metric ${metricId}`)
      console.log(`📊 METRIC AGGREGATES: Response sample:`, JSON.stringify(result.data?.attributes?.data?.[0], null, 2))
      
      return result
    } catch (error) {
      console.error(`❌ METRIC AGGREGATES API: Error querying metric ${metricId}:`, error)
      throw error
    }
  }

  // Get Profiles
  async getProfiles(cursor?: string, filter?: string) {
    let endpoint = `/profiles`
    const params = new URLSearchParams()
    
    if (cursor) {
      params.set('page[cursor]', cursor)
    }
    if (filter) {
      params.set('filter', filter)
    }
    
    const queryString = params.toString()
    if (queryString) {
      endpoint += `?${queryString}`
    }
    
    console.log(`👥 PROFILES API: Full endpoint: ${endpoint}`)
    return this.makeRequest(endpoint)
  }

  // Get Lists
  async getLists(cursor?: string) {
    let endpoint = `/lists`
    const params = new URLSearchParams()
    
    if (cursor) {
      params.set('page[cursor]', cursor)
    }
    
    const queryString = params.toString()
    if (queryString) {
      endpoint += `?${queryString}`
    }
    
    console.log(`📋 LISTS API: Full endpoint: ${endpoint}`)
    return this.makeRequest(endpoint)
  }

  // Get List Profiles
  async getListProfiles(listId: string, cursor?: string) {
    let endpoint = `/lists/${listId}/profiles`
    const params = new URLSearchParams()
    
    if (cursor) {
      params.set('page[cursor]', cursor)
    }
    
    const queryString = params.toString()
    if (queryString) {
      endpoint += `?${queryString}`
    }
    
    console.log(`📋 LIST PROFILES API: Full endpoint: ${endpoint}`)
    return this.makeRequest(endpoint)
  }

  // Get Events
  async getEvents(cursor?: string, filter?: string, sort?: string) {
    let endpoint = `/events`
    const params = new URLSearchParams()
    
    if (cursor) {
      params.set('page[cursor]', cursor)
    }
    if (filter) {
      params.set('filter', filter)
    }
    if (sort) {
      params.set('sort', sort)
    }
    
    const queryString = params.toString()
    if (queryString) {
      endpoint += `?${queryString}`
    }
    
    console.log(`📊 EVENTS API: Full endpoint: ${endpoint}`)
    return this.makeRequest(endpoint)
  }

  // Get Account
  async getAccount() {
    return this.makeRequest('/accounts')
  }

  // REVENUE ATTRIBUTION - CUSTOM METRICS API

  // Get Placed Order Metric ID
  async getPlacedOrderMetric() {
    console.log(`💰 REVENUE: Getting Placed Order metric ID`)
    return this.makeRequest('/metrics?filter=equals(name,"Placed Order")')
  }

  // Revenue Attribution Query (365 DAYS)
  async getRevenueAttribution(metricId: string) {
    console.log(`💰 REVENUE: Querying email revenue attribution - 365 DAYS`)
    
    // Calculate dynamic 365-day timeframe
    const endDate = new Date().toISOString()
    const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
    
    console.log(`📅 REVENUE: Dynamic timeframe - ${startDate} to ${endDate}`)
    
    return this.makeRequest(`/metrics/${metricId}/query`, {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'metric-aggregate',
          attributes: {
            measurements: ['sum_value', 'count', 'average_value', 'unique_count'],
            filter: `and(greater-than(datetime,"${startDate}"),exists($message))`,
            by: ['$source', '$flow', '$message', '$campaign'],
            timezone: 'UTC'
          }
        }
      })
    })
  }

  // Revenue Trends Over Time (365 DAYS)
  async getRevenueTrends(metricId: string) {
    console.log(`📈 REVENUE: Getting revenue trends over time - 365 DAYS`)
    
    const endDate = new Date().toISOString()
    const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
    
    return this.makeRequest(`/metrics/${metricId}/query`, {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'metric-aggregate',
          attributes: {
            measurements: ['sum_value', 'count'],
            filter: `greater-than(datetime,"${startDate}")`,
            interval: 'week',
            timezone: 'UTC'
          }
        }
      })
    })
  }

  // REVENUE ATTRIBUTION BY CHANNEL METHODS
  
  // Query Revenue Attribution by Channel - Get all and filter client-side
  async queryRevenueByChannel(metricId: string, channel: 'EMAIL' | 'SMS', startDate: string, endDate: string) {
    console.log(`💰 REVENUE: Querying ${channel} revenue attribution from ${startDate} to ${endDate}`)
    
    // First, get ALL revenue data (no channel filter) to see what's available
    return this.makeRequest('/metric-aggregates', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'metric-aggregate',
          attributes: {
            metric_id: metricId,
            measurements: ['count', 'sum_value'], // count = orders, sum_value = revenue in cents
            interval: 'day', // This handles time grouping
            filter: [
              `greater-or-equal(datetime,${startDate})`,
              `less-than(datetime,${endDate})`
            ],
            // Get all revenue data, we'll filter by channel in processing
            page_size: 500,
            timezone: 'UTC'
          }
        }
      })
    })
  }

  // Query Total Revenue (All Channels)
  async queryTotalRevenue(metricId: string, startDate: string, endDate: string) {
    console.log(`💰 REVENUE: Querying TOTAL revenue (all channels) from ${startDate} to ${endDate}`)
    
    return this.makeRequest('/metric-aggregates', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'metric-aggregate',
          attributes: {
            metric_id: metricId,
            measurements: ['count', 'sum_value'], // count = orders, sum_value = revenue in cents
            interval: 'day', // This handles time grouping
            filter: [
              `greater-or-equal(datetime,${startDate})`,
              `less-than(datetime,${endDate})`
            ],
            // Remove 'by' parameter - not needed for time-based aggregation
            page_size: 500,
            timezone: 'UTC'
          }
        }
      })
    })
  }

  // REPORTING API METHODS
  
  // Campaign Analytics Report - BLUEPRINT APPROACH (ALL campaigns in one call)
  async getCampaignAnalytics(campaignIds: string[], conversionMetricId: string | null = null) {
    console.log(`📊 CAMPAIGNS: Using Blueprint approach - ALL campaigns in single call`)
    
    // Calculate dynamic 365-day timeframe for logging
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    console.log(`📅 CAMPAIGNS: Dynamic timeframe - ${startDate} to ${endDate} (365 days)`)
    console.log(`🔄 CAMPAIGNS: Single call for ALL campaigns (no individual filtering)`)
    console.log(`🎯 CAMPAIGNS: Using conversion metric ID: ${conversionMetricId || 'none'}`)
    
    try {
      const requestBody: any = {
        data: {
          type: 'campaign-values-report',
          attributes: {
            statistics: [
              // ALL valid statistics from your list:
              'average_order_value',
              'bounce_rate', 
              'bounced',
              'bounced_or_failed',
              'bounced_or_failed_rate',
              'click_rate',
              'click_to_open_rate', 
              'clicks',
              'clicks_unique',
              'conversion_rate',
              'conversion_uniques',
              'conversion_value',
              'conversions',
              'delivered',
              'delivery_rate',
              'failed',
              'failed_rate',
              'open_rate',
              'opens',
              'opens_unique',
              'recipients',
              'revenue_per_recipient',
              'spam_complaint_rate',
              'spam_complaints',
              'unsubscribe_rate',
              'unsubscribe_uniques',
              'unsubscribes'
            ],
            timeframe: {
              key: 'last_365_days'  // Use predefined timeframe key
            }
          }
        }
      }
      
      // Only add conversion_metric_id if we have one
      if (conversionMetricId) {
        requestBody.data.attributes.conversion_metric_id = conversionMetricId
      }
      
      const result = await this.makeRequest('/campaign-values-reports', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })
      
      console.log(`✅ CAMPAIGNS: Blueprint approach successful - got data for ALL campaigns`)
      console.log(`📊 CAMPAIGNS: Response structure:`, JSON.stringify(result, null, 2))
      
      // Parse the response (should contain data for all campaigns)
      const results = []
      if (result.data?.attributes?.results && Array.isArray(result.data.attributes.results)) {
        for (const item of result.data.attributes.results) {
          results.push({
            id: item.groupings?.campaign_id || 'unknown',
            attributes: item.statistics || {}
          })
        }
        console.log(`📈 CAMPAIGNS: Processed ${results.length} campaigns from blueprint response`)
      } else {
        console.log(`⚠️ CAMPAIGNS: Unexpected response structure`)
      }
      
      return { data: results }
      
    } catch (error: any) {
      console.log(`❌ CAMPAIGNS: Blueprint approach failed: ${error.message}`)
      
      // Fallback to individual calls if needed
      return this.getCampaignAnalyticsIndividual(campaignIds, conversionMetricId)
    }
  }

  // Fallback method for individual calls (if batching fails)
  private async getCampaignAnalyticsIndividual(campaignIds: string[], conversionMetricId: string | null = null) {
    console.log(`📊 CAMPAIGNS: Using individual calls with extended delays`)
    
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const results = []
    
    for (const campaignId of campaignIds) {
      console.log(`📊 CAMPAIGNS: Getting analytics for campaign ${campaignId} (${campaignIds.indexOf(campaignId) + 1}/${campaignIds.length})`)
      
      try {
        // Much longer delay between individual calls (30 seconds)
        if (campaignIds.indexOf(campaignId) > 0) {
          console.log(`⏱️ CAMPAIGNS: Waiting 30 seconds before next call to respect rate limits`)
          await new Promise(resolve => setTimeout(resolve, 30000))
        }
        
        const requestBody: any = {
          data: {
            type: 'campaign-values-report',
            attributes: {
              statistics: ['opens', 'clicks', 'conversions', 'conversion_value'], // Minimal stats
              timeframe: { start: startDate, end: endDate },
              filter: `equals(campaign_id,"${campaignId}")`
            }
          }
        }
        
        // Only add conversion_metric_id if we have one
        if (conversionMetricId) {
          requestBody.data.attributes.conversion_metric_id = conversionMetricId
        }
        
        const result = await this.makeRequest('/campaign-values-reports', {
          method: 'POST',
          body: JSON.stringify(requestBody)
        })
        
        if (result.data?.attributes?.results && Array.isArray(result.data.attributes.results)) {
          const transformedData = result.data.attributes.results.map((item: any) => ({
            id: item.groupings?.campaign_id || campaignId,
            attributes: item.statistics || {}
          }))
          results.push(...transformedData)
          console.log(`✅ CAMPAIGNS: Got analytics for ${campaignId}`)
        }
        
      } catch (error: any) {
        console.log(`⚠️ CAMPAIGNS: Failed to get analytics for ${campaignId}: ${error.message}`)
      }
    }
    
    return { data: results }
  }

  // Flow Analytics Report - SERIES APPROACH (Daily Data for 365 Days)
  async getFlowAnalytics(flowIds: string[], conversionMetricId: string | null = null) {
    console.log(`🔄 FLOWS: Calling Flow Series Report API for ${flowIds.length} flows - DAILY SERIES`)
    
    console.log(`📅 FLOWS: Using last_365_days timeframe for daily series data`)
    console.log(`📊 FLOWS: SERIES CALL - Getting daily analytics for ALL ${flowIds.length} flows`)
    console.log(`🎯 FLOWS: Using conversion metric ID: ${conversionMetricId || 'none'}`)
    
    try {
      const requestBody: any = {
        data: {
          type: 'flow-series-report',
          attributes: {
            statistics: [
              // Valid statistics for Flow Series API
              'opens', 'opens_unique', 'open_rate',
              'clicks', 'clicks_unique', 'click_rate', 'click_to_open_rate',
              'delivered', 'delivery_rate',
              'bounced', 'bounce_rate',
              'conversions', 'conversion_rate', 'conversion_value',
              'recipients', 'revenue_per_recipient',
              'bounced_or_failed', 'bounced_or_failed_rate',
              'failed', 'failed_rate',
              'unsubscribes', 'unsubscribe_rate', 'unsubscribe_uniques',
              'spam_complaints', 'spam_complaint_rate',
              'average_order_value'
            ],
            timeframe: { key: 'last_12_months' },
            interval: 'weekly', // Weekly interval for 12 months
            filter: `contains-any(flow_id,["${flowIds.join('","')}"])` // BATCH ALL FLOWS
          }
        }
      }
      
      // Only add conversion_metric_id if we have one
      if (conversionMetricId) {
        requestBody.data.attributes.conversion_metric_id = conversionMetricId
      }
      
      const result = await this.makeRequest('/flow-series-reports', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })
      
      console.log(`✅ FLOWS: SERIES API call successful - got daily data for ${flowIds.length} flows`)
      console.log(`📊 FLOWS: Response structure:`, JSON.stringify(result, null, 2))
      
      // Parse the series response - keep weekly data separate for trend tracking
      const results = []
      const dateTimes = result.data?.attributes?.date_times || []
      
      if (result.data?.attributes?.results && Array.isArray(result.data.attributes.results)) {
        console.log(`📊 FLOWS: Processing ${result.data.attributes.results.length} flow messages across ${dateTimes.length} weeks`)
        
        for (const item of result.data.attributes.results) {
          const flowId = item.groupings?.flow_id || 'unknown'
          const messageId = item.groupings?.flow_message_id || 'unknown'
          const stats = item.statistics || {}
          
          // Create one record per week per flow message
          for (let weekIndex = 0; weekIndex < dateTimes.length; weekIndex++) {
            const weekDate = dateTimes[weekIndex]
            const weekStats: any = {}
            
            // Extract data for this specific week
            for (const [statKey, statArray] of Object.entries(stats)) {
              if (Array.isArray(statArray) && statArray[weekIndex] !== undefined) {
                weekStats[statKey] = statArray[weekIndex]
              }
            }
            
            // Create flow record for this week
            results.push({
              id: `${flowId}_${weekDate}`, // Unique ID per week
              flow_id: flowId,
              flow_message_id: messageId,
              week_date: weekDate,
              attributes: weekStats
            })
          }
        }
        
        console.log(`📈 FLOWS: Created ${results.length} weekly records from ${dateTimes.length} weeks of data`)
        console.log(`🗓️ FLOWS: Date range: ${dateTimes[0]} to ${dateTimes[dateTimes.length - 1]}`)
      } else {
        console.log(`⚠️ FLOWS: Unexpected response structure from series call`)
      }
      
      return { data: results }
      
    } catch (error: any) {
      console.log(`❌ FLOWS: Batched API call failed: ${error.message}`)
      console.log(`🔄 FLOWS: Falling back to individual calls...`)
      
      // Fallback to individual calls with much longer delays
      return this.getFlowAnalyticsIndividual(flowIds, conversionMetricId)
    }
  }

  // Fallback method for individual flow calls
  private async getFlowAnalyticsIndividual(flowIds: string[], conversionMetricId: string | null = null) {
    console.log(`📊 FLOWS: Using individual calls with extended delays`)
    
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const results = []
    
    for (const flowId of flowIds) {
      console.log(`📊 FLOWS: Getting analytics for flow ${flowId} (${flowIds.indexOf(flowId) + 1}/${flowIds.length})`)
      
      try {
        // Much longer delay between individual calls (30 seconds)
        if (flowIds.indexOf(flowId) > 0) {
          console.log(`⏱️ FLOWS: Waiting 30 seconds before next call to respect rate limits`)
          await new Promise(resolve => setTimeout(resolve, 30000))
        }
        
        const requestBody: any = {
          data: {
            type: 'flow-values-report',
            attributes: {
              statistics: ['opens', 'clicks', 'conversions', 'conversion_value'], // Minimal stats
              timeframe: { start: startDate, end: endDate },
              filter: `equals(flow_id,"${flowId}")`
            }
          }
        }
        
        // Only add conversion_metric_id if we have one
        if (conversionMetricId) {
          requestBody.data.attributes.conversion_metric_id = conversionMetricId
        }
        
        const result = await this.makeRequest('/flow-values-reports', {
          method: 'POST',
          body: JSON.stringify(requestBody)
        })
        
        if (result.data?.attributes?.results && Array.isArray(result.data.attributes.results)) {
          const transformedData = result.data.attributes.results.map((item: any) => ({
            id: item.groupings?.flow_id || flowId,
            attributes: item.statistics || {}
          }))
          results.push(...transformedData)
          console.log(`✅ FLOWS: Got analytics for ${flowId}`)
        }
        
      } catch (error: any) {
        console.log(`⚠️ FLOWS: Failed to get analytics for ${flowId}: ${error.message}`)
      }
    }
    
    return { data: results }
  }

  // Flow Series Report - TIME TRENDS (365 DAYS)
  async getFlowSeries(flowIds: string[]) {
    console.log(`📈 FLOWS: Calling Flow Series Report API for time trends - 365 DAYS`)
    
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    return this.makeRequest('/flow-series-reports', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'flow-series-report',
          attributes: {
            statistics: ['opens_unique', 'clicks_unique', 'revenue', 'flow_completions'],
            timeframe: {
              start: startDate,
              end: endDate
            },
            interval: 'weekly',
            filter: `any(flow_id,["${flowIds.join('","')}"])`
          }
        }
      })
    })
  }

  // SEGMENT API METHODS

  // Get Segments
  async getSegments(cursor?: string) {
    let endpoint = `/segments`
    const params = new URLSearchParams()
    
    if (cursor) {
      params.set('page[cursor]', cursor)
    }
    
    const queryString = params.toString()
    if (queryString) {
      endpoint += `?${queryString}`
    }
    
    console.log(`👥 SEGMENTS API: Full endpoint: ${endpoint}`)
    return this.makeRequest(endpoint)
  }

  // Get Segment Profiles
  async getSegmentProfiles(segmentId: string, cursor?: string) {
    let endpoint = `/segments/${segmentId}/profiles`
    const params = new URLSearchParams()
    
    if (cursor) {
      params.set('page[cursor]', cursor)
    }
    
    const queryString = params.toString()
    if (queryString) {
      endpoint += `?${queryString}`
    }
    
    console.log(`👥 SEGMENT PROFILES API: Full endpoint: ${endpoint}`)
    return this.makeRequest(endpoint)
  }

  // Segment Analytics Report - DISABLED (Klaviyo API doesn't support proper segment analytics)
  async getSegmentAnalytics(segmentIds: string[]) {
    console.log(`👥 SEGMENTS: Segment analytics disabled - Klaviyo API limitations`)
    // Return empty result to avoid API errors
    return { data: [] }
  }

  // Segment Series Report - GROWTH TRENDS (365 DAYS)
  async getSegmentSeries(segmentIds: string[]) {
    console.log(`📈 SEGMENTS: Calling Segment Series Report API for growth trends - 365 DAYS`)
    
    // Calculate dynamic 365-day timeframe
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    return this.makeRequest('/segment-series-reports', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'segment-series-report',
          attributes: {
            statistics: ['size', 'opens_unique', 'revenue'],
            timeframe: {
              start: startDate,
              end: endDate
            },
            interval: 'monthly',
            filter: `any(segment_id,["${segmentIds.join('","')}"])`
          }
        }
      })
    })
  }

  // FLOW STRUCTURE METHODS

  // Get Flow Actions (steps in flow)
  async getFlowActions(flowId: string, cursor?: string) {
    let endpoint = `/flows/${flowId}/flow-actions`
    const params = new URLSearchParams()
    
    if (cursor) {
      params.set('page[cursor]', cursor)
    }
    
    const queryString = params.toString()
    if (queryString) {
      endpoint += `?${queryString}`
    }
    
    console.log(`🔄 FLOW ACTIONS API: Full endpoint: ${endpoint}`)
    return this.makeRequest(endpoint)
  }

  // Get Flow Messages (emails in each action/step)
  async getFlowActionMessages(actionId: string, cursor?: string) {
    let endpoint = `/flow-actions/${actionId}/flow-messages`
    const params = new URLSearchParams()
    
    if (cursor) {
      params.set('page[cursor]', cursor)
    }
    
    const queryString = params.toString()
    if (queryString) {
      endpoint += `?${queryString}`
    }
    
    console.log(`📧 FLOW MESSAGES API: Full endpoint: ${endpoint}`)
    return this.makeRequest(endpoint)
  }


  // Helper method to get subscription growth data for multiple metrics (FIXED)
  async getSubscriptionGrowthData(startDate?: string, endDate?: string, interval: string = 'day') {
    console.log(`🔄 SUBSCRIPTION GROWTH: Getting growth data with ${interval} interval`)
    
    // Default to last 365 days if no dates provided
    const defaultEndDate = new Date().toISOString()
    const defaultStartDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
    
    const actualStartDate = startDate || defaultStartDate
    const actualEndDate = endDate || defaultEndDate
    
    console.log(`📅 SUBSCRIPTION GROWTH: Date range: ${actualStartDate} to ${actualEndDate}`)
    
    try {
      // First get all metrics to find the right IDs (using existing method)
      const metricsResponse = await this.getMetrics() // Uses existing method with optional cursor
      const metrics = metricsResponse.data || []
      
      // Create lookup for metric names to IDs
      const metricLookup: { [key: string]: string } = {}
      metrics.forEach((metric: any) => {
        metricLookup[metric.attributes.name] = metric.id
      })
      
      console.log(`📋 SUBSCRIPTION GROWTH: Available metrics:`, Object.keys(metricLookup).filter(name => 
        name.toLowerCase().includes('subscrib') || name.toLowerCase().includes('form')
      ))
      
      // Query all subscription-related metrics
      const subscriptionMetrics = [
        'Subscribed to Email Marketing',
        'Unsubscribed from Email Marketing', 
        'Subscribed to SMS Marketing',
        'Unsubscribed from SMS Marketing',
        'Form submitted by profile',
        'Subscribed to List',
        'Unsubscribed from List',
        'Subscribed to Back in Stock'
      ]
      
      const queries = []
      const validMetrics = []
      
      for (const metricName of subscriptionMetrics) {
        if (metricLookup[metricName]) {
          queries.push(this.queryMetricAggregates(metricLookup[metricName], interval, actualStartDate, actualEndDate))
          validMetrics.push(metricName)
        } else {
          console.log(`⚠️ SUBSCRIPTION GROWTH: Metric "${metricName}" not found in account`)
        }
      }
      
      console.log(`🎯 SUBSCRIPTION GROWTH: Querying ${queries.length} metrics: ${validMetrics.join(', ')}`)
      
      const results = await Promise.all(queries)
      
      return {
        metricNames: validMetrics,
        metricData: results,
        metricLookup: metricLookup
      }
      
    } catch (error) {
      console.error('❌ SUBSCRIPTION GROWTH: Error getting growth data:', error)
      throw error
    }
  }
}

// Helper functions for data transformation
export function transformCampaignData(klaviyoCampaign: any, messages: any[] = []) {
  const message = messages[0] // Assuming single message per campaign for now
  
  // Extract subject line from the correct location (seen in logs: email_content.subject)
  const emailContent = message?.attributes?.definition || {}
  const subjectLine = emailContent?.subject || message?.attributes?.subject || null
  
  return {
    campaign_id: klaviyoCampaign.id,
    campaign_name: klaviyoCampaign.attributes.name,
    subject_line: subjectLine,
    send_date: klaviyoCampaign.attributes.send_time || null,
    recipients_count: klaviyoCampaign.attributes.send_job_status?.recipients || 0,
    delivered_count: 0,
    opened_count: 0,
    clicked_count: 0,
    unsubscribed_count: 0,
    bounced_count: 0,
    revenue: 0,
    orders_count: 0,
    // Maximum data fields
    preview_text: emailContent?.preview_text || null,
    from_email: emailContent?.from_email || null,
    from_label: emailContent?.from_label || null,
    image_url: null, // Will be populated from included image data
    email_content: JSON.stringify(emailContent),
    template_id: null // Will be populated from included template data
  }
}

export function transformFlowData(klaviyoFlow: any) {
  return {
    flow_id: klaviyoFlow.id,
    flow_name: klaviyoFlow.attributes.name,
    flow_type: klaviyoFlow.attributes.trigger_type || 'unknown',
    flow_status: klaviyoFlow.attributes.status,
    triggered_count: 0, // Need to calculate from events
    completed_count: 0, // Need to calculate from events
    revenue: 0, // Need to calculate from events
    orders_count: 0, // Need to calculate from events
  }
}

// Encryption utilities for storing API keys securely
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_SECRET || 'abcdefghijklmnopqrstuvwxyz123456'

export function encryptApiKey(apiKey: string): string {
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv)
  
  let encrypted = cipher.update(apiKey, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
}

export function decryptApiKey(encryptedData: string): string {
  const parts = encryptedData.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const authTag = Buffer.from(parts[1], 'hex')
  const encrypted = parts[2]
  
  const decipher = createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}
