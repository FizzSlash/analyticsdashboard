'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus,
  Mail,
  Zap,
  MousePointer,
  Settings,
  FileText,
  Calendar,
  Users,
  Target,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  X,
  ArrowRight,
  DollarSign
} from 'lucide-react'

interface EnhancedRequest {
  id: string
  title: string
  type: 'campaign' | 'flow' | 'popup' | 'misc'
  subtype?: string // email, sms, welcome_series, exit_intent, etc.
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'submitted' | 'in_review' | 'approved' | 'in_progress' | 'completed' | 'rejected'
  requestedBy: string
  requestDate: Date
  desiredLaunchDate?: Date
  description: string
  objectives: string[]
  targetAudience: string
  keyRequirements: string[]
  budget?: number
  notes: string
  assignedTo?: string
  estimatedHours?: number
  actualHours?: number
}

interface EnhancedRequestsProps {
  client: any
}

export function EnhancedRequests({ client }: EnhancedRequestsProps) {
  const [requests, setRequests] = useState<EnhancedRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<EnhancedRequest | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'campaign' | 'flow' | 'popup' | 'misc'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'in_progress' | 'completed'>('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [client])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      // TODO: Fetch from database
      setRequests(generateMockRequests())
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockRequests = (): EnhancedRequest[] => [
    {
      id: 'req1',
      title: 'Holiday Email Campaign Series',
      type: 'campaign',
      subtype: 'email_series',
      priority: 'high',
      status: 'in_progress',
      requestedBy: 'Marketing Team',
      requestDate: new Date(2025, 9, 15),
      desiredLaunchDate: new Date(2025, 10, 1),
      description: 'Comprehensive holiday campaign with 5 emails over 2 weeks',
      objectives: [
        'Increase Q4 revenue by 30%',
        'Promote holiday product collection',
        'Drive traffic to holiday landing page'
      ],
      targetAudience: 'All subscribers + VIP customers',
      keyRequirements: [
        'Holiday-themed email templates',
        'Product photography for new items',
        'Discount codes and pricing strategy',
        'Mobile-responsive design'
      ],
      budget: 5000,
      notes: 'Need to coordinate with inventory team for stock levels',
      assignedTo: 'Design Team',
      estimatedHours: 40,
      actualHours: 28
    },
    {
      id: 'req2',
      title: 'Abandoned Cart Recovery Flow',
      type: 'flow',
      subtype: 'automation',
      priority: 'medium',
      status: 'submitted',
      requestedBy: 'E-commerce Manager',
      requestDate: new Date(2025, 9, 10),
      desiredLaunchDate: new Date(2025, 9, 25),
      description: 'Multi-step automation to recover abandoned carts with personalized messaging',
      objectives: [
        'Recover 15% of abandoned carts',
        'Increase conversion rate',
        'Reduce cart abandonment'
      ],
      targetAudience: 'Users who added items but didn\'t complete checkout',
      keyRequirements: [
        '3-email sequence with increasing urgency',
        'Dynamic product recommendations',
        'Discount escalation strategy',
        'Mobile cart recovery links'
      ],
      budget: 3000,
      notes: 'Should integrate with Shopify abandoned cart data',
      estimatedHours: 25
    },
    {
      id: 'req3',
      title: 'Exit-Intent Popup Campaign',
      type: 'popup',
      subtype: 'exit_intent',
      priority: 'medium',
      status: 'approved',
      requestedBy: 'Conversion Team',
      requestDate: new Date(2025, 9, 8),
      desiredLaunchDate: new Date(2025, 9, 20),
      description: 'Exit-intent popup to capture emails before visitors leave',
      objectives: [
        'Increase email capture rate by 25%',
        'Reduce bounce rate',
        'Build subscriber list'
      ],
      targetAudience: 'First-time website visitors',
      keyRequirements: [
        'Compelling lead magnet offer',
        'Mobile-friendly popup design',
        'A/B test different offers',
        'Integration with email platform'
      ],
      budget: 1500,
      notes: 'Test on different pages to find optimal placement',
      assignedTo: 'Dev Team',
      estimatedHours: 15,
      actualHours: 12
    },
    {
      id: 'req4',
      title: 'Analytics Dashboard Enhancement',
      type: 'misc',
      subtype: 'development',
      priority: 'low',
      status: 'completed',
      requestedBy: 'Data Team',
      requestDate: new Date(2025, 8, 25),
      description: 'Add new metrics and reporting features to existing dashboard',
      objectives: [
        'Better data visualization',
        'Real-time reporting',
        'Custom metric tracking'
      ],
      targetAudience: 'Internal team',
      keyRequirements: [
        'New chart components',
        'API integrations',
        'User role permissions',
        'Export functionality'
      ],
      budget: 8000,
      notes: 'Completed ahead of schedule with bonus features',
      assignedTo: 'Development Team',
      estimatedHours: 60,
      actualHours: 52
    }
  ]

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'campaign': return Mail
      case 'flow': return Zap
      case 'popup': return MousePointer
      case 'misc': return Settings
      default: return FileText
    }
  }

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case 'campaign': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'flow': return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'popup': return 'bg-green-100 text-green-700 border-green-300'
      case 'misc': return 'bg-gray-100 text-gray-700 border-gray-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-300'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'low': return 'bg-green-100 text-green-700 border-green-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'in_review': return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'approved': return 'bg-green-100 text-green-700 border-green-300'
      case 'in_progress': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'completed': return 'bg-green-100 text-green-800 border-green-400'
      case 'rejected': return 'bg-red-100 text-red-700 border-red-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const filteredRequests = requests.filter(request => {
    const typeMatch = activeFilter === 'all' || request.type === activeFilter
    const statusMatch = statusFilter === 'all' || 
      (statusFilter === 'submitted' && request.status === 'submitted') ||
      (statusFilter === 'in_progress' && ['in_review', 'approved', 'in_progress'].includes(request.status)) ||
      (statusFilter === 'completed' && ['completed', 'rejected'].includes(request.status))
    
    return typeMatch && statusMatch
  })

  const requestTypeCounts = {
    campaign: requests.filter(r => r.type === 'campaign').length,
    flow: requests.filter(r => r.type === 'flow').length, 
    popup: requests.filter(r => r.type === 'popup').length,
    misc: requests.filter(r => r.type === 'misc').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Enhanced Request System
            </CardTitle>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Request
            </button>
          </div>
        </CardHeader>
      </Card>

      {/* Request Type Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
            activeFilter === 'all' 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          All ({requests.length})
        </button>
        
        {[
          { id: 'campaign', label: 'Campaigns', count: requestTypeCounts.campaign },
          { id: 'flow', label: 'Flows', count: requestTypeCounts.flow },
          { id: 'popup', label: 'Popups', count: requestTypeCounts.popup },
          { id: 'misc', label: 'Misc', count: requestTypeCounts.misc }
        ].map(filter => {
          const Icon = getRequestTypeIcon(filter.id)
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2 ${
                activeFilter === filter.id 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-3 w-3" />
              {filter.label} ({filter.count})
            </button>
          )
        })}
      </div>

      {/* Status Filters */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: 'All Status' },
          { id: 'submitted', label: 'Submitted' },
          { id: 'in_progress', label: 'In Progress' },
          { id: 'completed', label: 'Completed' }
        ].map(status => (
          <button
            key={status.id}
            onClick={() => setStatusFilter(status.id as any)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
              statusFilter === status.id 
                ? 'bg-gray-800 text-white border-gray-800' 
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Requests Grid */}
      {loading ? (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading requests...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map(request => {
            const Icon = getRequestTypeIcon(request.type)
            
            return (
              <Card 
                key={request.id}
                className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedRequest(request)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-gray-600" />
                      <h4 className="text-gray-900 font-semibold">{request.title}</h4>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-1 rounded-full text-xs border font-medium ${getRequestTypeColor(request.type)}`}>
                        {request.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {request.description}
                  </p>

                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(request.status)}`}>
                      {request.status.replace('_', ' ')}
                    </span>
                    {request.budget && (
                      <span className="text-gray-600 text-xs flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ${request.budget.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
                    <p>By: {request.requestedBy}</p>
                    <p>Requested: {request.requestDate.toLocaleDateString()}</p>
                    {request.desiredLaunchDate && (
                      <p>Launch: {request.desiredLaunchDate.toLocaleDateString()}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-white border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = getRequestTypeIcon(selectedRequest.type)
                    return <Icon className="h-5 w-5 text-gray-600" />
                  })()}
                  <CardTitle className="text-gray-900">{selectedRequest.title}</CardTitle>
                </div>
                <button 
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Request Details */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3 border">
                      <p className="text-gray-600 text-sm">Type</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-sm border ${getRequestTypeColor(selectedRequest.type)}`}>
                        {selectedRequest.type}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border">
                      <p className="text-gray-600 text-sm">Priority</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-sm border ${getPriorityColor(selectedRequest.priority)}`}>
                        {selectedRequest.priority}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border">
                      <p className="text-gray-600 text-sm">Status</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-sm border ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-gray-900 font-medium mb-2">Description</h5>
                    <div className="bg-gray-50 rounded-lg p-3 border">
                      <p className="text-gray-800 whitespace-pre-wrap">{selectedRequest.description}</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-gray-900 font-medium mb-2">Objectives</h5>
                    <ul className="space-y-2">
                      {selectedRequest.objectives.map((objective, idx) => (
                        <li key={idx} className="text-gray-700 text-sm flex items-start gap-2">
                          <Target className="h-3 w-3 text-blue-600 mt-1 flex-shrink-0" />
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-gray-900 font-medium mb-2">Key Requirements</h5>
                    <ul className="space-y-2">
                      {selectedRequest.keyRequirements.map((requirement, idx) => (
                        <li key={idx} className="text-gray-700 text-sm flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Request Meta */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <h5 className="text-gray-900 font-medium mb-3">Request Details</h5>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700">
                        <span className="text-gray-500">Requested:</span> {selectedRequest.requestDate.toLocaleDateString()}
                      </p>
                      {selectedRequest.desiredLaunchDate && (
                        <p className="text-gray-700">
                          <span className="text-gray-500">Launch Date:</span> {selectedRequest.desiredLaunchDate.toLocaleDateString()}
                        </p>
                      )}
                      <p className="text-gray-700">
                        <span className="text-gray-500">Requested by:</span> {selectedRequest.requestedBy}
                      </p>
                      {selectedRequest.assignedTo && (
                        <p className="text-gray-700">
                          <span className="text-gray-500">Assigned to:</span> {selectedRequest.assignedTo}
                        </p>
                      )}
                      {selectedRequest.budget && (
                        <p className="text-gray-700">
                          <span className="text-gray-500">Budget:</span> ${selectedRequest.budget.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {(selectedRequest.estimatedHours || selectedRequest.actualHours) && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h5 className="text-gray-900 font-medium mb-2">Time Tracking</h5>
                      <div className="space-y-1 text-sm">
                        {selectedRequest.estimatedHours && (
                          <p className="text-gray-700">Estimated: {selectedRequest.estimatedHours}h</p>
                        )}
                        {selectedRequest.actualHours && (
                          <p className="text-gray-700">Actual: {selectedRequest.actualHours}h</p>
                        )}
                        {selectedRequest.estimatedHours && selectedRequest.actualHours && (
                          <p className={`font-medium ${
                            selectedRequest.actualHours <= selectedRequest.estimatedHours 
                              ? 'text-green-700' 
                              : 'text-orange-700'
                          }`}>
                            {selectedRequest.actualHours <= selectedRequest.estimatedHours ? 'On time' : 'Over estimate'}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <h5 className="text-gray-900 font-medium mb-2">Target Audience</h5>
                    <p className="text-gray-700 text-sm">{selectedRequest.targetAudience}</p>
                  </div>

                  {selectedRequest.notes && (
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <h5 className="text-gray-900 font-medium mb-2">Notes</h5>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{selectedRequest.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-white border border-gray-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-gray-900">Create New Request</CardTitle>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Request Title *</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter request title..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Type *</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500">
                      <option value="campaign">📧 Campaign</option>
                      <option value="flow">🔄 Flow/Automation</option>
                      <option value="popup">🎯 Popup/Modal</option>
                      <option value="misc">⚙️ Misc/Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Priority</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Budget</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="5000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Description *</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                    placeholder="Describe what you need in detail..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Target Audience</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., All subscribers, VIP customers..."
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Desired Launch Date</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Key Requirements</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    placeholder="List specific requirements (one per line)..."
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Additional Notes</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                    placeholder="Any additional context or special requirements..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors border border-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Submit Request
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}