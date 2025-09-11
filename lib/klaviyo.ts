// Klaviyo API Integration
export class KlaviyoAPI {
  private apiKey: string
  private baseURL = 'https://a.klaviyo.com/api'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    console.log(`🌐 KLAVIYO API: Making request to ${endpoint}`)
    console.log(`🔑 KLAVIYO API: Using API key starting with: ${this.apiKey.substring(0, 8)}...`)
    console.log(`🔗 KLAVIYO API: Full URL: ${url}`)
    
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
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ KLAVIYO API: Error response body:`, errorText)
      throw new Error(`Klaviyo API Error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log(`✅ KLAVIYO API: Success - Data keys:`, Object.keys(data))
    console.log(`📊 KLAVIYO API: Data count: ${data.data ? data.data.length : 'N/A'}`)
    
    return data
  }

  // Get Campaigns - REQUIRES channel filter per Klaviyo docs
  async getCampaigns(cursor?: string, channel: 'email' | 'sms' | 'mobile_push' = 'email') {
    let endpoint = `/campaigns`
    const params = new URLSearchParams()
    
    // REQUIRED: Channel filter per Klaviyo API documentation
    params.set('filter', `equals(messages.channel,'${channel}')`)
    
    // Optional: Cursor for pagination
    if (cursor) {
      params.set('page[cursor]', cursor)
    }
    
    const queryString = params.toString()
    endpoint += `?${queryString}`
    
    console.log(`📧 CAMPAIGNS API: Full endpoint: ${endpoint}`)
    console.log(`📧 CAMPAIGNS API: Required channel filter: ${channel}`)
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

  // Query Metric Aggregates
  async queryMetricAggregates(metricId: string, measurements: string[], filter?: string, groupBy?: string[], startDate?: string, endDate?: string) {
    const body: any = {
      data: {
        type: 'metric-aggregate',
        attributes: {
          measurements,
        }
      }
    }

    if (filter) body.data.attributes.filter = filter
    if (groupBy) body.data.attributes.by = groupBy
    if (startDate) body.data.attributes.interval = startDate
    if (endDate) body.data.attributes.interval = `${startDate},${endDate}`

    return this.makeRequest(`/metrics/${metricId}/query`, {
      method: 'POST',
      body: JSON.stringify(body)
    })
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

  // REPORTING API METHODS
  
  // Campaign Analytics Report - MAXIMUM DATA EXTRACTION (365 DAYS)
  async getCampaignAnalytics(campaignIds: string[]) {
    console.log(`📊 CAMPAIGNS: Calling Campaign Values Report API for ${campaignIds.length} campaigns - MAXIMUM DATA EXTRACTION`)
    
    // Calculate dynamic 365-day timeframe
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    console.log(`📅 CAMPAIGNS: Dynamic timeframe - ${startDate} to ${endDate} (365 days)`)
    
    // SOLUTION: Call API for each campaign individually with smart retry
    const results = []
    
    for (const campaignId of campaignIds) {
      console.log(`📊 CAMPAIGNS: Getting analytics for campaign ${campaignId}`)
      
      try {
        const result = await this.makeRequest('/campaign-values-reports', {
          method: 'POST',
          body: JSON.stringify({
            data: {
              type: 'campaign-values-report',
              attributes: {
                statistics: [
                  'opens', 'opens_unique', 'open_rate',
                  'clicks', 'clicks_unique', 'click_rate', 'click_to_open_rate',
                  'delivered', 'delivery_rate',
                  'bounced', 'bounce_rate', 'bounced_or_failed', 'bounced_or_failed_rate',
                  'failed', 'failed_rate',
                  'conversions', 'conversion_rate', 'conversion_uniques', 'conversion_value',
                  'unsubscribes', 'unsubscribe_rate', 'unsubscribe_uniques',
                  'spam_complaints', 'spam_complaint_rate',
                  'recipients', 'revenue_per_recipient', 'average_order_value'
                ],
                timeframe: { start: startDate, end: endDate },
                filter: `equals(campaign_id,"${campaignId}")`,
                conversion_metric_id: 'QSwNRK'
              }
            }
          })
        })
        
        // Parse response structure
        if (result.data?.attributes?.results && Array.isArray(result.data.attributes.results)) {
          const transformedData = result.data.attributes.results.map((item: any) => ({
            id: item.groupings?.campaign_id || campaignId,
            attributes: item.statistics || {}
          }))
          results.push(...transformedData)
          console.log(`✅ CAMPAIGNS: Got analytics for ${campaignId} - REAL DATA`)
        }
        
      } catch (error: any) {
        console.log(`⚠️ CAMPAIGNS: Failed to get analytics for ${campaignId}: ${error.message}`)
      }
    }
    
    return { data: results }
  }

  // Flow Analytics Report - MAXIMUM DATA EXTRACTION (365 DAYS)
  async getFlowAnalytics(flowIds: string[]) {
    console.log(`🔄 FLOWS: Calling Flow Values Report API for ${flowIds.length} flows - MAXIMUM DATA EXTRACTION`)
    
    // Calculate dynamic 365-day timeframe
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    console.log(`📅 FLOWS: Dynamic timeframe - ${startDate} to ${endDate} (365 days)`)
    
    // SOLUTION: Call API for each flow individually with clean syntax
    const results = []
    
    for (const flowId of flowIds) {
      console.log(`📊 FLOWS: Getting analytics for flow ${flowId}`)
      
      try {
        const result = await this.makeRequest('/flow-values-reports', {
          method: 'POST',
          body: JSON.stringify({
            data: {
              type: 'flow-values-report',
              attributes: {
                statistics: [
                  'opens', 'opens_unique', 'open_rate',
                  'clicks', 'clicks_unique', 'click_rate', 'click_to_open_rate',
                  'delivered', 'delivery_rate',
                  'bounced', 'bounce_rate', 'bounced_or_failed', 'bounced_or_failed_rate',
                  'failed', 'failed_rate',
                  'conversions', 'conversion_rate', 'conversion_uniques', 'conversion_value',
                  'unsubscribes', 'unsubscribe_rate', 'unsubscribe_uniques',
                  'spam_complaints', 'spam_complaint_rate',
                  'recipients', 'revenue_per_recipient', 'average_order_value'
                ],
                timeframe: { start: startDate, end: endDate },
                filter: `equals(flow_id,"${flowId}")`,
                conversion_metric_id: 'QSwNRK'
              }
            }
          })
        })
        
        // Parse response structure
        if (result.data?.attributes?.results && Array.isArray(result.data.attributes.results)) {
          const transformedData = result.data.attributes.results.map((item: any) => ({
            id: item.groupings?.flow_id || flowId,
            attributes: item.statistics || {}
          }))
          results.push(...transformedData)
          console.log(`✅ FLOWS: Got analytics for ${flowId} - REAL DATA`)
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

  // Segment Analytics Report - MAXIMUM DATA EXTRACTION (365 DAYS)
  async getSegmentAnalytics(segmentIds: string[]) {
    console.log(`👥 SEGMENTS: Calling Segment Values Report API for ${segmentIds.length} segments - MAXIMUM DATA EXTRACTION`)
    
    // Calculate dynamic 365-day timeframe
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    console.log(`📅 SEGMENTS: Dynamic timeframe - ${startDate} to ${endDate} (365 days)`)
    
    return this.makeRequest('/segment-values-reports', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'segment-values-report',
          attributes: {
            statistics: [
              'opens',
              'opens_unique',
              'clicks',
              'clicks_unique', 
              'deliveries',
              'bounces',
              'open_rate',
              'click_rate',
              'bounce_rate',
              'revenue',
              'orders',
              'conversion_rate',
              'average_order_value',
              'unsubscribes',
              'unsubscribe_rate'
            ],
            timeframe: {
              start: startDate,
              end: endDate
            },
            filter: `any(segment_id,["${segmentIds.join('","')}"])`
          }
        }
      })
    })
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
