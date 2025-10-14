/**
 * Klaviyo REST API Client
 * Direct API access for backend - no MCP needed
 * 
 * Reference: https://developers.klaviyo.com/en/reference/api_overview
 */

const KLAVIYO_API_BASE = 'https://a.klaviyo.com/api'
const API_REVISION = '2024-10-15'

export class KlaviyoAPI {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${KLAVIYO_API_BASE}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Klaviyo-API-Key ${this.apiKey}`,
        'revision': API_REVISION,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Klaviyo API error (${response.status}): ${error}`)
    }

    return await response.json()
  }

  /**
   * Get all flows
   * Equivalent to MCP get_flows tool
   */
  async getFlows() {
    return await this.makeRequest('/flows/?fields[flow]=name,status,archived,created,updated,trigger_type')
  }

  /**
   * Get flow details
   * Equivalent to MCP get_flow tool
   */
  async getFlow(flowId: string) {
    return await this.makeRequest(`/flows/${flowId}/?fields[flow]=name,status,archived,created,updated,trigger_type&include=flow-actions`)
  }

  /**
   * Get flow performance report
   * Equivalent to MCP get_flow_report tool
   * Uses Flow Values Report API for detailed metrics
   */
  async getFlowReport(flowIds: string[]) {
    // This is the rich reporting data that MCP provides
    return await this.makeRequest('/reporting/flow-values-query/', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'flow-values-report',
          attributes: {
            flow_ids: flowIds,
            timeframe: {
              key: 'last_365_days'
            },
            conversion_metric_id: null,
            statistics: [
              'opens',
              'opens_unique',
              'clicks',
              'clicks_unique',
              'conversions',
              'conversion_value',
              'recipients',
              'revenue'
            ]
          }
        }
      })
    })
  }

  /**
   * Get all campaigns
   * Equivalent to MCP get_campaigns tool
   */
  async getCampaigns() {
    return await this.makeRequest('/campaigns/?fields[campaign]=name,status,archived,send_time,created_at,updated_at&sort=-send_time')
  }

  /**
   * Get campaign details
   * Equivalent to MCP get_campaign tool  
   */
  async getCampaign(campaignId: string) {
    return await this.makeRequest(`/campaigns/${campaignId}/?fields[campaign]=name,status,archived,send_time,created_at,updated_at,audiences`)
  }

  /**
   * Get campaign performance report
   * Equivalent to MCP get_campaign_report tool
   */
  async getCampaignReport(campaignIds: string[]) {
    return await this.makeRequest('/reporting/campaign-values-query/', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'campaign-values-report',
          attributes: {
            campaign_ids: campaignIds,
            statistics: [
              'opens',
              'opens_unique',
              'clicks',
              'clicks_unique',
              'conversions',
              'conversion_value',
              'recipients',
              'revenue',
              'deliveries',
              'bounces',
              'unsubscribes'
            ]
          }
        }
      })
    })
  }

  /**
   * Get account details
   * Equivalent to MCP get_account_details tool
   */
  async getAccountDetails() {
    return await this.makeRequest('/accounts/')
  }

  /**
   * Get lists
   */
  async getLists() {
    return await this.makeRequest('/lists/?fields[list]=name,created,updated')
  }

  /**
   * Get segments
   */
  async getSegments() {
    return await this.makeRequest('/segments/?fields[segment]=name,created,updated')
  }

  /**
   * Get profiles (paginated)
   */
  async getProfiles(pageSize: number = 20) {
    return await this.makeRequest(`/profiles/?page[size]=${pageSize}&fields[profile]=email,first_name,last_name,created`)
  }
}

