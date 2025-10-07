import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

export async function POST(request: NextRequest) {
  console.log('🤖 SUBJECT LINE AI: Starting analysis...')
  
  try {
    const { clientSlug, timeframe = 90 } = await request.json()
    
    if (!clientSlug) {
      return NextResponse.json({ error: 'Client slug is required' }, { status: 400 })
    }

    const client = await DatabaseService.getClientBySlug(clientSlug)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    console.log(`🤖 Analyzing subject lines for ${client.brand_name}`)

    // Get campaign data
    const campaigns = await DatabaseService.getRecentCampaignMetrics(client.id, timeframe)
    
    if (campaigns.length === 0) {
      return NextResponse.json({ 
        error: 'No campaign data available',
        message: 'Sync campaigns first to get AI insights'
      }, { status: 400 })
    }

    // Prepare data for Claude
    const campaignData = campaigns
      .filter(c => c.subject_line && c.open_rate > 0)
      .map(c => ({
        subject: c.subject_line,
        openRate: (c.open_rate * 100).toFixed(1),
        clickRate: (c.click_rate * 100).toFixed(1),
        revenue: c.revenue,
        sendDate: c.send_date
      }))
      .sort((a, b) => parseFloat(b.openRate) - parseFloat(a.openRate))

    const topPerformers = campaignData.slice(0, 10)
    const bottomPerformers = campaignData.slice(-10).reverse()

    console.log('🤖 Calling Claude for subject line analysis...')

    const prompt = `You are an email marketing expert analyzing subject line performance for ${client.brand_name}.

SUBJECT LINE DATA (Last ${timeframe} days):

TOP 10 PERFORMING SUBJECT LINES:
${topPerformers.map((c, i) => `${i + 1}. "${c.subject}" - ${c.openRate}% OR, ${c.clickRate}% CTR, $${c.revenue} revenue`).join('\n')}

BOTTOM 10 PERFORMING SUBJECT LINES:
${bottomPerformers.map((c, i) => `${i + 1}. "${c.subject}" - ${c.openRate}% OR, ${c.clickRate}% CTR, $${c.revenue} revenue`).join('\n')}

TASK:
Analyze the patterns in high-performing vs low-performing subject lines for THIS SPECIFIC BRAND.

Identify:
1. What patterns/characteristics do top performers share?
2. What patterns/characteristics do bottom performers share?
3. Specific, actionable recommendations for improving subject lines
4. Example subject line formulas that work for this brand
5. Things to avoid based on their data

Be SPECIFIC to this brand's data. Don't give generic advice.

Return as JSON:
{
  "summary": "2-3 sentence overview of findings",
  "top_patterns": [
    {
      "pattern": "Short subject lines (under 40 chars)",
      "evidence": "7 out of top 10 are under 40 chars",
      "avg_performance": "52% OR vs 38% for longer"
    }
  ],
  "avoid_patterns": [
    {
      "pattern": "Using emoji",
      "evidence": "8 out of bottom 10 have emoji",
      "avg_performance": "28% OR vs 48% without emoji"
    }
  ],
  "recommendations": [
    {
      "action": "Keep subject lines under 40 characters",
      "why": "Your audience responds better to concise subjects",
      "expected_improvement": "+10-15% open rate",
      "examples": [
        "Your October Favorites",
        "New Arrivals Inside"
      ]
    }
  ],
  "winning_formula": "Pattern description based on their top performers",
  "examples": [
    {
      "scenario": "Product launch",
      "subject": "Example based on their style",
      "why": "Uses patterns from their top performers"
    }
  ]
}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    
    if (!jsonMatch) {
      throw new Error('Could not parse Claude response')
    }

    const insights = JSON.parse(jsonMatch[0])

    console.log('✅ Subject line AI analysis complete')

    return NextResponse.json({
      success: true,
      insights,
      meta: {
        campaigns_analyzed: campaigns.length,
        tokens_used: message.usage.input_tokens + message.usage.output_tokens,
        cost: (message.usage.input_tokens * 0.003 / 1000) + (message.usage.output_tokens * 0.015 / 1000)
      }
    })

  } catch (error: any) {
    console.error('🤖 SUBJECT LINE AI: Error:', error)
    return NextResponse.json({
      error: 'AI analysis failed',
      message: error.message
    }, { status: 500 })
  }
}

