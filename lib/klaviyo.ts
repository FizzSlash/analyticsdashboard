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

  // Get Campaign Messages with Images
  async getCampaignMessages(campaignId: string) {
    let endpoint = `/campaigns/${campaignId}/campaign-messages`
    const params = new URLSearchParams()
    
    // Request specific fields including image URLs
    params.set('fields[campaign-message]', '')
    params.set('fields[campaign]', '')
    params.set('fields[image]', 'image_url')
    params.set('fields[template]', '')
    params.set('include', 'image')
    
    endpoint += `?${params.toString()}`
    
    console.log(`📧 CAMPAIGN MESSAGES API: Full endpoint: ${endpoint}`)
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

  // REPORTING API METHODS
  
  // Campaign Analytics Report
  async getCampaignAnalytics(campaignIds: string[]) {
    return this.makeRequest('/campaign-values-reports', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'campaign-values-report',
          attributes: {
            campaign_ids: campaignIds,
            metrics: ['opens', 'clicks', 'bounces', 'deliveries', 'unsubscribes', 'revenue', 'open_rate', 'click_rate', 'bounce_rate']
          }
        }
      })
    })
  }

  // Flow Analytics Report  
  async getFlowAnalytics(flowIds: string[]) {
    return this.makeRequest('/flow-values-reports', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'flow-values-report',
          attributes: {
            flow_ids: flowIds,
            metrics: ['triggered', 'completed', 'completion_rate', 'revenue']
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

  // Segment Analytics Report
  async getSegmentAnalytics(segmentIds: string[]) {
    return this.makeRequest('/segment-values-reports', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'segment-values-report',
          attributes: {
            segment_ids: segmentIds,
            metrics: ['size', 'growth_rate', 'engagement_rate']
          }
        }
      })
    })
  }

  // Segment Series Report (growth over time)
  async getSegmentSeries(segmentIds: string[], startDate: string, endDate: string) {
    return this.makeRequest('/segment-series-reports', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'segment-series-report',
          attributes: {
            segment_ids: segmentIds,
            start_date: startDate,
            end_date: endDate,
            metrics: ['size', 'growth_rate']
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
  
  return {
    campaign_id: klaviyoCampaign.id,
    campaign_name: klaviyoCampaign.attributes.name,
    subject_line: message?.attributes?.subject || null,
    send_date: klaviyoCampaign.attributes.send_time || null,
    recipients_count: klaviyoCampaign.attributes.send_job_status?.recipients || 0,
    // Note: Detailed metrics need to be fetched from events/metrics endpoints
    delivered_count: 0,
    opened_count: 0,
    clicked_count: 0,
    unsubscribed_count: 0,
    bounced_count: 0,
    revenue: 0,
    orders_count: 0,
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
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'abcdefghijklmnopqrstuvwxyz123456'

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
