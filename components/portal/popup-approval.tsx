'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MousePointer, Eye, X, FileText, ExternalLink, CheckCircle, Edit, AlertCircle } from 'lucide-react'

interface Popup {
  id: string
  popup_name: string
  popup_type: string
  trigger_type: string
  offer: string
  launch_date: string
  status: string
  target_audience: string
  copy_doc_url: string | null
  preview_url: string | null
  internal_notes: string
  client_feedback: string | null
}

interface PopupApprovalProps {
  client: any
  userRole?: 'client_user' | 'agency_admin'
}

export function PopupApproval({ client, userRole = 'client_user' }: PopupApprovalProps) {
  const [popups, setPopups] = useState<Popup[]>([])
  const [selectedPopup, setSelectedPopup] = useState<Popup | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPopups()
  }, [client?.id])

  const fetchPopups = async () => {
    if (!client?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/ops/popups?clientId=${client.id}`)
      const result = await response.json()
      
      if (result.success) {
        setPopups(result.popups)
      }
    } catch (error) {
      console.error('Error fetching popups:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60 mx-auto mb-4"></div>
          <p className="text-white/70">Loading popups...</p>
        </CardContent>
      </Card>
    )
  }

  const pendingApprovals = popups.filter(p => 
    p.status.toLowerCase().includes('client approval') ||
    p.status.toLowerCase().includes('client_approval')
  )

  return (
    <div className="space-y-6">
      {/* Popups List */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MousePointer className="h-5 w-5" />
            Popups {pendingApprovals.length > 0 && `(${pendingApprovals.length} Pending)`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {popups.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <MousePointer className="h-12 w-12 mx-auto mb-3 text-white/40" />
              <p>No popups found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {popups.map(popup => (
                <div
                  key={popup.id}
                  className="bg-white/10 rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
                  onClick={() => setSelectedPopup(popup)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1">{popup.popup_name}</h4>
                      <p className="text-white/70 text-sm mb-2">{popup.offer}</p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-white/60">{popup.trigger_type}</span>
                        <span className="text-white/60">Launch: {new Date(popup.launch_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {popup.status.toLowerCase().includes('client approval') && (
                      <button className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded text-sm">
                        Review
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Popup Detail Modal */}
      {selectedPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b border-white/20">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-white text-xl mb-2">{selectedPopup.popup_name}</CardTitle>
                  <span className="text-white/60 text-sm">{selectedPopup.trigger_type}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedPopup(null)
                  }}
                  className="text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-4 border border-white/20 md:col-span-2">
                  <p className="text-white/60 text-xs mb-1 uppercase tracking-wide">Offer</p>
                  <p className="text-white font-medium">{selectedPopup.offer}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <p className="text-white/60 text-xs mb-1 uppercase tracking-wide">Launch Date</p>
                  <p className="text-white font-medium">{new Date(selectedPopup.launch_date).toLocaleDateString()}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <p className="text-white/60 text-xs mb-1 uppercase tracking-wide">Target Audience</p>
                  <p className="text-white font-medium">{selectedPopup.target_audience || 'All visitors'}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {selectedPopup.preview_url && (
                  <a
                    href={selectedPopup.preview_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 border border-white/30"
                  >
                    <Eye className="h-4 w-4" />
                    Preview Popup
                  </a>
                )}
                {selectedPopup.copy_doc_url && (
                  <a
                    href={selectedPopup.copy_doc_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 border border-white/30"
                  >
                    <FileText className="h-4 w-4" />
                    View Copy
                  </a>
                )}
              </div>

              {/* Agency Notes */}
              {selectedPopup.internal_notes && (
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <h5 className="text-white font-semibold mb-2">Agency Notes</h5>
                  <p className="text-white/80 text-sm whitespace-pre-wrap">{selectedPopup.internal_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

