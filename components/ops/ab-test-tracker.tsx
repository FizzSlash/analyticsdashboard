'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Target
} from 'lucide-react'

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
  const [showCreateTest, setShowCreateTest] = useState(false)
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null)
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
    if (confirm('Delete this A/B test and all results?')) {
      setTests(tests.filter(t => t.id !== testId))
      console.log('🗑️ Test deleted')
    }
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

      {/* Filter Tabs */}
      <div className="flex gap-2 p-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20">
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

      {/* Tests List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTests.map(test => {
          return (
            <Card 
              key={test.id} 
              className="bg-white border-2 border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedTest(test)}
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

      {/* Test Detail/Create Modal - Coming in Tasks 47-52 */}
      {(showCreateTest || selectedTest) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">
                  {selectedTest ? selectedTest.test_name : 'Create New A/B Test'}
                </CardTitle>
                <button 
                  onClick={() => {
                    setShowCreateTest(false)
                    setSelectedTest(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6">
              <div className="text-center py-12 text-gray-600">
                Test detail view and creation wizard coming in Tasks 47-52...
                <div className="mt-4 text-sm">
                  Will include: Test config, variant builder, results analysis, winner declaration, insights
                </div>
                <button
                  onClick={() => {
                    setShowCreateTest(false)
                    setSelectedTest(null)
                  }}
                  className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
                >
                  Close
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

