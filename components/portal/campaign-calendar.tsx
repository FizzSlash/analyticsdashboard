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

interface Campaign {
  id: string
  title: string
  type: 'email' | 'sms' | 'popup' | 'ab_test'
  status: 'draft' | 'copy' | 'design' | 'ready_for_client_approval' | 'approved' | 'scheduled' | 'sent'
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
    {
      id: 'camp1',
      title: 'Black Friday Email Campaign',
      type: 'email',
      status: 'ready_for_client_approval',
      client: client.brand_name,
      date: new Date(2025, 10, 25),
      time: '09:00',
      description: 'Major sale announcement with exclusive offers',
      audience: 'All Subscribers',
      subject_line: 'Get 50% OFF Everything - Limited Time! 🔥',
      offer: 'Black Friday 50% OFF',
      assignee: 'Design Team',
      copy_due_date: new Date(2025, 10, 20),
      design_due_date: new Date(2025, 10, 22),
      notes: 'Focus on urgency and scarcity. Need holiday graphics.',
      synced_to_external: true,
      external_id: 'rec123abc'
    },
    {
      id: 'camp2',
      title: 'Holiday SMS Blast',
      type: 'sms',
      status: 'copy',
      client: client.brand_name,
      date: new Date(2025, 11, 15),
      time: '16:00',
      description: 'Holiday promotion SMS campaign',
      audience: 'SMS Subscribers',
      subject_line: '🎄 Holiday Sale - 30% OFF! Shop now: [link]',
      offer: 'Holiday 30% OFF',
      assignee: 'Copy Team',
      copy_due_date: new Date(2025, 11, 10),
      notes: 'Keep message under 160 characters. Include clear CTA and link.',
      synced_to_external: false,
      external_id: undefined
    },
    {
      id: 'test1',
      title: 'Black Friday Subject Line Test',
      type: 'ab_test',
      test_type: 'subject_line',
      status: 'scheduled',
      client: client.brand_name,
      date: new Date(2025, 10, 20), // Start date
      start_date: new Date(2025, 10, 20),
      end_date: new Date(2025, 10, 27),
      time: '09:00',
      description: 'Testing 2 subject lines for Black Friday campaign',
      audience: 'All Subscribers',
      notes: 'Variant A: "50% OFF Everything!" vs Variant B: "Your Black Friday Gift Inside"',
      assignee: 'Marketing Team',
      synced_to_external: true,
      external_id: 'rec789test'
    }
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
              status: approved ? 'approved' : 'revisions' as any,
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
      status: 'draft',
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
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'copy': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'design': return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'ready_for_client_approval': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'approved': return 'bg-green-100 text-green-700 border-green-300'
      case 'revisions': return 'bg-red-100 text-red-700 border-red-300'
      case 'scheduled': return 'bg-teal-100 text-teal-700 border-teal-300'
      case 'sent': return 'bg-green-200 text-green-800 border-green-400'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
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
    const dateKey = campaign.date.toDateString()
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(campaign)
    return acc
  }, {} as Record<string, Campaign[]>)

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      {canCreate && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Quick Actions</h3>
                <p className="text-white/70 text-sm">Create new campaigns and tests</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => addCampaign(undefined, 'email')}
                  className="bg-blue-600/80 hover:bg-blue-600 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </button>
                <button 
                  onClick={() => addCampaign(undefined, 'sms')}
                  className="bg-yellow-600/80 hover:bg-yellow-600 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                >
                  <MessageSquare className="h-4 w-4" />
                  SMS
                </button>
                <button 
                  onClick={() => addCampaign(undefined, 'popup')}
                  className="bg-green-600/80 hover:bg-green-600 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                >
                  <Target className="h-4 w-4" />
                  Popup
                </button>
                <button 
                  onClick={() => addCampaign(undefined, 'ab_test')}
                  className="bg-purple-600/80 hover:bg-purple-600 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                >
                  <TestTube className="h-4 w-4" />
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
          className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        
        <h2 className="text-xl font-semibold text-white">
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

      {/* Calendar Grid */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-0">
          <div className="grid grid-cols-7 gap-px bg-white/10">
            {/* Weekday headers */}
            {weekdays.map(day => (
              <div key={day} className="p-3 bg-white/20 text-center font-semibold text-white text-sm">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {days.map((day, index) => {
              const dayCampaigns = day.date ? (campaignsByDate[day.date.toDateString()] || []) : []
              
              return (
                <div 
                  key={index}
                  className={`min-h-[140px] p-2 bg-white/5 hover:bg-white/10 transition-colors ${
                    !day.isCurrentMonth ? 'opacity-50' : ''
                  } ${canCreate ? 'cursor-pointer' : ''}`}
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
                              className={`p-2 text-xs rounded border border-white/20 cursor-pointer hover:bg-white/10 transition-all ${getCampaignTypeColor(campaign.type)}`}
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
                                    {campaign.status.replace('_', ' ')}
                                  </div>
                                  
                                  {/* Client approval actions */}
                                  {canApprove && campaign.status === 'ready_for_client_approval' && (
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
                    <option value="draft">Draft</option>
                    <option value="copy">Copy</option>
                    <option value="design">Design</option>
                    <option value="ready_for_client_approval">Ready for Client Approval</option>
                    <option value="approved">Approved</option>
                    <option value="revisions">Revisions Needed</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="sent">Sent</option>
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

              {/* Notes (Both agency and client can edit) */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  {userRole === 'client_user' ? 'Your Notes & Feedback' : 'Internal Notes'}
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
                  placeholder={userRole === 'client_user' ? 'Add your feedback or approval notes...' : 'Internal notes and requirements...'}
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