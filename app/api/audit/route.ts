import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

export async function POST(request: NextRequest) {
  console.log('🤖 AUDIT API: Starting AI audit...')
  
  try {
    const { clientSlug } = await request.json()
    
    if (!clientSlug) {
      return NextResponse.json({ error: 'Client slug is required' }, { status: 400 })
    }

    // Get client
    const client = await DatabaseService.getClientBySlug(clientSlug)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Check if audit is enabled for this client
    if (!client.audit_enabled) {
      return NextResponse.json({ 
        error: 'AI Audit is not enabled for this client',
        message: 'Contact your agency administrator to enable this feature'
      }, { status: 403 })
    }

    console.log(`🤖 AUDIT: Running audit for ${client.brand_name}`)

    // Gather comprehensive data for analysis
    const timeframe = 90 // Always analyze last 90 days
    const auditData = await gatherAuditData(client.id, timeframe)

    console.log('🤖 AUDIT: Data gathered, calling Claude API...')
    console.log('📊 Data summary:', {
      campaigns: auditData.campaigns.length,
      flows: auditData.flows.length,
      avgOpenRate: auditData.summary.campaigns.avgOpenRate
    })

    // Call Claude API for analysis
    const aiAnalysis = await analyzeWithClaude(client.brand_name, auditData)

    console.log('🤖 AUDIT: Claude analysis complete')
    console.log('📊 Analysis:', {
      score: aiAnalysis.overall_score,
      findings: aiAnalysis.findings?.length,
      strengths: aiAnalysis.strengths?.length
    })

    // Save audit results to database
    const auditResult = await saveAuditResults(client.id, timeframe, aiAnalysis, auditData)

    console.log('🤖 AUDIT: Saved to database, returning results')

    return NextResponse.json({
      success: true,
      audit: auditResult,
      message: 'AI audit completed successfully'
    })

  } catch (error: any) {
    console.error('🤖 AUDIT API: Error:', error)
    return NextResponse.json({
      error: 'Audit failed',
      message: error.message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientSlug = searchParams.get('clientSlug')
    
    if (!clientSlug) {
      return NextResponse.json({ error: 'Client slug is required' }, { status: 400 })
    }

    const client = await DatabaseService.getClientBySlug(clientSlug)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Get latest audit for this client
    const audit = await getLatestAudit(client.id)

    return NextResponse.json({
      success: true,
      audit,
      hasAudit: !!audit
    })

  } catch (error: any) {
    console.error('🤖 AUDIT API GET: Error:', error)
    return NextResponse.json({
      error: 'Failed to fetch audit',
      message: error.message
    }, { status: 500 })
  }
}

// Helper: Gather all data for audit
async function gatherAuditData(clientId: string, timeframe: number) {
  const [campaigns, flows, revenue, listGrowth, flowWeekly] = await Promise.all([
    DatabaseService.getRecentCampaignMetrics(clientId, timeframe),
    DatabaseService.getRecentFlowMetrics(clientId, timeframe),
    DatabaseService.getRevenueAttributionMetrics(clientId, timeframe),
    DatabaseService.getListGrowthMetrics(clientId, timeframe),
    DatabaseService.getFlowWeeklyTrends(clientId, timeframe)
  ])

  // Calculate summary statistics
  const summary = {
    campaigns: {
      total: campaigns.length,
      avgOpenRate: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + (c.open_rate || 0), 0) / campaigns.length : 0,
      avgClickRate: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + (c.click_rate || 0), 0) / campaigns.length : 0,
      totalRevenue: campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0),
      totalRecipients: campaigns.reduce((sum, c) => sum + (c.recipients_count || 0), 0),
      avgRevenuePerCampaign: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0) / campaigns.length : 0
    },
    flows: {
      total: flows.length,
      avgOpenRate: flows.length > 0 ? flows.reduce((sum, f) => sum + ((f.open_rate || 0) * 100), 0) / flows.length : 0,
      avgClickRate: flows.length > 0 ? flows.reduce((sum, f) => sum + ((f.click_rate || 0) * 100), 0) / flows.length : 0,
      totalRevenue: flows.reduce((sum, f) => sum + (f.revenue || 0), 0),
      flowNames: flows.map(f => f.flow_name?.toLowerCase() || '')
    },
    revenue: {
      totalEmailRevenue: revenue.reduce((sum, r) => sum + (r.email_revenue || 0), 0),
      totalSmsRevenue: revenue.reduce((sum, r) => sum + (r.sms_revenue || 0), 0),
      flowEmailRevenue: revenue.reduce((sum, r) => sum + (r.flow_email_revenue || 0), 0),
      campaignEmailRevenue: revenue.reduce((sum, r) => sum + (r.campaign_email_revenue || 0), 0)
    },
    listGrowth: {
      netGrowth: listGrowth.reduce((sum, lg) => sum + (lg.overall_net_growth || 0), 0),
      avgDailySubscriptions: listGrowth.length > 0 ? listGrowth.reduce((sum, lg) => sum + (lg.email_subscriptions || 0), 0) / listGrowth.length : 0,
      avgDailyUnsubscribes: listGrowth.length > 0 ? listGrowth.reduce((sum, lg) => sum + (lg.email_unsubscribes || 0), 0) / listGrowth.length : 0,
      avgChurnRate: listGrowth.length > 0 ? listGrowth.reduce((sum, lg) => sum + (lg.churn_rate || 0), 0) / listGrowth.length : 0
    }
  }

  // Analyze send times
  const sendTimeAnalysis = analyzeSendTimes(campaigns)
  
  // Analyze subject lines
  const subjectLineAnalysis = analyzeSubjectLines(campaigns)
  
  // Check for missing flows
  const missingFlows = checkMissingFlows(flows)

  return {
    summary,
    campaigns,
    flows,
    revenue,
    listGrowth,
    flowWeekly,
    sendTimeAnalysis,
    subjectLineAnalysis,
    missingFlows
  }
}

