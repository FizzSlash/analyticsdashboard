'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  FileText,
  Plus,
  Edit,
  Trash2,
  Send,
  Eye,
  Users,
  Calendar,
  Star,
  CheckCircle,
  Clock,
  X,
  ExternalLink,
  Copy,
  Link,
  Mail,
  AlertCircle
} from 'lucide-react'

interface FormField {
  id: string
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'email' | 'number'
  label: string
  placeholder?: string
  options?: string[]
  required: boolean
  description?: string
}

interface FormTemplate {
  id: string
  title: string
  description: string
  category: 'onboarding' | 'monthly' | 'feedback' | 'content' | 'custom'
  fields: FormField[]
  status: 'draft' | 'active' | 'completed'
  created_date: Date
  responses: number
  assigned_clients: string[]
  due_date?: Date
  share_link: string
}

interface DynamicFormsProps {
  client: any
  userRole: 'client_user' | 'agency_admin'
}

export function DynamicForms({ client, userRole }: DynamicFormsProps) {
  const [forms, setForms] = useState<FormTemplate[]>([])
  const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [loading, setLoading] = useState(false)
  const [newForm, setNewForm] = useState<Partial<FormTemplate>>({
    title: '',
    description: '',
    category: 'custom',
    fields: []
  })

  useEffect(() => {
    loadForms()
  }, [client])

  const loadForms = async () => {
    setLoading(true)
    try {
      // TODO: Load from database
      setForms(generateMockForms())
    } catch (error) {
      console.error('Error loading forms:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockForms = (): FormTemplate[] => {
    // TODO: Load real assigned forms from database
    // For now, return empty array - forms will be populated via admin
    return []
  }

  const getFormStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300 border-green-400/30'
      case 'draft': return 'bg-orange-500/20 text-orange-300 border-orange-400/30'
      case 'completed': return 'bg-blue-500/20 text-blue-300 border-blue-400/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'onboarding': return Users
      case 'monthly': return Calendar
      case 'feedback': return Star
      case 'content': return FileText
      default: return Edit
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'onboarding': return 'bg-purple-500/20 text-purple-300 border-purple-400/30'
      case 'monthly': return 'bg-blue-500/20 text-blue-300 border-blue-400/30'
      case 'feedback': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
      case 'content': return 'bg-green-500/20 text-green-300 border-green-400/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30'
    }
  }

  const copyShareLink = (link: string) => {
    navigator.clipboard.writeText(link)
    console.log('📋 Share link copied:', link)
    // TODO: Show toast notification
  }

  const filteredForms = forms.filter(form => {
    // First filter by client assignment (clients only see their assigned forms)
    const isAssignedToClient = userRole === 'agency_admin' || 
      form.assigned_clients.includes(client.brand_name) || 
      form.assigned_clients.includes(client.brand_slug)
    
    if (!isAssignedToClient) return false
    
    // Then filter by status
    if (activeFilter === 'pending') return form.status === 'active' && form.responses === 0
    if (activeFilter === 'completed') return form.status === 'completed' || form.responses > 0
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-400" />
              <div>
                <CardTitle className="text-white">
                  {userRole === 'agency_admin' ? 'Form Templates' : 'My Forms'}
                </CardTitle>
                {userRole === 'client_user' && (
                  <p className="text-white/70 text-sm mt-1">
                    {filteredForms.filter(f => f.status === 'active' && f.responses === 0).length > 0 
                      ? `${filteredForms.filter(f => f.status === 'active' && f.responses === 0).length} forms pending completion`
                      : 'All forms completed'
                    }
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Pending Forms Alert for Clients */}
              {userRole === 'client_user' && filteredForms.filter(f => f.status === 'active' && f.responses === 0).length > 0 && (
                <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-3 py-1 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {filteredForms.filter(f => f.status === 'active' && f.responses === 0).length} forms need attention
                </div>
              )}
              
              {userRole === 'agency_admin' && (
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600/80 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center gap-2 backdrop-blur-sm"
                >
                  <Plus className="h-4 w-4" />
                  Create Form
                </button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Form Status Filters */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: 'All Forms', count: filteredForms.length },
          { id: 'pending', label: 'Pending', count: filteredForms.filter(f => f.status === 'active' && f.responses === 0).length },
          { id: 'completed', label: 'Completed', count: filteredForms.filter(f => f.status === 'completed' || f.responses > 0).length }
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2 ${
              activeFilter === filter.id 
                ? 'bg-white/20 text-white border-white/30' 
                : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            {filter.label}
            {filter.count > 0 && (
              <span className={`px-2 py-1 rounded-full text-xs ${
                filter.id === 'pending' && filter.count > 0 
                  ? 'bg-red-500/30 text-red-300' 
                  : 'bg-white/20 text-white/80'
              }`}>
                {filter.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Forms Grid */}
      {loading ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60 mx-auto mb-4"></div>
            <p className="text-white/70">Loading forms...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredForms.map(form => {
            const Icon = getCategoryIcon(form.category)
            const isOverdue = form.due_date && new Date() > form.due_date && form.status === 'active' && form.responses === 0
            
            return (
              <Card 
                key={form.id}
                className={`bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer backdrop-blur-sm ${
                  isOverdue ? 'ring-1 ring-red-400/50' : ''
                }`}
                onClick={() => setSelectedForm(form)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-white/60" />
                      <h4 className="text-white font-semibold line-clamp-1">{form.title}</h4>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-1 rounded-full text-xs border font-medium ${getCategoryColor(form.category)}`}>
                        {form.category}
                      </span>
                      {isOverdue && (
                        <span className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded border border-red-400/30">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-white/70 text-sm mb-3 line-clamp-2">
                    {form.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs border ${getFormStatusColor(form.status)}`}>
                      {form.status}
                    </span>
                    <div className="text-white/60 text-xs flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {form.responses} responses
                    </div>
                  </div>

                  <div className="text-xs text-white/60 space-y-1">
                    <p>Created: {form.created_date.toLocaleDateString()}</p>
                    {form.due_date && (
                      <p className={isOverdue ? 'text-red-400' : ''}>
                        Due: {form.due_date.toLocaleDateString()}
                      </p>
                    )}
                    <p>Fields: {form.fields.length}</p>
                  </div>

                  {userRole === 'client_user' && form.status === 'active' && form.responses === 0 && (
                    <div className="mt-3">
                      <button className="w-full bg-blue-600/80 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                        <Edit className="h-3 w-3" />
                        Fill Out Form
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* No Forms Message */}
      {!loading && filteredForms.length === 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/70">No forms found</p>
            <p className="text-white/50 text-sm">
              {userRole === 'agency_admin' 
                ? 'Create your first form template to get started' 
                : 'Your assigned forms will appear here'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Form Details Modal */}
      {selectedForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-white/10 border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = getCategoryIcon(selectedForm.category)
                    return <Icon className="h-5 w-5 text-white/60" />
                  })()}
                  <CardTitle className="text-white">{selectedForm.title}</CardTitle>
                </div>
                <button 
                  onClick={() => setSelectedForm(null)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Details */}
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <h5 className="text-white font-medium mb-2">Description</h5>
                    <p className="text-white/80 text-sm">{selectedForm.description}</p>
                  </div>

                  <div>
                    <h5 className="text-white font-medium mb-3">Form Fields ({selectedForm.fields.length})</h5>
                    <div className="space-y-3">
                      {selectedForm.fields.map(field => (
                        <div key={field.id} className="bg-white/10 rounded-lg p-3 border border-white/20">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-medium text-sm">{field.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-white/60 text-xs">{field.type}</span>
                              {field.required && (
                                <span className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded">
                                  Required
                                </span>
                              )}
                            </div>
                          </div>
                          {field.description && (
                            <p className="text-white/70 text-xs mt-1">{field.description}</p>
                          )}
                          {field.options && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {field.options.map((option, idx) => (
                                <span key={idx} className="bg-white/5 text-white/60 text-xs px-2 py-1 rounded">
                                  {option}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Form Meta */}
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                    <h5 className="text-white font-medium mb-3">Form Status</h5>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs border ${getFormStatusColor(selectedForm.status)}`}>
                          {selectedForm.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">Category:</span>
                        <span className={`px-2 py-1 rounded-full text-xs border ${getCategoryColor(selectedForm.category)}`}>
                          {selectedForm.category}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">Responses:</span>
                        <span className="text-white">{selectedForm.responses}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                    <h5 className="text-white font-medium mb-3">Timeline</h5>
                    <div className="space-y-2 text-sm">
                      <p className="text-white/80">
                        <span className="text-white/60">Created:</span> {selectedForm.created_date.toLocaleDateString()}
                      </p>
                      {selectedForm.due_date && (
                        <p className="text-white/80">
                          <span className="text-white/60">Due:</span> {selectedForm.due_date.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                    <h5 className="text-white font-medium mb-3">Share Link</h5>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={selectedForm.share_link}
                        readOnly
                        className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-white/80 text-xs"
                      />
                      <button
                        onClick={() => copyShareLink(selectedForm.share_link)}
                        className="bg-blue-600/80 hover:bg-blue-600 text-white p-2 rounded transition-colors"
                        title="Copy link"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <a
                        href={selectedForm.share_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-600/80 hover:bg-green-600 text-white p-2 rounded transition-colors"
                        title="Open form"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    {userRole === 'client_user' && selectedForm.status === 'active' && selectedForm.responses === 0 && (
                      <a
                        href={selectedForm.share_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-blue-600/80 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Fill Out Form
                      </a>
                    )}
                    
                    {userRole === 'agency_admin' && (
                      <div className="flex gap-2">
                        <button className="flex-1 bg-orange-600/80 hover:bg-orange-600 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                          <Edit className="h-3 w-3" />
                          Edit
                        </button>
                        <button className="bg-red-600/80 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Form Templates Info - Only for Agency Admins */}
      {userRole === 'agency_admin' && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <span className="font-medium text-white">Dynamic Form System</span>
                <p className="text-white/70 text-sm mt-1">
                  • Create custom forms for onboarding, monthly planning, and feedback<br/>
                  • Share direct links with clients for easy completion<br/>
                  • Track form responses and completion status<br/>
                  • Templates: Onboarding, Monthly Calendar, Satisfaction Surveys
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}