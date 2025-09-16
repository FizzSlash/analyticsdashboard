import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientSlug, growthData, interval } = body
    
    if (!clientSlug || !growthData) {
      return NextResponse.json({ 
        error: 'Client slug and growth data required' 
      }, { status: 400 })
    }

    console.log(`💾 SAVE LIST GROWTH: Saving growth data for client ${clientSlug}`)
    console.log(`💾 SAVE LIST GROWTH: Data points to save: ${growthData.length}`)

    // Get client
    const client = await DatabaseService.getClientBySlug(clientSlug)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    let savedCount = 0
    let errorCount = 0
    const errors = []

    // Save each data point
    for (const dataPoint of growthData) {
      try {
        const listGrowthMetric = {
          client_id: client.id,
          date_recorded: dataPoint.date,
          interval_type: interval || 'week',
          
          // Email metrics
          email_subscriptions: dataPoint.email_subscriptions || 0,
          email_unsubscribes: dataPoint.email_unsubscribes || 0,
          
          // SMS metrics  
          sms_subscriptions: dataPoint.sms_subscriptions || 0,
          sms_unsubscribes: dataPoint.sms_unsubscribes || 0,
          
          // Form metrics
          form_submissions: dataPoint.form_submissions || 0,
          newsletter_signups: dataPoint.newsletter_signups || 0,
          
          // List metrics
          list_subscriptions: dataPoint.list_subscriptions || 0,
          list_unsubscribes: dataPoint.list_unsubscribes || 0,
          
          // Special subscriptions
          back_in_stock_subscriptions: dataPoint.back_in_stock_subscriptions || 0,
          
        // Calculated aggregate totals
        total_new_subscriptions: (dataPoint.email_subscriptions || 0) + (dataPoint.sms_subscriptions || 0) + (dataPoint.list_subscriptions || 0),
        total_unsubscriptions: (dataPoint.email_unsubscribes || 0) + (dataPoint.sms_unsubscribes || 0) + (dataPoint.list_unsubscribes || 0),
        overall_net_growth: ((dataPoint.email_subscriptions || 0) + (dataPoint.sms_subscriptions || 0) + (dataPoint.list_subscriptions || 0)) - 
                           ((dataPoint.email_unsubscribes || 0) + (dataPoint.sms_unsubscribes || 0) + (dataPoint.list_unsubscribes || 0)),
        
        // Calculated rates
        growth_rate: dataPoint.growth_rate || 0,
        churn_rate: dataPoint.churn_rate || 0,
          
          // Metadata
          metric_source: 'query_metric_aggregates',
          sync_timestamp: new Date().toISOString()
        }
        
        await DatabaseService.upsertListGrowthMetric(listGrowthMetric)
        savedCount++
        
      } catch (error: any) {
        errorCount++
        errors.push({
          date: dataPoint.date,
          error: error.message
        })
        console.error(`❌ SAVE LIST GROWTH: Error saving data point for ${dataPoint.date}:`, error.message)
      }
    }

    console.log(`✅ SAVE LIST GROWTH: Saved ${savedCount} data points, ${errorCount} errors`)

    return NextResponse.json({
      success: true,
      client: client.brand_name,
      saved: savedCount,
      errors: errorCount,
      errorDetails: errors.length > 0 ? errors : undefined,
      interval: interval || 'week'
    })

  } catch (error: any) {
    console.error('❌ SAVE LIST GROWTH: Critical error:', error)
    return NextResponse.json({
      error: 'Failed to save list growth data',
      message: error.message
    }, { status: 500 })
  }
}