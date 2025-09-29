'use client'

import { CleanPortalDashboard } from './clean-portal-dashboard'

interface PortalDashboardProps {
  client: any
  data?: any
}

export function PortalDashboard({ client, data }: PortalDashboardProps) {
  return (
    <CleanPortalDashboard 
      user={{ client: client }}
      userRole="client_user"
    />
  )
}