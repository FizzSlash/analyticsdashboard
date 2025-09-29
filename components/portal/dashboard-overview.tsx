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
import { getBrandColorClasses } from '@/lib/brand-colors'

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
  
  // Get brand colors for this client
  const brandColors = getBrandColorClasses(client)

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

  const generateMockSummary = (): DashboardSummary => {
    // TODO: Replace with real API calls to get actual pending items
    return {
      pendingApprovals: 0, // TODO: Fetch from campaigns API
      overdueForms: 0, // TODO: Fetch from forms API  
      activeRequests: 0, // TODO: Fetch from requests API
      recentActivity: [], // TODO: Fetch recent activity
      upcomingDeadlines: [], // TODO: Fetch upcoming deadlines
      monthlyStats: {
        campaignsApproved: 0,
        formsCompleted: 0,
        requestsSubmitted: 0
      }
    }
  }

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
      {/* Clean Stats Grid - Readable and Professional */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className="bg-white/10 border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer group backdrop-blur-sm shadow-lg hover:shadow-xl"
          onClick={() => onNavigate('campaigns')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div 
                className="p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform"
                style={{ backgroundColor: brandColors.primary.bg80 }}
              >
                <Calendar className="h-6 w-6 text-white" />
              </div>
              {summary.pendingApprovals > 0 && (
                <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {summary.pendingApprovals} PENDING
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-white/70 text-sm font-medium">Campaign Approvals</p>
              <p className="text-white text-3xl font-bold">{summary.pendingApprovals}</p>
              <p className="text-white/60 text-sm">
                {summary.pendingApprovals > 0 ? 'Click to review campaigns' : 'All campaigns approved'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-white/10 border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer group backdrop-blur-sm shadow-lg hover:shadow-xl"
          onClick={() => onNavigate('forms')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div 
                className="p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform"
                style={{ backgroundColor: brandColors.secondary.bg80 }}
              >
                <FileText className="h-6 w-6 text-white" />
              </div>
              {summary.overdueForms > 0 && (
                <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {summary.overdueForms} DUE
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-white/70 text-sm font-medium">Forms To Complete</p>
              <p className="text-white text-3xl font-bold">{summary.overdueForms}</p>
              <p className="text-white/60 text-sm">
                {summary.overdueForms > 0 ? 'Forms need completion' : 'All forms completed'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-white/10 border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer group backdrop-blur-sm shadow-lg hover:shadow-xl"
          onClick={() => onNavigate('requests')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div 
                className="p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform"
                style={{ backgroundColor: brandColors.primary.bg50 }}
              >
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div 
                className="text-white text-xs font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: brandColors.primary.bg80 }}
              >
                SUBMIT
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-white/70 text-sm font-medium">Project Requests</p>
              <p className="text-white text-3xl font-bold">{summary.activeRequests}</p>
              <p className="text-white/60 text-sm">
                Submit new projects here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Items - Only if there are items to show */}
      {(summary.upcomingDeadlines.length > 0 || summary.recentActivity.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Only show deadlines if there are deadlines */}
          {summary.upcomingDeadlines.length > 0 && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-400" />
                  Needs Attention
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {summary.upcomingDeadlines.map(item => (
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
                    <ArrowRight className="h-4 w-4 text-white/40" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Only show recent activity if there is activity */}
          {summary.recentActivity.length > 0 && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-400" />
                  Recent Updates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {summary.recentActivity.slice(0, 3).map(activity => {
                  const Icon = getActivityIcon(activity.type)
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                      <div className={`p-2 rounded-lg bg-white/10 ${getActivityColor(activity.type)}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{activity.title}</p>
                        <p className="text-white/70 text-xs mt-1">{activity.description}</p>
                        <span className="text-white/60 text-xs">{getTimeAgo(activity.timestamp)}</span>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Only show monthly progress if there's actual data */}
      {(summary.monthlyStats.campaignsApproved > 0 || summary.monthlyStats.formsCompleted > 0 || summary.monthlyStats.requestsSubmitted > 0) && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {summary.monthlyStats.campaignsApproved > 0 && (
                <div className="text-center">
                  <div className="bg-green-500/20 p-4 rounded-lg mb-2">
                    <CheckCircle className="h-8 w-8 text-green-400 mx-auto" />
                  </div>
                  <p className="text-white text-2xl font-bold">{summary.monthlyStats.campaignsApproved}</p>
                  <p className="text-white/70 text-sm">Campaigns Approved</p>
                </div>
              )}
              {summary.monthlyStats.formsCompleted > 0 && (
                <div className="text-center">
                  <div className="bg-blue-500/20 p-4 rounded-lg mb-2">
                    <FileText className="h-8 w-8 text-blue-400 mx-auto" />
                  </div>
                  <p className="text-white text-2xl font-bold">{summary.monthlyStats.formsCompleted}</p>
                  <p className="text-white/70 text-sm">Forms Completed</p>
                </div>
              )}
              {summary.monthlyStats.requestsSubmitted > 0 && (
                <div className="text-center">
                  <div className="bg-purple-500/20 p-4 rounded-lg mb-2">
                    <MessageSquare className="h-8 w-8 text-purple-400 mx-auto" />
                  </div>
                  <p className="text-white text-2xl font-bold">{summary.monthlyStats.requestsSubmitted}</p>
                  <p className="text-white/70 text-sm">Requests Submitted</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions - Only show if there are pending items */}
      {(summary.pendingApprovals > 0 || summary.overdueForms > 0) && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {summary.pendingApprovals > 0 && (
                <button
                  onClick={() => onNavigate('campaigns')}
                  className="bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/30 text-orange-300 p-4 rounded-lg transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm font-medium">Review Campaigns</span>
                  </div>
                  <span className="bg-orange-500/30 text-orange-200 text-xs px-2 py-1 rounded-full">
                    {summary.pendingApprovals}
                  </span>
                </button>
              )}
              
              {summary.overdueForms > 0 && (
                <button
                  onClick={() => onNavigate('forms')}
                  className="bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-300 p-4 rounded-lg transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5" />
                    <span className="text-sm font-medium">Complete Forms</span>
                  </div>
                  <span className="bg-red-500/30 text-red-200 text-xs px-2 py-1 rounded-full">
                    {summary.overdueForms}
                  </span>
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Caught Up State - Clean Success */}
      {summary.pendingApprovals === 0 && summary.overdueForms === 0 && (
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div 
              className="p-6 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg"
              style={{ backgroundColor: brandColors.actions.success }}
            >
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-white text-xl font-bold mb-2">All Caught Up!</h3>
            <p className="text-white/70 text-sm">
              You've completed all pending items. Great work!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}