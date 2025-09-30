'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus,
  Mail,
  MessageSquare,
  Calendar,
  Users,
  Target,
  FileText,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  X
} from 'lucide-react'

interface CampaignRequest {
  id: string
  title: string
  type: 'email' | 'sms' | 'both'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  requestedBy: string
  requestDate: Date
  desiredLaunchDate?: Date
  status: 'submitted' | 'in_review' | 'approved' | 'in_progress' | 'completed' | 'rejected'
  description: string
  objectives: string[]
  targetAudience: string
  keyMessages: string[]
  assets: {
    type: 'image' | 'copy' | 'design' | 'other'
    name: string
    url?: string
    status: 'provided' | 'needed' | 'in_progress'
  }[]
  budget?: number
  notes: string
}

interface CampaignRequestsProps {
  client: any
}

export function CampaignRequests({ client }: CampaignRequestsProps) {
  const [requests, setRequests] = useState<CampaignRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<CampaignRequest | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'submitted' | 'in_progress' | 'completed'>('all')

  useEffect(() => {
    fetchCampaignRequests()
  }, [client])

  const fetchCampaignRequests = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      setRequests(generateMockRequests())
    } catch (error) {
      console.error('Error fetching campaign requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockRequests = (): CampaignRequest[] => {
    // TODO: Load real campaign requests from database
    return []
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/20'
      case 'high': return 'text-orange-400 bg-orange-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'low': return 'text-green-400 bg-green-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'text-blue-400 bg-blue-500/20'
      case 'in_review': return 'text-purple-400 bg-purple-500/20'
      case 'approved': return 'text-green-400 bg-green-500/20'
      case 'in_progress': return 'text-orange-400 bg-orange-500/20'
      case 'completed': return 'text-green-600 bg-green-600/20'
      case 'rejected': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const filteredRequests = activeTab === 'all' 
    ? requests 
    : requests.filter(req => {
        if (activeTab === 'submitted') return req.status === 'submitted'
        if (activeTab === 'in_progress') return ['in_review', 'approved', 'in_progress'].includes(req.status)
        if (activeTab === 'completed') return ['completed', 'rejected'].includes(req.status)
        return true
      })

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Campaign Requests
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

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: 'All Requests' },
          { id: 'submitted', label: 'Submitted' },
          { id: 'in_progress', label: 'In Progress' },
          { id: 'completed', label: 'Completed' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id 
                ? 'bg-white/20 text-white' 
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRequests.map(request => (
          <Card 
            key={request.id}
            className="bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
            onClick={() => setSelectedRequest(request)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-white font-semibold">{request.title}</h4>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <p className="text-white/60 text-sm mb-3 line-clamp-2">
                {request.description}
              </p>

              <div className="flex items-center justify-between text-xs text-white/60">
                <span>By: {request.requestedBy}</span>
                <span>{request.requestDate.toLocaleDateString()}</span>
              </div>

              {request.desiredLaunchDate && (
                <div className="mt-2 text-xs text-white/60">
                  Launch: {request.desiredLaunchDate.toLocaleDateString()}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-white/10 border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">{selectedRequest.title}</CardTitle>
                <button 
                  onClick={() => setSelectedRequest(null)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Request Details */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-white/60 text-sm">Priority</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-sm ${getPriorityColor(selectedRequest.priority)}`}>
                        {selectedRequest.priority}
                      </span>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-white/60 text-sm">Type</p>
                      <p className="text-white">{selectedRequest.type}</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-white font-medium mb-2">Description</h5>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-white/80 whitespace-pre-wrap">{selectedRequest.description}</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-white font-medium mb-2">Objectives</h5>
                    <ul className="space-y-1">
                      {selectedRequest.objectives.map((objective, idx) => (
                        <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                          <Target className="h-3 w-3 text-blue-400 mt-1 flex-shrink-0" />
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-white font-medium mb-2">Key Messages</h5>
                    <ul className="space-y-1">
                      {selectedRequest.keyMessages.map((message, idx) => (
                        <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                          <MessageSquare className="h-3 w-3 text-purple-400 mt-1 flex-shrink-0" />
                          {message}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Request Status & Assets */}
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <h5 className="text-white font-medium mb-3">Request Status</h5>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status.replace('_', ' ')}
                    </span>
                    
                    <div className="mt-3 space-y-2 text-sm">
                      <p className="text-white/60">
                        Requested: {selectedRequest.requestDate.toLocaleDateString()}
                      </p>
                      {selectedRequest.desiredLaunchDate && (
                        <p className="text-white/60">
                          Launch Date: {selectedRequest.desiredLaunchDate.toLocaleDateString()}
                        </p>
                      )}
                      <p className="text-white/60">
                        Requested by: {selectedRequest.requestedBy}
                      </p>
                      {selectedRequest.budget && (
                        <p className="text-white/60">
                          Budget: ${selectedRequest.budget.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4">
                    <h5 className="text-white font-medium mb-3">Required Assets</h5>
                    <div className="space-y-2">
                      {selectedRequest.assets.map((asset, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-white/80 text-sm">{asset.name}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            asset.status === 'provided' ? 'bg-green-500/20 text-green-400' :
                            asset.status === 'in_progress' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {asset.status.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4">
                    <h5 className="text-white font-medium mb-2">Target Audience</h5>
                    <p className="text-white/80 text-sm">{selectedRequest.targetAudience}</p>
                  </div>

                  {selectedRequest.notes && (
                    <div className="bg-white/10 rounded-lg p-4">
                      <h5 className="text-white font-medium mb-2">Notes</h5>
                      <p className="text-white/80 text-sm whitespace-pre-wrap">{selectedRequest.notes}</p>
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-white/10 border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">New Campaign Request</CardTitle>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Campaign Title</label>
                  <input
                    type="text"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50"
                    placeholder="Enter campaign title..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Type</label>
                    <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="both">Email + SMS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Priority</label>
                    <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Description</label>
                  <textarea
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 resize-none"
                    rows={3}
                    placeholder="Describe the campaign objectives and requirements..."
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Desired Launch Date</label>
                  <input
                    type="date"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Requests List */}
      {loading ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/60">Loading campaign requests...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map(request => (
            <Card 
              key={request.id}
              className="bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => setSelectedRequest(request)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-white font-semibold">{request.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                </div>

                <p className="text-white/60 text-sm mb-3 line-clamp-2">
                  {request.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                    {request.status.replace('_', ' ')}
                  </span>
                  <span className="text-white/60 text-xs">
                    {request.requestDate.toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}