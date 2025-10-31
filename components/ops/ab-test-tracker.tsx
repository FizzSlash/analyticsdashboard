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
  test_name: string
  test_type: 'subject_line' | 'content' | 'send_time' | 'from_name' | 'offer'
  status: 'draft' | 'running' | 'completed' | 'paused'
  start_date?: Date
  end_date?: Date
  winner_variant?: string
  confidence_score?: number
  insights?: string
  variants: ABTestVariant[]
}

interface ABTestVariant {
  id: string
  variant_name: string
  campaign_id?: string
  campaign_name?: string
  sent: number
  opens: number
  clicks: number
  revenue: number
  open_rate: number
  click_rate: number
}

interface ABTestTrackerProps {
  clients: any[]
  selectedClient: string
  campaigns: any[]
}

export function ABTestTracker({ clients, selectedClient, campaigns }: ABTestTrackerProps) {
  const [showCreateTest, setShowCreateTest] = useState(false)
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'running' | 'completed'>('all')

  // Mock A/B tests (will be from database later)
  const [tests, setTests] = useState<ABTest[]>([
    {
      id: '1',
      client_id: clients[0]?.id || '1',
      client_name: clients[0]?.brand_name || 'Hydrus',
      test_name: 'Black Friday Subject Line Test',
      test_type: 'subject_line',
      status: 'completed',
      start_date: new Date(2025, 9, 20),
      end_date: new Date(2025, 9, 24),
      winner_variant: 'B',
      confidence_score: 95,
      insights: 'Variant B with urgency language ("Limited Time") outperformed by 12%. Urgency-driven subject lines consistently perform better for promotional campaigns.',
      variants: [
        {
          id: 'v1',
          variant_name: 'A',
          campaign_name: 'Black Friday - Variant A',
          sent: 5000,
          opens: 1250,
          clicks: 312,
          revenue: 2100,
          open_rate: 25.0,
          click_rate: 6.2
        },
        {
          id: 'v2',
          variant_name: 'B',
          campaign_name: 'Black Friday - Variant B',
          sent: 5000,
          opens: 1400,
          clicks: 350,
          revenue: 2450,
          open_rate: 28.0,
          click_rate: 7.0
        }
      ]
    },
    {
      id: '2',
      client_id: clients[1]?.id || '2',
      client_name: clients[1]?.brand_name || 'Peak Design',
      test_name: 'Send Time Optimization Test',
      test_type: 'send_time',
      status: 'running',
      start_date: new Date(2025, 10, 1),
      variants: [
        {
          id: 'v1',
          variant_name: '9am',
          sent: 3000,
          opens: 720,
          clicks: 180,
          revenue: 1200,
          open_rate: 24.0,
          click_rate: 6.0
        },
        {
          id: 'v2',
          variant_name: '2pm',
          sent: 3000,
          opens: 810,
          clicks: 210,
          revenue: 1350,
          open_rate: 27.0,
          click_rate: 7.0
        },
        {
          id: 'v3',
          variant_name: '6pm',
          sent: 3000,
          opens: 780,
          clicks: 195,
          revenue: 1275,
          open_rate: 26.0,
          click_rate: 6.5
        }
      ]
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
      case 'running': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'completed': return 'bg-green-100 text-green-700 border-green-300'
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'paused': return 'bg-orange-100 text-orange-700 border-orange-300'
      default: return 'bg-gray-100 text-gray-600 border-gray-300'
    }
  }

  const getTestTypeLabel = (type: string) => {
    switch (type) {
      case 'subject_line': return 'Subject Line'
      case 'content': return 'Email Content'
      case 'send_time': return 'Send Time'
      case 'from_name': return 'From Name'
      case 'offer': return 'Offer/Promotion'
      default: return type
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
        {(['all', 'running', 'completed'] as const).map(filter => (
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
            <span className="ml-2 text-xs opacity-70">
              ({tests.filter(t => filter === 'all' || t.status === filter).length})
            </span>
          </button>
        ))}
      </div>

      {/* Tests List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTests.map(test => {
          const winningVariant = test.variants.find(v => v.variant_name === test.winner_variant)
          const bestPerformer = test.variants.reduce((best, current) => 
            current.open_rate > best.open_rate ? current : best
          , test.variants[0])

          return (
            <Card key={test.id} className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{test.test_name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(test.status)}`}>
                        {test.status}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700 border border-purple-300">
                        {getTestTypeLabel(test.test_type)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {test.client_name} • {test.variants.length} variants
                      {test.start_date && ` • Started ${test.start_date.toLocaleDateString()}`}
                    </div>
                  </div>

                  {test.winner_variant && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <Trophy className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-semibold text-yellow-900">
                        Winner: Variant {test.winner_variant}
                      </span>
                    </div>
                  )}
                </div>

                {/* Variants Performance */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  {test.variants.map(variant => {
                    const isWinner = variant.variant_name === test.winner_variant
                    const isBest = variant.id === bestPerformer.id && test.status === 'running'

                    return (
                      <div 
                        key={variant.id}
                        className={`p-3 rounded-lg border-2 ${
                          isWinner ? 'bg-green-50 border-green-300' :
                          isBest ? 'bg-blue-50 border-blue-300' :
                          'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">Variant {variant.variant_name}</span>
                          {isWinner && <Trophy className="h-4 w-4 text-yellow-600" />}
                          {isBest && !isWinner && <TrendingUp className="h-4 w-4 text-blue-600" />}
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Sent:</span>
                            <span className="font-semibold">{variant.sent.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Open Rate:</span>
                            <span className="font-semibold">{variant.open_rate.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Click Rate:</span>
                            <span className="font-semibold">{variant.click_rate.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Revenue:</span>
                            <span className="font-semibold">${variant.revenue.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Insights */}
                {test.insights && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                    <div className="text-sm font-semibold text-purple-900 mb-1">💡 Key Insights</div>
                    <div className="text-sm text-purple-800">{test.insights}</div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTest(test)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Eye className="h-3 w-3" />
                    View Details
                  </button>
                  {test.status === 'running' && !test.winner_variant && (
                    <button
                      onClick={() => setSelectedTest(test)}
                      className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <Trophy className="h-3 w-3" />
                      Declare Winner
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTest(test.id)}
                    className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
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
            <div className="text-white/70 text-sm">Running Now</div>
            <div className="text-2xl font-bold text-blue-400">
              {tests.filter(t => t.status === 'running').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-4">
            <div className="text-white/70 text-sm">Completed</div>
            <div className="text-2xl font-bold text-green-400">
              {tests.filter(t => t.status === 'completed').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-4">
            <div className="text-white/70 text-sm">Avg Confidence</div>
            <div className="text-2xl font-bold text-purple-400">
              {tests.filter(t => t.confidence_score).length > 0
                ? Math.round(tests.filter(t => t.confidence_score).reduce((sum, t) => sum + (t.confidence_score || 0), 0) / tests.filter(t => t.confidence_score).length)
                : 0}%
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

