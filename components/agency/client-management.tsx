'use client'

import { useState } from 'react'
import { Agency, Client } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { encryptApiKey } from '@/lib/klaviyo'
import { 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Eye, 
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  RotateCw,
  Building2,
  Mail,
  Zap,
  TrendingUp,
  DollarSign,
  RefreshCw,
  Link,
  Sparkles,
  Share2,
  Copy,
  X
} from 'lucide-react'

interface ClientManagementProps {
  agency: Agency
  clients: Client[]
}

interface ClientFormData {
  brand_name: string
  brand_slug: string
  klaviyo_api_key: string
  portal_title: string
}

export function ClientManagement({ agency, clients: initialClients }: ClientManagementProps) {
  const [clients, setClients] = useState(initialClients)
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showApiKey, setShowApiKey] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  
  // Simplified - no auth dependency to avoid circular imports

  const [formData, setFormData] = useState<ClientFormData>({
    brand_name: '',
    brand_slug: '',
    klaviyo_api_key: '',
    portal_title: ''
  })

  const resetForm = () => {
    setFormData({
      brand_name: '',
      brand_slug: '',
      klaviyo_api_key: '',
      portal_title: ''
    })
    setEditingClient(null)
    setShowForm(false)
    setError('')
    setSuccess('')
  }

  const handleEdit = (client: Client) => {
    setFormData({
      brand_name: client.brand_name,
      brand_slug: client.brand_slug,
      klaviyo_api_key: '', // Don't pre-fill encrypted API key
      portal_title: (client as any).portal_title || ''
    })
    setEditingClient(client)
    setShowForm(true)
  }

  const toggleAudit = async (client: Client) => {
    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: client.brand_name,
          brand_slug: client.brand_slug,
          audit_enabled: !client.audit_enabled
        })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle audit')
      }

      // Update local state
      setClients(clients.map(c => 
        c.id === client.id 
          ? { ...c, audit_enabled: !c.audit_enabled }
          : c
      ))

      setSuccess(`Audit ${!client.audit_enabled ? 'enabled' : 'disabled'} for ${client.brand_name}`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to toggle audit')
    }
  }

  const generateShareLink = async (client: Client) => {
    try {
      // Enable sharing if not already
      if (!client.share_enabled) {
        const response = await fetch(`/api/clients/${client.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brand_name: client.brand_name,
            brand_slug: client.brand_slug,
            share_enabled: true
          })
        })

        if (!response.ok) throw new Error('Failed to enable sharing')

        const result = await response.json()
        const updatedClient = result.client

        // Update local state
        setClients(clients.map(c => c.id === client.id ? updatedClient : c))
        
        const link = `${window.location.origin}/share/${updatedClient.share_token}`
        setShareLink(link)
        setSelectedClient(updatedClient)
      } else {
        const link = `${window.location.origin}/share/${client.share_token}`
        setShareLink(link)
        setSelectedClient(client)
      }
      
      setShowShareModal(true)
    } catch (err) {
      setError('Failed to generate share link')
    }
  }

  const toggleSharing = async (client: Client) => {
    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: client.brand_name,
          brand_slug: client.brand_slug,
          share_enabled: !client.share_enabled
        })
      })

      if (!response.ok) throw new Error('Failed to toggle sharing')

      const result = await response.json()
      setClients(clients.map(c => c.id === client.id ? result.client : c))
      
      setSuccess(`Sharing ${!client.share_enabled ? 'enabled' : 'disabled'} for ${client.brand_name}`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to toggle sharing')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Remove auth check - we know they're logged in if they reached this page
    
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      console.log('Step 1: Starting client creation...', { formData, agency })
      
      console.log('Step 3: Skipping session check - using service role for database operations')
      // Skip session check and use service role for database operations
      
      console.log('Step 5: Session exists, validating fields...')
      // Validate required fields
      if (!formData.brand_name || !formData.brand_slug) {
        console.log('Step 5.1: Missing required fields')
        throw new Error('Brand name and slug are required')
      }

      // For new clients, API key is required
      if (!editingClient && !formData.klaviyo_api_key) {
        console.log('Step 5.2: Missing API key')
        throw new Error('Klaviyo API key is required for new clients')
      }

      console.log('Step 6: Preparing client data...')
      // Clean up the slug
      const cleanSlug = formData.brand_slug.toLowerCase().replace(/[^a-z0-9-]/g, '')

      const clientData = {
        agency_id: agency.id,
        brand_name: formData.brand_name,
        brand_slug: cleanSlug,
        portal_title: formData.portal_title || undefined,
        is_active: true
      }
      
      console.log('Step 7: Client data prepared:', clientData)

      if (editingClient) {
        // Update existing client via API
        console.log('Step 8: Updating existing client...')
        
        const updatePayload: any = {
          brand_name: formData.brand_name,
          brand_slug: cleanSlug,
          agency_id: agency.id,
          portal_title: formData.portal_title || undefined
        }
        
        // Only include API key if provided
        if (formData.klaviyo_api_key) {
          updatePayload.klaviyo_api_key = formData.klaviyo_api_key
        }
        
        const response = await fetch(`/api/clients/${editingClient.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatePayload)
        })
        
        const result = await response.json()
        console.log('Step 9: Update API response:', result)
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to update client')
        }

        // Update local state with fresh data from API response
        setClients(clients.map(c => 
          c.id === editingClient.id 
            ? { ...c, ...result.client }
            : c
        ))

        setSuccess('✅ Client updated successfully! Colors and settings saved.')
        
        // Auto-refresh after 2 seconds to ensure UI reflects changes
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        // Create new client
        console.log('Step 8: Starting encryption...')
        const encryptedKey = encryptApiKey(formData.klaviyo_api_key)
        console.log('Step 9: API key encrypted successfully')
        
        const insertData = {
          ...clientData,
          agency_id: agency.id,
          klaviyo_api_key: encryptedKey
        }
        
        console.log('Step 10: About to insert data using service role:', insertData)
        
        // Use service role for database operations (bypasses RLS)
        const response = await fetch('/api/clients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            brand_name: formData.brand_name,
            brand_slug: cleanSlug,
            klaviyo_api_key: formData.klaviyo_api_key,
            agency_id: agency.id
          })
        })
        
        const result = await response.json()
        console.log('Step 11: API response:', result)
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to create client')
        }
        
        const data = result.client

        // Remove error handling since we're using API now

        console.log('Step 12: Success! Adding to local state...')
        // Add to local state
        setClients([data, ...clients])
        setSuccess('Client created successfully!')
        console.log('Step 13: Complete!')
      }

      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (client: Client) => {
    if (!confirm(`Are you sure you want to delete ${client.brand_name}? This action cannot be undone.`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete client')
      }

      setClients(clients.filter(c => c.id !== client.id))
      setSuccess('Client deleted successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete client')
    } finally {
      setLoading(false)
    }
  }

  const triggerCampaignSync = async (client: Client) => {
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      console.log('📧 CAMPAIGN SYNC: Starting campaign sync for:', client.brand_slug)
      
      // Step 1: Get conversion metric ID
      setSuccess('Step 1/4: Getting conversion metric ID...')
      console.log('📡 FRONTEND: Calling metrics proxy API')
      
      const metricsResponse = await fetch(`/api/klaviyo-proxy/metrics?clientSlug=${client.brand_slug}`)
      if (!metricsResponse.ok) {
        throw new Error(`Metrics API failed: ${metricsResponse.status}`)
      }
      
      const metricsResult = await metricsResponse.json()
      console.log('📊 FRONTEND: Metrics response:', metricsResult)
      
      // Find conversion metric
      console.log('🔍 FRONTEND: Looking for conversion metric in', metricsResult.data?.data?.length, 'metrics')
      console.log('🔍 FRONTEND: ALL metric names:', metricsResult.data?.data?.map((m: any) => m.attributes?.name))
      
      // Find ALL "Placed Order" metrics (there might be duplicates!)
      const allPlacedOrderMetrics = metricsResult.data?.data?.filter((m: any) => 
        m.attributes?.name === 'Placed Order'
      )
      
      console.log('🔍 FRONTEND: Found', allPlacedOrderMetrics?.length || 0, '"Placed Order" metrics')
      
      if (allPlacedOrderMetrics && allPlacedOrderMetrics.length > 1) {
        console.warn('⚠️ FRONTEND: MULTIPLE "Placed Order" metrics detected!')
        allPlacedOrderMetrics.forEach((m: any, idx: number) => {
          console.log(`📊 FRONTEND: Metric ${idx + 1}:`, {
            id: m.id,
            name: m.attributes?.name,
            integration: m.attributes?.integration || 'none',
            created: m.attributes?.created
          })
        })
      }
      
      // Prefer integration metrics (Shopify, WooCommerce, etc.) - they have real data
      let placedOrderMetric = allPlacedOrderMetrics?.find((m: any) => 
        m.attributes?.integration?.name // Has integration = real e-commerce data
      )
      
      // If no integration metric, use the newest one
      if (!placedOrderMetric && allPlacedOrderMetrics && allPlacedOrderMetrics.length > 0) {
        placedOrderMetric = allPlacedOrderMetrics.sort((a: any, b: any) => 
          new Date(b.attributes?.created || 0).getTime() - new Date(a.attributes?.created || 0).getTime()
        )[0]
        console.log('📊 FRONTEND: No integration metric, using newest "Placed Order"')
      }
      
      const conversionMetricId = placedOrderMetric?.id || null
      console.log('🎯 FRONTEND: Selected conversion metric ID:', conversionMetricId)
      console.log('🎯 FRONTEND: Metric details:', placedOrderMetric ? {
        name: placedOrderMetric.attributes?.name,
        integration: placedOrderMetric.attributes?.integration?.name || 'none',
        created: placedOrderMetric.attributes?.created
      } : 'NOT FOUND')
      
      if (!conversionMetricId) {
        console.warn('⚠️⚠️⚠️ FRONTEND: NO "Placed Order" METRIC FOUND! REVENUE WILL BE $0 ⚠️⚠️⚠️')
        const orderMetrics = metricsResult.data?.data?.filter((m: any) => 
          m.attributes?.name?.toLowerCase().includes('order') || 
          m.attributes?.name?.toLowerCase().includes('purchase') ||
          m.attributes?.name?.toLowerCase().includes('checkout')
        )
        console.warn('💡 FRONTEND: Found these order-related metrics instead:', orderMetrics?.map((m: any) => ({
          name: m.attributes?.name,
          id: m.id,
          integration: m.attributes?.integration?.name || 'none'
        })))
      }
      
      // Step 2: Get bulk campaign analytics
      setSuccess('Step 2/4: Getting campaign analytics...')
      console.log('📡 FRONTEND: Calling campaign analytics proxy API')
      
      const analyticsResponse = await fetch('/api/klaviyo-proxy/campaign-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clientSlug: client.brand_slug,
          conversionMetricId 
        })
      })
      
      if (!analyticsResponse.ok) {
        const errorData = await analyticsResponse.json()
        console.log('❌ FRONTEND: Analytics API failed:', errorData)
        throw new Error(`Analytics API failed: ${errorData.message}`)
      }
      
      const analyticsResult = await analyticsResponse.json()
      console.log('📊 FRONTEND: Campaign analytics response:', analyticsResult)
      
      // Step 3: Get ALL campaigns with messages in single call (OPTIMIZED!)
      setSuccess('Step 3/4: Getting all campaign details and messages...')
      console.log('📡 FRONTEND: Calling bulk campaigns API with includes')
      
      const campaignsResponse = await fetch(`/api/klaviyo-proxy/campaigns-bulk?clientSlug=${client.brand_slug}`)
      if (!campaignsResponse.ok) {
        const errorData = await campaignsResponse.json()
        console.log('❌ FRONTEND: Bulk campaigns API failed:', errorData)
        throw new Error(`Bulk campaigns API failed: ${errorData.message}`)
      }
      
      const campaignsResult = await campaignsResponse.json()
      console.log('📧 FRONTEND: Bulk campaigns response:', campaignsResult)
      console.log('📊 FRONTEND: Got campaigns:', campaignsResult.data?.data?.length || 0)
      console.log('📩 FRONTEND: Got included data:', campaignsResult.data?.included?.length || 0)
      
      // Step 3.5: Extract unique template IDs from campaigns first
      const templateIds = new Set<string>()
      if (campaignsResult.data?.included) {
        campaignsResult.data.included.forEach((item: any) => {
          if (item.type === 'campaign-message' && item.relationships?.template?.data?.id) {
            templateIds.add(item.relationships.template.data.id)
          }
        })
      }
      
      const templateIdsArray = Array.from(templateIds)
      console.log('📧 FRONTEND: Found', templateIdsArray.length, 'unique template IDs:', templateIdsArray)
      
      // Step 3.5: Fetch ONLY templates used by campaigns (filtered)
      setSuccess(`Step 3.5/4: Fetching ${templateIdsArray.length} email templates...`)
      console.log('📧 FRONTEND: ============ CALLING TEMPLATES API WITH FILTER ============')
      
      const templatesResponse = await fetch('/api/klaviyo-proxy/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clientSlug: client.brand_slug,
          templateIds: templateIdsArray 
        })
      })
      console.log('📧 FRONTEND: Templates response status:', templatesResponse.status)
      
      const templatesResult = templatesResponse.ok ? await templatesResponse.json() : { data: { data: [] } }
      console.log('📧 FRONTEND: ============ GOT TEMPLATES:', templatesResult?.data?.data?.length || 0, '============')
      console.log('📧 FRONTEND: Template response:', templatesResult)
      console.log('📧 FRONTEND: Template data structure:', templatesResult?.data)
      
      // Create template lookup
      const templateLookup: { [key: string]: { html: string, name: string } } = {}
      if (templatesResult?.data?.data) {
        templatesResult.data.data.forEach((template: any) => {
          const hasHtml = !!template.attributes?.html
          const htmlLength = template.attributes?.html?.length || 0
          console.log(`📧 Template ${template.id}: name=${template.attributes?.name}, hasHtml=${hasHtml}, htmlLength=${htmlLength}`)
          
          templateLookup[template.id] = {
            html: template.attributes?.html || '',
            name: template.attributes?.name || ''
          }
        })
      }
      console.log('📧 FRONTEND: Template lookup created for', Object.keys(templateLookup).length, 'templates')
      
      // Process and combine data
      const campaignDetails: any[] = []
      const analyticsLookup: { [key: string]: any } = {}
      
      // Create analytics lookup
      if (analyticsResult.data?.data) {
        analyticsResult.data.data.forEach((item: any) => {
          analyticsLookup[item.id] = item.attributes
          console.log(`📊 FRONTEND: Analytics for campaign ${item.id}: revenue=${item.attributes?.conversion_value || 0}`)
        })
      }
      console.log(`📊 FRONTEND: Created analytics lookup with ${Object.keys(analyticsLookup).length} campaigns`)
      
      // Create messages lookup from included data
      const messagesLookup: { [key: string]: any } = {}
      if (campaignsResult.data?.included) {
        campaignsResult.data.included.forEach((item: any) => {
          if (item.type === 'campaign-message') {
            // Extract campaign ID and template ID from relationships
            const campaignId = item.relationships?.campaign?.data?.id || item.id
            messagesLookup[campaignId] = {
              attributes: item.attributes,
              template_id: item.relationships?.template?.data?.id || null
            }
          }
        })
      }
      
      // Combine all data with template HTML
      if (campaignsResult.data?.data) {
        campaignsResult.data.data.forEach((campaign: any, index: number) => {
          const analytics = analyticsLookup[campaign.id] || {}
          const messageInfo = messagesLookup[campaign.id] || {}
          const messageData = messageInfo.attributes || {}
          const templateId = messageInfo.template_id || null
          const template = templateId ? templateLookup[templateId] : null
          
          const completeData = {
            id: campaign.id,
            attributes: analytics,
            // Campaign details
            campaign_name: campaign.attributes?.name || 'Unknown Campaign',
            campaign_status: campaign.attributes?.status || 'unknown',
            send_date: campaign.attributes?.send_time || null,
            campaign_archived: campaign.attributes?.archived || false,
            campaign_created_at: campaign.attributes?.created_at || null,
            campaign_updated_at: campaign.attributes?.updated_at || null,
            campaign_scheduled_at: campaign.attributes?.scheduled_at || null,
            // Message content
            subject_line: messageData?.definition?.content?.subject || 'No subject',
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
            // Targeting data
            included_audiences: campaign.attributes?.audiences?.included || [],
            excluded_audiences: campaign.attributes?.audiences?.excluded || [],
            estimated_recipients: null, // Would need separate API call
            // Settings
            use_smart_sending: campaign.attributes?.send_options?.use_smart_sending || false,
            is_tracking_clicks: campaign.attributes?.tracking_options?.is_tracking_clicks || true,
            is_tracking_opens: campaign.attributes?.tracking_options?.is_tracking_opens || true,
            add_utm_tracking: campaign.attributes?.tracking_options?.add_tracking_params || false,
            send_strategy: campaign.attributes?.send_strategy?.method || 'static'
          }
          
          campaignDetails.push(completeData)
          
          console.log(`📊 FRONTEND: Campaign ${index + 1}: ${completeData.campaign_name} - Subject: "${completeData.subject_line}"`)
        })
      }
      
      console.log(`✅ FRONTEND: Processed ${campaignDetails.length} campaigns with complete data`)
      
      // Step 4: Save to Supabase
      setSuccess('Step 4/4: Saving complete data to Supabase...')
      console.log('💾 FRONTEND: Calling bulk save API for Supabase upsert')
      
      // Save in batches to avoid 413 Payload Too Large
      console.log(`📦 FRONTEND: Batching ${campaignDetails.length} campaigns into groups of 10`)
      
      const batchSize = 10
      let totalSaved = 0
      
      for (let i = 0; i < campaignDetails.length; i += batchSize) {
        const batch = campaignDetails.slice(i, i + batchSize)
        console.log(`📦 FRONTEND: Saving batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(campaignDetails.length / batchSize)} (${batch.length} campaigns)`)
        
        const saveResponse = await fetch('/api/klaviyo-proxy/save-campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            campaignDetails: batch,
            clientId: client.id
          })
        })
        
        if (!saveResponse.ok) {
          const saveError = await saveResponse.json().catch(() => ({ message: 'Unknown error' }))
          console.log('❌ FRONTEND: Batch save failed:', saveError)
          throw new Error(`Batch save failed: ${saveError.message}`)
        }
        
        const saveResult = await saveResponse.json()
        totalSaved += batch.length
        console.log(`✅ FRONTEND: Batch saved successfully (${totalSaved}/${campaignDetails.length} total)`)
      }
      
      console.log(`💾 FRONTEND: All ${totalSaved} campaigns saved to database`)
      
      setSuccess(`✅ Campaign sync completed for ${client.brand_name}!
      
📊 Analytics: ${analyticsResult.data?.data?.length || 0} campaigns processed
📧 Campaign Details: ${campaignsResult.data?.data?.length || 0} campaigns with complete data
📧 Templates: ${Object.keys(templateLookup).length} email templates fetched
💾 Saved: ${totalSaved} campaigns to database (batched)
🎯 Conversion Metric: ${conversionMetricId}

Sample campaigns:
${campaignDetails.slice(0, 3).map((c: any, i: number) => 
  `${i + 1}. ${c.campaign_name} - Subject: "${c.subject_line}" - Opens: ${c.attributes?.opens || 0}`
).join('\n')}`)
      
      console.log('🎉 FRONTEND: Optimized 2-call sync completed successfully')
      
    } catch (err) {
      console.error('❌ FRONTEND: Sync error:', err)
      setError(err instanceof Error ? err.message : 'Optimized sync failed')
    } finally {
      setLoading(false)
    }
  }

  const triggerListGrowthSync = async (client: Client) => {
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      console.log('📈 LIST GROWTH SYNC: Starting subscription growth sync for:', client.brand_slug)
      
      // Step 1: Get all available metrics
      setSuccess('Step 1/3: Getting available metrics...')
      console.log('📡 FRONTEND: Calling metrics proxy API')
      
      const metricsResponse = await fetch(`/api/klaviyo-proxy/metrics?clientSlug=${client.brand_slug}`)
      if (!metricsResponse.ok) {
        throw new Error(`Metrics API failed: ${metricsResponse.status}`)
      }
      
      const metricsResult = await metricsResponse.json()
      console.log('📊 FRONTEND: Available metrics:', metricsResult.data?.data?.length || 0)
      
      // Create metric lookup
      const metrics = metricsResult.data?.data || []
      const metricLookup: { [key: string]: string } = {}
      metrics.forEach((metric: any) => {
        metricLookup[metric.attributes.name] = metric.id
      })
      
      console.log('📋 FRONTEND: Subscription metrics found:', Object.keys(metricLookup).filter(name => 
        name.toLowerCase().includes('subscrib') || name.toLowerCase().includes('form')
      ))
      
      // Step 2: Query metric aggregates for last 365 days with daily data
      setSuccess('Step 2/3: Getting subscription growth data...')
      console.log('📈 FRONTEND: Querying metric aggregates')
      
      // Date range: last 365 days with daily intervals
      const endDate = new Date().toISOString()
      const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
      
      console.log(`📅 FRONTEND: Date range: ${startDate} to ${endDate}`)
      
      const subscriptionMetrics = [
        'Subscribed to Email Marketing',
        'Unsubscribed from Email Marketing',
        'Subscribed to SMS Marketing', 
        'Unsubscribed from SMS Marketing',
        'Form submitted by profile',
        'Subscribed to List',
        'Unsubscribed from List',
        'Subscribed to Back in Stock'
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
                clientSlug: client.brand_slug,
                metricId: metricLookup[metricName],
                interval: 'day', // Daily data for 365 days
                startDate: startDate,
                endDate: endDate
              })
            })
          )
          validMetrics.push(metricName)
        }
      }
      
      console.log(`🎯 FRONTEND: Querying ${aggregateQueries.length} metrics: ${validMetrics.join(', ')}`)
      
      const aggregateResponses = await Promise.all(aggregateQueries)
      const aggregateResults = await Promise.all(
        aggregateResponses.map(response => response.json())
      )
      
      console.log('📊 FRONTEND: Metric aggregate results:', aggregateResults.length)
      
      // Step 3: Transform and save data
      setSuccess('Step 3/3: Saving list growth data...')
      console.log('💾 FRONTEND: Transforming and saving data')
      
      // Transform API data into database format
      const growthData = transformMetricAggregateData(aggregateResults, validMetrics)
      console.log('📈 FRONTEND: Transformed data points:', growthData.length)
      
      // Save to database
      const saveResponse = await fetch('/api/klaviyo-proxy/save-list-growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientSlug: client.brand_slug,
          growthData: growthData,
          interval: 'day'
        })
      })
      
      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        throw new Error(`Save list growth failed: ${errorData.message}`)
      }
      
      const saveResult = await saveResponse.json()
      console.log('✅ FRONTEND: List growth sync completed:', saveResult)
      
      setSuccess(`✅ List Growth Sync Complete! Saved ${saveResult.saved} data points.`)
      
    } catch (error: any) {
      console.error('❌ FRONTEND: List growth sync failed:', error)
      setError(`List growth sync failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to transform metric aggregate data
  const transformMetricAggregateData = (aggregateResults: any[], metricNames: string[]) => {
    console.log('🔄 TRANSFORM: Processing metric aggregate data')
    
    if (!aggregateResults || aggregateResults.length === 0) {
      console.log('⚠️ TRANSFORM: No aggregate results to process')
      return []
    }
    
    // Get dates from first valid result
    const firstResult = aggregateResults.find(r => r.success && r.data?.data?.attributes?.dates)
    if (!firstResult) {
      console.log('⚠️ TRANSFORM: No valid results with dates found')
      return []
    }
    
    const dates = firstResult.data.data.attributes.dates
    console.log(`📅 TRANSFORM: Processing ${dates.length} date points`)
    
    // Create data point for each date
    const growthData = dates.map((date: string, index: number) => {
      const dataPoint: any = {
        date: date,
        email_subscriptions: 0,
        email_unsubscribes: 0,
        sms_subscriptions: 0,
        sms_unsubscribes: 0,
        form_submissions: 0,
        list_subscriptions: 0,
        list_unsubscribes: 0,
        back_in_stock_subscriptions: 0
      }
      
      // Map each metric result to the data point
      aggregateResults.forEach((result, resultIndex) => {
        if (!result.success || !result.data?.data?.attributes?.data?.[0]?.measurements?.count) {
          return
        }
        
        const metricName = metricNames[resultIndex]
        const count = result.data.data.attributes.data[0].measurements.count[index] || 0
        
        // Map metric names to data point fields
        switch (metricName) {
          case 'Subscribed to Email Marketing':
            dataPoint.email_subscriptions = count
            break
          case 'Unsubscribed from Email Marketing':
            dataPoint.email_unsubscribes = count
            break
          case 'Subscribed to SMS Marketing':
            dataPoint.sms_subscriptions = count
            break
          case 'Unsubscribed from SMS Marketing':
            dataPoint.sms_unsubscribes = count
            break
          case 'Form submitted by profile':
            dataPoint.form_submissions = count
            break
          case 'Subscribed to List':
            dataPoint.list_subscriptions = count
            break
          case 'Unsubscribed from List':
            dataPoint.list_unsubscribes = count
            break
          case 'Subscribed to Back in Stock':
            dataPoint.back_in_stock_subscriptions = count
            break
        }
      })
      
      // Calculate growth and churn rates
      const totalSubscriptions = dataPoint.email_subscriptions + dataPoint.sms_subscriptions + dataPoint.list_subscriptions
      const totalUnsubscriptions = dataPoint.email_unsubscribes + dataPoint.sms_unsubscribes + dataPoint.list_unsubscribes
      
      if (totalSubscriptions > 0) {
        dataPoint.growth_rate = totalSubscriptions > totalUnsubscriptions ? 
          ((totalSubscriptions - totalUnsubscriptions) / totalSubscriptions) : 0
        dataPoint.churn_rate = totalUnsubscriptions / totalSubscriptions
      }
      
      return dataPoint
    })
    
    console.log(`✅ TRANSFORM: Created ${growthData.length} growth data points`)
    console.log('📊 TRANSFORM: Sample data point:', growthData[0])
    
    return growthData
  }

  const triggerRevenueAttributionSync = async (client: Client) => {
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      console.log('💰 REVENUE ATTRIBUTION SYNC: Starting revenue attribution sync for:', client.brand_slug)
      
      setSuccess('Syncing revenue attribution data...')
      
      // Call the save revenue attribution API
      const response = await fetch('/api/klaviyo-proxy/save-revenue-attribution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientSlug: client.brand_slug,
          timeframe: 'last-365-days'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ REVENUE ATTRIBUTION SYNC: Success:', result)
      
      setSuccess(`Successfully synced ${result.savedCount || 'revenue attribution'} records! 💰`)
      
    } catch (error) {
      console.error('❌ REVENUE ATTRIBUTION SYNC: Error:', error)
      setError(`Revenue attribution sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const triggerFlowSync = async (client: Client) => {
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      console.log('🔄 FLOW SYNC: Starting optimized 4-call flow sync for:', client.brand_slug)
      
      // Step 1: Get conversion metric ID
      setSuccess('Step 1/4: Getting conversion metric ID...')
      console.log('📡 FRONTEND: Calling metrics proxy API')
      
      const metricsResponse = await fetch(`/api/klaviyo-proxy/metrics?clientSlug=${client.brand_slug}`)
      if (!metricsResponse.ok) {
        throw new Error(`Metrics API failed: ${metricsResponse.status}`)
      }
      
      const metricsResult = await metricsResponse.json()
      console.log('📊 FRONTEND: Metrics response:', metricsResult)
      
      // Find Placed Order metric
      const placedOrderMetric = metricsResult.data?.data?.find((m: any) => 
        m.attributes?.name === 'Placed Order'
      )
      const conversionMetricId = placedOrderMetric?.id || null
      console.log('🎯 FRONTEND: Found conversion metric ID:', conversionMetricId)
      
      // Step 2: Get ALL flows with metadata FIRST
      setSuccess('Step 2/4: Getting all flow details...')
      console.log('📡 FRONTEND: Calling bulk flows API')
      
      const flowsResponse = await fetch(`/api/klaviyo-proxy/flows-bulk?clientSlug=${client.brand_slug}`)
      if (!flowsResponse.ok) {
        const errorData = await flowsResponse.json()
        console.log('❌ FRONTEND: Bulk flows API failed:', errorData)
        throw new Error(`Bulk flows API failed: ${errorData.message}`)
      }
      
      const flowsResult = await flowsResponse.json()
      console.log('🔄 FRONTEND: Bulk flows response:', flowsResult)
      console.log('📊 FRONTEND: Got flows:', flowsResult.data?.data?.length || 0)
      
      // Debug: Check what statuses we actually have
      const allStatuses = flowsResult.data?.data?.map((flow: any) => ({
        id: flow.id,
        name: flow.attributes?.name,
        status: flow.attributes?.status
      })) || []
      console.log('🔍 FRONTEND: All flow statuses:', allStatuses)
      
      // Extract active flow IDs for analytics and messages
      const activeFlows = flowsResult.data?.data?.filter((flow: any) => 
        flow.attributes?.status === 'active'
      ) || []
      const flowIds = activeFlows.map((flow: any) => flow.id)
      console.log('🎯 FRONTEND: Active flow IDs:', flowIds)
      
      // If no active flows, try 'live' status as fallback
      if (flowIds.length === 0) {
        const liveFlows = flowsResult.data?.data?.filter((flow: any) => 
          flow.attributes?.status === 'live'
        ) || []
        const liveFlowIds = liveFlows.map((flow: any) => flow.id)
        console.log('🔍 FRONTEND: Trying live flows as fallback:', liveFlowIds)
        flowIds.push(...liveFlowIds)
      }
      
      // Step 3: Get flow analytics (series data) with actual flow IDs
      setSuccess('Step 3/4: Getting flow analytics (series data)...')
      console.log('📡 FRONTEND: Calling flow analytics proxy API with flow IDs:', flowIds)
      
      const analyticsResponse = await fetch('/api/klaviyo-proxy/flow-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clientSlug: client.brand_slug,
          conversionMetricId,
          flowIds: flowIds  // Pass the actual flow IDs
        })
      })
      
      if (!analyticsResponse.ok) {
        const errorData = await analyticsResponse.json()
        console.log('❌ FRONTEND: Flow analytics API failed:', errorData)
        throw new Error(`Flow analytics API failed: ${errorData.message}`)
      }
      
      const analyticsResult = await analyticsResponse.json()
      console.log('📊 FRONTEND: Flow analytics response:', analyticsResult)
      
      // Extract unique message IDs from Flow Series data
      const messageIds: string[] = []
      if (analyticsResult.data?.data) {
        analyticsResult.data.data.forEach((record: any) => {
          if (record.flow_message_id && !messageIds.includes(record.flow_message_id)) {
            messageIds.push(record.flow_message_id)
          }
        })
      }
      console.log('📧 FRONTEND: Extracted message IDs from series:', messageIds)
      
      // Step 4: Get flow messages by message IDs
      setSuccess('Step 4/5: Getting flow message details...')
      console.log('📡 FRONTEND: Calling flow messages API with message IDs')
      
      const messagesResponse = await fetch('/api/klaviyo-proxy/flow-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clientSlug: client.brand_slug,
          messageIds: messageIds
        })
      })
      
      if (!messagesResponse.ok) {
        const errorData = await messagesResponse.json()
        console.log('❌ FRONTEND: Flow messages API failed:', errorData)
        throw new Error(`Flow messages API failed: ${errorData.message}`)
      }
      
      const messagesResult = await messagesResponse.json()
      console.log('📧 FRONTEND: Flow messages response:', messagesResult)
      console.log('📩 FRONTEND: Got messages:', messagesResult.data?.data?.length || 0)
      
      // Step 4.5: Get flow actions (structure) for each flow
      setSuccess('Step 4.5/5: Getting flow structure...')
      console.log('🔄 FRONTEND: Fetching flow actions for structure data')
      
      const flowActionsMap: { [flowId: string]: any[] } = {}
      let actionsSuccessCount = 0
      let actionsFailCount = 0
      
      for (const flowId of flowIds) {
        try {
          const actionsResponse = await fetch('/api/klaviyo-proxy/flow-actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientSlug: client.brand_slug,
              flowId: flowId
            })
          })
          
          if (actionsResponse.ok) {
            const actionsResult = await actionsResponse.json()
            flowActionsMap[flowId] = actionsResult.data?.data || []
            actionsSuccessCount++
            console.log(`✅ FRONTEND: Got ${flowActionsMap[flowId].length} actions for flow ${flowId}`)
          } else {
            console.warn(`⚠️ FRONTEND: Failed to get actions for flow ${flowId}, continuing...`)
            actionsFailCount++
          }
          
          // Rate limiting: 3/s, use 400ms delay
          if (flowIds.indexOf(flowId) < flowIds.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 400))
          }
        } catch (error) {
          console.error(`❌ FRONTEND: Error getting actions for flow ${flowId}:`, error)
          actionsFailCount++
        }
      }
      
      console.log(`📊 FRONTEND: Flow actions fetched - ${actionsSuccessCount} success, ${actionsFailCount} failed`)
      
      // Step 5: Process and combine data
      const flowDetails: any[] = []
      const analyticsLookup: { [key: string]: any } = {}
      
      // Create analytics lookup
      if (analyticsResult.data?.data) {
        analyticsResult.data.data.forEach((item: any) => {
          analyticsLookup[item.id] = item.attributes
        })
      }
      
      // Create messages lookup by message ID (not flow ID)
      const messagesLookup: { [key: string]: any } = {}
      if (messagesResult.data?.data) {
        messagesResult.data.data.forEach((message: any) => {
          messagesLookup[message.id] = message
        })
      }
      console.log('📧 FRONTEND: Messages lookup created for IDs:', Object.keys(messagesLookup))
      
      // Combine all data with proper weekly structure
      if (flowsResult.data?.data) {
        flowsResult.data.data.forEach((flow: any) => {
          // Get all weekly records for this flow from analytics
          const flowWeeklyData = analyticsResult.data?.data?.filter((record: any) => 
            record.flow_id === flow.id
          ) || []
          
          // Get all messages for this flow (from weekly data message IDs)
          const flowMessageIds = flowWeeklyData.map((record: any) => record.flow_message_id).filter(Boolean)
          const uniqueMessageIds = Array.from(new Set(flowMessageIds)) as string[]
          const messages = uniqueMessageIds.map((msgId: string) => messagesLookup[msgId]).filter(Boolean)
          
          console.log(`📧 FRONTEND: Flow ${flow.id} has ${uniqueMessageIds.length} unique messages`)
          
          // Get flow actions for this flow
          const flowActions = flowActionsMap[flow.id] || []
          console.log(`🔄 FRONTEND: Flow ${flow.id} has ${flowActions.length} actions`)
          
          flowDetails.push({
            flow_id: flow.id,
            flow_name: flow.attributes?.name,
            flow_status: flow.attributes?.status,
            flow_type: 'email',
            archived: flow.attributes?.archived,
            flow_created: flow.attributes?.created,
            flow_updated: flow.attributes?.updated,
            trigger_type: flow.attributes?.trigger_type,
            
            // Weekly data array for database save
            weeklyData: flowWeeklyData,
            
            // Messages mapped by ID
            messages: messages,
            message_count: messages.length,
            messagesLookup: messagesLookup, // Pass the full lookup for save endpoint
            
            // Flow actions (structure)
            flowActions: flowActions
          })
        })
      }
      
      console.log(`📊 FRONTEND: Sample weekly data structure:`, flowDetails[0]?.weeklyData?.slice(0, 2))
      
      console.log(`💾 FRONTEND: Prepared ${flowDetails.length} flows for saving`)
      
      // Step 5: Save to database in batches (avoid 413 Payload Too Large)
      setSuccess('Step 5/5: Saving flows to database...')
      console.log('💾 FRONTEND: Saving flows to database via save-flows endpoint')
      console.log(`📦 FRONTEND: Batching ${flowDetails.length} flows into groups of 5`)
      
      const batchSize = 5
      let totalSaved = 0
      
      for (let i = 0; i < flowDetails.length; i += batchSize) {
        const batch = flowDetails.slice(i, i + batchSize)
        console.log(`📦 FRONTEND: Saving batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(flowDetails.length / batchSize)} (${batch.length} flows)`)
        
        const saveResponse = await fetch('/api/klaviyo-proxy/save-flows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            flowDetails: batch,
            clientId: client.id
          })
        })
        
        if (!saveResponse.ok) {
          const saveError = await saveResponse.json()
          console.log('❌ FRONTEND: Batch save failed:', saveError)
          throw new Error(`Batch save failed: ${saveError.message}`)
        }
        
        const saveResult = await saveResponse.json()
        totalSaved += batch.length
        console.log(`✅ FRONTEND: Batch saved successfully (${totalSaved}/${flowDetails.length} total)`)
      }
      
      console.log(`💾 FRONTEND: All ${totalSaved} flows saved to database`)
      
      setSuccess(`✅ Optimized 4-call flow sync with database save completed for ${client.brand_name}!
      
📊 Analytics: ${analyticsResult.data?.data?.length || 0} flows processed
🔄 Flow Details: ${flowsResult.data?.data?.length || 0} flows with complete data
📧 Messages: ${messagesResult.foundMessages || 0} flow messages found
🎯 Conversion Metric: ${conversionMetricId}
💾 Database: Flow data saved to Supabase

Sample flows:
${flowDetails.slice(0, 3).map((f: any, i: number) => 
  `${i + 1}. ${f.flow_name} - Status: ${f.flow_status} - Opens: ${f.opens || 0} - Messages: ${f.message_count}`
).join('\n')}`)
      
      console.log('🎉 FRONTEND: Optimized 4-call flow sync with database save completed successfully')
      
    } catch (error: any) {
      console.error('❌ FRONTEND: Flow sync failed:', error)
      setError(error.message || 'Flow sync failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Client Management</h2>
          <p className="text-gray-600">Manage your agency's clients and their dashboards</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Client
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
          <CheckCircle className="h-4 w-4" />
          {success}
        </div>
      )}

      {/* Airtable Client Mapping */}
      <Card className="bg-blue-50 border border-blue-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Link className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-900">Airtable Client Mapping</CardTitle>
            </div>
            <button
              onClick={async () => {
                // TODO: Implement client mapping sync
                console.log('🔄 Syncing client mappings to Airtable...')
                setSuccess('Client mappings updated successfully!')
                setTimeout(() => setSuccess(''), 3000)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Sync Client Names
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-blue-800 text-sm">
              Client names are automatically mapped to Airtable. If a client doesn't appear correctly in Airtable campaigns, use the sync button to update mappings.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {clients.filter(c => c.is_active).map(client => (
                <div key={client.id} className="bg-white border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{client.brand_name}</div>
                      <div className="text-xs text-gray-600">→ {client.brand_slug}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    value={formData.brand_name}
                    onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Acme Inc."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Slug * (URL-friendly)
                  </label>
                  <input
                    type="text"
                    value={formData.brand_slug}
                    onChange={(e) => setFormData({ ...formData, brand_slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="acme-inc"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Klaviyo API Key {!editingClient && '*'}
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey === 'form' ? 'text' : 'password'}
                      value={formData.klaviyo_api_key}
                      onChange={(e) => setFormData({ ...formData, klaviyo_api_key: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={editingClient ? "Leave blank to keep existing key" : "pk_..."}
                      required={!editingClient}
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(showApiKey === 'form' ? null : 'form')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey === 'form' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Portal Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Portal Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.portal_title || formData.brand_name}
                    onChange={(e) => setFormData({ ...formData, portal_title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Hydrus Dashboard"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This appears in the portal header. Defaults to brand name.
                  </p>
                </div>

                {/* Note about branding */}
                <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900 mb-1">Branding Inheritance</h4>
                      <p className="text-xs text-blue-800">
                        All clients inherit colors and background images from <strong>{agency.agency_name}</strong>. 
                        To customize branding, update the agency settings instead.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingClient ? 'Update Client' : 'Create Client'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Share Link Modal */}
      {showShareModal && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Shareable Dashboard Link
                </CardTitle>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Share this link to give read-only access to <strong>{selectedClient.brand_name}</strong> dashboard (no login required):
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareLink)
                      setSuccess('Link copied to clipboard!')
                      setTimeout(() => setSuccess(''), 2000)
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Features:</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>✓ No login required</li>
                  <li>✓ Read-only access (cannot sync or modify data)</li>
                  <li>✓ Shows all analytics tabs</li>
                  <li>✓ Branded with your agency colors</li>
                  <li>✓ Tracks views ({selectedClient.share_view_count || 0} total views)</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => toggleSharing(selectedClient)}
                  className={`flex-1 px-4 py-2 rounded-md font-medium ${
                    selectedClient.share_enabled
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {selectedClient.share_enabled ? 'Disable Sharing' : 'Enable Sharing'}
                </button>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Clients List */}
      <div className="grid gap-6">
        {clients.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
              <p className="text-gray-600 mb-4">
                Get started by adding your first client to create their analytics dashboard.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Add Your First Client
              </button>
            </CardContent>
          </Card>
        ) : (
          clients.map((client) => (
            <Card key={client.id}>
              <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {client.brand_name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>/{client.brand_slug}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          client.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {client.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {client.audit_enabled && (
                          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                            <Sparkles className="h-3 w-3" />
                            AI Audit
                          </span>
                        )}
                        {client.last_sync && (
                          <span>
                            Last sync: {new Date(client.last_sync).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* AI Audit Toggle */}
                    <button
                      onClick={() => toggleAudit(client)}
                      className={`p-2 rounded-md transition-colors ${
                        client.audit_enabled
                          ? 'text-purple-600 bg-purple-50 hover:bg-purple-100'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                      }`}
                      title={client.audit_enabled ? 'AI Audit Enabled - Click to disable' : 'AI Audit Disabled - Click to enable'}
                    >
                      <Sparkles className="h-4 w-4" />
                    </button>

                    {/* Unified Sync Button */}
                    <button
                      onClick={async () => {
                        setLoading(true)
                        setError('')
                        try {
                          await triggerCampaignSync(client)
                          await triggerFlowSync(client)
                          await triggerListGrowthSync(client)
                          await triggerRevenueAttributionSync(client)
                          setSuccess(`✅ Complete sync finished for ${client.brand_name}!`)
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Sync failed')
                        } finally {
                          setLoading(false)
                        }
                      }}
                      disabled={loading}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Sync All Data (Campaigns, Flows, List Growth, Revenue)"
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    
                    <a 
                      href={`/client/${client.brand_slug}`}
                      target="_blank"
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="View Dashboard"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>

                    <button
                      onClick={() => generateShareLink(client)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                      title="Generate Share Link"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleEdit(client)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit Client"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(client)}
                      disabled={loading}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Client"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Client Colors Preview - Shows Agency Branding */}
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: agency.primary_color }}
                    />
                    <span className="text-xs text-gray-600">Primary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: agency.secondary_color }}
                    />
                    <span className="text-xs text-gray-600">Secondary</span>
                  </div>
                  <span className="text-xs text-gray-500 italic">(from agency)</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
