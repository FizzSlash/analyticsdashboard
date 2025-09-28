'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Calendar,
  ChevronLeft, 
  ChevronRight,
  Mail,
  MessageSquare,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  Send,
  Edit
} from 'lucide-react'

interface Campaign {
  id: string
  recordId: string
  title: string
  type: 'email' | 'sms'
  start: Date
  end: Date
  description: string
  status: string
  clientId: string
  clientRevisions: string
  previewUrl?: string
  rawData?: any
}

interface CampaignApprovalCalendarProps {
  client: any
}

export function CampaignApprovalCalendar({ client }: CampaignApprovalCalendarProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [clientRevisions, setClientRevisions] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'calendar' | 'approvals' | 'sent'>('calendar')

  // Mock webhook URLs - replace with your actual Make.com webhooks
  const fetchCampaignsUrl = 'https://hook.us2.make.com/dlcqdia9qozi8lca39jytiu27xrf1t1l'
  const updateCampaignUrl = 'https://hook.us2.make.com/wem64vvx9irk7tys6itjpyt27bqorbvg'

  useEffect(() => {
    fetchCampaigns()
  }, [client])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Add client name as query parameter
      const url = `${fetchCampaignsUrl}?client=${encodeURIComponent(client.brand_slug)}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch campaigns: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Process campaigns data (adapt based on your webhook response format)
      const formattedCampaigns = Array.isArray(data) 
        ? data.map(formatCampaign)
        : [data].map(formatCampaign)
      
      setCampaigns(formattedCampaigns)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
      // For demo purposes, show mock data
      setCampaigns(generateMockCampaigns())
    } finally {
      setLoading(false)
    }
  }

  const formatCampaign = (data: any): Campaign => {
    const fixDate = (dateStr: string) => {
      if (!dateStr) return new Date()
      const date = new Date(dateStr)
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0)
    }

    return {
      id: data.id || `campaign-${Math.random().toString(36).substr(2, 9)}`,
      recordId: data.recordId || data.id || '',
      title: data.Tasks || data.title || 'Untitled Campaign',
      type: data['Campaign Type']?.includes('sms') ? 'sms' : 'email',
      start: fixDate(data['Send Date'] || data.sendDate),
      end: fixDate(data['Send Date'] || data.sendDate),
      description: data.Notes || data.description || '',
      status: data.Stage || data.status || 'Pending',
      clientId: data.Client || client.brand_slug,
      clientRevisions: data.ClientRevisions || '',
      previewUrl: data.previewUrl || data.File?.[0]?.url,
      rawData: data
    }
  }

  const generateMockCampaigns = (): Campaign[] => [
    {
      id: 'camp1',
      recordId: 'rec123',
      title: 'Black Friday Sale Campaign',
      type: 'email',
      start: new Date(2025, 9, 25), // Oct 25, 2025
      end: new Date(2025, 9, 25),
      description: 'Major sale announcement with 50% off all products',
      status: 'Client Approval',
      clientId: client.brand_slug,
      clientRevisions: '',
      previewUrl: 'https://example.com/preview/1'
    },
    {
      id: 'camp2', 
      recordId: 'rec456',
      title: 'Holiday Product Launch',
      type: 'email',
      start: new Date(2025, 9, 28),
      end: new Date(2025, 9, 28),
      description: 'New holiday collection announcement',
      status: 'Design Complete',
      clientId: client.brand_slug,
      clientRevisions: '',
      previewUrl: 'https://example.com/preview/2'
    },
    {
      id: 'camp3',
      recordId: 'rec789', 
      title: 'Welcome Series Email 3',
      type: 'email',
      start: new Date(2025, 9, 30),
      end: new Date(2025, 9, 30),
      description: 'Third email in welcome automation sequence',
      status: 'Client Approval',
      clientId: client.brand_slug,
      clientRevisions: 'Please adjust the CTA button color to match brand guidelines',
      previewUrl: 'https://example.com/preview/3'
    }
  ]

  const handleSelectCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setClientRevisions(campaign.clientRevisions || '')
    setUpdateStatus(null)
    setShowModal(true)
  }

  const handleApproval = async (approved: boolean) => {
    if (!selectedCampaign) return

    try {
      setUpdateStatus({ loading: true, error: null })
      
      const payload = {
        ...selectedCampaign.rawData,
        campaignId: selectedCampaign.id,
        recordId: selectedCampaign.recordId,
        approved: approved ? "YES" : "NO",
        clientRevisions: clientRevisions,
        client: client.brand_slug
      }
      
      const response = await fetch(updateCampaignUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) throw new Error('Failed to send approval data')
      
      setUpdateStatus({ 
        loading: false, 
        success: true, 
        message: `Campaign ${approved ? 'approved' : 'revision requested'} successfully!` 
      })
      
      // Update campaign status locally
      setCampaigns(prev => prev.map(camp => 
        camp.id === selectedCampaign.id 
          ? { ...camp, status: approved ? 'Approved' : 'Revisions Requested', clientRevisions }
          : camp
      ))
      
      // Close modal after delay
      setTimeout(() => {
        setShowModal(false)
        setSelectedCampaign(null)
        setUpdateStatus(null)
      }, 2000)
      
    } catch (error) {
      setUpdateStatus({ 
        loading: false, 
        error: true, 
        message: error instanceof Error ? error.message : 'Error sending approval data' 
      })
    }
  }

  const getCampaignTypeClass = (type: string) => {
    return type === 'sms' 
      ? 'bg-yellow-500/20 border-l-4 border-yellow-500' 
      : 'bg-purple-500/20 border-l-4 border-purple-500'
  }

  const isClientApprovalStatus = (status: string) => {
    return status.toLowerCase().includes('client approval')
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
    
    // Empty slots for days before first of month
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
  
  // Group campaigns by date
  const campaignsByDate = campaigns.reduce((acc, campaign) => {
    const dateKey = campaign.start.toDateString()
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(campaign)
    return acc
  }, {} as Record<string, Campaign[]>)

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  const pendingApprovalCount = campaigns.filter(camp => isClientApprovalStatus(camp.status)).length

  const renderCalendarTab = () => (
    <div className="space-y-4">
      {/* Calendar Navigation */}
      <div className="flex justify-between items-center">
        <button 
          onClick={prevMonth}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        
        <h2 className="text-xl font-semibold text-white">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        
        <button 
          onClick={nextMonth}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
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
              <div key={day} className="p-3 bg-white/10 text-center font-semibold text-white/80 text-sm">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {days.map((day, index) => {
              const dayCampaigns = day.date ? (campaignsByDate[day.date.toDateString()] || []) : []
              
              return (
                <div 
                  key={index}
                  className={`min-h-[120px] p-2 bg-white/5 border border-white/5 hover:bg-white/10 transition-colors ${
                    !day.isCurrentMonth ? 'opacity-50' : ''
                  }`}
                >
                  {day.date && (
                    <>
                      <div className="text-right text-sm text-white/60 mb-1">
                        {day.date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayCampaigns.map(campaign => (
                          <div 
                            key={campaign.id}
                            className={`p-2 text-xs text-white rounded cursor-pointer hover:opacity-80 ${getCampaignTypeClass(campaign.type)}`}
                            onClick={() => handleSelectCampaign(campaign)}
                          >
                            <div className="font-semibold truncate">{campaign.title}</div>
                            <div className="text-xs opacity-80 mt-1">{campaign.status}</div>
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
    </div>
  )

  const renderApprovalsTab = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Campaigns Awaiting Approval</h2>
      
      {campaigns.filter(camp => isClientApprovalStatus(camp.status)).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns
            .filter(camp => isClientApprovalStatus(camp.status))
            .map(campaign => (
              <Card 
                key={campaign.id}
                className={`bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 transition-colors ${getCampaignTypeClass(campaign.type)}`}
                onClick={() => handleSelectCampaign(campaign)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-semibold">{campaign.title}</h4>
                    {campaign.type === 'sms' ? 
                      <MessageSquare className="h-4 w-4 text-yellow-400" /> : 
                      <Mail className="h-4 w-4 text-purple-400" />
                    }
                  </div>
                  <p className="text-white/60 text-sm mb-2">
                    {campaign.start.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-white/60 text-sm line-clamp-2">
                    {campaign.description || "No description available"}
                  </p>
                  <div className="mt-3">
                    <span className="inline-block px-2 py-1 bg-white/20 text-white text-xs rounded-full">
                      {campaign.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          }
        </div>
      ) : (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-white/60">No campaigns pending approval</p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderSentTab = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Sent Campaigns</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns
          .filter(camp => ['Sent', 'Live', 'Completed'].includes(camp.status))
          .map(campaign => (
            <Card 
              key={campaign.id}
              className="bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => handleSelectCampaign(campaign)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white font-semibold">{campaign.title}</h4>
                  {campaign.type === 'sms' ? 
                    <MessageSquare className="h-4 w-4 text-yellow-400" /> : 
                    <Mail className="h-4 w-4 text-purple-400" />
                  }
                </div>
                <p className="text-white/60 text-sm mb-2">
                  Sent: {campaign.start.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-white/60 text-sm line-clamp-2">
                  {campaign.description || "No description available"}
                </p>
                <div className="mt-3">
                  <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                    {campaign.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        }
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Campaign Approval Calendar
            </CardTitle>
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab('calendar')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'calendar' 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                Calendar
              </button>
              <button 
                onClick={() => setActiveTab('approvals')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  activeTab === 'approvals' 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                Pending Approvals
                {pendingApprovalCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingApprovalCount}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('sent')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'sent' 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                Sent Campaigns
              </button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/60">Loading campaigns...</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span className="font-semibold">Error:</span>
            </div>
            <p className="text-red-300 mt-2">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Tab Content */}
      {!loading && !error && (
        <>
          {activeTab === 'calendar' && renderCalendarTab()}
          {activeTab === 'approvals' && renderApprovalsTab()}
          {activeTab === 'sent' && renderSentTab()}
        </>
      )}

      {/* Campaign Modal */}
      {showModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-white/10 border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">{selectedCampaign.title}</CardTitle>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Campaign Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/60 text-sm">Send Date</p>
                      <p className="text-white">{selectedCampaign.start.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Type</p>
                      <span className={`inline-block px-2 py-1 rounded text-white text-sm ${getCampaignTypeClass(selectedCampaign.type)}`}>
                        {selectedCampaign.type === 'sms' ? 'SMS' : 'Email'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-white/60 text-sm mb-2">Status</p>
                    <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                      {selectedCampaign.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-white/60 text-sm mb-2">Campaign Details</p>
                    <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                      <p className="text-white text-sm whitespace-pre-wrap">
                        {selectedCampaign.description || "No campaign details available."}
                      </p>
                    </div>
                  </div>

                  {/* Campaign Preview */}
                  {selectedCampaign.previewUrl && (
                    <div>
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                        <Eye className="h-4 w-4" />
                        Open Campaign Preview
                      </button>
                    </div>
                  )}
                </div>

                {/* Client Review Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Client Review</h3>
                  
                  {updateStatus?.loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-white/60">Processing...</p>
                    </div>
                  ) : updateStatus?.success ? (
                    <div className="bg-green-500/20 border border-green-500/40 text-green-300 p-4 rounded-lg">
                      {updateStatus.message}
                    </div>
                  ) : updateStatus?.error ? (
                    <div className="bg-red-500/20 border border-red-500/40 text-red-300 p-4 rounded-lg">
                      {updateStatus.message}
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Client Revisions:
                        </label>
                        <textarea
                          className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 resize-none"
                          rows={4}
                          value={clientRevisions}
                          onChange={(e) => setClientRevisions(e.target.value)}
                          placeholder="Enter your revision requests here..."
                          disabled={!isClientApprovalStatus(selectedCampaign.status)}
                        />
                      </div>
                      
                      {isClientApprovalStatus(selectedCampaign.status) ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <button
                            onClick={() => handleApproval(true)}
                            className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve Campaign
                          </button>
                          <button
                            onClick={() => handleApproval(false)}
                            className="bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Request Revisions
                          </button>
                        </div>
                      ) : (
                        <div className="bg-white/10 border border-white/20 rounded-lg p-4">
                          <p className="text-white/60 text-sm">
                            This campaign is not ready for client approval.
                          </p>
                          <p className="text-white/60 text-sm mt-2">
                            Current status: <span className="font-semibold text-white">{selectedCampaign.status}</span>
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {activeTab === 'calendar' && renderCalendarTab()}
      {activeTab === 'approvals' && renderApprovalsTab()}
      {activeTab === 'sent' && renderSentTab()}
    </div>
  )
}