/**
 * Reusable sync functions for both admin and client dashboards
 * These replicate the exact working sync processes from client-management.tsx
 */

export async function syncCampaigns(clientSlug: string, clientId: string, onProgress?: (message: string) => void) {
  try {
    onProgress?.('Step 1/4: Getting conversion metric...')
    
    // Step 1: Get metrics
    const metricsResponse = await fetch(`/api/klaviyo-proxy/metrics?clientSlug=${clientSlug}`)
    if (!metricsResponse.ok) throw new Error('Metrics API failed')
    
    const metricsResult = await metricsResponse.json()
    const placedOrderMetric = metricsResult.data?.data?.find((m: any) => 
      m.attributes?.name === 'Placed Order'
    )
    const conversionMetricId = placedOrderMetric?.id || null
    
    onProgress?.('Step 2/4: Getting campaign analytics...')
    
    // Step 2: Get analytics
    const analyticsResponse = await fetch('/api/klaviyo-proxy/campaign-analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientSlug, conversionMetricId })
    })
    if (!analyticsResponse.ok) throw new Error('Analytics API failed')
    const analyticsResult = await analyticsResponse.json()
    
    onProgress?.('Step 3/4: Getting campaign details...')
    
    // Step 3: Get campaigns bulk
    const campaignsResponse = await fetch(`/api/klaviyo-proxy/campaigns-bulk?clientSlug=${clientSlug}`)
    if (!campaignsResponse.ok) throw new Error('Campaigns API failed')
    const campaignsResult = await campaignsResponse.json()
    
    onProgress?.('Step 3.5/4: Fetching email templates...')
    
    // Fetch all templates with HTML
    const templatesResponse = await fetch(`/api/klaviyo-proxy/templates?clientSlug=${clientSlug}`)
    const templatesResult = templatesResponse.ok ? await templatesResponse.json() : null
    
    // Create template lookup
    const templateLookup: { [key: string]: { html: string, name: string } } = {}
    if (templatesResult?.data?.data) {
      templatesResult.data.data.forEach((template: any) => {
        templateLookup[template.id] = {
          html: template.attributes?.html || '',
          name: template.attributes?.name || ''
        }
      })
    }
    
    onProgress?.('Step 4/4: Saving campaigns...')
    
    // Step 4: Save to database
    const analyticsLookup: any = {}
    analyticsResult.data?.data?.forEach((item: any) => {
      analyticsLookup[item.id] = item.attributes
    })
    
    // Create messages lookup from included data
    const messagesLookup: { [key: string]: any } = {}
    if (campaignsResult.data?.included) {
      campaignsResult.data.included.forEach((item: any) => {
        if (item.type === 'campaign-message') {
          const campaignId = item.relationships?.campaign?.data?.id || item.id
          messagesLookup[campaignId] = {
            attributes: item.attributes,
            template_id: item.relationships?.template?.data?.id || null
          }
        }
      })
    }
    
    const campaignDetails: any[] = []
    campaignsResult.data?.data?.forEach((campaign: any) => {
      const analytics = analyticsLookup[campaign.id] || {}
      const messageInfo = messagesLookup[campaign.id] || {}
      const messageData = messageInfo.attributes || {}
      const templateId = messageInfo.template_id
      const template = templateId ? templateLookup[templateId] : null
      
      campaignDetails.push({
        id: campaign.id,
        attributes: analytics,
        campaign_name: campaign.attributes?.name,
        campaign_status: campaign.attributes?.status,
        send_date: campaign.attributes?.send_time,
        subject_line: messageData?.definition?.content?.subject || null,
        preview_text: messageData?.definition?.content?.preview_text || null,
        from_email: messageData?.definition?.content?.from_email || null,
        from_label: messageData?.definition?.content?.from_label || null,
        reply_to_email: messageData?.definition?.content?.reply_to_email || null,
        email_html: template?.html || messageData?.definition?.content?.body || null, // Template HTML or inline body
        template_id: templateId,
        template_name: template?.name || null,
        media_url: messageData?.definition?.content?.media_url || null,
        email_title: messageData?.definition?.content?.title || null,
        dynamic_image: messageData?.definition?.content?.dynamic_image || null,
        render_options: messageData?.definition?.render_options || null,
        kv_pairs: messageData?.definition?.kv_pairs || null,
        campaign_archived: campaign.attributes?.archived || false,
        campaign_created_at: campaign.attributes?.created_at || null,
        campaign_updated_at: campaign.attributes?.updated_at || null,
        campaign_scheduled_at: campaign.attributes?.scheduled_at || null,
        included_audiences: campaign.attributes?.audiences?.included || [],
        excluded_audiences: campaign.attributes?.audiences?.excluded || [],
        use_smart_sending: campaign.attributes?.send_options?.use_smart_sending || false,
        is_tracking_clicks: campaign.attributes?.tracking_options?.is_tracking_clicks !== false,
        is_tracking_opens: campaign.attributes?.tracking_options?.is_tracking_opens !== false,
        add_utm_tracking: campaign.attributes?.tracking_options?.add_tracking_params || false,
        send_strategy: campaign.attributes?.send_strategy?.method || 'static'
      })
    })
    
    const saveResponse = await fetch('/api/klaviyo-proxy/save-campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignDetails, clientId }) // Use clientId (UUID) not slug
    })
    
    if (!saveResponse.ok) throw new Error('Save campaigns failed')
    
    return { success: true, count: campaignDetails.length }
  } catch (error) {
    console.error('Campaign sync error:', error)
    throw error
  }
}

