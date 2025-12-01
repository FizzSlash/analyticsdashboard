'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StrategicPlansManager } from './strategic-plans-manager'
import { 
  X,
  Save,
  Settings,
  Calendar,
  TrendingUp,
  FileText,
  DollarSign,
  Target
} from 'lucide-react'

interface ScopeConfig {
  campaigns_min: number
  campaigns_max: number
  flows_limit: number
  ab_tests_limit: number
  sms_limit: number
  invoice_date: number
  retainer_amount: number
}

interface MonthlyDoc {
  month_year: string
  scope_initiatives: string
  key_findings: string
  client_requests: string
  strategic_notes: string
  performance_highlights: string
}

interface ScopeDetailModalProps {
  client: any
  config: ScopeConfig
  usage: any
  onSave: (config: ScopeConfig, monthlyDoc: MonthlyDoc) => void
  onClose: () => void
  agencyId?: string
  clients?: any[]
}

export function ScopeDetailModal({ client, config, usage, onSave, onClose, agencyId, clients }: ScopeDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'config' | 'monthly' | 'history' | 'plans'>('monthly')
  const [scopeConfig, setScopeConfig] = useState<ScopeConfig>(config)
  const [monthlyDoc, setMonthlyDoc] = useState<MonthlyDoc>({
    month_year: new Date().toISOString().slice(0, 7),
    scope_initiatives: '',
    key_findings: '',
    client_requests: '',
    strategic_notes: '',
    performance_highlights: ''
  })

  // Mock historical data
  const historicalData = [
    { month: 'Oct 2025', campaigns: 12, flows: 2, popups: 4, limit: 12 },
    { month: 'Sep 2025', campaigns: 10, flows: 1, popups: 3, limit: 12 },
    { month: 'Aug 2025', campaigns: 11, flows: 2, popups: 4, limit: 12 },
    { month: 'Jul 2025', campaigns: 9, flows: 1, popups: 2, limit: 12 },
    { month: 'Jun 2025', campaigns: 12, flows: 2, popups: 4, limit: 12 },
    { month: 'May 2025', campaigns: 8, flows: 1, popups: 3, limit: 12 }
  ]

  const handleSave = () => {
    onSave(scopeConfig, monthlyDoc)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900">{client.brand_name} - Scope Management</CardTitle>
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }} 
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-4">
            {[
              { id: 'monthly', label: 'Monthly Doc', icon: FileText },
              { id: 'config', label: 'Configuration', icon: Settings },
              { id: 'plans', label: '30/60/90 Plans', icon: Target },
              { id: 'history', label: 'History', icon: TrendingUp }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <CardContent className="flex-1 overflow-y-auto p-6">
          {/* Monthly Documentation Tab */}
          {activeTab === 'monthly' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-900">
                  <strong>Monthly Documentation</strong> - Track initiatives, findings, and strategy notes for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Scope Initiatives This Month
                </label>
                <textarea
                  value={monthlyDoc.scope_initiatives}
                  onChange={(e) => setMonthlyDoc({ ...monthlyDoc, scope_initiatives: e.target.value })}
                  rows={4}
                  placeholder="What are the key initiatives and focus areas for this month?

Example:
• Focus on retention campaigns
• Launch new product line
• Optimize welcome flow"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Key Findings & Insights
                </label>
                <textarea
                  value={monthlyDoc.key_findings}
                  onChange={(e) => setMonthlyDoc({ ...monthlyDoc, key_findings: e.target.value })}
                  rows={4}
                  placeholder="What did we learn this month?

Example:
• Open rates up 15% with new subject line strategy
• Lifestyle product photos perform 23% better
• Tuesday sends outperform Thursday"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Client Requests & Out-of-Scope Items
                </label>
                <textarea
                  value={monthlyDoc.client_requests}
                  onChange={(e) => setMonthlyDoc({ ...monthlyDoc, client_requests: e.target.value })}
                  rows={4}
                  placeholder="Track requests that are outside normal scope...

Example:
• Requested SMS campaign (approved overage)
• Want weekly emails instead of bi-weekly (pending discussion)
• Asked about popup design (included in scope)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Strategic Notes & Opportunities
                </label>
                <textarea
                  value={monthlyDoc.strategic_notes}
                  onChange={(e) => setMonthlyDoc({ ...monthlyDoc, strategic_notes: e.target.value })}
                  rows={4}
                  placeholder="Future opportunities, upsells, or strategic observations...

Example:
• Client mentioned expanding to new market - opportunity for segmentation
• Revenue up 30% - good time to propose increasing retainer
• Mentioned interest in SMS - prepare SMS proposal for next month"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Performance Highlights
                </label>
                <textarea
                  value={monthlyDoc.performance_highlights}
                  onChange={(e) => setMonthlyDoc({ ...monthlyDoc, performance_highlights: e.target.value })}
                  rows={4}
                  placeholder="Key metrics and wins to share...

Example:
• Sent 12 campaigns, all within scope
• Average open rate: 28.5% (up from 24%)
• Revenue attributed: $45,000 (target was $35,000)
• Black Friday campaign: Best performer of the year"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none font-mono text-sm"
                />
              </div>
            </div>
          )}

          {/* Configuration Tab */}
          {activeTab === 'config' && (
            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-sm text-purple-900">
                  <strong>Scope Configuration</strong> - Set monthly limits and invoice settings for {client.brand_name}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Campaigns (Min)
                  </label>
                  <input
                    type="number"
                    value={scopeConfig.campaigns_min}
                    onChange={(e) => setScopeConfig({ ...scopeConfig, campaigns_min: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Campaigns (Max)
                  </label>
                  <input
                    type="number"
                    value={scopeConfig.campaigns_max}
                    onChange={(e) => setScopeConfig({ ...scopeConfig, campaigns_max: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Flows per Month
                  </label>
                  <input
                    type="number"
                    value={scopeConfig.flows_limit}
                    onChange={(e) => setScopeConfig({ ...scopeConfig, flows_limit: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    A/B Tests per Month
                  </label>
                  <input
                    type="number"
                    value={scopeConfig.ab_tests_limit}
                    onChange={(e) => setScopeConfig({ ...scopeConfig, ab_tests_limit: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    SMS Campaigns per Month
                  </label>
                  <input
                    type="number"
                    value={scopeConfig.sms_limit}
                    onChange={(e) => setScopeConfig({ ...scopeConfig, sms_limit: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Invoice Date (Day of Month)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={scopeConfig.invoice_date}
                    onChange={(e) => setScopeConfig({ ...scopeConfig, invoice_date: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Day of month when client is billed (1-31)
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monthly Retainer Amount ($)
                  </label>
                  <input
                    type="number"
                    value={scopeConfig.retainer_amount}
                    onChange={(e) => setScopeConfig({ ...scopeConfig, retainer_amount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Current Usage Summary */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Current Month Usage</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Campaigns:</span>
                    <span className="font-semibold">{usage.campaigns_used}/{scopeConfig.campaigns_max}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Flows:</span>
                    <span className="font-semibold">{usage.flows_used}/{scopeConfig.flows_limit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">A/B Tests:</span>
                    <span className="font-semibold">{usage.ab_tests_used}/{scopeConfig.ab_tests_limit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SMS:</span>
                    <span className="font-semibold">{usage.sms_used}/{scopeConfig.sms_limit}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Plans Tab */}
          {activeTab === 'plans' && (
            <div>
              {agencyId && clients ? (
                <StrategicPlansManager
                  clients={clients}
                  selectedClient={client.id}
                  agencyId={agencyId}
                />
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Strategic Plans feature requires additional setup</p>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-900">
                  <strong>Historical Scope Usage</strong> - Last 6 months
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { month: 'Oct 2025', campaigns: usage.campaigns_used, flows: usage.flows_used, ab_tests: usage.ab_tests_used, limit: config.campaigns_max },
                  { month: 'Sep 2025', campaigns: 10, flows: 1, ab_tests: 2, limit: 12 },
                  { month: 'Aug 2025', campaigns: 11, flows: 2, ab_tests: 3, limit: 12 },
                  { month: 'Jul 2025', campaigns: 9, flows: 1, ab_tests: 1, limit: 12 },
                  { month: 'Jun 2025', campaigns: 12, flows: 2, ab_tests: 3, limit: 12 },
                  { month: 'May 2025', campaigns: 8, flows: 1, ab_tests: 2, limit: 12 }
                ].map((month, index) => {
                  const percentage = Math.round((month.campaigns / month.limit) * 100)
                  const isOverage = month.campaigns > month.limit
                  
                  return (
                    <div key={month.month} className="p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-900">{month.month}</div>
                        <div className={`text-sm font-semibold ${isOverage ? 'text-red-600' : 'text-gray-900'}`}>
                          {month.campaigns}/{month.limit} campaigns {isOverage && '(+overage)'}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>Flows: {month.flows}</div>
                        <div>A/B Tests: {month.ab_tests}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Invoice Date: {config.invoice_date}th of month • ${config.retainer_amount}/month
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

