'use client'

import { useState } from 'react'
import { Agency } from '@/lib/types'
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
          background_image_url: formData.background_image_url || undefined,
          custom_domain: formData.custom_domain || undefined
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update agency')
      }

      // Update local state
      setAgency({
        ...agency,
        agency_name: formData.agency_name,
        logo_url: formData.logo_url || undefined,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        background_image_url: formData.background_image_url || undefined,
        custom_domain: formData.custom_domain || undefined
      })

      setSuccess('Settings updated successfully!')
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
        <h2 className="text-2xl font-bold text-gray-900">Agency Settings</h2>
        <p className="text-gray-600">Customize your agency's branding and configuration</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
          <CheckCircle className="h-4 w-4" />
          {success}
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agency Name
              </label>
              <input
                type="text"
                value={formData.agency_name}
                onChange={(e) => setFormData({ ...formData, agency_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your Agency Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Domain (Optional)
              </label>
              <input
                type="text"
                value={formData.custom_domain}
                onChange={(e) => setFormData({ ...formData, custom_domain: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="dashboard.youragency.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Configure a custom domain for your client dashboards (requires DNS setup)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Branding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo URL
              </label>
              <input
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secondary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#EF4444"
                  />
                </div>
              </div>
            </div>

            {/* Color Preview */}
            <div className="p-4 rounded-lg border" style={{
              background: `linear-gradient(135deg, ${formData.primary_color} 0%, ${formData.secondary_color} 100%)`
            }}>
              <div className="text-white font-medium">Color Preview</div>
              <div className="text-white/80 text-sm">This is how your brand colors will appear</div>
            </div>
          </CardContent>
        </Card>

        {/* Background Image */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Background Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background Image URL (Optional)
              </label>
              <input
                type="url"
                value={formData.background_image_url}
                onChange={(e) => setFormData({ ...formData, background_image_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/background.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
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
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <Save className="h-4 w-4" />
            Save Changes
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Agency Info */}
      <Card>
        <CardHeader>
          <CardTitle>Agency Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Agency ID:</span>
            <span className="font-mono text-xs">{agency.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Slug:</span>
            <span className="font-mono">/{agency.agency_slug}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Created:</span>
            <span>{new Date(agency.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              agency.is_active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {agency.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
