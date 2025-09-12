import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { flowDetails, clientId } = body
    
    if (!flowDetails || !Array.isArray(flowDetails)) {
      return NextResponse.json({ error: 'Flow details array required' }, { status: 400 })
    }
    
    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
    }

    console.log(`💾 SAVE FLOWS: Starting save for ${flowDetails.length} flows`)
    
    const results = {
      total: flowDetails.length,
      successful: 0,
      failed: 0,
      errors: [] as Array<{ flowId: string; error: string }>
    }
    
    // Save each flow's weekly data to database
    for (const flowDetail of flowDetails) {
      try {
        // Save to flow_metrics table (weekly records)
        if (flowDetail.weeklyData && Array.isArray(flowDetail.weeklyData)) {
          for (const weekData of flowDetail.weeklyData) {
                         await DatabaseService.upsertFlowMetric({
               client_id: clientId,
               flow_id: flowDetail.flow_id,
               flow_name: flowDetail.flow_name,
               flow_type: flowDetail.flow_type || 'email',
               flow_status: flowDetail.flow_status,
               date_start: weekData.week_date,
               date_end: weekData.week_date,
               
               // Required legacy fields
               triggered_count: 0,
               completed_count: 0,
               completion_rate: 0,
               orders_count: weekData.conversions || 0,
               revenue_per_trigger: 0,
               
               // Weekly analytics data
               opens: weekData.opens || 0,
               opens_unique: weekData.opens_unique || 0,
               clicks: weekData.clicks || 0,
               clicks_unique: weekData.clicks_unique || 0,
               open_rate: weekData.open_rate || 0,
               click_rate: weekData.click_rate || 0,
               conversions: weekData.conversions || 0,
               conversion_value: weekData.conversion_value || 0,
               revenue: weekData.conversion_value || 0,
               delivery_rate: weekData.delivery_rate || 0,
               bounce_rate: weekData.bounce_rate || 0,
               recipients: weekData.recipients || 0,
               revenue_per_recipient: weekData.revenue_per_recipient || 0,
               average_order_value: weekData.average_order_value || 0
             })
          }
        }

        results.successful++
        console.log(`✅ SAVE FLOWS: Successfully saved ${flowDetail.weeklyData?.length || 0} weekly records for flow ${flowDetail.flow_id}`)

      } catch (error: any) {
        results.failed++
        results.errors.push({
          flowId: flowDetail.flow_id || 'unknown',
          error: error.message
        })
        console.log(`❌ SAVE FLOWS: Failed to save flow ${flowDetail.flow_id}:`, error.message)
      }
    }

    console.log(`💾 SAVE FLOWS: Completed - ${results.successful}/${results.total} flows saved`)

    return NextResponse.json({
      success: true,
      message: `Flow sync completed: ${results.successful}/${results.total} flows saved`,
      results
    })

  } catch (error: any) {
    console.error('❌ SAVE FLOWS: Error:', error)
    return NextResponse.json({
      error: 'Flow save failed',
      message: error.message
    }, { status: 500 })
  }
} 