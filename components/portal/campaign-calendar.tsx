'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus,
  Calendar,
  Edit,
  Save,
  Trash2,
  X,
  Mail,
  MessageSquare,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Target,
  TestTube
} from 'lucide-react'

interface DesignFile {
  id: string
  filename: string
  url: string
  thumbnail_url: string
  type: string
  size: number
}

interface Campaign {
  id: string
  title: string
  type: 'email' | 'sms' | 'popup' | 'ab_test'
  status: string // Use actual Airtable stages: "Content Strategy", "Copy", "Design", "Ready For Client Approval", etc.
  client: string
  date: Date
  time: string
  description: string
  audience: string
  subject_line?: string
  offer?: string
  notes: string
  client_notes?: string // For client feedback
  assignee?: string
  copy_due_date?: Date
  design_due_date?: Date
  copy_link?: string
  ab_test?: string // A/B test field from Airtable
  design_files?: DesignFile[] // From Airtable File field
  external_id?: string
  synced_to_external: boolean
  last_sync?: Date
  isNew?: boolean
  // A/B test specific
  test_type?: 'subject_line' | 'content' | 'send_time' | 'offer' | 'design'
  start_date?: Date
  end_date?: Date
  winner_variant?: string
}

interface CampaignCalendarProps {
  client: any
  userRole: 'client_user' | 'agency_admin'
  canEdit: boolean
  canCreate: boolean
  canApprove: boolean
}

