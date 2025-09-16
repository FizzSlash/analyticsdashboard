import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientSlug, attributionData, interval } = body
    
    if (!clientSlug || !attributionData) {
      return NextResponse.json({ 
        error: 'Client slug and attribution data required' 
      }, { status: 400 })
    }

    console.log(`💾 SAVE REVENUE ATTRIBUTION: Saving attribution data for client ${clientSlug}`)
    console.log(`💾 SAVE REVENUE ATTRIBUTION: Data points to save: ${attributionData.length}`)

    // Get client
    const client = await DatabaseService.getClientBySlug(clientSlug)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    let savedCount = 0
    let errorCount = 0
    const errors = []

    // Save each data point
    for (const dataPoint of attributionData) {
      try {
        const revenueAttributionMetric = {
          client_id: client.id,
          date_recorded: dataPoint.date,
          interval_type: interval || 'month',
          
          // Total store metrics
          total_store_revenue: dataPoint.total_store_revenue || 0,
          total_store_orders: dataPoint.total_store_orders || 0,
          
          // Email campaign attribution
          email_campaign_revenue: dataPoint.email_campaign_revenue || 0,
          email_campaign_orders: dataPoint.email_campaign_orders || 0,
          email_campaign_recipients: dataPoint.email_campaign_recipients || 0,
          
          // Email flow attribution
          email_flow_revenue: dataPoint.email_flow_revenue || 0,
          email_flow_orders: dataPoint.email_flow_orders || 0,
          email_flow_recipients: dataPoint.email_flow_recipients || 0,
          
          // SMS attribution (future enhancement)
          sms_campaign_revenue: dataPoint.sms_campaign_revenue || 0,
          sms_campaign_orders: dataPoint.sms_campaign_orders || 0,
          sms_campaign_recipients: dataPoint.sms_campaign_recipients || 0,
          sms_flow_revenue: dataPoint.sms_flow_revenue || 0,
          sms_flow_orders: dataPoint.sms_flow_orders || 0,
          sms_flow_recipients: dataPoint.sms_flow_recipients || 0,
          
          // Calculated percentages
          email_attribution_percentage: dataPoint.email_attribution_percentage || 0,
          sms_attribution_percentage: dataPoint.sms_attribution_percentage || 0,
          unattributed_revenue: dataPoint.unattributed_revenue || 0,
          unattributed_percentage: dataPoint.unattributed_percentage || 0,
          
          // Performance metrics
          email_revenue_per_recipient: dataPoint.email_revenue_per_recipient || 0,
          sms_revenue_per_recipient: dataPoint.sms_revenue_per_recipient || 0,
          email_conversion_rate: dataPoint.email_conversion_rate || 0,
          sms_conversion_rate: dataPoint.sms_conversion_rate || 0,
          
          // Average order values
          email_average_order_value: dataPoint.email_average_order_value || 0,
          sms_average_order_value: dataPoint.sms_average_order_value || 0,
          store_average_order_value: dataPoint.store_average_order_value || 0,
          
          // Metadata
          metric_source: 'values_reports',
          sync_timestamp: new Date().toISOString()
        }
        
        await DatabaseService.upsertRevenueAttributionMetric(revenueAttributionMetric)
        savedCount++
        
      } catch (error: any) {
        errorCount++
        errors.push({
          date: dataPoint.date,
          error: error.message
        })
        console.error(`❌ SAVE REVENUE ATTRIBUTION: Error saving data point for ${dataPoint.date}:`, error.message)
      }
    }

    console.log(`✅ SAVE REVENUE ATTRIBUTION: Saved ${savedCount} data points, ${errorCount} errors`)

    return NextResponse.json({
      success: true,
      client: client.brand_name,
      saved: savedCount,
      errors: errorCount,
      errorDetails: errors.length > 0 ? errors : undefined,
      interval: interval || 'month'
    })

  } catch (error: any) {
    console.error('❌ SAVE REVENUE ATTRIBUTION: Critical error:', error)
    return NextResponse.json({
      error: 'Failed to save revenue attribution data',
      message: error.message
    }, { status: 500 })
  }
}