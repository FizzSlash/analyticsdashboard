'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Image,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Eye,
  Download,
  ExternalLink,
  Calendar,
  User,
  Star,
  Heart,
  X,
  Upload
} from 'lucide-react'

interface DesignFile {
  id: string
  filename: string
  url: string
  thumbnail_url: string
  type: string
  size: number
}

interface DesignItem {
  id: string
  campaign_title: string
  client: string
  design_files: DesignFile[]
  copy_link?: string
  created_date: Date
  status: string
  assignee?: string
  likes: number
  client_feedback?: string
  agency_feedback?: string
  user_has_liked: boolean
}

interface DesignFeedbackProps {
  client: any
  userRole: 'client_user' | 'agency_admin'
}

export function DesignFeedback({ client, userRole }: DesignFeedbackProps) {
  const [designs, setDesigns] = useState<DesignItem[]>([])
  const [selectedDesign, setSelectedDesign] = useState<DesignItem | null>(null)
  const [viewingImage, setViewingImage] = useState<DesignFile | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadDesigns()
  }, [client])

  const loadDesigns = async () => {
    setLoading(true)
    try {
      // Load from Airtable and extract design files
      console.log('🎨 Loading designs from Airtable for client:', client.brand_name)
      const response = await fetch(`/api/load-from-airtable?client=${encodeURIComponent(client.brand_name)}`)
      const result = await response.json()
      
      if (result.success) {
        // Combine campaigns and flows, filter for items with design files
        const allItems = [...result.campaigns, ...result.flows]
        const designItems = allItems
          .filter(item => item.design_files && item.design_files.length > 0)
          .map(item => ({
            id: item.id,
            campaign_title: item.title,
            client: item.client,
            design_files: item.design_files,
            copy_link: item.copy_link,
            created_date: new Date(item.last_sync || Date.now()),
            status: item.status,
            assignee: item.assignee,
            likes: Math.floor(Math.random() * 12), // TODO: Get from database
            client_feedback: item.client_notes || '',
            agency_feedback: item.notes || '',
            user_has_liked: false // TODO: Get from database
          }))
          .sort((a, b) => b.created_date.getTime() - a.created_date.getTime()) // Most recent first
        
        console.log(`🎨 Found ${designItems.length} designs with files`)
        setDesigns(designItems)
      }
    } catch (error) {
      console.error('Error loading designs:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleLike = async (designId: string) => {
    setDesigns(prev => prev.map(design => 
      design.id === designId 
        ? { 
            ...design, 
            likes: design.user_has_liked ? design.likes - 1 : design.likes + 1,
            user_has_liked: !design.user_has_liked
          }
        : design
    ))
    
    // TODO: Sync like status to database
    console.log('👍 Toggled like for design:', designId)
  }

  const addFeedback = async (designId: string, feedback: string) => {
    setDesigns(prev => prev.map(design => 
      design.id === designId 
        ? { 
            ...design, 
            [userRole === 'client_user' ? 'client_feedback' : 'agency_feedback']: feedback
          }
        : design
    ))
    
    // TODO: Sync feedback to Airtable Client Revisions field
    console.log('💬 Added feedback for design:', designId, feedback)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'design': return 'bg-purple-500/30 text-purple-300 border-purple-400'
      case 'ready_for_client_approval': return 'bg-orange-500/30 text-orange-300 border-orange-400'
      case 'approved': return 'bg-green-500/30 text-green-300 border-green-400'
      case 'revisions': return 'bg-red-500/30 text-red-300 border-red-400'
      case 'live': return 'bg-green-500/40 text-green-200 border-green-300'
      default: return 'bg-gray-500/30 text-gray-300 border-gray-400'
    }
  }

  if (loading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60 mx-auto mb-4"></div>
          <p className="text-white/70">Loading designs...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Image className="h-6 w-6 text-purple-400" />
              <div>
                <CardTitle className="text-white">Design Feedback Center</CardTitle>
                <p className="text-white/70 text-sm mt-1">
                  {userRole === 'agency_admin' 
                    ? 'View all designs and client feedback' 
                    : 'Review designs and provide feedback'
                  }
                </p>
              </div>
            </div>
            
            <div className="text-white/70 text-sm">
              {designs.length} designs found
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Design Grid */}
      {designs.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8 text-center">
            <Image className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/70">No designs found</p>
            <p className="text-white/50 text-sm">Designs with attached files will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map(design => (
            <Card key={design.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Campaign Info */}
                  <div>
                    <h3 className="text-white font-semibold truncate">{design.campaign_title}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(design.status)}`}>
                        {design.status.replace('_', ' ')}
                      </span>
                      <span className="text-white/60 text-xs">
                        {design.created_date.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Design Thumbnails */}
                  <div className="space-y-2">
                    {design.design_files.slice(0, 2).map(file => (
                      <div 
                        key={file.id}
                        className="relative bg-white/10 rounded-lg overflow-hidden cursor-pointer hover:bg-white/20 transition-colors"
                        onClick={() => setViewingImage(file)}
                      >
                        <img 
                          src={file.thumbnail_url}
                          alt={file.filename}
                          className="w-full h-32 object-cover"
                          onError={(e) => {
                            // Fallback if image fails to load
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Eye className="h-6 w-6 text-white/80 opacity-0 hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white/90 text-xs p-2">
                          {file.filename}
                        </div>
                      </div>
                    ))}
                    
                    {design.design_files.length > 2 && (
                      <div className="text-center text-white/60 text-xs">
                        +{design.design_files.length - 2} more files
                      </div>
                    )}
                  </div>

                  {/* Feedback Section */}
                  <div className="space-y-2">
                    {/* Like Button */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggleLike(design.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          design.user_has_liked 
                            ? 'bg-red-500/30 text-red-300' 
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${design.user_has_liked ? 'fill-current' : ''}`} />
                        <span className="text-sm">{design.likes}</span>
                      </button>
                      
                      <div className="flex gap-2">
                        {design.copy_link && (
                          <a
                            href={design.copy_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/60 hover:text-white/80 transition-colors"
                            title="View copy document"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        
                        <button
                          onClick={() => setSelectedDesign(design)}
                          className="text-white/60 hover:text-white/80 transition-colors"
                          title="Add feedback"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Latest Feedback Preview */}
                    {(design.client_feedback || design.agency_feedback) && (
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-white/70 text-xs line-clamp-2">
                          💬 {design.client_feedback || design.agency_feedback}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Assignee */}
                  {design.assignee && (
                    <div className="flex items-center gap-2 text-white/60 text-xs">
                      <User className="h-3 w-3" />
                      <span>{design.assignee}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Feedback Modal */}
      {selectedDesign && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-white/10 border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">{selectedDesign.campaign_title}</CardTitle>
                <button 
                  onClick={() => setSelectedDesign(null)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Design Files */}
              <div className="space-y-3">
                <h4 className="text-white font-medium">Design Files ({selectedDesign.design_files.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedDesign.design_files.map(file => (
                    <div 
                      key={file.id}
                      className="bg-white/10 rounded-lg overflow-hidden cursor-pointer hover:bg-white/20 transition-colors"
                      onClick={() => setViewingImage(file)}
                    >
                      <img 
                        src={file.thumbnail_url}
                        alt={file.filename}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-3">
                        <p className="text-white text-sm truncate">{file.filename}</p>
                        <p className="text-white/60 text-xs">{(file.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback Section */}
              <div className="space-y-3">
                <h4 className="text-white font-medium">Feedback</h4>
                
                {/* Agency Feedback */}
                {selectedDesign.agency_feedback && (
                  <div className="bg-blue-500/20 border border-blue-400 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-blue-300" />
                      <span className="text-blue-300 text-sm font-medium">Agency Notes</span>
                    </div>
                    <p className="text-white/80 text-sm">{selectedDesign.agency_feedback}</p>
                  </div>
                )}

                {/* Client Feedback */}
                {selectedDesign.client_feedback && (
                  <div className="bg-green-500/20 border border-green-400 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-green-300" />
                      <span className="text-green-300 text-sm font-medium">Client Feedback</span>
                    </div>
                    <p className="text-white/80 text-sm">{selectedDesign.client_feedback}</p>
                  </div>
                )}

                {/* Add Feedback */}
                <div className="bg-white/10 rounded-lg p-3">
                  <label className="block text-white text-sm font-medium mb-2">
                    Add {userRole === 'client_user' ? 'Client' : 'Agency'} Feedback
                  </label>
                  <textarea
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 resize-none"
                    rows={3}
                    placeholder={userRole === 'client_user' 
                      ? 'Share your thoughts on this design...' 
                      : 'Add internal notes about this design...'
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        const feedback = e.currentTarget.value.trim()
                        if (feedback) {
                          addFeedback(selectedDesign.id, feedback)
                          e.currentTarget.value = ''
                        }
                      }
                    }}
                  />
                  <p className="text-white/50 text-xs mt-1">Press Ctrl+Enter to save feedback</p>
                </div>
              </div>

              {/* Design Actions */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleLike(selectedDesign.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      selectedDesign.user_has_liked 
                        ? 'bg-red-500/30 text-red-300' 
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${selectedDesign.user_has_liked ? 'fill-current' : ''}`} />
                    <span>{selectedDesign.likes}</span>
                  </button>
                  
                  {selectedDesign.assignee && (
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <User className="h-4 w-4" />
                      <span>{selectedDesign.assignee}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {selectedDesign.copy_link && (
                    <a
                      href={selectedDesign.copy_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600/80 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Copy
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative max-w-5xl max-h-[90vh] mx-4">
            <button 
              onClick={() => setViewingImage(null)}
              className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-lg hover:bg-black/80 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
            
            <img 
              src={viewingImage.url}
              alt={viewingImage.filename}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-2 rounded-lg">
              <p className="text-sm font-medium">{viewingImage.filename}</p>
              <p className="text-xs text-white/80">{(viewingImage.size / 1024).toFixed(0)} KB</p>
            </div>
            
            <a
              href={viewingImage.url}
              download={viewingImage.filename}
              className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg transition-colors"
              title="Download image"
            >
              <Download className="h-5 w-5" />
            </a>
          </div>
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Star className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div>
              <span className="font-medium text-white">Design Collaboration</span>
              <p className="text-white/70 text-sm mt-1">
                • View all recent designs attached to campaigns and flows<br/>
                • Like designs to show appreciation<br/>
                • Add feedback directly from the portal<br/>
                • {userRole === 'client_user' ? 'Provide client feedback on designs' : 'See client reactions and feedback'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}