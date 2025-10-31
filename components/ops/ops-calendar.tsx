'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  X
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
}

interface OpsCalendarProps {
  clients: any[]
  selectedClient: string
}

export function OpsCalendar({ clients, selectedClient }: OpsCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Mock campaign data (will be replaced with real data later)
  const mockCampaigns: Campaign[] = [
    {
      id: '1',
      campaign_name: 'Black Friday Launch',
      client_id: clients[0]?.id || '1',
      client_name: clients[0]?.brand_name || 'Hydrus',
      client_color: clients[0]?.primary_color || '#3B82F6',
      send_date: new Date(2025, 10, 24, 9, 0), // Nov 24, 9am
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
      send_date: new Date(2025, 11, 1, 6, 0), // Dec 1
      status: 'copy',
      priority: 'urgent',
      campaign_type: 'email'
    }
  ]

  // Navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
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
  const filteredCampaigns = mockCampaigns.filter(campaign => {
    // Filter by selected client
    if (selectedClient !== 'all' && campaign.client_id !== selectedClient) {
      return false
    }
    
    // Filter by status
    if (statusFilter !== 'all' && campaign.status !== statusFilter) {
      return false
    }
    
    // Filter by search term
    if (searchTerm && !campaign.campaign_name.toLowerCase().includes(searchTerm.toLowerCase())) {
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

  // Status colors (matching portal)
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
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-white" />
              <CardTitle className="text-white">Campaign Calendar</CardTitle>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-white/80 text-sm">
                {filteredCampaigns.length} campaigns
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-white/40 focus:border-white/40"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

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

            {/* Clear Filters */}
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2 border border-white/20"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Calendar Navigation */}
      <div className="flex justify-between items-center">
        <button 
          onClick={prevMonth}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-white">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 bg-blue-500/30 hover:bg-blue-500/40 text-white rounded-lg text-sm font-medium transition-colors border border-blue-400/30"
          >
            Today
          </button>
        </div>
        
        <button 
          onClick={nextMonth}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar Grid */}
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
              const dayCampaigns = day.date ? (campaignsByDate[day.date.toDateString()] || []) : []
              const isToday = day.date?.toDateString() === new Date().toDateString()
              
              return (
                <div 
                  key={index}
                  className={`min-h-[140px] p-2 bg-white/5 hover:bg-white/10 transition-colors ${
                    !day.isCurrentMonth ? 'opacity-30' : ''
                  }`}
                >
                  {day.date && (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <div className={`text-sm font-medium ${
                          isToday 
                            ? 'w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center'
                            : 'text-white/70'
                        }`}>
                          {day.date.getDate()}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        {dayCampaigns.map(campaign => (
                          <div 
                            key={campaign.id}
                            className="p-2 text-xs rounded border cursor-pointer hover:shadow-sm transition-all"
                            style={{ 
                              borderLeftWidth: '4px',
                              borderLeftColor: campaign.client_color,
                              backgroundColor: campaign.campaign_type === 'sms' ? '#FEF9C3' : '#EFF6FF'
                            }}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div className="flex-1 min-w-0">
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
                                <div className={`inline-block px-2 py-0.5 rounded-full text-xs mt-1 border ${getStatusColor(campaign.status)}`}>
                                  {campaign.status.replace('_', ' ')}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

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
    </div>
  )
}

