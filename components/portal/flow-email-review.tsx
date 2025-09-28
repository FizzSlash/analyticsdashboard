'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Zap,
  Mail,
  MessageSquare,
  Eye,
  Edit,
  Send,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Star,
  BarChart3
} from 'lucide-react'

interface FlowEmail {
  id: string
  messageId: string
  name: string
  subjectLine: string
  previewText: string
  status: 'draft' | 'live' | 'paused'
  stepNumber: number
  delay: string
  performance: {
    opens: number
    clicks: number
    conversions: number
    revenue: number
    openRate: number
    clickRate: number
  }
  feedback: {
    rating: number
    comments: string
    approved: boolean
    requestedChanges: string[]
  }
}

interface Flow {
  id: string
  name: string
  status: 'live' | 'draft' | 'paused'
  triggerType: string
  emails: FlowEmail[]
  totalRevenue: number
  totalConversions: number
}

interface FlowEmailReviewProps {
  client: any
  flows?: Flow[]
}

export function FlowEmailReview({ client, flows: providedFlows }: FlowEmailReviewProps) {
  const [flows, setFlows] = useState<Flow[]>([])
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null)
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set())
  const [editingFeedback, setEditingFeedback] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (providedFlows) {
      setFlows(providedFlows)
    } else {
      fetchFlowsWithEmails()
    }
  }, [client, providedFlows])

  const fetchFlowsWithEmails = async () => {
    setLoading(true)
    try {
      // Fetch flows with email details from your API
      const response = await fetch(`/api/flow-emails?clientSlug=${client.brand_slug}`)
      const result = await response.json()
      
      if (result.success) {
        setFlows(result.flows || generateMockFlows())
      }
    } catch (error) {
      console.error('Error fetching flows:', error)
      setFlows(generateMockFlows())
    } finally {
      setLoading(false)
    }
  }

  const generateMockFlows = (): Flow[] => [
    {
      id: 'flow1',
      name: 'Welcome Series',
      status: 'live',
      triggerType: 'List Subscription',
      totalRevenue: 1250.00,
      totalConversions: 42,
      emails: [
        {
          id: 'email1',
          messageId: 'msg1',
          name: 'Welcome Email',
          subjectLine: 'Welcome to Safari! 🎉',
          previewText: 'Thanks for joining our community...',
          status: 'live',
          stepNumber: 1,
          delay: 'Immediately',
          performance: {
            opens: 1842,
            clicks: 324,
            conversions: 12,
            revenue: 450.00,
            openRate: 65.2,
            clickRate: 17.6
          },
          feedback: {
            rating: 4,
            comments: 'Great welcome email, very engaging',
            approved: true,
            requestedChanges: []
          }
        },
        {
          id: 'email2',
          messageId: 'msg2', 
          name: 'Product Introduction',
          subjectLine: 'Discover what makes us different',
          previewText: 'Here are our top products...',
          status: 'live',
          stepNumber: 2,
          delay: '2 days',
          performance: {
            opens: 1456,
            clicks: 287,
            conversions: 18,
            revenue: 650.00,
            openRate: 58.4,
            clickRate: 19.7
          },
          feedback: {
            rating: 3,
            comments: 'Could use better product images',
            approved: false,
            requestedChanges: ['Update product images', 'Improve CTA button']
          }
        },
        {
          id: 'email3',
          messageId: 'msg3',
          name: 'Special Offer',
          subjectLine: 'Exclusive 20% off for new customers',
          previewText: 'As a welcome gift...',
          status: 'live',
          stepNumber: 3,
          delay: '5 days',
          performance: {
            opens: 1203,
            clicks: 198,
            conversions: 12,
            revenue: 150.00,
            openRate: 52.1,
            clickRate: 16.5
          },
          feedback: {
            rating: 5,
            comments: 'Perfect timing and great offer',
            approved: true,
            requestedChanges: []
          }
        }
      ]
    },
    {
      id: 'flow2',
      name: 'Abandoned Cart Recovery',
      status: 'live',
      triggerType: 'Started Checkout',
      totalRevenue: 2100.00,
      totalConversions: 67,
      emails: [
        {
          id: 'email4',
          messageId: 'msg4',
          name: 'Cart Reminder',
          subjectLine: 'You left something behind...',
          previewText: 'Complete your purchase and save...',
          status: 'live',
          stepNumber: 1,
          delay: '1 hour',
          performance: {
            opens: 892,
            clicks: 156,
            conversions: 23,
            revenue: 980.00,
            openRate: 42.1,
            clickRate: 17.5
          },
          feedback: {
            rating: 4,
            comments: 'Good urgency, could be more personalized',
            approved: true,
            requestedChanges: []
          }
        }
      ]
    }
  ]

  const toggleEmailExpanded = (emailId: string) => {
    const newExpanded = new Set(expandedEmails)
    if (newExpanded.has(emailId)) {
      newExpanded.delete(emailId)
    } else {
      newExpanded.add(emailId)
    }
    setExpandedEmails(newExpanded)
  }

  const updateEmailFeedback = (flowId: string, emailId: string, feedback: any) => {
    setFlows(prev => prev.map(flow => 
      flow.id === flowId 
        ? {
            ...flow,
            emails: flow.emails.map(email =>
              email.id === emailId 
                ? { ...email, feedback: { ...email.feedback, ...feedback } }
                : email
            )
          }
        : flow
    ))
  }

  const renderStarRating = (rating: number, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => onRatingChange?.(star)}
            className={`${
              star <= rating ? 'text-yellow-400' : 'text-white/30'
            } hover:text-yellow-300 transition-colors`}
            disabled={!onRatingChange}
          >
            <Star className="h-4 w-4 fill-current" />
          </button>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/60">Loading flows and emails...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Flow Email Review & Feedback
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Flows List */}
      <div className="space-y-4">
        {flows.map(flow => (
          <Card key={flow.id} className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-purple-400" />
                  <div>
                    <CardTitle className="text-white">{flow.name}</CardTitle>
                    <p className="text-white/60 text-sm">
                      {flow.triggerType} • {flow.emails.length} emails • ${flow.totalRevenue.toFixed(2)} revenue
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  flow.status === 'live' ? 'bg-green-500/20 text-green-400' :
                  flow.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {flow.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {flow.emails.map((email, index) => {
                  const isExpanded = expandedEmails.has(email.id)
                  const isEditing = editingFeedback === email.id
                  
                  return (
                    <div key={email.id} className="bg-white/10 border border-white/20 rounded-lg overflow-hidden">
                      {/* Email Header */}
                      <div 
                        className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => toggleEmailExpanded(email.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isExpanded ? 
                              <ChevronDown className="h-4 w-4 text-white/60" /> : 
                              <ChevronRight className="h-4 w-4 text-white/60" />
                            }
                            <Mail className="h-4 w-4 text-blue-400" />
                            <div>
                              <h4 className="text-white font-medium">
                                Step {email.stepNumber}: {email.name}
                              </h4>
                              <p className="text-white/60 text-sm">
                                {email.subjectLine} • Delay: {email.delay}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {/* Performance Badge */}
                            <div className="text-right">
                              <p className="text-white text-sm font-medium">
                                ${email.performance.revenue.toFixed(2)}
                              </p>
                              <p className="text-white/60 text-xs">
                                {email.performance.openRate.toFixed(1)}% opens
                              </p>
                            </div>
                            
                            {/* Approval Status */}
                            {email.feedback.approved ? (
                              <CheckCircle className="h-5 w-5 text-green-400" />
                            ) : email.feedback.requestedChanges.length > 0 ? (
                              <AlertTriangle className="h-5 w-5 text-orange-400" />
                            ) : (
                              <Clock className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Email Details */}
                      {isExpanded && (
                        <div className="border-t border-white/10 p-4 bg-white/5">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Email Performance */}
                            <div className="space-y-4">
                              <h5 className="text-white font-medium">Performance Metrics</h5>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/10 rounded-lg p-3">
                                  <p className="text-white/60 text-sm">Opens</p>
                                  <p className="text-white text-lg font-semibold">{email.performance.opens.toLocaleString()}</p>
                                  <p className="text-white/60 text-xs">{email.performance.openRate.toFixed(1)}%</p>
                                </div>
                                
                                <div className="bg-white/10 rounded-lg p-3">
                                  <p className="text-white/60 text-sm">Clicks</p>
                                  <p className="text-white text-lg font-semibold">{email.performance.clicks.toLocaleString()}</p>
                                  <p className="text-white/60 text-xs">{email.performance.clickRate.toFixed(1)}%</p>
                                </div>
                                
                                <div className="bg-white/10 rounded-lg p-3">
                                  <p className="text-white/60 text-sm">Conversions</p>
                                  <p className="text-white text-lg font-semibold">{email.performance.conversions}</p>
                                </div>
                                
                                <div className="bg-white/10 rounded-lg p-3">
                                  <p className="text-white/60 text-sm">Revenue</p>
                                  <p className="text-white text-lg font-semibold">${email.performance.revenue.toFixed(2)}</p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h6 className="text-white/80 text-sm font-medium">Email Content</h6>
                                <div className="bg-white/10 rounded-lg p-3">
                                  <p className="text-white text-sm"><strong>Subject:</strong> {email.subjectLine}</p>
                                  <p className="text-white/60 text-sm mt-1"><strong>Preview:</strong> {email.previewText}</p>
                                </div>
                              </div>

                              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                                <Eye className="h-4 w-4" />
                                Preview Email
                              </button>
                            </div>

                            {/* Client Feedback */}
                            <div className="space-y-4">
                              <h5 className="text-white font-medium">Client Feedback</h5>
                              
                              {isEditing ? (
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-white/80 text-sm mb-2">Rating</label>
                                    {renderStarRating(email.feedback.rating, (rating) => 
                                      updateEmailFeedback(flow.id, email.id, { rating })
                                    )}
                                  </div>
                                  
                                  <div>
                                    <label className="block text-white/80 text-sm mb-2">Comments</label>
                                    <textarea
                                      value={email.feedback.comments}
                                      onChange={(e) => updateEmailFeedback(flow.id, email.id, { comments: e.target.value })}
                                      className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 resize-none"
                                      rows={3}
                                      placeholder="Leave feedback for this email..."
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-white/80 text-sm mb-2">Requested Changes</label>
                                    <textarea
                                      value={email.feedback.requestedChanges.join('\n')}
                                      onChange={(e) => updateEmailFeedback(flow.id, email.id, { 
                                        requestedChanges: e.target.value.split('\n').filter(Boolean) 
                                      })}
                                      className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 resize-none"
                                      rows={3}
                                      placeholder="List specific changes needed (one per line)..."
                                    />
                                  </div>

                                  <div className="flex gap-3">
                                    <button
                                      onClick={() => {
                                        updateEmailFeedback(flow.id, email.id, { approved: true })
                                        setEditingFeedback(null)
                                      }}
                                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                      Approve
                                    </button>
                                    
                                    <button
                                      onClick={() => {
                                        updateEmailFeedback(flow.id, email.id, { approved: false })
                                        setEditingFeedback(null)
                                      }}
                                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                      <Edit className="h-4 w-4" />
                                      Request Changes
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-white/60 text-sm">Rating:</span>
                                      {renderStarRating(email.feedback.rating)}
                                    </div>
                                    <button
                                      onClick={() => setEditingFeedback(email.id)}
                                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                                    >
                                      <Edit className="h-3 w-3" />
                                      Edit
                                    </button>
                                  </div>

                                  {email.feedback.comments && (
                                    <div className="bg-white/10 rounded-lg p-3">
                                      <p className="text-white text-sm">{email.feedback.comments}</p>
                                    </div>
                                  )}

                                  {email.feedback.requestedChanges.length > 0 && (
                                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                                      <p className="text-orange-300 text-sm font-medium mb-2">Requested Changes:</p>
                                      <ul className="text-orange-200 text-sm space-y-1">
                                        {email.feedback.requestedChanges.map((change, idx) => (
                                          <li key={idx}>• {change}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2">
                                    <span className="text-white/60 text-sm">Status:</span>
                                    {email.feedback.approved ? (
                                      <span className="flex items-center gap-1 text-green-400 text-sm">
                                        <CheckCircle className="h-3 w-3" />
                                        Approved
                                      </span>
                                    ) : email.feedback.requestedChanges.length > 0 ? (
                                      <span className="flex items-center gap-1 text-orange-400 text-sm">
                                        <AlertTriangle className="h-3 w-3" />
                                        Changes Requested
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 text-gray-400 text-sm">
                                        <Clock className="h-3 w-3" />
                                        Pending Review
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}