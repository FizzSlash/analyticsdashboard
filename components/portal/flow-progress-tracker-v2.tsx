'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Zap,
  Eye,
  CheckCircle,
  MessageSquare,
  X,
  Clock,
  Mail,
  ExternalLink,
  AlertCircle,
  User
} from 'lucide-react'

interface Flow {
  id: string
  flow_name: string
  flow_type: string
  status: string
  trigger_type: string
  num_emails: number
  target_audience: string
  description: string
  notes: string  // ops_flows uses 'notes' not 'internal_notes'
  client_notes: string | null
  flow_approved: boolean | null
  approval_date: string | null
  assignee: string | null
  copy_doc_url: string | null  // ops_flows uses copy_doc_url
  go_live_date: string | null
  created_at: string
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
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null)
  const [clientFeedback, setClientFeedback] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchFlows()
  }, [client?.id])

  const fetchFlows = async () => {
    if (!client?.id) {
      console.error('❌ FLOWS: No client ID provided')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log('📥 FLOWS: Fetching for client:', client.id)
      
      const response = await fetch(`/api/portal/flows?clientId=${client.id}`)
      const result = await response.json()
      
      if (result.success) {
        console.log(`✅ FLOWS: Loaded ${result.flows.length} flows`)
        setFlows(result.flows)
      } else {
        console.error('❌ FLOWS: Failed:', result.error)
        setFlows([])
      }
    } catch (error) {
      console.error('❌ FLOWS: Error:', error)
      setFlows([])
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (flow: Flow, approved: boolean) => {
    setSubmitting(true)
    try {
      const response = await fetch('/api/portal/flows', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flowId: flow.id,
          flowApproved: approved,
          clientNotes: clientFeedback,
          approvalDate: new Date().toISOString()
        })
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Flow approval submitted successfully')
        await fetchFlows() // Refresh list
        setSelectedFlow(null)
        setClientFeedback('')
      } else {
        alert('Failed to submit approval: ' + result.error)
      }
    } catch (error) {
      console.error('Error submitting approval:', error)
      alert('Failed to submit approval')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'client approval':
      case 'ready for client approval':
        return 'bg-orange-500/20 text-orange-300 border-orange-400/30'
      case 'approved':
        return 'bg-green-500/20 text-green-300 border-green-400/30'
      case 'client revisions':
        return 'bg-red-500/20 text-red-300 border-red-400/30'
      case 'live in klaviyo':
      case 'scheduled - close':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30'
    }
  }

  const getFlowTypeIcon = (flowType: string) => {
    return 'bg-purple-500/20 text-purple-300'
  }

  // Filter flows that need approval
  const pendingApprovals = flows.filter(f => 
    f.status.toLowerCase().includes('client approval') || 
    f.status.toLowerCase().includes('ready for client approval')
  )

  if (loading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60 mx-auto mb-4"></div>
          <p className="text-white/70">Loading flows...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500/20 p-2 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-300" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Pending Approval</p>
                <p className="text-white text-2xl font-bold">{pendingApprovals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-300" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Approved</p>
                <p className="text-white text-2xl font-bold">
                  {flows.filter(f => f.flow_approved === true).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Zap className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Total Flows</p>
                <p className="text-white text-2xl font-bold">{flows.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals List */}
      {pendingApprovals.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-400" />
              Flows Awaiting Your Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingApprovals.map(flow => (
                <div
                  key={flow.id}
                  className="bg-white/10 rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
                  onClick={() => setSelectedFlow(flow)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-white font-semibold">{flow.flow_name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${getFlowTypeIcon(flow.flow_type)}`}>
                          {flow.flow_type}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm mb-2">{flow.description}</p>
                      <div className="flex items-center gap-4 text-xs text-white/60">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {flow.num_emails} emails
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {flow.target_audience || 'All subscribers'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedFlow(flow)
                      }}
                      className="bg-blue-600/80 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Flows Grid */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-400" />
            All Flows
          </CardTitle>
        </CardHeader>
        <CardContent>
          {flows.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/70">No flows found</p>
              <p className="text-white/50 text-sm">Flows will appear here when created</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flows.map(flow => (
                <div
                  key={flow.id}
                  className="bg-white/10 rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
                  onClick={() => setSelectedFlow(flow)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getFlowTypeIcon(flow.flow_type)}`}>
                      {flow.flow_type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(flow.status)}`}>
                      {flow.status}
                    </span>
                  </div>
                  <h4 className="text-white font-semibold mb-1">{flow.flow_name}</h4>
                  <p className="text-white/70 text-sm mb-3 line-clamp-2">{flow.description}</p>
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {flow.num_emails} emails
                    </span>
                    {flow.flow_approved === true && (
                      <span className="flex items-center gap-1 text-green-400">
                        <CheckCircle className="h-3 w-3" />
                        Approved
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flow Detail Modal */}
      {selectedFlow && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-white/10 border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-md">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-white text-xl mb-2">{selectedFlow.flow_name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(selectedFlow.status)}`}>
                      {selectedFlow.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs ${getFlowTypeIcon(selectedFlow.flow_type)}`}>
                      {selectedFlow.flow_type}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFlow(null)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Flow Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <p className="text-white/60 text-sm mb-1">Trigger Type</p>
                  <p className="text-white font-medium">{selectedFlow.trigger_type || 'Not set'}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <p className="text-white/60 text-sm mb-1">Number of Emails</p>
                  <p className="text-white font-medium">{selectedFlow.num_emails} emails</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <p className="text-white/60 text-sm mb-1">Target Audience</p>
                  <p className="text-white font-medium">{selectedFlow.target_audience || 'All subscribers'}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <p className="text-white/60 text-sm mb-1">Assigned To</p>
                  <p className="text-white font-medium">{selectedFlow.assignee || 'Not assigned'}</p>
                </div>
              </div>

              {/* Description */}
              {selectedFlow.description && (
                <div>
                  <h5 className="text-white font-medium mb-2">Flow Description</h5>
                  <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                    <p className="text-white/80 whitespace-pre-wrap">{selectedFlow.description}</p>
                  </div>
                </div>
              )}

              {/* Copy Link */}
              {selectedFlow.copy_doc_url && (
                <div>
                  <h5 className="text-white font-medium mb-2">Flow Copy</h5>
                  <a
                    href={selectedFlow.copy_doc_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600/80 hover:bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Copy Document
                  </a>
                </div>
              )}

              {/* Go Live Date */}
              {selectedFlow.go_live_date && (
                <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-400/30">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-300" />
                    <div>
                      <p className="text-white/60 text-sm">Go Live Date</p>
                      <p className="text-white font-medium">
                        {new Date(selectedFlow.go_live_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Agency Notes */}
              {selectedFlow.notes && (
                <div>
                  <h5 className="text-white font-medium mb-2">Agency Notes</h5>
                  <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                    <p className="text-white/80 whitespace-pre-wrap">{selectedFlow.notes}</p>
                  </div>
                </div>
              )}

              {/* Previous Client Feedback */}
              {selectedFlow.client_notes && (
                <div>
                  <h5 className="text-white font-medium mb-2">Your Previous Feedback</h5>
                  <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-400/30">
                    <p className="text-white/80 whitespace-pre-wrap">{selectedFlow.client_notes}</p>
                  </div>
                </div>
              )}

              {/* Client Approval Section (only if status requires approval) */}
              {canApprove && (selectedFlow.status.toLowerCase().includes('client approval') || 
                selectedFlow.status.toLowerCase().includes('ready for client approval')) && (
                <div className="space-y-4 border-t border-white/20 pt-6">
                  <h5 className="text-white font-medium">Your Feedback</h5>
                  <textarea
                    value={clientFeedback}
                    onChange={(e) => setClientFeedback(e.target.value)}
                    placeholder="Add your feedback, comments, or approval notes..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproval(selectedFlow, true)}
                      disabled={submitting}
                      className="flex-1 bg-green-600/80 hover:bg-green-600 disabled:bg-green-600/40 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                      {submitting ? 'Submitting...' : 'Approve Flow'}
                    </button>
                    <button
                      onClick={() => handleApproval(selectedFlow, false)}
                      disabled={submitting}
                      className="flex-1 bg-orange-600/80 hover:bg-orange-600 disabled:bg-orange-600/40 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="h-5 w-5" />
                      {submitting ? 'Submitting...' : 'Request Changes'}
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

