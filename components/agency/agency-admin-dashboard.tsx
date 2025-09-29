'use client'

import { useState } from 'react'
import { Agency, Client, UserProfile } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogoutButton } from '@/components/auth/logout-button'
import { ClientManagement } from './client-management'
import { UserManagement } from './user-management'
import { AgencySettings } from './agency-settings'
import { CleanPortalDashboard } from '../portal/clean-portal-dashboard'
import { 
  Users, 
  Building2, 
  Settings, 
  BarChart3,
  Plus,
  UserPlus,
  Calendar,
  Mail
} from 'lucide-react'

interface AgencyAdminDashboardProps {
  agency: Agency
  clients: Client[]
  clientUsers: (UserProfile & { clients?: { brand_name: string; brand_slug: string } })[]
}

type ActiveTab = 'overview' | 'portal' | 'clients' | 'users' | 'settings'

export function AgencyAdminDashboard({ agency, clients, clientUsers }: AgencyAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')

  const activeClients = clients.filter(c => c.is_active)
  const totalRevenue = 0 // This would be calculated from client metrics
  const totalCampaigns = 0 // This would be calculated from client metrics

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'portal', label: 'Campaign Portal', icon: Calendar },
    { id: 'clients', label: 'Clients', icon: Building2 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div 
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6"
        style={{
          background: `linear-gradient(135deg, ${agency.primary_color} 0%, ${agency.secondary_color} 100%)`
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {agency.logo_url && (
                <img 
                  src={agency.logo_url} 
                  alt={`${agency.agency_name} logo`}
                  className="h-12 w-auto"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">{agency.agency_name}</h1>
                <p className="text-blue-100">Agency Admin Dashboard</p>
              </div>
            </div>
            <LogoutButton className="bg-white/10 hover:bg-white/20 text-white" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeClients.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {clients.length - activeClients.length} inactive
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Client Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{clientUsers.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Total user accounts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$0</div>
                  <p className="text-xs text-muted-foreground">
                    Across all clients
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Total campaigns sent
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <button
                    onClick={() => setActiveTab('clients')}
                    className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
                  >
                    <Plus className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-900">Add New Client</div>
                      <div className="text-sm text-blue-600">Create a new client dashboard</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('users')}
                    className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
                  >
                    <UserPlus className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium text-green-900">Invite User</div>
                      <div className="text-sm text-green-600">Give client access to their dashboard</div>
                    </div>
                  </button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 text-center py-8">
                    No recent activity to display
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Client List Preview */}
            {clients.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Clients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {clients.slice(0, 5).map((client) => (
                      <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {client.logo_url && (
                            <img 
                              src={client.logo_url} 
                              alt={`${client.brand_name} logo`}
                              className="h-8 w-8 rounded"
                            />
                          )}
                          <div>
                            <div className="font-medium">{client.brand_name}</div>
                            <div className="text-sm text-gray-600">/{client.brand_slug}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            client.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {client.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <a 
                            href={`/client/${client.brand_slug}`}
                            target="_blank"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View Dashboard →
                          </a>
                        </div>
                      </div>
                    ))}
                    {clients.length > 5 && (
                      <button
                        onClick={() => setActiveTab('clients')}
                        className="w-full text-center text-blue-600 hover:text-blue-800 text-sm py-2"
                      >
                        View all {clients.length} clients →
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'clients' && (
          <ClientManagement agency={agency} clients={clients} />
        )}

        {activeTab === 'users' && (
          <UserManagement agency={agency} clients={clients} clientUsers={clientUsers} />
        )}

        {activeTab === 'portal' && (
          <CleanPortalDashboard 
            user={{ agency: agency }}
            userRole="agency_admin"
            allClients={activeClients}
          />
        )}

        {activeTab === 'settings' && (
          <AgencySettings agency={agency} />
        )}
      </div>
    </div>
  )
}
