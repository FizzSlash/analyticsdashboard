'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BriefIdeasSelector } from '@/components/ops/brief-ideas-selector'
import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  Plus,
  Trash2,
  GripVertical,
  Eye,
  FileText,
  Loader2
} from 'lucide-react'

interface CopyBlock {
  id: string
  type: 'header' | 'subheader' | 'body' | 'pic' | 'cta' | 'product' | 'checkmarks' | 'divider' | 'footer'
  content: string
  description?: string
  cta?: string
  link?: string
  items?: string[]
}

interface PageProps {
  params: {
    slug: string
    campaignId: string
  }
}

export default function CopyGenerationPage({ params }: PageProps) {
  const [campaign, setCampaign] = useState<any>(null)
  const [subjectLines, setSubjectLines] = useState<string[]>([])
  const [selectedSubject, setSelectedSubject] = useState(0)
  const [previewText, setPreviewText] = useState('')
  const [blocks, setBlocks] = useState<CopyBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingBlock, setEditingBlock] = useState<string | null>(null)
  const [productUrls, setProductUrls] = useState<string[]>([''])
  const [showProductInput, setShowProductInput] = useState(false)
  const [showBriefIdeas, setShowBriefIdeas] = useState(false)
  const [briefIdeas, setBriefIdeas] = useState<any>(null)
  const [loadingIdeas, setLoadingIdeas] = useState(false)
  const [selectedBriefIdea, setSelectedBriefIdea] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    loadCampaign()
  }, [params.campaignId])

  const loadCampaign = async () => {
    try {
      const response = await fetch(`/api/ops/campaigns?clientId=all`)
      const data = await response.json()
      
      if (data.success) {
        const camp = data.campaigns.find((c: any) => c.id === params.campaignId)
        if (camp) {
          setCampaign(camp)
          
          // Load existing generated copy if available
          if (camp.generated_copy) {
            setSubjectLines(camp.generated_copy.subject_lines || [])
            setPreviewText(camp.generated_copy.preview_text || '')
            setBlocks(camp.copy_blocks || [])
          }
        }
      }
    } catch (error) {
      console.error('Error loading campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateClick = () => {
    setShowProductInput(true)
    setShowBriefIdeas(false)
  }

  // Step 1: Generate 3 brief ideas
  const handleGenerateBriefIdeas = async () => {
    setLoadingIdeas(true)
    setShowProductInput(false)
    try {
      const validUrls = productUrls.filter(url => url.trim().length > 0)
      
      const response = await fetch('/api/ai/generate-brief-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: params.campaignId,
          initialIdea: campaign?.internal_notes || '',
          productUrls: validUrls
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setBriefIdeas(data.data)
        setShowBriefIdeas(true)
      } else {
        alert(data.error || 'Failed to generate brief ideas')
      }
    } catch (error) {
      console.error('Error generating brief ideas:', error)
      alert('Failed to generate brief ideas')
    } finally {
      setLoadingIdeas(false)
    }
  }

  // Step 2: Regenerate with context
  const handleRegenerateBriefIdeas = async (context: string) => {
    setLoadingIdeas(true)
    try {
      const validUrls = productUrls.filter(url => url.trim().length > 0)
      
      const response = await fetch('/api/ai/generate-brief-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: params.campaignId,
          initialIdea: campaign?.internal_notes || '',
          regenerateContext: context,
          productUrls: validUrls
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setBriefIdeas(data.data)
      }
    } catch (error) {
      console.error('Error regenerating brief ideas:', error)
    } finally {
      setLoadingIdeas(false)
    }
  }

  // Step 3: Generate copy from selected idea
  const handleSelectBriefIdea = async (ideaNumber: 1 | 2 | 3, idea: any) => {
    setSelectedBriefIdea({ number: ideaNumber, ...idea })
    setShowBriefIdeas(false)
    setGenerating(true)
    
    try {
      const validUrls = productUrls.filter(url => url.trim().length > 0)

      const response = await fetch('/api/ai/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: params.campaignId,
          brief: idea.brief, // Use the selected brief
          productUrls: validUrls
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setSubjectLines(result.data.subject_lines)
        setPreviewText(result.data.preview_text)
        setBlocks(result.data.email_blocks.map((b: any, i: number) => ({
          id: `block-${i}`,
          ...b
        })))
        alert('✅ Copy generated successfully!')
      } else {
        if (result.error.includes('Copy notes not found')) {
          alert('⚠️ Copy Notes Required\n\nThis client needs Copy Notes before generating copy.\n\nGo to Content Hub → Copy Notes to set them up.')
        } else {
          alert('Failed to generate: ' + result.error)
        }
      }
    } catch (error) {
      console.error('Generation error:', error)
      alert('Failed to generate copy')
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Create a Google Docs-style text export
      const copyText = `SUBJECT LINE
${subjectLines[selectedSubject]}

PREVIEW
${previewText}

________________

${blocks.map(block => {
  let blockText = ''
  
  switch (block.type) {
    case 'header':
      blockText = `HEADER\n${block.content}`
      break
    case 'subheader':
      blockText = `SUBHEADER\n${block.content}`
      break
    case 'body':
      blockText = `BODY\n${block.content}`
      break
    case 'pic':
      blockText = `PIC / IMAGE\n${block.content}`
      break
    case 'cta':
      blockText = `CTA\n${block.content}${block.link ? ` → ${block.link}` : ''}`
      break
    case 'product':
      blockText = `PRODUCT BLOCK\n${block.content}\n${block.description || ''}\nCTA: ${block.cta || 'Shop'} → ${block.link || '{INSERT LINK}'}`
      break
    case 'checkmarks':
      blockText = `CHECKMARKS\n${block.items?.map(item => `✔️ ${item}`).join('\n') || ''}`
      break
    case 'divider':
      blockText = '________________'
      break
    case 'footer':
      blockText = `FOOTER\n${block.content}`
      break
  }
  
  return blockText
}).join('\n\n________________\n\n')}`

      // Save to campaign with copy_doc_url pointing to this generated copy
      const response = await fetch('/api/ops/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: params.campaignId,
          generated_copy: {
            subject_lines: subjectLines,
            preview_text: previewText,
            email_blocks: blocks,
            formatted_copy: copyText
          },
          copy_blocks: blocks,
          copy_doc_url: `${window.location.origin}/agency/${params.slug}/copy/${params.campaignId}`
        })
      })

      if (response.ok) {
        alert('✅ Copy saved to campaign!\n\nClosing this tab. Refresh your Ops page to see the Copy Doc URL.')
        // Signal parent window to refresh if possible
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({ type: 'COPY_SAVED', campaignId: params.campaignId }, '*')
        }
        window.close()
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const [addingBlockAfter, setAddingBlockAfter] = useState<number | null>(null)
  const [revisionPrompt, setRevisionPrompt] = useState('')
  const [regenerating, setRegenerating] = useState(false)

  const addBlock = (afterIndex: number, type: CopyBlock['type']) => {
    const newBlock: CopyBlock = {
      id: `block-${Date.now()}`,
      type,
      content: ''
    }
    const newBlocks = [...blocks]
    newBlocks.splice(afterIndex + 1, 0, newBlock)
    setBlocks(newBlocks)
    setEditingBlock(newBlock.id)
    setAddingBlockAfter(null)
  }

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const newBlocks = [...blocks]
    const [movedBlock] = newBlocks.splice(fromIndex, 1)
    newBlocks.splice(toIndex, 0, movedBlock)
    setBlocks(newBlocks)
  }

  const handleRegenerate = async () => {
    if (!revisionPrompt.trim()) {
      alert('Please enter revision notes')
      return
    }

    setRegenerating(true)
    try {
      const response = await fetch('/api/ai/revise-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentCopy: {
            subject_lines: subjectLines,
            preview_text: previewText,
            email_blocks: blocks
          },
          revisionNotes: revisionPrompt,
          copyNotes: {} // Will fetch if needed
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setSubjectLines(result.data.subject_lines)
        setPreviewText(result.data.preview_text)
        setBlocks(result.data.email_blocks.map((b: any, i: number) => ({
          id: `block-${Date.now()}-${i}`,
          ...b
        })))
        setRevisionPrompt('')
        alert('✅ Copy revised based on your feedback!')
      } else {
        alert('Failed to revise: ' + result.error)
      }
    } catch (error) {
      console.error('Regeneration error:', error)
      alert('Failed to revise copy')
    } finally {
      setRegenerating(false)
    }
  }

  const deleteBlock = (blockId: string) => {
    setBlocks(blocks.filter(b => b.id !== blockId))
  }

  const updateBlock = (blockId: string, updates: Partial<CopyBlock>) => {
    setBlocks(blocks.map(b => b.id === blockId ? { ...b, ...updates } : b))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.close()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{campaign?.campaign_name}</h1>
                <p className="text-sm text-gray-600">AI Copy Generation</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {blocks.length === 0 && !showProductInput && (
                <button
                  onClick={handleGenerateClick}
                  disabled={generating}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" /> Generate Copy
                </button>
              )}
              
              {showProductInput && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
                  >
                    {generating ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="h-4 w-4" /> Generate Now</>
                    )}
                  </button>
                  <button
                    onClick={() => setShowProductInput(false)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                </div>
              )}
              {blocks.length > 0 && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
                >
                  {saving ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="h-4 w-4" /> Save to Campaign</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {blocks.length === 0 && !showProductInput ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Generate Copy</h2>
              <p className="text-gray-600 mb-6">
                Click "Generate Copy" to create email copy using Claude AI
              </p>
              <button
                onClick={() => {
                  setShowProductInput(true)
                  setShowBriefIdeas(false)
                }}
                disabled={generating || loadingIdeas}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-bold text-lg flex items-center gap-2 mx-auto"
              >
                <Sparkles className="h-5 w-5" /> Start Copy Generation
              </button>
            </CardContent>
          </Card>
        ) : showProductInput ? (
          <Card>
            <CardHeader>
              <CardTitle>Product URLs (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Add product URLs to scrape accurate product information. AI will use exact names, descriptions, and details from these pages.
              </p>
              {productUrls.map((url, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...productUrls]
                      newUrls[idx] = e.target.value
                      setProductUrls(newUrls)
                    }}
                    placeholder="https://example.com/product-page"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  {productUrls.length > 1 && (
                    <button
                      onClick={() => setProductUrls(productUrls.filter((_, i) => i !== idx))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setProductUrls([...productUrls, ''])}
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Another URL
              </button>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleGenerateBriefIdeas}
                  disabled={generating || loadingIdeas}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                >
                  {loadingIdeas ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Generating Ideas...</>
                  ) : (
                    <><Sparkles className="h-5 w-5" /> Generate 3 Brief Ideas</>
                  )}
                </button>
                <button
                  onClick={() => setShowProductInput(false)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </CardContent>
          </Card>
        ) : showBriefIdeas ? (
          // Step 2: Show 3 Brief Ideas for selection
          <BriefIdeasSelector
            campaignId={params.campaignId}
            campaignName={campaign?.campaign_name || ''}
            briefIdeas={briefIdeas}
            onSelect={handleSelectBriefIdea}
            onRegenerate={handleRegenerateBriefIdeas}
            loading={loadingIdeas}
          />
        ) : (
          <div className="space-y-6">
            {/* Subject Lines */}
            <Card>
              <CardHeader>
                <CardTitle>Subject Lines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {subjectLines.map((subject, idx) => (
                  <label key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <input
                      type="radio"
                      checked={selectedSubject === idx}
                      onChange={() => setSelectedSubject(idx)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-900">{subject}</span>
                  </label>
                ))}
              </CardContent>
            </Card>

            {/* Preview Text */}
            <Card>
              <CardHeader>
                <CardTitle>Preview Text</CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="text"
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Preview text..."
                />
              </CardContent>
            </Card>

            {/* Revision Section */}
            <Card>
              <CardHeader>
                <CardTitle>Revise Copy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <textarea
                  value={revisionPrompt}
                  onChange={(e) => setRevisionPrompt(e.target.value)}
                  placeholder="Enter revision notes (e.g., 'Make it more urgent', 'Add social proof', 'Focus on benefits over features')..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                />
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating || !revisionPrompt.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  {regenerating ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Regenerating...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> Regenerate with Revisions</>
                  )}
                </button>
              </CardContent>
            </Card>

            {/* Email Blocks */}
            <Card>
              <CardHeader>
                <CardTitle>Email Blocks (Click to Edit)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {blocks.map((block, idx) => (
                  <div key={block.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:border-blue-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => idx > 0 && moveBlock(idx, idx - 1)}
                          disabled={idx === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          title="Move up"
                        >
                          ▲
                        </button>
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <button
                          onClick={() => idx < blocks.length - 1 && moveBlock(idx, idx + 1)}
                          disabled={idx === blocks.length - 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          title="Move down"
                        >
                          ▼
                        </button>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-600 uppercase">{block.type}</span>
                          <button
                            onClick={() => deleteBlock(block.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {/* Click anywhere to edit */}
                        <div onClick={() => setEditingBlock(block.id)} className="cursor-text">
                        {editingBlock === block.id ? (
                          <div className="space-y-2">
                            {block.type === 'checkmarks' ? (
                              <textarea
                                value={block.items?.join('\n') || ''}
                                onChange={(e) => updateBlock(block.id, { items: e.target.value.split('\n').filter(s => s.trim()) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                                rows={4}
                                placeholder="Item 1&#10;Item 2&#10;Item 3"
                              />
                            ) : (
                              <>
                                <textarea
                                  value={block.content}
                                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  rows={3}
                                />
                                {block.type === 'product' && (
                                  <>
                                    <input
                                      type="text"
                                      value={block.description || ''}
                                      onChange={(e) => updateBlock(block.id, { description: e.target.value })}
                                      placeholder="Description..."
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={block.cta || ''}
                                        onChange={(e) => updateBlock(block.id, { cta: e.target.value })}
                                        placeholder="CTA text..."
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                      />
                                      <input
                                        type="text"
                                        value={block.link || ''}
                                        onChange={(e) => updateBlock(block.id, { link: e.target.value })}
                                        placeholder="Link..."
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                      />
                                    </div>
                                  </>
                                )}
                                {block.type === 'cta' && (
                                  <input
                                    type="text"
                                    value={block.link || ''}
                                    onChange={(e) => updateBlock(block.id, { link: e.target.value })}
                                    placeholder="Link..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  />
                                )}
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-900">
                            {block.type === 'checkmarks' ? (
                              <ul className="space-y-1">
                                {block.items?.map((item, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-green-600">✔️</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <>
                                <p className="font-medium">{block.content}</p>
                                {block.description && <p className="text-sm text-gray-600 mt-1">{block.description}</p>}
                                {block.cta && (
                                  <p className="text-sm text-blue-600 mt-1">CTA: {block.cta} → {block.link}</p>
                                )}
                              </>
                            )}
                          </div>
                        )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Add Block Below with Type Selector */}
                    {addingBlockAfter === idx ? (
                      <div className="mt-2 p-2 bg-gray-50 rounded flex flex-wrap gap-2">
                        {(['header', 'subheader', 'body', 'pic', 'cta', 'product', 'checkmarks', 'divider', 'footer'] as const).map(type => (
                          <button
                            key={type}
                            onClick={() => addBlock(idx, type)}
                            className="px-3 py-1 text-xs bg-white border border-gray-300 hover:border-blue-500 hover:text-blue-600 rounded"
                          >
                            {type}
                          </button>
                        ))}
                        <button
                          onClick={() => setAddingBlockAfter(null)}
                          className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingBlockAfter(idx)}
                        className="w-full mt-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded"
                      >
                        + Add Block Below
                      </button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

