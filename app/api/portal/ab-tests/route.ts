import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Client ID is required' 
      }, { status: 400 })
    }

    console.log('📥 PORTAL A/B TESTS: Fetching tests for client:', clientId)

    // Fetch A/B tests from ops_ab_tests table
    const { data: tests, error } = await supabase
      .from('ops_ab_tests')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ PORTAL A/B TESTS: Database error:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }

    console.log(`✅ PORTAL A/B TESTS: Found ${tests?.length || 0} tests`)

    // Transform database rows to match component interface
    const transformedTests = tests?.map(test => ({
      id: test.id,
      test_name: test.test_name,
      test_type: test.test_type,
      status: test.status,
      client_id: test.client_id,
      client_name: test.client_name,
      hypothesis: test.hypothesis,
      test_date: test.test_date,
      segment: test.segment,
      sample_size: test.sample_size,
      confidence_level: test.confidence_level,
      winner_variant: test.winner_variant,
      notes: test.notes,
      created_at: test.created_at,
      updated_at: test.updated_at,
      // Variant data
      variant_a_name: test.variant_a_name,
      variant_a_description: test.variant_a_description,
      variant_a_sent: test.variant_a_sent,
      variant_a_opens: test.variant_a_opens,
      variant_a_clicks: test.variant_a_clicks,
      variant_a_conversions: test.variant_a_conversions,
      variant_a_revenue: test.variant_a_revenue,
      variant_b_name: test.variant_b_name,
      variant_b_description: test.variant_b_description,
      variant_b_sent: test.variant_b_sent,
      variant_b_opens: test.variant_b_opens,
      variant_b_clicks: test.variant_b_clicks,
      variant_b_conversions: test.variant_b_conversions,
      variant_b_revenue: test.variant_b_revenue,
      // Optional variant C
      variant_c_name: test.variant_c_name,
      variant_c_description: test.variant_c_description,
      variant_c_sent: test.variant_c_sent,
      variant_c_opens: test.variant_c_opens,
      variant_c_clicks: test.variant_c_clicks,
      variant_c_conversions: test.variant_c_conversions,
      variant_c_revenue: test.variant_c_revenue
    })) || []

    return NextResponse.json({
      success: true,
      tests: transformedTests
    })

  } catch (error: any) {
    console.error('❌ PORTAL A/B TESTS: Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

// PATCH - Update A/B test (for declaring winners or updating results)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { testId, ...updates } = body

    console.log('📝 PORTAL A/B TESTS API: Updating test:', testId)

    const { data: test, error } = await supabase
      .from('ops_ab_tests')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', testId)
      .select()
      .single()

    if (error) {
      console.error('❌ PORTAL A/B TESTS API: Update error:', error)
      throw error
    }

    console.log('✅ PORTAL A/B TESTS API: Test updated successfully')

    return NextResponse.json({ success: true, test })
  } catch (error: any) {
    console.error('❌ PORTAL A/B TESTS API: Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}


