'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  TestTube,
  TrendingUp,
  TrendingDown,
  Equal,
  Eye,
  Edit,
  Plus,
  BarChart3,
  Mail,
  Users,
  Target,
  Award,
  AlertCircle,
  X
} from 'lucide-react'

interface ABTest {
  id: string
  name: string
  status: 'running' | 'completed' | 'draft' | 'paused'
  type: 'subject_line' | 'content' | 'send_time' | 'from_name'
  startDate: Date
  endDate?: Date
  variants: {
    id: string
    name: string
    description: string
    metrics: {
      sent: number
      opens: number
      clicks: number
      conversions: number
      revenue: number
      openRate: number
      clickRate: number
      conversionRate: number
    }
  }[]
  winner?: string
  confidence: number
  notes: string
}

interface ABTestManagerProps {
  client: any
}

export function ABTestManager({ client }: ABTestManagerProps) {
  const [tests, setTests] = useState<ABTest[]>([])
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchABTests()
  }, [client])

  const fetchABTests = async () => {
    setLoading(true)
    try {
      console.log('🧪 AB TESTS: Fetching from API for client:', client?.brand_slug || client?.id)
      const response = await fetch(`/api/ab-tests?clientSlug=${client?.brand_slug || ''}&clientId=${client?.id || ''}`)
      const result = await response.json()
      
      if (response.ok && result.success) {
        console.log('🧪 AB TESTS: Loaded', result.tests?.length || 0, 'tests from database')
        setTests(result.tests || [])
      } else {
        console.error('🧪 AB TESTS: API error:', result.error)
        setTests([])
      }
    } catch (error) {
      console.error('🧪 AB TESTS: Network error:', error)
      setTests([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-400 bg-blue-500/20'
      case 'completed': return 'text-green-400 bg-green-500/20'
      case 'draft': return 'text-gray-400 bg-gray-500/20'
      case 'paused': return 'text-orange-400 bg-orange-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getWinnerIcon = (testId: string, variantId: string, winner?: string) => {
    if (!winner) return null
    
    if (variantId === winner) {
      return <Award className="h-4 w-4 text-yellow-400" />
    }
    
    return null
  }

  const calculateLift = (winnerMetrics: any, loserMetrics: any, metric: string) => {
    const winnerValue = winnerMetrics[metric]
    const loserValue = loserMetrics[metric]
    
    if (loserValue === 0) return 0
    
    return ((winnerValue - loserValue) / loserValue) * 100
  }

  const renderTestCard = (test: ABTest) => {
    const winnerVariant = test.variants.find(v => v.id === test.winner)
    const loserVariant = test.variants.find(v => v.id !== test.winner)
    
    return (
      <Card 
        key={test.id}
        className="bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
        onClick={() => setSelectedTest(test)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-white font-semibold">{test.name}</h4>
              <p className="text-white/60 text-sm">{test.type.replace('_', ' ')} test</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(test.status)}`}>
                {test.status}
              </span>
              <TestTube className="h-4 w-4 text-purple-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {test.variants.map(variant => (
              <div key={variant.id} className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm font-medium">{variant.name}</span>
                  {getWinnerIcon(test.id, variant.id, test.winner)}
                </div>
                <div className="space-y-1 text-xs">
                  <p className="text-white/60">Opens: {variant.metrics.openRate.toFixed(1)}%</p>
                  <p className="text-white/60">Clicks: {variant.metrics.clickRate.toFixed(1)}%</p>
                  <p className="text-white/60">Revenue: ${variant.metrics.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {test.winner && winnerVariant && loserVariant && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="text-green-300 text-sm font-medium mb-1">
                {winnerVariant.name} wins with {test.confidence}% confidence
              </p>
              <p className="text-green-200 text-xs">
                +{calculateLift(winnerVariant.metrics, loserVariant.metrics, 'revenue').toFixed(1)}% revenue lift
              </p>
            </div>
          )}

          <div className="mt-3 text-white/60 text-xs">
            Started: {test.startDate.toLocaleDateString()}
            {test.endDate && ` • Ended: ${test.endDate.toLocaleDateString()}`}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              A/B Test Manager
            </CardTitle>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Test
            </button>
          </div>
        </CardHeader>
      </Card>

      {/* Tests Grid */}
      {loading ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/60">Loading A/B tests...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tests.map(renderTestCard)}
        </div>
      )}

      {/* Test Details Modal */}
      {selectedTest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-white/10 border-white/20 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">{selectedTest.name}</CardTitle>
                <button 
                  onClick={() => setSelectedTest(null)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Test Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-white/60 text-sm">Status</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-sm ${getStatusColor(selectedTest.status)}`}>
                      {selectedTest.status}
                    </span>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-white/60 text-sm">Test Type</p>
                    <p className="text-white">{selectedTest.type.replace('_', ' ')}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-white/60 text-sm">Confidence</p>
                    <p className="text-white font-semibold">{selectedTest.confidence.toFixed(1)}%</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-white/60 text-sm">Duration</p>
                    <p className="text-white">
                      {Math.ceil((new Date().getTime() - selectedTest.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                </div>

                {/* Variants Comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {selectedTest.variants.map(variant => (
                    <Card key={variant.id} className="bg-white/5 border-white/10">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white">{variant.name}</CardTitle>
                          {getWinnerIcon(selectedTest.id, variant.id, selectedTest.winner)}
                        </div>
                        <p className="text-white/60 text-sm">{variant.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-white/60 text-sm">Open Rate</p>
                            <p className="text-white text-lg font-semibold">{variant.metrics.openRate.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-sm">Click Rate</p>
                            <p className="text-white text-lg font-semibold">{variant.metrics.clickRate.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-sm">Conversions</p>
                            <p className="text-white text-lg font-semibold">{variant.metrics.conversions}</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-sm">Revenue</p>
                            <p className="text-white text-lg font-semibold">${variant.metrics.revenue.toFixed(2)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Test Notes */}
                {selectedTest.notes && (
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Test Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/80">{selectedTest.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}