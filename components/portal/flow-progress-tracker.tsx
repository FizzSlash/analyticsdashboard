'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus,
  Edit,
  Save,
  Trash2,
  X,
  Zap,
  Clock,
  Users,
  Target,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Mail
} from 'lucide-react'

interface Flow {
  id: string
  title: string
  flow_type: 'welcome' | 'abandoned_cart' | 'win_back' | 'post_purchase' | 'browse_abandon' | 'custom'
  status: string // Use actual Airtable stages
  client: string
  description: string
  trigger_criteria: string
  num_emails: number
  audience: string
  notes: string
  client_notes?: string // For client feedback
  assignee?: string
  copy_due_date?: Date
  design_due_date?: Date
  live_date?: Date
  copy_link?: string // Google Docs copy link
  external_id?: string
  synced_to_external: boolean
  last_sync?: Date
  isNew?: boolean
}

interface FlowProgressTrackerProps {
  client: any
  userRole: 'client_user' | 'agency_admin'
  canEdit: boolean
  canCreate: boolean
  canApprove: boolean
}

export function FlowProgressTracker({ client, userRole, canEdit, canCreate, canApprove }: FlowProgressTrackerProps) {
  const [flows, setFlows] = useState<Flow[]>([])
  const [editingFlow, setEditingFlow] = useState<Flow | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [syncingOperations, setSyncingOperations] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadFlows()
  }, [client])

  const loadFlows = async () => {
    try {
      // Load from Airtable first
      console.log('📥 Loading flows from Airtable for client:', client.brand_slug)
      const response = await fetch(`/api/load-from-airtable?client=${encodeURIComponent(client.brand_name)}`)
      const result = await response.json()
      
      if (result.success) {
        console.log(`📥 Loaded ${result.flows.length} flows from Airtable`)
        
        // Debug: Log first flow to see structure
        if (result.flows.length > 0) {
          console.log('📥 First flow structure:', result.flows[0])
        }
        
        setFlows(result.flows)
      } else {
        console.error('Failed to load flows from Airtable:', result.error)
        // Fallback to demo data
        setFlows(generateDemoFlows())
      }
    } catch (error) {
      console.error('Error loading flows:', error)
      // Fallback to demo data
      setFlows(generateDemoFlows())
    }
  }

  const generateDemoFlows = (): Flow[] => [
    // Return empty array - only use real Airtable data
  ]

  // Helper functions for sync operations
  const addSyncingOperation = (flowId: string) => {
    setSyncingOperations(prev => new Set(prev).add(flowId))
  }

  const removeSyncingOperation = (flowId: string) => {
    setSyncingOperations(prev => {
      const newSet = new Set(prev)
      newSet.delete(flowId)
      return newSet
    })
  }

  const saveFlow = async (flow: Flow) => {
    addSyncingOperation(flow.id)
    
    try {
      const updatedFlow = { 
        ...flow, 
        isNew: false, 
        synced_to_external: false,
        last_sync: undefined
      }

      // Update local state immediately
      if (flow.isNew) {
        setFlows(prev => [...prev, updatedFlow])
      } else {
        setFlows(prev => prev.map(f => f.id === flow.id ? updatedFlow : f))
      }

      // Save to database first
      await saveFlowToDatabase(updatedFlow)
      
      // 🚀 AUTO-SYNC: Immediately sync to Airtable
      console.log('🔄 AUTO-SYNC: Syncing flow to Airtable:', updatedFlow.title)
      const syncResponse = await fetch('/api/sync-to-airtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: client.brand_slug,
          campaign: updatedFlow // Using same API for flows
        })
      })

      const syncResult = await syncResponse.json()
      
      if (syncResult.success) {
        setFlows(prev => prev.map(f => 
          f.id === flow.id 
            ? { 
                ...f, 
                synced_to_external: true, 
                external_id: syncResult.airtable_record_id,
                last_sync: new Date() 
              }
            : f
        ))
        console.log('✅ AUTO-SYNC: Flow synced successfully to Airtable')
      } else {
        console.error('❌ AUTO-SYNC: Failed to sync flow to Airtable:', syncResult.error)
      }
      
      setEditingFlow(null)
      setShowAddModal(false)
    } catch (error) {
      console.error('❌ AUTO-SYNC: Error saving/syncing flow:', error)
    } finally {
      removeSyncingOperation(flow.id)
    }
  }

  const deleteFlow = async (flowId: string) => {
    if (!canEdit) return
    
    addSyncingOperation(flowId)
    
    try {
      const flow = flows.find(f => f.id === flowId)
      setFlows(prev => prev.filter(f => f.id !== flowId))
      await deleteFlowFromDatabase(flowId)
      
      // Auto-sync deletion to Airtable
      if (flow?.external_id) {
        console.log('🗑️ AUTO-SYNC: Deleting flow from Airtable:', flow.title)
        const deleteResponse = await fetch('/api/sync-to-airtable', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            airtable_record_id: flow.external_id,
            campaign_id: flowId
          })
        })
        
        const deleteResult = await deleteResponse.json()
        if (deleteResult.success) {
          console.log('✅ AUTO-SYNC: Flow deleted successfully from Airtable')
        }
      }
      
    } catch (error) {
      console.error('❌ AUTO-SYNC: Error deleting flow:', error)
    } finally {
      removeSyncingOperation(flowId)
    }
  }

  const approveFlow = async (flowId: string, approved: boolean) => {
    if (!canApprove) return
    
    addSyncingOperation(flowId)
    
    try {
      const updatedFlows = flows.map(f => 
        f.id === flowId 
          ? { 
              ...f, 
              status: approved ? 'Approved' : 'Client Revisions',
              client_notes: approved ? 'Approved by client' : (f.client_notes || 'Revisions requested'),
              synced_to_external: false
            }
          : f
      )
      setFlows(updatedFlows)
      
      // Auto-sync approval to Airtable
      const flow = updatedFlows.find(f => f.id === flowId)
      if (flow) {
        const syncResponse = await fetch('/api/sync-to-airtable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client: client.brand_slug,
            campaign: flow
          })
        })
        
        const syncResult = await syncResponse.json()
        if (syncResult.success) {
          setFlows(prev => prev.map(f => 
            f.id === flowId 
              ? { ...f, synced_to_external: true, last_sync: new Date() }
              : f
          ))
        }
      }
      
    } catch (error) {
      console.error('❌ Error approving flow:', error)
    } finally {
      removeSyncingOperation(flowId)
    }
  }

  const saveFlowToDatabase = async (flow: Flow) => {
    console.log('💾 Saving flow to database:', flow.title)
  }

  const deleteFlowFromDatabase = async (flowId: string) => {
    console.log('🗑️ Deleting flow from database:', flowId)
  }

  const addFlow = () => {
    if (!canCreate) return
    
    const newFlow: Flow = {
      id: `flow-${Date.now()}`,
      title: '',
      flow_type: 'welcome',
      status: 'Content Strategy', // Use real Airtable stage
      client: client.brand_name,
      description: '',
      trigger_criteria: '',
      num_emails: 3,
      audience: '',
      notes: '',
      synced_to_external: false,
      isNew: true
    }
    setEditingFlow(newFlow)
    setShowAddModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Content Strategy': return 'bg-gray-500/30 text-gray-300 border-gray-400'
      case 'Copy': return 'bg-blue-500/30 text-blue-300 border-blue-400'
      case 'Copy QA': return 'bg-blue-500/40 text-blue-200 border-blue-300'
      case 'Design': return 'bg-purple-500/30 text-purple-300 border-purple-400'
      case 'Design QA': return 'bg-purple-500/40 text-purple-200 border-purple-300'
      case 'Ready For Client Approval': return 'bg-orange-500/30 text-orange-300 border-orange-400'
      case 'Client Approval': return 'bg-orange-500/30 text-orange-300 border-orange-400'
      case 'Approved': return 'bg-green-500/30 text-green-300 border-green-400'
      case 'Client Revisions': return 'bg-red-500/30 text-red-300 border-red-400'
      case 'Ready For Schedule': return 'bg-teal-500/30 text-teal-300 border-teal-400'
      case 'Ready For Imp QA': return 'bg-indigo-500/30 text-indigo-300 border-indigo-400'
      case 'Scheduled - Close': return 'bg-green-500/40 text-green-200 border-green-300'
      default: return 'bg-gray-500/30 text-gray-300 border-gray-400'
    }
  }

  const getFlowTypeColor = (flowType: string) => {
    switch (flowType) {
      case 'welcome': return 'bg-blue-500/20 border-blue-400 text-blue-300'
      case 'abandoned_cart': return 'bg-orange-500/20 border-orange-400 text-orange-300'
      case 'win_back': return 'bg-purple-500/20 border-purple-400 text-purple-300'
      case 'post_purchase': return 'bg-green-500/20 border-green-400 text-green-300'
      case 'browse_abandon': return 'bg-yellow-500/20 border-yellow-400 text-yellow-300'
      case 'custom': return 'bg-gray-500/20 border-gray-400 text-gray-300'
      default: return 'bg-gray-500/20 border-gray-400 text-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-400" />
            {userRole === 'agency_admin' ? 'Flow Management' : 'Flow Approvals'}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Flows Grid - Simple and Clean */}
      {flows.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8 text-center">
            <Zap className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/70">No flows found</p>
            <p className="text-white/50 text-sm">Flow approvals will appear here when ready</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flows.map(flow => (
            <Card key={flow.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Flow Header */}
                  <div>
                    <h4 className="text-white font-semibold">{flow.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs border ${getFlowTypeColor(flow.flow_type)}`}>
                        {flow.flow_type.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(flow.status)}`}>
                        {flow.status}
                      </span>
                    </div>
                  </div>

                  {/* Flow Info */}
                  <div className="text-sm text-white/70">
                    <p>{flow.num_emails} emails • {flow.audience}</p>
                    {flow.trigger_criteria && (
                      <p className="text-xs mt-1">Trigger: {flow.trigger_criteria}</p>
                    )}
                  </div>

                  {/* Copy Link */}
                  {flow.copy_link && (
                    <a
                      href={flow.copy_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs"
                    >
                      📄 View Copy
                    </a>
                  )}

                  {/* Client Approval (Only for flows needing approval) */}
                  {userRole === 'client_user' && (flow.status === 'Ready For Client Approval' || flow.status === 'Client Approval') && (
                    <div className="space-y-3 pt-2 border-t border-white/10">
                      <textarea
                        placeholder="Add your approval notes or feedback..."
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 text-sm resize-none"
                        rows={2}
                        value={flow.client_notes || ''}
                        onChange={(e) => setFlows(prev => prev.map(f => 
                          f.id === flow.id ? { ...f, client_notes: e.target.value } : f
                        ))}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveFlow(flow.id, true)}
                          className="flex-1 bg-green-600/80 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Approve
                        </button>
                        <button
                          onClick={() => approveFlow(flow.id, false)}
                          className="flex-1 bg-orange-600/80 hover:bg-orange-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Request Changes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}


      {/* Flow Editor Modal */}
      {showAddModal && editingFlow && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-white border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-gray-900">
                  {editingFlow.isNew ? 'Create New Flow' : 'Edit Flow'}
                </CardTitle>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Flow Name *</label>
                <input
                  type="text"
                  value={editingFlow.title}
                  onChange={(e) => setEditingFlow({...editingFlow, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter flow name..."
                  autoFocus
                  disabled={!canEdit && userRole === 'client_user'}
                />
              </div>

              {/* Flow Type and Status */}
              <div className="grid grid-cols-2 gap-4">
                {canEdit && (
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Flow Type</label>
                    <select 
                      value={editingFlow.flow_type}
                      onChange={(e) => setEditingFlow({...editingFlow, flow_type: e.target.value as any})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="welcome">Welcome Series</option>
                      <option value="abandoned_cart">Abandoned Cart</option>
                      <option value="win_back">Win-Back Campaign</option>
                      <option value="post_purchase">Post-Purchase</option>
                      <option value="browse_abandon">Browse Abandonment</option>
                      <option value="custom">Custom Flow</option>
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Status</label>
                  <select 
                    value={editingFlow.status}
                    onChange={(e) => setEditingFlow({...editingFlow, status: e.target.value as any})}
                    disabled={!canEdit}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="Content Strategy">Content Strategy</option>
                    <option value="Copy">Copy</option>
                    <option value="Copy QA">Copy QA</option>
                    <option value="Design">Design</option>
                    <option value="Design QA">Design QA</option>
                    <option value="Ready For Client Approval">Ready For Client Approval</option>
                    <option value="Client Approval">Client Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Client Revisions">Client Revisions</option>
                    <option value="Ready For Schedule">Ready For Schedule</option>
                    <option value="Ready For Imp QA">Ready For Imp QA</option>
                    <option value="Scheduled - Close">Scheduled - Close</option>
                  </select>
                </div>
              </div>

              {/* Flow Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Number of Emails</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={editingFlow.num_emails}
                    onChange={(e) => setEditingFlow({...editingFlow, num_emails: parseInt(e.target.value)})}
                    disabled={!canEdit}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                
                {canEdit && (
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Assignee</label>
                    <select 
                      value={editingFlow.assignee || ''}
                      onChange={(e) => setEditingFlow({...editingFlow, assignee: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select assignee...</option>
                      <option value="Reid Sickels">Reid Sickels</option>
                      <option value="Connor Clements">Connor Clements</option>
                      <option value="Copy Team">Copy Team</option>
                      <option value="Design Team">Design Team</option>
                      <option value="Dev Team">Dev Team</option>
                      <option value="Strategy Team">Strategy Team</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Trigger Criteria */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Trigger Criteria</label>
                <input
                  type="text"
                  value={editingFlow.trigger_criteria}
                  onChange={(e) => setEditingFlow({...editingFlow, trigger_criteria: e.target.value})}
                  disabled={!canEdit}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="e.g., Subscribed to newsletter, Added item to cart..."
                />
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Target Audience</label>
                <input
                  type="text"
                  value={editingFlow.audience}
                  onChange={(e) => setEditingFlow({...editingFlow, audience: e.target.value})}
                  disabled={!canEdit}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="e.g., New Subscribers, Cart Abandoners..."
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Flow Description</label>
                <textarea
                  value={editingFlow.description}
                  onChange={(e) => setEditingFlow({...editingFlow, description: e.target.value})}
                  disabled={!canEdit}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-100"
                  rows={3}
                  placeholder="Describe the flow objectives and email sequence..."
                />
              </div>

              {/* Agency-only fields for flows */}
              {userRole === 'agency_admin' && (
                <>
                  {/* Due Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Copy Due Date</label>
                      <input
                        type="date"
                        value={editingFlow.copy_due_date?.toISOString().split('T')[0] || ''}
                        onChange={(e) => setEditingFlow({...editingFlow, copy_due_date: e.target.value ? new Date(e.target.value) : undefined})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Live Date</label>
                      <input
                        type="date"
                        value={editingFlow.live_date?.toISOString().split('T')[0] || ''}
                        onChange={(e) => setEditingFlow({...editingFlow, live_date: e.target.value ? new Date(e.target.value) : undefined})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Copy Link */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Copy Link</label>
                    <input
                      type="url"
                      value={editingFlow.copy_link || ''}
                      onChange={(e) => setEditingFlow({...editingFlow, copy_link: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="https://docs.google.com/document/..."
                    />
                  </div>
                </>
              )}

              {/* Notes (Both agency and client can edit) */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  {userRole === 'client_user' ? 'Client Revisions' : 'Notes'}
                </label>
                <textarea
                  value={userRole === 'client_user' ? (editingFlow.client_notes || '') : editingFlow.notes}
                  onChange={(e) => {
                    if (userRole === 'client_user') {
                      setEditingFlow({...editingFlow, client_notes: e.target.value})
                    } else {
                      setEditingFlow({...editingFlow, notes: e.target.value})
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder={userRole === 'client_user' ? 'Add your feedback or approval notes...' : 'Email sequence details, timing, requirements...'}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors border border-gray-300"
                >
                  Cancel
                </button>
                
                {canEdit && !editingFlow.isNew && (
                  <button
                    onClick={() => {
                      deleteFlow(editingFlow.id)
                      setShowAddModal(false)
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                )}
                
                <button
                  onClick={() => saveFlow(editingFlow)}
                  disabled={!editingFlow.title.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {editingFlow.isNew ? 'Create Flow' : 'Save Changes'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Info removed for clients - they don't need explanations */}
    </div>
  )
}