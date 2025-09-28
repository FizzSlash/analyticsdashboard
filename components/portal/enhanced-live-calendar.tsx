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
  ChevronRight,
  Upload,
  Download,
  RefreshCw,
  CheckCircle,
  AlertTriangle
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
  subject_line?: string
  preview_url?: string
  external_id?: string // For Airtable sync
  synced_to_external: boolean
  last_sync?: Date
  isNew?: boolean
}

interface EnhancedLiveCalendarProps {
  client: any
  onSave?: (campaigns: CalendarCampaign[]) => void
}

export function EnhancedLiveCalendar({ client, onSave }: EnhancedLiveCalendarProps) {
  const [campaigns, setCampaigns] = useState<CalendarCampaign[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [editingCampaign, setEditingCampaign] = useState<CalendarCampaign | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isLiveMode, setIsLiveMode] = useState(false)
  const [syncStatus, setSyncStatus] = useState<string | null>(null)
  const [unsyncedCount, setUnsyncedCount] = useState(0)

  useEffect(() => {
    loadCampaigns()
  }, [client])

  useEffect(() => {
    // Count unsynced campaigns
    const unsynced = campaigns.filter(c => !c.synced_to_external).length
    setUnsyncedCount(unsynced)
  }, [campaigns])

  const loadCampaigns = async () => {
    try {
      // TODO: Load from your database (campaign_approvals table)
      // For now, use demo data
      setCampaigns(generateDemoCampaigns())
    } catch (error) {
      console.error('Error loading campaigns:', error)
    }
  }

  const generateDemoCampaigns = (): CalendarCampaign[] => [
    {
      id: '1',
      title: 'Black Friday Launch',
      type: 'email',
      date: new Date(2025, 9, 25),
      time: '09:00',
      status: 'client_approval',
      description: 'Major sale announcement with exclusive offers',
      audience: 'All Subscribers',
      subject_line: 'Get 50% OFF Everything - Limited Time! 🔥',
      synced_to_external: true,
      external_id: 'airtable_rec123'
    },
    {
      id: '2',
      title: 'Welcome Series Part 2',
      type: 'email', 
      date: new Date(2025, 9, 28),
      time: '14:00',
      status: 'scheduled',
      description: 'Product education email for new subscribers',
      audience: 'New Subscribers',
      subject_line: 'Discover what makes us different',
      synced_to_external: false,
      external_id: undefined
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
      subject_line: '',
      synced_to_external: false,
      isNew: true
    }
    setEditingCampaign(newCampaign)
    setShowAddModal(true)
  }

  const saveCampaign = async (campaign: CalendarCampaign) => {
    try {
      // Mark as unsynced when edited
      const updatedCampaign = { 
        ...campaign, 
        isNew: false, 
        synced_to_external: false,
        last_sync: undefined
      }

      if (campaign.isNew) {
        setCampaigns(prev => [...prev, updatedCampaign])
      } else {
        setCampaigns(prev => prev.map(c => c.id === campaign.id ? updatedCampaign : c))
      }

      // TODO: Save to database (campaign_approvals table)
      await saveCampaignToDatabase(updatedCampaign)
      
      setEditingCampaign(null)
      setShowAddModal(false)
      onSave?.(campaigns)
    } catch (error) {
      console.error('Error saving campaign:', error)
    }
  }

  const deleteCampaign = async (campaignId: string) => {
    try {
      setCampaigns(prev => prev.filter(c => c.id !== campaignId))
      // TODO: Delete from database
      await deleteCampaignFromDatabase(campaignId)
    } catch (error) {
      console.error('Error deleting campaign:', error)
    }
  }

  const syncToAirtable = async () => {
    setSyncStatus('syncing')
    try {
      const unsyncedCampaigns = campaigns.filter(c => !c.synced_to_external)
      
      for (const campaign of unsyncedCampaigns) {
        // TODO: Sync to Airtable/Make.com webhook
        const response = await fetch('/api/sync-to-airtable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client: client.brand_slug,
            campaign: campaign
          })
        })
        
        if (response.ok) {
          // Mark as synced
          setCampaigns(prev => prev.map(c => 
            c.id === campaign.id 
              ? { ...c, synced_to_external: true, last_sync: new Date() }
              : c
          ))
        }
      }
      
      setSyncStatus('success')
      setTimeout(() => setSyncStatus(null), 3000)
    } catch (error) {
      setSyncStatus('error')
      setTimeout(() => setSyncStatus(null), 5000)
    }
  }

  const saveCampaignToDatabase = async (campaign: CalendarCampaign) => {
    // TODO: Implement database save
    console.log('Saving to database:', campaign)
  }

  const deleteCampaignFromDatabase = async (campaignId: string) => {
    // TODO: Implement database delete
    console.log('Deleting from database:', campaignId)
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
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ date: null, isCurrentMonth: false })
    }
    
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
      {/* Calendar Header with Sync Status */}
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
                    ? 'bg-red-100 text-red-700 border border-red-300' 
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
              >
                {isLiveMode ? '🔴 LIVE' : 'Edit Mode'}
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-gray-600 text-sm">
                {client.brand_name} • {unsyncedCount} unsynced
              </div>
              
              {unsyncedCount > 0 && (
                <button
                  onClick={syncToAirtable}
                  disabled={syncStatus === 'syncing'}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    syncStatus === 'syncing' 
                      ? 'bg-gray-100 text-gray-400'
                      : syncStatus === 'success'
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : syncStatus === 'error'
                      ? 'bg-red-100 text-red-700 border border-red-300'
                      : 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
                  }`}
                >
                  {syncStatus === 'syncing' ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
                      Syncing...
                    </>
                  ) : syncStatus === 'success' ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Synced
                    </>
                  ) : syncStatus === 'error' ? (
                    <>
                      <AlertTriangle className="h-3 w-3" />
                      Error
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3" />
                      Sync to Airtable
                    </>
                  )}
                </button>
              )}
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
                  className={`min-h-[140px] p-2 bg-white hover:bg-gray-50 transition-colors ${
                    !day.isCurrentMonth ? 'opacity-50' : ''
                  } ${isLiveMode ? 'cursor-pointer' : ''}`}
                  onClick={() => day.date && isLiveMode && addCampaign(day.date)}
                >
                  {day.date && (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm text-gray-600 font-medium">
                          {day.date.getDate()}
                        </div>
                        {isLiveMode && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              addCampaign(day.date!)
                            }}
                            className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-blue-50"
                            title="Add campaign"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        {dayCampaigns.map(campaign => (
                          <div 
                            key={campaign.id}
                            className={`p-2 text-xs rounded border cursor-pointer hover:shadow-sm transition-all ${getCampaignTypeColor(campaign.type)}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingCampaign(campaign)
                              setShowAddModal(true)
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-800 truncate">{campaign.title}</div>
                                <div className="text-gray-600 text-xs mt-1">{campaign.time}</div>
                                <div className={`inline-block px-2 py-1 rounded-full text-xs mt-1 border ${getStatusColor(campaign.status)}`}>
                                  {campaign.status.replace('_', ' ')}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1 ml-2">
                                {!campaign.synced_to_external && (
                                  <div className="w-2 h-2 bg-orange-500 rounded-full" title="Unsynced"></div>
                                )}
                                {isLiveMode && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deleteCampaign(campaign.id)
                                    }}
                                    className="text-gray-400 hover:text-red-600 transition-colors p-0.5 rounded hover:bg-red-50"
                                    title="Delete campaign"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
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

      {/* Campaign Editor Modal */}
      {showAddModal && editingCampaign && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-white border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-gray-900">
                  {editingCampaign.isNew ? 'Add New Campaign' : 'Edit Campaign'}
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
                <label className="block text-gray-700 text-sm font-medium mb-2">Campaign Title *</label>
                <input
                  type="text"
                  value={editingCampaign.title}
                  onChange={(e) => setEditingCampaign({...editingCampaign, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter campaign title..."
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Subject Line</label>
                <input
                  type="text"
                  value={editingCampaign.subject_line || ''}
                  onChange={(e) => setEditingCampaign({...editingCampaign, subject_line: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Craft a compelling subject line..."
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
                    <option value="email">Email Campaign</option>
                    <option value="sms">SMS Campaign</option>
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
                  <label className="block text-gray-700 text-sm font-medium mb-2">Send Date</label>
                  <input
                    type="date"
                    value={editingCampaign.date.toISOString().split('T')[0]}
                    onChange={(e) => setEditingCampaign({...editingCampaign, date: new Date(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Send Time</label>
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
                  placeholder="e.g., All Subscribers, VIP Customers, Recent Purchasers..."
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Campaign Notes</label>
                <textarea
                  value={editingCampaign.description}
                  onChange={(e) => setEditingCampaign({...editingCampaign, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Campaign objectives, key messages, special notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors border border-gray-300"
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

              {/* Sync Status */}
              {!editingCampaign.synced_to_external && !editingCampaign.isNew && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-orange-700 text-sm">
                    ⚠️ This campaign has unsaved changes and will be synced to Airtable after you save.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Live Mode Instructions */}
      {isLiveMode && (
        <Card className="bg-green-50 border border-green-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mt-2"></div>
              <div>
                <span className="font-medium text-green-700">Live Mode Active - Perfect for Client Calls</span>
                <p className="text-green-600 text-sm mt-1">
                  • Click any date to add campaigns instantly<br/>
                  • Click existing campaigns to edit details<br/>
                  • Changes save automatically to database<br/>
                  • Sync to Airtable when call is complete
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}