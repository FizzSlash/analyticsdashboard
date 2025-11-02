'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormBuilderModal } from './form-builder-modal'
import { 
  FileText,
  Plus,
  Eye,
  Edit,
  Trash2,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  X
} from 'lucide-react'

interface FormField {
  id: string
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'email' | 'number'
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
  category: 'onboarding' | 'strategy' | 'monthly' | 'brief' | 'demographic' | 'custom'
  fields: FormField[]
  status: 'draft' | 'active' | 'completed' | 'archived'
  num_fields: number
  assigned_clients: string[]
  responses_count: number
  total_clients: number
  due_date?: Date
  created_at: Date
}

interface OpsFormsProps {
  clients: any[]
  selectedClient: string
}

type FormFilter = 'all' | 'active' | 'completed' | 'draft'

// Pre-built Form Templates
const FORM_TEMPLATES = {
  onboarding: {
    title: "Client Onboarding Questionnaire",
    description: "Gather essential brand information from new clients",
    category: 'onboarding' as const,
    fields: [
      { id: 'brand_name', type: 'text' as const, label: 'Brand Name', required: true, placeholder: 'Enter your brand name' },
      { id: 'email', type: 'email' as const, label: 'Primary Contact Email', required: true, placeholder: 'email@brand.com' },
      { id: 'website', type: 'text' as const, label: 'Website URL', required: false, placeholder: 'https://yourbrand.com' },
      { id: 'brand_colors', type: 'text' as const, label: 'Brand Colors (hex codes, comma-separated)', placeholder: '#3B82F6, #1D4ED8, #60A5FA', required: false },
      { id: 'fonts_primary', type: 'text' as const, label: 'Primary Font', placeholder: 'Montserrat', required: false },
      { id: 'fonts_secondary', type: 'text' as const, label: 'Secondary Font', placeholder: 'Open Sans', required: false },
      { id: 'brand_voice', type: 'select' as const, label: 'Brand Voice', options: ['Professional', 'Friendly', 'Energetic', 'Luxurious', 'Playful', 'Technical'], required: true },
      { id: 'key_messages', type: 'textarea' as const, label: 'Key Brand Messages (one per line)', required: false, description: 'Core messages that define your brand' },
      { id: 'legal_requirements', type: 'textarea' as const, label: 'Legal/Compliance Requirements', required: false },
      { id: 'design_preferences', type: 'textarea' as const, label: 'Design Preferences', description: 'Colors, layouts, image styles you prefer', required: false },
      { id: 'design_dislikes', type: 'textarea' as const, label: 'Design Dislikes', description: 'Things to avoid in designs', required: false },
      { id: 'target_audience', type: 'text' as const, label: 'Target Audience Description', required: true },
      { id: 'competitors', type: 'textarea' as const, label: 'Top 3-5 Competitors (with URLs)', required: false }
    ]
  },
  monthly: {
    title: "Monthly Strategy Planning",
    description: "Gather monthly initiatives and priorities",
    category: 'monthly' as const,
    fields: [
      { id: 'initiatives', type: 'textarea' as const, label: 'Key Initiatives This Month', required: true },
      { id: 'promotions', type: 'textarea' as const, label: 'Promotional Calendar (sales, launches, events)', required: false },
      { id: 'themes', type: 'textarea' as const, label: 'Content Themes/Focus Areas', required: false },
      { id: 'new_products', type: 'textarea' as const, label: 'New Products/Services to Highlight?', required: false },
      { id: 'priority', type: 'select' as const, label: 'Priority Level This Month', options: ['High', 'Medium', 'Low'], required: true },
      { id: 'notes', type: 'textarea' as const, label: 'Additional Requests or Notes', required: false }
    ]
  },
  brief: {
    title: "Campaign Brief",
    description: "Gather campaign-specific requirements",
    category: 'brief' as const,
    fields: [
      { id: 'campaign_name', type: 'text' as const, label: 'Campaign Name', required: true },
      { id: 'campaign_goal', type: 'textarea' as const, label: 'Campaign Goal/Objective', required: true },
      { id: 'target_audience', type: 'text' as const, label: 'Target Audience', required: true },
      { id: 'key_messages', type: 'textarea' as const, label: 'Key Messages to Include', required: true },
      { id: 'send_date', type: 'date' as const, label: 'Desired Send Date', required: false },
      { id: 'offer', type: 'text' as const, label: 'Offer/Promotion (if applicable)', required: false },
      { id: 'cta', type: 'text' as const, label: 'Call-to-Action', required: true },
      { id: 'design_notes', type: 'textarea' as const, label: 'Design Direction/Inspiration', required: false },
      { id: 'competitors_reference', type: 'textarea' as const, label: 'Competitor Examples (URLs)', required: false },
      { id: 'additional_notes', type: 'textarea' as const, label: 'Additional Notes', required: false }
    ]
  },
  demographic: {
    title: "Audience Demographics Survey",
    description: "Gather detailed audience insights",
    category: 'demographic' as const,
    fields: [
      { id: 'age_range', type: 'select' as const, label: 'Primary Age Range', options: ['18-24', '25-34', '35-44', '45-54', '55+'], required: true },
      { id: 'gender', type: 'select' as const, label: 'Primary Gender Focus', options: ['Female-focused', 'Male-focused', 'Gender-neutral'], required: true },
      { id: 'income', type: 'select' as const, label: 'Income Level', options: ['$0-50K', '$50-100K', '$100-150K', '$150K+'], required: false },
      { id: 'interests', type: 'textarea' as const, label: 'Primary Interests/Hobbies', required: false },
      { id: 'pain_points', type: 'textarea' as const, label: 'Main Pain Points Your Product Solves', required: true },
      { id: 'purchase_drivers', type: 'textarea' as const, label: 'What Drives Purchase Decisions?', required: false },
      { id: 'email_frequency', type: 'select' as const, label: 'Preferred Email Frequency', options: ['1-2/week', '3-4/week', 'Daily', 'As needed'], required: false }
    ]
  }
}

