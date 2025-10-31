'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  X,
  Save,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Sparkles
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

interface FormBuilderModalProps {
  form: any | null
  clients: any[]
  templates: any
  onSave: (form: any) => void
  onClose: () => void
}

export function FormBuilderModal({ form, clients, templates, onSave, onClose }: FormBuilderModalProps) {
  const [formData, setFormData] = useState({
    title: form?.title || '',
    description: form?.description || '',
    category: form?.category || 'custom',
    fields: form?.fields || [],
    assigned_clients: form?.assigned_clients || [],
    due_date: form?.due_date || null,
    status: form?.status || 'draft'
  })

  const [showTemplates, setShowTemplates] = useState(!form && formData.fields.length === 0)

  const loadTemplate = (templateKey: string) => {
    const template = templates[templateKey]
    if (template) {
      setFormData({
        ...formData,
        title: template.title,
        description: template.description,
        category: template.category,
        fields: template.fields.map((f: any) => ({ ...f, id: `field-${Date.now()}-${Math.random()}` }))
      })
      setShowTemplates(false)
    }
  }

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type,
      label: '',
      required: false,
      options: type === 'select' || type === 'radio' ? ['Option 1'] : undefined
    }
    setFormData({ ...formData, fields: [...formData.fields, newField] })
  }

  const updateField = (index: number, updates: Partial<FormField>) => {
    const updated = [...formData.fields]
    updated[index] = { ...updated[index], ...updates }
    setFormData({ ...formData, fields: updated })
  }

  const removeField = (index: number) => {
    setFormData({ ...formData, fields: formData.fields.filter((_: any, i: number) => i !== index) })
  }

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const updated = [...formData.fields]
      ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
      setFormData({ ...formData, fields: updated })
    } else if (direction === 'down' && index < formData.fields.length - 1) {
      const updated = [...formData.fields]
      ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
      setFormData({ ...formData, fields: updated })
    }
  }

  const addOption = (fieldIndex: number) => {
    const updated = [...formData.fields]
    const field = updated[fieldIndex]
    if (field.options) {
      field.options = [...field.options, `Option ${field.options.length + 1}`]
      setFormData({ ...formData, fields: updated })
    }
  }

  const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const updated = [...formData.fields]
    const field = updated[fieldIndex]
    if (field.options) {
      field.options[optionIndex] = value
      setFormData({ ...formData, fields: updated })
    }
  }

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const updated = [...formData.fields]
    const field = updated[fieldIndex]
    if (field.options && field.options.length > 1) {
      field.options = field.options.filter((_: string, i: number) => i !== optionIndex)
      setFormData({ ...formData, fields: updated })
    }
  }

  const toggleClient = (clientName: string) => {
    if (formData.assigned_clients.includes(clientName)) {
      setFormData({
        ...formData,
        assigned_clients: formData.assigned_clients.filter((c: string) => c !== clientName)
      })
    } else {
      setFormData({
        ...formData,
        assigned_clients: [...formData.assigned_clients, clientName]
      })
    }
  }

  const handleSubmit = () => {
    if (!formData.title || formData.fields.length === 0) {
      alert('Please add a title and at least one field')
      return
    }
    if (formData.assigned_clients.length === 0) {
      alert('Please assign to at least one client')
      return
    }
    onSave(formData)
  }

  if (showTemplates) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card className="bg-white w-full max-w-3xl shadow-2xl">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Choose a Template</CardTitle>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {Object.entries(templates).map(([key, template]: [string, any]) => (
              <button
                key={key}
                onClick={() => loadTemplate(key)}
                className="w-full p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-left transition-all"
              >
                <div className="font-semibold text-gray-900 mb-1">{template.title}</div>
                <div className="text-sm text-gray-600 mb-2">{template.description}</div>
                <div className="text-xs text-gray-500">{template.fields.length} fields • {template.category}</div>
              </button>
            ))}
            <button
              onClick={() => setShowTemplates(false)}
              className="w-full p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 rounded-lg text-center transition-all"
            >
              <div className="font-semibold text-blue-900">Start from Scratch</div>
              <div className="text-sm text-blue-700">Build a custom form</div>
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900">
              {form ? 'Edit Form' : 'Create New Form'}
            </CardTitle>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-2">
          {/* Left: Form Settings */}
          <div className="overflow-y-auto p-6 border-r border-gray-200 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Form Details</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Form Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Client Onboarding"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    placeholder="Brief description of this form..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="onboarding">Onboarding</option>
                    <option value="strategy">Strategy</option>
                    <option value="monthly">Monthly</option>
                    <option value="brief">Campaign Brief</option>
                    <option value="demographic">Demographic</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Assign to Clients *</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto border border-gray-200 rounded-lg p-3">
                {clients.map((client: any) => (
                  <label key={client.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={formData.assigned_clients.includes(client.brand_name)}
                      onChange={() => toggleClient(client.brand_name)}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">{client.brand_name}</span>
                  </label>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {formData.assigned_clients.length} clients selected
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Optional Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date ? new Date(formData.due_date).toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value ? new Date(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft (save but don't send)</option>
                    <option value="active">Active (send to clients)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Field Builder */}
          <div className="overflow-y-auto p-6 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Form Fields ({formData.fields.length})</h3>
              <div className="relative">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addField(e.target.value as FormField['type'])
                      e.target.value = ''
                    }
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium cursor-pointer appearance-none pr-8"
                  defaultValue=""
                >
                  <option value="" disabled>+ Add Field</option>
                  <option value="text">Text Input</option>
                  <option value="textarea">Text Area</option>
                  <option value="select">Dropdown</option>
                  <option value="checkbox">Checkboxes</option>
                  <option value="radio">Radio Buttons</option>
                  <option value="date">Date Picker</option>
                  <option value="email">Email</option>
                  <option value="number">Number</option>
                </select>
              </div>
            </div>

            {formData.fields.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-lg mb-2">No fields yet</div>
                <div className="text-sm">Add fields using the dropdown above</div>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.fields.map((field: FormField, index: number) => (
                  <Card key={field.id} className="border border-gray-300">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500">#{index + 1}</span>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => updateField(index, { label: e.target.value })}
                              placeholder="Field Label"
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm font-medium"
                            />
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded capitalize">{field.type}</span>
                          </div>

                          {(field.type === 'text' || field.type === 'textarea' || field.type === 'email' || field.type === 'number') && (
                            <input
                              type="text"
                              value={field.placeholder || ''}
                              onChange={(e) => updateField(index, { placeholder: e.target.value })}
                              placeholder="Placeholder text..."
                              className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                            />
                          )}

                          {field.description !== undefined && (
                            <input
                              type="text"
                              value={field.description || ''}
                              onChange={(e) => updateField(index, { description: e.target.value })}
                              placeholder="Help text (optional)..."
                              className="w-full px-2 py-1 border border-gray-200 rounded text-xs text-gray-600"
                            />
                          )}

                          {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && field.options && (
                            <div className="space-y-1">
                              {field.options.map((option: string, optIndex: number) => (
                                <div key={optIndex} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateOption(index, optIndex, e.target.value)}
                                    className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm"
                                  />
                                  {field.options && field.options.length > 1 && (
                                    <button
                                      onClick={() => removeOption(index, optIndex)}
                                      className="p-1 text-gray-400 hover:text-red-600"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                              <button
                                onClick={() => addOption(index)}
                                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                              >
                                <Plus className="h-3 w-3" />
                                Add Option
                              </button>
                            </div>
                          )}

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateField(index, { required: e.target.checked })}
                              className="rounded border-gray-300 text-blue-600"
                            />
                            <span className="text-xs text-gray-700">Required field</span>
                          </label>
                        </div>

                        <div className="flex flex-col gap-1 ml-2">
                          <button
                            onClick={() => moveField(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30"
                          >
                            <MoveUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => moveField(index, 'down')}
                            disabled={index === formData.fields.length - 1}
                            className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30"
                          >
                            <MoveDown className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeField(index)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {formData.fields.length > 0 && (
              <button
                onClick={() => setShowTemplates(true)}
                className="w-full mt-4 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Load from Template
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {formData.fields.length} fields • {formData.assigned_clients.length} clients
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {formData.status === 'active' ? 'Save & Send to Clients' : 'Save as Draft'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

