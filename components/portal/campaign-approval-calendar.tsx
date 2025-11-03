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
  Edit,
  Plus,
  Image as ImageIcon,
  Pin,
  Reply,
  ThumbsUp,
  Download
} from 'lucide-react'

interface DesignFile {
  id: string
  filename: string
  url: string
  thumbnail_url: string
  type: string
}

interface Annotation {
  id: string
  x: number
  y: number
  comment: string
  author: string
  author_role: 'client_user' | 'agency_admin'
  created_at: Date
  resolved: boolean
  replies?: Comment[]
}

interface Comment {
  id: string
  comment: string
  author: string
  author_role: 'client_user' | 'agency_admin'
  created_at: Date
}

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
  design_files?: DesignFile[]
  annotations?: Annotation[]
  comments?: Comment[]
  rawData?: any
}

interface CampaignApprovalCalendarProps {
  client: any
  userRole?: 'client_user' | 'agency_admin'
}

export function CampaignApprovalCalendar({ client, userRole = 'client_user' }: CampaignApprovalCalendarProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [clientRevisions, setClientRevisions] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'calendar' | 'approvals' | 'sent'>('calendar')
  const [viewingDesign, setViewingDesign] = useState<{ campaign: Campaign; fileIndex: number } | null>(null)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [newAnnotation, setNewAnnotation] = useState<{ x: number; y: number; comment: string } | null>(null)

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
      
      // NEW: Fetch from Supabase campaign_approvals table (NOT Airtable!)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      const response = await fetch(`${supabaseUrl}/rest/v1/campaign_approvals?client_id=eq.${client.id}&select=*`, {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch campaigns: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Format Supabase data to portal format
      const formattedCampaigns = data.map((c: any) => formatCampaign(c))
      
      setCampaigns(formattedCampaigns)
      console.log('✅ Loaded', formattedCampaigns.length, 'campaigns from database')
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
      // Show empty if error
      setCampaigns([])
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

    // Handle both Supabase and Airtable formats
    return {
      id: data.id || `campaign-${Math.random().toString(36).substr(2, 9)}`,
      recordId: data.id || '',
      title: data.campaign_name || data.Tasks || 'Untitled Campaign',
      type: data.campaign_type || (data['Campaign Type']?.includes('sms') ? 'sms' : 'email'),
      start: fixDate(data.scheduled_date || data['Send Date']),
      end: fixDate(data.scheduled_date || data['Send Date']),
      description: data.subject_line || data.Notes || '',
      status: data.status || 'Pending',
      clientId: client.brand_slug,
      clientRevisions: data.client_revisions || '',
      previewUrl: data.preview_url || data.File?.[0]?.url,
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
      previewUrl: 'https://example.com/preview/1',
      design_files: [
        {
          id: 'file1',
          filename: 'black-friday-email-design.jpg',
          url: 'https://picsum.photos/800/1200?random=1',
          thumbnail_url: 'https://picsum.photos/400/600?random=1',
          type: 'image'
        },
        {
          id: 'file2', 
          filename: 'mobile-version.jpg',
          url: 'https://picsum.photos/400/800?random=2',
          thumbnail_url: 'https://picsum.photos/200/400?random=2',
          type: 'image'
        }
      ],
      annotations: [],
      comments: []
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
      previewUrl: 'https://example.com/preview/2',
      design_files: [
        {
          id: 'file3',
          filename: 'holiday-launch-email.jpg',
          url: 'https://picsum.photos/800/1400?random=3',
          thumbnail_url: 'https://picsum.photos/400/700?random=3',
          type: 'image'
        }
      ],
      annotations: [],
      comments: []
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
      previewUrl: 'https://example.com/preview/3',
      design_files: [
        {
          id: 'file4',
          filename: 'welcome-email-3.jpg',
          url: 'https://picsum.photos/800/1000?random=4',
          thumbnail_url: 'https://picsum.photos/400/500?random=4',
          type: 'image'
        }
      ],
      annotations: [
        {
          id: 'ann1',
          x: 50,
          y: 30,
          comment: 'The CTA button color should match our brand blue #1E40AF',
          author: 'Client Team',
          author_role: 'client_user',
          created_at: new Date(2025, 9, 29),
          resolved: false,
          replies: [
            {
              id: 'reply1',
              comment: 'Got it! We\'ll update the button color in the next revision.',
              author: 'Design Team',
              author_role: 'agency_admin',
              created_at: new Date(2025, 9, 29, 14, 30)
            }
          ]
        }
      ],
      comments: [
        {
          id: 'comment1',
          comment: 'Overall design looks great! Just need the CTA button adjustment.',
          author: 'Client Team',
          author_role: 'client_user',
          created_at: new Date(2025, 9, 29)
        }
      ]
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

  const addAnnotation = async (campaignId: string, fileId: string, annotation: { x: number; y: number; comment: string }) => {
    const newAnnotation: Annotation = {
      id: `ann-${Date.now()}`,
      x: annotation.x,
      y: annotation.y,
      comment: annotation.comment,
      author: userRole === 'agency_admin' ? 'Agency Team' : 'Client Team',
      author_role: userRole,
      created_at: new Date(),
      resolved: false,
      replies: []
    }

    // Update local state immediately for UX
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { 
            ...campaign, 
            annotations: [...(campaign.annotations || []), newAnnotation]
          }
        : campaign
    ))
    
    // Save to database
    try {
      const response = await fetch('/api/portal-annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airtable_record_id: campaignId,
          design_file_id: fileId,
          client_id: client.id,
          agency_id: client.agency_id,
          x_position: annotation.x,
          y_position: annotation.y,
          comment: annotation.comment,
          author_name: userRole === 'agency_admin' ? 'Agency Team' : 'Client Team',
          author_role: userRole
        })
      })
      
      const result = await response.json()
      if (result.success) {
        // Update with database ID
        setCampaigns(prev => prev.map(campaign => 
          campaign.id === campaignId 
            ? { 
                ...campaign, 
                annotations: campaign.annotations?.map(ann => 
                  ann.id === newAnnotation.id 
                    ? { ...ann, id: result.annotation.id }
                    : ann
                )
              }
            : campaign
        ))
        console.log('✅ Annotation saved to database:', result.annotation.id)
      } else {
        console.error('❌ Failed to save annotation:', result.error)
      }
    } catch (error) {
      console.error('❌ Error saving annotation:', error)
    }
  }

  const addComment = async (campaignId: string, comment: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      comment: comment,
      author: userRole === 'agency_admin' ? 'Agency Team' : 'Client Team',
      author_role: userRole,
      created_at: new Date()
    }

    // Update local state immediately for UX
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { 
            ...campaign, 
            comments: [...(campaign.comments || []), newComment]
          }
        : campaign
    ))
    
    setNewComment('')
    
    // Save to database (using same annotation API with special flag for comments)
    try {
      const response = await fetch('/api/portal-annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airtable_record_id: campaignId,
          design_file_id: 'general-comment',
          client_id: client.id,
          agency_id: client.agency_id,
          x_position: 0, // Not location-specific
          y_position: 0,
          comment: comment,
          author_name: userRole === 'agency_admin' ? 'Agency Team' : 'Client Team',
          author_role: userRole,
          is_general_comment: true
        })
      })
      
      const result = await response.json()
      if (result.success) {
        console.log('✅ Comment saved to database:', result.annotation.id)
      } else {
        console.error('❌ Failed to save comment:', result.error)
      }
    } catch (error) {
      console.error('❌ Error saving comment:', error)
    }
  }

  const addReply = async (campaignId: string, annotationId: string, replyText: string) => {
    const reply: Comment = {
      id: `reply-${Date.now()}`,
      comment: replyText,
      author: userRole === 'agency_admin' ? 'Agency Team' : 'Client Team',
      author_role: userRole,
      created_at: new Date()
    }

    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { 
            ...campaign, 
            annotations: campaign.annotations?.map(ann => 
              ann.id === annotationId 
                ? { ...ann, replies: [...(ann.replies || []), reply] }
                : ann
            )
          }
        : campaign
    ))
    
    setReplyingTo(null)
    console.log('↩️ Added reply:', reply)
  }

  const resolveAnnotation = async (campaignId: string, annotationId: string) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { 
            ...campaign, 
            annotations: campaign.annotations?.map(ann => 
              ann.id === annotationId 
                ? { ...ann, resolved: !ann.resolved }
                : ann
            )
          }
        : campaign
    ))
    
    console.log('✅ Toggled annotation resolution:', annotationId)
  }

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!viewingDesign) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setNewAnnotation({
      x: Math.max(0, Math.min(95, x)),
      y: Math.max(0, Math.min(95, y)),
      comment: ''
    })
  }

  const saveNewAnnotation = () => {
    if (!newAnnotation || !newAnnotation.comment.trim() || !viewingDesign) return
    
    const fileId = viewingDesign.campaign.design_files?.[viewingDesign.fileIndex]?.id
    if (!fileId) return
    
    addAnnotation(viewingDesign.campaign.id, fileId, newAnnotation)
    setNewAnnotation(null)
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

                  {/* Design Files */}
                  {selectedCampaign.design_files && selectedCampaign.design_files.length > 0 && (
                    <div>
                      <h5 className="text-white font-medium mb-3">Design Files</h5>
                      <div className="space-y-2">
                        {selectedCampaign.design_files.map((file, index) => (
                          <div
                            key={file.id}
                            className="bg-white/10 border border-white/20 rounded-lg p-3 hover:bg-white/20 transition-colors cursor-pointer"
                            onClick={() => setViewingDesign({ campaign: selectedCampaign, fileIndex: index })}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <ImageIcon className="h-5 w-5 text-blue-400" />
                                <div>
                                  <p className="text-white font-medium text-sm">{file.filename}</p>
                                  <p className="text-white/60 text-xs">Click to review & annotate</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {selectedCampaign.annotations?.some(ann => 
                                  // Note: would need to filter by file in real implementation
                                  !ann.resolved
                                ) && (
                                  <span className="bg-red-500/30 text-red-300 text-xs px-2 py-1 rounded">
                                    Needs Review
                                  </span>
                                )}
                                <Eye className="h-4 w-4 text-white/60" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                  {/* Thread Comments */}
                  <div>
                    <h5 className="text-white font-medium mb-3">Discussion Thread</h5>
                    <div className="bg-white/5 rounded-lg p-3 max-h-40 overflow-y-auto space-y-3">
                      {selectedCampaign.comments && selectedCampaign.comments.length > 0 ? (
                        selectedCampaign.comments.map(comment => (
                          <div key={comment.id} className="space-y-2">
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                comment.author_role === 'client_user' 
                                  ? 'bg-green-400' 
                                  : 'bg-blue-400'
                              }`}></div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-white text-sm font-medium">{comment.author}</span>
                                  <span className="text-white/60 text-xs">
                                    {comment.created_at.toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-white/80 text-sm">{comment.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-white/60 text-sm">No comments yet. Start the discussion!</p>
                      )}
                    </div>
                    
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment to the discussion..."
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newComment.trim()) {
                            addComment(selectedCampaign.id, newComment)
                          }
                        }}
                      />
                      <button
                        onClick={() => newComment.trim() && addComment(selectedCampaign.id, newComment)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
                        disabled={!newComment.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Overall Feedback:
                    </label>
                    <textarea
                      className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 resize-none"
                      rows={3}
                      value={clientRevisions}
                      onChange={(e) => setClientRevisions(e.target.value)}
                      placeholder="Enter your overall feedback and approval notes..."
                      disabled={!isClientApprovalStatus(selectedCampaign.status)}
                    />
                    <p className="text-white/60 text-xs mt-1">
                      💡 Use the design viewer above for specific location feedback
                    </p>
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

      {/* Design Viewer Modal */}
      {viewingDesign && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex z-50">
          {/* Image Container */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="relative max-w-full max-h-full">
              <img 
                src={viewingDesign.campaign.design_files?.[viewingDesign.fileIndex]?.url}
                alt={viewingDesign.campaign.design_files?.[viewingDesign.fileIndex]?.filename}
                className="max-w-full max-h-full object-contain rounded-lg cursor-crosshair"
                onClick={handleImageClick}
              />
              
              {/* Existing Annotations */}
              {viewingDesign.campaign.annotations?.map(annotation => (
                <button
                  key={annotation.id}
                  className={`absolute w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                    annotation.resolved 
                      ? 'bg-green-500/80 border-green-300 text-white' 
                      : 'bg-red-500/80 border-red-300 text-white hover:scale-110'
                  }`}
                  style={{
                    left: `${annotation.x}%`,
                    top: `${annotation.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    // Could show annotation details in sidebar
                  }}
                >
                  <MessageSquare className="h-3 w-3" />
                </button>
              ))}
              
              {/* New Annotation */}
              {newAnnotation && (
                <div
                  className="absolute bg-yellow-500/80 border-2 border-yellow-300 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{
                    left: `${newAnnotation.x}%`,
                    top: `${newAnnotation.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <Plus className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-96 bg-black/60 backdrop-blur-sm border-l border-white/20 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/20">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-semibold">Design Review</h3>
                <button 
                  onClick={() => {
                    setViewingDesign(null)
                    setNewAnnotation(null)
                  }}
                  className="text-white/60 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-white/70 text-sm mt-1">
                {viewingDesign.campaign.title} - {viewingDesign.campaign.design_files?.[viewingDesign.fileIndex]?.filename}
              </p>
            </div>

            {/* Instructions */}
            <div className="p-4 border-b border-white/20">
              <p className="text-white/70 text-sm">
                💡 <strong>Click anywhere on the design</strong> to add location-specific feedback.
              </p>
            </div>

            {/* New Annotation Form */}
            {newAnnotation && (
              <div className="p-4 border-b border-white/20 bg-yellow-500/10">
                <h4 className="text-yellow-300 font-medium mb-2">Add Location Feedback</h4>
                <textarea
                  value={newAnnotation.comment}
                  onChange={(e) => setNewAnnotation({...newAnnotation, comment: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 resize-none"
                  rows={3}
                  placeholder="What needs to be changed at this location?"
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setNewAnnotation(null)}
                    className="bg-gray-600/80 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveNewAnnotation}
                    disabled={!newAnnotation.comment.trim()}
                    className="bg-yellow-600/80 hover:bg-yellow-600 disabled:bg-yellow-600/40 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                  >
                    <Pin className="h-3 w-3" />
                    Add Feedback
                  </button>
                </div>
              </div>
            )}

            {/* Annotations List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-3">
                <h4 className="text-white font-medium">
                  Location Feedback ({viewingDesign.campaign.annotations?.length || 0})
                </h4>
                
                {!viewingDesign.campaign.annotations || viewingDesign.campaign.annotations.length === 0 ? (
                  <p className="text-white/60 text-sm">
                    No location feedback yet. Click on the design to add comments.
                  </p>
                ) : (
                  viewingDesign.campaign.annotations.map(annotation => (
                    <Card 
                      key={annotation.id}
                      className={`bg-white/10 border-white/20 transition-colors ${
                        annotation.resolved ? 'opacity-60' : ''
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              annotation.resolved ? 'bg-green-400' : 'bg-red-400'
                            }`}></div>
                            <span className="text-white text-sm font-medium">
                              {annotation.author}
                            </span>
                          </div>
                          <span className="text-white/60 text-xs">
                            {annotation.created_at.toLocaleDateString()}
                          </span>
                        </div>
                        
                        <p className="text-white/80 text-sm mb-2">{annotation.comment}</p>
                        
                        {/* Replies */}
                        {annotation.replies && annotation.replies.length > 0 && (
                          <div className="ml-4 space-y-2 border-l-2 border-white/10 pl-3">
                            {annotation.replies.map(reply => (
                              <div key={reply.id}>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-white/80 text-xs font-medium">{reply.author}</span>
                                  <span className="text-white/60 text-xs">
                                    {reply.created_at.toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-white/70 text-xs">{reply.comment}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => resolveAnnotation(viewingDesign.campaign.id, annotation.id)}
                            className={`px-2 py-1 rounded text-xs transition-colors ${
                              annotation.resolved
                                ? 'bg-green-600/30 text-green-300'
                                : 'bg-gray-600/30 text-gray-300 hover:bg-gray-600/50'
                            }`}
                          >
                            {annotation.resolved ? '✓ Resolved' : 'Mark Resolved'}
                          </button>
                          
                          <button
                            onClick={() => setReplyingTo(annotation.id)}
                            className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
                          >
                            <Reply className="h-3 w-3" />
                            Reply
                          </button>
                        </div>

                        {/* Reply Form */}
                        {replyingTo === annotation.id && (
                          <div className="mt-2 flex gap-2">
                            <input
                              type="text"
                              placeholder="Add a reply..."
                              className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white placeholder-white/50 text-xs"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                                  addReply(viewingDesign.campaign.id, annotation.id, (e.target as HTMLInputElement).value)
                                  ;(e.target as HTMLInputElement).value = ''
                                }
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => setReplyingTo(null)}
                              className="text-gray-400 hover:text-gray-300 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 border-t border-white/20 bg-black/20">
              <div className="text-white/70 text-sm space-y-1">
                <p>Total feedback: {viewingDesign.campaign.annotations?.length || 0}</p>
                <p>Resolved: {viewingDesign.campaign.annotations?.filter(a => a.resolved).length || 0}</p>
                <p>Pending: {viewingDesign.campaign.annotations?.filter(a => !a.resolved).length || 0}</p>
              </div>
            </div>
          </div>
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