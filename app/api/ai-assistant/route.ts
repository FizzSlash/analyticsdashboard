import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { mcpClientPool } from '@/lib/klaviyo-mcp-client'
import Anthropic from '@anthropic-ai/sdk'

/*
 * AI Assistant API - Claude with Real Klaviyo MCP Server
 * 
 * Uses local Klaviyo MCP server for rich data access via MCP protocol.
 * Claude decides what tools to call, we execute via MCP, Claude analyzes results.
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

    // Prepare system prompt
    const systemPrompt = `You are an AI assistant for ${client.brand_name}'s email marketing analytics dashboard.

You have access to Klaviyo MCP tools that provide detailed performance data:
- get_flows: List all flows
- get_flow_report: Detailed flow performance with message-level data
- get_campaigns: List all campaigns  
- get_campaign_report: Detailed campaign performance
- get_account_details: Account information
- analyze_dashboard_data: Quick analysis of already-loaded data

Dashboard Context (for quick reference):
- Active Flows: ${context.flows?.length || 0}
- Recent Campaigns: ${context.campaigns?.length || 0}
- Total Flow Revenue: $${context.flows?.reduce((s: number, f: any) => s + (f.revenue || 0), 0).toLocaleString() || 0}

Use MCP tools when you need:
- Detailed performance reports
- Specific flow/campaign data
- Complete lists from Klaviyo

Use analyze_dashboard_data when:
- Question can be answered from loaded context
- User wants quick summary
- Comparing top performers

Provide insights with:
- Specific numbers and percentages
- Actionable recommendations
- Industry benchmark comparisons (20-25% open rate is good)
- Bold formatting for emphasis

Be concise but thorough.`

    console.log('🤖 AI Assistant: Calling Claude API with MCP tools...')

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
          description: 'Get list of all flows with names, statuses, and IDs. Use this to see what flows exist.',
          input_schema: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'get_flow_report',
          description: 'Get detailed performance report for a specific flow including all messages, opens, clicks, revenue, conversion rates, and trends over time.',
          input_schema: {
            type: 'object',
            properties: {
              flow_id: {
                type: 'string',
                description: 'The Klaviyo flow ID (get from get_flows first)'
              }
            },
            required: ['flow_id']
          }
        },
        {
          name: 'get_campaigns',
          description: 'Get list of all campaigns with names, send dates, statuses, and IDs.',
          input_schema: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'get_campaign_report',
          description: 'Get detailed performance report for a specific campaign including sends, opens, clicks, revenue, and deliverability metrics.',
          input_schema: {
            type: 'object',
            properties: {
              campaign_id: {
                type: 'string',
                description: 'The Klaviyo campaign ID (get from get_campaigns first)'
              }
            },
            required: ['campaign_id']
          }
        },
        {
          name: 'get_account_details',
          description: 'Get Klaviyo account information including account name, timezone, and settings.',
          input_schema: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'analyze_dashboard_data',
          description: 'Quickly analyze the dashboard data that is already loaded (flows, campaigns, metrics). Fast but less detailed than MCP reports. Use for top performers, comparisons, or quick summaries.',
          input_schema: {
            type: 'object',
            properties: {
              analysis_type: {
                type: 'string',
                enum: ['top_flows', 'campaign_performance', 'optimization_tips', 'comparison'],
                description: 'Type of analysis to perform on loaded data'
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
    const maxToolUses = 5 // Allow more tool uses for complex queries
    const mcpClient = await mcpClientPool.getClient(client.klaviyo_api_key)

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
            mcpClient,
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
        tools: finalResponse.content.filter((block: any) => block.type === 'tool_use').length > 0 ? 
          // Keep tools available for follow-up calls
          response.content.filter((block: any) => block.type === 'tool_use').map(() => ({
            name: 'dummy', // Placeholder
            input_schema: { type: 'object', properties: {} }
          })) : undefined
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

// Execute tool calls using MCP client or dashboard analysis
async function executeTool(
  toolName: string, 
  input: any, 
  mcpClient: any,
  context: any
): Promise<any> {
  console.log(`🔧 Tool: ${toolName}`, input)

  switch (toolName) {
    case 'get_flows':
      return await mcpClient.getFlows()
    
    case 'get_flow_report':
      return await mcpClient.getFlowReport(input.flow_id)
    
    case 'get_campaigns':
      return await mcpClient.getCampaigns()
    
    case 'get_campaign_report':
      return await mcpClient.getCampaignReport(input.campaign_id)
    
    case 'get_account_details':
      return await mcpClient.getAccountDetails()
    
    case 'analyze_dashboard_data':
      return analyzeDashboardData(input.analysis_type, context)
    
    default:
      throw new Error(`Unknown tool: ${toolName}`)
  }
}

// Quick dashboard data analysis (no MCP needed)
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
        avg_open_rate: campaigns.reduce((s: number, c: any) => s + (c.open_rate || 0), 0) / campaigns.length,
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
    if (flows.length === 0) return "No flow data available."
    
    const topFlows = flows
      .sort((a: any, b: any) => (b.revenue || 0) - (a.revenue || 0))
      .slice(0, 5)
    
    let response = `Top ${topFlows.length} flows:\n\n`
    topFlows.forEach((flow: any, idx: number) => {
      response += `${idx + 1}. **${flow.flow_name}**\n`
      response += `   Revenue: $${(flow.revenue || 0).toLocaleString()}\n`
      response += `   Opens: ${(flow.opens || 0).toLocaleString()} (${((flow.open_rate || 0) * 100).toFixed(1)}%)\n\n`
    })
    
    return response
  }

  return `I can help analyze flows, campaigns, and provide optimization tips. Try asking:\n- "What are my top flows?"\n- "Show me campaign performance"\n- "Give me optimization recommendations"`
}
