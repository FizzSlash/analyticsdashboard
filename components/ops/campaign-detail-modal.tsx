'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  X, 
  Save, 
  Trash2,
  Calendar,
  Clock,
  Tag,
  FileText,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  MessageSquare,
  Plus,
  Upload,
  TestTube,
  Sparkles
} from 'lucide-react'

interface Campaign {
  id: string
  campaign_name: string
  client_id: string
  client_name: string
  client_color: string
  send_date: Date
  status: 'strategy' | 'copy' | 'design' | 'qa' | 'client_approval' | 'approved' | 'scheduled' | 'sent' | 'revisions'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  campaign_type: 'email' | 'sms'
  subject_line?: string
  preview_text?: string
  target_audience?: string
  copy_doc_url?: string
  design_file_url?: string
  preview_url?: string
  internal_notes?: string
  client_feedback?: string
  is_ab_test?: boolean
  ab_test_variant?: string
  ab_test_type?: string
}

interface ActivityLog {
  id: string
  type: 'created' | 'status_change' | 'note_added' | 'file_uploaded' | 'updated'
  description: string
  user: string
  timestamp: Date
  old_value?: string
  new_value?: string
}

interface CampaignDetailModalProps {
  campaign: Campaign
  clients: any[]
  onClose: () => void
  onSave: (campaign: Campaign) => void
  onDelete: (campaignId: string) => void
}

