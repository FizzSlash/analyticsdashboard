'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { 
  MessageSquare,
  X,
  Plus,
  Save,
  Trash2
} from 'lucide-react'

interface Annotation {
  id: string
  x: number // Percentage from left
  y: number // Percentage from top
  comment: string
  author: string
  created_at: Date
  resolved: boolean
}

interface ImageAnnotatorProps {
  imageUrl: string
  filename: string
  annotations?: Annotation[]
  userRole: 'client_user' | 'agency_admin'
  userName: string
  onAddAnnotation?: (annotation: Omit<Annotation, 'id' | 'created_at'>) => void
  onUpdateAnnotation?: (id: string, updates: Partial<Annotation>) => void
  onClose: () => void
}

export function ImageAnnotator({
  imageUrl,
  filename,
  annotations = [],
  userRole,
  userName,
  onAddAnnotation,
  onUpdateAnnotation,
  onClose
}: ImageAnnotatorProps) {
  const [localAnnotations, setLocalAnnotations] = useState<Annotation[]>(annotations)
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null)
  const [newAnnotation, setNewAnnotation] = useState<{ x: number; y: number; comment: string } | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current || !containerRef.current) return
    
    const rect = imageRef.current.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()
    
    // Calculate percentage position relative to image
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    // Don't add annotation if clicking on existing annotation
    const clickedAnnotation = localAnnotations.find(ann => {
      const annotationRect = {
        left: (ann.x / 100) * rect.width + rect.left,
        top: (ann.y / 100) * rect.height + rect.top,
        right: (ann.x / 100) * rect.width + rect.left + 24, // Annotation button width
        bottom: (ann.y / 100) * rect.height + rect.top + 24 // Annotation button height
      }
      
      return (
        e.clientX >= annotationRect.left &&
        e.clientX <= annotationRect.right &&
        e.clientY >= annotationRect.top &&
        e.clientY <= annotationRect.bottom
      )
    })
    
    if (clickedAnnotation) {
      setActiveAnnotation(clickedAnnotation.id)
      return
    }
    
    // Create new annotation
    setNewAnnotation({
      x: Math.max(0, Math.min(95, x)), // Keep within bounds
      y: Math.max(0, Math.min(95, y)),
      comment: ''
    })
    setActiveAnnotation(null)
  }

  const saveNewAnnotation = () => {
    if (!newAnnotation || !newAnnotation.comment.trim()) return
    
    const annotation: Annotation = {
      id: `ann-${Date.now()}`,
      x: newAnnotation.x,
      y: newAnnotation.y,
      comment: newAnnotation.comment,
      author: userName,
      created_at: new Date(),
      resolved: false
    }
    
    setLocalAnnotations(prev => [...prev, annotation])
    onAddAnnotation?.(annotation)
    setNewAnnotation(null)
  }

  const resolveAnnotation = (annotationId: string) => {
    setLocalAnnotations(prev => 
      prev.map(ann => 
        ann.id === annotationId 
          ? { ...ann, resolved: !ann.resolved }
          : ann
      )
    )
    
    const annotation = localAnnotations.find(ann => ann.id === annotationId)
    if (annotation) {
      onUpdateAnnotation?.(annotationId, { resolved: !annotation.resolved })
    }
  }

  const deleteAnnotation = (annotationId: string) => {
    setLocalAnnotations(prev => prev.filter(ann => ann.id !== annotationId))
    setActiveAnnotation(null)
    // TODO: Call API to delete annotation
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative w-full h-full flex">
        {/* Image Container */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div 
            ref={containerRef}
            className="relative max-w-full max-h-full"
          >
            <img 
              ref={imageRef}
              src={imageUrl}
              alt={filename}
              className="max-w-full max-h-full object-contain rounded-lg cursor-crosshair"
              onLoad={() => setImageLoaded(true)}
              onClick={handleImageClick}
            />
            
            {/* Existing Annotations */}
            {imageLoaded && localAnnotations.map(annotation => (
              <button
                key={annotation.id}
                className={`absolute w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                  annotation.resolved 
                    ? 'bg-green-500/80 border-green-300 text-white' 
                    : activeAnnotation === annotation.id
                    ? 'bg-blue-500 border-blue-300 text-white scale-110'
                    : 'bg-red-500/80 border-red-300 text-white hover:scale-110'
                }`}
                style={{
                  left: `${annotation.x}%`,
                  top: `${annotation.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveAnnotation(annotation.id === activeAnnotation ? null : annotation.id)
                }}
              >
                <MessageSquare className="h-3 w-3" />
              </button>
            ))}
            
            {/* New Annotation */}
            {newAnnotation && (
              <div
                className="absolute bg-yellow-500/80 border-2 border-yellow-300 w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  left: `${newAnnotation.x}%`,
                  top: `${newAnnotation.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <Plus className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-black/60 backdrop-blur-sm border-l border-white/20 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-white/20">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-semibold">Design Annotations</h3>
              <button 
                onClick={onClose}
                className="text-white/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-white/70 text-sm mt-1">{filename}</p>
          </div>

          {/* Instructions */}
          <div className="p-4 border-b border-white/20">
            <p className="text-white/70 text-sm">
              💡 <strong>Click anywhere on the image</strong> to add feedback at that specific location.
            </p>
          </div>

          {/* New Annotation Form */}
          {newAnnotation && (
            <div className="p-4 border-b border-white/20 bg-yellow-500/10">
              <h4 className="text-yellow-300 font-medium mb-2">Add Feedback</h4>
              <textarea
                value={newAnnotation.comment}
                onChange={(e) => setNewAnnotation({...newAnnotation, comment: e.target.value})}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 resize-none"
                rows={3}
                placeholder="What do you think about this part of the design?"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setNewAnnotation(null)}
                  className="bg-gray-600/80 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNewAnnotation}
                  disabled={!newAnnotation.comment.trim()}
                  className="bg-yellow-600/80 hover:bg-yellow-600 disabled:bg-yellow-600/40 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                >
                  <Save className="h-3 w-3" />
                  Add Feedback
                </button>
              </div>
            </div>
          )}

          {/* Annotations List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-3">
              <h4 className="text-white font-medium">
                Feedback ({localAnnotations.length})
              </h4>
              
              {localAnnotations.length === 0 ? (
                <p className="text-white/60 text-sm">
                  No feedback yet. Click on the design to add comments.
                </p>
              ) : (
                localAnnotations.map(annotation => (
                  <Card 
                    key={annotation.id}
                    className={`bg-white/10 border-white/20 transition-colors cursor-pointer ${
                      activeAnnotation === annotation.id ? 'bg-white/20 border-white/30' : ''
                    } ${annotation.resolved ? 'opacity-60' : ''}`}
                    onClick={() => setActiveAnnotation(annotation.id === activeAnnotation ? null : annotation.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            annotation.resolved ? 'bg-green-400' : 'bg-red-400'
                          }`}></div>
                          <span className="text-white text-sm font-medium">
                            {annotation.author}
                          </span>
                        </div>
                        <span className="text-white/60 text-xs">
                          {annotation.created_at.toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-white/80 text-sm mb-2">{annotation.comment}</p>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            resolveAnnotation(annotation.id)
                          }}
                          className={`px-2 py-1 rounded text-xs transition-colors ${
                            annotation.resolved
                              ? 'bg-green-600/30 text-green-300'
                              : 'bg-gray-600/30 text-gray-300 hover:bg-gray-600/50'
                          }`}
                        >
                          {annotation.resolved ? '✓ Resolved' : 'Mark Resolved'}
                        </button>
                        
                        {/* Only allow deletion by author or agency admin */}
                        {(annotation.author === userName || userRole === 'agency_admin') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteAnnotation(annotation.id)
                            }}
                            className="text-red-400 hover:text-red-300 p-1 rounded"
                            title="Delete annotation"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 border-t border-white/20 bg-black/20">
            <div className="text-white/70 text-sm space-y-1">
              <p>Total feedback: {localAnnotations.length}</p>
              <p>Resolved: {localAnnotations.filter(a => a.resolved).length}</p>
              <p>Pending: {localAnnotations.filter(a => !a.resolved).length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}