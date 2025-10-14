import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

// Klaviyo MCP Server endpoint
// NOTE: This endpoint may need adjustment based on Klaviyo's actual MCP API
// See: https://developers.klaviyo.com/en/docs/klaviyo_mcp_server
const MCP_SERVER_URL = 'https://mcp.klaviyo.com/mcp'

export async function POST(request: NextRequest) {
  try {
    const { clientSlug, clientId, message, context } = await request.json()

    console.log('🤖 AI Assistant: Processing request for client:', clientSlug)

    // Get client's Klaviyo API key from database
    const client = await DatabaseService.getClientBySlug(clientSlug)
    if (!client || !client.klaviyo_api_key) {
      throw new Error('Client not found or missing Klaviyo API key')
    }

    // Prepare context data to help AI understand the query
    const contextData = prepareContextData(context)
    
    // Build the AI prompt with context
    const enrichedPrompt = `${message}

Context about the client's data:
${contextData}

Please provide a clear, data-driven answer based on the context above.`

    console.log('🤖 AI Assistant: Calling Klaviyo MCP server...')

    // Call Klaviyo MCP Server with proper authentication
    const mcpResponse = await fetch(MCP_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Klaviyo-API-Key ${client.klaviyo_api_key}`
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: 'query_assistant',
          arguments: {
            query: enrichedPrompt,
            context: {
              client_id: clientId,
              flows_count: context.flows?.length || 0,
              campaigns_count: context.campaigns?.length || 0,
              total_flow_revenue: context.flows?.reduce((sum: number, f: any) => sum + (f.revenue || 0), 0) || 0,
              total_campaign_revenue: context.campaigns?.reduce((sum: number, c: any) => sum + (c.revenue || 0), 0) || 0
            }
          }
        }
      })
    })

    if (!mcpResponse.ok) {
      console.error('🤖 AI Assistant: MCP server error:', mcpResponse.status, mcpResponse.statusText)
      throw new Error(`MCP server returned ${mcpResponse.status}`)
    }

    const mcpData = await mcpResponse.json()
    
    console.log('🤖 AI Assistant: Got response from MCP server')

    // Extract the AI response
    const aiResponse = mcpData.result?.content?.[0]?.text || mcpData.result?.response || 'I apologize, but I was unable to generate a response. Please try rephrasing your question.'

    return NextResponse.json({
      success: true,
      response: aiResponse
    })
  } catch (error) {
    console.error('🤖 AI Assistant API error:', error)
    
    // Fallback to intelligent mock response if MCP fails
    const { message, context } = await request.json()
    const fallbackResponse = generateIntelligentFallback(message, context, error)
    
    return NextResponse.json({
      success: true,
      response: fallbackResponse,
      fallback: true
    })
  }
}

// Prepare context data in a readable format for the AI
function prepareContextData(context: any): string {
  const parts: string[] = []

  // Flow data
  if (context.flows && context.flows.length > 0) {
    const topFlows = context.flows
      .sort((a: any, b: any) => (b.revenue || 0) - (a.revenue || 0))
      .slice(0, 10)
    
    parts.push(`Top Flows by Revenue:`)
    topFlows.forEach((flow: any, idx: number) => {
      parts.push(`${idx + 1}. ${flow.flow_name}: $${(flow.revenue || 0).toLocaleString()} revenue, ${flow.opens || 0} opens, ${((flow.open_rate || 0) * 100).toFixed(1)}% open rate`)
    })
  }

  // Campaign data
  if (context.campaigns && context.campaigns.length > 0) {
    const recentCampaigns = context.campaigns.slice(0, 5)
    parts.push(`\nRecent Campaigns:`)
    recentCampaigns.forEach((campaign: any, idx: number) => {
      parts.push(`${idx + 1}. ${campaign.campaign_name}: $${(campaign.revenue || 0).toLocaleString()} revenue, ${((campaign.open_rate || 0) * 100).toFixed(1)}% open rate`)
    })
  }

  // Summary stats
  if (context.summary) {
    parts.push(`\nOverall Performance:`)
    parts.push(`- Total Revenue: $${(context.summary.total_revenue || 0).toLocaleString()}`)
    parts.push(`- Campaigns Sent: ${context.summary.campaigns_sent || 0}`)
    parts.push(`- Active Flows: ${context.flows?.length || 0}`)
  }

  return parts.join('\n')
}

// Intelligent fallback that uses actual data when MCP fails
function generateIntelligentFallback(message: string, context: any, error: any): string {
  console.log('🤖 AI Assistant: Using intelligent fallback due to error:', error.message)
  
  const lowerMessage = message.toLowerCase()

  // Analyze actual flow data
  if (lowerMessage.includes('flow') && (lowerMessage.includes('top') || lowerMessage.includes('best') || lowerMessage.includes('performing'))) {
    const flows = context.flows || []
    if (flows.length === 0) return "I don't see any flow data available yet. Try syncing your data first."
    
    const topFlows = flows
      .sort((a: any, b: any) => (b.revenue || 0) - (a.revenue || 0))
      .slice(0, 5)
    
    let response = `Based on your data, here are your top ${topFlows.length} performing flows by revenue:\n\n`
    
    topFlows.forEach((flow: any, idx: number) => {
      const revenue = flow.revenue || 0
      const opens = flow.opens || 0
      const openRate = ((flow.open_rate || 0) * 100).toFixed(1)
      
      response += `${idx + 1}. **${flow.flow_name}**\n`
      response += `   - Revenue: $${revenue.toLocaleString()}\n`
      response += `   - Opens: ${opens.toLocaleString()} (${openRate}% open rate)\n\n`
    })
    
    // Add insight
    const topFlow = topFlows[0]
    const flowType = topFlow.flow_name.toLowerCase().includes('sms') ? 'SMS' : 'Email'
    response += `💡 **Insight**: Your top performer is ${flowType}-based. `
    
    if (flowType === 'SMS' && topFlows.some((f: any) => !f.flow_name.toLowerCase().includes('sms'))) {
      response += `SMS flows are outperforming email flows - consider testing SMS variants for other high-value flows.`
    }
    
    return response
  }

  // Analyze campaign performance
  if (lowerMessage.includes('campaign')) {
    const campaigns = context.campaigns || []
    if (campaigns.length === 0) return "I don't see any campaign data available yet. Try syncing your data first."
    
    const avgOpenRate = campaigns.reduce((sum: number, c: any) => sum + (c.open_rate || 0), 0) / campaigns.length
    const totalRevenue = campaigns.reduce((sum: number, c: any) => sum + (c.revenue || 0), 0)
    const lowPerformers = campaigns.filter((c: any) => (c.open_rate || 0) < 0.15).length
    
    return `Looking at your ${campaigns.length} campaigns:\n\n` +
           `📊 **Performance Metrics:**\n` +
           `- Average Open Rate: ${(avgOpenRate * 100).toFixed(1)}% ${avgOpenRate > 0.20 ? '✅ (Above average)' : '⚠️ (Below average)'}\n` +
           `- Total Revenue: $${totalRevenue.toLocaleString()}\n` +
           `- ${lowPerformers} campaigns with <15% open rate\n\n` +
           `${lowPerformers > 0 ? `⚠️ **Action Needed**: ${lowPerformers} campaigns may need subject line or send time optimization.\n\n` : ''}` +
           `💡 **Tip**: Review your top performing subject lines and replicate their patterns in future campaigns.`
  }

  // Optimization recommendations
  if (lowerMessage.includes('optim') || lowerMessage.includes('improve') || lowerMessage.includes('tips')) {
    const flows = context.flows || []
    const campaigns = context.campaigns || []
    
    const hasData = flows.length > 0 || campaigns.length > 0
    if (!hasData) return "Sync your data first so I can provide personalized optimization recommendations."
    
    let recommendations: string[] = []
    
    // Check for SMS opportunity
    const smsFlows = flows.filter((f: any) => f.flow_name.toLowerCase().includes('sms'))
    const emailFlows = flows.filter((f: any) => !f.flow_name.toLowerCase().includes('sms'))
    const avgSmsRevenue = smsFlows.length > 0 ? smsFlows.reduce((s: number, f: any) => s + (f.revenue || 0), 0) / smsFlows.length : 0
    const avgEmailRevenue = emailFlows.length > 0 ? emailFlows.reduce((s: number, f: any) => s + (f.revenue || 0), 0) / emailFlows.length : 0
    
    if (avgSmsRevenue > avgEmailRevenue * 1.5) {
      recommendations.push(
        `📱 **Add SMS to More Flows**\n` +
        `Your SMS flows generate ${((avgSmsRevenue / avgEmailRevenue) - 1) * 100}% more revenue than email flows on average. ` +
        `Consider adding SMS messages to your highest-traffic email flows.`
      )
    }
    
    // Check for low open rates
    const lowOpenRateCampaigns = campaigns.filter((c: any) => (c.open_rate || 0) < 0.15).length
    if (lowOpenRateCampaigns > campaigns.length * 0.3) {
      recommendations.push(
        `✉️ **Improve Subject Lines**\n` +
        `${lowOpenRateCampaigns} campaigns have below 15% open rate. Test:\n` +
        `- Personalization (use first names)\n` +
        `- Urgency (limited time offers)\n` +
        `- Curiosity (ask questions)`
      )
    }
    
    // General recommendation
    recommendations.push(
      `📊 **Optimize Send Times**\n` +
      `Test sending campaigns Tuesday-Thursday, 10am-2pm for optimal engagement. ` +
      `Avoid weekends and late evenings.`
    )
    
    return `Here are ${recommendations.length} optimization opportunities based on your data:\n\n` +
           recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n\n')
  }

  // Default fallback
  return `I understand you're asking about "${message}".\n\n` +
         `I can help you with:\n` +
         `- Analyzing flow and campaign performance\n` +
         `- Identifying optimization opportunities\n` +
         `- Comparing metrics across timeframes\n` +
         `- Finding underperforming segments\n\n` +
         `Try asking:\n` +
         `• "What are my top performing flows?"\n` +
         `• "Show me recent campaign performance"\n` +
         `• "Give me optimization recommendations"`
}