// Helper: Analyze send times
function analyzeSendTimes(campaigns: any[]) {
  const byDay: any = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] }
  const byHour: any = {}

  campaigns.forEach(c => {
    if (c.send_date) {
      const date = new Date(c.send_date)
      const day = date.toLocaleDateString('en-US', { weekday: 'short' })
      const hour = date.getHours()
      
      byDay[day].push(c.open_rate || 0)
      if (!byHour[hour]) byHour[hour] = []
      byHour[hour].push(c.open_rate || 0)
    }
  })

  // Calculate averages
  const avgByDay = Object.entries(byDay).map(([day, rates]: [string, any]) => ({
    day,
    avgOpenRate: rates.length > 0 ? rates.reduce((sum: number, r: number) => sum + r, 0) / rates.length * 100 : 0,
    count: rates.length
  })).sort((a, b) => b.avgOpenRate - a.avgOpenRate)

  const avgByHour = Object.entries(byHour).map(([hour, rates]: [string, any]) => ({
    hour: parseInt(hour),
    avgOpenRate: rates.length > 0 ? rates.reduce((sum: number, r: number) => sum + r, 0) / rates.length * 100 : 0,
    count: rates.length
  })).sort((a, b) => b.avgOpenRate - a.avgOpenRate)

  return {
    bestDays: avgByDay.slice(0, 3),
    worstDays: avgByDay.slice(-2),
    bestHours: avgByHour.slice(0, 3),
    worstHours: avgByHour.slice(-3)
  }
}

// Helper: Analyze subject lines
function analyzeSubjectLines(campaigns: any[]) {
  const withEmoji = campaigns.filter(c => /[\uD83C-\uDBFF\uDC00-\uDFFF]|[\u2600-\u27FF]/.test(c.subject_line || ''))
  const withoutEmoji = campaigns.filter(c => !/[\uD83C-\uDBFF\uDC00-\uDFFF]|[\u2600-\u27FF]/.test(c.subject_line || ''))
  
  const avgLength = campaigns.reduce((sum, c) => sum + (c.subject_line?.length || 0), 0) / campaigns.length
  
  const topPerformers = [...campaigns]
    .filter(c => c.open_rate > 0)
    .sort((a, b) => b.open_rate - a.open_rate)
    .slice(0, 5)
    .map(c => ({
      subject: c.subject_line,
      openRate: (c.open_rate * 100).toFixed(1),
      revenue: c.revenue
    }))

  return {
    avgLength: avgLength.toFixed(0),
    emojiPerformance: {
      withEmoji: withEmoji.length > 0 ? (withEmoji.reduce((sum, c) => sum + (c.open_rate || 0), 0) / withEmoji.length * 100).toFixed(1) : '0',
      withoutEmoji: withoutEmoji.length > 0 ? (withoutEmoji.reduce((sum, c) => sum + (c.open_rate || 0), 0) / withoutEmoji.length * 100).toFixed(1) : '0'
    },
    topPerformers
  }
}

