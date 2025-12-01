'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Target,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Circle,
  Loader2,
  Archive,
  TrendingUp,
  X,
  Save,
  Calendar,
  Clock
} from 'lucide-react'

interface Initiative {
  id?: string
  phase: '30' | '60' | '90'
  title: string
  description: string
  phase_focus: string
  target_metric: string
  status: 'not_started' | 'strategy' | 'in_progress' | 'awaiting_approval' | 'completed'
  current_progress: string
  order_index: number
}

interface Plan {
  id: string
  client_id: string
  plan_name: string
  description: string
  start_date: string
  end_date: string
  status: string
  totalInitiatives: number
  completedInitiatives: number
  inProgressInitiatives: number
  initiatives: Initiative[]
}

interface StrategicPlansManagerProps {
  clients: any[]
  selectedClient: string
  agencyId: string
}

export function StrategicPlansManager({ clients, selectedClient, agencyId }: StrategicPlansManagerProps) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    client_id: '',
    plan_name: '',
    description: '',
    start_date: '',
    end_date: ''
  })

  const [initiatives30, setInitiatives30] = useState<Initiative[]>([])
  const [initiatives60, setInitiatives60] = useState<Initiative[]>([])
  const [initiatives90, setInitiatives90] = useState<Initiative[]>([])
  const [phase30Focus, setPhase30Focus] = useState('')
  const [phase60Focus, setPhase60Focus] = useState('')
  const [phase90Focus, setPhase90Focus] = useState('')
  const [phase30Label, setPhase30Label] = useState('FIRST 30 DAYS')
  const [phase60Label, setPhase60Label] = useState('NEXT 60 DAYS')
  const [phase90Label, setPhase90Label] = useState('FINAL 90 DAYS')

  useEffect(() => {
    if (agencyId) {
      loadPlans()
    }
  }, [agencyId, selectedClient])

  const loadPlans = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/ops/strategic-plans?agencyId=${agencyId}&clientId=${selectedClient}`)
      const data = await response.json()

      if (data.success) {
        setPlans(data.plans || [])
      }
    } catch (error) {
      console.error('Error loading plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      client_id: selectedClient !== 'all' ? selectedClient : '',
      plan_name: '',
      description: '',
      start_date: '',
      end_date: ''
    })
    setInitiatives30([])
    setInitiatives60([])
    setInitiatives90([])
    setPhase30Focus('')
    setPhase60Focus('')
    setPhase90Focus('')
    setPhase30Label('FIRST 30 DAYS')
    setPhase60Label('NEXT 60 DAYS')
    setPhase90Label('FINAL 90 DAYS')
    setEditingPlan(null)
  }

  const handleCreate = () => {
    resetForm()
    setShowModal(true)
  }

  const handleEdit = (plan: Plan) => {
    setFormData({
      client_id: plan.client_id,
      plan_name: plan.plan_name,
      description: plan.description || '',
      start_date: plan.start_date,
      end_date: plan.end_date
    })

    const phase30Inits = plan.initiatives.filter(i => i.phase === '30')
    const phase60Inits = plan.initiatives.filter(i => i.phase === '60')
    const phase90Inits = plan.initiatives.filter(i => i.phase === '90')

    setInitiatives30(phase30Inits)
    setInitiatives60(phase60Inits)
    setInitiatives90(phase90Inits)
    setPhase30Focus(phase30Inits[0]?.phase_focus || '')
    setPhase60Focus(phase60Inits[0]?.phase_focus || '')
    setPhase90Focus(phase90Inits[0]?.phase_focus || '')
    
    // Load phase labels from plan
    setPhase30Label((plan as any).phase30_label || 'FIRST 30 DAYS')
    setPhase60Label((plan as any).phase60_label || 'NEXT 60 DAYS')
    setPhase90Label((plan as any).phase90_label || 'FINAL 90 DAYS')

    setEditingPlan(plan)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Combine all initiatives
      const allInitiatives = [
        ...initiatives30.map(i => ({ ...i, phase: '30', phase_focus: phase30Focus })),
        ...initiatives60.map(i => ({ ...i, phase: '60', phase_focus: phase60Focus })),
        ...initiatives90.map(i => ({ ...i, phase: '90', phase_focus: phase90Focus }))
      ]

      if (editingPlan) {
        // Update plan
        await fetch('/api/ops/strategic-plans', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingPlan.id,
            ...formData,
            phase30_label: phase30Label,
            phase60_label: phase60Label,
            phase90_label: phase90Label
          })
        })

        // Delete existing initiatives
        for (const init of editingPlan.initiatives) {
          await fetch(`/api/plan-initiatives?id=${init.id}`, { method: 'DELETE' })
        }

        // Create new initiatives
        for (const init of allInitiatives) {
          await fetch('/api/plan-initiatives', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              plan_id: editingPlan.id,
              ...init
            })
          })
        }
      } else {
        // Create plan
        const response = await fetch('/api/ops/strategic-plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            agency_id: agencyId,
            phase30_label: phase30Label,
            phase60_label: phase60Label,
            phase90_label: phase90Label,
            initiatives: allInitiatives
          })
        })

        if (!response.ok) {
          throw new Error('Failed to create plan')
        }
      }

      setShowModal(false)
      resetForm()
      loadPlans()
    } catch (error) {
      console.error('Error saving plan:', error)
      alert('Failed to save plan')
    }
  }

  const handleDelete = async (planId: string) => {
    if (!confirm('Delete this strategic plan? All initiatives will also be deleted.')) {
      return
    }

    try {
      const response = await fetch(`/api/ops/strategic-plans?id=${planId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadPlans()
      }
    } catch (error) {
      console.error('Error deleting plan:', error)
    }
  }

  const handleUpdateInitiativeStatus = async (planId: string, initiativeId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/plan-initiatives', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: initiativeId,
          status: newStatus
        })
      })

      if (response.ok) {
        loadPlans()
      }
    } catch (error) {
      console.error('Error updating initiative status:', error)
    }
  }

  const addInitiative = (phase: '30' | '60' | '90') => {
    const newInitiative: Initiative = {
      phase,
      title: '',
      description: '',
      phase_focus: '',
      target_metric: '',
      status: 'not_started',
      current_progress: '',
      order_index: 0
    }

    if (phase === '30') {
      setInitiatives30([...initiatives30, newInitiative])
    } else if (phase === '60') {
      setInitiatives60([...initiatives60, newInitiative])
    } else {
      setInitiatives90([...initiatives90, newInitiative])
    }
  }

  const removeInitiative = (phase: '30' | '60' | '90', index: number) => {
    if (phase === '30') {
      setInitiatives30(initiatives30.filter((_, i) => i !== index))
    } else if (phase === '60') {
      setInitiatives60(initiatives60.filter((_, i) => i !== index))
    } else {
      setInitiatives90(initiatives90.filter((_, i) => i !== index))
    }
  }

  const updateInitiative = (phase: '30' | '60' | '90', index: number, field: string, value: any) => {
    const updateArray = (arr: Initiative[]) => {
      const newArr = [...arr]
      newArr[index] = { ...newArr[index], [field]: value }
      return newArr
    }

    if (phase === '30') {
      setInitiatives30(updateArray(initiatives30))
    } else if (phase === '60') {
      setInitiatives60(updateArray(initiatives60))
    } else {
      setInitiatives90(updateArray(initiatives90))
    }
  }

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.brand_name || 'Unknown Client'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'awaiting_approval':
        return <Clock className="h-4 w-4 text-orange-400" />
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-blue-400" />
      case 'strategy':
        return <Target className="h-4 w-4 text-purple-400" />
      case 'not_started':
        return <Circle className="h-4 w-4 text-gray-400" />
      default:
        return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-400/30'
      case 'awaiting_approval':
        return 'bg-orange-500/20 text-orange-300 border-orange-400/30'
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30'
      case 'strategy':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/30'
      case 'not_started':
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30'
    }
  }

  const renderInitiativeForm = (phase: '30' | '60' | '90', initiatives: Initiative[], setInitiatives: (inits: Initiative[]) => void, focus: string, setFocus: (f: string) => void, phaseLabel: string) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-900 mb-1">{phaseLabel}</h4>
          <input
            type="text"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="Phase focus (e.g., List Growth & Engagement)"
            className="px-2 py-1 text-sm border border-gray-300 rounded w-full text-gray-900"
          />
        </div>
        <button
          type="button"
          onClick={() => addInitiative(phase)}
          className="text-sm px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 ml-2"
        >
          + Add Initiative
        </button>
      </div>

      {initiatives.map((init, index) => (
        <div key={index} className="p-3 border border-gray-300 rounded-lg bg-gray-50 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={init.title}
              onChange={(e) => updateInitiative(phase, index, 'title', e.target.value)}
              placeholder="Initiative title"
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded text-gray-900"
            />
            <select
              value={init.status}
              onChange={(e) => updateInitiative(phase, index, 'status', e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 rounded text-gray-900"
            >
              <option value="not_started">Not Started</option>
              <option value="strategy">Strategy</option>
              <option value="in_progress">In Progress</option>
              <option value="awaiting_approval">Awaiting Approval</option>
              <option value="completed">Completed</option>
            </select>
            <button
              type="button"
              onClick={() => removeInitiative(phase, index)}
              className="p-1 text-red-600 hover:bg-red-100 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <input
            type="text"
            value={init.description}
            onChange={(e) => updateInitiative(phase, index, 'description', e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-gray-900"
          />
          <input
            type="text"
            value={init.target_metric}
            onChange={(e) => updateInitiative(phase, index, 'target_metric', e.target.value)}
            placeholder="Target metric (e.g., 500 new subscribers)"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-gray-900"
          />
        </div>
      ))}
    </div>
  )

  const filteredPlans = selectedClient === 'all'
    ? plans
    : plans.filter(p => p.client_id === selectedClient)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-2xl font-bold">30/60/90 Day Plans</h2>
          <p className="text-white/60 text-sm mt-1">
            Create and manage strategic plans for clients
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors border border-blue-400/30 font-medium"
        >
          <Plus className="h-4 w-4" />
          Create Plan
        </button>
      </div>

      {/* Plans List */}
      {filteredPlans.length === 0 ? (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-12 text-center">
            <Target className="h-16 w-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-white text-xl font-bold mb-2">No Strategic Plans Yet</h3>
            <p className="text-white/60 text-sm mb-6">
              Create 30/60/90 day plans to guide client strategy and track progress
            </p>
            <button
              onClick={handleCreate}
              className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors border border-blue-400/30 font-medium"
            >
              Create Your First Plan
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPlans.map((plan) => (
            <Card key={plan.id} className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader className="border-b border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-xl font-bold flex items-center gap-3">
                      <Target className="h-5 w-5 text-blue-300" />
                      {plan.plan_name}
                    </CardTitle>
                    <p className="text-white/60 text-sm mt-1">
                      {getClientName(plan.client_id)} • {new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}
                    </p>
                    {plan.description && (
                      <p className="text-white/50 text-sm mt-2">{plan.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right bg-white/10 rounded-lg px-4 py-2 border border-white/20">
                      <p className="text-white/70 text-xs">Progress</p>
                      <p className="text-white text-xl font-bold">
                        {plan.totalInitiatives > 0 
                          ? Math.round((plan.completedInitiatives / plan.totalInitiatives) * 100)
                          : 0}%
                      </p>
                      <p className="text-white/50 text-xs">
                        {plan.completedInitiatives}/{plan.totalInitiatives}
                      </p>
                    </div>
                    <button
                      onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                      className="p-2 bg-white/10 hover:bg-white/20 text-white/70 rounded-lg transition-colors"
                      title="Toggle Details"
                    >
                      <TrendingUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(plan)}
                      className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
                      title="Edit Plan"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                      title="Delete Plan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>

              {/* Expanded View */}
              {expandedPlan === plan.id && (
                <CardContent className="p-6 space-y-6">
                  {['30', '60', '90'].map((phase) => {
                    const phaseInitiatives = plan.initiatives.filter(i => i.phase === phase)
                    const completed = phaseInitiatives.filter(i => i.status === 'completed').length
                    const progress = phaseInitiatives.length > 0 
                      ? Math.round((completed / phaseInitiatives.length) * 100)
                      : 0

                    return (
                      <div key={phase} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-white font-semibold">
                            {phase === '30' && 'FIRST 30 DAYS'}
                            {phase === '60' && 'NEXT 60 DAYS'}
                            {phase === '90' && 'FINAL 90 DAYS'}
                          </h4>
                          <span className="text-white/70 text-sm">{progress}% Complete</span>
                        </div>

                        {phaseInitiatives.length === 0 ? (
                          <p className="text-white/40 text-sm italic">No initiatives in this phase</p>
                        ) : (
                          <div className="space-y-2">
                            {phaseInitiatives.map((init) => (
                              <div
                                key={init.id}
                                className={`p-3 rounded-lg border ${
                                  init.status === 'completed'
                                    ? 'bg-green-500/10 border-green-400/30'
                                    : init.status === 'in_progress'
                                    ? 'bg-blue-500/10 border-blue-400/30'
                                    : 'bg-white/5 border-white/10'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  {getStatusIcon(init.status)}
                                  <div className="flex-1">
                                    <p className="text-white/90 text-sm font-medium">{init.title}</p>
                                    {init.description && (
                                      <p className="text-white/50 text-xs mt-1">{init.description}</p>
                                    )}
                                  </div>
                                  <select
                                    value={init.status}
                                    onChange={(e) => init.id && handleUpdateInitiativeStatus(plan.id, init.id, e.target.value)}
                                    className={`px-2 py-1 text-xs rounded border ${getStatusClass(init.status)}`}
                                  >
                                    <option value="not_started">Not Started</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                  </select>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto bg-white">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Target className="h-5 w-5" />
                  {editingPlan ? 'Edit Strategic Plan' : 'Create 30/60/90 Day Plan'}
                </CardTitle>
                <button
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="p-1 hover:bg-gray-200 rounded text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="p-6 space-y-6">
                {/* Plan Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Client *
                    </label>
                    <select
                      value={formData.client_id}
                      onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.brand_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Plan Name *
                    </label>
                    <input
                      type="text"
                      value={formData.plan_name}
                      onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                      placeholder="Q1 2026 Growth Strategy"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Overall plan description and goals..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="border-t pt-6 space-y-6">
                  <div>
                    <input
                      type="text"
                      value={phase30Label}
                      onChange={(e) => setPhase30Label(e.target.value)}
                      placeholder="Phase 1 Label"
                      className="w-full px-3 py-2 border-2 border-blue-300 rounded-md font-semibold text-gray-900 mb-3 bg-blue-50"
                    />
                    {renderInitiativeForm('30', initiatives30, setInitiatives30, phase30Focus, setPhase30Focus, phase30Label)}
                  </div>
                  <div className="border-t" />
                  <div>
                    <input
                      type="text"
                      value={phase60Label}
                      onChange={(e) => setPhase60Label(e.target.value)}
                      placeholder="Phase 2 Label"
                      className="w-full px-3 py-2 border-2 border-purple-300 rounded-md font-semibold text-gray-900 mb-3 bg-purple-50"
                    />
                    {renderInitiativeForm('60', initiatives60, setInitiatives60, phase60Focus, setPhase60Focus, phase60Label)}
                  </div>
                  <div className="border-t" />
                  <div>
                    <input
                      type="text"
                      value={phase90Label}
                      onChange={(e) => setPhase90Label(e.target.value)}
                      placeholder="Phase 3 Label"
                      className="w-full px-3 py-2 border-2 border-pink-300 rounded-md font-semibold text-gray-900 mb-3 bg-pink-50"
                    />
                    {renderInitiativeForm('90', initiatives90, setInitiatives90, phase90Focus, setPhase90Focus, phase90Label)}
                  </div>
                </div>
              </CardContent>

              <div className="flex gap-3 p-6 border-t bg-gray-50">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  <Save className="h-4 w-4" />
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}

