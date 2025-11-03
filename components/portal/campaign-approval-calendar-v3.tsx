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
  AlertCircle,
  FileText,
  Edit
} from 'lucide-react'

interface Campaign {
  id: string
  campaign_name: string
  campaign_type: string
  status: string
  send_date: string
  subject_line: string
  preview_url: string | null
  copy_doc_url: string | null
  target_audience: string
  internal_notes: string
  client_notes: string | null
  client_revisions: string | null
  client_approved: boolean | null
  approval_date: string | null
  revision_date: string | null
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
  const [revisionText, setRevisionText] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [viewingImage, setViewingImage] = useState(false)
  const [showOnlyApprovals, setShowOnlyApprovals] = useState(false)

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
          clientRevisions: approved ? null : revisionText,
          clientNotes: approved ? 'Approved by client' : revisionText,
          approvalDate: approved ? new Date().toISOString() : null,
          revisionDate: approved ? null : new Date().toISOString()
        })
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Approval submitted successfully')
        await fetchCampaigns()
        setSelectedCampaign(null)
        setRevisionText('')
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
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getCampaignsForDate = (date: Date | null) => {
    if (!date) return []
    
    return campaigns.filter(campaign => {
      const campDate = new Date(campaign.send_date)
      return campDate.getDate() === date.getDate() &&
             campDate.getMonth() === date.getMonth() &&
             campDate.getFullYear() === date.getFullYear()
    })
  }

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase()
    if (s.includes('client approval') || s.includes('client_approval')) {
      return 'bg-orange-500/80 text-white border-orange-600'
    }
    if (s === 'approved') {
      return 'bg-green-500/80 text-white border-green-600'
    }
    if (s.includes('revision')) {
      return 'bg-red-500/80 text-white border-red-600'
    }
    if (s === 'sent' || s.includes('scheduled')) {
      return 'bg-blue-500/80 text-white border-blue-600'
    }
    return 'bg-gray-500/80 text-white border-gray-600'
  }

  const days = getDaysInMonth(currentMonth)
  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const pendingApprovals = campaigns.filter(c => 
    c.status.toLowerCase().includes('client approval') || 
    c.status.toLowerCase().includes('client_approval')
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
      {/* Filter Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowOnlyApprovals(false)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            !showOnlyApprovals 
              ? 'bg-white/20 text-white border-2 border-white/40' 
              : 'bg-white/5 text-white/70 border border-white/20 hover:bg-white/10'
          }`}
        >
          Calendar View ({campaigns.length})
        </button>
        <button
          onClick={() => setShowOnlyApprovals(true)}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            showOnlyApprovals 
              ? 'bg-white/20 text-white border-2 border-white/40' 
              : 'bg-white/5 text-white/70 border border-white/20 hover:bg-white/10'
          }`}
        >
          Pending Approval
          {pendingApprovals.length > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingApprovals.length}
            </span>
          )}
        </button>
      </div>

      {/* Pending Approvals List View */}
      {showOnlyApprovals && pendingApprovals.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-400" />
              Pending Your Approval ({pendingApprovals.length})
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
                          {new Date(campaign.send_date).toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
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
      {!showOnlyApprovals && (
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {showOnlyApprovals ? 'Pending Approvals' : 'Campaign Calendar'}
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
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-white/60 text-sm font-medium py-2">
                {day}
              </div>
            ))}
            
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
                            className={`text-xs p-2 rounded border cursor-pointer hover:opacity-90 transition-opacity ${getStatusColor(campaign.status)}`}
                            onClick={() => setSelectedCampaign(campaign)}
                          >
                            <div className="font-medium truncate">{campaign.campaign_name}</div>
                            <div className="text-[10px] opacity-90 truncate mt-0.5">
                              {campaign.assignee || 'Unassigned'}
                            </div>
                            <div className="text-[10px] opacity-75 mt-0.5">
                              {new Date(campaign.send_date).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })}
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
      )}

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b border-white/20">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-white text-xl mb-2">{selectedCampaign.campaign_name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 rounded-md text-sm font-semibold border ${getStatusColor(selectedCampaign.status)}`}>
                      {selectedCampaign.status}
                    </span>
                    <span className="text-white/60 text-sm">
                      {selectedCampaign.campaign_type.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedCampaign(null)
                    setRevisionText('')
                  }}
                  className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Campaign Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <p className="text-white/60 text-xs mb-1 uppercase tracking-wide">Subject Line</p>
                  <p className="text-white font-medium">{selectedCampaign.subject_line || 'Not set'}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <p className="text-white/60 text-xs mb-1 uppercase tracking-wide">Send Date</p>
                  <p className="text-white font-medium">
                    {new Date(selectedCampaign.send_date).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <p className="text-white/60 text-xs mb-1 uppercase tracking-wide">Target Audience</p>
                  <p className="text-white font-medium">{selectedCampaign.target_audience || 'All subscribers'}</p>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex gap-3">
                {selectedCampaign.preview_url && (
                  <button
                    onClick={() => setViewingImage(true)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Preview Design
                  </button>
                )}
                {selectedCampaign.copy_doc_url && (
                  <a
                    href={selectedCampaign.copy_doc_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    View Copy
                  </a>
                )}
              </div>

              {/* Agency Notes */}
              {selectedCampaign.internal_notes && (
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Agency Notes
                  </h5>
                  <p className="text-white/80 whitespace-pre-wrap text-sm">{selectedCampaign.internal_notes}</p>
                </div>
              )}


              {/* Client Approval Section */}
              {(selectedCampaign.status.toLowerCase().includes('client approval') || 
                selectedCampaign.status.toLowerCase().includes('client_approval')) && (
                <div className="border-t border-gray-700 pt-6 space-y-4">
                  <h5 className="text-white font-semibold text-lg">Review Campaign</h5>
                  
                  {/* Revision Input */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Revision Notes (required if requesting changes)
                    </label>
                    <textarea
                      value={revisionText}
                      onChange={(e) => setRevisionText(e.target.value)}
                      placeholder="Describe any changes needed, or leave blank to approve..."
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                    />
                  </div>
                  
                  {/* Approval Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleApproval(selectedCampaign, true)}
                      disabled={submitting}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-green-600/40 text-white py-4 px-6 rounded-lg font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                      <CheckCircle className="h-5 w-5" />
                      {submitting ? 'Submitting...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => {
                        if (!revisionText.trim()) {
                          alert('Please enter revision notes before requesting changes')
                          return
                        }
                        handleApproval(selectedCampaign, false)
                      }}
                      disabled={submitting}
                      className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/40 text-white py-4 px-6 rounded-lg font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Edit className="h-5 w-5" />
                      {submitting ? 'Submitting...' : 'Request Revisions'}
                    </button>
                  </div>
                </div>
              )}

              {/* Already Approved/Rejected */}
              {selectedCampaign.client_approved !== null && (
                <div className={`rounded-lg p-4 border ${
                  selectedCampaign.client_approved 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-orange-500/10 border-orange-500/30'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedCampaign.client_approved ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <Edit className="h-5 w-5 text-orange-400" />
                    )}
                    <h5 className={`font-semibold ${
                      selectedCampaign.client_approved ? 'text-green-400' : 'text-orange-400'
                    }`}>
                      {selectedCampaign.client_approved ? 'You Approved This Campaign' : 'You Requested Revisions'}
                    </h5>
                  </div>
                  {selectedCampaign.client_notes && (
                    <p className={`text-sm ${
                      selectedCampaign.client_approved ? 'text-green-200' : 'text-orange-200'
                    }`}>
                      {selectedCampaign.client_notes}
                    </p>
                  )}
                  <p className="text-xs opacity-60 mt-2">
                    {selectedCampaign.approval_date 
                      ? new Date(selectedCampaign.approval_date).toLocaleString()
                      : selectedCampaign.revision_date 
                        ? new Date(selectedCampaign.revision_date).toLocaleString()
                        : ''}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full Size Image Viewer */}
      {viewingImage && selectedCampaign?.preview_url && (
        <div 
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-[60] p-4"
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              setViewingImage(false)
            }}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-black/50 hover:bg-black/70 p-2 rounded-full"
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={selectedCampaign.preview_url}
            alt="Campaign preview full size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

