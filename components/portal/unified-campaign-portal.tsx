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
  Users,
  Target,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Eye
} from 'lucide-react'

interface CampaignTask {
  id: string
  title: string
  type: 'email' | 'sms' | 'flow' | 'popup'
  flow_type?: 'welcome' | 'abandoned_cart' | 'win_back' | 'post_purchase' | 'browse_abandon' | 'custom'
  status: 'draft' | 'in_progress' | 'review' | 'client_approval' | 'approved' | 'revisions' | 'scheduled' | 'sent' | 'live'
  client: string
  date: Date
  time: string
  description: string
  audience: string
  subject_line?: string
  ab_test?: string
  notes: string
  assignee?: string
  copy_due_date?: Date
  design_due_date?: Date
  copy_link?: string
  offer?: string
  trigger_criteria?: string // For flows
  num_emails?: number // For flows
  external_id?: string
  synced_to_external: boolean
  last_sync?: Date
  isNew?: boolean
}

interface UnifiedCampaignPortalProps {
  user: any // User data (client or agency)
  client?: any // Client data if agency admin
  userRole: 'client_user' | 'agency_admin'
}

export function UnifiedCampaignPortal({ user, client: selectedClient, userRole }: UnifiedCampaignPortalProps) {
  const [campaigns, setCampaigns] = useState<CampaignTask[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [editingCampaign, setEditingCampaign] = useState<CampaignTask | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [syncingOperations, setSyncingOperations] = useState<Set<string>>(new Set())
  
  // Get client info based on user role
  const clientInfo = userRole === 'agency_admin' ? selectedClient : { 
    brand_name: user.client?.brand_name || 'Your Brand',
    brand_slug: user.client?.brand_slug || 'unknown'
  }

  useEffect(() => {
    loadCampaigns()
  }, [clientInfo])

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

  const loadCampaigns = async () => {
    try {
      // TODO: Load from your database
      // For now, use demo data based on client
      setCampaigns(generateDemoCampaigns())
    } catch (error) {
      console.error('Error loading campaigns:', error)
    }
  }

  const generateDemoCampaigns = (): CampaignTask[] => [
    {
      id: 'camp1',
      title: 'Black Friday Email Campaign',
      type: 'email',
      status: 'client_approval',
      client: clientInfo.brand_name,
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
      id: 'flow1', 
      title: 'Welcome Series Flow',
      type: 'flow',
      flow_type: 'welcome',
      status: 'in_progress',
      client: clientInfo.brand_name,
      date: new Date(2025, 10, 1),
      time: '14:00',
      description: '5-email welcome series for new subscribers',
      audience: 'New Subscribers',
      trigger_criteria: 'Subscribed to newsletter',
      num_emails: 5,
      assignee: 'Copy Team',
      copy_due_date: new Date(2025, 10, 5),
      notes: 'Include brand story, best sellers, and social proof. Set 2-day delays between emails.',
      synced_to_external: false,
      external_id: undefined
    },
    {
      id: 'flow2',
      title: 'Abandoned Cart Recovery',
      type: 'flow',
      flow_type: 'abandoned_cart',
      status: 'draft',
      client: clientInfo.brand_name,
      date: new Date(2025, 9, 30),
      time: '16:00',
      description: '3-email abandoned cart recovery sequence',
      audience: 'Cart Abandoners',
      trigger_criteria: 'Placed item in cart but did not purchase after 2 hours',
      num_emails: 3,
      notes: 'Email 1: Reminder (1 hour), Email 2: 10% discount (24 hours), Email 3: 15% discount + urgency (48 hours)',
      synced_to_external: false,
      external_id: undefined
    },
    {
      id: 'camp3',
      title: 'Holiday SMS Blast',
      type: 'sms',
      status: 'review',
      client: clientInfo.brand_name,
      date: new Date(2025, 11, 15),
      time: '16:00',
      description: 'Holiday promotion SMS campaign',
      audience: 'SMS Subscribers',
      subject_line: '🎄 Holiday Sale - 30% OFF! Shop now: [link]',
      offer: 'Holiday 30% OFF',
      assignee: 'Copy Team',
      copy_due_date: new Date(2025, 11, 10),
      notes: 'Keep message under 160 characters. Include clear CTA and link.',
      synced_to_external: true,
      external_id: 'rec456def'
    },
    {
      id: 'popup1',
      title: 'Exit-Intent Lead Magnet',
      type: 'popup',
      status: 'approved',
      client: clientInfo.brand_name,
      date: new Date(2025, 10, 5),
      time: '12:00',
      description: 'Exit-intent popup with free guide offer',
      audience: 'Website Visitors',
      offer: 'Free Ultimate Guide PDF',
      trigger_criteria: 'Mouse leaves viewport on product pages',
      assignee: 'Dev Team',
      design_due_date: new Date(2025, 10, 3),
      notes: 'A/B test different headlines. Mobile-responsive design required.',
      synced_to_external: true,
      external_id: 'rec789ghi'
    }
  ]

  const saveCampaign = async (campaign: CampaignTask) => {
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
          client: clientInfo.brand_slug,
          campaign: updatedCampaign
        })
      })

      const syncResult = await syncResponse.json()
      
      if (syncResult.success) {
        // Mark as synced and update with external ID
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
    addSyncingOperation(campaignId)
    
    try {
      const campaign = campaigns.find(c => c.id === campaignId)
      
      // Remove from local state immediately
      setCampaigns(prev => prev.filter(c => c.id !== campaignId))
      
      // Delete from database
      await deleteCampaignFromDatabase(campaignId)
      
      // 🚀 AUTO-SYNC: Automatically delete from Airtable
      if (campaign?.external_id) {
        console.log('🗑️ AUTO-SYNC: Deleting from Airtable:', campaign.title)
        try {
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
          } else {
            console.error('❌ AUTO-SYNC: Failed to delete from Airtable:', deleteResult.error)
          }
        } catch (syncError) {
          console.error('❌ AUTO-SYNC: Error deleting from Airtable:', syncError)
        }
      }
      
    } catch (error) {
      console.error('❌ AUTO-SYNC: Error deleting campaign:', error)
    } finally {
      removeSyncingOperation(campaignId)
    }
  }

  const saveCampaignToDatabase = async (campaign: CampaignTask) => {
    // TODO: Implement database save
    console.log('💾 Saving to database:', campaign.title)
  }

  const deleteCampaignFromDatabase = async (campaignId: string) => {
    // TODO: Implement database delete
    console.log('🗑️ Deleting from database:', campaignId)
  }

  const addCampaign = (date?: Date, type: 'email' | 'sms' | 'flow' | 'popup' = 'email') => {
    const newCampaign: CampaignTask = {
      id: `${type}-${Date.now()}`,
      title: '',
      type: type,
      status: 'draft',
      client: clientInfo.brand_name,
      date: date || new Date(),
      time: '09:00',
      description: '',
      audience: '',
      subject_line: '',
      notes: '',
      synced_to_external: false,
      isNew: true,
      // Flow-specific defaults
      ...(type === 'flow' && {
        flow_type: 'welcome',
        trigger_criteria: '',
        num_emails: 3
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
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'review': return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'client_approval': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'approved': return 'bg-green-100 text-green-700 border-green-300'
      case 'revisions': return 'bg-red-100 text-red-700 border-red-300'
      case 'scheduled': return 'bg-teal-100 text-teal-700 border-teal-300'
      case 'sent': return 'bg-green-200 text-green-800 border-green-400'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getCampaignTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'border-l-4 border-l-blue-500 bg-blue-50'
      case 'sms': return 'border-l-4 border-l-yellow-500 bg-yellow-50'
      case 'flow': return 'border-l-4 border-l-purple-500 bg-purple-50'
      case 'popup': return 'border-l-4 border-l-green-500 bg-green-50'
      default: return 'border-l-4 border-l-gray-500 bg-gray-50'
    }
  }

  const days = getDaysInMonth(currentMonth)
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  const campaignsByDate = campaigns.reduce((acc, campaign) => {
    const dateKey = campaign.date.toDateString()
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(campaign)
    return acc
  }, {} as Record<string, CampaignTask[]>)

  const allStatuses = ['draft', 'in_progress', 'review', 'client_approval', 'approved', 'revisions', 'scheduled', 'sent']
  const allTypes = ['email', 'sms', 'flow', 'popup']

  return (
    <div className="space-y-6">
      {/* Portal Header */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-gray-900">Campaign Portal</CardTitle>
                <p className="text-gray-600 text-sm mt-1">
                  {userRole === 'agency_admin' ? `Managing ${clientInfo.brand_name} campaigns` : 'Manage your campaigns'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Auto-sync enabled"></div>
                <span className="text-green-600 text-sm font-medium">Auto-Sync Active</span>
                {syncingOperations.size > 0 && (
                  <span className="ml-2 text-blue-600 text-sm">
                    • {syncingOperations.size} syncing
                  </span>
                )}
              </div>
              
              <div className="flex rounded-lg border border-gray-300 bg-gray-50">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-1 text-sm font-medium rounded-l-lg transition-colors ${
                    viewMode === 'calendar' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Calendar
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 text-sm font-medium rounded-r-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Eye className="h-4 w-4 inline mr-1" />
                  List
                </button>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => addCampaign(undefined, 'email')}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </button>
                <button 
                  onClick={() => addCampaign(undefined, 'sms')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                >
                  <MessageSquare className="h-4 w-4" />
                  SMS
                </button>
                <button 
                  onClick={() => addCampaign(undefined, 'flow')}
                  className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                >
                  <RefreshCw className="h-4 w-4" />
                  Flow
                </button>
                <button 
                  onClick={() => addCampaign(undefined, 'popup')}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                >
                  <Target className="h-4 w-4" />
                  Popup
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {viewMode === 'calendar' ? (
        <>
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
                      onClick={() => day.date && addCampaign(day.date)}
                    >
                      {day.date && (
                        <>
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-sm text-gray-600 font-medium">
                              {day.date.getDate()}
                            </div>
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
                          </div>
                          
                          <div className="space-y-1">
                            {dayCampaigns.slice(0, 2).map(campaign => (
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
                                    {syncingOperations.has(campaign.id) ? (
                                      <div className="w-3 h-3 animate-spin rounded-full border border-blue-500 border-t-transparent" title="Syncing..."></div>
                                    ) : campaign.synced_to_external ? (
                                      <div className="w-2 h-2 bg-green-500 rounded-full" title="Synced to Airtable"></div>
                                    ) : (
                                      <div className="w-2 h-2 bg-gray-400 rounded-full" title="Not synced"></div>
                                    )}
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
                                  </div>
                                </div>
                              </div>
                            ))}
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
        </>
      ) : (
        /* List View */
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              {campaigns.map(campaign => (
                <div 
                  key={campaign.id}
                  className={`p-4 rounded-lg border cursor-pointer hover:shadow-sm transition-all ${getCampaignTypeColor(campaign.type)}`}
                  onClick={() => {
                    setEditingCampaign(campaign)
                    setShowAddModal(true)
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{campaign.title}</h3>
                        <div className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(campaign.status)}`}>
                          {campaign.status.replace('_', ' ')}
                        </div>
                        {campaign.type === 'email' && <Mail className="h-4 w-4 text-blue-600" />}
                        {campaign.type === 'sms' && <MessageSquare className="h-4 w-4 text-yellow-600" />}
                        {campaign.type === 'flow' && <RefreshCw className="h-4 w-4 text-purple-600" />}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{campaign.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {campaign.date.toLocaleDateString()} at {campaign.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {campaign.audience || 'All subscribers'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {syncingOperations.has(campaign.id) ? (
                        <div className="w-4 h-4 animate-spin rounded-full border border-blue-500 border-t-transparent" title="Syncing..."></div>
                      ) : campaign.synced_to_external ? (
                        <div className="w-3 h-3 bg-green-500 rounded-full" title="Synced to Airtable"></div>
                      ) : (
                        <div className="w-3 h-3 bg-gray-400 rounded-full" title="Not synced"></div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteCampaign(campaign.id)
                        }}
                        disabled={syncingOperations.has(campaign.id)}
                        className="text-gray-400 hover:text-red-600 disabled:text-gray-300 transition-colors p-1 rounded hover:bg-red-50 disabled:cursor-not-allowed"
                        title={syncingOperations.has(campaign.id) ? "Syncing..." : "Delete campaign"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaign Editor Modal */}
      {showAddModal && editingCampaign && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-white border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-gray-900">
                  {editingCampaign.isNew ? 'Create New Campaign' : 'Edit Campaign'}
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

              {/* Type and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Type</label>
                  <select 
                    value={editingCampaign.type}
                    onChange={(e) => {
                      const newType = e.target.value as any
                      setEditingCampaign({
                        ...editingCampaign, 
                        type: newType,
                        // Reset type-specific fields when type changes
                        flow_type: newType === 'flow' ? 'welcome' : undefined,
                        trigger_criteria: newType === 'flow' || newType === 'popup' ? '' : undefined,
                        num_emails: newType === 'flow' ? 3 : undefined
                      })
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="email">📧 Email Campaign</option>
                    <option value="sms">📱 SMS Campaign</option>
                    <option value="flow">🔄 Email Flow</option>
                    <option value="popup">🎯 Popup/Modal</option>
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
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="client_approval">Client Approval</option>
                    <option value="approved">Approved</option>
                    <option value="revisions">Revisions Needed</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="sent">Sent</option>
                    {editingCampaign.type === 'flow' && <option value="live">Live</option>}
                  </select>
                </div>
              </div>

              {/* Flow Type (only for flows) */}
              {editingCampaign.type === 'flow' && (
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Flow Type</label>
                  <select 
                    value={editingCampaign.flow_type || 'welcome'}
                    onChange={(e) => setEditingCampaign({...editingCampaign, flow_type: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="welcome">Welcome Series</option>
                    <option value="abandoned_cart">Abandoned Cart</option>
                    <option value="win_back">Win-Back Campaign</option>
                    <option value="post_purchase">Post-Purchase</option>
                    <option value="browse_abandon">Browse Abandonment</option>
                    <option value="custom">Custom Flow</option>
                  </select>
                </div>
              )}

              {/* Date and Time */}
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

              {/* Subject Line */}
              {(editingCampaign.type === 'email' || editingCampaign.type === 'sms') && (
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    {editingCampaign.type === 'email' ? 'Subject Line' : 'SMS Message'}
                  </label>
                  <input
                    type="text"
                    value={editingCampaign.subject_line || ''}
                    onChange={(e) => setEditingCampaign({...editingCampaign, subject_line: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                    placeholder={editingCampaign.type === 'email' ? 'Craft a compelling subject line...' : 'Keep under 160 characters...'}
                  />
                </div>
              )}

              {/* Target Audience */}
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

              {/* Description */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Campaign Description</label>
                <textarea
                  value={editingCampaign.description}
                  onChange={(e) => setEditingCampaign({...editingCampaign, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Describe the campaign objectives and key messages..."
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Notes & Requirements</label>
                <textarea
                  value={editingCampaign.notes}
                  onChange={(e) => setEditingCampaign({...editingCampaign, notes: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                  placeholder="Any special notes, requirements, or instructions..."
                />
              </div>

              {/* Flow-specific fields */}
              {editingCampaign.type === 'flow' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Number of Emails</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={editingCampaign.num_emails || 3}
                        onChange={(e) => setEditingCampaign({...editingCampaign, num_emails: parseInt(e.target.value)})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Assignee</label>
                      <select 
                        value={editingCampaign.assignee || ''}
                        onChange={(e) => setEditingCampaign({...editingCampaign, assignee: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select assignee...</option>
                        <option value="Copy Team">Copy Team</option>
                        <option value="Design Team">Design Team</option>
                        <option value="Dev Team">Dev Team</option>
                        <option value="Strategy Team">Strategy Team</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Trigger Criteria</label>
                    <input
                      type="text"
                      value={editingCampaign.trigger_criteria || ''}
                      onChange={(e) => setEditingCampaign({...editingCampaign, trigger_criteria: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Subscribed to newsletter, Added item to cart..."
                    />
                  </div>
                </>
              )}

              {/* Campaign-specific fields */}
              {(editingCampaign.type === 'email' || editingCampaign.type === 'sms') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Assignee</label>
                    <select 
                      value={editingCampaign.assignee || ''}
                      onChange={(e) => setEditingCampaign({...editingCampaign, assignee: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select assignee...</option>
                      <option value="Copy Team">Copy Team</option>
                      <option value="Design Team">Design Team</option>
                      <option value="Dev Team">Dev Team</option>
                      <option value="Strategy Team">Strategy Team</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Offer/Promotion</label>
                    <input
                      type="text"
                      value={editingCampaign.offer || ''}
                      onChange={(e) => setEditingCampaign({...editingCampaign, offer: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 30% OFF, Free Shipping..."
                    />
                  </div>
                </div>
              )}

              {/* Popup-specific fields */}
              {editingCampaign.type === 'popup' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Assignee</label>
                      <select 
                        value={editingCampaign.assignee || ''}
                        onChange={(e) => setEditingCampaign({...editingCampaign, assignee: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select assignee...</option>
                        <option value="Dev Team">Dev Team</option>
                        <option value="Design Team">Design Team</option>
                        <option value="Copy Team">Copy Team</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Offer/Lead Magnet</label>
                      <input
                        type="text"
                        value={editingCampaign.offer || ''}
                        onChange={(e) => setEditingCampaign({...editingCampaign, offer: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Free Guide, 10% OFF Coupon..."
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Trigger Criteria</label>
                    <input
                      type="text"
                      value={editingCampaign.trigger_criteria || ''}
                      onChange={(e) => setEditingCampaign({...editingCampaign, trigger_criteria: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Exit intent, Time on page > 30s, Scroll 70%..."
                    />
                  </div>
                </>
              )}

              {/* Project Management - Due Dates */}
              {userRole === 'agency_admin' && (
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
              )}

              {/* Copy Link */}
              {userRole === 'agency_admin' && (
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Copy Link (optional)</label>
                  <input
                    type="url"
                    value={editingCampaign.copy_link || ''}
                    onChange={(e) => setEditingCampaign({...editingCampaign, copy_link: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="https://docs.google.com/..."
                  />
                </div>
              )}

              {/* A/B Test */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">A/B Test (optional)</label>
                <input
                  type="text"
                  value={editingCampaign.ab_test || ''}
                  onChange={(e) => setEditingCampaign({...editingCampaign, ab_test: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                  placeholder="A/B test details..."
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
                  {editingCampaign.isNew ? 'Create Campaign' : 'Save Changes'}
                </button>
              </div>

              {/* Sync Status */}
              {!editingCampaign.synced_to_external && !editingCampaign.isNew && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-700 text-sm">
                    ℹ️ This campaign will auto-sync to Airtable when you save changes.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Auto-Sync Active Info */}
      <Card className="bg-green-50 border border-green-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mt-2"></div>
            <div>
              <span className="font-medium text-green-700">
                {userRole === 'agency_admin' ? 'Agency Portal - Auto-Sync Active' : 'Client Portal - Auto-Sync Active'}
              </span>
              <p className="text-green-600 text-sm mt-1">
                • Add, edit, or delete campaigns instantly<br/>
                • All changes auto-sync to Airtable immediately<br/>
                • Perfect collaboration between {userRole === 'agency_admin' ? 'agency and clients' : 'you and your agency'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}