import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { KlaviyoAPI } from '@/lib/klaviyo-api'
import Anthropic from '@anthropic-ai/sdk'

/*
 * AI Assistant API - Claude with Direct Klaviyo API
 * 
 * Uses Klaviyo REST API directly for rich data access.
 * Same data as MCP tools, but serverless-friendly!
 * 
 * Why not MCP?
 * - MCP is designed for desktop AI clients (Claude Desktop, Cursor IDE)
 * - Requires spawning processes (doesn't work in serverless)
 * - MCP tools just call Klaviyo REST APIs anyway
 * - We call those APIs directly = same data, simpler architecture
 */

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { clientSlug, clientId, message, context } = await request.json()

    console.log('🤖 AI Assistant: Processing request for client:', clientSlug)

    // Get client's Klaviyo API key
    const client = await DatabaseService.getClientBySlug(clientSlug)
    if (!client || !client.klaviyo_api_key) {
      throw new Error('Client not found or missing Klaviyo API key')
    }

    // Initialize Klaviyo API client
    const klaviyo = new KlaviyoAPI(client.klaviyo_api_key)

    // Prepare system prompt
    const systemPrompt = `You are an AI assistant for ${client.brand_name}'s email marketing analytics dashboard.

You have access to Klaviyo tools that provide detailed performance data:
- get_flows: List all flows with metadata
- get_flow_report: Detailed flow performance with rich metrics
- get_campaigns: List all campaigns
- get_campaign_report: Detailed campaign performance
- get_account_details: Account information
- analyze_dashboard_data: Quick analysis of already-loaded data

Dashboard Context (for quick reference):
- Active Flows: ${context.flows?.length || 0}
- Recent Campaigns: ${context.campaigns?.length || 0}
- Total Flow Revenue: $${context.flows?.reduce((s: number, f: any) => s + (f.revenue || 0), 0).toLocaleString() || 0}

Use Klaviyo tools when you need:
- Complete lists of flows/campaigns
- Detailed performance reports
- Specific flow or campaign data

Use analyze_dashboard_data when:
- Question can be answered from loaded context
- Quick summary needed
- Comparing top performers

Provide insights with:
- Specific numbers and percentages
- Actionable recommendations
- Industry benchmark comparisons (20-25% open rate is good)
- Bold formatting and emojis for readability

Be concise but thorough.`

    console.log('🤖 AI Assistant: Calling Claude API...')

    // Call Claude with tool definitions
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
          description: 'Get list of all flows from Klaviyo with names, statuses, IDs, and metadata.',
          input_schema: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'get_flow_report',
          description: 'Get detailed performance report for specific flows including opens, clicks, revenue, conversions, and trends. This is rich reporting data.',
          input_schema: {
            type: 'object',
            properties: {
              flow_ids: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of Klaviyo flow IDs to get reports for (get from get_flows first)'
              }
            },
            required: ['flow_ids']
          }
        },
        {
          name: 'get_campaigns',
          description: 'Get list of all campaigns from Klaviyo with names, send dates, statuses, and IDs.',
          input_schema: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'get_campaign_report',
          description: 'Get detailed performance report for specific campaigns including opens, clicks, revenue, deliverability metrics.',
          input_schema: {
            type: 'object',
            properties: {
              campaign_ids: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of Klaviyo campaign IDs (get from get_campaigns first)'
              }
            },
            required: ['campaign_ids']
          }
        },
        {
          name: 'get_account_details',
          description: 'Get Klaviyo account information including name, timezone, and settings.',
          input_schema: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'analyze_dashboard_data',
          description: 'Quickly analyze dashboard data already loaded (flows, campaigns). Fast for top performers, comparisons, summaries.',
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

    // Handle tool use loop
    let finalResponse = response
    let toolUseCount = 0
    const maxToolUses = 5

    while (finalResponse.stop_reason === 'tool_use' && toolUseCount < maxToolUses) {
      toolUseCount++
      console.log(`🤖 AI Assistant: Claude requested tools (${toolUseCount}/${maxToolUses})`)

      const toolUseBlocks = finalResponse.content.filter((block: any) => block.type === 'tool_use') as any[]
      const toolResults = []

      for (const toolUse of toolUseBlocks) {
        console.log(`🔧 Executing tool: ${toolUse.name}`)
        
        let toolResult
        try {
          toolResult = await executeTool(
            toolUse.name, 
            toolUse.input, 
            klaviyo,
            context
          )
        } catch (error: any) {
          console.error(`❌ Tool execution error:`, error)
          toolResult = { error: error.message }
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(toolResult)
        })
      }

      // Continue conversation with tool results
      const messages: any[] = [
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
        messages: messages,
        tools: response.content.filter((block: any) => block.type === 'tool_use').length > 0 
          ? undefined // Don't redefine tools on follow-up
          : undefined
      })
    }

    // Extract final response
    const responseText = finalResponse.content
      .filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join('\n')

    console.log('✅ AI Assistant: Response complete')

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
    console.error('❌ AI Assistant error:', error)
    
    // Fall back to dashboard data analysis
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
        error: 'Failed to process request',
        response: 'Sorry, I encountered an error. Please try again.'
      }, { status: 500 })
    }
  }
}

