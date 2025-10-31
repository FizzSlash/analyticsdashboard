'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CampaignDetailModal } from './campaign-detail-modal'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Clock } from 'lucide-react'

interface Campaign {
  id: string
  campaign_name: string
  client_id: string
  client_name: string
  client_color: string
  send_date: Date
  status: 'strategy' | 'copy' | 'design' | 'qa' | 'client_approval' | 'approved' | 'scheduled' | 'sent'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  campaign_type: 'email' | 'sms'
  subject_line?: string
  preview_text?: string
  target_audience?: string
  copy_doc_url?: string
  design_file_url?: string
  preview_url?: string
  internal_notes?: string
}

interface OpsPipelineProps {
  clients: any[]
  selectedClient: string
}

// Sortable Campaign Card Component
function SortableCampaignCard({ 
  campaign,
  onClick
}: { 
  campaign: Campaign
  onClick: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: campaign.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50'
      case 'high': return 'border-l-orange-500 bg-orange-50'
      default: return 'border-l-gray-300 bg-white'
    }
  }

  const getPriorityEmoji = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🔴'
      case 'high': return '🟡'
      default: return ''
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`p-3 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all ${getPriorityColor(campaign.priority)}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div 
          className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
          style={{ backgroundColor: campaign.client_color }}
        />
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={onClick}
        >
          <div className="text-xs text-gray-600 font-medium mb-1">{campaign.client_name}</div>
          <div className="text-sm font-semibold text-gray-900 leading-tight flex items-center gap-1">
            {getPriorityEmoji(campaign.priority)}
            {campaign.campaign_name}
          </div>
        </div>
        <div {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
        <Clock className="h-3 w-3" />
        {formatDate(campaign.send_date)}
      </div>
      
      {campaign.campaign_type === 'sms' && (
        <div className="mt-2 inline-block px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
          SMS
        </div>
      )}
    </div>
  )
}

// Droppable Column Component
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
      className={`min-h-[500px] bg-white/5 backdrop-blur-sm rounded-xl border p-3 space-y-3 transition-colors ${
        isOver ? 'border-white/40 bg-white/10' : 'border-white/10'
      }`}
    >
      {children}
    </div>
  )
}

export function OpsPipeline({ clients, selectedClient }: OpsPipelineProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  
  // Mock campaign data (same as calendar)
  const initialCampaigns: Campaign[] = [
    {
      id: '1',
      campaign_name: 'Black Friday Launch',
      client_id: clients[0]?.id || '1',
      client_name: clients[0]?.brand_name || 'Hydrus',
      client_color: clients[0]?.primary_color || '#3B82F6',
      send_date: new Date(2025, 10, 24, 9, 0),
      status: 'design',
      priority: 'urgent',
      campaign_type: 'email'
    },
    {
      id: '2',
      campaign_name: 'Welcome Series Part 2',
      client_id: clients[1]?.id || '2',
      client_name: clients[1]?.brand_name || 'Peak Design',
      client_color: clients[1]?.primary_color || '#10B981',
      send_date: new Date(2025, 10, 28, 14, 0),
      status: 'qa',
      priority: 'normal',
      campaign_type: 'email'
    },
    {
      id: '3',
      campaign_name: 'Product Launch',
      client_id: clients[2]?.id || '3',
      client_name: clients[2]?.brand_name || 'Make Waves',
      client_color: clients[2]?.primary_color || '#8B5CF6',
      send_date: new Date(2025, 10, 30, 10, 0),
      status: 'client_approval',
      priority: 'high',
      campaign_type: 'email'
    },
    {
      id: '4',
      campaign_name: 'Newsletter',
      client_id: clients[0]?.id || '1',
      client_name: clients[0]?.brand_name || 'Hydrus',
      client_color: clients[0]?.primary_color || '#3B82F6',
      send_date: new Date(2025, 10, 25, 8, 0),
      status: 'approved',
      priority: 'normal',
      campaign_type: 'email'
    },
    {
      id: '5',
      campaign_name: 'Flash Sale SMS',
      client_id: clients[1]?.id || '2',
      client_name: clients[1]?.brand_name || 'Peak Design',
      client_color: clients[1]?.primary_color || '#10B981',
      send_date: new Date(2025, 10, 26, 11, 0),
      status: 'scheduled',
      priority: 'high',
      campaign_type: 'sms'
    },
    {
      id: '6',
      campaign_name: 'Cyber Monday',
      client_id: clients[0]?.id || '1',
      client_name: clients[0]?.brand_name || 'Hydrus',
      client_color: clients[0]?.primary_color || '#3B82F6',
      send_date: new Date(2025, 11, 1, 6, 0),
      status: 'copy',
      priority: 'urgent',
      campaign_type: 'email'
    },
    {
      id: '7',
      campaign_name: 'Holiday Strategy',
      client_id: clients[2]?.id || '3',
      client_name: clients[2]?.brand_name || 'Make Waves',
      client_color: clients[2]?.primary_color || '#8B5CF6',
      send_date: new Date(2025, 10, 20, 10, 0),
      status: 'strategy',
      priority: 'normal',
      campaign_type: 'email'
    }
  ]

  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Status columns configuration
  const statusColumns = [
    { id: 'strategy', label: 'Strategy', color: 'bg-gray-500/20 border-gray-400/30' },
    { id: 'copy', label: 'Copy', color: 'bg-blue-500/20 border-blue-400/30' },
    { id: 'design', label: 'Design', color: 'bg-purple-500/20 border-purple-400/30' },
    { id: 'qa', label: 'QA', color: 'bg-yellow-500/20 border-yellow-400/30' },
    { id: 'client_approval', label: 'Client Approval', color: 'bg-orange-500/20 border-orange-400/30' },
    { id: 'approved', label: 'Approved', color: 'bg-green-500/20 border-green-400/30' },
    { id: 'scheduled', label: 'Scheduled', color: 'bg-teal-500/20 border-teal-400/30' },
    { id: 'sent', label: 'Sent', color: 'bg-gray-600/20 border-gray-500/30' }
  ]

  // Filter campaigns by selected client
  const filteredCampaigns = campaigns.filter(campaign => 
    selectedClient === 'all' || campaign.client_id === selectedClient
  )

  // Group campaigns by status
  const campaignsByStatus = statusColumns.reduce((acc, column) => {
    acc[column.id] = filteredCampaigns.filter(c => c.status === column.id)
    return acc
  }, {} as Record<string, Campaign[]>)

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

    // Find the campaign being dragged
    const activeCampaign = campaigns.find(c => c.id === activeId)
    if (!activeCampaign) return

    // Check if dropped on a status column (column IDs are status names)
    const targetStatus = statusColumns.find(col => col.id === overId)
    
    if (targetStatus && activeCampaign.status !== targetStatus.id) {
      // Update campaign status
      setCampaigns(campaigns.map(c => 
        c.id === activeId 
          ? { ...c, status: targetStatus.id as Campaign['status'] }
          : c
      ))
      
      console.log(`✅ Campaign "${activeCampaign.campaign_name}" moved from ${activeCampaign.status} to ${targetStatus.label}`)
    } else {
      // Might have dropped on another campaign in the same column, find the column
      const droppedCampaign = campaigns.find(c => c.id === overId)
      if (droppedCampaign && droppedCampaign.status !== activeCampaign.status) {
        setCampaigns(campaigns.map(c => 
          c.id === activeId 
            ? { ...c, status: droppedCampaign.status }
            : c
        ))
        console.log(`✅ Campaign "${activeCampaign.campaign_name}" moved to ${droppedCampaign.status} column`)
      }
    }
  }

  const activeCampaign = activeId ? campaigns.find(c => c.id === activeId) : null

  // Campaign modal handlers
  const handleCampaignClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
  }

  const handleSaveCampaign = (updatedCampaign: Campaign) => {
    setCampaigns(campaigns.map(c => 
      c.id === updatedCampaign.id ? updatedCampaign : c
    ))
    setSelectedCampaign(null)
    console.log('✅ Campaign saved:', updatedCampaign.campaign_name)
  }

  const handleDeleteCampaign = (campaignId: string) => {
    setCampaigns(campaigns.filter(c => c.id !== campaignId))
    setSelectedCampaign(null)
    console.log('🗑️ Campaign deleted:', campaignId)
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Header */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="text-white/70 text-sm">
              💡 Drag campaigns between columns to change status
            </div>
            <div className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg">
              <span className="text-white/70 text-sm">{filteredCampaigns.length} campaigns</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {statusColumns.map((column) => {
              const columnCampaigns = campaignsByStatus[column.id] || []
              
              return (
                <div
                  key={column.id}
                  className="flex-shrink-0 w-[280px]"
                >
                  {/* Column Header */}
                  <Card className={`${column.color} backdrop-blur-md border shadow-lg mb-3`}>
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-sm font-bold">
                          {column.label}
                        </CardTitle>
                        <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs font-bold">
                          {columnCampaigns.length}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Drop Zone */}
                  <SortableContext
                    items={columnCampaigns.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <DroppableColumn id={column.id}>
                      {columnCampaigns.length === 0 ? (
                        <div className="text-white/40 text-center py-8 text-sm">
                          No campaigns in {column.label}
                        </div>
                      ) : (
                        columnCampaigns.map((campaign) => (
                          <SortableCampaignCard 
                            key={campaign.id} 
                            campaign={campaign}
                            onClick={() => handleCampaignClick(campaign)}
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
          {activeCampaign ? (
            <div className="p-3 rounded-lg border-l-4 shadow-lg bg-white opacity-90">
              <div className="text-xs text-gray-600 font-medium mb-1">
                {activeCampaign.client_name}
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {activeCampaign.campaign_name}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-4">
            <div className="text-white/70 text-sm">In Progress</div>
            <div className="text-2xl font-bold text-white">
              {filteredCampaigns.filter(c => 
                ['strategy', 'copy', 'design', 'qa'].includes(c.status)
              ).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-4">
            <div className="text-white/70 text-sm">Awaiting Approval</div>
            <div className="text-2xl font-bold text-orange-400">
              {filteredCampaigns.filter(c => c.status === 'client_approval').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-4">
            <div className="text-white/70 text-sm">Ready to Send</div>
            <div className="text-2xl font-bold text-green-400">
              {filteredCampaigns.filter(c => c.status === 'approved' || c.status === 'scheduled').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-4">
            <div className="text-white/70 text-sm">Sent</div>
            <div className="text-2xl font-bold text-blue-400">
              {filteredCampaigns.filter(c => c.status === 'sent').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <CampaignDetailModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          onSave={handleSaveCampaign}
          onDelete={handleDeleteCampaign}
        />
      )}
    </div>
  )
}

