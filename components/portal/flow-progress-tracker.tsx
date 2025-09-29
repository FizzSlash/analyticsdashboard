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
  status: 'draft' | 'copy' | 'design' | 'ready_for_client_approval' | 'approved' | 'live'
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
      // TODO: Load from database
      setFlows(generateDemoFlows())
    } catch (error) {
      console.error('Error loading flows:', error)
    }
  }

  const generateDemoFlows = (): Flow[] => [
    {
      id: 'flow1',
      title: 'Welcome Series',
      flow_type: 'welcome',
      status: 'ready_for_client_approval',
      client: client.brand_name,
      description: '5-email welcome series for new subscribers',
      trigger_criteria: 'Subscribed to newsletter',
      num_emails: 5,
      audience: 'New Subscribers',
      assignee: 'Copy Team',
      copy_due_date: new Date(2025, 10, 5),
      live_date: new Date(2025, 10, 15),
      notes: 'Include brand story, best sellers, and social proof. Set 2-day delays between emails.',
      synced_to_external: true,
      external_id: 'recFlow123'
    },
    {
      id: 'flow2',
      title: 'Abandoned Cart Recovery',
      flow_type: 'abandoned_cart',
      status: 'design',
      client: client.brand_name,
      description: '3-email abandoned cart recovery sequence',
      trigger_criteria: 'Placed item in cart but did not purchase after 2 hours',
      num_emails: 3,
      audience: 'Cart Abandoners',
      assignee: 'Design Team',
      design_due_date: new Date(2025, 10, 8),
      notes: 'Email 1: Reminder (1 hour), Email 2: 10% discount (24 hours), Email 3: 15% discount + urgency (48 hours)',
      synced_to_external: false,
      external_id: undefined
    },
    {
      id: 'flow3',
      title: 'VIP Win-Back Campaign',
      flow_type: 'win_back',
      status: 'live',
      client: client.brand_name,
      description: '4-email win-back series for inactive VIP customers',
      trigger_criteria: 'No purchase in last 90 days AND lifetime value > $500',
      num_emails: 4,
      audience: 'Inactive VIP Customers',
      assignee: 'Strategy Team',
      live_date: new Date(2025, 9, 1),
      notes: 'Focus on exclusive offers and personal touch. Include account manager contact.',
      synced_to_external: true,
      external_id: 'recFlow789'
    }
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
              status: approved ? 'approved' : 'revisions' as any,
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
      status: 'draft',
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
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'copy': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'design': return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'ready_for_client_approval': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'approved': return 'bg-green-100 text-green-700 border-green-300'
      case 'revisions': return 'bg-red-100 text-red-700 border-red-300'
      case 'live': return 'bg-green-200 text-green-800 border-green-400'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getFlowTypeColor = (flowType: string) => {
    switch (flowType) {
      case 'welcome': return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'abandoned_cart': return 'bg-orange-50 border-orange-200 text-orange-800'
      case 'win_back': return 'bg-purple-50 border-purple-200 text-purple-800'
      case 'post_purchase': return 'bg-green-50 border-green-200 text-green-800'
      case 'browse_abandon': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'custom': return 'bg-gray-50 border-gray-200 text-gray-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  // Group flows by status for better organization
  const flowsByStatus = flows.reduce((acc, flow) => {
    if (!acc[flow.status]) acc[flow.status] = []
    acc[flow.status].push(flow)
    return acc
  }, {} as Record<string, Flow[]>)

  const statuses = ['draft', 'copy', 'design', 'ready_for_client_approval', 'approved', 'live']

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      {canCreate && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-900 font-medium">Create New Flow</h3>
                <p className="text-gray-600 text-sm">Email flows are evergreen and go live (not scheduled)</p>
              </div>
              <button 
                onClick={addFlow}
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Flow
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Flow Progress List */}
      <div className="space-y-4">
        {statuses.map(status => {
          const statusFlows = flowsByStatus[status] || []
          if (statusFlows.length === 0) return null
          
          return (
            <Card key={status} className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(status).includes('bg-green') ? 'bg-green-500' : getStatusColor(status).includes('bg-orange') ? 'bg-orange-500' : 'bg-gray-400'}`}></div>
                  {status.replace('_', ' ').toUpperCase()} ({statusFlows.length})
                  {status === 'ready_for_client_approval' && (
                    <span className="text-orange-600 text-sm font-normal">→ Ready for your approval</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {statusFlows.map(flow => (
                  <div 
                    key={flow.id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => {
                      setEditingFlow(flow)
                      setShowAddModal(true)
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Zap className="h-5 w-5 text-purple-600" />
                          <h4 className="font-semibold text-gray-900">{flow.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getFlowTypeColor(flow.flow_type)}`}>
                            {flow.flow_type.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(flow.status)}`}>
                            {flow.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3">{flow.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            <span>Trigger: {flow.trigger_criteria}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{flow.num_emails} emails</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{flow.audience}</span>
                          </div>
                        </div>
                        
                        {flow.assignee && (
                          <div className="mt-2 text-xs text-gray-500">
                            Assigned to: <span className="font-medium">{flow.assignee}</span>
                          </div>
                        )}

                        {/* Client approval actions */}
                        {canApprove && flow.status === 'ready_for_client_approval' && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                approveFlow(flow.id, true)
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve Flow
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                approveFlow(flow.id, false)
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2"
                            >
                              <AlertTriangle className="h-4 w-4" />
                              Request Revisions
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 ml-4">
                        {/* Sync status indicator */}
                        {syncingOperations.has(flow.id) ? (
                          <div className="w-4 h-4 animate-spin rounded-full border border-blue-500 border-t-transparent" title="Syncing..."></div>
                        ) : flow.synced_to_external ? (
                          <div className="w-3 h-3 bg-green-500 rounded-full" title="Synced to Airtable"></div>
                        ) : (
                          <div className="w-3 h-3 bg-gray-400 rounded-full" title="Not synced"></div>
                        )}
                        
                        {/* Delete button (agency only) */}
                        {canEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteFlow(flow.id)
                            }}
                            disabled={syncingOperations.has(flow.id)}
                            className="text-gray-400 hover:text-red-600 disabled:text-gray-300 transition-colors p-1 rounded hover:bg-red-50 disabled:cursor-not-allowed"
                            title={syncingOperations.has(flow.id) ? "Syncing..." : "Delete flow"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        })}
      </div>

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
                    <option value="draft">Draft</option>
                    <option value="copy">Copy</option>
                    <option value="design">Design</option>
                    <option value="ready_for_client_approval">Ready for Client Approval</option>
                    <option value="approved">Approved</option>
                    <option value="live">Live</option>
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

              {/* Notes (Both agency and client can edit) */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  {userRole === 'client_user' ? 'Your Notes & Feedback' : 'Internal Notes'}
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

      {/* Status Info for Clients */}
      {userRole === 'client_user' && (
        <Card className="bg-blue-50 border border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <span className="font-medium text-blue-800">Flow Approval Process</span>
                <p className="text-blue-700 text-sm mt-1">
                  • <strong>Ready for Client Approval</strong> → Review and approve/request revisions<br/>
                  • <strong>Approved</strong> → Flow is approved and ready to go live<br/>
                  • <strong>Live</strong> → Flow is active and sending emails automatically
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}