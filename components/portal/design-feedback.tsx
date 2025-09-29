'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Image,
  MessageSquare,
  Eye,
  Download,
  ExternalLink,
  User,
  Star,
  X,
  Edit
} from 'lucide-react'
import { ImageAnnotator } from './image-annotator'

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
  client_feedback?: string
  agency_feedback?: string
  annotations?: any[]
}

interface DesignFeedbackProps {
  client: any
  userRole: 'client_user' | 'agency_admin'
}

export function DesignFeedback({ client, userRole }: DesignFeedbackProps) {
  const [designs, setDesigns] = useState<DesignItem[]>([])
  const [selectedDesign, setSelectedDesign] = useState<DesignItem | null>(null)
  const [viewingImage, setViewingImage] = useState<DesignFile | null>(null)
  const [annotatingImage, setAnnotatingImage] = useState<{ file: DesignFile; design: DesignItem } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadDesigns()
  }, [client])

  const loadDesigns = async () => {
    setLoading(true)
    try {
      console.log('🎨 Loading designs from Airtable for client:', client.brand_name)
      const response = await fetch(`/api/load-from-airtable?client=${encodeURIComponent(client.brand_name)}`)
      const result = await response.json()
      
      if (result.success) {
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
            client_feedback: item.client_notes || '',
            agency_feedback: item.notes || '',
            annotations: []
          }))
          .sort((a, b) => b.created_date.getTime() - a.created_date.getTime())
        
        console.log(`🎨 Found ${designItems.length} designs with files`)
        setDesigns(designItems)
      }
    } catch (error) {
      console.error('Error loading designs:', error)
    } finally {
      setLoading(false)
    }
  }

  const addAnnotation = async (designId: string, fileId: string, annotation: any) => {
    try {
      console.log('💬 Saving annotation to database:', designId, fileId, annotation)
      
      // Get design for context
      const design = designs.find(d => d.id === designId)
      if (!design) return
      
      // Save annotation to database
      const response = await fetch('/api/portal-annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airtable_record_id: designId,
          design_file_id: fileId,
          client_id: client.id,
          agency_id: client.agency_id || 'default-agency-id', // TODO: Get from client data
          x_position: annotation.x,
          y_position: annotation.y,
          comment: annotation.comment,
          author_user_id: null, // TODO: Get from auth context
          author_name: annotation.user,
          author_role: userRole
        })
      })
      
      const result = await response.json()
      if (result.success) {
        console.log('✅ Annotation saved to database:', result.annotation.id)
        
        // Update local state with database annotation
        setDesigns(prev => prev.map(design => 
          design.id === designId 
            ? { 
                ...design, 
                annotations: [...(design.annotations || []), {
                  ...annotation,
                  id: result.annotation.id,
                  timestamp: new Date(result.annotation.created_at)
                }]
              }
            : design
        ))
      } else {
        console.error('❌ Failed to save annotation:', result.error)
        // Still update local state for user feedback
        setDesigns(prev => prev.map(design => 
          design.id === designId 
            ? { 
                ...design, 
                annotations: [...(design.annotations || []), annotation]
              }
            : design
        ))
      }
    } catch (error) {
      console.error('❌ Error saving annotation:', error)
      // Still update local state for user feedback
      setDesigns(prev => prev.map(design => 
        design.id === designId 
          ? { 
              ...design, 
              annotations: [...(design.annotations || []), annotation]
            }
          : design
      ))
    }
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
    console.log('💬 Added feedback for design:', designId, feedback)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Design': return 'bg-purple-500/30 text-purple-300 border-purple-400'
      case 'Ready For Client Approval': return 'bg-orange-500/30 text-orange-300 border-orange-400'
      case 'Approved': return 'bg-green-500/30 text-green-300 border-green-400'
      case 'Client Revisions': return 'bg-red-500/30 text-red-300 border-red-400'
      case 'Scheduled - Close': return 'bg-green-500/40 text-green-200 border-green-300'
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
        <div className="max-h-[70vh] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
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
                        {design.status}
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
                      >
                        <img 
                          src={file.thumbnail_url}
                          alt={file.filename}
                          className="w-full h-32 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center gap-2">
                          <button
                            onClick={() => setViewingImage(file)}
                            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
                            title="View full size"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setAnnotatingImage({ file, design })}
                            className="bg-blue-500/60 hover:bg-blue-500/80 text-white p-2 rounded-lg transition-colors"
                            title="Add feedback on design"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white/90 text-xs p-2">
                          {file.filename}
                          {design.annotations && design.annotations.length > 0 && (
                            <span className="ml-2 bg-blue-500/60 px-1 rounded">
                              {design.annotations.length} comments
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {design.design_files.length > 2 && (
                      <div className="text-center text-white/60 text-xs">
                        +{design.design_files.length - 2} more files
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {design.copy_link && (
                        <a
                          href={design.copy_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white/10 hover:bg-white/20 text-white/80 px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors"
                          title="View copy document"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Copy
                        </a>
                      )}
                      
                      <button
                        onClick={() => setSelectedDesign(design)}
                        className="bg-white/10 hover:bg-white/20 text-white/80 px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors"
                        title="View details"
                      >
                        <MessageSquare className="h-3 w-3" />
                        Details
                      </button>
                    </div>
                    
                    <div className="text-white/60 text-xs">
                      {design.annotations?.length || 0} comments
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
        </div>
      )}

      {/* Image Viewer Modal - Enhanced for Long Email Designs */}
      {viewingImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-6xl h-full max-h-[95vh] overflow-auto bg-black/20 rounded-lg">
            <button 
              onClick={() => setViewingImage(null)}
              className="sticky top-4 left-full ml-4 z-10 bg-black/60 text-white p-2 rounded-lg hover:bg-black/80 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="p-4">
              <img 
                src={viewingImage.url}
                alt={viewingImage.filename}
                className="w-full h-auto object-contain rounded-lg mx-auto"
                style={{ maxWidth: 'none' }}
              />
            </div>
            
            <div className="sticky bottom-4 left-4 bg-black/60 text-white px-3 py-2 rounded-lg inline-block">
              <p className="text-sm font-medium">{viewingImage.filename}</p>
              <p className="text-xs text-white/80">{(viewingImage.size / 1024).toFixed(0)} KB • Scroll to see full email</p>
            </div>
            
            <a
              href={viewingImage.url}
              download={viewingImage.filename}
              className="sticky bottom-4 right-4 float-right bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg transition-colors"
              title="Download image"
            >
              <Download className="h-5 w-5" />
            </a>
          </div>
        </div>
      )}

      {/* Image Annotator Modal */}
      {annotatingImage && (
        <ImageAnnotator
          imageUrl={annotatingImage.file.url}
          filename={annotatingImage.file.filename}
          annotations={annotatingImage.design.annotations || []}
          userRole={userRole}
          userName={userRole === 'agency_admin' ? 'Agency Team' : 'Client'}
          onAddAnnotation={(annotation) => addAnnotation(annotatingImage.design.id, annotatingImage.file.id, annotation)}
          onUpdateAnnotation={(id, updates) => {
            console.log('Updated annotation:', id, updates)
          }}
          onClose={() => setAnnotatingImage(null)}
        />
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
                • Click "Add Feedback" to annotate directly on designs<br/>
                • Leave comments at specific locations on the image<br/>
                • {userRole === 'client_user' ? 'Provide detailed feedback on specific design elements' : 'Review all client feedback and design annotations'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}