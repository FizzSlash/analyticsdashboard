'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  X,
  Save,
  Mail,
  Plus,
  Trash2,
  Clock,
  Upload
} from 'lucide-react'

interface Flow {
  id: string
  client_id: string
  client_name: string
  client_color: string
  flow_name: string
  trigger_type: string
  status: 'strategy' | 'copy' | 'design' | 'qa' | 'client_approval' | 'approved' | 'live'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  num_emails: number
  preview_url?: string
  notes?: string
}

interface FlowDetailModalProps {
  flow: Flow | null
  clients: any[]
  onSave: (flow: Partial<Flow>) => void
  onClose: () => void
}

export function FlowDetailModal({ flow, clients, onSave, onClose }: FlowDetailModalProps) {
  const [formData, setFormData] = useState({
    flow_name: flow?.flow_name || '',
    client_id: flow?.client_id || clients[0]?.id || '',
    trigger_type: flow?.trigger_type || '',
    status: flow?.status || 'strategy',
    priority: flow?.priority || 'normal',
    num_emails: flow?.num_emails || 3,
    notes: flow?.notes || ''
  })

  const isNewFlow = !flow

  const handleSubmit = () => {
    if (!formData.flow_name || !formData.trigger_type) {
      alert('Please fill in flow name and trigger type')
      return
    }
    
    const selectedClient = clients.find(c => c.id === formData.client_id)
    
    onSave({
      ...flow,
      ...formData,
      client_name: selectedClient?.brand_name,
      client_color: selectedClient?.primary_color
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900">
              {isNewFlow ? 'Create New Flow' : 'Edit Flow'}
            </CardTitle>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Flow Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Flow Name *
            </label>
            <input
              type="text"
              value={formData.flow_name}
              onChange={(e) => setFormData({ ...formData, flow_name: e.target.value })}
              placeholder="e.g., Welcome Series, Abandoned Cart Recovery"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Client & Trigger */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Client
              </label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.brand_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trigger Type *
              </label>
              <input
                type="text"
                value={formData.trigger_type}
                onChange={(e) => setFormData({ ...formData, trigger_type: e.target.value })}
                placeholder="e.g., New Subscriber, Cart Abandonment, Order Placed"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status, Priority, Num Emails */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="strategy">Strategy</option>
                <option value="copy">Copy</option>
                <option value="design">Design</option>
                <option value="qa">QA</option>
                <option value="client_approval">Client Approval</option>
                <option value="approved">Approved</option>
                <option value="live">Live</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Number of Emails
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.num_emails}
                onChange={(e) => setFormData({ ...formData, num_emails: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Email Sequence Preview */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Sequence ({formData.num_emails} emails)
            </h3>
            <div className="space-y-2">
              {Array.from({ length: formData.num_emails }, (_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      Email #{i + 1}
                      {i === 0 && ' (Immediate)'}
                      {i === 1 && ' (+2 hours)'}
                      {i === 2 && ' (+1 day)'}
                      {i > 2 && ` (+${i} days)`}
                    </div>
                    <div className="text-xs text-gray-500">
                      Subject line and design will be added during copy/design stages
                    </div>
                  </div>
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              💡 Email timing and content will be configured during implementation
            </div>
          </div>

          {/* Image Upload Placeholder */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-900">
              <Upload className="h-4 w-4 inline mr-2" />
              <strong>Flow Preview Image:</strong> Image upload will be added (same as campaigns). Required for QA → Client Approval transition. Flows will auto-send to client portal for approval.
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              placeholder="Flow goals, strategy notes, performance observations..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none font-mono text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex items-center justify-between">
          <div></div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isNewFlow ? 'Create Flow' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

