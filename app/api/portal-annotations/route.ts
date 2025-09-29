import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      airtable_record_id,
      design_file_id, 
      client_id, 
      agency_id,
      x_position, 
      y_position, 
      comment, 
      author_user_id, 
      author_name, 
      author_role 
    } = body

    console.log('💬 PORTAL ANNOTATION: Saving annotation to database:', {
      airtable_record_id,
      design_file_id,
      x_position,
      y_position,
      comment: comment.substring(0, 50) + '...',
      author_role
    })

    // Validate required fields
    if (!airtable_record_id || !design_file_id || !client_id || !agency_id || !comment) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Save annotation to database
    const { data: annotation, error: annotationError } = await supabaseAdmin
      .from('design_annotations')
      .insert({
        airtable_record_id,
        design_file_id,
        client_id,
        agency_id,
        x_position: parseFloat(x_position),
        y_position: parseFloat(y_position),
        comment,
        author_user_id,
        author_name,
        author_role
      })
      .select('*')
      .single()

    if (annotationError) {
      console.error('❌ PORTAL ANNOTATION: Database error:', annotationError)
      return NextResponse.json(
        { success: false, error: 'Failed to save annotation' },
        { status: 500 }
      )
    }

    console.log('✅ PORTAL ANNOTATION: Successfully saved annotation:', annotation.id)

    return NextResponse.json({
      success: true,
      annotation
    })

  } catch (error) {
    console.error('❌ PORTAL ANNOTATION: Error:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const airtable_record_id = searchParams.get('airtable_record_id')
    const design_file_id = searchParams.get('design_file_id')
    const client_id = searchParams.get('client_id')

    if (!airtable_record_id || !client_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    console.log('📥 PORTAL ANNOTATION: Loading annotations for:', {
      airtable_record_id,
      design_file_id,
      client_id
    })

    // Build query
    let query = supabaseAdmin
      .from('design_annotations')
      .select('*')
      .eq('airtable_record_id', airtable_record_id)
      .eq('client_id', client_id)
      .order('created_at', { ascending: false })

    // Optionally filter by specific design file
    if (design_file_id) {
      query = query.eq('design_file_id', design_file_id)
    }

    const { data: annotations, error: annotationsError } = await query

    if (annotationsError) {
      console.error('❌ PORTAL ANNOTATION: Database error:', annotationsError)
      return NextResponse.json(
        { success: false, error: 'Failed to load annotations' },
        { status: 500 }
      )
    }

    console.log(`📥 PORTAL ANNOTATION: Found ${annotations.length} annotations`)

    return NextResponse.json({
      success: true,
      annotations
    })

  } catch (error) {
    console.error('❌ PORTAL ANNOTATION: Error:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    console.log('✏️ PORTAL ANNOTATION: Updating annotation:', id, updates)

    // Update annotation
    const { data: annotation, error: updateError } = await supabaseAdmin
      .from('design_annotations')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      console.error('❌ PORTAL ANNOTATION: Update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update annotation' },
        { status: 500 }
      )
    }

    console.log('✅ PORTAL ANNOTATION: Successfully updated annotation:', annotation.id)

    return NextResponse.json({
      success: true,
      annotation
    })

  } catch (error) {
    console.error('❌ PORTAL ANNOTATION: Error:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing annotation ID' },
        { status: 400 }
      )
    }

    console.log('🗑️ PORTAL ANNOTATION: Deleting annotation:', id)

    // Delete annotation
    const { error: deleteError } = await supabaseAdmin
      .from('design_annotations')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('❌ PORTAL ANNOTATION: Delete error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete annotation' },
        { status: 500 }
      )
    }

    console.log('✅ PORTAL ANNOTATION: Successfully deleted annotation:', id)

    return NextResponse.json({
      success: true
    })

  } catch (error) {
    console.error('❌ PORTAL ANNOTATION: Error:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}