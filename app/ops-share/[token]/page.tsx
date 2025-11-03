'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { OpsCalendar } from '@/components/ops/ops-calendar'
import { OpsPipeline } from '@/components/ops/ops-pipeline'
import { Loader2, Lock } from 'lucide-react'

export default function OpsSharePage() {
  const params = useParams()
  const token = params.token as string
  
  const [agency, setAgency] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'calendar' | 'pipeline'>('calendar')

  useEffect(() => {
    fetchOpsData()
  }, [token])

  const fetchOpsData = async () => {
    try {
      const response = await fetch(`/api/ops-share/${token}`)
      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Invalid or expired share link')
        return
      }

      setAgency(result.agency)
      setClients(result.clients)
    } catch (err) {
      setError('Failed to load Ops dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md border-white/20 rounded-xl p-12 text-center max-w-md">
          <Lock className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-white/70">{error}</p>
        </div>
      </div>
    )
  }

  const primaryColor = agency?.primary_color || '#3B82F6'
  const secondaryColor = agency?.secondary_color || '#1D4ED8'

  return (
    <div className="min-h-screen" style={{
      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
    }}>
      {/* Header */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Operations Dashboard</h1>
              <p className="text-white/70">{agency?.agency_name} • Shared Access</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView('calendar')}
                className={`px-4 py-2 rounded-lg ${view === 'calendar' ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              >
                Calendar
              </button>
              <button
                onClick={() => setView('pipeline')}
                className={`px-4 py-2 rounded-lg ${view === 'pipeline' ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              >
                Pipeline
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {view === 'calendar' ? (
          <OpsCalendar clients={clients} selectedClient="all" />
        ) : (
          <OpsPipeline clients={clients} selectedClient="all" />
        )}
      </div>
    </div>
  )
}

