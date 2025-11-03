'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  X,
  Save,
  Trophy,
  FileText,
  Calendar
} from 'lucide-react'

interface ABTest {
  id: string
  client_id: string
  client_name: string
  client_color: string
  test_name: string
  applies_to: 'campaign' | 'flow' | 'popup'
  test_type: string // Free text
  status: 'strategy' | 'in_progress' | 'implementation' | 'finalized'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  start_date?: Date
  winner?: string
  notes?: string
  num_variants: number
}

interface ABTestDetailModalProps {
  test: ABTest | null
  clients: any[]
  onSave: (test: Partial<ABTest>) => void
  onClose: () => void
}

export function ABTestDetailModal({ test, clients, onSave, onClose }: ABTestDetailModalProps) {
  const [formData, setFormData] = useState({
    test_name: test?.test_name || '',
    client_id: test?.client_id || clients[0]?.id || '',
    applies_to: test?.applies_to || 'campaign',
    test_type: test?.test_type || '',
    status: test?.status || 'strategy',
    priority: test?.priority || 'normal',
    start_date: test?.start_date || null,
    winner: test?.winner || '',
    notes: test?.notes || '',
    num_variants: test?.num_variants || 2
  })

  const isNewTest = !test

  const handleSubmit = () => {
    if (!formData.test_name) {
      alert('Please enter a test name')
      return
    }
    
    const selectedClient = clients.find(c => c.id === formData.client_id)
    
    onSave({
      ...test,
      ...formData,
      start_date: formData.start_date || undefined, // Convert null to undefined
      client_name: selectedClient?.brand_name,
      client_color: selectedClient?.primary_color
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-white w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900">
              {isNewTest ? 'Create New A/B Test' : 'Edit A/B Test'}
            </CardTitle>
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

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Test Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Test Name *
            </label>
            <input
              type="text"
              value={formData.test_name}
              onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
              placeholder="e.g., Black Friday Subject Line Test"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Client & Applies To */}
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
                Applies To
              </label>
              <select
                value={formData.applies_to}
                onChange={(e) => setFormData({ ...formData, applies_to: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="campaign">Campaign</option>
                <option value="flow">Flow</option>
                <option value="popup">Popup</option>
              </select>
            </div>
          </div>

          {/* Test Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What Are You Testing?
            </label>
            <input
              type="text"
              value={formData.test_type}
              onChange={(e) => setFormData({ ...formData, test_type: e.target.value })}
              placeholder="e.g., Subject Line, Send Time, Hero Image, CTA Color..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-xs text-gray-500 mt-1">
              Examples: Subject Line, Email Length, Send Time, From Name, Offer Type, Hero Image, CTA Button, etc.
            </div>
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
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
                <option value="in_progress">In Progress</option>
                <option value="implementation">Implementation</option>
                <option value="finalized">Finalized</option>
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
          </div>

          {/* Number of Variants & Start Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Number of Variants
              </label>
              <input
                type="number"
                min="2"
                max="5"
                value={formData.num_variants}
                onChange={(e) => setFormData({ ...formData, num_variants: parseInt(e.target.value) || 2 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-xs text-gray-500 mt-1">Usually 2-3 variants</div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date (Optional)
              </label>
              <input
                type="date"
                value={formData.start_date ? new Date(formData.start_date).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value ? new Date(e.target.value) : null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Winner (Finalized Tests Only) */}
          {formData.status === 'finalized' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-600" />
                Winner
              </label>
              <input
                type="text"
                value={formData.winner}
                onChange={(e) => setFormData({ ...formData, winner: e.target.value })}
                placeholder='e.g., Variant B: "Limited Time - 50% OFF"'
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes & Learnings
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              placeholder="Track insights, learnings, and observations...

Example:
• Urgency language outperformed by 12%
• Morning sends work best for this audience
• Short subject lines (< 50 chars) performed better"
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
              {isNewTest ? 'Create Test' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