export function CampaignDetailModal({ 
  campaign: initialCampaign,
  clients,
  onClose, 
  onSave,
  onDelete 
}: CampaignDetailModalProps) {
  const [campaign, setCampaign] = useState<Campaign>(initialCampaign)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(campaign.preview_url || null)
  const [isDragging, setIsDragging] = useState(false)
  const isNewCampaign = campaign.id.startsWith('new-')

  // Listen for copy saved message from child window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'COPY_SAVED' && event.data.campaignId === campaign.id) {
        // Refetch campaign data to get updated copy_doc_url
        fetch(`/api/ops/campaigns?clientId=all`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              const updatedCampaign = data.campaigns.find((c: any) => c.id === campaign.id)
              if (updatedCampaign) {
                setCampaign({ ...campaign, copy_doc_url: updatedCampaign.copy_doc_url })
                alert('✅ Copy Doc URL updated! You can now click the link to view your copy.')
              }
            }
          })
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [campaign.id])

  // Activity log - will be implemented with real data from database
  const activityLog: ActivityLog[] = []

  const handleSave = () => {
    // Validate: Image required for QA, Client Approval, and beyond
    const requiresImage = ['qa', 'client_approval', 'approved', 'scheduled', 'sent'].includes(campaign.status)
    
    if (requiresImage && !uploadedImage) {
      alert('⚠️ CAMPAIGN PREVIEW IMAGE REQUIRED\n\nYou cannot move to "' + campaign.status.toUpperCase().replace('_', ' ') + '" without uploading an image.\n\nThe QA team and clients need to see the design before approval.\n\nPlease upload an image below, then try again.')
      return
    }

    setIsSaving(true)
    setTimeout(() => {
      onSave({ ...campaign, preview_url: uploadedImage || undefined })
      setIsSaving(false)
    }, 500)
  }

  const handleDelete = () => {
    if (confirm(`Delete campaign "${campaign.campaign_name}"?`)) {
      onDelete(campaign.id)
    }
  }

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      alert('Please upload PNG, JPG, GIF, or WebP files only')
      return
    }

    // Check file size (warn if over 20MB)
    const fileSizeMB = file.size / 1024 / 1024
    if (fileSizeMB > 20) {
      alert(`File size is ${fileSizeMB.toFixed(1)}MB. Maximum recommended size is 20MB.`)
      return
    }

    try {
      console.log(`📤 Uploading ${file.name} (${fileSizeMB.toFixed(2)}MB) directly to Supabase...`)
      
      // Import the direct upload utility
      const { uploadToSupabase } = await import('@/lib/direct-upload')
      
      // Upload directly to Supabase Storage (bypasses Vercel 4.5MB limit)
      const result = await uploadToSupabase(file, 'campaign-previews', campaign.client_id)
      
      if (result.success && result.url) {
        setUploadedImage(result.url)
        setCampaign({ ...campaign, preview_url: result.url })
        console.log('✅ Image uploaded successfully:', result.url)
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error: any) {
      console.error('❌ Upload error:', error)
      alert(`Upload failed: ${error.message}\n\nPlease try again or contact support if the issue persists.`)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleRemoveImage = async () => {
    // If image is from Supabase Storage, delete it
    if (uploadedImage && uploadedImage.includes('supabase.co/storage')) {
      try {
        // Extract filename from URL
        const url = new URL(uploadedImage)
        const pathParts = url.pathname.split('/')
        const bucketIndex = pathParts.findIndex(part => part === 'campaign-previews')
        if (bucketIndex !== -1) {
          const filePath = pathParts.slice(bucketIndex + 1).join('/')
          
          console.log(`🗑️ Deleting image from Supabase: ${filePath}`)
          
          // Delete from Supabase Storage
          const { createClient } = await import('@supabase/supabase-js')
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )
          
          const { error } = await supabase.storage
            .from('campaign-previews')
            .remove([filePath])
          
          if (error) {
            console.error('Error deleting image:', error)
          } else {
            console.log('✅ Image deleted from storage')
          }
        }
      } catch (error) {
        console.error('Error removing image:', error)
      }
    }
    
    // Clear from UI and state
    setUploadedImage(null)
    setCampaign({ ...campaign, preview_url: undefined })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created': return <Plus className="h-4 w-4 text-green-600" />
      case 'status_change': return <ArrowRight className="h-4 w-4 text-blue-600" />
      case 'note_added': return <MessageSquare className="h-4 w-4 text-purple-600" />
      case 'file_uploaded': return <Upload className="h-4 w-4 text-orange-600" />
      default: return <CheckCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const formatRelativeTime = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className={`bg-white w-full ${uploadedImage ? 'max-w-6xl' : 'max-w-3xl'} max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transition-all`}>
        {/* Modal Header */}
        <CardHeader className="border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: campaign.client_color }}
              />
              <CardTitle className="text-gray-900 text-xl">
                {isNewCampaign ? 'New Campaign' : campaign.campaign_name}
              </CardTitle>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>

        {/* Modal Content - Dynamic Layout */}
        <div className="flex-1 overflow-hidden">
          <div className={`grid ${uploadedImage ? 'grid-cols-2' : 'grid-cols-1'} h-full`}>
            {/* Left Column (or Full Width): Form Fields (Scrollable) */}
            <div className={`overflow-y-auto p-6 ${uploadedImage ? 'border-r border-gray-200' : ''}`} style={{ maxHeight: 'calc(90vh - 180px)' }}>
              <div className="space-y-6">
            {/* Basic Info Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Campaign Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Campaign Name */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={campaign.campaign_name}
                    onChange={(e) => setCampaign({ ...campaign, campaign_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Client (Editable) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client *
                  </label>
                  <select
                    value={campaign.client_id}
                    onChange={(e) => {
                      const newClientId = e.target.value
                      const newClient = clients.find(c => c.id === newClientId)
                      setCampaign({ 
                        ...campaign, 
                        client_id: newClientId,
                        client_name: newClient?.brand_name || '',
                        client_color: newClient?.primary_color || '#3B82F6'
                      })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.brand_name}</option>
                    ))}
                  </select>
                </div>

                {/* Campaign Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={campaign.campaign_type}
                    onChange={(e) => setCampaign({ ...campaign, campaign_type: e.target.value as 'email' | 'sms' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="email">Email Campaign</option>
                    <option value="sms">SMS Campaign</option>
                  </select>
                </div>

                {/* Subject Line */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={campaign.subject_line || ''}
                    onChange={(e) => setCampaign({ ...campaign, subject_line: e.target.value })}
                    placeholder="Craft a compelling subject line..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Preview Text */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preview Text
                  </label>
                  <input
                    type="text"
                    value={campaign.preview_text || ''}
                    onChange={(e) => setCampaign({ ...campaign, preview_text: e.target.value })}
                    placeholder="Preview text that appears after subject line..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Send Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Send Date
                  </label>
                  <input
                    type="date"
                    value={campaign.send_date.toISOString().split('T')[0]}
                    onChange={(e) => {
                      const newDate = new Date(e.target.value)
                      newDate.setHours(campaign.send_date.getHours())
                      newDate.setMinutes(campaign.send_date.getMinutes())
                      setCampaign({ ...campaign, send_date: newDate })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Send Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Send Time
                  </label>
                  <input
                    type="time"
                    value={`${String(campaign.send_date.getHours()).padStart(2, '0')}:${String(campaign.send_date.getMinutes()).padStart(2, '0')}`}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':')
                      const newDate = new Date(campaign.send_date)
                      newDate.setHours(parseInt(hours))
                      newDate.setMinutes(parseInt(minutes))
                      setCampaign({ ...campaign, send_date: newDate })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={campaign.status}
                    onChange={(e) => setCampaign({ ...campaign, status: e.target.value as Campaign['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="strategy">Strategy</option>
                    <option value="copy">Copy</option>
                    <option value="design">Design</option>
                    <option value="qa">QA</option>
                    <option value="client_approval">Client Approval</option>
                    <option value="revisions">Revisions</option>
                    <option value="approved">Approved</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="sent">Sent</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={campaign.priority}
                    onChange={(e) => setCampaign({ ...campaign, priority: e.target.value as Campaign['priority'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Target Audience */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={campaign.target_audience || ''}
                    onChange={(e) => setCampaign({ ...campaign, target_audience: e.target.value })}
                    placeholder="e.g., All Subscribers, VIP Customers, Recent Purchasers..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* A/B Test Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  A/B Test
                </h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={campaign.is_ab_test || false}
                    onChange={(e) => setCampaign({ 
                      ...campaign, 
                      is_ab_test: e.target.checked,
                      ab_test_variant: e.target.checked ? campaign.ab_test_variant || 'A' : undefined,
                      ab_test_type: e.target.checked ? campaign.ab_test_type || 'subject_line' : undefined
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Part of A/B Test</span>
                </label>
              </div>

              {campaign.is_ab_test && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Variant
                    </label>
                    <input
                      type="text"
                      value={campaign.ab_test_variant || ''}
                      onChange={(e) => setCampaign({ ...campaign, ab_test_variant: e.target.value })}
                      placeholder="A, B, Control..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Testing
                    </label>
                    <select
                      value={campaign.ab_test_type || 'subject_line'}
                      onChange={(e) => setCampaign({ ...campaign, ab_test_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="subject_line">Subject Line</option>
                      <option value="content">Email Content</option>
                      <option value="send_time">Send Time</option>
                      <option value="from_name">From Name</option>
                      <option value="offer">Offer/Promotion</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Copy & Design Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Copy & Design Files
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Copy Doc URL
                  </label>
                  <input
                    type="url"
                    value={campaign.copy_doc_url || ''}
                    onChange={(e) => setCampaign({ ...campaign, copy_doc_url: e.target.value })}
                    placeholder="https://docs.google.com/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Design File URL (Figma)
                  </label>
                  <input
                    type="url"
                    value={campaign.design_file_url || ''}
                    onChange={(e) => setCampaign({ ...campaign, design_file_url: e.target.value })}
                    placeholder="https://figma.com/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Campaign Image Upload (shown inline if no image uploaded) */}
            {!uploadedImage && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Campaign Preview Image
                </h3>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                    isDragging 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Upload className={`h-12 w-12 mx-auto mb-4 ${
                    isDragging ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <div className="text-sm text-gray-700 mb-2">
                    <label htmlFor="file-upload" className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                      Click to upload
                    </label>
                    {' '}or drag and drop
                  </div>
                  <div className="text-xs text-gray-500">
                    PNG, JPG, or GIF
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* Internal Notes */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Internal Notes (Team Only)
              </h3>
              <textarea
                value={campaign.internal_notes || ''}
                onChange={(e) => setCampaign({ ...campaign, internal_notes: e.target.value })}
                placeholder="Add notes for your team (not visible to client)...

Examples:
• Client requested blue CTA buttons
• Include free shipping disclaimer
• Use product images from Oct photoshoot
• Avoid mentioning competitors"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
              />
            </div>

            {/* Client Feedback - Read Only */}
            {campaign.client_feedback && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-orange-600" />
                  Client Feedback
                </h3>
                <div className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-gray-800 whitespace-pre-wrap text-sm">{campaign.client_feedback}</p>
                </div>
              </div>
            )}

            {/* AI Copy Generation - Only show when status is 'copy' */}
            {campaign.status === 'copy' && !isNewCampaign && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border-2 border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  AI Copy Generation
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Generate email copy using Claude AI based on your brand guidelines and campaign brief.
                </p>
                <a
                  href={`${window.location.origin}/agency/${window.location.pathname.split('/')[2] || 'retention-harbor'}/generate/${campaign.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Sparkles className="h-5 w-5" />
                  Generate Email Copy with AI
                </a>
              </div>
            )}

            {/* Activity Log */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Activity Log
              </h3>
              <div className="space-y-3 bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-[300px] overflow-y-auto">
                {activityLog.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-900">
                        {activity.description}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {activity.user} • {formatRelativeTime(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Change Warning */}
            {campaign.status === 'client_approval' && campaign.status !== initialCampaign.status && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-orange-900">
                    Sending to Client Portal
                  </div>
                  <div className="text-sm text-orange-700 mt-1">
                    Changing status to "Client Approval" will make this campaign visible in the client's portal for approval.
                  </div>
                </div>
              </div>
            )}
              </div>
            </div>

            {/* Right Column: Image Preview (Only when image exists) */}
            {uploadedImage && (
              <div className="overflow-y-auto p-6 bg-gray-50" style={{ maxHeight: 'calc(90vh - 180px)' }}>
                <div className="sticky top-0 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Campaign Preview
                  </h3>
                  
                  <div className="relative">
                    <img 
                      src={uploadedImage} 
                      alt="Campaign preview"
                      className="w-full rounded-lg border border-gray-300 shadow-lg"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-colors"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="mt-2 text-xs text-gray-600 text-center">
                      Click X to replace
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer - Actions */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            {!isNewCampaign ? (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Campaign
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !campaign.campaign_name.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? (isNewCampaign ? 'Creating...' : 'Saving...') : (isNewCampaign ? 'Create Campaign' : 'Save Changes')}
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