export function OpsForms({ clients, selectedClient }: OpsFormsProps) {
  const [activeFilter, setActiveFilter] = useState<FormFilter>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null)
  const [editingForm, setEditingForm] = useState<Partial<FormTemplate> | null>(null)
  const [viewingResponse, setViewingResponse] = useState<string | null>(null)
  const [forms, setForms] = useState<FormTemplate[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch forms from API
  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/ops/forms')
        const data = await response.json()
        
        if (data.success && data.forms) {
          setForms(data.forms.map((f: any) => ({
            ...f,
            due_date: f.due_date ? new Date(f.due_date) : undefined,
            created_at: new Date(f.created_at),
            num_fields: f.fields?.length || 0,
            responses_count: 0, // Will calculate from responses later
            total_clients: f.assigned_client_names?.length || 0
          })))
        }
      } catch (error) {
        console.error('Error fetching forms:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchForms()
  }, [])

  // Mock form responses (will be from database later)
  const mockResponses: Record<string, any> = {
    'Hydrus': {
      form_id: '1',
      client_name: 'Hydrus',
      submitted_at: new Date(2025, 9, 28),
      imported: false,
      response_data: {
        'brand_name': 'Hydrus',
        'email': 'hello@hydrus.com',
        'brand_colors': '#3B82F6, #1D4ED8, #60A5FA',
        'fonts_primary': 'Montserrat',
        'fonts_secondary': 'Open Sans',
        'brand_voice': 'Energetic',
        'key_messages': '• Hydrate smarter, not harder\n• Science-backed hydration\n• Your body\'s best friend',
        'target_audience': 'Health-conscious millennials aged 25-40',
        'design_preferences': 'Bold colors, lifestyle product photography, clean layouts',
        'design_dislikes': 'Stock photos with models, busy designs, red colors'
      }
    }
  }

  // Mock forms data (will be from database later)
  const [forms, setForms] = useState<FormTemplate[]>([
    {
      id: '1',
      title: 'Client Onboarding Questionnaire',
      description: 'Gather essential brand information from new clients',
      category: 'onboarding',
      fields: [], // Will populate in Task 67
      status: 'active',
      num_fields: 12,
      assigned_clients: ['Hydrus', 'Peak Design'],
      responses_count: 1,
      total_clients: 2,
      due_date: new Date(2025, 10, 30),
      created_at: new Date(2025, 9, 20)
    },
    {
      id: '2',
      title: 'Monthly Strategy Check-in - November',
      description: 'Gather monthly initiatives and priorities',
      category: 'monthly',
      fields: [],
      status: 'completed',
      num_fields: 8,
      assigned_clients: ['Hydrus', 'Peak Design', 'Make Waves'],
      responses_count: 3,
      total_clients: 3,
      created_at: new Date(2025, 10, 1)
    },
    {
      id: '3',
      title: 'Brand Guidelines Deep Dive',
      description: 'Comprehensive brand identity questionnaire',
      category: 'onboarding',
      fields: [],
      status: 'draft',
      num_fields: 15,
      assigned_clients: ['Make Waves'],
      responses_count: 0,
      total_clients: 1,
      created_at: new Date(2025, 10, 5)
    }
  ])

  // Filter forms
  const filteredForms = forms.filter(form => {
    if (activeFilter !== 'all' && form.status !== activeFilter) return false
    if (selectedClient !== 'all' && !form.assigned_clients.includes(
      clients.find(c => c.id === selectedClient)?.brand_name
    )) return false
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-300'
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'draft': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'archived': return 'bg-gray-100 text-gray-700 border-gray-300'
      default: return 'bg-gray-100 text-gray-600 border-gray-300'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'onboarding': return 'bg-purple-50 border-purple-200'
      case 'strategy': return 'bg-blue-50 border-blue-200'
      case 'monthly': return 'bg-green-50 border-green-200'
      case 'brief': return 'bg-orange-50 border-orange-200'
      case 'demographic': return 'bg-pink-50 border-pink-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const handleDeleteForm = async (formId: string) => {
    if (confirm('Delete this form? This will also delete all responses.')) {
      try {
        const response = await fetch(`/api/ops/forms?id=${formId}`, { method: 'DELETE' })
        const data = await response.json()
        if (data.success) {
          setForms(forms.filter(f => f.id !== formId))
          console.log('✅ Form deleted')
        }
      } catch (error) {
        console.error('Error deleting form:', error)
      }
    }
  }

  const handleSaveForm = async (form: Partial<FormTemplate>) => {
    try {
      if (editingForm && editingForm.id) {
        // Update existing
        const response = await fetch('/api/ops/forms', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingForm.id, ...form })
        })
        const data = await response.json()
        if (data.success) {
          setForms(forms.map(f => f.id === editingForm.id ? { ...f, ...form } as FormTemplate : f))
          console.log('✅ Form updated')
        }
      } else {
        // Create new
        const response = await fetch('/api/ops/forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            agency_id: clients[0]?.agency_id
          })
        })
        const data = await response.json()
        if (data.success) {
          // Refetch forms
          const fetchResponse = await fetch('/api/ops/forms')
          const fetchData = await fetchResponse.json()
          if (fetchData.success) {
            setForms(fetchData.forms.map((f: any) => ({
              ...f,
              due_date: f.due_date ? new Date(f.due_date) : undefined,
              created_at: new Date(f.created_at),
              num_fields: f.fields?.length || 0,
              responses_count: 0,
              total_clients: f.assigned_client_names?.length || 0
            })))
          }
          console.log('✅ Form created')
        }
      }
      setShowCreateForm(false)
      setEditingForm(null)
    } catch (error) {
      console.error('Error saving form:', error)
      alert('Failed to save form')
    }
  }

  const handleImportToContentHub = (clientName: string, responseData: any) => {
    console.log('📥 Importing to Content Hub for:', clientName)
    console.log('Data:', responseData)
    
    // Mark as imported (in production, this would update database)
    if (mockResponses[clientName]) {
      mockResponses[clientName].imported = true
    }
    
    alert(`✅ Successfully imported ${clientName}'s responses to Content Hub!\n\nPopulated:\n• Brand Guidelines\n• Copy Notes\n• Design Notes\n\nGo to Content Hub to review.`)
  }

  return (
    <div className="space-y-6">
      {/* Forms Header */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl">Dynamic Forms</CardTitle>
              <div className="text-white/70 text-sm mt-1">
                Create questionnaires for clients to auto-populate Content Hub
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-500/30 hover:bg-blue-500/40 text-white rounded-lg transition-colors flex items-center gap-2 border border-blue-400/30"
            >
              <Plus className="h-4 w-4" />
              Create Form
            </button>
          </div>
        </CardHeader>
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20">
        {(['all', 'active', 'completed', 'draft'] as FormFilter[]).map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
              activeFilter === filter
                ? 'bg-white/30 text-white shadow-lg border border-white/40'
                : 'text-white/80 hover:text-white hover:bg-white/15'
            }`}
          >
            {filter}
            {filter !== 'all' && (
              <span className="ml-2 text-xs opacity-70">
                ({forms.filter(f => f.status === filter).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Forms List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredForms.map(form => (
          <Card key={form.id} className={`border-2 ${getCategoryColor(form.category)}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{form.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(form.status)}`}>
                      {form.status}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-300 capitalize">
                      {form.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{form.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{form.num_fields} fields</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{form.assigned_clients.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  {form.responses_count === form.total_clients ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-orange-400" />
                  )}
                  <span className="text-sm text-gray-700">
                    {form.responses_count}/{form.total_clients} responses
                  </span>
                </div>
                {form.due_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      Due {form.due_date.toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedForm(form)}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Eye className="h-3 w-3" />
                  View Responses
                </button>
                <button
                  onClick={() => {
                    setEditingForm(form)
                    setShowCreateForm(true)
                  }}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteForm(form.id)}
                  className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
                <button
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Download className="h-3 w-3" />
                  Export CSV
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredForms.length === 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-white/40" />
            <div className="text-white text-lg mb-2">
              {activeFilter === 'all' ? 'No Forms Yet' : `No ${activeFilter} forms`}
            </div>
            <div className="text-white/60 text-sm mb-4">
              Create custom forms to gather information from clients
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create Your First Form
            </button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <FormBuilderModal
          form={editingForm}
          clients={clients}
          templates={FORM_TEMPLATES}
          onSave={handleSaveForm}
          onClose={() => {
            setShowCreateForm(false)
            setEditingForm(null)
          }}
        />
      )}

      {/* Response Viewer Modal */}
      {selectedForm && !showCreateForm && !viewingResponse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">
                  {selectedForm.title} - Responses ({selectedForm.responses_count}/{selectedForm.total_clients})
                </CardTitle>
                <button 
                  onClick={() => setSelectedForm(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-3">
              {selectedForm.assigned_clients.map(clientName => {
                const response = mockResponses[clientName]
                const hasResponse = !!response
                
                return (
                  <Card key={clientName} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {clientName[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{clientName}</div>
                            {hasResponse ? (
                              <div className="text-sm text-green-600 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Submitted {response.submitted_at.toLocaleDateString()}
                              </div>
                            ) : (
                              <div className="text-sm text-orange-600 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Not yet completed
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {hasResponse ? (
                            <>
                              <button
                                onClick={() => setViewingResponse(clientName)}
                                className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                              >
                                View Response
                              </button>
                              {!response.imported && (
                                <button
                                  onClick={() => handleImportToContentHub(clientName, response.response_data)}
                                  className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors"
                                >
                                  Import to Content Hub
                                </button>
                              )}
                              {response.imported && (
                                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">
                                  ✓ Imported
                                </span>
                              )}
                            </>
                          ) : (
                            <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                              Send Reminder
                            </button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Individual Response Viewer */}
      {viewingResponse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-white w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">
                  {viewingResponse}'s Response
                </CardTitle>
                <button 
                  onClick={() => setViewingResponse(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedForm && Object.entries(mockResponses[viewingResponse]?.response_data || {}).map(([fieldId, answer]) => {
                const field = selectedForm.fields.find((f: FormField) => f.id === fieldId)
                if (!field) return null

                return (
                  <div key={fieldId} className="border-b border-gray-200 pb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">{field.label}</div>
                    <div className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                      {String(answer || '(No answer)')}
                    </div>
                  </div>
                )
              })}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setViewingResponse(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                >
                  Close
                </button>
                {!mockResponses[viewingResponse]?.imported && (
                  <button
                    onClick={() => {
                      handleImportToContentHub(viewingResponse, mockResponses[viewingResponse].response_data)
                      setViewingResponse(null)
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Import to Content Hub
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

