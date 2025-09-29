'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart3,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  FileText,
  Zap,
  ArrowRight,
  TrendingUp,
  Users,
  Activity,
  Star,
  Eye
} from 'lucide-react'

interface DashboardSummary {
  pendingApprovals: number
  overdueForms: number
  activeRequests: number
  recentActivity: ActivityItem[]
  upcomingDeadlines: DeadlineItem[]
  monthlyStats: {
    campaignsApproved: number
    formsCompleted: number
    requestsSubmitted: number
  }
}

interface ActivityItem {
  id: string
  type: 'approval' | 'form' | 'request' | 'comment'
  title: string
  description: string
  timestamp: Date
  priority?: 'high' | 'medium' | 'low'
}

interface DeadlineItem {
  id: string
  title: string
  type: 'campaign' | 'form' | 'request'
  dueDate: Date
  isOverdue: boolean
}

interface DashboardOverviewProps {
  client: any
  userRole: 'client_user' | 'agency_admin'
  onNavigate: (tab: string, itemId?: string) => void
}

export function DashboardOverview({ client, userRole, onNavigate }: DashboardOverviewProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardSummary()
  }, [client])

  const loadDashboardSummary = async () => {
    setLoading(true)
    try {
      // TODO: Fetch real data from APIs
      setSummary(generateMockSummary())
    } catch (error) {
      console.error('Error loading dashboard summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockSummary = (): DashboardSummary => ({
    pendingApprovals: 3,
    overdueForms: 1,
    activeRequests: 2,
    recentActivity: [
      {
        id: '1',
        type: 'approval',
        title: 'Black Friday Campaign',
        description: 'Pending your approval - Ready to review',
        timestamp: new Date(2025, 9, 28, 14, 30),
        priority: 'high'
      },
      {
        id: '2', 
        type: 'form',
        title: 'Monthly Content Calendar',
        description: 'Form completed successfully',
        timestamp: new Date(2025, 9, 27, 10, 15)
      },
      {
        id: '3',
        type: 'comment',
        title: 'Holiday Launch Email',
        description: 'Agency replied to your feedback',
        timestamp: new Date(2025, 9, 26, 16, 45)
      },
      {
        id: '4',
        type: 'request',
        title: 'Welcome Series Update',
        description: 'Request approved and in progress',
        timestamp: new Date(2025, 9, 25, 11, 20)
      }
    ],
    upcomingDeadlines: [
      {
        id: 'd1',
        title: 'Client Onboarding Form',
        type: 'form',
        dueDate: new Date(2025, 9, 29),
        isOverdue: true
      },
      {
        id: 'd2',
        title: 'Holiday Campaign Approval',
        type: 'campaign',
        dueDate: new Date(2025, 9, 30),
        isOverdue: false
      },
      {
        id: 'd3',
        title: 'Welcome Flow Review',
        type: 'campaign',
        dueDate: new Date(2025, 10, 2),
        isOverdue: false
      }
    ],
    monthlyStats: {
      campaignsApproved: 12,
      formsCompleted: 4,
      requestsSubmitted: 6
    }
  })

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'approval': return Calendar
      case 'form': return FileText
      case 'request': return MessageSquare
      case 'comment': return MessageSquare
      default: return Activity
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'approval': return 'text-orange-400'
      case 'form': return 'text-blue-400'
      case 'request': return 'text-green-400'
      case 'comment': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  const getDeadlineStatus = (item: DeadlineItem) => {
    if (item.isOverdue) return 'text-red-400'
    const daysUntilDue = Math.ceil((item.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntilDue <= 1) return 'text-orange-400'
    if (daysUntilDue <= 3) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  if (loading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60 mx-auto mb-4"></div>
          <p className="text-white/70">Loading dashboard...</p>
        </CardContent>
      </Card>
    )
  }

  if (!summary) return null

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
          onClick={() => onNavigate('campaigns')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Pending Approvals</p>
                <p className="text-white text-2xl font-bold">{summary.pendingApprovals}</p>
              </div>
              <div className="bg-orange-500/20 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-400" />
              </div>
            </div>
            {summary.pendingApprovals > 0 && (
              <div className="mt-2 flex items-center text-orange-400 text-sm">
                <ArrowRight className="h-3 w-3 mr-1" />
                Review campaigns
              </div>
            )}
          </CardContent>
        </Card>

        <Card 
          className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
          onClick={() => onNavigate('forms')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Forms Due</p>
                <p className="text-white text-2xl font-bold">{summary.overdueForms}</p>
              </div>
              <div className={`p-3 rounded-lg ${
                summary.overdueForms > 0 ? 'bg-red-500/20' : 'bg-green-500/20'
              }`}>
                <FileText className={`h-6 w-6 ${
                  summary.overdueForms > 0 ? 'text-red-400' : 'text-green-400'
                }`} />
              </div>
            </div>
            {summary.overdueForms > 0 && (
              <div className="mt-2 flex items-center text-red-400 text-sm">
                <ArrowRight className="h-3 w-3 mr-1" />
                Complete forms
              </div>
            )}
          </CardContent>
        </Card>

        <Card 
          className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
          onClick={() => onNavigate('requests')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Active Requests</p>
                <p className="text-white text-2xl font-bold">{summary.activeRequests}</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-blue-400 text-sm">
              <ArrowRight className="h-3 w-3 mr-1" />
              View progress
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-400" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.upcomingDeadlines.length === 0 ? (
              <p className="text-white/60 text-sm">No upcoming deadlines</p>
            ) : (
              summary.upcomingDeadlines.map(item => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => onNavigate(item.type === 'form' ? 'forms' : 'campaigns', item.id)}
                >
                  <div>
                    <p className="text-white font-medium text-sm">{item.title}</p>
                    <p className={`text-xs ${getDeadlineStatus(item)}`}>
                      {item.isOverdue ? 'Overdue' : `Due ${item.dueDate.toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.type === 'form' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {item.type}
                    </span>
                    <ArrowRight className="h-4 w-4 text-white/40" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.recentActivity.length === 0 ? (
              <p className="text-white/60 text-sm">No recent activity</p>
            ) : (
              summary.recentActivity.map(activity => {
                const Icon = getActivityIcon(activity.type)
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <div className={`p-2 rounded-lg bg-white/10 ${getActivityColor(activity.type)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-medium text-sm">{activity.title}</p>
                        <span className="text-white/60 text-xs">{getTimeAgo(activity.timestamp)}</span>
                      </div>
                      <p className="text-white/70 text-xs mt-1">{activity.description}</p>
                      {activity.priority === 'high' && (
                        <span className="inline-block mt-1 px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded">
                          High Priority
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Progress */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            This Month's Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-green-500/20 p-4 rounded-lg mb-2">
                <CheckCircle className="h-8 w-8 text-green-400 mx-auto" />
              </div>
              <p className="text-white text-2xl font-bold">{summary.monthlyStats.campaignsApproved}</p>
              <p className="text-white/70 text-sm">Campaigns Approved</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-500/20 p-4 rounded-lg mb-2">
                <FileText className="h-8 w-8 text-blue-400 mx-auto" />
              </div>
              <p className="text-white text-2xl font-bold">{summary.monthlyStats.formsCompleted}</p>
              <p className="text-white/70 text-sm">Forms Completed</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-500/20 p-4 rounded-lg mb-2">
                <MessageSquare className="h-8 w-8 text-purple-400 mx-auto" />
              </div>
              <p className="text-white text-2xl font-bold">{summary.monthlyStats.requestsSubmitted}</p>
              <p className="text-white/70 text-sm">Requests Submitted</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {summary.pendingApprovals > 0 && (
              <button
                onClick={() => onNavigate('campaigns')}
                className="bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/30 text-orange-300 p-4 rounded-lg transition-colors flex flex-col items-center gap-2"
              >
                <Calendar className="h-5 w-5" />
                <span className="text-sm font-medium">Review Campaigns</span>
                <span className="text-xs">{summary.pendingApprovals} pending</span>
              </button>
            )}
            
            {summary.overdueForms > 0 && (
              <button
                onClick={() => onNavigate('forms')}
                className="bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-300 p-4 rounded-lg transition-colors flex flex-col items-center gap-2"
              >
                <FileText className="h-5 w-5" />
                <span className="text-sm font-medium">Complete Forms</span>
                <span className="text-xs">{summary.overdueForms} overdue</span>
              </button>
            )}
            
            <button
              onClick={() => onNavigate('requests')}
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-blue-300 p-4 rounded-lg transition-colors flex flex-col items-center gap-2"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-sm font-medium">New Request</span>
              <span className="text-xs">Submit project</span>
            </button>

            <button
              onClick={() => window.open('mailto:support@youragency.com')}
              className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-purple-300 p-4 rounded-lg transition-colors flex flex-col items-center gap-2"
            >
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">Contact Team</span>
              <span className="text-xs">Get help</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* All Caught Up State */}
      {summary.pendingApprovals === 0 && summary.overdueForms === 0 && (
        <Card className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-white/20">
          <CardContent className="p-6 text-center">
            <div className="bg-green-500/30 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">All Caught Up!</h3>
            <p className="text-white/70 text-sm">
              You've completed all pending items. Great work staying on top of everything!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}