// Helper: Check for missing flows
function checkMissingFlows(flows: any[]) {
  const flowNames = flows.map(f => f.flow_name?.toLowerCase() || '')
  const missing = []

  if (!flowNames.some(name => name.includes('cart') || name.includes('abandon'))) {
    missing.push('abandoned_cart')
  }
  if (!flowNames.some(name => name.includes('welcome'))) {
    missing.push('welcome_series')
  }
  if (!flowNames.some(name => name.includes('browse'))) {
    missing.push('browse_abandonment')
  }
  if (!flowNames.some(name => name.includes('post') && name.includes('purchase'))) {
    missing.push('post_purchase')
  }
  if (!flowNames.some(name => name.includes('win') && name.includes('back'))) {
    missing.push('winback')
  }

  return missing
}

// Helper: Call Claude API for analysis
async function analyzeWithClaude(brandName: string, auditData: any) {
  const prompt = buildAuditPrompt(brandName, auditData)
  
  console.log('🤖 Calling Claude API...')
  console.log('📝 Prompt length:', prompt.length, 'characters')

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    temperature: 0.7,
    messages: [{
      role: 'user',
      content: prompt
    }]
  })

  console.log('✅ Claude response received')
  console.log('📊 Tokens used:', message.usage.input_tokens, 'input,', message.usage.output_tokens, 'output')

  // Parse the JSON response
  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  
  // Extract JSON from response (Claude might wrap it in markdown)
  const jsonMatch = responseText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Could not parse Claude response as JSON')
  }

  const analysis = JSON.parse(jsonMatch[0])
  
  // Add token usage for cost tracking
  analysis._meta = {
    tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
    estimatedCost: (message.usage.input_tokens * 0.003 / 1000) + (message.usage.output_tokens * 0.015 / 1000)
  }

  return analysis
}

// Helper: Build comprehensive audit prompt
function buildAuditPrompt(brandName: string, data: any) {
  return `You are an expert email marketing consultant analyzing Klaviyo performance data for ${brandName}.

Provide a comprehensive marketing audit analyzing their last 90 days of email marketing performance.

CLIENT DATA:
===========

CAMPAIGN PERFORMANCE:
- Total campaigns: ${data.summary.campaigns.total}
- Average open rate: ${(data.summary.campaigns.avgOpenRate * 100).toFixed(1)}% (Industry benchmark: 33%)
- Average click rate: ${(data.summary.campaigns.avgClickRate * 100).toFixed(1)}% (Industry benchmark: 2.5%)
- Total revenue: $${data.summary.campaigns.totalRevenue.toLocaleString()}
- Revenue per campaign: $${data.summary.campaigns.avgRevenuePerCampaign.toFixed(0)}
- Total recipients: ${data.summary.campaigns.totalRecipients.toLocaleString()}

TOP 5 PERFORMING CAMPAIGNS:
${data.subjectLineAnalysis.topPerformers.map((c: any, i: number) => 
  `${i + 1}. "${c.subject}" - ${c.openRate}% OR, $${c.revenue} revenue`
).join('\n')}

SEND TIME ANALYSIS:
Best performing days: ${data.sendTimeAnalysis.bestDays.map((d: any) => `${d.day} (${d.avgOpenRate.toFixed(1)}% OR, ${d.count} campaigns)`).join(', ')}
Worst performing days: ${data.sendTimeAnalysis.worstDays.map((d: any) => `${d.day} (${d.avgOpenRate.toFixed(1)}% OR, ${d.count} campaigns)`).join(', ')}
Best performing hours: ${data.sendTimeAnalysis.bestHours.map((h: any) => `${h.hour}:00 (${h.avgOpenRate.toFixed(1)}% OR)`).join(', ')}

SUBJECT LINE ANALYSIS:
Average length: ${data.subjectLineAnalysis.avgLength} characters
With emoji: ${data.subjectLineAnalysis.emojiPerformance.withEmoji}% avg OR
Without emoji: ${data.subjectLineAnalysis.emojiPerformance.withoutEmoji}% avg OR

FLOW PERFORMANCE:
Active flows: ${data.summary.flows.total}
${data.flows.map((f: any) => `- ${f.flow_name}: ${((f.open_rate || 0) * 100).toFixed(1)}% OR, $${(f.revenue || 0).toLocaleString()} revenue`).join('\n')}

Average flow open rate: ${data.summary.flows.avgOpenRate.toFixed(1)}%
Average flow click rate: ${data.summary.flows.avgClickRate.toFixed(1)}%
Total flow revenue: $${data.summary.flows.totalRevenue.toLocaleString()}

MISSING FLOW TYPES:
${data.missingFlows.length > 0 ? data.missingFlows.join(', ') : 'None - all essential flows present'}

REVENUE ATTRIBUTION:
Email revenue: $${data.summary.revenue.totalEmailRevenue.toLocaleString()}
SMS revenue: $${data.summary.revenue.totalSmsRevenue.toLocaleString()}
Flow email revenue: $${data.summary.revenue.flowEmailRevenue.toLocaleString()}
Campaign email revenue: $${data.summary.revenue.campaignEmailRevenue.toLocaleString()}

LIST HEALTH:
Net growth (90 days): ${data.summary.listGrowth.netGrowth >= 0 ? '+' : ''}${data.summary.listGrowth.netGrowth}
Avg daily subscriptions: ${data.summary.listGrowth.avgDailySubscriptions.toFixed(0)}
Avg daily unsubscribes: ${data.summary.listGrowth.avgDailyUnsubscribes.toFixed(0)}
Avg churn rate: ${(data.summary.listGrowth.avgChurnRate * 100).toFixed(2)}% (Industry benchmark: ~2%)

TASK:
=====
Analyze this data and provide a comprehensive marketing audit in JSON format.

Your analysis should be:
1. SPECIFIC to this brand's actual data (not generic advice)
2. ACTIONABLE with concrete recommendations
3. PRIORITIZED by revenue impact
4. SUPPORTIVE - celebrate what's working well

Provide findings in these categories:
- HIGH PRIORITY: Revenue-impacting issues, missing flows, critical problems
- MEDIUM PRIORITY: Send time optimization, flow improvements, engagement opportunities  
- LOW PRIORITY: Minor tweaks, testing opportunities
- OPPORTUNITIES: Growth strategies, untapped potential
- STRENGTHS: What's working exceptionally well (celebrate wins!)

For EACH finding include:
- Clear title (max 60 chars)
- Severity: "high", "medium", or "low"
- Category: "flows", "campaigns", "timing", "subject_lines", "list_health", "revenue", "deliverability"
- Impact description with specific numbers
- Detailed analysis using their actual data
- 2-4 specific, actionable recommendations
- Expected improvement estimates
- Supporting data points

Return ONLY valid JSON in this exact structure:
{
  "overall_score": 8.4,
  "grade": "A-",
  "findings": [
    {
      "id": "finding_001",
      "severity": "high",
      "category": "flows",
      "title": "Missing Abandoned Cart Flow",
      "icon": "🚨",
      "impact": {
        "type": "revenue",
        "value": "$2,000-5,000/month potential",
        "confidence": "high"
      },
      "analysis": "Detailed explanation using their data...",
      "data_points": {
        "your_metric": "value",
        "industry_benchmark": "value"
      },
      "recommendations": [
        {
          "action": "Specific action to take",
          "details": "How to implement it",
          "expected_improvement": "Quantified expected result"
        }
      ]
    }
  ],
  "strengths": [
    {
      "id": "strength_001",
      "title": "Excellent Campaign Open Rates",
      "icon": "✨",
      "analysis": "Specific praise with data...",
      "data": "48% OR vs 33% industry avg"
    }
  ]
}

Be specific, data-driven, and actionable. Use their actual numbers. Estimate revenue impact where possible.`
}

