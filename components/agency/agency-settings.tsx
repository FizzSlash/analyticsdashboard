'use client'

import { useState } from 'react'
import { Agency } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Palette,
  Image,
  Settings
} from 'lucide-react'

interface AgencySettingsProps {
  agency: Agency
}

interface SettingsFormData {
  agency_name: string
  logo_url: string
  primary_color: string
  secondary_color: string
  bar_chart_color: string
  line_chart_color: string
  ui_accent_color: string
  background_image_url: string
  custom_domain: string
}

export function AgencySettings({ agency: initialAgency }: AgencySettingsProps) {
  const [agency, setAgency] = useState(initialAgency)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Using API calls instead of direct supabase calls

  const [formData, setFormData] = useState<SettingsFormData>({
    agency_name: agency.agency_name,
    logo_url: agency.logo_url || '',
    primary_color: agency.primary_color,
    secondary_color: agency.secondary_color,
    bar_chart_color: agency.bar_chart_color || '#3B82F6',
    line_chart_color: agency.line_chart_color || '#34D399',
    ui_accent_color: agency.ui_accent_color || '#6366F1',
    background_image_url: agency.background_image_url || '',
    custom_domain: agency.custom_domain || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/agencies/${agency.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agency_name: formData.agency_name,
          logo_url: formData.logo_url || undefined,
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          bar_chart_color: formData.bar_chart_color,
          line_chart_color: formData.line_chart_color,
          ui_accent_color: formData.ui_accent_color,
          background_image_url: formData.background_image_url || undefined,
          custom_domain: formData.custom_domain || undefined
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update agency')
      }

      // Update local state
      // Update local state with the returned data
      setAgency({
        ...agency,
        ...result.agency
      })

      setSuccess('Settings updated successfully!')
      
      // Force page refresh to update header logos, etc.
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      agency_name: agency.agency_name,
      logo_url: agency.logo_url || '',
      primary_color: agency.primary_color,
      secondary_color: agency.secondary_color,
      bar_chart_color: agency.bar_chart_color || '#3B82F6',
      line_chart_color: agency.line_chart_color || '#34D399',
      ui_accent_color: agency.ui_accent_color || '#6366F1',
      background_image_url: agency.background_image_url || '',
      custom_domain: agency.custom_domain || ''
    })
    setError('')
    setSuccess('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Agency Settings</h2>
        <p className="text-white/60">Customize your agency's branding and configuration</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-300">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-md text-green-300">
          <CheckCircle className="h-4 w-4" />
          {success}
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="h-5 w-5 text-white/70" />
            <h3 className="text-xl font-semibold text-white">Basic Information</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Agency Name
              </label>
              <input
                type="text"
                value={formData.agency_name}
                onChange={(e) => setFormData({ ...formData, agency_name: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-md focus:ring-2 focus:ring-white/30 focus:border-white/40 placeholder-white/40"
                placeholder="Your Agency Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Custom Domain (Optional)
              </label>
              <input
                type="text"
                value={formData.custom_domain}
                onChange={(e) => setFormData({ ...formData, custom_domain: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-md focus:ring-2 focus:ring-white/30 focus:border-white/40 placeholder-white/40"
                placeholder="dashboard.youragency.com"
              />
              <p className="text-xs text-white/50 mt-1">
                Configure a custom domain for your client dashboards (requires DNS setup)
              </p>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Palette className="h-5 w-5 text-white/70" />
            <h3 className="text-xl font-semibold text-white">Branding</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Logo URL
              </label>
              <input
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-md focus:ring-2 focus:ring-white/30 focus:border-white/40 placeholder-white/40"
                placeholder="https://example.com/logo.png"
              />
              {formData.logo_url && (
                <div className="mt-2">
                  <img 
                    src={formData.logo_url} 
                    alt="Logo preview"
                    className="h-12 w-auto border rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="w-12 h-10 border border-white/30 rounded cursor-pointer bg-white/10"
                  />
                  <input
                    type="text"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-white/20 bg-white/10 text-white rounded-md focus:ring-2 focus:ring-white/30 focus:border-white/40"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Secondary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    className="w-12 h-10 border border-white/30 rounded cursor-pointer bg-white/10"
                  />
                  <input
                    type="text"
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-white/20 bg-white/10 text-white rounded-md focus:ring-2 focus:ring-white/30 focus:border-white/40"
                    placeholder="#EF4444"
                  />
                </div>
              </div>
            </div>

            {/* Chart & UI Colors */}
            <div className="pt-4 border-t border-white/20">
              <h4 className="text-sm font-semibold text-white mb-4">Chart & UI Colors</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Bar Chart Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.bar_chart_color}
                      onChange={(e) => setFormData({ ...formData, bar_chart_color: e.target.value })}
                      className="w-12 h-10 border border-white/30 rounded cursor-pointer bg-white/10"
                    />
                    <input
                      type="text"
                      value={formData.bar_chart_color}
                      onChange={(e) => setFormData({ ...formData, bar_chart_color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-white/20 bg-white/10 text-white rounded-md text-sm focus:ring-2 focus:ring-white/30"
                      placeholder="#3B82F6"
                    />
                  </div>
                  <p className="text-xs text-white/50 mt-1">All bar charts & graphs</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Line Chart Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.line_chart_color}
                      onChange={(e) => setFormData({ ...formData, line_chart_color: e.target.value })}
                      className="w-12 h-10 border border-white/30 rounded cursor-pointer bg-white/10"
                    />
                    <input
                      type="text"
                      value={formData.line_chart_color}
                      onChange={(e) => setFormData({ ...formData, line_chart_color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-white/20 bg-white/10 text-white rounded-md text-sm focus:ring-2 focus:ring-white/30"
                      placeholder="#34D399"
                    />
                  </div>
                  <p className="text-xs text-white/50 mt-1">All line charts & trends</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    UI Accent Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.ui_accent_color}
                      onChange={(e) => setFormData({ ...formData, ui_accent_color: e.target.value })}
                      className="w-12 h-10 border border-white/30 rounded cursor-pointer bg-white/10"
                    />
                    <input
                      type="text"
                      value={formData.ui_accent_color}
                      onChange={(e) => setFormData({ ...formData, ui_accent_color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-white/20 bg-white/10 text-white rounded-md text-sm focus:ring-2 focus:ring-white/30"
                      placeholder="#6366F1"
                    />
                  </div>
                  <p className="text-xs text-white/50 mt-1">Success, errors, highlights, badges</p>
                </div>
              </div>
            </div>

            {/* Color Preview */}
            <div className="p-6 rounded-lg border mt-6" style={{
              background: `linear-gradient(135deg, ${formData.primary_color} 0%, ${formData.secondary_color} 100%)`
            }}>
              <div className="text-white font-medium mb-2">Brand Gradient Preview</div>
              <div className="text-white/80 text-sm mb-4">This is how your primary and secondary colors will appear together</div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-8 rounded" style={{ backgroundColor: formData.bar_chart_color }}></div>
                  <span className="text-white/80 text-xs">Bar Charts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-8 rounded border-2" style={{ borderColor: formData.line_chart_color }}></div>
                  <span className="text-white/80 text-xs">Line Charts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: formData.ui_accent_color }}></div>
                  <span className="text-white/80 text-xs">UI Accents</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Image */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Image className="h-5 w-5 text-white/70" />
            <h3 className="text-xl font-semibold text-white">Background Image</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Background Image URL (Optional)
              </label>
              <input
                type="url"
                value={formData.background_image_url}
                onChange={(e) => setFormData({ ...formData, background_image_url: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-md focus:ring-2 focus:ring-white/30 focus:border-white/40 placeholder-white/40"
                placeholder="https://example.com/background.jpg"
              />
              <p className="text-xs text-white/50 mt-1">
                Background image for client dashboards (will be overlaid with gradient)
              </p>
              {formData.background_image_url && (
                <div className="mt-2 relative">
                  <img 
                    src={formData.background_image_url} 
                    alt="Background preview"
                    className="w-full h-32 object-cover border rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <div 
                    className="absolute inset-0 rounded"
                    style={{
                      background: `linear-gradient(135deg, ${formData.primary_color}CC 0%, ${formData.secondary_color}CC 100%)`
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-white font-medium">
                    Background Preview with Overlay
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <Save className="h-4 w-4" />
            Save Changes
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-md border border-white/20 transition-colors"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Agency Info */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Agency Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Agency ID:</span>
            <span className="font-mono text-xs text-white">{agency.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Slug:</span>
            <span className="font-mono text-white">/{agency.agency_slug}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Created:</span>
            <span className="text-white">{new Date(agency.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              agency.is_active 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
            }`}>
              {agency.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
