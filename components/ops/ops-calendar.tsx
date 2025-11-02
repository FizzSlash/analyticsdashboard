'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CampaignDetailModal } from './campaign-detail-modal'
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
  useSortable,
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  ChevronLeft,
  ChevronRight,
  X,
  GripVertical,
  Plus,
  TestTube
} from 'lucide-react'

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
  is_ab_test?: boolean
  ab_test_variant?: string
  ab_test_type?: string
}

interface OpsCalendarProps {
  clients: any[]
  selectedClient: string
}

// Draggable Campaign Card
function DraggableCampaignCard({ 
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'strategy': return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'copy': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'design': return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'qa': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'client_approval': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'approved': return 'bg-green-100 text-green-700 border-green-300'
      case 'scheduled': return 'bg-teal-100 text-teal-700 border-teal-300'
      case 'sent': return 'bg-gray-500 text-white border-gray-600'
      default: return 'bg-gray-100 text-gray-600 border-gray-300'
    }
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
      style={{
        ...style,
        borderLeftWidth: '4px',
        borderLeftColor: campaign.client_color,
        backgroundColor: campaign.campaign_type === 'sms' ? '#FEF9C3' : '#EFF6FF'
      }}
      {...attributes}
      className="p-2 text-xs rounded border hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-1">
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={onClick}
        >
          <div className="font-semibold text-gray-800 truncate flex items-center gap-1">
            {getPriorityEmoji(campaign.priority)}
            {campaign.campaign_name}
          </div>
          <div className="text-gray-600 text-xs mt-0.5">
            {campaign.client_name}
          </div>
          <div className="text-gray-600 text-xs">
            {campaign.send_date.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <div className={`inline-block px-2 py-0.5 rounded-full text-xs border ${getStatusColor(campaign.status)}`}>
              {campaign.status.replace('_', ' ')}
            </div>
            {campaign.is_ab_test && (
              <div className="inline-block px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 border border-purple-300" title={`A/B Test: ${campaign.ab_test_type}`}>
                🧪 {campaign.ab_test_variant}
              </div>
            )}
          </div>
        </div>
        <div {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-3 w-3 text-gray-400 flex-shrink-0 mt-0.5" />
        </div>
      </div>
    </div>
  )
}

// Droppable Calendar Day
function DroppableDay({ 
  date, 
  campaigns,
  isToday,
  onCampaignClick,
  onAddCampaign
}: { 
  date: Date
  campaigns: Campaign[]
  isToday: boolean
  onCampaignClick: (campaign: Campaign) => void
  onAddCampaign: (date: Date) => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const { setNodeRef, isOver } = useDroppable({ 
    id: `day-${date.toISOString()}` 
  })
  
  return (
    <div
      ref={setNodeRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={() => onAddCampaign(date)}
      className={`min-h-[140px] max-h-[300px] p-2 transition-colors relative group ${
        isOver ? 'bg-white/20 ring-2 ring-white/40' : 'bg-white/5 hover:bg-white/10'
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <div className={`text-sm font-medium ${
          isToday 
            ? 'w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center'
            : 'text-white/70'
        }`}>
          {date.getDate()}
        </div>
        
        {/* Plus icon on hover */}
        {isHovered && (
          <button
            onClick={() => onAddCampaign(date)}
            className="w-5 h-5 rounded-full bg-blue-500/80 hover:bg-blue-500 flex items-center justify-center text-white transition-colors"
            title="Add campaign"
          >
            <Plus className="h-3 w-3" />
          </button>
        )}
      </div>
      
      {/* Scrollable campaign list - supports unlimited campaigns per day */}
      <SortableContext items={campaigns.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-1 overflow-y-auto max-h-[240px] pr-1" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.3) transparent'
        }}>
          {campaigns.map(campaign => (
            <DraggableCampaignCard 
              key={campaign.id} 
              campaign={campaign}
              onClick={() => onCampaignClick(campaign)}
            />
          ))}
        </div>
      </SortableContext>
      
      {/* Double-click hint on empty days */}
      {campaigns.length === 0 && isHovered && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-white/40 text-xs">Double-click to add</div>
        </div>
      )}
    </div>
  )
}

export function OpsCalendar({ clients, selectedClient }: OpsCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch campaigns from API
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/ops/campaigns?clientId=${selectedClient}`)
        const data = await response.json()
        
        if (data.success && data.campaigns) {
          // Transform database campaigns to component format
          const transformedCampaigns = data.campaigns.map((c: any) => ({
            ...c,
            send_date: new Date(c.send_date),
            client_name: clients.find(cl => cl.id === c.client_id)?.brand_name || 'Unknown',
            client_color: clients.find(cl => cl.id === c.client_id)?.primary_color || '#3B82F6'
          }))
          setCampaigns(transformedCampaigns)
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error)
      } finally {
        setLoading(false)
      }
    }

    if (clients.length > 0) {
      fetchCampaigns()
    }
  }, [selectedClient, clients])

  // Keep mock data as fallback for initial load
  const [campaigns_old, setCampaigns_old] = useState<Campaign[]>([
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
  ])

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    })
  )

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

    // Check if dropped on a day (id starts with "day-")
    if (overId.startsWith('day-')) {
      const newDate = new Date(overId.replace('day-', ''))
      
      // Update campaign with new date (keep same time)
      const updatedDate = new Date(newDate)
      updatedDate.setHours(activeCampaign.send_date.getHours())
      updatedDate.setMinutes(activeCampaign.send_date.getMinutes())
      
      // Update in database
      fetch('/api/ops/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeId, send_date: updatedDate.toISOString() })
      }).then(() => {
        // Update local state
        setCampaigns(campaigns.map(c => 
          c.id === activeId 
            ? { ...c, send_date: updatedDate }
            : c
        ))
        console.log(`✅ Campaign "${activeCampaign.campaign_name}" moved to ${updatedDate.toLocaleDateString()}`)
      })
    }
  }

  const activeCampaign = activeId ? campaigns.find(c => c.id === activeId) : null

  // Campaign modal handlers
  const handleCampaignClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
  }

  const handleAddCampaign = (date: Date) => {
    // Create new campaign with selected date
    const newCampaign: Campaign = {
      id: `new-${Date.now()}`,
      campaign_name: '',
      client_id: selectedClient === 'all' ? clients[0]?.id : selectedClient,
      client_name: selectedClient === 'all' ? clients[0]?.brand_name : clients.find(c => c.id === selectedClient)?.brand_name || 'New Client',
      client_color: selectedClient === 'all' ? clients[0]?.primary_color : clients.find(c => c.id === selectedClient)?.primary_color || '#3B82F6',
      send_date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0), // Default to 9am
      status: 'strategy',
      priority: 'normal',
      campaign_type: 'email'
    }
    setSelectedCampaign(newCampaign)
  }

  const handleSaveCampaign = async (updatedCampaign: Campaign) => {
    try {
      const isNew = updatedCampaign.id.startsWith('new-')
      
      if (isNew) {
        // Create new campaign
        const response = await fetch('/api/ops/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...updatedCampaign,
            agency_id: clients[0]?.agency_id // Get from first client
          })
        })
        
        const data = await response.json()
        if (data.success) {
          // Refetch campaigns
          const fetchResponse = await fetch(`/api/ops/campaigns?clientId=${selectedClient}`)
          const fetchData = await fetchResponse.json()
          if (fetchData.success) {
            setCampaigns(fetchData.campaigns.map((c: any) => ({
              ...c,
              send_date: new Date(c.send_date),
              client_name: clients.find(cl => cl.id === c.client_id)?.brand_name,
              client_color: clients.find(cl => cl.id === c.client_id)?.primary_color
            })))
          }
          console.log('✅ Campaign created')
        }
      } else {
        // Update existing campaign
        const response = await fetch('/api/ops/campaigns', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedCampaign)
        })
        
        const data = await response.json()
        if (data.success) {
          setCampaigns(campaigns.map(c => c.id === updatedCampaign.id ? updatedCampaign : c))
          console.log('✅ Campaign updated')
        }
      }
      
      setSelectedCampaign(null)
    } catch (error) {
      console.error('Error saving campaign:', error)
      alert('Failed to save campaign')
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/ops/campaigns?id=${campaignId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      if (data.success) {
        setCampaigns(campaigns.filter(c => c.id !== campaignId))
        console.log('✅ Campaign deleted')
      }
      
      setSelectedCampaign(null)
    } catch (error) {
      console.error('Error deleting campaign:', error)
      alert('Failed to delete campaign')
    }
  }

  // Navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // Generate calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const firstDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Add empty days for alignment
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ date: null, isCurrentMonth: false })
    }
    
    // Add days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ 
        date: new Date(year, month, i),
        isCurrentMonth: true 
      })
    }
    
    return days
  }

  const days = getDaysInMonth(currentMonth)
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    // Filter by selected client
    if (selectedClient !== 'all' && campaign.client_id !== selectedClient) {
      return false
    }
    
    // Filter by status
    if (statusFilter !== 'all' && campaign.status !== statusFilter) {
      return false
    }
    
    return true
  })

  // Group campaigns by date
  const campaignsByDate = filteredCampaigns.reduce((acc, campaign) => {
    const dateKey = campaign.send_date.toDateString()
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(campaign)
    return acc
  }, {} as Record<string, Campaign[]>)

  return (
    <div className="space-y-6">
      {/* Unified Header: Navigation + Filters */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            {/* Left: Month Navigation */}
            <div className="flex items-center gap-4">
              <button 
                onClick={prevMonth}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              
              <h2 className="text-2xl font-bold text-white">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              
              <button 
                onClick={nextMonth}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Right: Filters + Stats */}
            <div className="flex items-center gap-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-white/40 focus:border-white/40"
              >
                <option value="all" className="bg-gray-800">All Statuses</option>
                <option value="strategy" className="bg-gray-800">Strategy</option>
                <option value="copy" className="bg-gray-800">Copy</option>
                <option value="design" className="bg-gray-800">Design</option>
                <option value="qa" className="bg-gray-800">QA</option>
                <option value="client_approval" className="bg-gray-800">Client Approval</option>
                <option value="approved" className="bg-gray-800">Approved</option>
                <option value="scheduled" className="bg-gray-800">Scheduled</option>
                <option value="sent" className="bg-gray-800">Sent</option>
              </select>

              {/* Clear Filter */}
              {statusFilter !== 'all' && (
                <button
                  onClick={() => setStatusFilter('all')}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20"
                  title="Clear status filter"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Campaign Count */}
              <div className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg">
                <span className="text-white/70 text-sm">{filteredCampaigns.length} campaigns</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid with Drag & Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-0">
            <div className="grid grid-cols-7 gap-px bg-white/5">
              {/* Weekday headers */}
              {weekdays.map(day => (
                <div key={day} className="p-3 bg-white/5 text-center font-semibold text-white/80 text-sm">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {days.map((day, index) => {
                if (!day.date) {
                  return (
                    <div 
                      key={index}
                      className="min-h-[140px] p-2 bg-white/5 opacity-30"
                    />
                  )
                }
                
                const dayCampaigns = campaignsByDate[day.date.toDateString()] || []
                const isToday = day.date.toDateString() === new Date().toDateString()
                
                return (
                  <DroppableDay 
                    key={index} 
                    date={day.date}
                    campaigns={dayCampaigns}
                    isToday={isToday}
                    onCampaignClick={handleCampaignClick}
                    onAddCampaign={handleAddCampaign}
                  />
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeCampaign ? (
            <div className="p-2 rounded border-l-4 shadow-lg bg-white opacity-90"
              style={{ borderLeftColor: activeCampaign.client_color }}
            >
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
            <div className="text-white/70 text-sm">This Month</div>
            <div className="text-2xl font-bold text-white">
              {filteredCampaigns.filter(c => 
                c.send_date.getMonth() === currentMonth.getMonth() &&
                c.send_date.getFullYear() === currentMonth.getFullYear()
              ).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-4">
            <div className="text-white/70 text-sm">Needs Attention</div>
            <div className="text-2xl font-bold text-orange-400">
              {filteredCampaigns.filter(c => c.priority === 'urgent' || c.priority === 'high').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-4">
            <div className="text-white/70 text-sm">Client Approval</div>
            <div className="text-2xl font-bold text-blue-400">
              {filteredCampaigns.filter(c => c.status === 'client_approval').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-4">
            <div className="text-white/70 text-sm">Scheduled</div>
            <div className="text-2xl font-bold text-green-400">
              {filteredCampaigns.filter(c => c.status === 'scheduled').length}
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
