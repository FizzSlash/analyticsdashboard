'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  X, 
  Save, 
  Trash2,
  Calendar,
  MousePointer,
  MessageSquare
} from 'lucide-react'

interface Popup {
  id: string
  popup_name: string
  client_id: string
  client_name: string
  client_color: string
  popup_type: string
  trigger_type: string
  offer: string
  launch_date: Date
  status: string
  priority: string
  target_audience?: string
  copy_doc_url?: string
  design_file_url?: string
  preview_url?: string
  internal_notes?: string
  client_feedback?: string
}

interface PopupDetailModalProps {
  popup: Popup
  clients: any[]
  onClose: () => void
  onSave: (popup: Popup) => void
  onDelete: (popupId: string) => void
}

export function PopupDetailModal({ popup: initialPopup, clients, onClose, onSave, onDelete }: PopupDetailModalProps) {
  const [popup, setPopup] = useState<Popup>(initialPopup)
  const [isSaving, setIsSaving] = useState(false)
  const isNewPopup = popup.id.startsWith('new-')

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      onSave(popup)
      setIsSaving(false)
    }, 500)
  }

  const handleDelete = () => {
    if (confirm(`Delete "${popup.popup_name}"?`)) {
      onDelete(popup.id)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: popup.client_color }}
              />
              <CardTitle className="text-gray-900 text-xl">
                {isNewPopup ? 'New Popup' : popup.popup_name}
              </CardTitle>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Popup Name & Client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Popup Name *
              </label>
              <input
                type="text"
                value={popup.popup_name}
                onChange={(e) => setPopup({ ...popup, popup_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Exit Intent - 10% Off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client *
              </label>
              <select
                value={popup.client_id}
                onChange={(e) => {
                  const newClientId = e.target.value
                  const newClient = clients.find(c => c.id === newClientId)
                  setPopup({ 
                    ...popup, 
                    client_id: newClientId,
                    client_name: newClient?.brand_name || '',
                    client_color: newClient?.primary_color || '#3B82F6'
                  })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.brand_name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Popup Type & Trigger */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Popup Type
              </label>
              <select
                value={popup.popup_type}
                onChange={(e) => setPopup({ ...popup, popup_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="exit_intent">Exit Intent</option>
                <option value="scroll">Scroll Trigger</option>
                <option value="time_delay">Time Delay</option>
                <option value="click_trigger">Click Trigger</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trigger Details
              </label>
              <input
                type="text"
                value={popup.trigger_type}
                onChange={(e) => setPopup({ ...popup, trigger_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Exit Intent, Scroll 50%, After 30 seconds"
              />
            </div>
          </div>

          {/* Offer & Target Audience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Offer/Message
              </label>
              <input
                type="text"
                value={popup.offer}
                onChange={(e) => setPopup({ ...popup, offer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Get 10% Off Your First Order"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Audience
              </label>
              <input
                type="text"
                value={popup.target_audience || ''}
                onChange={(e) => setPopup({ ...popup, target_audience: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="All visitors"
              />
            </div>
          </div>

          {/* Launch Date, Status, Priority */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Launch Date
              </label>
              <input
                type="date"
                value={popup.launch_date.toISOString().split('T')[0]}
                onChange={(e) => setPopup({ ...popup, launch_date: new Date(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={popup.status}
                onChange={(e) => setPopup({ ...popup, status: e.target.value as Popup['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="strategy">Strategy</option>
                <option value="copy">Copy</option>
                <option value="design">Design</option>
                <option value="qa">QA</option>
                <option value="client_approval">Client Approval</option>
                <option value="revisions">Revisions</option>
                <option value="approved">Approved</option>
                <option value="live">Live</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={popup.priority}
                onChange={(e) => setPopup({ ...popup, priority: e.target.value as Popup['priority'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Copy Doc URL
              </label>
              <input
                type="url"
                value={popup.copy_doc_url || ''}
                onChange={(e) => setPopup({ ...popup, copy_doc_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://docs.google.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preview URL
              </label>
              <input
                type="url"
                value={popup.preview_url || ''}
                onChange={(e) => setPopup({ ...popup, preview_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Internal Notes */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Internal Notes (Team Only)
            </h3>
            <textarea
              value={popup.internal_notes || ''}
              onChange={(e) => setPopup({ ...popup, internal_notes: e.target.value })}
              placeholder="Add notes for your team..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-sm"
            />
          </div>

          {/* Client Feedback */}
          {popup.client_feedback && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-orange-600" />
                Client Feedback
              </h3>
              <div className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-gray-800 whitespace-pre-wrap text-sm">{popup.client_feedback}</p>
              </div>
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex items-center justify-between">
          {!isNewPopup ? (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Popup
            </button>
          ) : (
            <div></div>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!popup.popup_name.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isNewPopup ? 'Create Popup' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