export function CampaignCalendar({ client, userRole, canEdit, canCreate, canApprove }: CampaignCalendarProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [syncingOperations, setSyncingOperations] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadCampaigns()
  }, [client])

  const loadCampaigns = async () => {
    try {
      // Load from Airtable first
      console.log('📥 Loading campaigns from Airtable for client:', client.brand_slug)
      const response = await fetch(`/api/load-from-airtable?client=${encodeURIComponent(client.brand_name)}`)
      const result = await response.json()
      
      if (result.success) {
        console.log(`📥 Loaded ${result.campaigns.length} campaigns from Airtable`)
        
        // Debug: Log first campaign to see structure
        if (result.campaigns.length > 0) {
          console.log('📥 First campaign structure:', result.campaigns[0])
        }
        
        setCampaigns(result.campaigns)
      } else {
        console.error('Failed to load from Airtable:', result.error)
        // Fallback to demo data
        setCampaigns(generateDemoCampaigns())
      }
    } catch (error) {
      console.error('Error loading campaigns:', error)
      // Fallback to demo data
      setCampaigns(generateDemoCampaigns())
    }
  }

  const generateDemoCampaigns = (): Campaign[] => [
    // Return empty array - only use real Airtable data
  ]

  // Helper functions for sync operations
  const addSyncingOperation = (campaignId: string) => {
    setSyncingOperations(prev => new Set(prev).add(campaignId))
  }

  const removeSyncingOperation = (campaignId: string) => {
    setSyncingOperations(prev => {
      const newSet = new Set(prev)
      newSet.delete(campaignId)
      return newSet
    })
  }

  const saveCampaign = async (campaign: Campaign) => {
    addSyncingOperation(campaign.id)
    
    try {
      const updatedCampaign = { 
        ...campaign, 
        isNew: false, 
        synced_to_external: false,
        last_sync: undefined
      }

      // Update local state immediately
      if (campaign.isNew) {
        setCampaigns(prev => [...prev, updatedCampaign])
      } else {
        setCampaigns(prev => prev.map(c => c.id === campaign.id ? updatedCampaign : c))
      }

      // Save to database first
      await saveCampaignToDatabase(updatedCampaign)
      
      // 🚀 AUTO-SYNC: Immediately sync to Airtable
      console.log('🔄 AUTO-SYNC: Syncing to Airtable:', updatedCampaign.title)
      const syncResponse = await fetch('/api/sync-to-airtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: client.brand_slug,
          campaign: updatedCampaign
        })
      })

      const syncResult = await syncResponse.json()
      
      if (syncResult.success) {
        setCampaigns(prev => prev.map(c => 
          c.id === campaign.id 
            ? { 
                ...c, 
                synced_to_external: true, 
                external_id: syncResult.airtable_record_id,
                last_sync: new Date() 
              }
            : c
        ))
        console.log('✅ AUTO-SYNC: Successfully synced to Airtable')
      } else {
        console.error('❌ AUTO-SYNC: Failed to sync to Airtable:', syncResult.error)
      }
      
      setEditingCampaign(null)
      setShowAddModal(false)
    } catch (error) {
      console.error('❌ AUTO-SYNC: Error saving/syncing:', error)
    } finally {
      removeSyncingOperation(campaign.id)
    }
  }

  const deleteCampaign = async (campaignId: string) => {
    if (!canEdit) return
    
    addSyncingOperation(campaignId)
    
    try {
      const campaign = campaigns.find(c => c.id === campaignId)
      setCampaigns(prev => prev.filter(c => c.id !== campaignId))
      await deleteCampaignFromDatabase(campaignId)
      
      // Auto-sync deletion to Airtable
      if (campaign?.external_id) {
        console.log('🗑️ AUTO-SYNC: Deleting from Airtable:', campaign.title)
        const deleteResponse = await fetch('/api/sync-to-airtable', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            airtable_record_id: campaign.external_id,
            campaign_id: campaignId
          })
        })
        
        const deleteResult = await deleteResponse.json()
        if (deleteResult.success) {
          console.log('✅ AUTO-SYNC: Successfully deleted from Airtable')
        }
      }
      
    } catch (error) {
      console.error('❌ AUTO-SYNC: Error deleting campaign:', error)
    } finally {
      removeSyncingOperation(campaignId)
    }
  }

  const approveCampaign = async (campaignId: string, approved: boolean) => {
    if (!canApprove) return
    
    addSyncingOperation(campaignId)
    
    try {
      const updatedCampaigns = campaigns.map(c => 
        c.id === campaignId 
          ? { 
              ...c, 
              status: approved ? 'Approved' : 'Client Revisions',
              client_notes: approved ? 'Approved by client' : (c.client_notes || 'Revisions requested'),
              synced_to_external: false
            }
          : c
      )
      setCampaigns(updatedCampaigns)
      
      // Auto-sync approval to Airtable
      const campaign = updatedCampaigns.find(c => c.id === campaignId)
      if (campaign) {
        const syncResponse = await fetch('/api/sync-to-airtable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client: client.brand_slug,
            campaign: campaign
          })
        })
        
        const syncResult = await syncResponse.json()
        if (syncResult.success) {
          setCampaigns(prev => prev.map(c => 
            c.id === campaignId 
              ? { ...c, synced_to_external: true, last_sync: new Date() }
              : c
          ))
        }
      }
      
    } catch (error) {
      console.error('❌ Error approving campaign:', error)
    } finally {
      removeSyncingOperation(campaignId)
    }
  }

  const saveCampaignToDatabase = async (campaign: Campaign) => {
    console.log('💾 Saving to database:', campaign.title)
  }

  const deleteCampaignFromDatabase = async (campaignId: string) => {
    console.log('🗑️ Deleting from database:', campaignId)
  }

  const addCampaign = (date?: Date, type: 'email' | 'sms' | 'popup' | 'ab_test' = 'email') => {
    if (!canCreate) return
    
    const newCampaign: Campaign = {
      id: `${type}-${Date.now()}`,
      title: '',
      type: type,
      status: 'Content Strategy', // Use real Airtable stage
      client: client.brand_name,
      date: date || new Date(),
      time: '09:00',
      description: '',
      audience: '',
      subject_line: '',
      notes: '',
      synced_to_external: false,
      isNew: true,
      // A/B test specific defaults
      ...(type === 'ab_test' && {
        test_type: 'subject_line',
        start_date: date || new Date(),
        end_date: new Date((date || new Date()).getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days later
      })
    }
    setEditingCampaign(newCampaign)
    setShowAddModal(true)
  }

  // Calendar helpers
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Content Strategy': return 'bg-gray-500/30 text-gray-300 border-gray-400'
      case 'Copy': return 'bg-blue-500/30 text-blue-300 border-blue-400'
      case 'Copy QA': return 'bg-blue-500/40 text-blue-200 border-blue-300'
      case 'Design': return 'bg-purple-500/30 text-purple-300 border-purple-400'
      case 'Design QA': return 'bg-purple-500/40 text-purple-200 border-purple-300'
      case 'Ready For Client Approval': return 'bg-orange-500/30 text-orange-300 border-orange-400'
      case 'Client Approval': return 'bg-orange-500/30 text-orange-300 border-orange-400'
      case 'Approved': return 'bg-green-500/30 text-green-300 border-green-400'
      case 'Client Revisions': return 'bg-red-500/30 text-red-300 border-red-400'
      case 'Ready For Schedule': return 'bg-teal-500/30 text-teal-300 border-teal-400'
      case 'Ready For Imp QA': return 'bg-indigo-500/30 text-indigo-300 border-indigo-400'
      case 'Scheduled - Close': return 'bg-green-500/40 text-green-200 border-green-300'
      default: return 'bg-gray-500/30 text-gray-300 border-gray-400'
    }
  }

  const getCampaignTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'border-l-4 border-l-blue-400 bg-blue-500/20'
      case 'sms': return 'border-l-4 border-l-yellow-400 bg-yellow-500/20'
      case 'popup': return 'border-l-4 border-l-green-400 bg-green-500/20'
      case 'ab_test': return 'border-l-4 border-l-purple-400 bg-purple-500/20'
      default: return 'border-l-4 border-l-gray-400 bg-gray-500/20'
    }
  }

  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail
      case 'sms': return MessageSquare
      case 'popup': return Target
      case 'ab_test': return TestTube
      default: return Mail
    }
  }

  const days = getDaysInMonth(currentMonth)
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  const campaignsByDate = campaigns.reduce((acc, campaign) => {
    // Defensive programming: ensure date is a Date object
    let campaignDate = campaign.date
    if (!(campaignDate instanceof Date)) {
      console.warn('⚠️ Campaign date is not a Date object:', campaign.title, campaignDate)
      campaignDate = new Date(campaignDate)
    }
    
    // Only process if we have a valid date
    if (!isNaN(campaignDate.getTime())) {
      const dateKey = campaignDate.toDateString()
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push({
        ...campaign,
        date: campaignDate // Ensure the campaign object has a proper Date
      })
    } else {
      console.error('❌ Invalid date for campaign:', campaign.title, campaignDate)
    }
    
    return acc
  }, {} as Record<string, Campaign[]>)

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      {canCreate && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg">Quick Actions</h3>
                <p className="text-white/80 text-sm font-medium">Create new campaigns and tests</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => addCampaign(undefined, 'email')}
                  className="bg-blue-600/90 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 text-sm shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm border border-blue-500/30"
                >
                  <Mail className="h-5 w-5" />
                  Email
                </button>
                <button 
                  onClick={() => addCampaign(undefined, 'sms')}
                  className="bg-yellow-600/90 hover:bg-yellow-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 text-sm shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm border border-yellow-500/30"
                >
                  <MessageSquare className="h-5 w-5" />
                  SMS
                </button>
                <button 
                  onClick={() => addCampaign(undefined, 'popup')}
                  className="bg-green-600/90 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 text-sm shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm border border-green-500/30"
                >
                  <Target className="h-5 w-5" />
                  Popup
                </button>
                <button 
                  onClick={() => addCampaign(undefined, 'ab_test')}
                  className="bg-purple-600/90 hover:bg-purple-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 text-sm shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm border border-purple-500/30"
                >
                  <TestTube className="h-5 w-5" />
                  A/B Test
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar Navigation */}
      <div className="flex justify-between items-center">
        <button 
          onClick={prevMonth}
          className="flex items-center gap-3 px-6 py-3 bg-white/15 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/25 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
        >
          <ChevronLeft className="h-5 w-5" />
          Previous
        </button>
        
        <h2 className="text-2xl font-bold text-white bg-white/10 backdrop-blur-sm px-8 py-4 rounded-2xl border border-white/20 shadow-lg">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        
        <button 
          onClick={nextMonth}
          className="flex items-center gap-3 px-6 py-3 bg-white/15 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/25 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
        >
          Next
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-7 gap-px bg-white/5">
            {/* Weekday headers */}
            {weekdays.map(day => (
              <div key={day} className="p-4 bg-white/20 backdrop-blur-sm text-center font-bold text-white text-sm border-b border-white/10">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {days.map((day, index) => {
              const dayCampaigns = day.date ? (campaignsByDate[day.date.toDateString()] || []) : []
              
              return (
                <div 
                  key={index}
                  className={`min-h-[160px] p-3 bg-white/5 hover:bg-white/15 transition-all duration-200 border-r border-b border-white/10 ${
                    !day.isCurrentMonth ? 'opacity-50' : ''
                  } ${canCreate ? 'cursor-pointer hover:shadow-lg' : ''}`}
                  onClick={() => day.date && canCreate && addCampaign(day.date)}
                >
                  {day.date && (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm text-white/80 font-medium">
                          {day.date.getDate()}
                        </div>
                        {canCreate && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              addCampaign(day.date!)
                            }}
                            className="text-white/40 hover:text-white/80 transition-colors p-1 rounded hover:bg-white/10"
                            title="Add campaign"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        {dayCampaigns.slice(0, 2).map(campaign => {
                          const Icon = getCampaignTypeIcon(campaign.type)
                          return (
                            <div 
                              key={campaign.id}
                              className={`p-3 text-xs rounded-lg backdrop-blur-sm border border-white/30 cursor-pointer hover:bg-white/20 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-102 ${getCampaignTypeColor(campaign.type)}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingCampaign(campaign)
                                setShowAddModal(true)
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1 mb-1">
                                    <Icon className="h-3 w-3 text-white/70" />
                                    <div className="font-semibold text-white truncate">{campaign.title}</div>
                                  </div>
                                  <div className="text-white/60 text-xs">{campaign.time}</div>
                                  <div className={`inline-block px-2 py-1 rounded-full text-xs mt-1 border ${getStatusColor(campaign.status)}`}>
                                    {campaign.status}
                                  </div>
                                  
                        {/* Client approval actions */}
                        {canApprove && (campaign.status === 'Ready For Client Approval' || campaign.status === 'Client Approval') && (
                          <div className="flex gap-1 mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                approveCampaign(campaign.id, true)
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                            >
                              <CheckCircle className="h-2 w-2" />
                              Approve
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                approveCampaign(campaign.id, false)
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                            >
                              <AlertTriangle className="h-2 w-2" />
                              Revise
                            </button>
                          </div>
                        )}
                                </div>
                                
                                <div className="flex flex-col items-end gap-1 ml-2">
                                  {/* Sync status indicator */}
                                  {syncingOperations.has(campaign.id) ? (
                                    <div className="w-3 h-3 animate-spin rounded-full border border-blue-500 border-t-transparent" title="Syncing..."></div>
                                  ) : campaign.synced_to_external ? (
                                    <div className="w-2 h-2 bg-green-500 rounded-full" title="Synced to Airtable"></div>
                                  ) : (
                                    <div className="w-2 h-2 bg-gray-400 rounded-full" title="Not synced"></div>
                                  )}
                                  
                                  {/* Delete button (agency only) */}
                                  {canEdit && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        deleteCampaign(campaign.id)
                                      }}
                                      disabled={syncingOperations.has(campaign.id)}
                                      className="text-gray-400 hover:text-red-600 disabled:text-gray-300 transition-colors p-0.5 rounded hover:bg-red-50 disabled:cursor-not-allowed"
                                      title={syncingOperations.has(campaign.id) ? "Syncing..." : "Delete campaign"}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        {dayCampaigns.length > 2 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{dayCampaigns.length - 2} more
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

      {/* Campaign Editor Modal */}
      {showAddModal && editingCampaign && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-white border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-gray-900">
                  {editingCampaign.isNew ? `Create New ${editingCampaign.type === 'ab_test' ? 'A/B Test' : 'Campaign'}` : `Edit ${editingCampaign.type === 'ab_test' ? 'A/B Test' : 'Campaign'}`}
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
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  {editingCampaign.type === 'ab_test' ? 'Test Name' : 'Campaign Title'} *
                </label>
                <input
                  type="text"
                  value={editingCampaign.title}
                  onChange={(e) => setEditingCampaign({...editingCampaign, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={editingCampaign.type === 'ab_test' ? 'Enter test name...' : 'Enter campaign title...'}
                  autoFocus
                  disabled={!canEdit && userRole === 'client_user'}
                />
              </div>

              {/* Type and Status (Agency only for type) */}
              <div className="grid grid-cols-2 gap-4">
                {canEdit && (
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Type</label>
                    <select 
                      value={editingCampaign.type}
                      onChange={(e) => {
                        const newType = e.target.value as any
                        setEditingCampaign({
                          ...editingCampaign, 
                          type: newType,
                          test_type: newType === 'ab_test' ? 'subject_line' : undefined
                        })
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="email">📧 Email Campaign</option>
                      <option value="sms">📱 SMS Campaign</option>
                      <option value="popup">🎯 Popup/Modal</option>
                      <option value="ab_test">🧪 A/B Test</option>
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Status</label>
                  <select 
                    value={editingCampaign.status}
                    onChange={(e) => setEditingCampaign({...editingCampaign, status: e.target.value as any})}
                    disabled={!canEdit}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="Content Strategy">Content Strategy</option>
                    <option value="Copy">Copy</option>
                    <option value="Copy QA">Copy QA</option>
                    <option value="Design">Design</option>
                    <option value="Design QA">Design QA</option>
                    <option value="Ready For Client Approval">Ready For Client Approval</option>
                    <option value="Client Approval">Client Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Client Revisions">Client Revisions</option>
                    <option value="Ready For Schedule">Ready For Schedule</option>
                    <option value="Ready For Imp QA">Ready For Imp QA</option>
                    <option value="Scheduled - Close">Scheduled - Close</option>
                  </select>
                </div>
              </div>

              {/* A/B Test specific fields */}
              {editingCampaign.type === 'ab_test' && (
                <>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Test Type</label>
                    <select 
                      value={editingCampaign.test_type || 'subject_line'}
                      onChange={(e) => setEditingCampaign({...editingCampaign, test_type: e.target.value as any})}
                      disabled={!canEdit}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="subject_line">Subject Line Test</option>
                      <option value="content">Content Test</option>
                      <option value="send_time">Send Time Test</option>
                      <option value="offer">Offer Test</option>
                      <option value="design">Design Test</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Start Date</label>
                      <input
                        type="date"
                        value={editingCampaign.start_date?.toISOString().split('T')[0] || ''}
                        onChange={(e) => setEditingCampaign({...editingCampaign, start_date: new Date(e.target.value)})}
                        disabled={!canEdit}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">End Date</label>
                      <input
                        type="date"
                        value={editingCampaign.end_date?.toISOString().split('T')[0] || ''}
                        onChange={(e) => setEditingCampaign({...editingCampaign, end_date: new Date(e.target.value)})}
                        disabled={!canEdit}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Regular campaign fields */}
              {editingCampaign.type !== 'ab_test' && (
                <>
                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Send Date</label>
                      <input
                        type="date"
                        value={editingCampaign.date.toISOString().split('T')[0]}
                        onChange={(e) => setEditingCampaign({...editingCampaign, date: new Date(e.target.value)})}
                        disabled={!canEdit}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Send Time</label>
                      <input
                        type="time"
                        value={editingCampaign.time}
                        onChange={(e) => setEditingCampaign({...editingCampaign, time: e.target.value})}
                        disabled={!canEdit}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* Subject Line */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      {editingCampaign.type === 'sms' ? 'SMS Message' : 'Subject Line'}
                    </label>
                    <input
                      type="text"
                      value={editingCampaign.subject_line || ''}
                      onChange={(e) => setEditingCampaign({...editingCampaign, subject_line: e.target.value})}
                      disabled={!canEdit}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      placeholder={editingCampaign.type === 'sms' ? 'Keep under 160 characters...' : 'Craft a compelling subject line...'}
                    />
                  </div>
                </>
              )}

              {/* Description */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={editingCampaign.description}
                  onChange={(e) => setEditingCampaign({...editingCampaign, description: e.target.value})}
                  disabled={!canEdit}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-100"
                  rows={3}
                  placeholder="Describe the campaign objectives..."
                />
              </div>

              {/* Agency-only fields */}
              {userRole === 'agency_admin' && (
                <>
                  {/* Assignee and Offer */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Assignee</label>
                      <select 
                        value={editingCampaign.assignee || ''}
                        onChange={(e) => setEditingCampaign({...editingCampaign, assignee: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select assignee...</option>
                        <option value="Reid Sickels">Reid Sickels</option>
                        <option value="Connor Clements">Connor Clements</option>
                        <option value="Copy Team">Copy Team</option>
                        <option value="Design Team">Design Team</option>
                        <option value="Dev Team">Dev Team</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Offer</label>
                      <input
                        type="text"
                        value={editingCampaign.offer || ''}
                        onChange={(e) => setEditingCampaign({...editingCampaign, offer: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 30% OFF, Free Shipping..."
                      />
                    </div>
                  </div>

                  {/* Due Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Copy Due Date</label>
                      <input
                        type="date"
                        value={editingCampaign.copy_due_date?.toISOString().split('T')[0] || ''}
                        onChange={(e) => setEditingCampaign({...editingCampaign, copy_due_date: e.target.value ? new Date(e.target.value) : undefined})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Design Due Date</label>
                      <input
                        type="date"
                        value={editingCampaign.design_due_date?.toISOString().split('T')[0] || ''}
                        onChange={(e) => setEditingCampaign({...editingCampaign, design_due_date: e.target.value ? new Date(e.target.value) : undefined})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Copy Link */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Copy Link</label>
                    <input
                      type="url"
                      value={editingCampaign.copy_link || ''}
                      onChange={(e) => setEditingCampaign({...editingCampaign, copy_link: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="https://docs.google.com/document/..."
                    />
                  </div>

                  {/* A/B Test */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">A/B Test</label>
                    <input
                      type="text"
                      value={editingCampaign.ab_test || ''}
                      onChange={(e) => setEditingCampaign({...editingCampaign, ab_test: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="A/B test details..."
                    />
                  </div>
                </>
              )}

              {/* Notes (Both agency and client can edit) */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  {userRole === 'client_user' ? 'Client Revisions' : 'Notes'}
                </label>
                <textarea
                  value={userRole === 'client_user' ? (editingCampaign.client_notes || '') : editingCampaign.notes}
                  onChange={(e) => {
                    if (userRole === 'client_user') {
                      setEditingCampaign({...editingCampaign, client_notes: e.target.value})
                    } else {
                      setEditingCampaign({...editingCampaign, notes: e.target.value})
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder={userRole === 'client_user' ? 'Add your feedback or approval notes...' : 'Campaign notes and requirements...'}
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
                
                {canEdit && !editingCampaign.isNew && (
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
                  {editingCampaign.isNew 
                    ? `Create ${editingCampaign.type === 'ab_test' ? 'Test' : 'Campaign'}` 
                    : 'Save Changes'
                  }
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}