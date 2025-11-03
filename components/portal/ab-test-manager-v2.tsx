'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  TestTube,
  Eye,
  X,
  Calendar,
  Target
} from 'lucide-react'

interface ABTest {
  id: string
  test_name: string
  test_type: string
  status: string
  hypothesis: string
  test_date: string
  notes: string
  winner_variant: string | null
  created_at: string
}

interface ABTestManagerProps {
  client: any
}

export function ABTestManager({ client }: ABTestManagerProps) {
  const [tests, setTests] = useState<ABTest[]>([])
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchABTests()
  }, [client?.id])

  const fetchABTests = async () => {
    if (!client?.id) {
      console.error('❌ PORTAL A/B TESTS: No client ID provided')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log('📥 PORTAL A/B TESTS: Fetching for client:', client.id)
      
      const response = await fetch(`/api/portal/ab-tests?clientId=${client.id}`)
      const result = await response.json()
      
      if (result.success) {
        console.log(`✅ PORTAL A/B TESTS: Loaded ${result.tests.length} tests`)
        setTests(result.tests)
      } else {
        console.error('❌ PORTAL A/B TESTS: Failed:', result.error)
        setTests([])
      }
    } catch (error) {
      console.error('❌ PORTAL A/B TESTS: Error:', error)
      setTests([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30'
      case 'completed':
      case 'finalized':
        return 'bg-green-500/20 text-green-300 border-green-400/30'
      case 'strategy':
      case 'planning':
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30'
      default:
        return 'bg-white/20 text-white/80 border-white/30'
    }
  }

  if (loading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60 mx-auto mb-4"></div>
          <p className="text-white/70">Loading A/B tests...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* A/B Tests List */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            A/B Tests ({tests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tests.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <TestTube className="h-12 w-12 mx-auto mb-3 text-white/40" />
              <p>No A/B tests found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tests.map(test => (
                <div
                  key={test.id}
                  className="bg-white/10 rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
                  onClick={() => setSelectedTest(test)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1">{test.test_name}</h4>
                      <p className="text-white/70 text-sm mb-2">{test.hypothesis}</p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className={`px-2 py-1 rounded-md font-semibold border ${getStatusColor(test.status)}`}>
                          {test.status}
                        </span>
                        <span className="text-white/60">
                          {test.test_type}
                        </span>
                        {test.test_date && (
                          <span className="text-white/60">
                            {new Date(test.test_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedTest(test)
                      }}
                      className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-white/30"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Detail Modal */}
      {selectedTest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b border-white/20">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-white text-xl mb-2">{selectedTest.test_name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 rounded-md text-sm font-semibold border ${getStatusColor(selectedTest.status)}`}>
                      {selectedTest.status}
                    </span>
                    <span className="text-white/60 text-sm">
                      {selectedTest.test_type}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedTest(null)
                  }}
                  className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Test Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-4 border border-white/20 md:col-span-2">
                  <p className="text-white/60 text-xs mb-1 uppercase tracking-wide">Hypothesis</p>
                  <p className="text-white font-medium">{selectedTest.hypothesis}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <p className="text-white/60 text-xs mb-1 uppercase tracking-wide">Test Type</p>
                  <p className="text-white font-medium">{selectedTest.test_type}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <p className="text-white/60 text-xs mb-1 uppercase tracking-wide">Start Date</p>
                  <p className="text-white font-medium">
                    {selectedTest.test_date ? new Date(selectedTest.test_date).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
              </div>

              {/* Winner */}
              {selectedTest.winner_variant && (
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <p className="text-white/60 text-xs mb-1 uppercase tracking-wide">Winner</p>
                  <p className="text-white font-semibold text-lg">{selectedTest.winner_variant}</p>
                </div>
              )}

              {/* Notes & Learnings */}
              {selectedTest.notes && (
                <div>
                  <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Notes & Learnings
                  </h5>
                  <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                    <p className="text-white/80 whitespace-pre-wrap text-sm">{selectedTest.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

