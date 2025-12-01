'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Phone, Calendar, Plus, Send, X, MessageSquare } from 'lucide-react'

interface CallAgendasProps {
  client: any
  userRole: string
}

export function CallAgendas({ client }: CallAgendasProps) {
  const [calls, setCalls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addingQuestionFor, setAddingQuestionFor] = useState<string | null>(null)
  const [questionText, setQuestionText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchCalls() {
      if (!client?.id) return
      
      try {
        const res = await fetch(`/api/call-agendas?clientId=${client.id}`)
        const data = await res.json()
        if (data.success) {
          const all = [...(data.upcomingCalls || []), ...(data.pastCalls || [])]
          setCalls(all)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchCalls()
  }, [client?.id])

  const reloadCalls = async () => {
    if (!client?.id) return
    
    try {
      const res = await fetch(`/api/call-agendas?clientId=${client.id}`)
      const data = await res.json()
      if (data.success) {
        const all = [...(data.upcomingCalls || []), ...(data.pastCalls || [])]
        setCalls(all)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmitQuestion = async (callId: string) => {
    if (!questionText.trim()) return
    
    setSubmitting(true)
    try {
      await fetch('/api/call-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          call_id: callId,
          client_id: client.id,
          question_text: questionText,
          added_by_name: client.brand_name || 'Client',
          added_by_client: true
        })
      })
      setQuestionText('')
      setAddingQuestionFor(null)
      reloadCalls()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    )
  }

  if (calls.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardContent className="p-12 text-center">
          <Phone className="h-16 w-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">No Calls Yet</h3>
          <p className="text-white/60 text-sm">
            Call agendas and recordings will appear here
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-white text-2xl font-bold flex items-center gap-2">
        <Calendar className="h-6 w-6" />
        Call Agendas
      </h2>
      {calls.map((call) => (
        <Card key={call.id} className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-6">
            <h3 className="text-white text-lg font-semibold mb-2">
              {call.call_title || 'Strategy Call'}
            </h3>
            <p className="text-white/60 text-sm">
              {call.call_date} • {call.call_time || 'Time TBD'}
            </p>
            {call.agenda_link && (
              <a 
                href={call.agenda_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm hover:bg-blue-500/30"
              >
                View Agenda
              </a>
            )}
            {call.recording_link && (
              <a 
                href={call.recording_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 ml-2 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg text-sm hover:bg-purple-500/30"
              >
                Watch Recording
              </a>
            )}
            {call.questions && call.questions.length > 0 && (
              <div className="mt-4">
                <h4 className="text-white/80 text-sm font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Your Questions/Topics ({call.questions.length})
                </h4>
                <div className="space-y-2">
                  {call.questions.map((q: any) => (
                    <div key={q.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-white/90 text-sm">{q.question_text}</p>
                      <p className="text-white/50 text-xs mt-1">{q.added_by_name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {addingQuestionFor === call.id ? (
              <div className="mt-4 space-y-2">
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="What would you like to discuss on this call?"
                  rows={3}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSubmitQuestion(call.id)}
                    disabled={submitting || !questionText.trim()}
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm border border-blue-400/30 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                  <button
                    onClick={() => {
                      setAddingQuestionFor(null)
                      setQuestionText('')
                    }}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg text-sm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingQuestionFor(call.id)}
                className="mt-4 w-full px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg text-sm border border-white/10 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Question/Topic
              </button>
            )}
            {call.call_summary && (
              <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                <h4 className="text-white/80 text-sm font-semibold mb-2">Call Summary</h4>
                <p className="text-white/80 text-sm">{call.call_summary}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
