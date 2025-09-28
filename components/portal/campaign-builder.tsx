'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Mail, 
  Type, 
  Image, 
  Users, 
  Calendar, 
  Send,
  Eye,
  Save,
  ArrowLeft,
  ArrowRight,
  Palette,
  Layout,
  Target,
  Settings
} from 'lucide-react'

interface CampaignBuilderProps {
  onBack?: () => void
  onSave?: (campaign: any) => void
}

type BuilderStep = 'template' | 'content' | 'audience' | 'settings' | 'review'

export function CampaignBuilder({ onBack, onSave }: CampaignBuilderProps) {
  const [currentStep, setCurrentStep] = useState<BuilderStep>('template')
  const [campaignData, setCampaignData] = useState({
    name: '',
    subject_line: '',
    from_name: '',
    from_email: '',
    template: null,
    content: '',
    audience: [],
    schedule: null,
    settings: {
      track_opens: true,
      track_clicks: true,
      smart_sending: false
    }
  })

  const steps = [
    { id: 'template', label: 'Template', icon: Layout },
    { id: 'content', label: 'Content', icon: Type },
    { id: 'audience', label: 'Audience', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'review', label: 'Review', icon: Eye }
  ]

  const getCurrentStepIndex = () => steps.findIndex(step => step.id === currentStep)

  const renderTemplateStep = () => (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Choose a Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Newsletter Template */}
            <div className="group cursor-pointer">
              <div className="bg-white/10 border border-white/20 rounded-lg p-4 hover:bg-white/15 transition-colors">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-32 rounded-lg mb-3 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-white font-medium">Newsletter</h4>
                <p className="text-white/60 text-sm">Weekly updates and announcements</p>
              </div>
            </div>

            {/* Promotional Template */}
            <div className="group cursor-pointer">
              <div className="bg-white/10 border border-white/20 rounded-lg p-4 hover:bg-white/15 transition-colors">
                <div className="bg-gradient-to-br from-green-500 to-teal-600 h-32 rounded-lg mb-3 flex items-center justify-center">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-white font-medium">Promotional</h4>
                <p className="text-white/60 text-sm">Sales and special offers</p>
              </div>
            </div>

            {/* Product Launch Template */}
            <div className="group cursor-pointer">
              <div className="bg-white/10 border border-white/20 rounded-lg p-4 hover:bg-white/15 transition-colors">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 h-32 rounded-lg mb-3 flex items-center justify-center">
                  <Send className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-white font-medium">Product Launch</h4>
                <p className="text-white/60 text-sm">New product announcements</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderContentStep = () => (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Campaign Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Campaign Name</label>
            <input
              type="text"
              value={campaignData.name}
              onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50"
              placeholder="Enter campaign name..."
            />
          </div>
          
          <div>
            <label className="block text-white text-sm font-medium mb-2">Subject Line</label>
            <input
              type="text"
              value={campaignData.subject_line}
              onChange={(e) => setCampaignData({...campaignData, subject_line: e.target.value})}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50"
              placeholder="Craft a compelling subject line..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">From Name</label>
              <input
                type="text"
                value={campaignData.from_name}
                onChange={(e) => setCampaignData({...campaignData, from_name: e.target.value})}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50"
                placeholder="Your Company"
              />
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">From Email</label>
              <input
                type="email"
                value={campaignData.from_email}
                onChange={(e) => setCampaignData({...campaignData, from_email: e.target.value})}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50"
                placeholder="hello@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Email Content</label>
            <div className="bg-white/10 border border-white/20 rounded-lg p-4 min-h-[300px]">
              <div className="text-center py-12">
                <Palette className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">Drag & Drop Email Builder</p>
                <p className="text-white/40 text-sm">Coming soon - For now, design in Klaviyo</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAudienceStep = () => (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Select Audience</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-white/10 border border-white/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-400" />
                  <div>
                    <h4 className="text-white font-medium">All Subscribers</h4>
                    <p className="text-white/60 text-sm">12,458 profiles</p>
                  </div>
                </div>
                <input type="checkbox" className="rounded" />
              </div>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-green-400" />
                  <div>
                    <h4 className="text-white font-medium">VIP Customers</h4>
                    <p className="text-white/60 text-sm">1,234 profiles</p>
                  </div>
                </div>
                <input type="checkbox" className="rounded" />
              </div>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-purple-400" />
                  <div>
                    <h4 className="text-white font-medium">Recent Purchases</h4>
                    <p className="text-white/60 text-sm">3,567 profiles</p>
                  </div>
                </div>
                <input type="checkbox" className="rounded" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSettingsStep = () => (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Campaign Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-white font-medium mb-4">Tracking</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={campaignData.settings.track_opens}
                  onChange={(e) => setCampaignData({
                    ...campaignData, 
                    settings: {...campaignData.settings, track_opens: e.target.checked}
                  })}
                  className="rounded" 
                />
                <span className="text-white">Track email opens</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={campaignData.settings.track_clicks}
                  onChange={(e) => setCampaignData({
                    ...campaignData, 
                    settings: {...campaignData.settings, track_clicks: e.target.checked}
                  })}
                  className="rounded" 
                />
                <span className="text-white">Track link clicks</span>
              </label>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Send Options</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={campaignData.settings.smart_sending}
                  onChange={(e) => setCampaignData({
                    ...campaignData, 
                    settings: {...campaignData.settings, smart_sending: e.target.checked}
                  })}
                  className="rounded" 
                />
                <span className="text-white">Smart sending (optimal timing)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Schedule</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              />
              <input
                type="time"
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderReviewStep = () => (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Review & Send</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Campaign Summary</h4>
              <div className="space-y-2 text-sm">
                <p className="text-white/80"><span className="text-white/60">Name:</span> {campaignData.name || 'Untitled Campaign'}</p>
                <p className="text-white/80"><span className="text-white/60">Subject:</span> {campaignData.subject_line || 'No subject'}</p>
                <p className="text-white/80"><span className="text-white/60">From:</span> {campaignData.from_name} &lt;{campaignData.from_email}&gt;</p>
                <p className="text-white/80"><span className="text-white/60">Audience:</span> {campaignData.audience.length || 0} segments selected</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <Save className="h-4 w-4" />
                Save as Draft
              </button>
              
              <button className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <Eye className="h-4 w-4" />
                Send for Approval
              </button>
              
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <Send className="h-4 w-4" />
                Send Now
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderContentStep = () => (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Campaign Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Campaign Name</label>
            <input
              type="text"
              value={campaignData.name}
              onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50"
              placeholder="Enter campaign name..."
            />
          </div>
          
          <div>
            <label className="block text-white text-sm font-medium mb-2">Subject Line</label>
            <input
              type="text"
              value={campaignData.subject_line}
              onChange={(e) => setCampaignData({...campaignData, subject_line: e.target.value})}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50"
              placeholder="Craft a compelling subject line..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">From Name</label>
              <input
                type="text"
                value={campaignData.from_name}
                onChange={(e) => setCampaignData({...campaignData, from_name: e.target.value})}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50"
                placeholder="Your Company"
              />
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">From Email</label>
              <input
                type="email"
                value={campaignData.from_email}
                onChange={(e) => setCampaignData({...campaignData, from_email: e.target.value})}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50"
                placeholder="hello@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Email Content</label>
            <div className="bg-white/10 border border-white/20 rounded-lg p-4 min-h-[300px]">
              <div className="text-center py-12">
                <Palette className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">Drag & Drop Email Builder</p>
                <p className="text-white/40 text-sm">Coming soon - For now, design in Klaviyo</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'template':
        return renderTemplateStep()
      case 'content':
        return renderContentStep()
      case 'audience':
        return renderAudienceStep()
      case 'settings':
        return renderSettingsStep()
      case 'review':
        return renderReviewStep()
      default:
        return renderTemplateStep()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with steps */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Campaign Builder</h2>
            {onBack && (
              <button 
                onClick={onBack}
                className="text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = step.id === currentStep
              const isCompleted = index < getCurrentStepIndex()
              
              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => setCurrentStep(step.id as BuilderStep)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-blue-600 text-white' 
                        : isCompleted 
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-white/10 text-white/60 hover:text-white'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{step.label}</span>
                  </button>
                  
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-white/40 mx-2" />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {renderCurrentStep()}

      {/* Navigation */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex justify-between">
            <button
              onClick={() => {
                const currentIndex = getCurrentStepIndex()
                if (currentIndex > 0) {
                  setCurrentStep(steps[currentIndex - 1].id as BuilderStep)
                }
              }}
              disabled={getCurrentStepIndex() === 0}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white py-2 px-6 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>

            <button
              onClick={() => {
                const currentIndex = getCurrentStepIndex()
                if (currentIndex < steps.length - 1) {
                  setCurrentStep(steps[currentIndex + 1].id as BuilderStep)
                }
              }}
              disabled={getCurrentStepIndex() === steps.length - 1}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:text-blue-400 text-white py-2 px-6 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}