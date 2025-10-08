import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaignDetails, clientId } = body
    
    if (!campaignDetails || !Array.isArray(campaignDetails)) {
      return NextResponse.json({ error: 'Campaign details array required' }, { status: 400 })
    }
    
    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
    }

    console.log(`💾 SAVE CAMPAIGNS: Starting bulk upsert for ${campaignDetails.length} campaigns`)
    
    const results = {
      total: campaignDetails.length,
      successful: 0,
      failed: 0,
      errors: [] as Array<{ campaignId: string; error: string }>
    }
    
    // Process each campaign for database save
    for (let i = 0; i < campaignDetails.length; i++) {
      const campaign = campaignDetails[i]
      
      try {
        console.log(`💾 SAVE CAMPAIGNS: Upserting campaign ${i + 1}/${campaignDetails.length} - ${campaign.campaign_name}`)
        console.log(`💾 SAVE CAMPAIGNS: Campaign ID: ${campaign.id}`)
        
        // Prepare campaign data for database
        const campaignData = {
          client_id: clientId,
          campaign_id: campaign.id,
          campaign_name: campaign.campaign_name || 'Unknown Campaign',
          subject_line: campaign.subject_line || null,
          send_date: campaign.send_date || null,
          // NEW FIELDS - Campaign metadata
          campaign_status: campaign.campaign_status || null,
          campaign_archived: campaign.campaign_archived || false,
          campaign_created_at: campaign.campaign_created_at || null,
          campaign_updated_at: campaign.campaign_updated_at || null,
          campaign_scheduled_at: campaign.campaign_scheduled_at || null,
          // NEW FIELDS - Email content
          from_email: campaign.from_email || null,
          from_label: campaign.from_label || null,
          reply_to_email: campaign.reply_to_email || null,
          email_html: campaign.email_html || null,
          template_id: campaign.template_id || null,
          template_name: campaign.template_name || null,
          preview_text: campaign.preview_text || null,
          media_url: campaign.media_url || null,
          email_title: campaign.email_title || null,
          dynamic_image: campaign.dynamic_image || null,
          render_options: campaign.render_options || null,
          kv_pairs: campaign.kv_pairs || null,
          // NEW FIELDS - Targeting
          included_audiences: campaign.included_audiences || [],
          excluded_audiences: campaign.excluded_audiences || [],
          estimated_recipients: campaign.estimated_recipients || null,
          // NEW FIELDS - Settings
          use_smart_sending: campaign.use_smart_sending || false,
          is_tracking_clicks: campaign.is_tracking_clicks !== false,
          is_tracking_opens: campaign.is_tracking_opens !== false,
          add_utm_tracking: campaign.add_utm_tracking || false,
          send_strategy: campaign.send_strategy || 'static',
          // Map all analytics fields
          recipients_count: campaign.attributes?.recipients || 0,
          delivered_count: campaign.attributes?.delivered || 0,
          opened_count: campaign.attributes?.opens || 0,
          opens_unique: campaign.attributes?.opens_unique || 0,
          clicked_count: campaign.attributes?.clicks || 0,
          clicks_unique: campaign.attributes?.clicks_unique || 0,
          bounced_count: campaign.attributes?.bounced || 0,
          bounced_or_failed: campaign.attributes?.bounced_or_failed || 0,
          failed_count: campaign.attributes?.failed || 0,
          unsubscribed_count: campaign.attributes?.unsubscribes || 0,
          unsubscribe_uniques: campaign.attributes?.unsubscribe_uniques || 0,
          spam_complaints: campaign.attributes?.spam_complaints || 0,
          conversions: campaign.attributes?.conversions || 0,
          conversion_uniques: campaign.attributes?.conversion_uniques || 0,
          conversion_value: campaign.attributes?.conversion_value || 0,
          revenue: campaign.attributes?.conversion_value || 0,
          orders_count: campaign.attributes?.conversions || 0,
          revenue_per_recipient: campaign.attributes?.revenue_per_recipient || 0,
          average_order_value: campaign.attributes?.average_order_value || 0,
          open_rate: campaign.attributes?.open_rate || 0,
          click_rate: campaign.attributes?.click_rate || 0,
          click_to_open_rate: campaign.attributes?.click_to_open_rate || 0,
          bounce_rate: campaign.attributes?.bounce_rate || 0,
          bounced_or_failed_rate: campaign.attributes?.bounced_or_failed_rate || 0,
          failed_rate: campaign.attributes?.failed_rate || 0,
          delivery_rate: campaign.attributes?.delivery_rate || 0,
          unsubscribe_rate: campaign.attributes?.unsubscribe_rate || 0,
          spam_complaint_rate: campaign.attributes?.spam_complaint_rate || 0,
          conversion_rate: campaign.attributes?.conversion_rate || 0,
          // Legacy field
          image_url: null
        }
        
        console.log(`💾 SAVE CAMPAIGNS: Prepared data for campaign ${campaign.id}:`, JSON.stringify(campaignData, null, 2))
        
        // Upsert to database
        await DatabaseService.upsertCampaignMetric(campaignData)
        
        results.successful++
        console.log(`✅ SAVE CAMPAIGNS: Campaign ${i + 1} saved successfully to campaign_metrics table`)
        
      } catch (error: any) {
        console.error(`❌ SAVE CAMPAIGNS: Error saving campaign ${campaign.id}:`, error)
        console.error(`❌ SAVE CAMPAIGNS: Error details:`, error.message)
        results.failed++
        results.errors.push({
          campaignId: campaign.id,
          error: error.message
        })
      }
    }
    
    console.log(`🎉 SAVE CAMPAIGNS: Bulk upsert completed - ${results.successful}/${results.total} successful`)
    
    return NextResponse.json({
      success: true,
      message: `Bulk campaign save completed`,
      results
    })

  } catch (error: any) {
    console.error('❌ SAVE CAMPAIGNS: Bulk save failed:', error)
    return NextResponse.json({
      error: 'Bulk campaign save failed',
      message: error.message
    }, { status: 500 })
  }
} 