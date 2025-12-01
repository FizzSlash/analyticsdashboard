'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Phone,
  Calendar,
  ExternalLink,
  Play,
  FileText,
  Plus,
  CheckCircle,
  Circle,
  Clock,
  X,
  Send
} from 'lucide-react'

interface CallAgendasProps {
  client: any
  userRole: 'client_user' | 'agency_admin'
}

export function CallAgendas({ client, userRole }: CallAgendasProps) {
  const [upcomingCalls, setUpcomingCalls] = useState<any[]>([])
  const [pastCalls, setPastCalls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newQuestion, setNewQuestion] = useState('')
  const [addingQuestion, setAddingQuestion] = useState<string | null>(null)

  const loadCalls = async () => {
    if (!client?.id) return
    
    try {
      setLoading(true)
      console.log('Loading calls for client:', client.id)
      const response = await fetch(`/api/call-agendas?clientId=${client.id}`)
      const data = await response.json()
      console.log('Call agendas response:', data)

      if (data.success) {
        setUpcomingCalls(data.upcomingCalls || [])
        setPastCalls(data.pastCalls || [])
        console.log('Upcoming calls:', data.upcomingCalls?.length || 0)
        console.log('Past calls:', data.pastCalls?.length || 0)
      }
    } catch (error) {
      console.error('Error loading calls:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCalls()
  }, [client?.id])

  const handleAddQuestion = async (callId: string) => {
    if (!newQuestion.trim()) return

    try {
      await fetch('/api/call-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          call_id: callId,
          client_id: client.id,
          question_text: newQuestion,
          added_by_name: client.brand_name || 'Client',
          added_by_client: true
        })
      })
      setNewQuestion('')
      setAddingQuestion(null)
      loadCalls()
    } catch (error) {
      console.error('Error adding question:', error)
    }
  }

  const handleToggleActionItem = async (itemId: string, currentStatus: boolean) => {
    try {
      await fetch('/api/call-action-items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: itemId,
          completed: !currentStatus
        })
      })
      loadCalls()
    } catch (error) {
      console.error('Error updating action item:', error)
    }
  }

  const handleToggleApproval = async (approvalId: string, currentStatus: boolean) => {
    try {
      await fetch('/api/call-approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: approvalId,
          approved: !currentStatus
        })
      })
      loadCalls()
    } catch (error) {
      console.error('Error updating approval:', error)
    }
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const formatCallDate = (dateString: string) => {
    // Parse date as local time to avoid timezone shifts
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatShortDate = (dateString: string) => {
    // Parse date as local time to avoid timezone shifts
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {upcomingCalls.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-white text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Upcoming Calls
          </h2>

          {upcomingCalls.map((call) => (
            <Card key={call.id} className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader className="border-b border-white/10">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-xl flex items-center gap-2">
                      <Phone className="h-5 w-5 text-blue-400" />
                      {call.call_title || 'Weekly Strategy Call'}
                    </CardTitle>
                    <p className="text-white/70 text-sm mt-1">
                      {formatCallDate(call.call_date)} at {call.call_time || 'TBD'}
                    </p>
                  </div>
                  {call.agenda_link && (
                    <a
                      href={call.agenda_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors border border-blue-400/30"
                    >
                      <FileText className="h-4 w-4" />
                      Open Agenda
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-white/90 font-semibold mb-3 flex items-center gap-2">
                    <span className="text-lg">Your Questions/Topics</span>
                    {call.questions && call.questions.length > 0 && (
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-400/30">
                        {call.questions.length}
                      </span>
                    )}
                  </h3>

                  {call.questions && call.questions.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {call.questions.map((q: any) => (
                        <div
                          key={q.id}
                          className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                        >
                          <div className="flex-1">
                            <p className="text-white/90">{q.question_text}</p>
                            <p className="text-white/50 text-xs mt-1">
                              {q.added_by_name} • {formatRelativeTime(q.created_at)}
                            </p>
                          </div>
                          {q.discussed && (
                            <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-1" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {addingQuestion === call.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddQuestion(call.id)
                          }
                        }}
                        placeholder="What would you like to discuss?"
                        className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                        autoFocus
                      />
                      <button
                        onClick={() => handleAddQuestion(call.id)}
                        className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors border border-blue-400/30 flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setAddingQuestion(null)
                          setNewQuestion('')
                        }}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingQuestion(call.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg transition-colors border border-white/10 w-full"
                    >
                      <Plus className="h-4 w-4" />
                      Add Question/Topic
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-white text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Past Calls
        </h2>

        {pastCalls.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardContent className="p-12 text-center">
              <Phone className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/60">No past calls yet</p>
              <p className="text-white/40 text-sm mt-2">Call recordings and summaries will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pastCalls.map((call) => (
              <Card key={call.id} className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
                <CardHeader className="border-b border-white/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        {call.call_title || 'Strategy Call'}
                      </CardTitle>
                      <p className="text-white/60 text-sm mt-1">
                        {formatShortDate(call.call_date)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {call.recording_link && (
                        <a
                          href={call.recording_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors border border-purple-400/30 text-sm"
                        >
                          <Play className="h-3 w-3" />
                          Watch Recording
                        </a>
                      )}
                      {call.agenda_link && (
                        <a
                          href={call.agenda_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white/70 rounded-lg transition-colors border border-white/20 text-sm"
                        >
                          <FileText className="h-3 w-3" />
                          View Agenda
                        </a>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 space-y-6">
                  {call.approvals && call.approvals.length > 0 && (
                    <div>
                      <h4 className="text-white/90 font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        Approvals Needed
                        <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 text-xs rounded-full border border-orange-400/30">
                          {call.approvals.filter((a: any) => !a.approved).length} pending
                        </span>
                      </h4>
                      <div className="space-y-2">
                        {call.approvals.map((approval: any) => (
                          <label
                            key={approval.id}
                            className="flex items-start gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={approval.approved}
                              onChange={() => handleToggleApproval(approval.id, approval.approved)}
                              className="mt-1 rounded border-white/30 text-green-500 focus:ring-2 focus:ring-green-400/50 bg-white/10"
                            />
                            <div className="flex-1">
                              <p className={approval.approved ? 'text-white/60 line-through text-sm' : 'text-white/90 text-sm'}>
                                {approval.description}
                              </p>
                              {approval.approved && approval.approved_at && (
                                <p className="text-green-400 text-xs mt-1">
                                  Approved {new Date(approval.approved_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            {approval.approved && (
                              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {call.actionItems && call.actionItems.length > 0 && (
                    <div>
                      <h4 className="text-white/90 font-semibold mb-3 flex items-center gap-2">
                        <Circle className="h-4 w-4 text-blue-400" />
                        Your Action Items
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-400/30">
                          {call.actionItems.filter((a: any) => !a.completed).length} to do
                        </span>
                      </h4>
                      <div className="space-y-2">
                        {call.actionItems.map((item: any) => (
                          <label
                            key={item.id}
                            className="flex items-start gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => handleToggleActionItem(item.id, item.completed)}
                              className="mt-1 rounded border-white/30 text-green-500 focus:ring-2 focus:ring-green-400/50 bg-white/10"
                            />
                            <div className="flex-1">
                              <p className={item.completed ? 'text-white/60 line-through text-sm' : 'text-white/90 text-sm'}>
                                {item.item_text}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                {item.due_date && (
                                  <p className={`text-xs flex items-center gap-1 ${
                                    item.completed 
                                      ? 'text-white/40' 
                                      : new Date(item.due_date) < new Date() 
                                      ? 'text-red-400' 
                                      : 'text-white/60'
                                  }`}>
                                    <Clock className="h-3 w-3" />
                                    Due: {new Date(item.due_date).toLocaleDateString()}
                                  </p>
                                )}
                                {item.completed && item.completed_at && (
                                  <p className="text-green-400 text-xs">
                                    Completed {new Date(item.completed_at).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                            {item.completed && (
                              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {call.call_summary && (
                    <div>
                      <h4 className="text-white/90 font-semibold mb-3">Call Summary</h4>
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                          {call.call_summary}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {upcomingCalls.length === 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">No Upcoming Calls</h3>
            <p className="text-white/60 text-sm">
              Your next scheduled call will appear here with agenda and details
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
