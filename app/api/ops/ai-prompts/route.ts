import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch custom prompts for an agency
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agencyId = searchParams.get('agencyId')

    if (!agencyId) {
      return NextResponse.json({ error: 'Agency ID required' }, { status: 400 })
    }

    const { data: prompts, error } = await supabase
      .from('ops_ai_prompts')
      .select('*')
      .eq('agency_id', agencyId)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching AI prompts:', error)
      return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 })
    }

    // Convert array to object keyed by prompt_id
    const promptsMap: any = {}
    prompts?.forEach(p => {
      promptsMap[p.prompt_id] = p.prompt_text
    })

    return NextResponse.json({
      success: true,
      prompts: promptsMap
    })

  } catch (error) {
    console.error('Get AI prompts error:', error)
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 })
  }
}

// PATCH - Update a prompt
export async function PATCH(request: NextRequest) {
  try {
    const { agencyId, promptId, promptText } = await request.json()

    if (!agencyId || !promptId || !promptText) {
      return NextResponse.json(
        { error: 'Agency ID, prompt ID, and prompt text required' },
        { status: 400 }
      )
    }

    console.log(`💾 Saving AI prompt: ${promptId} for agency: ${agencyId}`)

    // Upsert the prompt
    const { data, error } = await supabase
      .from('ops_ai_prompts')
      .upsert({
        agency_id: agencyId,
        prompt_id: promptId,
        prompt_text: promptText,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'agency_id,prompt_id'
      })
      .select()

    if (error) {
      console.error('Error saving AI prompt:', error)
      return NextResponse.json({ error: 'Failed to save prompt' }, { status: 500 })
    }

    console.log('✅ AI prompt saved successfully')

    return NextResponse.json({
      success: true,
      message: 'Prompt updated successfully'
    })

  } catch (error) {
    console.error('Update AI prompt error:', error)
    return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 })
  }
}

// DELETE - Reset prompt to default (delete custom version)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agencyId = searchParams.get('agencyId')
    const promptId = searchParams.get('promptId')

    if (!agencyId || !promptId) {
      return NextResponse.json(
        { error: 'Agency ID and prompt ID required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('ops_ai_prompts')
      .delete()
      .eq('agency_id', agencyId)
      .eq('prompt_id', promptId)

    if (error) {
      console.error('Error deleting AI prompt:', error)
      return NextResponse.json({ error: 'Failed to reset prompt' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Prompt reset to default'
    })

  } catch (error) {
    console.error('Delete AI prompt error:', error)
    return NextResponse.json({ error: 'Failed to reset prompt' }, { status: 500 })
  }
}

