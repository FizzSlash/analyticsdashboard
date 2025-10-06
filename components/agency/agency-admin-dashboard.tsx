'use client'

import { useState } from 'react'
import { Agency, Client, UserProfile } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogoutButton } from '@/components/auth/logout-button'
import { ClientManagement } from './client-management'
import { UserManagement } from './user-management'
import { AgencySettings } from './agency-settings'
import { 
  Users, 
  Building2, 
  Settings, 
  BarChart3,
  Plus,
  UserPlus,
  RefreshCw,
  RotateCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface AgencyAdminDashboardProps {
  agency: Agency
  clients: Client[]
  clientUsers: (UserProfile & { clients?: { brand_name: string; brand_slug: string } })[]
}

type ActiveTab = 'overview' | 'clients' | 'users' | 'settings'

export function AgencyAdminDashboard({ agency, clients, clientUsers }: AgencyAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [syncingAll, setSyncingAll] = useState(false)
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, currentClient: '' })
  const [syncResults, setSyncResults] = useState<{ success: string[], failed: string[] }>({ success: [], failed: [] })

  const activeClients = clients.filter(c => c.is_active)
  const totalRevenue = 0 // This would be calculated from client metrics
  const totalCampaigns = 0 // This would be calculated from client metrics

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'clients', label: 'Clients', icon: Building2 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const

  const handleSyncAllClients = async () => {
    setSyncingAll(true)
    setSyncProgress({ current: 0, total: activeClients.length, currentClient: '' })
    setSyncResults({ success: [], failed: [] })

    for (let i = 0; i < activeClients.length; i++) {
      const client = activeClients[i]
      setSyncProgress({ current: i + 1, total: activeClients.length, currentClient: client.brand_name })

      try {
        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId: client.brand_slug })
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        setSyncResults(prev => ({ ...prev, success: [...prev.success, client.brand_name] }))
      } catch (error) {
        console.error(`Failed to sync ${client.brand_name}:`, error)
        setSyncResults(prev => ({ ...prev, failed: [...prev.failed, client.brand_name] }))
      }

      // Add delay between syncs to avoid rate limiting
      if (i < activeClients.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    setSyncingAll(false)
  }

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
            <div className="flex items-center gap-3">
              <button
                onClick={handleSyncAllClients}
                disabled={syncingAll || activeClients.length === 0}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncingAll ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin" />
                    Syncing {syncProgress.current}/{syncProgress.total}
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Sync All Clients ({activeClients.length})
                  </>
                )}
              </button>
              <LogoutButton className="bg-white/10 hover:bg-white/20 text-white" />
            </div>
          </div>
          
          {/* Sync Progress Bar */}
          {syncingAll && (
            <div className="mt-4 bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-medium">
                  Syncing: {syncProgress.currentClient}
                </span>
                <span className="text-white/80 text-sm">
                  {syncProgress.current} / {syncProgress.total}
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Sync Results Card */}
        {!syncingAll && (syncResults.success.length > 0 || syncResults.failed.length > 0) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {syncResults.failed.length === 0 ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Sync Completed Successfully
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    Sync Completed with Issues
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {syncResults.success.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-1">
                      ✅ Successfully synced {syncResults.success.length} client{syncResults.success.length !== 1 ? 's' : ''}
                    </p>
                    <div className="text-xs text-gray-600 space-x-2">
                      {syncResults.success.map((name, i) => (
                        <span key={i} className="inline-block">{name}{i < syncResults.success.length - 1 ? ',' : ''}</span>
                      ))}
                    </div>
                  </div>
                )}
                {syncResults.failed.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-700 mb-1">
                      ❌ Failed to sync {syncResults.failed.length} client{syncResults.failed.length !== 1 ? 's' : ''}
                    </p>
                    <div className="text-xs text-gray-600 space-x-2">
                      {syncResults.failed.map((name, i) => (
                        <span key={i} className="inline-block">{name}{i < syncResults.failed.length - 1 ? ',' : ''}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
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

        {activeTab === 'settings' && (
          <AgencySettings agency={agency} />
        )}
      </div>
    </div>
  )
}
