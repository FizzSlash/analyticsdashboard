'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Save, 
  RotateCcw, 
  Sparkles,
  FileText,
  MessageSquare,
  Lightbulb,
  Edit3,
  Check,
  X
} from 'lucide-react'

interface AIPromptsSettingsProps {
  agencyId: string
}

interface PromptConfig {
  id: string
  name: string
  description: string
  prompt: string
  icon: any
  color: string
}

const DEFAULT_PROMPTS = {
  copy_notes: `You are analyzing a brand to create comprehensive copywriting guidelines.

BRAND: {brand_name}
WEBSITE: {website_url}

Based on the brand name and industry, generate detailed copy notes:

1. Voice & Tone: How should the brand communicate?
2. Brand Personality: 3-5 adjectives
3. Writing Style: Sentence structure, approach
4. Key Phrases: 5-10 phrases that fit the brand
5. Words to Avoid: What NOT to say
6. Target Audience: Who are they speaking to?
7. Pain Points: What problems do customers have?

Return as JSON with fields: voice_tone, brand_personality, writing_style, key_phrases, words_to_avoid, target_audience, pain_points`,

  brief_ideas: `You are a strategic email campaign expert. Analyze this campaign and generate the 3 BEST strategic approaches based on the brand, audience, and campaign objective.

CAMPAIGN: {campaign_name}
CAMPAIGN OBJECTIVE: {initial_idea}

BRAND CONTEXT:
- Voice & Tone: {voice_tone}
- Brand Personality: {brand_personality}
- Target Audience: {target_audience}
- Pain Points: {pain_points}

TASK: Generate the 3 BEST strategic approaches for THIS specific campaign and brand.

Consider:
- What will resonate most with THIS audience?
- What matches THIS brand's voice and personality?
- What structure best serves THIS campaign objective?

Return 3 ideas as JSON with: title, brief, block_layout, strategy`,

  email_copy: `PURPOSE: Generate clean, conversion-ready e-commerce emails using a modular block system.

1. GLOBAL TONE RULES
- No em dashes or hyphens
- Short, confident sentences
- Sound human, not corporate or forced
- Prioritize clarity and flow over creativity
- Each block should communicate one idea
- All text should fit within a clean, grid-based design

2. EMAIL ARCHITECTURE
All emails are built from modular blocks. Start with a Hero Section (header, subheader, image, CTA), then mix and match support blocks.

CORE BUILDING BLOCKS:
- HEADER – Clear and bold. Always first.
- SUBHEADER – Reinforces the main offer, theme, or hook.
- HERO IMAGE / VIDEO – Show the product, person, or scene.
- CTA – Single button, strong verb.
- SECONDARY HEADER – Used for supporting points or transitions.
- BODY COPY – 1–3 sentences. Explain or add depth.
- GRAPHIC / VISUAL ELEMENT – Charts, product visuals, feature highlights.
- BULLET LIST – Condense benefits or steps into 3–5 bullets.
- PRODUCT BLOCKS – 3–4 featured products, each with name and one short line.
- TABLE / COMPARISON BLOCK – For tech or spec-driven brands.
- REVIEWS BLOCK – Social proof or customer feedback.
- CLOSING CTA – Final push.

3. OBJECTIVE-DRIVEN LAYOUTS
Choose blocks based on campaign objective:

Product Launch: HEADER → SUBHEADER → HERO IMAGE → CTA → SECONDARY HEADER ("Highlights") → BULLET LIST (3–4 USPs) → CTA → PRODUCT BLOCKS → CLOSING CTA

Offer/Sale: HEADER (offer/discount) → SUBHEADER (code/deadline) → HERO IMAGE → CTA → BODY COPY (1–2 sentences) → GRAPHIC or PRODUCT BLOCKS → CTA

Education/Blog: HEADER (topic) → HERO IMAGE → CTA ("Read More") → SECONDARY HEADER (key takeaway) → BULLET LIST → CTA → PRODUCT BLOCKS (optional)

Winback: HEADER (conversational) → SUBHEADER (offer reminder) → HERO IMAGE → CTA → SECONDARY HEADER → BODY COPY → CTA → PRODUCT BLOCKS

Default flow: HEADER → SUBHEADER → IMAGE → CTA → HEADER → BODY/BULLETS/GRAPHIC → CTA → PRODUCT BLOCKS

4. BRAND VOICE
Voice & Tone: {voice_tone}
Brand Personality: {brand_personality}
Key Phrases: {key_phrases}
Words to Avoid: {words_to_avoid}

5. CAMPAIGN
Campaign: {campaign_name}
Brief: {brief}

6. CTA LANGUAGE BANK
- Shop Now
- See the Line
- Watch the Launch
- Learn More
- Use My Code
- Enter Now
- Claim Offer
- Explore More

Generate 6-10 blocks as JSON with: subject_lines, preview_text, email_blocks. Each block should be self-contained and scrollable.`,

  copy_revision: `You are revising email copy based on client feedback.

CURRENT COPY: {current_copy}
REVISION REQUEST: {revision_notes}

BRAND GUIDELINES:
- Voice & Tone: {voice_tone}
- Key Phrases: {key_phrases}
- Words to Avoid: {words_to_avoid}

CRITICAL RULES:
1. Keep same overall structure
2. Apply requested revisions precisely
3. Follow brand guidelines
4. Return COMPLETE revised email

Return revised copy as JSON with: subject_lines, preview_text, email_blocks`
}

