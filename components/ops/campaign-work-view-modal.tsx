'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, ExternalLink, FileText, Palette, Link as LinkIcon, MessageSquare } from 'lucide-react'

interface Campaign {
  id: string
  campaign_name: string
  client_id: string
  client_name: string
  subject_line?: string
  send_date: Date
  target_audience?: string
  copy_doc_url?: string
  preview_url?: string
  internal_notes?: string
  client_feedback?: string
}

interface CampaignWorkViewModalProps {
  campaign: Campaign
  onClose: () => void
}

export function CampaignWorkViewModal({ campaign, onClose }: CampaignWorkViewModalProps) {
  const [brandLinks, setBrandLinks] = useState<any[]>([])
  const [brandGuidelines, setBrandGuidelines] = useState<any>(null)
  const [copyNotes, setCopyNotes] = useState<any>(null)
  const [designNotes, setDesignNotes] = useState<any>(null)

  useEffect(() => {
    fetchBrandData()
  }, [campaign.client_id])

  const fetchBrandData = async () => {
    try {
      // Fetch brand links
      const linksResponse = await fetch(`/api/ops/content?type=links&clientId=${campaign.client_id}`)
      const linksData = await linksResponse.json()
      if (linksData.success) {
        setBrandLinks(linksData.data || [])
      }

      // Fetch brand guidelines
      const guidelinesResponse = await fetch(`/api/ops/content?type=guidelines&clientId=${campaign.client_id}`)
      const guidelinesData = await guidelinesResponse.json()
      if (guidelinesData.success) {
        setBrandGuidelines(guidelinesData.data)
      }

      // Fetch copy notes
      const copyResponse = await fetch(`/api/ops/content?type=copy&clientId=${campaign.client_id}`)
      const copyData = await copyResponse.json()
      if (copyData.success) {
        setCopyNotes(copyData.data)
      }

      // Fetch design notes
      const designResponse = await fetch(`/api/ops/content?type=design&clientId=${campaign.client_id}`)
      const designData = await designResponse.json()
      if (designData.success) {
        setDesignNotes(designData.data)
      }
    } catch (error) {
      console.error('Error fetching brand data:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-7xl h-[90vh] rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{campaign.campaign_name}</h2>
            <p className="text-gray-600 text-sm mt-1">{campaign.client_name}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Split View Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* LEFT SIDE - Campaign Info & Copy */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h3>
              
              {/* Campaign Info */}
              <div className="space-y-3 mb-6">
                {campaign.subject_line && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Subject Line</p>
                    <p className="text-gray-900 font-medium">{campaign.subject_line}</p>
                  </div>
                )}
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Send Date</p>
                  <p className="text-gray-900 font-medium">{campaign.send_date.toLocaleDateString()}</p>
                </div>

                {campaign.target_audience && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Target Audience</p>
                    <p className="text-gray-900">{campaign.target_audience}</p>
                  </div>
                )}
              </div>

              {/* Copy Document */}
              {campaign.copy_doc_url && (
                <div className="mb-6">
                  <a
                    href={campaign.copy_doc_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    Open Copy Document
                  </a>
                </div>
              )}

              {/* Preview */}
              {campaign.preview_url && (
                <div className="mb-6">
                  <a
                    href={campaign.preview_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Design Preview
                  </a>
                </div>
              )}

              {/* Internal Notes */}
              {campaign.internal_notes && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Agency Notes
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-800 text-sm whitespace-pre-wrap">{campaign.internal_notes}</p>
                  </div>
                </div>
              )}

              {/* Client Feedback */}
              {campaign.client_feedback && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-orange-600" />
                    Client Feedback
                  </h4>
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <p className="text-gray-800 text-sm whitespace-pre-wrap">{campaign.client_feedback}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE - Brand Guidelines & Resources */}
          <div className="w-1/2 overflow-y-auto p-6 space-y-6 bg-gray-50">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Brand Resources</h3>

              {/* Pinned Links */}
              {brandLinks.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Quick Links
                  </h4>
                  <div className="space-y-2">
                    {brandLinks.map(link => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <span className="text-gray-900 font-medium">{link.link_name}</span>
                        <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Copy Notes */}
              {copyNotes?.copy_guidelines && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Copy Guidelines
                  </h4>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-800 text-sm whitespace-pre-wrap">{copyNotes.copy_guidelines}</p>
                  </div>
                </div>
              )}

              {/* Design Notes */}
              {designNotes?.design_preferences && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Palette className="h-4 w-4 text-purple-600" />
                    Design Guidelines
                  </h4>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-800 text-sm whitespace-pre-wrap">{designNotes.design_preferences}</p>
                  </div>
                </div>
              )}

              {/* Brand Guidelines */}
              {brandGuidelines && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Brand Guidelines</h4>
                  
                  {brandGuidelines.brand_colors && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200 mb-3">
                      <p className="text-xs text-gray-600 mb-2">Brand Colors</p>
                      <p className="text-gray-800 text-sm whitespace-pre-wrap">{brandGuidelines.brand_colors}</p>
                    </div>
                  )}

                  {brandGuidelines.fonts && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200 mb-3">
                      <p className="text-xs text-gray-600 mb-2">Fonts</p>
                      <p className="text-gray-800 text-sm whitespace-pre-wrap">{brandGuidelines.fonts}</p>
                    </div>
                  )}

                  {brandGuidelines.voice_tone && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-2">Voice & Tone</p>
                      <p className="text-gray-800 text-sm whitespace-pre-wrap">{brandGuidelines.voice_tone}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Empty State */}
              {brandLinks.length === 0 && !copyNotes && !designNotes && !brandGuidelines && (
                <div className="text-center py-12 text-gray-400">
                  <LinkIcon className="h-12 w-12 mx-auto mb-3" />
                  <p>No brand resources yet</p>
                  <p className="text-sm mt-1">Add links and guidelines in Content Hub</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

