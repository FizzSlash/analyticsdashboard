import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Fetch A/B test results for a client
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'Client ID is required' },
        { status: 400 }
      )
    }

    console.log('📥 AB TESTS: Loading A/B tests for client:', clientId)

    const { data: tests, error } = await supabaseAdmin
      .from('ab_test_results')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ AB TESTS: Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to load A/B tests' },
        { status: 500 }
      )
    }

    console.log(`✅ AB TESTS: Found ${tests.length} tests`)

    // Transform database structure to match component expectations
    const transformedTests = tests.map((test: any) => ({
      ...test,
      // Add variants array for component compatibility
      variants: [
        {
          id: 'variant_a',
          name: test.variant_a_name || 'Variant A',
          sent: test.variant_a_sent || 0,
          opens: test.variant_a_opens || 0,
          clicks: test.variant_a_clicks || 0,
          revenue: test.variant_a_revenue || 0,
          openRate: test.variant_a_sent > 0 ? (test.variant_a_opens / test.variant_a_sent) * 100 : 0,
          clickRate: test.variant_a_sent > 0 ? (test.variant_a_clicks / test.variant_a_sent) * 100 : 0
        },
        {
          id: 'variant_b',
          name: test.variant_b_name || 'Variant B',
          sent: test.variant_b_sent || 0,
          opens: test.variant_b_opens || 0,
          clicks: test.variant_b_clicks || 0,
          revenue: test.variant_b_revenue || 0,
          openRate: test.variant_b_sent > 0 ? (test.variant_b_opens / test.variant_b_sent) * 100 : 0,
          clickRate: test.variant_b_sent > 0 ? (test.variant_b_clicks / test.variant_b_sent) * 100 : 0
        }
      ],
      winner: test.winner_variant,
      status: 'completed' // Since all tests in database are completed
    }))

    return NextResponse.json({
      success: true,
      tests: transformedTests
    })

  } catch (error) {
    console.error('❌ AB TESTS: Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new A/B test
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      client_id,
      agency_id,
      airtable_record_id,
      test_name,
      test_type,
      start_date,
      end_date,
      variant_a_name,
      variant_b_name
    } = body

    console.log('📝 AB TESTS: Creating new test:', test_name)

    // Validate required fields
    if (!client_id || !agency_id || !test_name || !test_type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create test
    const { data: newTest, error } = await supabaseAdmin
      .from('ab_test_results')
      .insert({
        client_id,
        agency_id,
        airtable_record_id: airtable_record_id || `TEST_${Date.now()}`,
        test_name,
        test_type,
        start_date,
        end_date,
        variant_a_name: variant_a_name || 'Variant A',
        variant_b_name: variant_b_name || 'Variant B'
      })
      .select('*')
      .single()

    if (error) {
      console.error('❌ AB TESTS: Create error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create test' },
        { status: 500 }
      )
    }

    console.log('✅ AB TESTS: Successfully created test:', newTest.id)

    return NextResponse.json({
      success: true,
      test: newTest
    })

  } catch (error) {
    console.error('❌ AB TESTS: Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update test results
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Test ID is required' },
        { status: 400 }
      )
    }

    console.log('✏️ AB TESTS: Updating test:', id)

    const { data: updatedTest, error } = await supabaseAdmin
      .from('ab_test_results')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('❌ AB TESTS: Update error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update test' },
        { status: 500 }
      )
    }

    console.log('✅ AB TESTS: Successfully updated test:', id)

    return NextResponse.json({
      success: true,
      test: updatedTest
    })

  } catch (error) {
    console.error('❌ AB TESTS: Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete test
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Test ID is required' },
        { status: 400 }
      )
    }

    console.log('🗑️ AB TESTS: Deleting test:', id)

    const { error } = await supabaseAdmin
      .from('ab_test_results')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ AB TESTS: Delete error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete test' },
        { status: 500 }
      )
    }

    console.log('✅ AB TESTS: Successfully deleted test:', id)

    return NextResponse.json({
      success: true
    })

  } catch (error) {
    console.error('❌ AB TESTS: Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}