export function AIPromptsSettings({ agencyId }: AIPromptsSettingsProps) {
  const [prompts, setPrompts] = useState<PromptConfig[]>([
    {
      id: 'copy_notes',
      name: 'Copy Notes Generation',
      description: 'Analyzes brand and creates copywriting guidelines',
      prompt: DEFAULT_PROMPTS.copy_notes,
      icon: FileText,
      color: 'blue'
    },
    {
      id: 'brief_ideas',
      name: 'Brief Ideas Generation',
      description: 'Creates 3 strategic campaign approaches',
      prompt: DEFAULT_PROMPTS.brief_ideas,
      icon: Lightbulb,
      color: 'purple'
    },
    {
      id: 'email_copy',
      name: 'Email Copy Generation',
      description: 'Generates final email copy with blocks',
      prompt: DEFAULT_PROMPTS.email_copy,
      icon: Sparkles,
      color: 'green'
    },
    {
      id: 'copy_revision',
      name: 'Copy Revision',
      description: 'Revises copy based on feedback',
      prompt: DEFAULT_PROMPTS.copy_revision,
      icon: MessageSquare,
      color: 'orange'
    }
  ])

  const [editingPrompt, setEditingPrompt] = useState<string | null>(null)
  const [editedText, setEditedText] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load custom prompts from database
  useEffect(() => {
    const loadCustomPrompts = async () => {
      if (!agencyId) return
      
      try {
        const response = await fetch(`/api/ops/ai-prompts?agencyId=${agencyId}`)
        const data = await response.json()
        
        if (data.success && data.prompts) {
          // Merge custom prompts with defaults
          setPrompts(prompts.map(p => ({
            ...p,
            prompt: data.prompts[p.id] || p.prompt
          })))
        }
      } catch (error) {
        console.error('Error loading custom prompts:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadCustomPrompts()
  }, [agencyId])

  const handleEdit = (promptId: string) => {
    const prompt = prompts.find(p => p.id === promptId)
    if (prompt) {
      setEditingPrompt(promptId)
      setEditedText(prompt.prompt)
    }
  }

  const handleSave = async () => {
    if (!editingPrompt) return

    setSaving(true)
    try {
      // Save to database
      const response = await fetch('/api/ops/ai-prompts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyId,
          promptId: editingPrompt,
          promptText: editedText
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Update the prompt in state
        setPrompts(prompts.map(p => 
          p.id === editingPrompt ? { ...p, prompt: editedText } : p
        ))
        
        setEditingPrompt(null)
        alert('✅ Prompt updated successfully')
      } else {
        throw new Error(data.error || 'Failed to save')
      }
    } catch (error) {
      console.error('Error saving prompt:', error)
      alert('Failed to save prompt')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async (promptId: string) => {
    if (!confirm('Reset this prompt to default? This will delete your custom version.')) return
    
    try {
      // Delete custom prompt from database
      const response = await fetch(`/api/ops/ai-prompts?agencyId=${agencyId}&promptId=${promptId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Reset to default in state
        setPrompts(prompts.map(p => 
          p.id === promptId ? { ...p, prompt: DEFAULT_PROMPTS[promptId as keyof typeof DEFAULT_PROMPTS] } : p
        ))
        alert('✅ Prompt reset to default')
      }
    } catch (error) {
      console.error('Error resetting prompt:', error)
      alert('Failed to reset prompt')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Prompts Configuration
          </CardTitle>
          <p className="text-white/70 text-sm">
            Customize the AI prompts used for copy generation. Changes apply to all campaigns.
          </p>
        </CardHeader>
      </Card>

      {/* Prompts List */}
      <div className="grid grid-cols-1 gap-6">
        {prompts.map((promptConfig) => {
          const Icon = promptConfig.icon
          const isEditing = editingPrompt === promptConfig.id

          return (
            <Card key={promptConfig.id} className="bg-white border border-gray-200">
              <CardHeader className={`bg-${promptConfig.color}-50 border-b border-${promptConfig.color}-100`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-${promptConfig.color}-100 rounded-lg`}>
                      <Icon className={`h-5 w-5 text-${promptConfig.color}-600`} />
                    </div>
                    <div>
                      <CardTitle className="text-gray-900">{promptConfig.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{promptConfig.description}</p>
                    </div>
                  </div>

                  {!isEditing && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(promptConfig.id)}
                        className={`px-4 py-2 bg-${promptConfig.color}-600 hover:bg-${promptConfig.color}-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors`}
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleReset(promptConfig.id)}
                        className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Reset to default"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm min-h-[400px]"
                      placeholder="Enter your custom prompt..."
                    />
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2 text-sm">Available Variables:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-blue-800 font-mono">
                        <div>• {'{brand_name}'}</div>
                        <div>• {'{campaign_name}'}</div>
                        <div>• {'{voice_tone}'}</div>
                        <div>• {'{brand_personality}'}</div>
                        <div>• {'{target_audience}'}</div>
                        <div>• {'{pain_points}'}</div>
                        <div>• {'{key_phrases}'}</div>
                        <div>• {'{words_to_avoid}'}</div>
                        <div>• {'{initial_idea}'}</div>
                        <div>• {'{brief}'}</div>
                        <div>• {'{current_copy}'}</div>
                        <div>• {'{revision_notes}'}</div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <Check className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingPrompt(null)
                          setEditedText('')
                        }}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto">
                      {promptConfig.prompt}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="h-6 w-6 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">About AI Prompts</h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>
                  <strong>These prompts control how Claude AI generates content.</strong> Customize them to better match your agency's style and requirements.
                </p>
                <p>
                  Use the <code className="bg-blue-100 px-2 py-0.5 rounded">{'{variable}'}</code> syntax to insert dynamic values. The AI will replace these with actual data when generating content.
                </p>
                <p>
                  <strong>Note:</strong> Changes apply to all future copy generations. Already-generated copy is not affected.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

