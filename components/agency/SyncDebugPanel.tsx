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

  const runSync = async (type: 'campaigns' | 'flows' | 'list-growth' | 'revenue') => {
    const client = clients.find(c => c.brand_slug === selectedClient)
    if (!client) return

    setLoading(type)
    setResults(null)
    setError('')

    try {
      let endpoint = ''
      let body: any = { clientSlug: client.brand_slug }

      switch (type) {
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
          // List growth needs to fetch data from Klaviyo first
          const listResponse = await fetch('/api/klaviyo-proxy/list-growth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              klaviyoApiKey: client.klaviyo_api_key,
              timeframe: 'last-365-days'
            })
          })
          const listData = await listResponse.json()
          
          endpoint = '/api/klaviyo-proxy/save-list-growth'
          body.growthData = listData.data
          body.interval = 'day'
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
    <div className="bg-gradient-to-br from-yellow-50/80 to-orange-50/80 backdrop-blur-sm rounded-2xl border border-yellow-200/50 shadow-lg p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🧪</span>
        <h2 className="text-xl font-bold text-gray-800">Debug Individual Syncs</h2>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Test individual sync operations without running full sync. Perfect for debugging revenue attribution!
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        {/* Client Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Client to Test:
          </label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">-- Choose a client --</option>
            {clients.map(client => (
              <option key={client.id} value={client.brand_slug}>
                {client.brand_name} ({client.brand_slug})
              </option>
            ))}
          </select>
        </div>
        
        {/* Sync Buttons */}
        {selectedClient && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => runSync('campaigns')}
              disabled={loading !== null}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
            >
              {loading === 'campaigns' ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Syncing...
                </>
              ) : (
                <>📧 Campaigns</>
              )}
            </button>
            
            <button
              onClick={() => runSync('flows')}
              disabled={loading !== null}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
            >
              {loading === 'flows' ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Syncing...
                </>
              ) : (
                <>🔄 Flows</>
              )}
            </button>
            
            <button
              onClick={() => runSync('list-growth')}
              disabled={loading !== null}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
            >
              {loading === 'list-growth' ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Syncing...
                </>
              ) : (
                <>📈 List Growth</>
              )}
            </button>
            
            <button
              onClick={() => runSync('revenue')}
              disabled={loading !== null}
              className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
            >
              {loading === 'revenue' ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Syncing...
                </>
              ) : (
                <>💰 Revenue</>
              )}
            </button>
          </div>
        )}
        
        {/* Results Display */}
        {results && (
          <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800">
                {results.type?.charAt(0).toUpperCase() + results.type?.slice(1)} Sync Results
              </h3>
              <div className="flex items-center gap-2">
                {results.status && (
                  <span className={`text-xs px-2 py-1 rounded ${results.status === 200 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    HTTP {results.status}
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {new Date(results.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
            
            {results.error ? (
              <div className="text-red-600 text-sm">
                ❌ Error: {results.error}
              </div>
            ) : (
              <div className="text-sm">
                <pre className="bg-gray-50 p-3 rounded overflow-auto max-h-96 text-xs font-mono">
                  {JSON.stringify(results.result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

