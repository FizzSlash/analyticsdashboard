'use client'

import { useState } from 'react'
import { Client } from '@/lib/supabase'

interface SyncDebugPanelProps {
  clients: Client[]
}

export function SyncDebugPanel({ clients }: SyncDebugPanelProps) {
  const [selectedClient, setSelectedClient] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState('')

  const runSync = async (type: 'campaigns' | 'flows' | 'list-growth' | 'revenue' | 'account') => {
    const client = clients.find(c => c.brand_slug === selectedClient)
    if (!client) return

    setLoading(type)
    setResults(null)
    setError('')

    try {
      let endpoint = ''
      let body: any = { clientSlug: client.brand_slug }

      switch (type) {
        case 'account':
          // Fetch account info (currency, timezone)
          const accountRes = await fetch('/api/klaviyo-proxy/account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ klaviyoApiKey: client.klaviyo_api_key })
          })
          const accountData = await accountRes.json()
          
          if (accountRes.ok && accountData.data?.data?.[0]?.attributes) {
            const attrs = accountData.data.data[0].attributes
            const currency = attrs.preferred_currency || 'USD'
            const timezone = attrs.timezone || 'America/New_York'
            
            // Save to client
            const saveRes = await fetch(`/api/clients/${client.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                preferred_currency: currency,
                timezone: timezone
              })
            })
            
            const saveResult = await saveRes.json()
            setResults({ 
              type, 
              result: { 
                ...accountData, 
                saved: saveRes.ok,
                savedData: { currency, timezone }
              }, 
              timestamp: new Date().toISOString(), 
              status: accountRes.status 
            })
          } else {
            setResults({ type, result: accountData, timestamp: new Date().toISOString(), status: accountRes.status })
          }
          return
        
        case:
        case 'campaigns':
          endpoint = '/api/klaviyo-proxy/save-campaigns'
          // First get campaigns
          const campaignsRes = await fetch('/api/klaviyo-proxy/campaigns-bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ klaviyoApiKey: client.klaviyo_api_key })
          })
          const campaignsData = await campaignsRes.json()
          
          // Then save them
          body.campaigns = campaignsData.data
          break
        
        case 'flows':
          endpoint = '/api/klaviyo-proxy/save-flows'
          body.conversionMetricId = client.conversion_metric_id
          break
        
        case 'list-growth':
          // List growth: Get metrics, query aggregates, then save
          // Step 1: Get all metrics
          const metricsRes = await fetch(`/api/klaviyo-proxy/metrics?clientSlug=${client.brand_slug}`)
          const metricsData = await metricsRes.json()
          const metrics = metricsData.data?.data || []
          const metricLookup: { [key: string]: string } = {}
          
          metrics.forEach((metric: any) => {
            metricLookup[metric.attributes.name] = metric.id
          })
          
          // Step 2: Get metric aggregates for subscription metrics
          const subscriptionMetrics = [
            'Subscribed to Email Marketing',
            'Unsubscribed from Email Marketing',
            'Subscribed to SMS Marketing',
            'Unsubscribed from SMS Marketing',
            'Form submitted by profile'
          ]
          
          const endDate = new Date().toISOString()
          const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
          
          const aggregateQueries = []
          for (const metricName of subscriptionMetrics) {
            if (metricLookup[metricName]) {
              aggregateQueries.push(
                fetch('/api/klaviyo-proxy/metric-aggregates', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    clientSlug: client.brand_slug,
                    metricId: metricLookup[metricName],
                    interval: 'day',
                    startDate,
                    endDate
                  })
                })
              )
            }
          }
          
          const aggregateResponses = await Promise.all(aggregateQueries)
          const aggregateResults = await Promise.all(
            aggregateResponses.map(r => r.json())
          )
          
          // Step 3: Transform aggregate data into growthData format
          const dateMap = new Map()
          
          aggregateResults.forEach((result, index) => {
            const metricName = subscriptionMetrics[index]
            const dates = result.data?.attributes?.dates || []
            const counts = result.data?.attributes?.data?.[0]?.measurements?.count_value || []
            
            dates.forEach((date: string, i: number) => {
              const dateKey = date.split('T')[0]
              if (!dateMap.has(dateKey)) {
                dateMap.set(dateKey, { date: dateKey })
              }
              
              const record = dateMap.get(dateKey)
              const count = counts[i] || 0
              
              // Map metric names to field names
              if (metricName === 'Subscribed to Email Marketing') {
                record.email_subscriptions = count
              } else if (metricName === 'Unsubscribed from Email Marketing') {
                record.email_unsubscribes = count
              } else if (metricName === 'Subscribed to SMS Marketing') {
                record.sms_subscriptions = count
              } else if (metricName === 'Unsubscribed from SMS Marketing') {
                record.sms_unsubscribes = count
              } else if (metricName === 'Form submitted by profile') {
                record.form_submissions = count
              }
            })
          })
          
          const transformedData = Array.from(dateMap.values())
          
          // Debug: Show what we got
          console.log('📊 LIST GROWTH DEBUG:', {
            metricsFound: Object.keys(metricLookup).length,
            queriesMade: aggregateQueries.length,
            aggregateResultsCount: aggregateResults.length,
            transformedRecords: transformedData.length,
            sampleAggregate: aggregateResults[0],
            sampleTransformed: transformedData[0]
          })
          
          // Step 4: Save (or return debug info if no data)
          endpoint = '/api/klaviyo-proxy/save-list-growth'
          body.growthData = transformedData
          body.interval = 'day'
          body._debug = {
            metricsFound: Object.keys(metricLookup),
            queriesMade: aggregateQueries.length,
            aggregateResultsReceived: aggregateResults.length,
            transformedRecords: transformedData.length
          }
          break
        
        case 'revenue':
          endpoint = '/api/klaviyo-proxy/save-revenue-attribution'
          body.conversionMetricId = client.conversion_metric_id
          body.timeframe = 'last-365-days'
          break
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const result = await response.json()
      setResults({ type, result, timestamp: new Date().toISOString(), status: response.status })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setResults({ type, error: err instanceof Error ? err.message : 'Unknown error', timestamp: new Date().toISOString() })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 mt-8">
      <details className="group">
        <summary className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white text-sm font-medium">
          <span className="text-base">🧪</span>
          Debug Individual Syncs
          <span className="ml-auto group-open:rotate-180 transition-transform">▼</span>
        </summary>
        
        <div className="mt-4 space-y-3">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-3 py-2 rounded text-sm mb-3">
              {error}
            </div>
          )}
          
          {/* Client Selector */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">
              Select Client:
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-3 py-1.5 border border-white/20 rounded bg-white/10 text-white text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Choose a client --</option>
              {clients.map(client => (
                <option key={client.id} value={client.brand_slug}>
                  {client.brand_name}
                </option>
              ))}
            </select>
          </div>
        
          {/* Sync Buttons */}
          {selectedClient && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <button
                  onClick={() => runSync('campaigns')}
                  disabled={loading !== null}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-sm transition-colors"
                >
                  {loading === 'campaigns' ? (
                    <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>📧 Campaigns</>
                  )}
                </button>
                
                <button
                  onClick={() => runSync('flows')}
                  disabled={loading !== null}
                  className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-sm transition-colors"
                >
                  {loading === 'flows' ? (
                    <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>🔄 Flows</>
                  )}
                </button>
                
                <button
                  onClick={() => runSync('list-growth')}
                  disabled={loading !== null}
                  className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-sm transition-colors"
                >
                  {loading === 'list-growth' ? (
                    <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>📈 List</>
                  )}
                </button>
                
                <button
                  onClick={() => runSync('revenue')}
                  disabled={loading !== null}
                  className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-sm transition-colors"
                >
                  {loading === 'revenue' ? (
                    <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>💰 Revenue</>
                  )}
                </button>
              </div>
              
              {/* Account Info Button (separate row) */}
              <div className="mt-2">
                <button
                  onClick={() => runSync('account')}
                  disabled={loading !== null}
                  className="w-full px-3 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-sm transition-colors"
                >
                  {loading === 'account' ? (
                    <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>🏢 Fetch Account Info (Currency & Timezone)</>
                  )}
                </button>
              </div>
            </>
          )}
          
          {/* Results Display */}
          {results && (
            <div className="mt-3 bg-white/5 rounded p-3 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-white text-sm">
                  {results.type?.charAt(0).toUpperCase() + results.type?.slice(1)} Results
                </h3>
                <div className="flex items-center gap-2">
                  {results.status && (
                    <span className={`text-xs px-2 py-0.5 rounded ${results.status === 200 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                      {results.status}
                    </span>
                  )}
                  <span className="text-xs text-white/50">
                    {new Date(results.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              
              {results.error ? (
                <div className="text-red-300 text-xs">
                  ❌ {results.error}
                </div>
              ) : (
                <div className="text-xs">
                  <pre className="bg-black/20 p-2 rounded overflow-auto max-h-48 text-xs font-mono text-white/70">
                    {JSON.stringify(results.result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </details>
    </div>
  )
}

