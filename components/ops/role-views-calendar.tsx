'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Eye,
  FileText,
  Palette,
  Rocket,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon
} from 'lucide-react'

type RoleView = 'copywriter' | 'designer' | 'implementor' | 'pm'

interface RoleViewsCalendarProps {
  clients: any[]
  campaigns: any[]
  flows: any[]
  selectedClient?: string
}

export function RoleViewsCalendar({ clients, campaigns, flows, selectedClient = 'all' }: RoleViewsCalendarProps) {
  const [activeView, setActiveView] = useState<RoleView>('copywriter')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [clientFilter, setClientFilter] = useState<string>(selectedClient)

  useEffect(() => {
    setClientFilter(selectedClient)
  }, [selectedClient])

  const roleViews = [
    { id: 'copywriter', label: 'Copywriter', icon: FileText, statuses: ['strategy', 'copy'], color: 'blue' },
    { id: 'designer', label: 'Designer', icon: Palette, statuses: ['design'], color: 'purple' },
    { id: 'implementor', label: 'Implementor', icon: Rocket, statuses: ['qa', 'approved', 'scheduled'], color: 'green' },
    { id: 'pm', label: 'Project Manager', icon: Briefcase, statuses: ['client_approval', 'revisions'], color: 'orange' }
  ]

  const activeRoleConfig = roleViews.find(v => v.id === activeView)!

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

  // Filter campaigns for this role and client
  const filteredCampaigns = campaigns.filter(campaign => {
    // Filter by client
    if (clientFilter !== 'all' && campaign.client_id !== clientFilter) {
      return false
    }
    
    // Filter by role statuses
    if (!activeRoleConfig.statuses.includes(campaign.status)) {
      return false
    }
    
    return true
  })

  // Group campaigns by date
  const campaignsByDate: { [key: string]: any[] } = {}
  filteredCampaigns.forEach(campaign => {
    const dateKey = new Date(campaign.send_date).toDateString()
    if (!campaignsByDate[dateKey]) {
      campaignsByDate[dateKey] = []
    }
    campaignsByDate[dateKey].push(campaign)
  })

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'strategy': return 'bg-gray-500'
      case 'copy': return 'bg-blue-500'
      case 'design': return 'bg-purple-500'
      case 'qa': return 'bg-yellow-500'
      case 'client_approval': return 'bg-orange-500'
      case 'approved': return 'bg-green-500'
      case 'scheduled': return 'bg-teal-500'
      case 'revisions': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Role Selector */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Role-Based Calendar Views
              </CardTitle>
              <div className="text-white/70 text-sm mt-1">
                See campaigns filtered by role and work status
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Role Selector */}
              <select
                value={activeView}
                onChange={(e) => setActiveView(e.target.value as RoleView)}
                className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg font-semibold focus:ring-2 focus:ring-white/40 min-w-[200px]"
              >
                {roleViews.map(view => (
                  <option key={view.id} value={view.id} className="bg-gray-800">
                    {view.label}
                  </option>
                ))}
              </select>
              
              {/* Client Filter */}
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-white/40"
              >
                <option value="all" className="bg-gray-800">All Clients</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id} className="bg-gray-800">
                    {client.brand_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Role Info Banner */}
      <Card className={`bg-${activeRoleConfig.color}-500/20 border-${activeRoleConfig.color}-400/30 shadow-xl`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <activeRoleConfig.icon className="h-5 w-5 text-white" />
              <div>
                <div className="text-white font-semibold">{activeRoleConfig.label} View</div>
                <div className="text-white/70 text-sm">
                  Showing campaigns in: {activeRoleConfig.statuses.map(s => s.replace('_', ' ').toUpperCase()).join(', ')}
                </div>
              </div>
            </div>
            <div className="text-white/90 font-bold text-2xl">
              {filteredCampaigns.length} items
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Navigation */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
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
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardContent className="p-0">
          <div className="grid grid-cols-7 gap-px bg-white/5">
            {/* Weekday headers */}
            {weekdays.map(day => (
              <div key={day} className="bg-white/10 p-3 text-center">
                <div className="text-white/80 text-sm font-semibold">{day}</div>
              </div>
            ))}

            {/* Calendar days */}
            {days.map((day, index) => {
              const isToday = day.date && day.date.toDateString() === new Date().toDateString()
              const dayCampaigns = day.date ? (campaignsByDate[day.date.toDateString()] || []) : []
              
              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 ${
                    day.isCurrentMonth 
                      ? 'bg-white/5 hover:bg-white/10' 
                      : 'bg-white/0'
                  } ${
                    isToday ? 'ring-2 ring-white/40' : ''
                  }`}
                >
                  {day.date && (
                    <>
                      <div className={`text-sm font-semibold mb-2 ${
                        isToday 
                          ? 'text-white bg-white/20 rounded-full w-7 h-7 flex items-center justify-center' 
                          : 'text-white/70'
                      }`}>
                        {day.date.getDate()}
                      </div>

                      {/* Campaigns for this day */}
                      <div className="space-y-1">
                        {dayCampaigns.slice(0, 3).map(campaign => {
                          const clientData = clients.find(c => c.id === campaign.client_id)
                          const clientColor = clientData?.primary_color || '#3B82F6'
                          
                          return (
                            <div
                              key={campaign.id}
                              className="text-xs p-2 rounded cursor-pointer hover:opacity-80 transition-opacity"
                              style={{ 
                                backgroundColor: `${clientColor}40`,
                                borderLeft: `3px solid ${clientColor}`
                              }}
                              onClick={() => onCampaignClick?.(campaign)}
                            >
                              <div className="font-medium text-white truncate">
                                {campaign.campaign_name}
                              </div>
                              <div className="text-white/70 text-[10px] truncate">
                                {clientData?.brand_name}
                              </div>
                              <div className={`inline-block px-1.5 py-0.5 rounded text-[9px] text-white mt-1 ${getStatusBadgeColor(campaign.status)}`}>
                                {campaign.status.replace('_', ' ').toUpperCase()}
                              </div>
                            </div>
                          )
                        })}
                        
                        {dayCampaigns.length > 3 && (
                          <div className="text-xs text-white/60 text-center py-1">
                            +{dayCampaigns.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Campaign List Below Calendar */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white">
            All {activeRoleConfig.label} Items ({filteredCampaigns.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredCampaigns.length === 0 ? (
              <div className="text-white/70 text-center py-12">
                No campaigns found for this role
              </div>
            ) : (
              filteredCampaigns
                .sort((a, b) => new Date(a.send_date).getTime() - new Date(b.send_date).getTime())
                .map(campaign => {
                  const clientData = clients.find(c => c.id === campaign.client_id)
                  const clientColor = clientData?.primary_color || '#3B82F6'
                  
                  return (
                    <div
                      key={campaign.id}
                      className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
                      onClick={() => onCampaignClick?.(campaign)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className="w-1 h-12 rounded-full"
                            style={{ backgroundColor: clientColor }}
                          />
                          <div>
                            <div className="text-white font-semibold">{campaign.campaign_name}</div>
                            <div className="text-white/60 text-sm">
                              {clientData?.brand_name} • {new Date(campaign.send_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusBadgeColor(campaign.status)}`}>
                            {campaign.status.replace('_', ' ').toUpperCase()}
                          </div>
                          {campaign.priority === 'urgent' && (
                            <div className="px-2 py-1 bg-red-500/30 border border-red-400/40 rounded text-xs text-white font-medium">
                              URGENT
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'strategy': return 'bg-gray-500'
    case 'copy': return 'bg-blue-500'
    case 'design': return 'bg-purple-500'
    case 'qa': return 'bg-yellow-500'
    case 'client_approval': return 'bg-orange-500'
    case 'approved': return 'bg-green-500'
    case 'scheduled': return 'bg-teal-500'
    case 'revisions': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

