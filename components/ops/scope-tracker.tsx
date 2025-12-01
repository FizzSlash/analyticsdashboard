'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScopeDetailModal } from './scope-detail-modal'
import { 
  Target,
  TrendingUp,
  AlertTriangle,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  ChevronRight,
  CheckCircle
} from 'lucide-react'

interface ScopeConfig {
  client_id: string
  client_name: string
  campaigns_min: number
  campaigns_max: number
  flows_limit: number
  ab_tests_limit: number
  sms_limit: number
  invoice_date: number // Day of month (1-31)
  retainer_amount: number
}

interface ScopeUsage {
  client_id: string
  campaigns_used: number
  flows_used: number
  ab_tests_used: number
  sms_used: number
  month_year: string
}

interface ScopeTrackerProps {
  clients: any[]
  selectedClient: string
  campaigns: any[] // To auto-count usage
  agencyId?: string
}

export function ScopeTracker({ clients, selectedClient, campaigns, agencyId }: ScopeTrackerProps) {
  const [selectedClientDetail, setSelectedClientDetail] = useState<string | null>(null)
  const [scopeConfigs, setScopeConfigs] = useState<ScopeConfig[]>([])
  const [scopeUsage, setScopeUsage] = useState<Record<string, ScopeUsage>>({})
  const [loading, setLoading] = useState(true)

  // Fetch scope data from API
  useEffect(() => {
    const fetchScopeData = async () => {
      try {
        setLoading(true)
        
        // Fetch config and usage for each client
        const configPromises = clients.map(async (client) => {
          const configResponse = await fetch(`/api/ops/scope?type=config&clientId=${client.id}`)
          const usageResponse = await fetch(`/api/ops/scope?type=usage&clientId=${client.id}`)
          
          const configData = await configResponse.json()
          const usageData = await usageResponse.json()
          
          return {
            config: configData.data || {
              client_id: client.id,
              client_name: client.brand_name,
              campaigns_min: 8,
              campaigns_max: 12,
              flows_limit: 2,
              ab_tests_limit: 3,
              sms_limit: 6,
              invoice_date: 15,
              retainer_amount: 3500
            },
            usage: usageData.data || {
              client_id: client.id,
              campaigns_used: 0,
              flows_used: 0,
              ab_tests_used: 0,
              sms_used: 0
            }
          }
        })
        
        const results = await Promise.all(configPromises)
        
        setScopeConfigs(results.map(r => ({ ...r.config, client_name: clients.find(c => c.id === r.config.client_id)?.brand_name })))
        
        const usageMap = results.reduce((acc, r) => {
          acc[r.usage.client_id] = r.usage
          return acc
        }, {} as Record<string, ScopeUsage>)
        setScopeUsage(usageMap)
        
      } catch (error) {
        console.error('Error fetching scope data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (clients.length > 0) {
      fetchScopeData()
    }
  }, [clients])

  // Data now comes from API fetch above

  const getUsagePercentage = (used: number, max: number) => {
    return Math.round((used / max) * 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return { bg: 'bg-red-500', text: 'text-red-400', badge: 'bg-red-500/20 text-red-300 border-red-400/30' }
    if (percentage >= 75) return { bg: 'bg-orange-500', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-300 border-orange-400/30' }
    return { bg: 'bg-green-500', text: 'text-green-400', badge: 'bg-green-500/20 text-green-300 border-green-400/30' }
  }

  const getDaysUntilInvoice = (invoiceDay: number) => {
    const today = new Date()
    const currentDay = today.getDate()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    let nextInvoiceDate = new Date(currentYear, currentMonth, invoiceDay)
    
    if (currentDay >= invoiceDay) {
      // Next invoice is next month
      nextInvoiceDate = new Date(currentYear, currentMonth + 1, invoiceDay)
    }
    
    const diffTime = nextInvoiceDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  // Filter clients
  const filteredConfigs = selectedClient === 'all' 
    ? scopeConfigs 
    : scopeConfigs.filter(c => c.client_id === selectedClient)

  return (
    <div className="space-y-6">
      {/* Scope Header */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white text-xl flex items-center gap-2">
            <Target className="h-5 w-5" />
            Scope Tracking
          </CardTitle>
          <div className="text-white/70 text-sm mt-1">
            Monitor monthly campaign limits and invoice cycles
          </div>
        </CardHeader>
      </Card>

      {/* Client Scope Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredConfigs.map(config => {
          const usage = scopeUsage[config.client_id]
          const percentage = getUsagePercentage(usage.campaigns_used, config.campaigns_max)
          const colors = getUsageColor(percentage)
          const daysUntilInvoice = getDaysUntilInvoice(config.invoice_date)
          
          return (
            <Card 
              key={config.client_id} 
              className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedClientDetail(config.client_id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900">{config.client_name}</CardTitle>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Campaigns Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Email Campaigns</span>
                    <span className={`text-sm font-bold ${colors.text}`}>
                      {usage.campaigns_used}/{config.campaigns_max}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${colors.bg}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  {percentage >= 75 && (
                    <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {percentage >= 90 ? 'Near limit!' : 'Approaching limit'}
                    </div>
                  )}
                </div>

                {/* Other Limits */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Flows</span>
                    <span className="font-semibold text-gray-900">
                      {usage.flows_used}/{config.flows_limit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">A/B Tests</span>
                    <span className="font-semibold text-gray-900">
                      {usage.ab_tests_used}/{config.ab_tests_limit}
                    </span>
                  </div>
                </div>

                {/* Invoice Info */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Renews in</span>
                    <span className="font-semibold text-blue-600">
                      {daysUntilInvoice} days
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredConfigs.length === 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-12 text-center">
            <Target className="h-16 w-16 mx-auto mb-4 text-white/40" />
            <div className="text-white text-lg mb-2">No Clients Selected</div>
            <div className="text-white/60 text-sm">
              Select a client to view their scope tracking
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-4">
            <div className="text-white/70 text-sm">Total Clients</div>
            <div className="text-2xl font-bold text-white">{filteredConfigs.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-4">
            <div className="text-white/70 text-sm">At/Over 75%</div>
            <div className="text-2xl font-bold text-orange-400">
              {filteredConfigs.filter(c => {
                const usage = scopeUsage[c.client_id]
                const pct = getUsagePercentage(usage.campaigns_used, c.campaigns_max)
                return pct >= 75
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-4">
            <div className="text-white/70 text-sm">Near Limit (90%+)</div>
            <div className="text-2xl font-bold text-red-400">
              {filteredConfigs.filter(c => {
                const usage = scopeUsage[c.client_id]
                const pct = getUsagePercentage(usage.campaigns_used, c.campaigns_max)
                return pct >= 90
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-4">
            <div className="text-white/70 text-sm">Renewals This Week</div>
            <div className="text-2xl font-bold text-blue-400">
              {filteredConfigs.filter(c => getDaysUntilInvoice(c.invoice_date) <= 7).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Detail Modal */}
      {selectedClientDetail && (
        <ScopeDetailModal
          client={clients.find(c => c.id === selectedClientDetail)}
          config={scopeConfigs.find(c => c.client_id === selectedClientDetail)!}
          usage={scopeUsage[selectedClientDetail]}
          agencyId={agencyId}
          clients={clients}
          onSave={async (config, monthlyDoc) => {
            try {
              // Save scope config
              await fetch('/api/ops/scope', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'config', client_id: selectedClientDetail, ...config })
              })
              
              // Save monthly doc
              await fetch('/api/ops/scope', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'monthly', client_id: selectedClientDetail, ...monthlyDoc })
              })
              
              console.log('✅ Scope data saved')
              setSelectedClientDetail(null)
            } catch (error) {
              console.error('Error saving scope data:', error)
              alert('Failed to save scope data')
            }
          }}
          onClose={() => setSelectedClientDetail(null)}
        />
      )}
    </div>
  )
}