// Execute tool calls using Klaviyo API
async function executeTool(
  toolName: string, 
  input: any, 
  klaviyo: KlaviyoAPI,
  context: any
): Promise<any> {
  console.log(`🔧 Tool: ${toolName}`, input)

  switch (toolName) {
    case 'get_flows':
      return await klaviyo.getFlows()
    
    case 'get_flow_report':
      return await klaviyo.getFlowReport(input.flow_ids)
    
    case 'get_campaigns':
      return await klaviyo.getCampaigns()
    
    case 'get_campaign_report':
      return await klaviyo.getCampaignReport(input.campaign_ids)
    
    case 'get_account_details':
      return await klaviyo.getAccountDetails()
    
    case 'analyze_dashboard_data':
      return analyzeDashboardData(input.analysis_type, context)
    
    default:
      throw new Error(`Unknown tool: ${toolName}`)
  }
}

// Quick dashboard data analysis (no API needed)
function analyzeDashboardData(analysisType: string, context: any) {
  switch (analysisType) {
    case 'top_flows':
      const topFlows = (context.flows || [])
        .sort((a: any, b: any) => (b.revenue || 0) - (a.revenue || 0))
        .slice(0, 10)
        .map((f: any) => ({
          id: f.flow_id,
          name: f.flow_name,
          revenue: f.revenue,
          opens: f.opens,
          open_rate: f.open_rate
        }))
      return { top_flows: topFlows }
    
    case 'campaign_performance':
      const campaigns = context.campaigns || []
      return {
        total: campaigns.length,
        avg_open_rate: campaigns.reduce((s: number, c: any) => s + (c.open_rate || 0), 0) / (campaigns.length || 1),
        total_revenue: campaigns.reduce((s: number, c: any) => s + (c.revenue || 0), 0),
        low_performers: campaigns.filter((c: any) => c.open_rate < 0.15).length
      }
    
    case 'optimization_tips':
      const flows = context.flows || []
      const smsFlows = flows.filter((f: any) => f.flow_name.toLowerCase().includes('sms'))
      const emailFlows = flows.filter((f: any) => !f.flow_name.toLowerCase().includes('sms'))
      return {
        sms_count: smsFlows.length,
        email_count: emailFlows.length,
        sms_avg_revenue: smsFlows.reduce((s: number, f: any) => s + (f.revenue || 0), 0) / (smsFlows.length || 1),
        email_avg_revenue: emailFlows.reduce((s: number, f: any) => s + (f.revenue || 0), 0) / (emailFlows.length || 1)
      }
    
    default:
      return { flows: context.flows, campaigns: context.campaigns }
  }
}

// Fallback: Simple analysis without AI
function analyzeClientData(message: string, context: any): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('flow') && (lowerMessage.includes('top') || lowerMessage.includes('best'))) {
    const flows = context.flows || []
    if (flows.length === 0) return "No flow data available. Try syncing your data first."
    
    const topFlows = flows
      .sort((a: any, b: any) => (b.revenue || 0) - (a.revenue || 0))
      .slice(0, 5)
    
    let response = `Here are your top ${topFlows.length} performing flows by revenue:\n\n`
    topFlows.forEach((flow: any, idx: number) => {
      response += `${idx + 1}. **${flow.flow_name}**\n`
      response += `   - Revenue: $${(flow.revenue || 0).toLocaleString()}\n`
      response += `   - Opens: ${(flow.opens || 0).toLocaleString()} (${((flow.open_rate || 0) * 100).toFixed(1)}%)\n\n`
    })
    
    return response
  }

  return `I can help analyze flows, campaigns, and provide optimization tips.\n\nTry asking:\n• "What are my top performing flows?"\n• "Show me campaign performance"\n• "Give me optimization recommendations"`
}
