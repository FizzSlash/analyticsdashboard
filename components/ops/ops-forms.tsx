'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Download
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

export function OpsForms({ clients, selectedClient }: OpsFormsProps) {
  const [activeFilter, setActiveFilter] = useState<FormFilter>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null)

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

  const handleDeleteForm = (formId: string) => {
    if (confirm('Delete this form? This will also delete all responses.')) {
      setForms(forms.filter(f => f.id !== formId))
      console.log('🗑️ Form deleted')
    }
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
                    setSelectedForm(form)
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

      {/* Create/Edit Form Modal - Coming in Task 66 */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-white w-full max-w-4xl shadow-2xl">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">Create New Form</CardTitle>
                <button 
                  onClick={() => {
                    setShowCreateForm(false)
                    setSelectedForm(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12 text-gray-600">
                Form builder coming in Task 66-67...
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setShowCreateForm(false)
                      setSelectedForm(null)
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Response Viewer Modal - Coming in Task 69 */}
      {selectedForm && !showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-white w-full max-w-4xl shadow-2xl">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">
                  {selectedForm.title} - Responses
                </CardTitle>
                <button 
                  onClick={() => setSelectedForm(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12 text-gray-600">
                Response viewer coming in Task 69...
                <div className="mt-4 text-sm">
                  {selectedForm.responses_count} of {selectedForm.total_clients} clients have responded
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setSelectedForm(null)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

