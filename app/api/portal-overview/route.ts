import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Fetch aggregated portal overview stats for a client
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

    console.log('📊 PORTAL OVERVIEW: Loading stats for client:', clientId)

    // Fetch all portal data in parallel
    const [requestsResult, abTestsResult, annotationsResult] = await Promise.all([
      supabaseAdmin
        .from('portal_requests')
        .select('id, status, requested_date, title')
        .eq('client_id', clientId),
      
      supabaseAdmin
        .from('ab_test_results')
        .select('id, test_name, end_date, winner_variant')
        .eq('client_id', clientId),
      
      supabaseAdmin
        .from('design_annotations')
        .select('id, resolved, created_at, comment')
        .eq('client_id', clientId)
    ])

    const requests = requestsResult.data || []
    const abTests = abTestsResult.data || []
    const annotations = annotationsResult.data || []

    // Calculate stats
    const pendingApprovals = requests.filter(r => r.status === 'in_review' || r.status === 'submitted').length
    const activeRequests = requests.filter(r => r.status === 'in_progress' || r.status === 'in_review').length
    const unresolvedAnnotations = annotations.filter(a => !a.resolved).length

    // Recent activity (last 10 items)
    const recentActivity = [
      ...requests.slice(0, 5).map(r => ({
        id: r.id,
        type: 'request',
        title: r.title,
        date: r.requested_date,
        status: r.status
      })),
      ...abTests.slice(0, 3).map(t => ({
        id: t.id,
        type: 'ab_test',
        title: t.test_name,
        date: t.end_date,
        winner: t.winner_variant
      })),
      ...annotations.slice(0, 2).map(a => ({
        id: a.id,
        type: 'annotation',
        title: a.comment.substring(0, 50) + '...',
        date: a.created_at,
        resolved: a.resolved
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)

    // Upcoming deadlines
    const now = new Date()
    const upcomingDeadlines = requests
      .filter(r => r.desired_completion_date && new Date(r.desired_completion_date) > now)
      .sort((a, b) => new Date(a.desired_completion_date).getTime() - new Date(b.desired_completion_date).getTime())
      .slice(0, 5)
      .map(r => ({
        id: r.id,
        title: r.title,
        dueDate: r.desired_completion_date,
        type: 'request'
      }))

    // Monthly stats (current month)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const completedThisMonth = requests.filter(r => 
      r.status === 'completed' && 
      r.actual_completion_date && 
      new Date(r.actual_completion_date) >= monthStart
    ).length

    const testsThisMonth = abTests.filter(t =>
      t.end_date &&
      new Date(t.end_date) >= monthStart
    ).length

    const summary = {
      pendingApprovals,
      activeRequests,
      unresolvedAnnotations,
      recentActivity,
      upcomingDeadlines,
      monthlyStats: {
        campaignsApproved: 0, // Would need campaign approval data
        requestsCompleted: completedThisMonth,
        abTestsCompleted: testsThisMonth,
        annotationsResolved: annotations.filter(a => 
          a.resolved_at && 
          new Date(a.resolved_at) >= monthStart
        ).length
      },
      totals: {
        totalRequests: requests.length,
        totalABTests: abTests.length,
        totalAnnotations: annotations.length
      }
    }

    console.log('✅ PORTAL OVERVIEW: Aggregated stats:', summary)

    return NextResponse.json({
      success: true,
      summary
    })

  } catch (error) {
    console.error('❌ PORTAL OVERVIEW: Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}