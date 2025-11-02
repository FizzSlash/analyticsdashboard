'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Zap,
  Plus,
  Edit,
  Trash2,
  Mail,
  Clock,
  ChevronRight,
  X,
  Save
} from 'lucide-react'

interface Flow {
  id: string
  client_id: string
  client_name: string
  client_color: string
  flow_name: string
  trigger_type: string // Free text: Welcome, Abandoned Cart, Post-Purchase, etc.
  status: 'strategy' | 'copy' | 'design' | 'qa' | 'client_approval' | 'approved' | 'live'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  num_emails: number
  notes?: string
}

interface FlowManagerProps {
  clients: any[]
  selectedClient: string
}

export function FlowManager({ clients, selectedClient }: FlowManagerProps) {
  const [editingFlow, setEditingFlow] = useState<Flow | null>(null)
  const [showCreateFlow, setShowCreateFlow] = useState(false)

  // Mock flows (will be from database later)
  const [flows, setFlows] = useState<Flow[]>([
    {
      id: '1',
      client_id: clients[0]?.id || '1',
      client_name: clients[0]?.brand_name || 'Hydrus',
      client_color: clients[0]?.primary_color || '#3B82F6',
      flow_name: 'Welcome Series',
      trigger_type: 'New Subscriber',
      status: 'live',
      priority: 'high',
      num_emails: 3,
      notes: 'Performing well, 45% completion rate'
    },
    {
      id: '2',
      client_id: clients[1]?.id || '2',
      client_name: clients[1]?.brand_name || 'Peak Design',
      client_color: clients[1]?.primary_color || '#10B981',
      flow_name: 'Abandoned Cart Recovery',
      trigger_type: 'Cart Abandonment',
      status: 'design',
      priority: 'urgent',
      num_emails: 4
    },
    {
      id: '3',
      client_id: clients[0]?.id || '1',
      client_name: clients[0]?.brand_name || 'Hydrus',
      client_color: clients[0]?.primary_color || '#3B82F6',
      flow_name: 'Post-Purchase Thank You',
      trigger_type: 'Order Placed',
      status: 'copy',
      priority: 'normal',
      num_emails: 2
    },
    {
      id: '4',
      client_id: clients[2]?.id || '3',
      client_name: clients[2]?.brand_name || 'Make Waves',
      client_color: clients[2]?.primary_color || '#8B5CF6',
      flow_name: 'Browse Abandonment',
      trigger_type: 'Browse Abandonment',
      status: 'client_approval',
      priority: 'high',
      num_emails: 3
    }
  ])

  // Filter flows
  const filteredFlows = flows.filter(flow => 
    selectedClient === 'all' || flow.client_id === selectedClient
  )

  // Group by status
  const flowsByStatus = {
    strategy: filteredFlows.filter(f => f.status === 'strategy'),
    copy: filteredFlows.filter(f => f.status === 'copy'),
    design: filteredFlows.filter(f => f.status === 'design'),
    qa: filteredFlows.filter(f => f.status === 'qa'),
    client_approval: filteredFlows.filter(f => f.status === 'client_approval'),
    approved: filteredFlows.filter(f => f.status === 'approved'),
    live: filteredFlows.filter(f => f.status === 'live')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'strategy': return 'bg-gray-500/20 border-gray-400/30'
      case 'copy': return 'bg-blue-500/20 border-blue-400/30'
      case 'design': return 'bg-purple-500/20 border-purple-400/30'
      case 'qa': return 'bg-yellow-500/20 border-yellow-400/30'
      case 'client_approval': return 'bg-orange-500/20 border-orange-400/30'
      case 'approved': return 'bg-green-500/20 border-green-400/30'
      case 'live': return 'bg-teal-500/20 border-teal-400/30'
      default: return 'bg-gray-500/20 border-gray-400/30'
    }
  }

  const getPriorityEmoji = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🔴'
      case 'high': return '🟡'
      default: return ''
    }
  }

  const handleDeleteFlow = (flowId: string) => {
    if (confirm('Delete this flow?')) {
      setFlows(flows.filter(f => f.id !== flowId))
      console.log('🗑️ Flow deleted')
    }
  }

  const handleSaveFlow = (flowData: Partial<Flow>) => {
    if (editingFlow && editingFlow.id) {
      setFlows(flows.map(f => f.id === editingFlow.id ? { ...f, ...flowData } as Flow : f))
      console.log('✅ Flow updated')
    } else {
      const selectedClient = clients.find(c => c.id === flowData.client_id)
      const newFlow: Flow = {
        ...flowData as Flow,
        id: `flow-${Date.now()}`,
        client_name: selectedClient?.brand_name,
        client_color: selectedClient?.primary_color
      }
      setFlows([newFlow, ...flows])
      console.log('✅ Flow created')
    }
    setShowCreateFlow(false)
    setEditingFlow(null)
  }

  return (
    <div className="space-y-6">
      {/* Flow Header */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Flow Management
              </CardTitle>
              <div className="text-white/70 text-sm mt-1">
                Manage email automation flows and sequences
              </div>
            </div>
            <button
              onClick={() => setShowCreateFlow(true)}
              className="px-4 py-2 bg-blue-500/30 hover:bg-blue-500/40 text-white rounded-lg transition-colors flex items-center gap-2 border border-blue-400/30"
            >
              <Plus className="h-4 w-4" />
              Create Flow
            </button>
          </div>
        </CardHeader>
      </Card>

      {/* Flow Pipeline */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {[
            { id: 'strategy', label: 'Strategy' },
            { id: 'copy', label: 'Copy' },
            { id: 'design', label: 'Design' },
            { id: 'qa', label: 'QA' },
            { id: 'client_approval', label: 'Client Approval' },
            { id: 'approved', label: 'Approved' },
            { id: 'live', label: 'Live' }
          ].map(column => {
            const columnFlows = flowsByStatus[column.id as keyof typeof flowsByStatus]
            
            return (
              <div key={column.id} className="flex-shrink-0 w-[280px]">
                <Card className={`${getStatusColor(column.id)} backdrop-blur-md border shadow-lg mb-3`}>
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-sm font-bold">
                        {column.label}
                      </CardTitle>
                      <div className="bg-white/20 px-2 py-1 rounded-full text-white text-xs font-bold">
                        {columnFlows.length}
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <div className="min-h-[400px] bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 space-y-3">
                  {columnFlows.length === 0 ? (
                    <div className="text-white/40 text-center py-8 text-sm">
                      No flows in {column.label}
                    </div>
                  ) : (
                    columnFlows.map(flow => (
                      <div
                        key={flow.id}
                        onClick={() => setEditingFlow(flow)}
                        className="p-3 bg-white rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                        style={{ borderLeftColor: flow.client_color }}
                      >
                        <div className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1">
                          {getPriorityEmoji(flow.priority)}
                          {flow.flow_name}
                        </div>
                        <div className="text-xs text-gray-600 mb-2">{flow.client_name}</div>
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                            {flow.trigger_type}
                          </span>
                          <span className="text-gray-500">
                            <Mail className="h-3 w-3 inline mr-1" />
                            {flow.num_emails} emails
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-4">
            <div className="text-white/70 text-sm">Total Flows</div>
            <div className="text-2xl font-bold text-white">{filteredFlows.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-4">
            <div className="text-white/70 text-sm">In Progress</div>
            <div className="text-2xl font-bold text-blue-400">
              {filteredFlows.filter(f => ['strategy', 'copy', 'design', 'qa'].includes(f.status)).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-4">
            <div className="text-white/70 text-sm">Client Approval</div>
            <div className="text-2xl font-bold text-orange-400">
              {filteredFlows.filter(f => f.status === 'client_approval').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-4">
            <div className="text-white/70 text-sm">Live</div>
            <div className="text-2xl font-bold text-green-400">
              {filteredFlows.filter(f => f.status === 'live').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flow Detail Modal - Placeholder */}
      {(showCreateFlow || editingFlow) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-white w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">
                  {editingFlow ? 'Edit Flow' : 'Create New Flow'}
                </CardTitle>
                <button 
                  onClick={() => {
                    setShowCreateFlow(false)
                    setEditingFlow(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6">
              <div className="text-center py-12 text-gray-600">
                Flow detail modal coming in Tasks 40-42...
                <div className="mt-4 text-sm">
                  Will include: Flow config, email sequence builder, timing settings
                </div>
                <button
                  onClick={() => {
                    setShowCreateFlow(false)
                    setEditingFlow(null)
                  }}
                  className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
                >
                  Close
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

