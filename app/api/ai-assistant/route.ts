import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import Anthropic from '@anthropic-ai/sdk'

/*
 * AI Assistant API - Claude with Klaviyo API Integration
 * 
 * Uses Claude API with tool calling to access Klaviyo data.
 * Claude can request data using tools, which we fetch from Klaviyo API.
 * 
 * See: https://developers.klaviyo.com/en/docs/klaviyo_mcp_server
 */

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Klaviyo API base URL
const KLAVIYO_API_BASE = 'https://a.klaviyo.com/api'

export async function POST(request: NextRequest) {
  try {
    const { clientSlug, clientId, message, context } = await request.json()

    console.log('🤖 AI Assistant: Processing request for client:', clientSlug)

    // Get client's Klaviyo API key
    const client = await DatabaseService.getClientBySlug(clientSlug)
    if (!client || !client.klaviyo_api_key) {
      throw new Error('Client not found or missing Klaviyo API key')
    }

    // Prepare system prompt with context
    const systemPrompt = `You are an AI assistant for an email marketing analytics dashboard analyzing data for ${client.brand_name}.

Current Dashboard Context:
- Active Flows: ${context.flows?.length || 0}
- Recent Campaigns: ${context.campaigns?.length || 0}
- Total Flow Revenue: $${context.flows?.reduce((s: number, f: any) => s + (f.revenue || 0), 0).toLocaleString() || 0}

You have access to tools to fetch detailed data from Klaviyo. Use them when you need:
- Specific flow or campaign performance data
- Complete list of flows or campaigns
- Detailed metrics not in the dashboard context

When analyzing performance:
- Compare metrics to industry benchmarks (20-25% open rate is good)
- Identify specific opportunities with dollar impact
- Provide actionable, step-by-step recommendations
- Use bold, bullets, and emojis for readability

Be concise but thorough. Always use real data, never estimate.`

    console.log('🤖 AI Assistant: Calling Claude API...')

    //Call Claude with tool definitions
    let response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message
        }
      ],
      tools: [
        {
          name: 'get_flows',
          description: 'Get a list of all flows for this Klaviyo account with basic metrics',
          input_schema: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'get_flow_report',
          description: 'Get detailed performance report for a specific flow including messages, metrics, and trends',
          input_schema: {
            type: 'object',
            properties: {
              flow_id: {
                type: 'string',
                description: 'The Klaviyo flow ID (e.g., "WZCeMQ")'
              }
            },
            required: ['flow_id']
          }
        },
        {
          name: 'get_campaigns',
          description: 'Get a list of campaigns for this Klaviyo account',
          input_schema: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'get_campaign_report',
          description: 'Get detailed performance report for a specific campaign',
          input_schema: {
            type: 'object',
            properties: {
                campaign_id: {
                type: 'string',
                description: 'The Klaviyo campaign ID'
              }
            },
            required: ['campaign_id']
          }
        },
        {
          name: 'analyze_dashboard_data',
          description: 'Analyze the current dashboard data (flows, campaigns, metrics) that is already loaded. Use this for questions about top performers, trends, or comparisons.',
          input_schema: {
            type: 'object',
            properties: {
              analysis_type: {
                type: 'string',
                enum: ['top_flows', 'campaign_performance', 'optimization_tips', 'comparison'],
                description: 'Type of analysis to perform'
              }
            },
            required: ['analysis_type']
          }
        }
      ]
    })

    // Handle tool use - Claude may request to use tools
    let finalResponse = response
    let toolUseCount = 0
    const maxToolUses = 3

    while (finalResponse.stop_reason === 'tool_use' && toolUseCount < maxToolUses) {
      toolUseCount++
      console.log(`🤖 AI Assistant: Claude requested tool use (${toolUseCount}/${maxToolUses})`)

      const toolUseBlocks = finalResponse.content.filter((block: any) => block.type === 'tool_use') as any[]
      const toolResults = []

      for (const toolUse of toolUseBlocks) {
        console.log(`🤖 AI Assistant: Executing tool: ${toolUse.name}`)
        
        let toolResult
        try {
          toolResult = await executeTool(toolUse.name, toolUse.input, client.klaviyo_api_key, context)
        } catch (error: any) {
          console.error(`🤖 AI Assistant: Tool execution error:`, error)
          toolResult = { error: error.message }
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(toolResult)
        })
      }

      // Continue conversation with tool results
      const messages = [
        {
          role: 'user',
          content: message
        },
        {
          role: 'assistant',
          content: finalResponse.content
        },
        {
          role: 'user',
          content: toolResults
        }
      ]

      finalResponse = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: systemPrompt,
        messages: messages as any,
        tools: finalResponse.content.filter((block: any) => block.type === 'tool_use').length > 0 ? [
          // Same tools as before...
        ] : undefined
      })
    }

    // Extract final response text
    const responseText = finalResponse.content
      .filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join('\n')

    console.log('🤖 AI Assistant: Response complete')

    return NextResponse.json({
      success: true,
      response: responseText,
      usage: {
        input_tokens: finalResponse.usage.input_tokens,
        output_tokens: finalResponse.usage.output_tokens
      },
      tool_uses: toolUseCount
    })
  } catch (error: any) {
    console.error('🤖 AI Assistant API error:', error)
    
    // Fall back to data analysis
    try {
      const body = await request.json()
      const fallbackResponse = analyzeClientData(body.message, body.context)
      
      return NextResponse.json({
        success: true,
        response: fallbackResponse,
        fallback: true,
        error: error.message
      })
    } catch (fallbackError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to process your request. Please try again.',
        response: 'I apologize, but I encountered an error. Please try again.'
      }, { status: 500 })
    }
  }
}

