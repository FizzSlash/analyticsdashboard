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

    // Prepare data for Claude with recipient context
    const campaignData = campaigns
      .filter(c => c.subject_line && (c.open_rate || 0) > 0)
      .map(c => ({
        subject: c.subject_line || '',
        openRate: ((c.open_rate || 0) * 100).toFixed(1),
        clickRate: ((c.click_rate || 0) * 100).toFixed(1),
        revenue: c.revenue || 0,
        recipients: c.recipients_count || 0,  // Include recipient count
        sendDate: c.send_date || ''
      }))
      .sort((a, b) => parseFloat(b.openRate) - parseFloat(a.openRate))

    const topPerformers = campaignData.slice(0, 10)
    const bottomPerformers = campaignData.slice(-10).reverse()
    
    // Calculate average recipients for context
    const avgRecipients = Math.round(
      campaignData.reduce((sum, c) => sum + c.recipients, 0) / campaignData.length
    )
    const medianRecipients = campaignData.length > 0 ? 
      campaignData.sort((a, b) => a.recipients - b.recipients)[Math.floor(campaignData.length / 2)].recipients : 0

    console.log('🤖 Calling Claude for subject line analysis...')

    const prompt = `You are an email marketing expert analyzing subject line performance for ${client.brand_name}.

SUBJECT LINE DATA (Last ${timeframe} days):

AUDIENCE CONTEXT:
- Average recipients per campaign: ${avgRecipients.toLocaleString()}
- Median recipients: ${medianRecipients.toLocaleString()}
- Total campaigns analyzed: ${campaignData.length}

IMPORTANT: When analyzing performance, consider:
- Campaigns to smaller audiences (high-intent segments) naturally have higher open rates
- Campaigns to larger audiences (broader lists) naturally have lower open rates
- A 40% OR to 5,000 people may indicate better subject line quality than 60% OR to 500 people
- Look for patterns WITHIN similar audience sizes, not across different sizes

TOP 10 PERFORMING SUBJECT LINES:
${topPerformers.map((c, i) => `${i + 1}. "${c.subject}" - ${c.openRate}% OR, ${c.clickRate}% CTR, $${c.revenue} revenue, ${c.recipients.toLocaleString()} recipients`).join('\n')}

BOTTOM 10 PERFORMING SUBJECT LINES:
${bottomPerformers.map((c, i) => `${i + 1}. "${c.subject}" - ${c.openRate}% OR, ${c.clickRate}% CTR, $${c.revenue} revenue, ${c.recipients.toLocaleString()} recipients`).join('\n')}

TASK:
Analyze the patterns in high-performing vs low-performing subject lines for THIS SPECIFIC BRAND.

When analyzing, ACCOUNT FOR AUDIENCE SIZE:
- Note if top performers are to smaller (high-intent) vs larger (broad) audiences
- Compare campaigns within similar audience size brackets when possible
- If a pattern only works for small audiences, mention that caveat
- Example: "Short subjects work well for your larger broadcasts (5k+ recipients)"

Identify:
1. What patterns/characteristics do top performers share?
   - Note audience sizes for context
2. What patterns/characteristics do bottom performers share?
   - Note if they're to different audience sizes
3. Specific, actionable recommendations for improving subject lines
   - Specify if recommendations apply to all campaigns or just certain audience sizes
4. Example subject line formulas that work for this brand
   - Note optimal audience size for each formula
5. Things to avoid based on their data
   - Call out if bad patterns are audience-size dependent

CRITICAL FOR EXPECTED_IMPROVEMENT:
- Use PERCENTAGE POINTS, not relative percentages
- If current open rate is 50%, a "+5 percentage points" improvement = 55% (NOT 75%)
- Be CONSERVATIVE: Subject line changes typically improve open rates by 2-8 percentage points max
- Format example: "+3-5 percentage points (e.g., 50% → 53-55%)" or "+2-4 points"
- NEVER suggest improvements over 10 percentage points - that's unrealistic
- If a change could take someone from 30% to 35%, say "+5 percentage points" NOT "+17% improvement"

Be SPECIFIC to this brand's data. Don't give generic advice. Consider audience segmentation in your analysis.

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
      "expected_improvement": "+3-5 percentage points (e.g., 50% → 53-55%)",
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

    // Save to database
    const { supabaseAdmin } = await import('@/lib/supabase')
    const { data: savedInsight, error: saveError } = await supabaseAdmin
      .from('subject_line_insights')
      .insert({
        client_id: client.id,
        timeframe_days: timeframe,
        campaigns_analyzed: campaigns.length,
        insights,
        tokens_used: message.usage.input_tokens + message.usage.output_tokens,
        api_cost_usd: (message.usage.input_tokens * 0.003 / 1000) + (message.usage.output_tokens * 0.015 / 1000)
      })
      .select()
      .single()

    if (saveError) {
      console.error('Failed to save insights to database:', saveError)
    } else {
      console.log('💾 Saved subject line insights to database')
    }

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

// GET endpoint - Load cached insights from database
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientSlug = searchParams.get('clientSlug')
    
    if (!clientSlug) {
      return NextResponse.json({ error: 'Client slug required' }, { status: 400 })
    }

    const client = await DatabaseService.getClientBySlug(clientSlug)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Get latest insights from database
    const { supabaseAdmin } = await import('@/lib/supabase')
    const { data, error } = await supabaseAdmin
      .from('subject_line_insights')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching insights:', error)
      return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      insights: data?.insights || null,
      hasInsights: !!data
    })

  } catch (error: any) {
    console.error('GET insights error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

