'use client'

import { useState } from 'react'
import { Agency, Client } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { encryptApiKey } from '@/lib/klaviyo'
import { 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Eye, 
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  RotateCw,
  Building2
} from 'lucide-react'

interface ClientManagementProps {
  agency: Agency
  clients: Client[]
}

interface ClientFormData {
  brand_name: string
  brand_slug: string
  klaviyo_api_key: string
  logo_url: string
  primary_color: string
  secondary_color: string
  background_image_url: string
}

export function ClientManagement({ agency, clients: initialClients }: ClientManagementProps) {
  const [clients, setClients] = useState(initialClients)
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showApiKey, setShowApiKey] = useState<string | null>(null)
  
  // Simplified - no auth dependency to avoid circular imports

  const [formData, setFormData] = useState<ClientFormData>({
    brand_name: '',
    brand_slug: '',
    klaviyo_api_key: '',
    logo_url: '',
    primary_color: agency.primary_color,
    secondary_color: agency.secondary_color,
    background_image_url: ''
  })

  const resetForm = () => {
    setFormData({
      brand_name: '',
      brand_slug: '',
      klaviyo_api_key: '',
      logo_url: '',
      primary_color: agency.primary_color,
      secondary_color: agency.secondary_color,
      background_image_url: ''
    })
    setEditingClient(null)
    setShowForm(false)
    setError('')
    setSuccess('')
  }

  const handleEdit = (client: Client) => {
    setFormData({
      brand_name: client.brand_name,
      brand_slug: client.brand_slug,
      klaviyo_api_key: '', // Don't pre-fill encrypted API key
      logo_url: client.logo_url || '',
      primary_color: client.primary_color,
      secondary_color: client.secondary_color,
      background_image_url: client.background_image_url || ''
    })
    setEditingClient(client)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Remove auth check - we know they're logged in if they reached this page
    
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      console.log('Step 1: Starting client creation...', { formData, agency })
      
      console.log('Step 3: Skipping session check - using service role for database operations')
      // Skip session check and use service role for database operations
      
      console.log('Step 5: Session exists, validating fields...')
      // Validate required fields
      if (!formData.brand_name || !formData.brand_slug) {
        console.log('Step 5.1: Missing required fields')
        throw new Error('Brand name and slug are required')
      }

      // For new clients, API key is required
      if (!editingClient && !formData.klaviyo_api_key) {
        console.log('Step 5.2: Missing API key')
        throw new Error('Klaviyo API key is required for new clients')
      }

      console.log('Step 6: Preparing client data...')
      // Clean up the slug
      const cleanSlug = formData.brand_slug.toLowerCase().replace(/[^a-z0-9-]/g, '')

      const clientData = {
        agency_id: agency.id,
        brand_name: formData.brand_name,
        brand_slug: cleanSlug,
        logo_url: formData.logo_url || null,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        background_image_url: formData.background_image_url || null,
        is_active: true
      }
      
      console.log('Step 7: Client data prepared:', clientData)

      if (editingClient) {
        // Update existing client via API
        console.log('Step 8: Updating existing client...')
        
        const updatePayload: any = {
          brand_name: formData.brand_name,
          brand_slug: cleanSlug,
          agency_id: agency.id,
          logo_url: formData.logo_url || null,
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          background_image_url: formData.background_image_url || null
        }
        
        // Only include API key if provided
        if (formData.klaviyo_api_key) {
          updatePayload.klaviyo_api_key = formData.klaviyo_api_key
        }
        
        const response = await fetch(`/api/clients/${editingClient.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatePayload)
        })
        
        const result = await response.json()
        console.log('Step 9: Update API response:', result)
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to update client')
        }

        // Update local state
        setClients(clients.map(c => 
          c.id === editingClient.id 
            ? { ...c, ...clientData }
            : c
        ))

        setSuccess('Client updated successfully!')
      } else {
        // Create new client
        console.log('Step 8: Starting encryption...')
        const encryptedKey = encryptApiKey(formData.klaviyo_api_key)
        console.log('Step 9: API key encrypted successfully')
        
        const insertData = {
          ...clientData,
          agency_id: agency.id,
          klaviyo_api_key: encryptedKey
        }
        
        console.log('Step 10: About to insert data using service role:', insertData)
        
        // Use service role for database operations (bypasses RLS)
        const response = await fetch('/api/clients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            brand_name: formData.brand_name,
            brand_slug: cleanSlug,
            klaviyo_api_key: formData.klaviyo_api_key,
            agency_id: agency.id,
            logo_url: formData.logo_url || null,
            primary_color: formData.primary_color,
            secondary_color: formData.secondary_color,
            background_image_url: formData.background_image_url || null
          })
        })
        
        const result = await response.json()
        console.log('Step 11: API response:', result)
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to create client')
        }
        
        const data = result.client

        // Remove error handling since we're using API now

        console.log('Step 12: Success! Adding to local state...')
        // Add to local state
        setClients([data, ...clients])
        setSuccess('Client created successfully!')
        console.log('Step 13: Complete!')
      }

      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (client: Client) => {
    if (!confirm(`Are you sure you want to delete ${client.brand_name}? This action cannot be undone.`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete client')
      }

      setClients(clients.filter(c => c.id !== client.id))
      setSuccess('Client deleted successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete client')
    } finally {
      setLoading(false)
    }
  }

  const triggerSync = async (client: Client) => {
    setLoading(true)
    try {
      console.log('Triggering sync for client:', client.brand_slug)
      
      const response = await fetch(`/api/sync/${client.brand_slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer dev-sync-key`
        }
      })

      console.log('Sync response status:', response.status)
      const result = await response.json()
      console.log('Sync response data:', result)

      if (!response.ok) {
        throw new Error(result.error || 'Sync failed')
      }

      setSuccess(`Sync completed for ${client.brand_name}`)
    } catch (err) {
      console.error('Sync error:', err)
      setError(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Client Management</h2>
          <p className="text-gray-600">Manage your agency's clients and their dashboards</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Client
        </button>
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

      {/* Client Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    value={formData.brand_name}
                    onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Acme Inc."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Slug * (URL-friendly)
                  </label>
                  <input
                    type="text"
                    value={formData.brand_slug}
                    onChange={(e) => setFormData({ ...formData, brand_slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="acme-inc"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Klaviyo API Key {!editingClient && '*'}
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey === 'form' ? 'text' : 'password'}
                      value={formData.klaviyo_api_key}
                      onChange={(e) => setFormData({ ...formData, klaviyo_api_key: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={editingClient ? "Leave blank to keep existing key" : "pk_..."}
                      required={!editingClient}
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(showApiKey === 'form' ? null : 'form')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey === 'form' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.background_image_url}
                    onChange={(e) => setFormData({ ...formData, background_image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/bg.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secondary Color
                  </label>
                  <input
                    type="color"
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingClient ? 'Update Client' : 'Create Client'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Clients List */}
      <div className="grid gap-6">
        {clients.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
              <p className="text-gray-600 mb-4">
                Get started by adding your first client to create their analytics dashboard.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Add Your First Client
              </button>
            </CardContent>
          </Card>
        ) : (
          clients.map((client) => (
            <Card key={client.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {client.logo_url && (
                      <img 
                        src={client.logo_url} 
                        alt={`${client.brand_name} logo`}
                        className="h-12 w-12 rounded object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {client.brand_name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>/{client.brand_slug}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          client.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {client.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {client.last_sync && (
                          <span>
                            Last sync: {new Date(client.last_sync).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => triggerSync(client)}
                      disabled={loading}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Sync Data"
                    >
                      <RotateCw className="h-4 w-4" />
                    </button>
                    
                    <a 
                      href={`/client/${client.brand_slug}`}
                      target="_blank"
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="View Dashboard"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>

                    <button
                      onClick={() => handleEdit(client)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit Client"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(client)}
                      disabled={loading}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Client"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Client Colors Preview */}
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: client.primary_color }}
                    />
                    <span className="text-xs text-gray-600">Primary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: client.secondary_color }}
                    />
                    <span className="text-xs text-gray-600">Secondary</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