// Execute tool calls
async function executeTool(toolName: string, input: any, klaviyoApiKey: string, context: any): Promise<any> {
  switch (toolName) {
    case 'get_flows':
      return getFlowsFromKlaviyo(klaviyoApiKey)
    
    case 'get_flow_report':
      return getFlowReportFromKlaviyo(input.flow_id, klaviyoApiKey)
    
    case 'get_campaigns':
      return getCampaignsFromKlaviyo(klaviyoApiKey)
    
    case 'get_campaign_report':
      return getCampaignReportFromKlaviyo(input.campaign_id, klaviyoApiKey)
    
    case 'analyze_dashboard_data':
      return analyzeDashboardData(input.analysis_type, context)
    
    default:
      throw new Error(`Unknown tool: ${toolName}`)
  }
}

// Klaviyo API functions
async function getFlowsFromKlaviyo(apiKey: string) {
  const response = await fetch(`${KLAVIYO_API_BASE}/flows/?fields[flow]=name,status,archived,created,updated`, {
    headers: {
      'Authorization': `Klaviyo-API-Key ${apiKey}`,
      'revision': '2024-10-15'
    }
  })
  
  if (!response.ok) throw new Error(`Klaviyo API error: ${response.status}`)
  return await response.json()
}

async function getFlowReportFromKlaviyo(flowId: string, apiKey: string) {
  // Get flow performance data - would need to implement based on Klaviyo's reporting API
  // For now, return placeholder
  return {
    flow_id: flowId,
    message: 'Flow report data would be fetched from Klaviyo reporting API'
  }
}

async function getCampaignsFromKlaviyo(apiKey: string) {
  const response = await fetch(`${KLAVIYO_API_BASE}/campaigns/?fields[campaign]=name,status,archived,send_time,created_at`, {
    headers: {
      'Authorization': `Klaviyo-API-Key ${apiKey}`,
      'revision': '2024-10-15'
    }
  })
  
  if (!response.ok) throw new Error(`Klaviyo API error: ${response.status}`)
  return await response.json()
}

async function getCampaignReportFromKlaviyo(campaignId: string, apiKey: string) {
  // Get campaign performance data
  return {
    campaign_id: campaignId,
    message: 'Campaign report data would be fetched from Klaviyo reporting API'
  }
}

// Analyze dashboard data (uses context already loaded)
function analyzeDashboardData(analysisType: string, context: any) {
  switch (analysisType) {
    case 'top_flows':
      const topFlows = (context.flows || [])
        .sort((a: any, b: any) => (b.revenue || 0) - (a.revenue || 0))
        .slice(0, 10)
        .map((f: any) => ({
          name: f.flow_name,
          revenue: f.revenue,
          opens: f.opens,
          open_rate: f.open_rate
        }))
      return { top_flows: topFlows }
    
    case 'campaign_performance':
      const campaigns = context.campaigns || []
      const avgOpenRate = campaigns.reduce((s: number, c: any) => s + (c.open_rate || 0), 0) / campaigns.length
      const totalRevenue = campaigns.reduce((s: number, c: any) => s + (c.revenue || 0), 0)
      return {
        total_campaigns: campaigns.length,
        average_open_rate: avgOpenRate,
        total_revenue: totalRevenue,
        low_performers: campaigns.filter((c: any) => c.open_rate < 0.15).length
      }
    
    case 'optimization_tips':
      const flows = context.flows || []
      const smsFlows = flows.filter((f: any) => f.flow_name.toLowerCase().includes('sms'))
      const emailFlows = flows.filter((f: any) => !f.flow_name.toLowerCase().includes('sms'))
      return {
        sms_count: smsFlows.length,
        email_count: emailFlows.length,
        sms_avg_revenue: smsFlows.reduce((s: number, f: any) => s + f.revenue, 0) / smsFlows.length,
        email_avg_revenue: emailFlows.reduce((s: number, f: any) => s + f.revenue, 0) / emailFlows.length
      }
    
    default:
      return { flows: context.flows, campaigns: context.campaigns }
  }
}

// Fallback: Simple data analysis
function analyzeClientData(message: string, context: any): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('flow') && (lowerMessage.includes('top') || lowerMessage.includes('best'))) {
    const flows = context.flows || []
    if (flows.length === 0) return "No flow data available. Try syncing your data first."
    
    const topFlows = flows
      .sort((a: any, b: any) => (b.revenue || 0) - (a.revenue || 0))
      .slice(0, 5)
    
    let response = `Here are your top ${topFlows.length} performing flows:\n\n`
    topFlows.forEach((flow: any, idx: number) => {
      response += `${idx + 1}. **${flow.flow_name}**\n`
      response += `   - Revenue: $${(flow.revenue || 0).toLocaleString()}\n`
      response += `   - Opens: ${(flow.opens || 0).toLocaleString()} (${((flow.open_rate || 0) * 100).toFixed(1)}%)\n\n`
    })
    
    return response
  }

  return `I can help you analyze:\n- Top performing flows\n- Campaign performance\n- Optimization opportunities\n\nTry asking: "What are my top flows?" or "How are my campaigns doing?"`
}
