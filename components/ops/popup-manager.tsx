'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PopupDetailModal } from './popup-detail-modal'
import { 
  MousePointer,
  Plus,
  Calendar as CalendarIcon,
  Columns
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
  status: 'strategy' | 'copy' | 'design' | 'qa' | 'client_approval' | 'approved' | 'live' | 'revisions'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  target_audience?: string
  copy_doc_url?: string
  design_file_url?: string
  preview_url?: string
  internal_notes?: string
  client_feedback?: string
}

interface PopupManagerProps {
  clients: any[]
  selectedClient: string
}

export function PopupManager({ clients, selectedClient }: PopupManagerProps) {
  const [popups, setPopups] = useState<Popup[]>([])
  const [selectedPopup, setSelectedPopup] = useState<Popup | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPopups()
  }, [selectedClient, clients])

  const fetchPopups = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/ops/popups?clientId=${selectedClient}`)
      const data = await response.json()
      
      if (data.success && data.popups) {
        const transformedPopups = data.popups.map((p: any) => ({
          ...p,
          launch_date: new Date(p.launch_date),
          client_name: clients.find(cl => cl.id === p.client_id)?.brand_name || 'Unknown',
          client_color: clients.find(cl => cl.id === p.client_id)?.primary_color || '#3B82F6'
        }))
        setPopups(transformedPopups)
      }
    } catch (error) {
      console.error('Error fetching popups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPopup = () => {
    const newPopup: Popup = {
      id: `new-${Date.now()}`,
      popup_name: '',
      client_id: selectedClient === 'all' ? clients[0]?.id : selectedClient,
      client_name: selectedClient === 'all' ? clients[0]?.brand_name : clients.find(c => c.id === selectedClient)?.brand_name || '',
      client_color: selectedClient === 'all' ? clients[0]?.primary_color : clients.find(c => c.id === selectedClient)?.primary_color || '#3B82F6',
      popup_type: 'exit_intent',
      trigger_type: 'Exit Intent',
      offer: '',
      launch_date: new Date(),
      status: 'strategy',
      priority: 'normal'
    }
    setSelectedPopup(newPopup)
  }

  const handleSavePopup = async (updatedPopup: Popup) => {
    try {
      const isNew = updatedPopup.id.startsWith('new-')
      
      if (isNew) {
        const response = await fetch('/api/ops/popups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...updatedPopup,
            agency_id: clients.find(c => c.id === updatedPopup.client_id)?.agency_id,
            launch_date: updatedPopup.launch_date.toISOString()
          })
        })
        
        const data = await response.json()
        if (data.success) {
          await fetchPopups()
        }
      } else {
        const response = await fetch('/api/ops/popups', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...updatedPopup,
            launch_date: updatedPopup.launch_date.toISOString()
          })
        })
        
        const data = await response.json()
        if (data.success) {
          setPopups(popups.map(p => p.id === updatedPopup.id ? updatedPopup : p))
        }
      }
      
      setSelectedPopup(null)
    } catch (error) {
      console.error('Error saving popup:', error)
      alert('Failed to save popup')
    }
  }

  const handleDeletePopup = async (popupId: string) => {
    try {
      const response = await fetch(`/api/ops/popups?id=${popupId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      if (data.success) {
        setPopups(popups.filter(p => p.id !== popupId))
        console.log('✅ Popup deleted')
      }
      
      setSelectedPopup(null)
    } catch (error) {
      console.error('Error deleting popup:', error)
      alert('Failed to delete popup')
    }
  }

  // Filter popups by selected client
  const filteredPopups = popups.filter(popup => 
    selectedClient === 'all' || popup.client_id === selectedClient
  )

  if (loading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60 mx-auto mb-4"></div>
          <p className="text-white/70">Loading popups...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <MousePointer className="h-5 w-5" />
                Popup Management
              </CardTitle>
              <div className="text-white/70 text-sm mt-1">
                Manage exit intent, scroll triggers, and other popup campaigns
              </div>
            </div>
            <button
              onClick={handleAddPopup}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border border-white/30"
            >
              <Plus className="h-4 w-4" />
              New Popup
            </button>
          </div>
        </CardHeader>
      </Card>

      {/* Popups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPopups.length === 0 ? (
          <Card className="bg-white/5 border-white/10 md:col-span-2 lg:col-span-3">
            <CardContent className="p-8 text-center">
              <MousePointer className="h-12 w-12 mx-auto mb-3 text-white/40" />
              <p className="text-white/70">No popups yet</p>
              <p className="text-white/50 text-sm">Click "New Popup" to create one</p>
            </CardContent>
          </Card>
        ) : (
          filteredPopups.map(popup => (
            <Card 
              key={popup.id}
              className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedPopup(popup)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div 
                    className="w-2 h-2 rounded-full mt-1"
                    style={{ backgroundColor: popup.client_color }}
                  />
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                    popup.status === 'live' ? 'bg-green-100 text-green-700' :
                    popup.status === 'client_approval' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {popup.status}
                  </span>
                </div>
                
                <h4 className="font-semibold text-gray-900 mb-1">{popup.popup_name}</h4>
                <p className="text-sm text-gray-600 mb-2">{popup.client_name}</p>
                <p className="text-xs text-gray-500 mb-2">{popup.trigger_type}</p>
                
                {popup.offer && (
                  <p className="text-sm text-gray-700 font-medium mb-2">"{popup.offer}"</p>
                )}
                
                <div className="text-xs text-gray-500">
                  Launch: {popup.launch_date.toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Popup Detail Modal */}
      {selectedPopup && (
        <PopupDetailModal
          popup={selectedPopup}
          clients={clients}
          onClose={() => setSelectedPopup(null)}
          onSave={handleSavePopup}
          onDelete={handleDeletePopup}
        />
      )}
    </div>
  )
}

