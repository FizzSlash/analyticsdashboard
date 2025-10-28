'use client'

import { useState } from 'react'
import { Agency, Client, UserProfile } from '@/lib/supabase'
import { ClientManagement } from './client-management'
import { UserManagement } from './user-management'
import { AgencySettings } from './agency-settings'
import { SyncDebugPanel } from './SyncDebugPanel'
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
  AlertCircle,
  ExternalLink
} from 'lucide-react'

interface AgencyAdminDashboardProps {
  agency: Agency
  clients: Client[]
  clientUsers: (UserProfile & { clients?: { brand_name: string; brand_slug: string } })[]
}

type ActiveTab = 'overview' | 'clients' | 'users' | 'settings'

export function AgencyAdminDashboard({ agency, clients, clientUsers }: AgencyAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('clients')
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
    <div className="space-y-6">
      {/* Sync All Button */}
      <div className="flex justify-end">
              <button
                onClick={handleSyncAllClients}
                disabled={syncingAll || activeClients.length === 0}
          className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
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
          </div>
          
          {/* Sync Progress Bar */}
          {syncingAll && (
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
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

      {/* Navigation Tabs - Glassmorphism */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-1">
        <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center justify-center gap-2 px-6 py-3 font-medium transition-all rounded-md flex-1
                  ${activeTab === tab.id 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                  }
                `}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
        </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
          {/* Stats Cards - Glassmorphism */}
          <div className="grid gap-6 md:grid-cols-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-white/70">Active Clients</div>
                <Building2 className="h-4 w-4 text-white/50" />
              </div>
              <div className="text-3xl font-bold text-white">{activeClients.length}</div>
              <p className="text-xs text-white/50 mt-1">
                    {clients.length - activeClients.length} inactive
                  </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-white/70">Client Users</div>
                <Users className="h-4 w-4 text-white/50" />
              </div>
              <div className="text-3xl font-bold text-white">{clientUsers.length}</div>
              <p className="text-xs text-white/50 mt-1">Total user accounts</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-white/70">Total Revenue</div>
                <BarChart3 className="h-4 w-4 text-white/50" />
              </div>
              <div className="text-3xl font-bold text-white">$0</div>
              <p className="text-xs text-white/50 mt-1">Across all clients</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-white/70">Campaigns</div>
                <BarChart3 className="h-4 w-4 text-white/50" />
              </div>
              <div className="text-3xl font-bold text-white">0</div>
              <p className="text-xs text-white/50 mt-1">Total campaigns sent</p>
            </div>
          </div>

          {/* Quick Actions + Activity - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('clients')}
                  className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left border border-white/10"
                  >
                  <Plus className="h-5 w-5 text-white/70" />
                    <div>
                    <div className="font-medium text-white">Add New Client</div>
                    <div className="text-sm text-white/60">Create a new client dashboard</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('users')}
                  className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left border border-white/10"
                  >
                  <UserPlus className="h-5 w-5 text-white/70" />
                    <div>
                    <div className="font-medium text-white">Invite User</div>
                    <div className="text-sm text-white/60">Give client access to their dashboard</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Clients List */}
            {clients.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Your Clients</h3>
                  <div className="space-y-3">
                    {clients.slice(0, 5).map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10">
                        <div className="flex items-center gap-3">
                          {client.logo_url && (
                            <img 
                              src={client.logo_url} 
                              alt={`${client.brand_name} logo`}
                              className="h-8 w-8 rounded"
                            />
                          )}
                          <div>
                          <div className="font-medium text-white">{client.brand_name}</div>
                          <div className="text-sm text-white/60">/{client.brand_slug}</div>
                        </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            client.is_active 
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                            : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                          }`}>
                            {client.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <a 
                            href={`/client/${client.brand_slug}`}
                            target="_blank"
                          className="text-white/80 hover:text-white text-sm flex items-center gap-1"
                          >
                          View →
                          <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                    {clients.length > 5 && (
                      <button
                        onClick={() => setActiveTab('clients')}
                      className="w-full text-center text-white/80 hover:text-white text-sm py-2"
                      >
                        View all {clients.length} clients →
                      </button>
                    )}
                  </div>
              </div>
            )}
          </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <>
            <ClientManagement agency={agency} clients={clients} />
            <SyncDebugPanel clients={clients.filter(c => c.is_active)} />
          </>
        )}

        {activeTab === 'users' && (
          <UserManagement agency={agency} clients={clients} clientUsers={clientUsers} />
        )}

        {activeTab === 'settings' && (
          <AgencySettings agency={agency} />
        )}
    </div>
  )
}

