import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const clientSlug = searchParams.get('clientSlug')
    
    let client_id = clientId

    // If slug provided, get client ID
    if (clientSlug && !clientId) {
      const { data: client } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('brand_slug', clientSlug)
        .single()
      
      if (!client) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 })
      }
      client_id = client.id
    }

    if (!client_id) {
      return NextResponse.json({ error: 'Client ID or slug is required' }, { status: 400 })
    }

    console.log(`AB TESTS API: Fetching A/B tests for client: ${client_id}`)

    // Fetch A/B test results from Supabase
    const { data, error } = await supabaseAdmin
      .from('ab_test_results')
      .select('*')
      .eq('client_id', client_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('AB TESTS API: Error fetching tests:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`AB TESTS API: Found ${data?.length || 0} A/B tests`)

    return NextResponse.json({
      success: true,
      tests: data || []
    })

  } catch (error: any) {
    console.error('AB TESTS API: Error:', error)
    return NextResponse.json({
      error: 'Failed to fetch A/B tests',
      message: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      client_id, agency_id, airtable_record_id, test_name, test_type,
      variant_a_name, variant_b_name, start_date, end_date
    } = body

    if (!client_id || !agency_id || !test_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log(`AB TESTS API: Creating A/B test for client: ${client_id}`)

    // Insert new A/B test
    const { data, error } = await supabaseAdmin
      .from('ab_test_results')
      .insert({
        client_id,
        agency_id,
        airtable_record_id: airtable_record_id || `AB_TEST_${Date.now()}`,
        test_name,
        test_type: test_type || 'subject_line',
        variant_a_name: variant_a_name || 'Variant A',
        variant_b_name: variant_b_name || 'Variant B',
        start_date,
        end_date
      })
      .select()
      .single()

    if (error) {
      console.error('AB TESTS API: Error creating test:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`AB TESTS API: Test created:`, data)

    return NextResponse.json({
      success: true,
      test: data
    })

  } catch (error: any) {
    console.error('AB TESTS API: Error:', error)
    return NextResponse.json({
      error: 'Failed to create A/B test',
      message: error.message
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Test ID is required' }, { status: 400 })
    }

    console.log(`AB TESTS API: Updating test: ${id}`)

    // Update A/B test
    const { data, error } = await supabaseAdmin
      .from('ab_test_results')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('AB TESTS API: Error updating test:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`AB TESTS API: Test updated:`, data)

    return NextResponse.json({
      success: true,
      test: data
    })

  } catch (error: any) {
    console.error('AB TESTS API: Error:', error)
    return NextResponse.json({
      error: 'Failed to update A/B test',
      message: error.message
    }, { status: 500 })
  }
}