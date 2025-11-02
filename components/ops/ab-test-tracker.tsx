'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ABTestDetailModal } from './ab-test-detail-modal'
import { 
  TestTube,
  Plus,
  Eye,
  Edit,
  Trash2,
  Trophy,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Save,
  Target,
  LayoutGrid,
  Columns
} from 'lucide-react'

type ViewMode = 'list' | 'pipeline'

interface ABTest {
  id: string
  client_id: string
  client_name: string
  client_color: string
  test_name: string
  test_type: 'subject_line' | 'content' | 'send_time' | 'from_name' | 'offer' | 'design'
  status: 'strategy' | 'in_progress' | 'implementation' | 'finalized'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  start_date?: Date
  winner?: string
  notes?: string
  num_variants: number
}

interface ABTestTrackerProps {
  clients: any[]
  selectedClient: string
  campaigns: any[]
}

export function ABTestTracker({ clients, selectedClient, campaigns }: ABTestTrackerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [showCreateTest, setShowCreateTest] = useState(false)
  const [editingTest, setEditingTest] = useState<ABTest | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'strategy' | 'in_progress' | 'implementation' | 'finalized'>('all')

  // Mock A/B tests (will be from database later)
  const [tests, setTests] = useState<ABTest[]>([
    {
      id: '1',
      client_id: clients[0]?.id || '1',
      client_name: clients[0]?.brand_name || 'Hydrus',
      client_color: clients[0]?.primary_color || '#3B82F6',
      test_name: 'Black Friday Subject Line Test',
      test_type: 'subject_line',
      status: 'finalized',
      priority: 'high',
      start_date: new Date(2025, 10, 24),
      winner: 'Variant B: "Limited Time - 50% OFF"',
      notes: 'Urgency language outperformed by 12%. Use this approach for future sales.',
      num_variants: 2
    },
    {
      id: '2',
      client_id: clients[1]?.id || '2',
      client_name: clients[1]?.brand_name || 'Peak Design',
      client_color: clients[1]?.primary_color || '#10B981',
      test_name: 'Send Time Optimization',
      test_type: 'send_time',
      status: 'in_progress',
      priority: 'normal',
      start_date: new Date(2025, 11, 1),
      num_variants: 3
    },
    {
      id: '3',
      client_id: clients[2]?.id || '3',
      client_name: clients[2]?.brand_name || 'Make Waves',
      client_color: clients[2]?.primary_color || '#8B5CF6',
      test_name: 'Email Content - Short vs Long',
      test_type: 'content',
      status: 'strategy',
      priority: 'normal',
      num_variants: 2
    },
    {
      id: '4',
      client_id: clients[0]?.id || '1',
      client_name: clients[0]?.brand_name || 'Hydrus',
      client_color: clients[0]?.primary_color || '#3B82F6',
      test_name: 'Product Images Test',
      test_type: 'design',
      status: 'implementation',
      priority: 'urgent',
      start_date: new Date(2025, 10, 28),
      num_variants: 2
    }
  ])

  // Filter tests
  const filteredTests = tests.filter(test => {
    if (selectedClient !== 'all' && test.client_id !== selectedClient) return false
    if (activeFilter !== 'all' && test.status !== activeFilter) return false
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'strategy': return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'implementation': return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'finalized': return 'bg-green-100 text-green-700 border-green-300'
      default: return 'bg-gray-100 text-gray-600 border-gray-300'
    }
  }

  const getTestTypeLabel = (type: string) => {
    switch (type) {
      case 'subject_line': return 'Subject Line'
      case 'content': return 'Content'
      case 'send_time': return 'Send Time'
      case 'from_name': return 'From Name'
      case 'offer': return 'Offer'
      case 'design': return 'Design'
      default: return type
    }
  }

  const getPriorityEmoji = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🔴'
      case 'high': return '🟡'
      default: return ''
    }
  }

  const handleDeleteTest = (testId: string) => {
    if (confirm('Delete this A/B test?')) {
      setTests(tests.filter(t => t.id !== testId))
      console.log('🗑️ Test deleted')
    }
  }

  const handleSaveTest = (testData: Partial<ABTest>) => {
    if (editingTest && editingTest.id) {
      // Update existing
      setTests(tests.map(t => t.id === editingTest.id ? { ...t, ...testData } as ABTest : t))
      console.log('✅ Test updated')
    } else {
      // Create new
      const newTest: ABTest = {
        id: `test-${Date.now()}`,
        ...testData as ABTest
      }
      setTests([newTest, ...tests])
      console.log('✅ Test created')
    }
    setShowCreateTest(false)
    setEditingTest(null)
  }

  // Group tests by status for pipeline view
  const testsByStatus = {
    strategy: filteredTests.filter(t => t.status === 'strategy'),
    in_progress: filteredTests.filter(t => t.status === 'in_progress'),
    implementation: filteredTests.filter(t => t.status === 'implementation'),
    finalized: filteredTests.filter(t => t.status === 'finalized')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                A/B Test Tracker
              </CardTitle>
              <div className="text-white/70 text-sm mt-1">
                Track test performance and declare winners
              </div>
            </div>
            <button
              onClick={() => setShowCreateTest(true)}
              className="px-4 py-2 bg-blue-500/30 hover:bg-blue-500/40 text-white rounded-lg transition-colors flex items-center gap-2 border border-blue-400/30"
            >
              <Plus className="h-4 w-4" />
              Create Test
            </button>
          </div>
        </CardHeader>
      </Card>

      {/* View Toggle & Filters */}
      <div className="flex items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 p-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 flex-1">
          {(['all', 'strategy', 'in_progress', 'implementation', 'finalized'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeFilter === filter
                  ? 'bg-white/30 text-white shadow-lg border border-white/40'
                  : 'text-white/80 hover:text-white hover:bg-white/15'
              }`}
            >
              {filter === 'all' ? 'All' : filter === 'in_progress' ? 'In Progress' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              <span className="ml-2 text-xs opacity-70">
                ({tests.filter(t => filter === 'all' || t.status === filter).length})
              </span>
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="inline-flex gap-2 p-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-white/30 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <LayoutGrid className="h-4 w-4 inline mr-2" />
            List View
          </button>
          <button
            onClick={() => setViewMode('pipeline')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              viewMode === 'pipeline'
                ? 'bg-white/30 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Columns className="h-4 w-4 inline mr-2" />
            Pipeline View
          </button>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 gap-4">
        {filteredTests.map(test => {
          return (
            <Card 
              key={test.id} 
              className="bg-white border-2 border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => setEditingTest(test)}
              style={{ borderLeftColor: test.client_color, borderLeftWidth: '4px' }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        {getPriorityEmoji(test.priority)}
                        {test.test_name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(test.status)}`}>
                        {test.status === 'in_progress' ? 'In Progress' : test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-3">
                      <span>{test.client_name}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-xs">
                        {getTestTypeLabel(test.test_type)}
                      </span>
                      <span>•</span>
                      <span>{test.num_variants} variants</span>
                      {test.start_date && (
                        <>
                          <span>•</span>
                          <span>{test.start_date.toLocaleDateString()}</span>
                        </>
                      )}
                    </div>

                    {/* Winner Info */}
                    {test.winner && test.status === 'finalized' && (
                      <div className="mt-3 flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                        <Trophy className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-semibold text-green-900">Winner: {test.winner}</div>
                          {test.notes && (
                            <div className="text-xs text-green-700 mt-1">{test.notes}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteTest(test.id)
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          )
        })}
        </div>
      )}

      {/* Pipeline View */}
      {viewMode === 'pipeline' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {[
              { id: 'strategy', label: 'Strategy', color: 'bg-gray-500/20 border-gray-400/30' },
              { id: 'in_progress', label: 'In Progress', color: 'bg-blue-500/20 border-blue-400/30' },
              { id: 'implementation', label: 'Implementation', color: 'bg-purple-500/20 border-purple-400/30' },
              { id: 'finalized', label: 'Finalized', color: 'bg-green-500/20 border-green-400/30' }
            ].map(column => {
              const columnTests = testsByStatus[column.id as keyof typeof testsByStatus]
              
              return (
                <div key={column.id} className="flex-shrink-0 w-[300px]">
                  <Card className={`${column.color} backdrop-blur-md border shadow-lg mb-3`}>
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-sm font-bold">
                          {column.label}
                        </CardTitle>
                        <div className="bg-white/20 px-2 py-1 rounded-full text-white text-xs font-bold">
                          {columnTests.length}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  <div className="min-h-[400px] bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 space-y-3">
                    {columnTests.length === 0 ? (
                      <div className="text-white/40 text-center py-8 text-sm">
                        No tests in {column.label}
                      </div>
                    ) : (
                      columnTests.map(test => (
                        <div
                          key={test.id}
                          onClick={() => setEditingTest(test)}
                          className="p-3 bg-white rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                          style={{ borderLeftColor: test.client_color }}
                        >
                          <div className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1">
                            {getPriorityEmoji(test.priority)}
                            {test.test_name}
                          </div>
                          <div className="text-xs text-gray-600 mb-2">{test.client_name}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                              {getTestTypeLabel(test.test_type)}
                            </span>
                            <span className="text-xs text-gray-500">{test.num_variants} variants</span>
                          </div>
                          {test.winner && (
                            <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              Winner declared
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {filteredTests.length === 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-12 text-center">
            <TestTube className="h-16 w-16 mx-auto mb-4 text-white/40" />
            <div className="text-white text-lg mb-2">No A/B Tests Yet</div>
            <div className="text-white/60 text-sm mb-4">
              Create tests to optimize your email campaigns
            </div>
            <button
              onClick={() => setShowCreateTest(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create Your First Test
            </button>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-4">
            <div className="text-white/70 text-sm">Total Tests</div>
            <div className="text-2xl font-bold text-white">{tests.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-4">
            <div className="text-white/70 text-sm">In Progress</div>
            <div className="text-2xl font-bold text-blue-400">
              {tests.filter(t => t.status === 'in_progress' || t.status === 'implementation').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-4">
            <div className="text-white/70 text-sm">Finalized</div>
            <div className="text-2xl font-bold text-green-400">
              {tests.filter(t => t.status === 'finalized').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-4">
            <div className="text-white/70 text-sm">Urgent</div>
            <div className="text-2xl font-bold text-orange-400">
              {tests.filter(t => t.priority === 'urgent' || t.priority === 'high').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Detail/Create Modal */}
      {(showCreateTest || editingTest) && (
        <ABTestDetailModal
          test={editingTest}
          clients={clients}
          onSave={handleSaveTest}
          onClose={() => {
            setShowCreateTest(false)
            setEditingTest(null)
          }}
        />
      )}
    </div>
  )
}

