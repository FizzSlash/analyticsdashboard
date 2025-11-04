import { NextRequest, NextResponse } from 'next/server'
import { AICopyService } from '@/lib/ai-copy-service'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { campaignId, initialIdea, productUrls, regenerateContext } = await request.json()

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 })
    }

    console.log('🎯 Generating 3 brief ideas for campaign:', campaignId)

    // Get campaign data
    const { data: campaign, error: campaignError } = await supabase
      .from('ops_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Get copy notes for this client
    const { data: copyNotes, error: notesError } = await supabase
      .from('ops_copy_notes')
      .select('*')
      .eq('client_id', campaign.client_id)
      .single()

    if (notesError || !copyNotes) {
      return NextResponse.json({ 
        error: 'Copy notes not found. Please generate Copy Notes first.'
      }, { status: 404 })
    }

    // Generate 3 strategic brief ideas
    const aiService = new AICopyService(campaign.agency_id)
    const briefIdeas = await aiService.generateBriefIdeas({
      campaign_name: campaign.campaign_name,
      initial_idea: initialIdea || campaign.internal_notes || 'Create engaging campaign',
      copy_notes: copyNotes,
      product_urls: productUrls
    })

    // Save brief ideas to campaign
    const { error: updateError } = await supabase
      .from('ops_campaigns')
      .update({
        brief_ideas: briefIdeas,
        brief_ideas_context: regenerateContext || initialIdea,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)

    if (updateError) {
      console.error('Error saving brief ideas:', updateError)
      return NextResponse.json({ error: 'Failed to save brief ideas' }, { status: 500 })
    }

    console.log('✅ 3 brief ideas generated and saved')

    return NextResponse.json({
      success: true,
      data: briefIdeas,
      message: '3 brief ideas generated successfully'
    })

  } catch (error) {
    console.error('❌ Generate brief ideas error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to generate brief ideas'
    }, { status: 500 })
  }
}

