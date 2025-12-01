'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Target } from 'lucide-react'

interface StrategicPlansProps {
  client: any
  userRole: 'client_user' | 'agency_admin'
}

export function StrategicPlans({ client, userRole }: StrategicPlansProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardContent className="p-12 text-center">
          <Target className="h-16 w-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">30/60/90 Day Plans</h3>
          <p className="text-white/60 text-sm">
            View your strategic roadmap and track progress
          </p>
          <p className="text-white/40 text-xs mt-4">
            Feature coming soon - Database migration required
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
