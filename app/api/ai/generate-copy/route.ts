import { NextRequest, NextResponse } from 'next/server'
import { AICopyService } from '@/lib/ai-copy-service'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { campaignId, productUrls } = await request.json()

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 })
    }

    console.log('🤖 Generating email copy for campaign:', campaignId)

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
        error: 'Copy notes not found. Please generate Copy Notes first.',
        redirect: `/agency/${campaign.agency_id}/ops?tab=content&client=${campaign.client_id}`
      }, { status: 404 })
    }

    // Scrape products if URLs provided
    const aiService = new AICopyService()
    let scrapedProducts = []
    
    if (productUrls && productUrls.length > 0) {
      console.log('🔍 Scraping product URLs:', productUrls)
      scrapedProducts = await aiService.scrapeProducts(productUrls)
    }

    // Generate email copy
    const generatedCopy = await aiService.generateEmailCopy({
      campaign_name: campaign.campaign_name,
      brief: campaign.internal_notes || 'No brief provided',
      copy_notes: copyNotes,
      product_urls: productUrls,
      scraped_products: scrapedProducts
    })

    // Save generated copy to campaign
    const { error: updateError } = await supabase
      .from('ops_campaigns')
      .update({
        generated_copy: generatedCopy,
        copy_blocks: generatedCopy.email_blocks,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)

    if (updateError) {
      console.error('Error saving generated copy:', updateError)
      return NextResponse.json({ error: 'Failed to save generated copy' }, { status: 500 })
    }

    console.log('✅ Email copy generated and saved')

    return NextResponse.json({
      success: true,
      data: generatedCopy,
      message: 'Email copy generated successfully'
    })

  } catch (error) {
    console.error('❌ Generate copy error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to generate copy'
    }, { status: 500 })
  }
}

// GET - Check if copy notes exist for a client
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
    }

    const { data: copyNotes, error } = await supabase
      .from('ops_copy_notes')
      .select('id')
      .eq('client_id', clientId)
      .single()

    return NextResponse.json({
      has_copy_notes: !!copyNotes && !error
    })

  } catch (error) {
    return NextResponse.json({ has_copy_notes: false })
  }
}

