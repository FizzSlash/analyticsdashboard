'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FlowDetailModal } from './flow-detail-modal'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  Zap,
  Plus,
  Edit,
  Trash2,
  Mail,
  Clock,
  ChevronRight,
  X,
  Save,
  GripVertical
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
  preview_url?: string // Flow preview image (required for QA/client approval, like campaigns)
  notes?: string
}

interface FlowManagerProps {
  clients: any[]
  selectedClient: string
}

// Sortable Flow Card
function SortableFlowCard({ 
  flow, 
  onClick 
}: { 
  flow: Flow
  onClick: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: flow.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getPriorityEmoji = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🔴'
      case 'high': return '🟡'
      default: return ''
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderLeftColor: flow.client_color }}
      {...attributes}
      className="p-3 bg-white rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={onClick}
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
        <div {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </div>
      </div>
    </div>
  )
}

// Droppable Column
function DroppableColumn({ 
  id, 
  children 
}: { 
  id: string
  children: React.ReactNode 
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[400px] bg-white/5 backdrop-blur-sm rounded-xl border p-3 space-y-3 transition-colors ${
        isOver ? 'border-white/40 bg-white/10' : 'border-white/10'
      }`}
    >
      {children}
    </div>
  )
}

export function FlowManager({ clients, selectedClient }: FlowManagerProps) {
  const [editingFlow, setEditingFlow] = useState<Flow | null>(null)
  const [showCreateFlow, setShowCreateFlow] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [flows, setFlows] = useState<Flow[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch flows from API
  useEffect(() => {
    const fetchFlows = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/ops/flows?clientId=${selectedClient}`)
        const data = await response.json()
        
        if (data.success && data.flows) {
          const transformedFlows = data.flows.map((f: any) => ({
            ...f,
            client_name: clients.find(c => c.id === f.client_id)?.brand_name || 'Unknown',
            client_color: clients.find(c => c.id === f.client_id)?.primary_color || '#3B82F6'
          }))
          setFlows(transformedFlows)
        }
      } catch (error) {
        console.error('Error fetching flows:', error)
      } finally {
        setLoading(false)
      }
    }

    if (clients.length > 0) {
      fetchFlows()
    }
  }, [selectedClient, clients])

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Mock flows (fallback)
  const initialFlows: Flow[] = [
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
  ]

  // Delete unused initialFlows since we fetch from API now

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

  const handleDeleteFlow = async (flowId: string) => {
    if (confirm('Delete this flow?')) {
      try {
        const response = await fetch(`/api/ops/flows?id=${flowId}`, {
          method: 'DELETE'
        })
        
        const data = await response.json()
        if (data.success) {
          setFlows(flows.filter(f => f.id !== flowId))
          console.log('✅ Flow deleted')
        }
      } catch (error) {
        console.error('Error deleting flow:', error)
      }
    }
  }

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeFlow = flows.find(f => f.id === activeId)
    if (!activeFlow) return

    // Check if dropped on a status column
    const statusColumns = ['strategy', 'copy', 'design', 'qa', 'client_approval', 'approved', 'live']
    if (statusColumns.includes(overId) && activeFlow.status !== overId) {
      // Update in database
      fetch('/api/ops/flows', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeId, status: overId })
      }).then(() => {
        setFlows(flows.map(f => 
          f.id === activeId 
            ? { ...f, status: overId as Flow['status'] }
            : f
        ))
        console.log(`✅ Flow "${activeFlow.flow_name}" moved to ${overId}`)
      })
    } else {
      // Dropped on another flow
      const droppedFlow = flows.find(f => f.id === overId)
      if (droppedFlow && droppedFlow.status !== activeFlow.status) {
        fetch('/api/ops/flows', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: activeId, status: droppedFlow.status })
        }).then(() => {
          setFlows(flows.map(f => 
            f.id === activeId 
              ? { ...f, status: droppedFlow.status }
              : f
          ))
          console.log(`✅ Flow moved to ${droppedFlow.status}`)
        })
      }
    }
  }

  const activeFlow = activeId ? flows.find(f => f.id === activeId) : null

  const handleSaveFlow = async (flowData: Partial<Flow>) => {
    try {
      if (editingFlow && editingFlow.id) {
        // Update existing flow
        const response = await fetch('/api/ops/flows', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingFlow.id, ...flowData })
        })
        
        const data = await response.json()
        if (data.success) {
          setFlows(flows.map(f => f.id === editingFlow.id ? { ...f, ...flowData } as Flow : f))
          console.log('✅ Flow updated')
        }
      } else {
        // Create new flow
        const response = await fetch('/api/ops/flows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...flowData,
            agency_id: clients[0]?.agency_id
          })
        })
        
        const data = await response.json()
        if (data.success) {
          // Refetch flows
          const fetchResponse = await fetch(`/api/ops/flows?clientId=${selectedClient}`)
          const fetchData = await fetchResponse.json()
          if (fetchData.success) {
            setFlows(fetchData.flows.map((f: any) => ({
              ...f,
              client_name: clients.find(c => c.id === f.client_id)?.brand_name,
              client_color: clients.find(c => c.id === f.client_id)?.primary_color
            })))
          }
          console.log('✅ Flow created')
        }
      }
      
      setShowCreateFlow(false)
      setEditingFlow(null)
    } catch (error) {
      console.error('Error saving flow:', error)
      alert('Failed to save flow')
    }
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

      {/* Flow Pipeline with Drag & Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
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

                  <SortableContext items={columnFlows.map(f => f.id)} strategy={verticalListSortingStrategy}>
                    <DroppableColumn id={column.id}>
                      {columnFlows.length === 0 ? (
                        <div className="text-white/40 text-center py-8 text-sm">
                          No flows in {column.label}
                        </div>
                      ) : (
                        columnFlows.map(flow => (
                          <SortableFlowCard 
                            key={flow.id} 
                            flow={flow}
                            onClick={() => setEditingFlow(flow)}
                          />
                        ))
                      )}
                    </DroppableColumn>
                  </SortableContext>
                </div>
              )
            })}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeFlow ? (
            <div className="p-3 bg-white rounded-lg border-l-4 shadow-lg opacity-90"
              style={{ borderLeftColor: activeFlow.client_color }}
            >
              <div className="text-sm font-semibold text-gray-900">{activeFlow.flow_name}</div>
              <div className="text-xs text-gray-600">{activeFlow.client_name}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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

      {/* Flow Detail Modal */}
      {(showCreateFlow || editingFlow) && (
        <FlowDetailModal
          flow={editingFlow}
          clients={clients}
          onSave={handleSaveFlow}
          onDelete={handleDeleteFlow}
          onClose={() => {
            setShowCreateFlow(false)
            setEditingFlow(null)
          }}
        />
      )}
    </div>
  )
}

