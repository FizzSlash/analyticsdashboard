'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart3, 
  Mail, 
  Users, 
  TrendingUp, 
  DollarSign,
  Zap,
  Shield,
  Calendar,
  ArrowUp,
  ArrowDown,
  Activity
} from 'lucide-react'

interface ModernDashboardProps {
  client: any
  data?: any
}

type TabType = 'dashboard' | 'campaigns' | 'flows' | 'list-growth' | 'deliverability'

export function ModernDashboard({ client, data }: ModernDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'campaigns', label: 'Campaigns', icon: Mail },
    { id: 'flows', label: 'Flows', icon: Zap },
    { id: 'list-growth', label: 'List Growth', icon: TrendingUp },
    { id: 'deliverability', label: 'Deliverability', icon: Shield },
  ] as const

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header with Glass Effect */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-700/90 backdrop-blur-sm"></div>
        <div className="relative px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {client.logo_url && (
                  <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <img 
                      src={client.logo_url} 
                      alt={`${client.brand_name} logo`}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-white">{client.brand_name}</h1>
                  <p className="text-blue-100">Email Marketing Analytics</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <div className="text-xs text-blue-200">Last Updated</div>
                  <div className="text-sm text-white font-medium">
                    {client.last_sync ? new Date(client.last_sync).toLocaleString() : 'Never'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="relative -mt-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/60 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl">
            <nav className="flex space-x-1 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-white/80 text-blue-700 shadow-md backdrop-blur-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <DashboardTab data={data} />}
          {activeTab === 'campaigns' && <CampaignsTab data={data} />}
          {activeTab === 'flows' && <FlowsTab data={data} />}
          {activeTab === 'list-growth' && <ListGrowthTab data={data} />}
          {activeTab === 'deliverability' && <DeliverabilityTab data={data} />}
        </div>
      </div>
    </div>
  )
}

// Dashboard Overview Tab
function DashboardTab({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Campaigns"
          value={data?.summary?.campaigns?.total_sent || 0}
          change={12}
          icon={<Mail className="w-5 h-5" />}
          trend="up"
        />
        <MetricCard
          title="Total Subscribers"
          value={data?.summary?.audience?.total_subscribers || 0}
          change={data?.summary?.audience?.growth_rate || 0}
          icon={<Users className="w-5 h-5" />}
          trend="up"
        />
        <MetricCard
          title="Avg Open Rate"
          value={`${(data?.summary?.campaigns?.avg_open_rate || 0).toFixed(1)}%`}
          change={2.3}
          icon={<Activity className="w-5 h-5" />}
          trend="up"
        />
        <MetricCard
          title="Total Revenue"
          value={`$${(data?.summary?.revenue?.total_revenue || 0).toLocaleString()}`}
          change={18.2}
          icon={<DollarSign className="w-5 h-5" />}
          trend="up"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue Trend" />
        <ChartCard title="Subscriber Growth" />
        <ChartCard title="Campaign Performance" />
        <ChartCard title="Engagement Metrics" />
      </div>
    </div>
  )
}

// Individual Tab Components
function CampaignsTab({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-white/60 backdrop-blur-lg rounded-xl border border-white/20 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Campaign Performance</h2>
        <p className="text-slate-600">Campaign analytics and performance metrics will be displayed here.</p>
      </div>
    </div>
  )
}

function FlowsTab({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-white/60 backdrop-blur-lg rounded-xl border border-white/20 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Flow Performance</h2>
        <p className="text-slate-600">Automated flow analytics and performance metrics will be displayed here.</p>
      </div>
    </div>
  )
}

function ListGrowthTab({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-white/60 backdrop-blur-lg rounded-xl border border-white/20 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">List Growth Analytics</h2>
        <p className="text-slate-600">Subscriber growth and list performance metrics will be displayed here.</p>
      </div>
    </div>
  )
}

function DeliverabilityTab({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-white/60 backdrop-blur-lg rounded-xl border border-white/20 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Email Deliverability</h2>
        <p className="text-slate-600">Deliverability metrics and inbox placement analytics will be displayed here.</p>
      </div>
    </div>
  )
}

// Reusable Components
function MetricCard({ title, value, change, icon, trend }: {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  trend?: 'up' | 'down'
}) {
  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-lg hover:shadow-xl transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100/50 rounded-lg">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
          </div>
        </div>
        
        {change !== undefined && (
          <div className={`flex items-center space-x-1 ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span className="text-sm font-medium">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </div>
  )
}

function ChartCard({ title }: { title: string }) {
  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
      <div className="h-64 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-lg flex items-center justify-center">
        <p className="text-slate-500">Chart will be displayed here</p>
      </div>
    </div>
  )
} 