'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Sparkles, 
  CheckCircle2, 
  Edit3, 
  RefreshCw, 
  ArrowRight,
  Lightbulb,
  Layout,
  Target
} from 'lucide-react'

interface BriefIdea {
  title: string
  brief: string
  block_layout: string
  strategy: string
}

interface BriefIdeasSelectorProps {
  campaignId: string
  campaignName: string
  briefIdeas?: {
    idea1: BriefIdea
    idea2: BriefIdea
    idea3: BriefIdea
  } | null
  onSelect: (ideaNumber: 1 | 2 | 3, idea: BriefIdea) => void
  onRegenerate: (context: string) => void
  loading?: boolean
}

export function BriefIdeasSelector({
  campaignId,
  campaignName,
  briefIdeas,
  onSelect,
  onRegenerate,
  loading = false
}: BriefIdeasSelectorProps) {
  const [selectedIdea, setSelectedIdea] = useState<1 | 2 | 3 | null>(null)
  const [editingIdea, setEditingIdea] = useState<{ number: 1 | 2 | 3; idea: BriefIdea } | null>(null)
  const [showRevisionBox, setShowRevisionBox] = useState(false)
  const [revisionContext, setRevisionContext] = useState('')
  const [regenerating, setRegenerating] = useState(false)

  if (!briefIdeas && !loading) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-12 text-center">
          <Sparkles className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Ready to Generate Brief Ideas
          </h3>
          <p className="text-gray-600 mb-6">
            AI will create 3 distinct strategic approaches for your campaign
          </p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating 3 strategic brief ideas...</p>
          <p className="text-gray-500 text-sm mt-2">This may take 10-15 seconds</p>
        </CardContent>
      </Card>
    )
  }

  const ideas: Array<{ number: 1 | 2 | 3; data: BriefIdea; color: string; icon: string }> = [
    { number: 1, data: briefIdeas!.idea1, color: 'blue', icon: '🎯' },
    { number: 2, data: briefIdeas!.idea2, color: 'purple', icon: '📖' },
    { number: 3, data: briefIdeas!.idea3, color: 'green', icon: '💡' }
  ]

  const handleEdit = (number: 1 | 2 | 3, idea: BriefIdea) => {
    setEditingIdea({ number, idea: { ...idea } })
  }

  const handleSaveEdit = () => {
    if (editingIdea) {
      onSelect(editingIdea.number, editingIdea.idea)
      setEditingIdea(null)
    }
  }

  const handleRegenerate = () => {
    if (!revisionContext.trim()) {
      alert('Please enter some context for regeneration')
      return
    }
    setRegenerating(true)
    onRegenerate(revisionContext)
    setRevisionContext('')
    setShowRevisionBox(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Choose Your Strategic Approach
              </h2>
              <p className="text-white/90">
                Select one of these 3 ideas, or regenerate with additional context
              </p>
            </div>
            <Sparkles className="h-12 w-12 text-white/80" />
          </div>
        </CardContent>
      </Card>

      {/* 3 Brief Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ideas.map(({ number, data, color, icon }) => (
          <Card 
            key={number}
            className={`border-2 transition-all hover:shadow-lg ${
              selectedIdea === number 
                ? `border-${color}-500 shadow-xl ring-2 ring-${color}-200` 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <CardHeader className={`bg-${color}-50 border-b border-${color}-100`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase">
                      Idea {number}
                    </div>
                    <CardTitle className={`text-lg text-${color}-900`}>
                      {data.title}
                    </CardTitle>
                  </div>
                </div>
                {selectedIdea === number && (
                  <CheckCircle2 className={`h-6 w-6 text-${color}-600`} />
                )}
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {/* Strategy */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-gray-500" />
                  <div className="text-xs font-semibold text-gray-500 uppercase">Strategy</div>
                </div>
                <p className="text-sm text-gray-700 italic">
                  {data.strategy}
                </p>
              </div>

              {/* Brief */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-gray-500" />
                  <div className="text-xs font-semibold text-gray-500 uppercase">Brief</div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {data.brief}
                </p>
              </div>

              {/* Block Layout */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Layout className="h-4 w-4 text-gray-500" />
                  <div className="text-xs font-semibold text-gray-500 uppercase">Block Layout</div>
                </div>
                <div className={`text-xs font-mono bg-${color}-50 p-3 rounded border border-${color}-200 text-${color}-800 leading-relaxed`}>
                  {data.block_layout}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedIdea(number)
                    onSelect(number, data)
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                    selectedIdea === number
                      ? `bg-${color}-600 text-white shadow-md`
                      : `bg-${color}-100 text-${color}-700 hover:bg-${color}-200`
                  }`}
                >
                  {selectedIdea === number ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Selected
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4" />
                      Select This
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => handleEdit(number, data)}
                  className={`px-4 py-3 border-2 border-${color}-300 text-${color}-700 rounded-lg hover:bg-${color}-50 transition-all`}
                  title="Edit this idea"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Not Happy? Regenerate Section */}
      <Card className="bg-orange-50 border-2 border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <RefreshCw className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-2">
                Not happy with these ideas?
              </h3>
              
              {!showRevisionBox ? (
                <button
                  onClick={() => setShowRevisionBox(true)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                >
                  Generate 3 New Ideas
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-orange-800">
                    Tell me what you'd like to see in the new ideas:
                  </p>
                  <textarea
                    value={revisionContext}
                    onChange={(e) => setRevisionContext(e.target.value)}
                    placeholder="Examples:&#10;• Make them more urgent and time-sensitive&#10;• Focus on sustainability angle&#10;• Include more social proof&#10;• Emphasize exclusivity"
                    className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[100px]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleRegenerate}
                      disabled={regenerating || !revisionContext.trim()}
                      className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />
                      {regenerating ? 'Generating...' : 'Generate New Ideas'}
                    </button>
                    <button
                      onClick={() => {
                        setShowRevisionBox(false)
                        setRevisionContext('')
                      }}
                      className="px-4 py-2 border-2 border-orange-300 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingIdea && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Edit Idea {editingIdea.number}: {editingIdea.idea.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editingIdea.idea.title}
                  onChange={(e) => setEditingIdea({
                    ...editingIdea,
                    idea: { ...editingIdea.idea, title: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Brief */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Campaign Brief
                </label>
                <textarea
                  value={editingIdea.idea.brief}
                  onChange={(e) => setEditingIdea({
                    ...editingIdea,
                    idea: { ...editingIdea.idea, brief: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[150px]"
                />
              </div>

              {/* Block Layout */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Block Layout
                </label>
                <input
                  type="text"
                  value={editingIdea.idea.block_layout}
                  onChange={(e) => setEditingIdea({
                    ...editingIdea,
                    idea: { ...editingIdea.idea, block_layout: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use → between blocks (e.g., HEADER → SUBHEADER → CTA)
                </p>
              </div>

              {/* Strategy */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Strategy / Why This Works
                </label>
                <textarea
                  value={editingIdea.idea.strategy}
                  onChange={(e) => setEditingIdea({
                    ...editingIdea,
                    idea: { ...editingIdea.idea, strategy: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Save & Use This Idea
                </button>
                <button
                  onClick={() => setEditingIdea(null)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Selected Idea - Proceed to Copy */}
      {selectedIdea && !editingIdea && (
        <Card className="bg-green-50 border-2 border-green-400 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <div className="font-semibold text-green-900">
                    Idea {selectedIdea} Selected: {ideas.find(i => i.number === selectedIdea)?.data.title}
                  </div>
                  <div className="text-sm text-green-700">
                    Ready to generate email copy with this strategy
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  const idea = ideas.find(i => i.number === selectedIdea)
                  if (idea) {
                    onSelect(selectedIdea, idea.data)
                  }
                }}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                Generate Email Copy
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

