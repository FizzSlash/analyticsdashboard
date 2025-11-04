import { NextRequest, NextResponse } from 'next/server'
import { AICopyService } from '@/lib/ai-copy-service'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { clientId } = await request.json()

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
    }

    console.log('🤖 Generating Copy Notes for client:', clientId)

    // Get client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('brand_name, brand_slug, agency_id')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Get any existing campaigns for context
    const { data: campaigns } = await supabase
      .from('ops_campaigns')
      .select('campaign_name, subject_line, internal_notes')
      .eq('client_id', clientId)
      .limit(5)

    // Generate copy notes using AI
    const aiService = new AICopyService(client.agency_id)
    const generatedNotes = await aiService.generateCopyNotes({
      brand_name: client.brand_name,
      website_url: undefined, // TODO: Add website scraping
      existing_campaigns: campaigns || []
    })

    // Save to database
    const { data: savedNotes, error: saveError } = await supabase
      .from('ops_copy_notes')
      .upsert({
        client_id: clientId,
        voice_tone: generatedNotes.voice_tone,
        brand_personality: generatedNotes.brand_personality,
        writing_style: generatedNotes.writing_style,
        key_phrases: generatedNotes.key_phrases,
        words_to_avoid: generatedNotes.words_to_avoid,
        target_audience: generatedNotes.target_audience,
        pain_points: generatedNotes.pain_points,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'client_id'
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving copy notes:', saveError)
      return NextResponse.json({ error: 'Failed to save copy notes' }, { status: 500 })
    }

    console.log('✅ Copy Notes generated and saved')

    return NextResponse.json({
      success: true,
      data: savedNotes,
      message: 'Copy notes generated successfully'
    })

  } catch (error) {
    console.error('❌ Generate copy notes error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to generate copy notes'
    }, { status: 500 })
  }
}

