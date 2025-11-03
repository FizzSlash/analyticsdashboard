'use client'

import { useState } from 'react'
import { Agency, Client, UserProfile } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  UserPlus, 
  Mail, 
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  User,
  Copy,
  X,
  Link2
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
  role: 'client_user' | 'employee'
  employee_type?: 'copywriter' | 'designer' | 'implementor' | 'project_manager' | 'qa'
}

export function UserManagement({ agency, clients, clientUsers: initialUsers }: UserManagementProps) {
  const [clientUsers, setClientUsers] = useState(initialUsers)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [invitationLink, setInvitationLink] = useState<string | null>(null)
  const [showInviteLinkModal, setShowInviteLinkModal] = useState(false)
  
  // Using API calls instead of direct supabase calls

  const [formData, setFormData] = useState<InviteFormData>({
    email: '',
    client_id: '',
    first_name: '',
    last_name: '',
    role: 'client_user'
  })

  const resetForm = () => {
    setFormData({
      email: '',
      client_id: '',
      first_name: '',
      last_name: '',
      role: 'client_user'
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
      if (!formData.email) {
        throw new Error('Email is required')
      }
      
      if (formData.role === 'client_user' && !formData.client_id) {
        throw new Error('Client selection is required for client users')
      }
      
      if (formData.role === 'employee' && !formData.employee_type) {
        throw new Error('Employee role is required')
      }

      console.log('Creating user invitation for:', formData.email, 'as', formData.role)
      
      // Create user invitation via API
      const response = await fetch('/api/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          client_id: formData.role === 'client_user' ? formData.client_id : null,
          agency_id: agency.id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          employee_type: formData.role === 'employee' ? formData.employee_type : null
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send invitation')
      }

      // Show success with login credentials
      const credentials = `Email: ${formData.email}\nPassword: ${result.invitation?.temp_password || 'See console'}\nLogin: https://analytics.retentionharbor.com/login`
      
      setSuccess(`✅ ${formData.role === 'employee' ? 'Employee' : 'User'} created successfully!\n\nShare these login credentials:\n\n${credentials}\n\nThey can login immediately and change their password in settings.`)
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
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to remove user')
      }

      setClientUsers(clientUsers.filter(u => u.id !== userId))
      setSuccess('User removed successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove user')
    } finally {
      setLoading(false)
    }
  }

  // Removed resendInvite - email not configured, users get magic link in modal instead

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-white/60">Invite users to access their client dashboards</p>
        </div>
        <button
          onClick={() => setShowInviteForm(true)}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md transition-colors border border-white/20"
        >
          <UserPlus className="h-4 w-4" />
          Invite User
        </button>
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

      {/* Invitation Link Modal */}
      {showInviteLinkModal && invitationLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  User Invitation Link
                </CardTitle>
                <button
                  onClick={() => {
                    setShowInviteLinkModal(false)
                    setInvitationLink(null)
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-yellow-900 mb-1">⚠️ Email Not Configured</p>
                <p className="text-xs text-yellow-800">
                  Supabase email service is not set up. Copy this invitation link and send it to the user manually.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invitation Link (expires in 24 hours):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={invitationLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(invitationLink)
                      setSuccess('Invitation link copied!')
                      setTimeout(() => setSuccess(''), 2000)
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Next Steps:</h4>
                <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Copy the invitation link above</li>
                  <li>Send it to the user via email or message</li>
                  <li>User clicks the link and sets their password</li>
                  <li>User can then login at /login with their email</li>
                </ol>
              </div>

              <button
                onClick={() => {
                  setShowInviteLinkModal(false)
                  setInvitationLink(null)
                }}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invite Form */}
      {showInviteForm && (
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Invite New User</h3>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-md focus:ring-2 focus:ring-white/30 focus:border-white/40 placeholder-white/40"
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  User Type *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'client_user' | 'employee', client_id: e.target.value === 'employee' ? '' : formData.client_id })}
                  className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-md focus:ring-2 focus:ring-white/30 focus:border-white/40"
                  required
                >
                  <option value="client_user">Client User (Portal Access)</option>
                  <option value="employee">Employee (Ops Dashboard Access)</option>
                </select>
              </div>

              {formData.role === 'client_user' && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Client *
                  </label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-md focus:ring-2 focus:ring-white/30 focus:border-white/40"
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
              )}

              {formData.role === 'employee' && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Employee Role *
                  </label>
                  <select
                    value={formData.employee_type || ''}
                    onChange={(e) => setFormData({ ...formData, employee_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-md focus:ring-2 focus:ring-white/30 focus:border-white/40"
                    required
                  >
                    <option value="">Select role...</option>
                    <option value="copywriter">Copywriter</option>
                    <option value="designer">Designer</option>
                    <option value="implementor">Implementor</option>
                    <option value="project_manager">Project Manager</option>
                    <option value="qa">QA</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-md focus:ring-2 focus:ring-white/30 focus:border-white/40 placeholder-white/40"
                  placeholder="John"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-md focus:ring-2 focus:ring-white/30 focus:border-white/40 placeholder-white/40"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Send Invitation
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md border border-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="space-y-4">
        {clientUsers.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-12 text-center">
            <User className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No users invited yet</h3>
            <p className="text-white/60 mb-4">
              Invite users to give them access to their client dashboards.
            </p>
            <button
              onClick={() => setShowInviteForm(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md border border-white/30 transition-colors"
            >
              Invite Your First User
            </button>
          </div>
        ) : (
          clientUsers.map((user) => (
            <div key={user.id} className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}` 
                        : 'Unnamed User'
                      }
                    </h3>
                    <div className="text-sm text-white/60 space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
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
                    onClick={() => handleRemoveUser(
                      user.id, 
                      user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}` 
                        : 'this user'
                    )}
                    disabled={loading}
                    className="p-2 text-white/60 hover:text-red-300 hover:bg-red-500/20 rounded-md transition-colors"
                    title="Remove User"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Instructions */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">How User Invitations Work</h3>
        <div className="space-y-3 text-sm text-white/70">
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-300 font-medium text-xs">1</span>
            </div>
            <div>
              <strong className="text-white">Invite User:</strong> Enter the user's email and select which client they should have access to.
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-300 font-medium text-xs">2</span>
            </div>
            <div>
              <strong className="text-white">Email Sent:</strong> The user receives an email with instructions to set their password.
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-300 font-medium text-xs">3</span>
            </div>
            <div>
              <strong className="text-white">Dashboard Access:</strong> Once they set their password, they can access their client's dashboard directly.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