// Helper: Save audit to database
async function saveAuditResults(clientId: string, timeframe: number, analysis: any, auditData: any) {
  const { supabaseAdmin } = await import('@/lib/supabase')
  
  const { data, error } = await supabaseAdmin
    .from('audit_results')
    .insert({
      client_id: clientId,
      audit_date: new Date().toISOString(),
      timeframe_days: timeframe,
      overall_score: analysis.overall_score || null,
      grade: analysis.grade || null,
      findings: analysis.findings || [],
      strengths: analysis.strengths || [],
      high_priority_count: analysis.findings?.filter((f: any) => f.severity === 'high').length || 0,
      medium_priority_count: analysis.findings?.filter((f: any) => f.severity === 'medium').length || 0,
      low_priority_count: analysis.findings?.filter((f: any) => f.severity === 'low').length || 0,
      opportunities_count: analysis.findings?.filter((f: any) => f.category === 'opportunities').length || 0,
      strengths_count: analysis.strengths?.length || 0,
      data_summary: auditData.summary,
      tokens_used: analysis._meta?.tokensUsed || null,
      api_cost_usd: analysis._meta?.estimatedCost || null
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving audit:', error)
    throw error
  }

  return data
}

// Helper: Get latest audit
async function getLatestAudit(clientId: string) {
  const { supabaseAdmin } = await import('@/lib/supabase')
  
  const { data, error } = await supabaseAdmin
    .from('audit_results')
    .select('*')
    .eq('client_id', clientId)
    .order('audit_date', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
    console.error('Error fetching audit:', error)
    return null
  }

  return data
}

