'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Phone, Calendar } from 'lucide-react'

interface CallAgendasProps {
  client: any
  userRole: string
}

export function CallAgendas({ client }: CallAgendasProps) {
  const [calls, setCalls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
            {call.call_summary && (
              <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-white/80 text-sm">{call.call_summary}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
