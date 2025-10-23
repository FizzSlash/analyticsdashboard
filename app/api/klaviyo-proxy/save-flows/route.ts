import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

// Helper function to parse flow actions and calculate sequence
function parseFlowActions(actions: any[], clientId: string, flowId: string) {
  let cumulativeHours = 0
  
  return actions.map((action, index) => {
    const actionType = action.attributes?.action_type || 'unknown'
    const settings = action.attributes?.settings || {}
    
    // Calculate delay for TIME_DELAY actions
    let delayHours = 0
    let delaySeconds = null
    if (actionType === 'TIME_DELAY' && settings.delay_seconds) {
      delaySeconds = settings.delay_seconds
      delayHours = Math.round(delaySeconds / 3600) // Convert seconds to hours
      cumulativeHours += delayHours
    }
    
    // Extract message ID from relationships (for SEND_EMAIL actions)
    // Note: flow-messages is a relationship link, not direct data
    // We'll need to get the actual message ID from flow-messages lookup
    const messageRelationship = action.relationships?.['flow-messages']
    const messageId = null // Will be populated later by matching message data
    
    return {
      client_id: clientId,
      flow_id: flowId,
      action_id: action.id,
      action_type: actionType.toLowerCase(), // Normalize: SEND_EMAIL → send_email
      action_status: action.attributes?.status || 'unknown',
      sequence_position: index,
      delay_type: actionType === 'TIME_DELAY' ? 'delay' : null,
      delay_value: delayHours || null,
      delay_unit: delayHours ? 'hours' : null,
      cumulative_delay_hours: cumulativeHours,
      flow_message_id: messageId, // Will need separate logic to link
      condition_type: null, // Would need to parse conditional_split actions
      trigger_type: null // Trigger actions would have specific settings
    }
  })
}

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
      errors: [] as Array<{ flowId: string; error: string }>,
      actionsStored: 0
    }
    
        // Save flow message weekly performance data to flow_message_metrics
    for (const flowDetail of flowDetails) {
      try {
        // Skip draft flows - only process active/live flows (match frontend filter)
        if (!['active', 'live'].includes(flowDetail.flow_status)) {
          console.log(`⏭️ SAVE FLOWS: Skipping ${flowDetail.flow_status} flow: ${flowDetail.flow_name}`)
          results.total-- // Don't count skipped flows in total
          continue
        }
        
        console.log(`✅ SAVE FLOWS: Processing ${flowDetail.flow_status} flow: ${flowDetail.flow_name}`)
        // Save weekly data to flow_message_metrics table (per message, per week)
        if (flowDetail.weeklyData && Array.isArray(flowDetail.weeklyData)) {
          for (const weekData of flowDetail.weeklyData) {
            // Get message details for this message ID
            const messageDetails = flowDetail.messages?.find((msg: any) => 
              msg.id === weekData.flow_message_id
            )
            
            await DatabaseService.upsertFlowMessageMetric({
              client_id: clientId,
              flow_id: flowDetail.flow_id,
              message_id: weekData.flow_message_id,
              week_date: weekData.week_date,
              
              // Message details from Get Flow Message API
              message_name: messageDetails?.attributes?.name,
              subject_line: messageDetails?.attributes?.content?.subject,
              channel: messageDetails?.attributes?.channel,
              preview_text: messageDetails?.attributes?.content?.preview_text,
              from_email: messageDetails?.attributes?.content?.from_email,
              from_label: messageDetails?.attributes?.content?.from_label,
              message_created: messageDetails?.attributes?.created,
              message_updated: messageDetails?.attributes?.updated,
              
              // Weekly performance data from Flow Series
              opens: weekData.attributes?.opens || 0,
              opens_unique: weekData.attributes?.opens_unique || 0,
              clicks: weekData.attributes?.clicks || 0,
              clicks_unique: weekData.attributes?.clicks_unique || 0,
              open_rate: weekData.attributes?.open_rate || 0,
              click_rate: weekData.attributes?.click_rate || 0,
              conversions: weekData.attributes?.conversions || 0,
              conversion_value: weekData.attributes?.conversion_value || 0,
              revenue: weekData.attributes?.conversion_value || 0,
              delivery_rate: weekData.attributes?.delivery_rate || 0,
              bounce_rate: weekData.attributes?.bounce_rate || 0,
              recipients: weekData.attributes?.recipients || 0,
              revenue_per_recipient: weekData.attributes?.revenue_per_recipient || 0,
              average_order_value: weekData.attributes?.average_order_value || 0,
              delivered: weekData.attributes?.delivered || 0,
              bounced: weekData.attributes?.bounced || 0,
              unsubscribes: weekData.attributes?.unsubscribes || 0,
              spam_complaints: weekData.attributes?.spam_complaints || 0,
              
              // Legacy fields for compatibility
              date_recorded: weekData.week_date
            })
          }
        }

        // Save flow summary to flow_metrics table (aggregated totals)
        // ALWAYS save flows, even if they have no message data (0 messages)
        let totalOpens = 0, totalClicks = 0, totalRevenue = 0
        
        if (flowDetail.weeklyData && Array.isArray(flowDetail.weeklyData)) {
          // Aggregate weekly data to flow totals
          totalOpens = flowDetail.weeklyData.reduce((sum: number, week: any) => 
            sum + (week.attributes?.opens || 0), 0
          )
          totalClicks = flowDetail.weeklyData.reduce((sum: number, week: any) => 
            sum + (week.attributes?.clicks || 0), 0
          )
          totalRevenue = flowDetail.weeklyData.reduce((sum: number, week: any) => 
            sum + (week.attributes?.conversion_value || 0), 0
          )
          console.log(`📊 SAVE FLOWS: Flow ${flowDetail.flow_id} has weeklyData with ${flowDetail.weeklyData.length} records`)
        } else {
          console.log(`📊 SAVE FLOWS: Flow ${flowDetail.flow_id} has NO weeklyData (0 messages) - saving with zero values`)
        }
        
        // Save ALL flows (with data or without)
        await DatabaseService.upsertFlowMetric({
          client_id: clientId,
          flow_id: flowDetail.flow_id,
          flow_name: flowDetail.flow_name,
          flow_type: flowDetail.flow_type || 'email',
          flow_status: flowDetail.flow_status,
          date_start: new Date().toISOString().split('T')[0],
          date_end: new Date().toISOString().split('T')[0],
          
          // Required legacy fields
          triggered_count: 0,
          completed_count: 0,
          completion_rate: 0,
          orders_count: totalClicks,
          revenue_per_trigger: 0,
          
          // Aggregated totals (will be 0 for flows without messages)
          opens: totalOpens,
          clicks: totalClicks,
          revenue: totalRevenue,
          open_rate: totalOpens > 0 ? totalClicks / totalOpens : 0,
          click_rate: totalClicks > 0 ? totalClicks / totalOpens : 0
        })
        
        // Save flow actions if available
        if (flowDetail.flowActions && flowDetail.flowActions.length > 0) {
          console.log(`🔄 SAVE FLOWS: Parsing and saving ${flowDetail.flowActions.length} actions for flow ${flowDetail.flow_id}`)
          
          try {
            const parsedActions = parseFlowActions(flowDetail.flowActions, clientId, flowDetail.flow_id)
            await DatabaseService.upsertFlowActions(clientId, flowDetail.flow_id, parsedActions)
            results.actionsStored += parsedActions.length
            console.log(`✅ SAVE FLOWS: Saved ${parsedActions.length} flow actions`)
          } catch (actionError: any) {
            console.error(`⚠️ SAVE FLOWS: Failed to save actions for flow ${flowDetail.flow_id}:`, actionError.message)
            // Continue - actions are optional, don't fail the whole flow
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