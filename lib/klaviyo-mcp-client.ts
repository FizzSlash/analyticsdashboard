import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { spawn } from 'child_process'

/**
 * Klaviyo MCP Client
 * Connects to local Klaviyo MCP server to access rich reporting tools
 */
export class KlaviyoMCPClient {
  private client: Client | null = null
  private transport: StdioClientTransport | null = null
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Initialize connection to Klaviyo MCP server
   */
  async connect(): Promise<void> {
    console.log('🔌 Connecting to Klaviyo MCP server...')

    // Spawn the MCP server process
    const serverProcess = spawn('uvx', ['klaviyo-mcp-server@latest'], {
      env: {
        ...process.env,
        PRIVATE_API_KEY: this.apiKey,
        READ_ONLY: 'false',
        ALLOW_USER_GENERATED_CONTENT: 'false'
      }
    })

    // Create transport using stdio
    this.transport = new StdioClientTransport({
      command: 'uvx',
      args: ['klaviyo-mcp-server@latest'],
      env: {
        PRIVATE_API_KEY: this.apiKey,
        READ_ONLY: 'false',
        ALLOW_USER_GENERATED_CONTENT: 'false'
      }
    })

    // Create MCP client
    this.client = new Client(
      {
        name: 'klaviyo-dashboard-client',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    )

    // Connect
    await this.client.connect(this.transport)
    console.log('✅ Connected to Klaviyo MCP server')
  }

  /**
   * Get list of available tools
   */
  async listTools(): Promise<any> {
    if (!this.client) throw new Error('Not connected')
    return await this.client.listTools()
  }

  /**
   * Call a tool
   */
  async callTool(toolName: string, args: any = {}): Promise<any> {
    if (!this.client) throw new Error('Not connected')
    
    console.log(`🔧 Calling MCP tool: ${toolName}`, args)
    const result = await this.client.callTool({
      name: toolName,
      arguments: args
    })
    
    console.log(`✅ Tool result received`)
    return result
  }

  /**
   * Get flows list
   */
  async getFlows(): Promise<any> {
    return await this.callTool('get_flows')
  }

  /**
   * Get flow report
   */
  async getFlowReport(flowId: string): Promise<any> {
    return await this.callTool('get_flow_report', { flow_id: flowId })
  }

  /**
   * Get campaigns
   */
  async getCampaigns(): Promise<any> {
    return await this.callTool('get_campaigns')
  }

  /**
   * Get campaign report
   */
  async getCampaignReport(campaignId: string): Promise<any> {
    return await this.callTool('get_campaign_report', { campaign_id: campaignId })
  }

  /**
   * Get account details
   */
  async getAccountDetails(): Promise<any> {
    return await this.callTool('get_account_details')
  }

  /**
   * Close connection
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.client = null
    }
    if (this.transport) {
      await this.transport.close()
      this.transport = null
    }
    console.log('🔌 Disconnected from Klaviyo MCP server')
  }
}

/**
 * Create and manage MCP client instances
 * Uses connection pooling to avoid spawning too many processes
 */
class MCPClientPool {
  private clients: Map<string, KlaviyoMCPClient> = new Map()
  private connections: Map<string, Promise<void>> = new Map()

  async getClient(apiKey: string): Promise<KlaviyoMCPClient> {
    // Use first 8 chars of API key as identifier
    const clientId = apiKey.substring(0, 8)

    if (this.clients.has(clientId)) {
      return this.clients.get(clientId)!
    }

    // Create new client
    const client = new KlaviyoMCPClient(apiKey)
    this.clients.set(clientId, client)

    // Connect if not already connecting
    if (!this.connections.has(clientId)) {
      const connectPromise = client.connect()
      this.connections.set(clientId, connectPromise)
      await connectPromise
    }

    return client
  }

  async cleanup(): Promise<void> {
    // Convert Map.values() to array for TypeScript compatibility
    const clientsArray = Array.from(this.clients.values())
    for (const client of clientsArray) {
      await client.disconnect()
    }
    this.clients.clear()
    this.connections.clear()
  }
}

export const mcpClientPool = new MCPClientPool()

// Cleanup on process exit
process.on('exit', () => {
  mcpClientPool.cleanup()
})

