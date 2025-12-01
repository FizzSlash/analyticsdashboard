'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Target,
  TrendingUp,
  CheckCircle,
  Circle,
  Loader2
} from 'lucide-react'

interface Initiative {
  id: string
  phase: '30' | '60' | '90'
  title: string
  description: string
  status: 'not_started' | 'in_progress' | 'completed'
  target_metric: string
  current_progress: string
  order_index: number
  completed_at: string
}

interface PhaseData {
  initiatives: Initiative[]
  progress: number
  focus: string
}

interface Plan {
  id: string
  plan_name: string
  description: string
  start_date: string
  end_date: string
  phase30: PhaseData
  phase60: PhaseData
  phase90: PhaseData
  overallProgress: number
  totalInitiatives: number
  completedInitiatives: number
}

interface StrategicPlansProps {
  client: any
  userRole: 'client_user' | 'agency_admin'
}

export function StrategicPlans({ client, userRole }: StrategicPlansProps) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (client?.id) {
      loadPlans()
    }
  }, [client?.id])

  const loadPlans = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/strategic-plans?clientId=${client.id}`)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
      case 'not_started':
        return <Circle className="h-4 w-4 text-gray-400" />
      default:
        return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-400/30'
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30'
      case 'not_started':
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in_progress':
        return 'In Progress'
      case 'not_started':
        return 'Not Started'
      default:
        return status
    }
  }

  const renderPhase = (phaseNumber: string, phaseData: PhaseData, plan: Plan) => {
    const phaseTitle = `FIRST ${phaseNumber} DAYS`
    const isFirst = phaseNumber === '30'
    const isMiddle = phaseNumber === '60'
    const isFinal = phaseNumber === '90'

    return (
      <div className="space-y-3">
        {/* Phase Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white text-lg font-bold">
              {isFirst && 'FIRST 30 DAYS'}
              {isMiddle && 'NEXT 60 DAYS'}
              {isFinal && 'FINAL 90 DAYS'}
            </h3>
            {phaseData.focus && (
              <p className="text-white/60 text-sm mt-1">Focus: {phaseData.focus}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-white/90 text-2xl font-bold">{phaseData.progress}%</p>
              <p className="text-white/50 text-xs">Complete</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              phaseData.progress === 100 
                ? 'bg-gradient-to-r from-green-400 to-green-500'
                : phaseData.progress > 0
                ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                : 'bg-gray-500/30'
            }`}
            style={{ width: `${phaseData.progress}%` }}
          />
        </div>

        {/* Initiatives */}
        {phaseData.initiatives.length > 0 ? (
          <div className="space-y-2">
            {phaseData.initiatives.map((initiative) => (
              <div
                key={initiative.id}
                className={`p-4 rounded-lg border transition-all ${
                  initiative.status === 'completed'
                    ? 'bg-green-500/10 border-green-400/30'
                    : initiative.status === 'in_progress'
                    ? 'bg-blue-500/10 border-blue-400/30'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(initiative.status)}
                  <div className="flex-1">
                    <p className={`font-medium ${
                      initiative.status === 'completed' 
                        ? 'text-white/70' 
                        : 'text-white/90'
                    }`}>
                      {initiative.title}
                    </p>
                    {initiative.description && (
                      <p className="text-white/50 text-sm mt-1">
                        {initiative.description}
                      </p>
                    )}
                    {initiative.target_metric && (
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-white/60 text-xs">
                          Target: {initiative.target_metric}
                        </p>
                        {initiative.current_progress && initiative.status === 'in_progress' && (
                          <p className="text-blue-300 text-xs font-medium">
                            Current: {initiative.current_progress}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(initiative.status)}`}>
                    {getStatusText(initiative.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-white/5 rounded-lg border border-white/10 text-center">
            <p className="text-white/40 text-sm">No initiatives planned for this phase yet</p>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (plans.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardContent className="p-12 text-center">
          <Target className="h-16 w-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">No Strategic Plans Yet</h3>
          <p className="text-white/60 text-sm max-w-md mx-auto">
            Your 30/60/90 day strategic roadmap will appear here once created by your agency team
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {plans.map((plan) => (
        <Card key={plan.id} className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl overflow-hidden">
          {/* Plan Header */}
          <CardHeader className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-white text-2xl font-bold flex items-center gap-3">
                  <Target className="h-7 w-7 text-blue-300" />
                  {plan.plan_name}
                </CardTitle>
                <p className="text-white/70 text-sm mt-2">
                  {new Date(plan.start_date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })} - {new Date(plan.end_date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                {plan.description && (
                  <p className="text-white/60 text-sm mt-2 max-w-2xl">
                    {plan.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="bg-white/15 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/30">
                  <p className="text-white/70 text-xs mb-1">Overall Progress</p>
                  <p className="text-white text-3xl font-bold">{plan.overallProgress}%</p>
                  <p className="text-white/50 text-xs mt-1">
                    {plan.completedInitiatives} of {plan.totalInitiatives} complete
                  </p>
                </div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="mt-4 w-full bg-white/10 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 transition-all duration-700"
                style={{ width: `${plan.overallProgress}%` }}
              />
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-8">
            {/* 30 Day Phase */}
            {renderPhase('30', plan.phase30, plan)}

            {/* Divider */}
            <div className="border-t border-white/10" />

            {/* 60 Day Phase */}
            {renderPhase('60', plan.phase60, plan)}

            {/* Divider */}
            <div className="border-t border-white/10" />

            {/* 90 Day Phase */}
            {renderPhase('90', plan.phase90, plan)}

            {/* Next Milestone */}
            {plan.overallProgress < 100 && (
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white/90 font-semibold text-sm mb-1">Next Milestone</h4>
                    <p className="text-white/70 text-sm">
                      {(() => {
                        // Find next incomplete initiative
                        const allInitiatives = [
                          ...plan.phase30.initiatives,
                          ...plan.phase60.initiatives,
                          ...plan.phase90.initiatives
                        ]
                        const nextIncomplete = allInitiatives.find(i => i.status !== 'completed')
                        
                        if (nextIncomplete) {
                          return `Complete "${nextIncomplete.title}" to advance your progress`
                        }
                        return 'All initiatives complete - great work!'
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Completion Message */}
            {plan.overallProgress === 100 && (
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-lg p-6 mt-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                <h4 className="text-white text-xl font-bold mb-2">Plan Complete!</h4>
                <p className="text-white/70 text-sm">
                  All initiatives have been successfully completed. Great work!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

