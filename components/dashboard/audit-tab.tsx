'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Download,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface AuditTabProps {
  client: any
  timeframe: number
}

interface AuditFinding {
  id: string
  severity: 'high' | 'medium' | 'low'
  category: string
  title: string
  icon: string
  impact: {
    type: string
    value: string
    confidence: string
  }
  analysis: string
  data_points: any
  recommendations: {
    action: string
    details: string
    expected_improvement?: string
  }[]
}

interface AuditResult {
  overall_score: number
  grade: string
  findings: AuditFinding[]
  strengths: {
    id: string
    title: string
    icon: string
    analysis: string
    data: string
  }[]
}

export function AuditTab({ client, timeframe }: AuditTabProps) {
  const [audit, setAudit] = useState<AuditResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedFindings, setExpandedFindings] = useState<Set<string>>(new Set())

  const runAudit = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientSlug: client.brand_slug })
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message || 'Audit failed')
      }

      const result = await response.json()
      setAudit(result.audit)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run audit')
    } finally {
      setLoading(false)
    }
  }

  const toggleFinding = (id: string) => {
    const newExpanded = new Set(expandedFindings)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedFindings(newExpanded)
  }

  const exportToPDF = () => {
    if (!audit) return
    
    // Import and use PDF export utility
    import('@/lib/pdf-export').then(({ exportAuditToPDF }) => {
      exportAuditToPDF(client, audit)
    })
  }

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          border: 'border-l-4 border-red-500',
          bg: 'bg-red-50/80',
          badge: 'bg-red-100 text-red-700',
          text: 'text-red-900'
        }
      case 'medium':
        return {
          border: 'border-l-4 border-yellow-500',
          bg: 'bg-yellow-50/80',
          badge: 'bg-yellow-100 text-yellow-700',
          text: 'text-yellow-900'
        }
      case 'low':
        return {
          border: 'border-l-4 border-blue-500',
          bg: 'bg-blue-50/80',
          badge: 'bg-blue-100 text-blue-700',
          text: 'text-blue-900'
        }
      default:
        return {
          border: 'border-l-4 border-gray-500',
          bg: 'bg-gray-50/80',
          badge: 'bg-gray-100 text-gray-700',
          text: 'text-gray-900'
        }
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-600'
    if (score >= 7.5) return 'text-blue-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreEmoji = (score: number) => {
    if (score >= 9) return '🏆'
    if (score >= 7.5) return '🟢'
    if (score >= 6) return '🟡'
    return '🔴'
  }

  // Group findings by severity
  const highPriority = audit?.findings.filter(f => f.severity === 'high') || []
  const mediumPriority = audit?.findings.filter(f => f.severity === 'medium') || []
  const lowPriority = audit?.findings.filter(f => f.severity === 'low') || []
  const strengths = audit?.strengths || []

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/20 p-3 rounded-xl">
                <Sparkles className="h-6 w-6 text-purple-300" />
              </div>
              <div>
                <CardTitle className="text-white text-xl font-bold">
                  AI Marketing Audit
                </CardTitle>
                <p className="text-white/70 text-sm">
                  Powered by Claude Sonnet 4 - Analyzing your email marketing performance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {audit && (
                <button
                  onClick={exportToPDF}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Export PDF
                </button>
              )}
              <button
                onClick={runAudit}
                disabled={loading}
                className="bg-purple-500/80 hover:bg-purple-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    {audit ? 'Re-run Audit' : 'Run Audit'}
                  </>
                )}
              </button>
            </div>
          </div>
        </CardHeader>

        {audit && (
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className={`text-5xl font-bold ${getScoreColor(audit.overall_score)}`}>
                  {audit.overall_score.toFixed(1)}
                </div>
                <div className="text-white/60 text-sm mt-1">out of 10</div>
              </div>
              
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400">{highPriority.length}</div>
                  <div className="text-white/60 text-xs">High Priority</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">{mediumPriority.length}</div>
                  <div className="text-white/60 text-xs">Medium Priority</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{lowPriority.length}</div>
                  <div className="text-white/60 text-xs">Low Priority</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{strengths.length}</div>
                  <div className="text-white/60 text-xs">Strengths</div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-2">{getScoreEmoji(audit.overall_score)}</div>
                <div className="text-2xl font-bold text-white">{audit.grade}</div>
                <div className="text-white/60 text-xs">Grade</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Error State */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div>
                <div className="text-red-400 font-medium">Audit Failed</div>
                <div className="text-red-300/80 text-sm">{error}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Loader2 className="h-12 w-12 text-purple-400 animate-spin mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">AI Analysis in Progress...</h3>
              <p className="text-white/60 text-sm max-w-md">
                Claude is analyzing your campaigns, flows, subject lines, send times, and list growth patterns. 
                This typically takes 10-15 seconds.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Audit Yet */}
      {!audit && !loading && !error && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-12">
            <div className="text-center">
              <Sparkles className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">
                Get AI-Powered Marketing Insights
              </h3>
              <p className="text-white/70 text-sm max-w-2xl mx-auto mb-6">
                Our AI will analyze your last 90 days of email marketing data to identify:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto mb-8 text-left">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white font-medium text-sm">🚨 Missing Revenue Opportunities</div>
                  <div className="text-white/60 text-xs">Abandoned flows, untapped segments</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white font-medium text-sm">⏰ Send Time Optimization</div>
                  <div className="text-white/60 text-xs">Best days and times for your audience</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white font-medium text-sm">📧 Subject Line Improvements</div>
                  <div className="text-white/60 text-xs">Patterns that work for your brand</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white font-medium text-sm">✨ What's Working Well</div>
                  <div className="text-white/60 text-xs">Celebrate your wins and strengths</div>
                </div>
              </div>
              <button
                onClick={runAudit}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-bold text-lg flex items-center gap-3 mx-auto shadow-lg"
              >
                <Sparkles className="h-5 w-5" />
                Run AI Audit
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Results */}
      {audit && !loading && (
        <>
          {/* High Priority Findings */}
          {highPriority.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">🔴</span> HIGH PRIORITY ({highPriority.length})
              </h2>
              {highPriority.map((finding) => (
                <FindingCard 
                  key={finding.id}
                  finding={finding}
                  expanded={expandedFindings.has(finding.id)}
                  onToggle={() => toggleFinding(finding.id)}
                />
              ))}
            </div>
          )}

          {/* Medium Priority Findings */}
          {mediumPriority.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">🟡</span> MEDIUM PRIORITY ({mediumPriority.length})
              </h2>
              {mediumPriority.map((finding) => (
                <FindingCard 
                  key={finding.id}
                  finding={finding}
                  expanded={expandedFindings.has(finding.id)}
                  onToggle={() => toggleFinding(finding.id)}
                />
              ))}
            </div>
          )}

          {/* Low Priority & Opportunities */}
          {lowPriority.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">🟢</span> OPPORTUNITIES ({lowPriority.length})
              </h2>
              {lowPriority.map((finding) => (
                <FindingCard 
                  key={finding.id}
                  finding={finding}
                  expanded={expandedFindings.has(finding.id)}
                  onToggle={() => toggleFinding(finding.id)}
                />
              ))}
            </div>
          )}

          {/* Strengths */}
          {strengths.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">✅</span> WORKING WELL ({strengths.length})
              </h2>
              {strengths.map((strength) => (
                <Card key={strength.id} className="bg-green-500/10 backdrop-blur-md border-green-400/30">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{strength.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">{strength.title}</h3>
                        <p className="text-white/80 text-sm mb-2">{strength.analysis}</p>
                        <div className="inline-block bg-green-500/20 px-3 py-1 rounded-full text-green-300 text-xs font-medium">
                          {strength.data}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Finding Card Component
function FindingCard({ finding, expanded, onToggle }: {
  finding: AuditFinding
  expanded: boolean
  onToggle: () => void
}) {
  const styles = {
    high: {
      border: 'border-l-4 border-red-500',
      bg: 'bg-red-500/10',
      borderColor: 'border-red-400/30',
      badge: 'bg-red-500/20 text-red-300',
      text: 'text-white'
    },
    medium: {
      border: 'border-l-4 border-yellow-500',
      bg: 'bg-yellow-500/10',
      borderColor: 'border-yellow-400/30',
      badge: 'bg-yellow-500/20 text-yellow-300',
      text: 'text-white'
    },
    low: {
      border: 'border-l-4 border-blue-500',
      bg: 'bg-blue-500/10',
      borderColor: 'border-blue-400/30',
      badge: 'bg-blue-500/20 text-blue-300',
      text: 'text-white'
    }
  }

  const style = styles[finding.severity]

  return (
    <Card className={`${style.bg} backdrop-blur-md ${style.borderColor} ${style.border}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <span className="text-3xl flex-shrink-0">{finding.icon}</span>
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-2">
                <h3 className="text-lg font-bold text-white flex-1">{finding.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${style.badge}`}>
                  {finding.severity.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-3 text-sm">
                <span className="text-white/90 font-medium">
                  💰 Impact: {finding.impact.value}
                </span>
                <span className="text-white/60">
                  Confidence: {finding.impact.confidence}
                </span>
              </div>

              {/* Preview text when collapsed */}
              {!expanded && (
                <p className="text-white/70 text-sm line-clamp-2 mb-3">
                  {finding.analysis}
                </p>
              )}

              {/* Full content when expanded */}
              {expanded && (
                <div className="space-y-4 mt-4">
                  {/* Analysis */}
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-2">📊 Analysis</h4>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {finding.analysis}
                    </p>
                  </div>

                  {/* Data Points */}
                  {finding.data_points && Object.keys(finding.data_points).length > 0 && (
                    <div>
                      <h4 className="text-white font-semibold text-sm mb-2">📈 Supporting Data</h4>
                      <div className="bg-black/20 rounded-lg p-4 space-y-2">
                        {Object.entries(finding.data_points).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-white/60">{key.replace(/_/g, ' ')}:</span>
                            <span className="text-white font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-2">✅ Recommendations</h4>
                    <div className="space-y-3">
                      {finding.recommendations.map((rec, i) => (
                        <div key={i} className="bg-black/20 rounded-lg p-4">
                          <div className="text-white font-medium text-sm mb-1">{rec.action}</div>
                          <p className="text-white/70 text-xs mb-2">{rec.details}</p>
                          {rec.expected_improvement && (
                            <div className="text-green-300 text-xs font-medium">
                              Expected: {rec.expected_improvement}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onToggle}
            className="ml-4 text-white/60 hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

