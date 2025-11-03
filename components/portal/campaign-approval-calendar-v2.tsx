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
  X,
  ExternalLink,
  Image as ImageIcon,
  Clock,
  User,
  AlertCircle
} from 'lucide-react'

interface Campaign {
  id: string
  campaign_name: string
  campaign_type: string
  status: string
  scheduled_date: string
  subject_line: string
  preview_image_url: string | null
  copy_link: string | null
  target_audience: string
  notes: string
  client_notes: string | null
  client_approved: boolean | null
  approval_date: string | null
  assignee: string | null
  created_at: string
}

interface CampaignApprovalCalendarProps {
  client: any
  userRole?: 'client_user' | 'agency_admin'
}

export function CampaignApprovalCalendar({ client, userRole = 'client_user' }: CampaignApprovalCalendarProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [clientFeedback, setClientFeedback] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [viewingImage, setViewingImage] = useState(false)

  useEffect(() => {
    fetchCampaigns()
  }, [client?.id])

  const fetchCampaigns = async () => {
    if (!client?.id) {
      console.error('❌ CAMPAIGNS: No client ID provided')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log('📥 CAMPAIGNS: Fetching for client:', client.id)
      
      const response = await fetch(`/api/portal/campaigns?clientId=${client.id}`)
      const result = await response.json()
      
      if (result.success) {
        console.log(`✅ CAMPAIGNS: Loaded ${result.campaigns.length} campaigns`)
        setCampaigns(result.campaigns)
      } else {
        console.error('❌ CAMPAIGNS: Failed:', result.error)
        setCampaigns([])
      }
    } catch (error) {
      console.error('❌ CAMPAIGNS: Error:', error)
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (campaign: Campaign, approved: boolean) => {
    setSubmitting(true)
    try {
      const response = await fetch('/api/portal/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.id,
          clientApproved: approved,
          clientNotes: clientFeedback,
          approvalDate: new Date().toISOString()
        })
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Approval submitted successfully')
        await fetchCampaigns() // Refresh list
        setSelectedCampaign(null)
        setClientFeedback('')
      } else {
        alert('Failed to submit approval: ' + result.error)
      }
    } catch (error) {
      console.error('Error submitting approval:', error)
      alert('Failed to submit approval')
    } finally {
      setSubmitting(false)
    }
  }

  // Calendar generation
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getCampaignsForDate = (date: Date | null) => {
    if (!date) return []
    
    return campaigns.filter(campaign => {
      const campDate = new Date(campaign.scheduled_date)
      return campDate.getDate() === date.getDate() &&
             campDate.getMonth() === date.getMonth() &&
             campDate.getFullYear() === date.getFullYear()
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'client approval':
      case 'ready for client approval':
        return 'bg-orange-500/20 text-orange-300 border-orange-400/30'
      case 'approved':
        return 'bg-green-500/20 text-green-300 border-green-400/30'
      case 'client revisions':
        return 'bg-red-500/20 text-red-300 border-red-400/30'
      case 'scheduled - close':
      case 'sent':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30'
    }
  }

  const days = getDaysInMonth(currentMonth)
  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Filter campaigns that need approval
  const pendingApprovals = campaigns.filter(c => 
    c.status.toLowerCase().includes('client approval') || 
    c.status.toLowerCase().includes('ready for client approval')
  )

  if (loading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60 mx-auto mb-4"></div>
          <p className="text-white/70">Loading campaigns...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500/20 p-2 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-300" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Pending Approval</p>
                <p className="text-white text-2xl font-bold">{pendingApprovals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-300" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Approved</p>
                <p className="text-white text-2xl font-bold">
                  {campaigns.filter(c => c.client_approved === true).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Total Campaigns</p>
                <p className="text-white text-2xl font-bold">{campaigns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals List */}
      {pendingApprovals.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-400" />
              Awaiting Your Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingApprovals.map(campaign => (
                <div
                  key={campaign.id}
                  className="bg-white/10 rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
                  onClick={() => setSelectedCampaign(campaign)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1">{campaign.campaign_name}</h4>
                      <p className="text-white/70 text-sm mb-2">{campaign.subject_line}</p>
                      <div className="flex items-center gap-4 text-xs text-white/60">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(campaign.scheduled_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {campaign.target_audience || 'All subscribers'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedCampaign(campaign)
                      }}
                      className="bg-blue-600/80 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Campaign Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-white" />
              </button>
              <span className="text-white font-medium px-4">{monthYear}</span>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-white/60 text-sm font-medium py-2">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {days.map((day, index) => {
              const dayCampaigns = getCampaignsForDate(day)
              const isToday = day && 
                day.getDate() === new Date().getDate() &&
                day.getMonth() === new Date().getMonth() &&
                day.getFullYear() === new Date().getFullYear()
              
              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 rounded-lg border ${
                    day ? 'bg-white/5 border-white/10' : 'bg-transparent border-transparent'
                  } ${isToday ? 'ring-2 ring-blue-400' : ''}`}
                >
                  {day && (
                    <>
                      <div className="text-white/80 text-sm font-medium mb-1">
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayCampaigns.map(campaign => (
                          <div
                            key={campaign.id}
                            className={`text-xs p-1 rounded border cursor-pointer hover:opacity-80 ${getStatusColor(campaign.status)}`}
                            onClick={() => setSelectedCampaign(campaign)}
                          >
                            <div className="font-medium truncate">{campaign.campaign_name}</div>
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

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-white/10 border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-md">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-white text-xl mb-2">{selectedCampaign.campaign_name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(selectedCampaign.status)}`}>
                      {selectedCampaign.status}
                    </span>
                    <span className="text-white/60 text-sm">
                      {selectedCampaign.campaign_type}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Campaign Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <p className="text-white/60 text-sm mb-1">Subject Line</p>
                  <p className="text-white font-medium">{selectedCampaign.subject_line || 'Not set'}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <p className="text-white/60 text-sm mb-1">Send Date</p>
                  <p className="text-white font-medium">
                    {new Date(selectedCampaign.scheduled_date).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <p className="text-white/60 text-sm mb-1">Target Audience</p>
                  <p className="text-white font-medium">{selectedCampaign.target_audience || 'All subscribers'}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <p className="text-white/60 text-sm mb-1">Assigned To</p>
                  <p className="text-white font-medium">{selectedCampaign.assignee || 'Not assigned'}</p>
                </div>
              </div>

              {/* Preview Image */}
              {selectedCampaign.preview_image_url && (
                <div>
                  <h5 className="text-white font-medium mb-2">Campaign Preview</h5>
                  <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                    <img
                      src={selectedCampaign.preview_image_url}
                      alt="Campaign preview"
                      className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setViewingImage(true)}
                    />
                    <button
                      onClick={() => setViewingImage(true)}
                      className="mt-2 text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      View Full Size
                    </button>
                  </div>
                </div>
              )}

              {/* Copy Link */}
              {selectedCampaign.copy_link && (
                <div>
                  <h5 className="text-white font-medium mb-2">Campaign Copy</h5>
                  <a
                    href={selectedCampaign.copy_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600/80 hover:bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Copy Document
                  </a>
                </div>
              )}

              {/* Notes */}
              {selectedCampaign.notes && (
                <div>
                  <h5 className="text-white font-medium mb-2">Agency Notes</h5>
                  <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                    <p className="text-white/80 whitespace-pre-wrap">{selectedCampaign.notes}</p>
                  </div>
                </div>
              )}

              {/* Previous Client Feedback */}
              {selectedCampaign.client_notes && (
                <div>
                  <h5 className="text-white font-medium mb-2">Your Previous Feedback</h5>
                  <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-400/30">
                    <p className="text-white/80 whitespace-pre-wrap">{selectedCampaign.client_notes}</p>
                  </div>
                </div>
              )}

              {/* Client Approval Section (only if status requires approval) */}
              {(selectedCampaign.status.toLowerCase().includes('client approval') || 
                selectedCampaign.status.toLowerCase().includes('ready for client approval')) && (
                <div className="space-y-4 border-t border-white/20 pt-6">
                  <h5 className="text-white font-medium">Your Feedback</h5>
                  <textarea
                    value={clientFeedback}
                    onChange={(e) => setClientFeedback(e.target.value)}
                    placeholder="Add your feedback, comments, or approval notes..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproval(selectedCampaign, true)}
                      disabled={submitting}
                      className="flex-1 bg-green-600/80 hover:bg-green-600 disabled:bg-green-600/40 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                      {submitting ? 'Submitting...' : 'Approve Campaign'}
                    </button>
                    <button
                      onClick={() => handleApproval(selectedCampaign, false)}
                      disabled={submitting}
                      className="flex-1 bg-orange-600/80 hover:bg-orange-600 disabled:bg-orange-600/40 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="h-5 w-5" />
                      {submitting ? 'Submitting...' : 'Request Changes'}
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full Size Image Viewer */}
      {viewingImage && selectedCampaign?.preview_image_url && (
        <div 
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingImage(false)}
        >
          <button
            onClick={() => setViewingImage(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={selectedCampaign.preview_image_url}
            alt="Campaign preview full size"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  )
}

