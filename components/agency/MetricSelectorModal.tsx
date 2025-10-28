'use client'

import { useState } from 'react'
import { X, CheckCircle, AlertTriangle } from 'lucide-react'

interface Metric {
  id: string
  attributes?: {
    name: string
    integration?: { name: string }
    created: string
  }
}

interface MetricSelectorModalProps {
  clientName: string
  metrics: Metric[]
  onSelect: (metric: Metric) => void
  onCancel: () => void
}

export function MetricSelectorModal({ clientName, metrics, onSelect, onCancel }: MetricSelectorModalProps) {
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null)
  
  // Filter to ONLY "Placed Order" metrics specifically
  const revenueMetrics = metrics.filter((m: any) => 
    m.attributes?.name === 'Placed Order'
  )
  
  // Suggest the best metric (e-commerce integration preferred)
  const suggestedMetric = revenueMetrics.find((m: any) => {
    const integrationName = m.attributes?.integration?.name?.toLowerCase() || ''
    return integrationName === 'shopify' || 
           integrationName === 'woocommerce' || 
           integrationName === 'bigcommerce' ||
           integrationName === 'magento'
  }) || revenueMetrics[0]
  
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      style={{ zIndex: 99999 }}
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Select Revenue Metric</h2>
              <p className="text-blue-100">Choose the metric for tracking revenue for <strong>{clientName}</strong></p>
            </div>
            <button
              onClick={onCancel}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {/* Body */}
        <div className="p-6">
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">First-time setup required</p>
                <p>Select which Klaviyo metric should be used to track revenue and conversions for this client. This is typically "Placed Order" from your e-commerce platform (Shopify, WooCommerce, etc.).</p>
              </div>
            </div>
          </div>
          
          {revenueMetrics.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <p>No revenue metrics found in Klaviyo.</p>
              <p className="text-sm mt-2">You can continue without revenue tracking or add metrics in Klaviyo first.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {revenueMetrics.map((metric: any) => {
                const isRecommended = metric.id === suggestedMetric?.id
                const integrationName = metric.attributes?.integration?.name || 'Custom/API'
                
                return (
                  <button
                    key={metric.id}
                    onClick={() => setSelectedMetric(metric)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedMetric?.id === metric.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    } ${isRecommended ? 'ring-2 ring-green-400' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">{metric.attributes?.name}</span>
                          {isRecommended && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                              ⭐ Recommended
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Integration:</span>
                            <span className={`ml-2 font-medium ${
                              integrationName === 'Shopify' ? 'text-green-600' :
                              integrationName === 'Custom/API' ? 'text-yellow-600' : 'text-blue-600'
                            }`}>
                              {integrationName}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Created:</span>
                            <span className="ml-2 text-gray-700">
                              {new Date(metric.attributes?.created || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Metric ID:</span>
                            <code className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                              {metric.id}
                            </code>
                          </div>
                        </div>
                      </div>
                      
                      {selectedMetric?.id === metric.id && (
                        <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            Skip for Now
          </button>
          <button
            onClick={() => selectedMetric && onSelect(selectedMetric)}
            disabled={!selectedMetric}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  )
}

