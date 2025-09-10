'use client'

import { useState } from 'react'
import { Agency, Client, UserProfile } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  UserPlus, 
  Mail, 
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  User
} from 'lucide-react'

interface UserManagementProps {
  agency: Agency
  clients: Client[]
  clientUsers: (UserProfile & { clients?: { brand_name: string; brand_slug: string } })[]
}

interface InviteFormData {
  email: string
  client_id: string
  first_name: string
  last_name: string
}

export function UserManagement({ agency, clients, clientUsers: initialUsers }: UserManagementProps) {
  const [clientUsers, setClientUsers] = useState(initialUsers)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [formData, setFormData] = useState<InviteFormData>({
    email: '',
    client_id: '',
    first_name: '',
    last_name: ''
  })

  const resetForm = () => {
    setFormData({
      email: '',
      client_id: '',
      first_name: '',
      last_name: ''
    })
    setShowInviteForm(false)
    setError('')
    setSuccess('')
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate required fields
      if (!formData.email || !formData.client_id) {
        throw new Error('Email and client selection are required')
      }

      // Check if user already exists
      const { data: existingUser } = await supabase.auth.admin.getUserByEmail(formData.email)
      
      if (existingUser.user) {
        // User exists, check if they already have access to this client
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', existingUser.user.id)
          .eq('client_id', formData.client_id)
          .single()

        if (existingProfile) {
          throw new Error('User already has access to this client')
        }

        // Create user profile for existing user
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: existingUser.user.id,
            role: 'client_user',
            agency_id: agency.id,
            client_id: formData.client_id,
            first_name: formData.first_name,
            last_name: formData.last_name
          })

        if (profileError) throw profileError

        setSuccess('User granted access successfully!')
      } else {
        // Create new user with invite
        const { data: newUser, error: signUpError } = await supabase.auth.admin.createUser({
          email: formData.email,
          email_confirm: true,
          user_metadata: {
            first_name: formData.first_name,
            last_name: formData.last_name
          }
        })

        if (signUpError) throw signUpError

        if (newUser.user) {
          // Create user profile
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: newUser.user.id,
              role: 'client_user',
              agency_id: agency.id,
              client_id: formData.client_id,
              first_name: formData.first_name,
              last_name: formData.last_name
            })

          if (profileError) throw profileError

          // Send password reset email (acts as invitation)
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(
            formData.email,
            { redirectTo: `${window.location.origin}/login` }
          )

          if (resetError) throw resetError

          setSuccess('Invitation sent successfully! The user will receive an email to set their password.')
        }
      }

      // Refresh user list
      const { data: updatedUsers } = await supabase
        .from('user_profiles')
        .select(`
          *,
          clients:client_id (
            brand_name,
            brand_slug
          )
        `)
        .eq('agency_id', agency.id)
        .eq('role', 'client_user')

      setClientUsers(updatedUsers || [])
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName}? They will lose access to their dashboard.`)) {
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error

      setClientUsers(clientUsers.filter(u => u.id !== userId))
      setSuccess('User removed successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove user')
    } finally {
      setLoading(false)
    }
  }

  const resendInvite = async (email: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo: `${window.location.origin}/login` }
      )

      if (error) throw error

      setSuccess('Invitation resent successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend invitation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Invite users to access their client dashboards</p>
        </div>
        <button
          onClick={() => setShowInviteForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Invite User
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

      {/* Invite Form */}
      {showInviteForm && (
        <Card>
          <CardHeader>
            <CardTitle>Invite New User</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="user@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client *
                  </label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a client</option>
                    {clients.filter(c => c.is_active).map(client => (
                      <option key={client.id} value={client.id}>
                        {client.brand_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Doe"
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
                  Send Invitation
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

      {/* Users List */}
      <div className="space-y-4">
        {clientUsers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users invited yet</h3>
              <p className="text-gray-600 mb-4">
                Invite users to give them access to their client dashboards.
              </p>
              <button
                onClick={() => setShowInviteForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Invite Your First User
              </button>
            </CardContent>
          </Card>
        ) : (
          clientUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}` 
                          : 'Unnamed User'
                        }
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {/* We'd need to get email from auth.users table */}
                          User ID: {user.id.slice(0, 8)}...
                        </div>
                        {user.clients && (
                          <div>
                            Client: {user.clients.brand_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => resendInvite('user@example.com')} // Would need actual email
                      disabled={loading}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Resend Invitation"
                    >
                      <Mail className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleRemoveUser(
                        user.id, 
                        user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}` 
                          : 'this user'
                      )}
                      disabled={loading}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Remove User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How User Invitations Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 font-medium text-xs">1</span>
            </div>
            <div>
              <strong>Invite User:</strong> Enter the user's email and select which client they should have access to.
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 font-medium text-xs">2</span>
            </div>
            <div>
              <strong>Email Sent:</strong> The user receives an email with instructions to set their password.
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 font-medium text-xs">3</span>
            </div>
            <div>
              <strong>Dashboard Access:</strong> Once they set their password, they can access their client's dashboard directly.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
