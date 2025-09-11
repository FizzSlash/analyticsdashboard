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
    
    return data
  }

  // Get Campaigns
  async getCampaigns(pageSize: number = 20, cursor?: string) {
    // Use smaller page size and proper URL encoding
    let endpoint = `/campaigns`
    const params: string[] = []
    
    // Add pagination parameters with proper encoding
    if (pageSize) {
      params.push(`page%5Bsize%5D=${pageSize}`) // URL encoded page[size]
    }
    if (cursor) {
      params.push(`page%5Bcursor%5D=${encodeURIComponent(cursor)}`) // URL encoded page[cursor]
    }
    
    if (params.length > 0) {
      endpoint += `?${params.join('&')}`
    }
    
    console.log(`📧 CAMPAIGNS API: Full endpoint: ${endpoint}`)
    return this.makeRequest(endpoint)
  }

  // Get Campaign by ID
  async getCampaign(campaignId: string) {
    return this.makeRequest(`/campaigns/${campaignId}`)
  }

  // Get Campaign Messages
  async getCampaignMessages(campaignId: string) {
    return this.makeRequest(`/campaigns/${campaignId}/messages`)
  }

  // Get Flows
  async getFlows(pageSize: number = 20, cursor?: string) {
    let endpoint = `/flows`
    const params: string[] = []
    
    // Add pagination parameters with proper encoding
    if (pageSize) {
      params.push(`page%5Bsize%5D=${pageSize}`) // URL encoded page[size]
    }
    if (cursor) {
      params.push(`page%5Bcursor%5D=${encodeURIComponent(cursor)}`) // URL encoded page[cursor]
    }
    
    if (params.length > 0) {
      endpoint += `?${params.join('&')}`
    }
    
    console.log(`🔄 FLOWS API: Full endpoint: ${endpoint}`)
    return this.makeRequest(endpoint)
  }

  // Get Flow by ID
  async getFlow(flowId: string) {
    return this.makeRequest(`/flows/${flowId}`)
  }

  // Get Flow Actions
  async getFlowActions(flowId: string) {
    return this.makeRequest(`/flows/${flowId}/flow-actions`)
  }

  // Get Flow Messages for Action
  async getFlowMessages(actionId: string) {
    return this.makeRequest(`/flow-actions/${actionId}/flow-messages`)
  }

  // Get Metrics
  async getMetrics(pageSize: number = 50, cursor?: string) {
    let endpoint = `/metrics?page[size]=${pageSize}`
    if (cursor) {
      endpoint += `&page[cursor]=${cursor}`
    }
    
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
  async getProfiles(pageSize: number = 20, cursor?: string, filter?: string) {
    let endpoint = `/profiles`
    const params: string[] = []
    
    // Add pagination parameters with proper encoding
    if (pageSize) {
      params.push(`page%5Bsize%5D=${pageSize}`)
    }
    if (cursor) {
      params.push(`page%5Bcursor%5D=${encodeURIComponent(cursor)}`)
    }
    if (filter) {
      params.push(`filter=${encodeURIComponent(filter)}`)
    }
    
    if (params.length > 0) {
      endpoint += `?${params.join('&')}`
    }
    
    console.log(`👥 PROFILES API: Full endpoint: ${endpoint}`)
    return this.makeRequest(endpoint)
  }

  // Get Lists
  async getLists(pageSize: number = 20, cursor?: string) {
    let endpoint = `/lists`
    const params: string[] = []
    
    if (pageSize) {
      params.push(`page%5Bsize%5D=${pageSize}`)
    }
    if (cursor) {
      params.push(`page%5Bcursor%5D=${encodeURIComponent(cursor)}`)
    }
    
    if (params.length > 0) {
      endpoint += `?${params.join('&')}`
    }
    
    console.log(`📋 LISTS API: Full endpoint: ${endpoint}`)
    return this.makeRequest(endpoint)
  }

  // Get List Profiles
  async getListProfiles(listId: string, pageSize: number = 20, cursor?: string) {
    let endpoint = `/lists/${listId}/profiles`
    const params: string[] = []
    
    if (pageSize) {
      params.push(`page%5Bsize%5D=${pageSize}`)
    }
    if (cursor) {
      params.push(`page%5Bcursor%5D=${encodeURIComponent(cursor)}`)
    }
    
    if (params.length > 0) {
      endpoint += `?${params.join('&')}`
    }
    
    console.log(`📋 LIST PROFILES API: Full endpoint: ${endpoint}`)
    return this.makeRequest(endpoint)
  }

  // Get Events
  async getEvents(pageSize: number = 50, cursor?: string, filter?: string, sort?: string) {
    let endpoint = `/events?page[size]=${pageSize}`
    if (cursor) {
      endpoint += `&page[cursor]=${cursor}`
    }
    if (filter) {
      endpoint += `&filter=${encodeURIComponent(filter)}`
    }
    if (sort) {
      endpoint += `&sort=${sort}`
    }
    
    return this.makeRequest(endpoint)
  }

  // Get Account
  async getAccount() {
    return this.makeRequest('/accounts')
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
