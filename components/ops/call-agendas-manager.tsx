'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Phone,
  Calendar,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  MessageSquare,
  CheckCircle,
  Eye,
  EyeOff,
  Play,
  FileText,
  Users,
  Clock,
  X,
  Save
} from 'lucide-react'

interface Call {
  id: string
  client_id: string
  call_date: string
  call_time: string
  call_title: string
  attendees: string
  agenda_link: string
  recording_link: string
  call_summary: string
  internal_notes: string
  show_in_portal: boolean
  questionCount?: number
  actionItemCount?: number
  approvalCount?: number
}

interface CallAgendasManagerProps {
  clients: any[]
  selectedClient: string
  agencyId: string
}

export function CallAgendasManager({ clients, selectedClient, agencyId }: CallAgendasManagerProps) {
  const [calls, setCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingCall, setEditingCall] = useState<Call | null>(null)
  const [expandedCall, setExpandedCall] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    client_id: '',
    call_date: '',
    call_time: '',
    call_title: '',
    attendees: '',
    agenda_link: '',
    recording_link: '',
    call_summary: '',
    internal_notes: '',
    show_in_portal: true
  })

  useEffect(() => {
    if (agencyId) {
      loadCalls()
    }
  }, [agencyId, selectedClient])

  const loadCalls = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/ops/calls?agencyId=${agencyId}&clientId=${selectedClient}`)
      const data = await response.json()

      if (data.success) {
        setCalls(data.calls || [])
      }
    } catch (error) {
      console.error('Error loading calls:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      client_id: selectedClient !== 'all' ? selectedClient : '',
      call_date: '',
      call_time: '',
      call_title: '',
      attendees: '',
      agenda_link: '',
      recording_link: '',
      call_summary: '',
      internal_notes: '',
      show_in_portal: true
    })
    setEditingCall(null)
  }

  const handleCreate = () => {
    resetForm()
    setShowModal(true)
  }

  const handleEdit = (call: Call) => {
    setFormData({
      client_id: call.client_id,
      call_date: call.call_date,
      call_time: call.call_time || '',
      call_title: call.call_title,
      attendees: call.attendees || '',
      agenda_link: call.agenda_link || '',
      recording_link: call.recording_link || '',
      call_summary: call.call_summary || '',
      internal_notes: call.internal_notes || '',
      show_in_portal: call.show_in_portal
    })
    setEditingCall(call)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingCall ? '/api/ops/calls' : '/api/ops/calls'
      const method = editingCall ? 'PATCH' : 'POST'
      
      const payload = editingCall
        ? { id: editingCall.id, ...formData }
        : { ...formData, agency_id: agencyId }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setShowModal(false)
        resetForm()
        loadCalls()
      }
    } catch (error) {
      console.error('Error saving call:', error)
    }
  }

  const handleDelete = async (callId: string) => {
    if (!confirm('Delete this call? This will also remove all associated questions, action items, and approvals.')) {
      return
    }

    try {
      const response = await fetch(`/api/ops/calls?id=${callId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadCalls()
      }
    } catch (error) {
      console.error('Error deleting call:', error)
    }
  }

  const togglePortalVisibility = async (call: Call) => {
    try {
      const response = await fetch('/api/ops/calls', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: call.id,
          show_in_portal: !call.show_in_portal
        })
      })

      if (response.ok) {
        loadCalls()
      }
    } catch (error) {
      console.error('Error toggling portal visibility:', error)
    }
  }

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.brand_name || 'Unknown Client'
  }

  const filteredCalls = selectedClient === 'all' 
    ? calls 
    : calls.filter(c => c.client_id === selectedClient)

  const upcomingCalls = filteredCalls.filter(c => new Date(c.call_date) >= new Date())
  const pastCalls = filteredCalls.filter(c => new Date(c.call_date) < new Date())

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-2xl font-bold">Call Agendas</h2>
          <p className="text-white/60 text-sm mt-1">
            Manage client calls, agendas, and follow-ups
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors border border-blue-400/30 font-medium"
        >
          <Plus className="h-4 w-4" />
          Create Call
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Upcoming Calls</p>
                <p className="text-white text-2xl font-bold">{upcomingCalls.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Phone className="h-5 w-5 text-purple-300" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Past Calls</p>
                <p className="text-white text-2xl font-bold">{pastCalls.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <MessageSquare className="h-5 w-5 text-green-300" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Client Questions</p>
                <p className="text-white text-2xl font-bold">
                  {calls.reduce((sum, call) => sum + (call.questionCount || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Calls */}
      {upcomingCalls.length > 0 && (
        <div>
          <h3 className="text-white text-lg font-semibold mb-3">Upcoming Calls</h3>
          <div className="space-y-3">
            {upcomingCalls.map((call) => (
              <Card key={call.id} className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-white font-semibold">{call.call_title}</h4>
                        {!call.show_in_portal && (
                          <span className="px-2 py-0.5 bg-gray-500/20 text-gray-300 text-xs rounded-full border border-gray-400/30">
                            Internal Only
                          </span>
                        )}
                        {(call.questionCount || 0) > 0 && (
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-400/30">
                            {call.questionCount} questions
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(call.call_date).toLocaleDateString()}
                        </span>
                        {call.call_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {call.call_time}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {getClientName(call.client_id)}
                        </span>
                      </div>
                      {call.attendees && (
                        <p className="text-white/50 text-xs mt-2">{call.attendees}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {call.agenda_link && (
                        <a
                          href={call.agenda_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-white/10 hover:bg-white/20 text-white/70 rounded-lg transition-colors"
                          title="View Agenda"
                        >
                          <FileText className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => togglePortalVisibility(call)}
                        className={`p-2 rounded-lg transition-colors ${
                          call.show_in_portal
                            ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                            : 'bg-gray-500/20 text-gray-300 hover:bg-gray-500/30'
                        }`}
                        title={call.show_in_portal ? 'Visible in portal' : 'Hidden from portal'}
                      >
                        {call.show_in_portal ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleEdit(call)}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
                        title="Edit Call"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(call.id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                        title="Delete Call"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Calls */}
      {pastCalls.length > 0 && (
        <div>
          <h3 className="text-white text-lg font-semibold mb-3">Past Calls</h3>
          <div className="space-y-3">
            {pastCalls.map((call) => (
              <Card key={call.id} className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-white font-semibold">{call.call_title}</h4>
                        {!call.show_in_portal && (
                          <span className="px-2 py-0.5 bg-gray-500/20 text-gray-300 text-xs rounded-full border border-gray-400/30">
                            Internal Only
                          </span>
                        )}
                        {call.recording_link && (
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-400/30 flex items-center gap-1">
                            <Play className="h-3 w-3" />
                            Recorded
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(call.call_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {getClientName(call.client_id)}
                        </span>
                      </div>
                      {(call.actionItemCount || 0) > 0 && (
                        <p className="text-white/50 text-xs mt-2">
                          {call.actionItemCount} action items • {call.approvalCount || 0} approvals
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {call.recording_link && (
                        <a
                          href={call.recording_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors"
                          title="Watch Recording"
                        >
                          <Play className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => togglePortalVisibility(call)}
                        className={`p-2 rounded-lg transition-colors ${
                          call.show_in_portal
                            ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                            : 'bg-gray-500/20 text-gray-300 hover:bg-gray-500/30'
                        }`}
                        title={call.show_in_portal ? 'Visible in portal' : 'Hidden from portal'}
                      >
                        {call.show_in_portal ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleEdit(call)}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
                        title="Edit Call"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(call.id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                        title="Delete Call"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {calls.length === 0 && !loading && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-12 text-center">
            <Phone className="h-16 w-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-white text-xl font-bold mb-2">No Calls Yet</h3>
            <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
              Create upcoming calls to share agendas with clients and track follow-ups
            </p>
            <button
              onClick={handleCreate}
              className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors border border-blue-400/30 font-medium"
            >
              Create Your First Call
            </button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  {editingCall ? 'Edit Call' : 'Create Call'}
                </CardTitle>
                <button
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Client */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Client *
                    </label>
                    <select
                      value={formData.client_id}
                      onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.brand_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Call Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Call Date *
                    </label>
                    <input
                      type="date"
                      value={formData.call_date}
                      onChange={(e) => setFormData({ ...formData, call_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Call Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Call Time
                    </label>
                    <input
                      type="time"
                      value={formData.call_time}
                      onChange={(e) => setFormData({ ...formData, call_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Call Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Call Title *
                    </label>
                    <input
                      type="text"
                      value={formData.call_title}
                      onChange={(e) => setFormData({ ...formData, call_title: e.target.value })}
                      placeholder="Weekly Strategy Call"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Attendees */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Attendees
                  </label>
                  <input
                    type="text"
                    value={formData.attendees}
                    onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                    placeholder="Sarah (PM), Mike (Copywriter), Jamie (Client)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Agenda Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Agenda Link (Google Doc)
                  </label>
                  <input
                    type="url"
                    value={formData.agenda_link}
                    onChange={(e) => setFormData({ ...formData, agenda_link: e.target.value })}
                    placeholder="https://docs.google.com/document/d/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Add your call agenda before the meeting
                  </p>
                </div>

                {/* Recording Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Recording Link
                  </label>
                  <input
                    type="url"
                    value={formData.recording_link}
                    onChange={(e) => setFormData({ ...formData, recording_link: e.target.value })}
                    placeholder="https://zoom.us/rec/share/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Add after the call
                  </p>
                </div>

                {/* Call Summary */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Call Summary (Client can see)
                  </label>
                  <textarea
                    value={formData.call_summary}
                    onChange={(e) => setFormData({ ...formData, call_summary: e.target.value })}
                    placeholder="Summary of what was discussed..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Internal Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1 flex items-center gap-2">
                    Internal Notes
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                      Private
                    </span>
                  </label>
                  <textarea
                    value={formData.internal_notes}
                    onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                    placeholder="Internal observations, upsell opportunities, client mood..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    These notes are never shown to the client
                  </p>
                </div>

                {/* Show in Portal */}
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={formData.show_in_portal}
                    onChange={(e) => setFormData({ ...formData, show_in_portal: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Show in Client Portal</p>
                    <p className="text-xs text-gray-600">
                      Client will see agenda, summary, and can add questions/topics
                    </p>
                  </div>
                </div>
              </CardContent>

              <div className="flex gap-3 p-6 border-t bg-gray-50">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  <Save className="h-4 w-4" />
                  {editingCall ? 'Update Call' : 'Create Call'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}

