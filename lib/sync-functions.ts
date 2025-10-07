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
    
    onProgress?.('Step 4/4: Saving campaigns...')
    
    // Step 4: Save to database
    const analyticsLookup: any = {}
    analyticsResult.data?.data?.forEach((item: any) => {
      analyticsLookup[item.id] = item.attributes
    })
    
    const campaignDetails: any[] = []
    campaignsResult.data?.data?.forEach((campaign: any) => {
      const analytics = analyticsLookup[campaign.id] || {}
      campaignDetails.push({
        id: campaign.id,
        attributes: analytics,
        campaign_name: campaign.attributes?.name,
        campaign_status: campaign.attributes?.status,
        send_date: campaign.attributes?.send_time
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
    
    const saveResponse = await fetch('/api/klaviyo-proxy/save-flows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flowDetails, clientId }) // Use clientId (UUID) not slug
    })
    
    if (!saveResponse.ok) throw new Error('Save flows failed')
    
    return { success: true, count: flowDetails.length }
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