export async function syncFlows(clientSlug: string, clientId: string, onProgress?: (message: string) => void) {
  try {
    onProgress?.('Step 1/4: Getting conversion metric...')
    
    const metricsResponse = await fetch(`/api/klaviyo-proxy/metrics?clientSlug=${clientSlug}`)
    if (!metricsResponse.ok) throw new Error('Metrics API failed')
    
    const metricsResult = await metricsResponse.json()
    const placedOrderMetric = metricsResult.data?.data?.find((m: any) => 
      m.attributes?.name === 'Placed Order'
    )
    const conversionMetricId = placedOrderMetric?.id || null
    
    onProgress?.('Step 2/4: Getting flow analytics...')
    
    const analyticsResponse = await fetch('/api/klaviyo-proxy/flow-analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientSlug, conversionMetricId })
    })
    if (!analyticsResponse.ok) throw new Error('Flow analytics failed')
    const analyticsResult = await analyticsResponse.json()
    
    onProgress?.('Step 3/4: Getting flow details...')
    
    const flowsResponse = await fetch(`/api/klaviyo-proxy/flows-bulk?clientSlug=${clientSlug}`)
    if (!flowsResponse.ok) throw new Error('Flows API failed')
    const flowsResult = await flowsResponse.json()
    
    onProgress?.('Step 4/4: Saving flows...')
    
    onProgress?.('Step 4/4: Saving flows...')
    
    const flowDetails: any[] = []
    flowsResult.data?.data?.forEach((flow: any) => {
      const flowWeeklyData = analyticsResult.data?.data?.filter((record: any) => 
        record.flow_id === flow.id
      ) || []
      
      flowDetails.push({
        flow_id: flow.id,
        flow_name: flow.attributes?.name,
        flow_status: flow.attributes?.status,
        weeklyData: flowWeeklyData
      })
    })
    
    console.log(`💾 Saving ${flowDetails.length} flows in batches of 5`)
    
    // Save in batches to avoid 413 Payload Too Large error
    const batchSize = 5
    let totalSaved = 0
    
    for (let i = 0; i < flowDetails.length; i += batchSize) {
      const batch = flowDetails.slice(i, i + batchSize)
      console.log(`📦 Batch ${Math.floor(i / batchSize) + 1}: Saving ${batch.length} flows`)
      
      const saveResponse = await fetch('/api/klaviyo-proxy/save-flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flowDetails: batch, clientId })
      })
      
      if (!saveResponse.ok) {
        const error = await saveResponse.json()
        console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, error)
        throw new Error(error.message || 'Save flows failed')
      }
      
      totalSaved += batch.length
      console.log(`✅ Batch saved (${totalSaved}/${flowDetails.length})`)
    }
    
    console.log(`✅ All ${totalSaved} flows saved successfully`)
    
    return { success: true, count: totalSaved }
  } catch (error) {
    console.error('Flow sync error:', error)
    throw error
  }
}

export async function syncListGrowth(clientSlug: string, clientId: string, onProgress?: (message: string) => void) {
  try {
    onProgress?.('Step 1/3: Getting metrics...')
    
    const metricsResponse = await fetch(`/api/klaviyo-proxy/metrics?clientSlug=${clientSlug}`)
    if (!metricsResponse.ok) throw new Error('Metrics API failed')
    
    const metricsResult = await metricsResponse.json()
    const metrics = metricsResult.data?.data || []
    const metricLookup: { [key: string]: string } = {}
    
    metrics.forEach((metric: any) => {
      metricLookup[metric.attributes.name] = metric.id
    })
    
    onProgress?.('Step 2/3: Getting subscription data...')
    
    const endDate = new Date().toISOString()
    const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
    
    const subscriptionMetrics = [
      'Subscribed to Email Marketing',
      'Unsubscribed from Email Marketing',
      'Subscribed to SMS Marketing',
      'Unsubscribed from SMS Marketing',
      'Form submitted by profile'
    ]
    
    const aggregateQueries = []
    const validMetrics = []
    
    for (const metricName of subscriptionMetrics) {
      if (metricLookup[metricName]) {
        aggregateQueries.push(
          fetch('/api/klaviyo-proxy/metric-aggregates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientSlug,
              metricId: metricLookup[metricName],
              interval: 'day',
              startDate,
              endDate
            })
          })
        )
        validMetrics.push(metricName)
      }
    }
    
    const aggregateResponses = await Promise.all(aggregateQueries)
    const aggregateResults = await Promise.all(
      aggregateResponses.map(response => response.json())
    )
    
    onProgress?.('Step 3/3: Saving list growth...')
    
    // Transform data (simplified - just pass raw data to save endpoint)
    const saveResponse = await fetch('/api/klaviyo-proxy/save-list-growth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientSlug,
        growthData: aggregateResults, // Pass the aggregate data
        interval: 'day'
      })
    })
    
    if (!saveResponse.ok) {
      const error = await saveResponse.json()
      throw new Error(error.message || 'Save list growth failed')
    }
    
    const result = await saveResponse.json()
    return { success: true, count: result.saved || 0 }
  } catch (error) {
    console.error('List growth sync error:', error)
    throw error
  }
}

export async function syncRevenueAttribution(clientSlug: string, clientId: string, onProgress?: (message: string) => void) {
  try {
    onProgress?.('Syncing revenue attribution...')
    
    const saveResponse = await fetch('/api/klaviyo-proxy/save-revenue-attribution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        clientSlug,
        timeframe: 'last-365-days'  // Required parameter!
      })
    })
    
    if (!saveResponse.ok) {
      const error = await saveResponse.json()
      throw new Error(error.message || 'Save revenue failed')
    }
    
    const result = await saveResponse.json()
    return { success: true, count: result.savedCount || 0 }
  } catch (error) {
    console.error('Revenue sync error:', error)
    throw error
  }
}

