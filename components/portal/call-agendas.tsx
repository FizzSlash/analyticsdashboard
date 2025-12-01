'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Phone, Calendar } from 'lucide-react'

interface CallAgendasProps {
  client: any
  userRole: 'client_user' | 'agency_admin'
}

export function CallAgendas({ client, userRole }: CallAgendasProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardContent className="p-12 text-center">
          <Phone className="h-16 w-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">Call Agendas</h3>
          <p className="text-white/60 text-sm">
            View upcoming calls, add questions, and track action items
          </p>
          <p className="text-white/40 text-xs mt-4">
            Feature coming soon - Database migration required
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
