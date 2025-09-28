'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Calendar,
  Plus,
  Edit,
  Save,
  X,
  Mail,
  MessageSquare,
  Clock,
  Users,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface CalendarCampaign {
  id: string
  title: string
  type: 'email' | 'sms'
  date: Date
  time: string
  status: 'draft' | 'scheduled' | 'client_approval' | 'approved' | 'sent'
  description: string
  audience: string
  isNew?: boolean
}

interface LiveEditableCalendarProps {
  client: any
  onSave?: (campaigns: CalendarCampaign[]) => void
}

export function LiveEditableCalendar({ client, onSave }: LiveEditableCalendarProps) {
  const [campaigns, setCampaigns] = useState<CalendarCampaign[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [editingCampaign, setEditingCampaign] = useState<CalendarCampaign | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isLiveMode, setIsLiveMode] = useState(false)

  useEffect(() => {
    // Load existing campaigns or generate demo data
    setCampaigns(generateDemoCampaigns())
  }, [client])

  const generateDemoCampaigns = (): CalendarCampaign[] => [
    {
      id: '1',
      title: 'Black Friday Launch',
      type: 'email',
      date: new Date(2025, 9, 25), // Oct 25
      time: '09:00',
      status: 'client_approval',
      description: 'Major sale announcement with exclusive offers',
      audience: 'All Subscribers'
    },
    {
      id: '2',
      title: 'Welcome Series Part 2',
      type: 'email',
      date: new Date(2025, 9, 28), // Oct 28
      time: '14:00',
      status: 'scheduled',
      description: 'Product education email for new subscribers',
      audience: 'New Subscribers'
    }
  ]

  const addCampaign = (date: Date) => {
    const newCampaign: CalendarCampaign = {
      id: `new-${Date.now()}`,
      title: '',
      type: 'email',
      date: date,
      time: '09:00',
      status: 'draft',
      description: '',
      audience: '',
      isNew: true
    }
    setEditingCampaign(newCampaign)
    setShowAddModal(true)
  }

  const saveCampaign = (campaign: CalendarCampaign) => {
    if (campaign.isNew) {
      setCampaigns(prev => [...prev, { ...campaign, isNew: false }])
    } else {
      setCampaigns(prev => prev.map(c => c.id === campaign.id ? campaign : c))
    }
    setEditingCampaign(null)
    setShowAddModal(false)
    
    // Save to database
    onSave?.(campaigns)
  }

  const deleteCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== campaignId))
  }

  // Calendar navigation
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
    
    // Empty slots before first day
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ date: null, isCurrentMonth: false })
    }
    
    // All days in month
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
  
  // Group campaigns by date
  const campaignsByDate = campaigns.reduce((acc, campaign) => {
    const dateKey = campaign.date.toDateString()
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(campaign)
    return acc
  }, {} as Record<string, CalendarCampaign[]>)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-600 border-gray-300'
      case 'scheduled': return 'bg-blue-100 text-blue-600 border-blue-300'
      case 'client_approval': return 'bg-orange-100 text-orange-600 border-orange-300'
      case 'approved': return 'bg-green-100 text-green-600 border-green-300'
      case 'sent': return 'bg-purple-100 text-purple-600 border-purple-300'
      default: return 'bg-gray-100 text-gray-600 border-gray-300'
    }
  }

  const getCampaignTypeColor = (type: string) => {
    return type === 'sms' 
      ? 'border-l-4 border-l-yellow-500 bg-yellow-50' 
      : 'border-l-4 border-l-blue-500 bg-blue-50'
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-gray-900">Live Campaign Calendar</CardTitle>
              <button
                onClick={() => setIsLiveMode(!isLiveMode)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isLiveMode 
                    ? 'bg-green-100 text-green-700 border border-green-300' 
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
              >
                {isLiveMode ? '🔴 LIVE' : 'Edit Mode'}
              </button>
            </div>
            <div className="text-gray-600 text-sm">
              Build with client: <span className="text-gray-900 font-medium">{client.brand_name}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Navigation */}
      <div className="flex justify-between items-center">
        <button 
          onClick={prevMonth}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        
        <h2 className="text-xl font-semibold text-gray-900">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        
        <button 
          onClick={nextMonth}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar Grid */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {/* Weekday headers */}
            {weekdays.map(day => (
              <div key={day} className="p-3 bg-gray-100 text-center font-semibold text-gray-700 text-sm">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {days.map((day, index) => {
              const dayCampaigns = day.date ? (campaignsByDate[day.date.toDateString()] || []) : []
              
              return (
                <div 
                  key={index}
                  className={`min-h-[120px] p-2 bg-white hover:bg-gray-50 transition-colors cursor-pointer ${
                    !day.isCurrentMonth ? 'opacity-50' : ''
                  }`}
                  onClick={() => day.date && (isLiveMode ? addCampaign(day.date) : setSelectedDate(day.date))}
                >
                  {day.date && (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm text-gray-600">
                          {day.date.getDate()}
                        </div>
                        {isLiveMode && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              addCampaign(day.date!)
                            }}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        {dayCampaigns.map(campaign => (
                          <div 
                            key={campaign.id}
                            className={`p-2 text-xs rounded cursor-pointer hover:opacity-80 transition-opacity ${getCampaignTypeColor(campaign.type)}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (isLiveMode) {
                                setEditingCampaign(campaign)
                                setShowAddModal(true)
                              }
                            }}
                          >
                            <div className="font-semibold text-gray-800 truncate">{campaign.title}</div>
                            <div className="text-gray-600 text-xs mt-1">{campaign.time}</div>
                            <div className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${getStatusColor(campaign.status)}`}>
                              {campaign.status.replace('_', ' ')}
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

      {/* Campaign Editor Modal */}
      {showAddModal && editingCampaign && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-white border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-gray-900">
                  {editingCampaign.isNew ? 'Add Campaign' : 'Edit Campaign'}
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
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Campaign Title</label>
                <input
                  type="text"
                  value={editingCampaign.title}
                  onChange={(e) => setEditingCampaign({...editingCampaign, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter campaign title..."
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Type</label>
                  <select 
                    value={editingCampaign.type}
                    onChange={(e) => setEditingCampaign({...editingCampaign, type: e.target.value as 'email' | 'sms'})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Status</label>
                  <select 
                    value={editingCampaign.status}
                    onChange={(e) => setEditingCampaign({...editingCampaign, status: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="client_approval">Client Approval</option>
                    <option value="approved">Approved</option>
                    <option value="sent">Sent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={editingCampaign.date.toISOString().split('T')[0]}
                    onChange={(e) => setEditingCampaign({...editingCampaign, date: new Date(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Time</label>
                  <input
                    type="time"
                    value={editingCampaign.time}
                    onChange={(e) => setEditingCampaign({...editingCampaign, time: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Target Audience</label>
                <input
                  type="text"
                  value={editingCampaign.audience}
                  onChange={(e) => setEditingCampaign({...editingCampaign, audience: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., All Subscribers, VIP Customers..."
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={editingCampaign.description}
                  onChange={(e) => setEditingCampaign({...editingCampaign, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Campaign objectives, key messages, notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors border border-gray-300"
                >
                  Cancel
                </button>
                
                {!editingCampaign.isNew && (
                  <button
                    onClick={() => {
                      deleteCampaign(editingCampaign.id)
                      setShowAddModal(false)
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                )}
                
                <button
                  onClick={() => saveCampaign(editingCampaign)}
                  disabled={!editingCampaign.title.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Campaign
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Live Mode Instructions */}
      {isLiveMode && (
        <Card className="bg-green-50 border border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Live Mode Active</span>
            </div>
            <p className="text-green-600 text-sm mt-1">
              Click any date to add campaigns in real-time during your client call. Click existing campaigns to edit them.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Campaign List (for mobile/small screens) */}
      <Card className="bg-white border border-gray-200 shadow-sm lg:hidden">
        <CardHeader>
          <CardTitle className="text-gray-900">Upcoming Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campaigns
              .filter(campaign => campaign.date >= new Date())
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .slice(0, 5)
              .map(campaign => (
                <div 
                  key={campaign.id}
                  className={`p-3 rounded-lg border ${getCampaignTypeColor(campaign.type)} cursor-pointer`}
                  onClick={() => {
                    setEditingCampaign(campaign)
                    setShowAddModal(true)
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-gray-900 font-medium">{campaign.title}</h4>
                      <p className="text-gray-600 text-sm">
                        {campaign.date.toLocaleDateString()} at {campaign.time}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(campaign.status)}`}>
                      {campaign.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            }
          </div>
        </CardContent>
      </Card>
    </div>
  )
}