'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Link as LinkIcon,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Palette,
  Type,
  FileText,
  Briefcase,
  Star,
  Search,
  Figma,
  Upload,
  Download,
  File,
  Image as ImageIcon,
  Phone,
  CheckCircle,
  Circle,
  Calendar as CalendarIcon
} from 'lucide-react'

interface BrandLink {
  id: string
  client_id: string
  link_title: string
  url: string
  category: 'figma' | 'drive' | 'website' | 'competitor' | 'other'
  description?: string
  is_favorite: boolean
}

interface BrandFile {
  id: string
  client_id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  category: 'logo' | 'font' | 'document' | 'other'
  uploaded_at: Date
}

interface BrandGuidelines {
  client_id: string
  brand_colors: string[]
  fonts: string
  tone_of_voice: string
  legal_requirements: string
  key_messaging: string
}

interface CopyNotes {
  client_id: string
  voice_tone: string
  key_phrases: string
  avoid_phrases: string
  legal_notes: string
}

interface DesignNotes {
  client_id: string
  design_preferences: string
  client_likes: string
  client_dislikes: string
  image_style: string
  mobile_notes: string
}

interface CallNote {
  id: string
  client_id: string
  call_date: Date
  agenda_url?: string
  recording_url?: string
  attendees: string
  call_summary: string
  internal_notes?: string
  action_items: CallActionItem[]
}

interface CallActionItem {
  id: string
  description: string
  is_completed: boolean
  linked_campaign_id?: string
  assigned_to?: string
  completed_at?: Date
}

interface ContentHubProps {
  clients: any[]
  selectedClient: string
}

type ContentTab = 'assets' | 'guidelines' | 'copy' | 'design' | 'calls'

export function ContentHub({ clients, selectedClient }: ContentHubProps) {
  const [activeTab, setActiveTab] = useState<ContentTab>('assets')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingLink, setEditingLink] = useState<BrandLink | null>(null)
  const [showAddLink, setShowAddLink] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [editingCall, setEditingCall] = useState<CallNote | null>(null)
  const [showAddCall, setShowAddCall] = useState(false)

  // Get current client info
  const currentClient = clients.find(c => c.id === selectedClient)
  const clientName = selectedClient === 'all' 
    ? 'All Clients' 
    : currentClient?.brand_name || 'Select a client'

  // Mock brand links (will be from database later)
  const [brandLinks, setBrandLinks] = useState<BrandLink[]>([
    {
      id: '1',
      client_id: clients[0]?.id || '1',
      link_title: 'Email Design System',
      url: 'https://figma.com/file/abc123',
      category: 'figma',
      description: 'Master email template designs',
      is_favorite: true
    },
    {
      id: '2',
      client_id: clients[0]?.id || '1',
      link_title: 'Brand Assets Folder',
      url: 'https://drive.google.com/drive/folders/xyz',
      category: 'drive',
      description: 'Logos, product images, brand guidelines PDF',
      is_favorite: true
    },
    {
      id: '3',
      client_id: clients[0]?.id || '1',
      link_title: 'Main Website',
      url: 'https://hydrus.com',
      category: 'website',
      description: 'Client website for reference',
      is_favorite: false
    }
  ])

  // Mock brand files (will be from database/Supabase Storage later)
  const [brandFiles, setBrandFiles] = useState<BrandFile[]>([
    {
      id: '1',
      client_id: clients[0]?.id || '1',
      file_name: 'hydrus-logo-main.png',
      file_url: '#',
      file_type: 'image/png',
      file_size: 45000,
      category: 'logo',
      uploaded_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      client_id: clients[0]?.id || '1',
      file_name: 'Montserrat-Bold.ttf',
      file_url: '#',
      file_type: 'font/ttf',
      file_size: 120000,
      category: 'font',
      uploaded_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    }
  ])

  // Mock brand guidelines (will be from database later)
  const [guidelines, setGuidelines] = useState<BrandGuidelines>({
    client_id: clients[0]?.id || '1',
    brand_colors: ['#3B82F6', '#1D4ED8', '#60A5FA'],
    fonts: 'Montserrat (headings), Open Sans (body)',
    tone_of_voice: 'Energetic, friendly, health-focused. Use active voice and speak directly to the customer.',
    legal_requirements: 'Always include disclaimer: "These statements have not been evaluated by the FDA." Link to privacy policy in footer.',
    key_messaging: '• Hydrate smarter, not harder\n• Science-backed hydration\n• Your body\'s best friend'
  })

  // Mock copy notes
  const [copyNotes, setCopyNotes] = useState<CopyNotes>({
    client_id: clients[0]?.id || '1',
    voice_tone: 'Active, energetic, inspiring. Use "you" and "your". Avoid medical claims.',
    key_phrases: '• "Hydrate smarter, not harder"\n• "Science-backed hydration"\n• "Your body\'s best friend"\n• "Feel the difference"',
    avoid_phrases: '• Medical claims (cure, treat, prevent)\n• Competitor mentions\n• Negative language\n• All-caps headlines',
    legal_notes: 'Always include FDA disclaimer. Link privacy policy. Mention subscription can be canceled anytime.'
  })

  // Mock design notes
  const [designNotes, setDesignNotes] = useState<DesignNotes>({
    client_id: clients[0]?.id || '1',
    design_preferences: 'Hero images must show product in lifestyle setting. Use plenty of white space. Mobile-first design (70% of opens are mobile).',
    client_likes: '• Bold, vibrant colors\n• Lifestyle product photography\n• Clean, minimal layouts\n• Large, prominent CTAs',
    client_dislikes: '• Stock photos with models\n• Busy, cluttered designs\n• All-caps headlines\n• Red colors (competitor uses red)',
    image_style: 'Product photography with natural lighting. Lifestyle shots preferred over product-only. Always show product in use.',
    mobile_notes: 'CTAs must be 44px min height. Test all links on mobile. Keep email width under 600px. Single column on mobile.'
  })

  // Mock call notes (will be from database later)
  const [callNotes, setCallNotes] = useState<CallNote[]>([
    {
      id: '1',
      client_id: clients[0]?.id || '1',
      call_date: new Date(2025, 9, 28, 14, 0), // Oct 28, 2pm
      agenda_url: 'https://docs.google.com/document/d/agenda-doc-id',
      recording_url: 'https://zoom.us/rec/share/abc123',
      attendees: 'Sarah (PM), Mike (Copywriter), Jamie (Client)',
      call_summary: 'Discussed Q4 strategy. Client wants to focus on retention campaigns and new product launch in December. Approved Black Friday email series.',
      internal_notes: 'Client mentioned budget increase for Q1. Need to follow up on December product details. Client loved the Black Friday creative.',
      action_items: [
        {
          id: '1-1',
          description: 'Create Black Friday email series (3 emails)',
          is_completed: true,
          linked_campaign_id: '1',
          completed_at: new Date(2025, 9, 29)
        },
        {
          id: '1-2',
          description: 'Update brand guidelines with new color palette',
          is_completed: true,
          completed_at: new Date(2025, 9, 29)
        },
        {
          id: '1-3',
          description: 'Schedule December product launch planning call',
          is_completed: false,
          assigned_to: 'Sarah'
        }
      ]
    },
    {
      id: '2',
      client_id: clients[0]?.id || '1',
      call_date: new Date(2025, 9, 15, 10, 0), // Oct 15, 10am
      agenda_url: 'https://docs.google.com/document/d/monthly-agenda-id',
      recording_url: undefined,
      attendees: 'Sarah (PM), Client (Jamie)',
      call_summary: 'Monthly check-in. Reviewed September performance. Open rates up 12%. Client happy with results. Discussed November campaign calendar.',
      internal_notes: 'Client seems very satisfied. Good opportunity to upsell SMS campaigns next month.',
      action_items: [
        {
          id: '2-1',
          description: 'Send performance report for September',
          is_completed: true,
          completed_at: new Date(2025, 9, 16)
        },
        {
          id: '2-2',
          description: 'Draft November campaign calendar',
          is_completed: true,
          completed_at: new Date(2025, 9, 20)
        }
      ]
    }
  ])

  // Filter links
  const filteredLinks = brandLinks.filter(link => {
    if (selectedClient !== 'all' && link.client_id !== selectedClient) return false
    if (searchTerm && !link.link_title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !link.url.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'figma': return <Figma className="h-4 w-4 text-purple-600" />
      case 'drive': return <Briefcase className="h-4 w-4 text-blue-600" />
      case 'website': return <LinkIcon className="h-4 w-4 text-green-600" />
      case 'competitor': return <FileText className="h-4 w-4 text-orange-600" />
      default: return <LinkIcon className="h-4 w-4 text-gray-600" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'figma': return 'bg-purple-50 border-purple-200'
      case 'drive': return 'bg-blue-50 border-blue-200'
      case 'website': return 'bg-green-50 border-green-200'
      case 'competitor': return 'bg-orange-50 border-orange-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const handleAddLink = (link: Omit<BrandLink, 'id'>) => {
    const newLink = { ...link, id: `new-${Date.now()}` }
    setBrandLinks([...brandLinks, newLink])
    setShowAddLink(false)
    console.log('✅ Link added:', newLink.link_title)
  }

  const handleUpdateLink = (link: BrandLink) => {
    setBrandLinks(brandLinks.map(l => l.id === link.id ? link : l))
    setEditingLink(null)
    console.log('✅ Link updated:', link.link_title)
  }

  const handleDeleteLink = (linkId: string) => {
    if (confirm('Delete this link?')) {
      setBrandLinks(brandLinks.filter(l => l.id !== linkId))
      console.log('🗑️ Link deleted')
    }
  }

  const toggleFavorite = (linkId: string) => {
    setBrandLinks(brandLinks.map(l => 
      l.id === linkId ? { ...l, is_favorite: !l.is_favorite } : l
    ))
  }

  // File upload handlers
  const handleFileUpload = (file: File) => {
    setUploadingFile(true)
    
    // In production, upload to Supabase Storage
    // For now, create mock file entry
    const reader = new FileReader()
    reader.onload = (e) => {
      const newFile: BrandFile = {
        id: `file-${Date.now()}`,
        client_id: selectedClient,
        file_name: file.name,
        file_url: e.target?.result as string, // In production: Supabase Storage URL
        file_type: file.type,
        file_size: file.size,
        category: file.type.startsWith('font/') ? 'font' : 
                  file.type.startsWith('image/') ? 'logo' : 
                  'document',
        uploaded_at: new Date()
      }
      setBrandFiles([...brandFiles, newFile])
      console.log('✅ File uploaded:', file.name)
      setUploadingFile(false)
    }
    reader.readAsDataURL(file)
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    files.forEach(file => handleFileUpload(file))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach(file => handleFileUpload(file))
    }
  }

  const handleDeleteFile = (fileId: string) => {
    if (confirm('Delete this file?')) {
      setBrandFiles(brandFiles.filter(f => f.id !== fileId))
      console.log('🗑️ File deleted')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-blue-600" />
    if (fileType.startsWith('font/')) return <Type className="h-5 w-5 text-purple-600" />
    return <File className="h-5 w-5 text-gray-600" />
  }

  // Filter files
  const filteredFiles = brandFiles.filter(file => {
    if (selectedClient !== 'all' && file.client_id !== selectedClient) return false
    if (searchTerm && !file.file_name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  // Filter calls
  const filteredCalls = callNotes.filter(call => {
    if (selectedClient !== 'all' && call.client_id !== selectedClient) return false
    return true
  })

  const toggleActionItem = (callId: string, itemId: string) => {
    setCallNotes(callNotes.map(call => {
      if (call.id === callId) {
        return {
          ...call,
          action_items: call.action_items.map(item => 
            item.id === itemId 
              ? { ...item, is_completed: !item.is_completed, completed_at: !item.is_completed ? new Date() : undefined }
              : item
          )
        }
      }
      return call
    }))
  }

  const handleAddCall = (call: Omit<CallNote, 'id'>) => {
    const newCall = { ...call, id: `call-${Date.now()}` }
    setCallNotes([newCall, ...callNotes])
    setShowAddCall(false)
    console.log('✅ Call added')
  }

  const handleUpdateCall = (call: CallNote) => {
    setCallNotes(callNotes.map(c => c.id === call.id ? call : c))
    setEditingCall(null)
    console.log('✅ Call updated')
  }

  const contentTabs = [
    { id: 'assets', label: 'Brand Assets', icon: LinkIcon },
    { id: 'guidelines', label: 'Brand Guidelines', icon: Palette },
    { id: 'copy', label: 'Copy Notes', icon: FileText },
    { id: 'design', label: 'Design Notes', icon: Type },
    { id: 'calls', label: 'Call Notes', icon: Phone }
  ]

  if (selectedClient === 'all') {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardContent className="p-12 text-center">
          <Briefcase className="h-16 w-16 mx-auto mb-4 text-white/40" />
          <div className="text-white text-lg mb-2">Select a Client</div>
          <div className="text-white/60 text-sm">
            Choose a specific client to view their brand assets, guidelines, and notes
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Content Hub Header */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl">Content Hub</CardTitle>
              <div className="text-white/70 text-sm mt-1">{clientName}</div>
            </div>
            {activeTab === 'assets' && (
              <button
                onClick={() => setShowAddLink(true)}
                className="px-4 py-2 bg-blue-500/30 hover:bg-blue-500/40 text-white rounded-lg transition-colors flex items-center gap-2 border border-blue-400/30"
              >
                <Plus className="h-4 w-4" />
                Add Link
              </button>
            )}
            {activeTab === 'calls' && (
              <button
                onClick={() => setShowAddCall(true)}
                className="px-4 py-2 bg-blue-500/30 hover:bg-blue-500/40 text-white rounded-lg transition-colors flex items-center gap-2 border border-blue-400/30"
              >
                <Plus className="h-4 w-4" />
                Add Call
              </button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Content Tabs */}
      <div className="flex gap-3 p-2 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20">
        {contentTabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ContentTab)}
              className={`
                flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300
                ${activeTab === tab.id 
                  ? 'bg-white/30 text-white shadow-lg border border-white/40' 
                  : 'text-white/80 hover:text-white hover:bg-white/15'
                }
              `}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'assets' && (
        <div className="space-y-6">
          {/* Search */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                <input
                  type="text"
                  placeholder="Search links..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-white/40"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Links Section */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white text-sm">Resource Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredLinks.map(link => (
                  <Card key={link.id} className={`border-2 ${getCategoryColor(link.category)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(link.category)}
                          <h3 className="font-semibold text-gray-900">{link.link_title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleFavorite(link.id)}
                            className={`p-1 rounded transition-colors ${
                              link.is_favorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                            }`}
                          >
                            <Star className={`h-4 w-4 ${link.is_favorite ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={() => setEditingLink(link)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLink(link.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {link.description && (
                        <p className="text-gray-600 text-sm mb-3">{link.description}</p>
                      )}
                      
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open Link
                      </a>
                      
                      <div className="mt-2 text-xs text-gray-500 capitalize">
                        {link.category}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredLinks.length === 0 && (
                <div className="text-white/60 text-center py-8">
                  <div className="text-sm">No links yet. Click "Add Link" to get started.</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Files Section */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white text-sm">Files (Logos, Fonts, Docs)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload Area */}
              <div
                onDrop={handleFileDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-white/30 bg-white/5 hover:bg-white/10'
                }`}
              >
                <Upload className={`h-12 w-12 mx-auto mb-4 ${
                  isDragging ? 'text-blue-400' : 'text-white/40'
                }`} />
                <div className="text-sm text-white mb-2">
                  <label htmlFor="file-upload-content" className="cursor-pointer text-blue-400 hover:text-blue-300 font-medium">
                    Click to upload
                  </label>
                  {' '}or drag and drop
                </div>
                <div className="text-xs text-white/60">
                  Logos (PNG, SVG), Fonts (TTF, OTF, WOFF), Documents (PDF)
                </div>
                <input
                  id="file-upload-content"
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Files List */}
              {filteredFiles.length > 0 && (
                <div className="space-y-2">
                  {filteredFiles.map(file => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getFileIcon(file.file_type)}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{file.file_name}</div>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(file.file_size)} • {file.uploaded_at.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <a
                          href={file.file_url}
                          download={file.file_name}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {uploadingFile && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <div className="text-white/60 text-sm mt-2">Uploading...</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'guidelines' && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Brand Guidelines - {clientName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Brand Colors */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Brand Colors
              </label>
              <div className="flex gap-3 mb-2">
                {guidelines.brand_colors.map((color, index) => (
                  <div key={index} className="text-center">
                    <div 
                      className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <div className="text-xs text-gray-600 mt-1 font-mono">{color}</div>
                  </div>
                ))}
              </div>
              <input
                type="text"
                value={guidelines.brand_colors.join(', ')}
                onChange={(e) => setGuidelines({ ...guidelines, brand_colors: e.target.value.split(',').map(c => c.trim()) })}
                placeholder="#3B82F6, #1D4ED8, #60A5FA"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            {/* Fonts */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fonts
              </label>
              <input
                type="text"
                value={guidelines.fonts}
                onChange={(e) => setGuidelines({ ...guidelines, fonts: e.target.value })}
                placeholder="Montserrat (headings), Open Sans (body)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Tone of Voice */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tone of Voice
              </label>
              <textarea
                value={guidelines.tone_of_voice}
                onChange={(e) => setGuidelines({ ...guidelines, tone_of_voice: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
              />
            </div>

            {/* Legal Requirements */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Legal Requirements
              </label>
              <textarea
                value={guidelines.legal_requirements}
                onChange={(e) => setGuidelines({ ...guidelines, legal_requirements: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
              />
            </div>

            {/* Key Messaging */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Key Messaging Points
              </label>
              <textarea
                value={guidelines.key_messaging}
                onChange={(e) => setGuidelines({ ...guidelines, key_messaging: e.target.value })}
                rows={4}
                placeholder="• Message 1&#10;• Message 2&#10;• Message 3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none font-mono text-sm"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={() => console.log('✅ Guidelines saved')}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Guidelines
            </button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'copy' && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Copy Notes - {clientName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Voice & Tone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Voice & Tone Guidelines
              </label>
              <textarea
                value={copyNotes.voice_tone}
                onChange={(e) => setCopyNotes({ ...copyNotes, voice_tone: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                placeholder="Describe the brand voice: energetic, professional, friendly, etc."
              />
            </div>

            {/* Key Phrases */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Key Phrases to Use
              </label>
              <textarea
                value={copyNotes.key_phrases}
                onChange={(e) => setCopyNotes({ ...copyNotes, key_phrases: e.target.value })}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none font-mono text-sm"
                placeholder="• Phrase 1&#10;• Phrase 2&#10;• Phrase 3"
              />
            </div>

            {/* Avoid Phrases */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Words/Phrases to Avoid
              </label>
              <textarea
                value={copyNotes.avoid_phrases}
                onChange={(e) => setCopyNotes({ ...copyNotes, avoid_phrases: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none font-mono text-sm"
                placeholder="• Word/phrase 1&#10;• Word/phrase 2"
              />
            </div>

            {/* Legal Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Legal/Compliance Notes
              </label>
              <textarea
                value={copyNotes.legal_notes}
                onChange={(e) => setCopyNotes({ ...copyNotes, legal_notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                placeholder="Required disclaimers, compliance requirements, etc."
              />
            </div>

            {/* Save Button */}
            <button
              onClick={() => console.log('✅ Copy notes saved')}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Copy Notes
            </button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'design' && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Type className="h-5 w-5" />
              Design Notes - {clientName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Design Preferences */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Design Preferences
              </label>
              <textarea
                value={designNotes.design_preferences}
                onChange={(e) => setDesignNotes({ ...designNotes, design_preferences: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                placeholder="Overall design direction, style preferences..."
              />
            </div>

            {/* Client Likes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Client Likes ✅
              </label>
              <textarea
                value={designNotes.client_likes}
                onChange={(e) => setDesignNotes({ ...designNotes, client_likes: e.target.value })}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none font-mono text-sm"
                placeholder="• Design element 1&#10;• Design element 2"
              />
            </div>

            {/* Client Dislikes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Client Dislikes ❌
              </label>
              <textarea
                value={designNotes.client_dislikes}
                onChange={(e) => setDesignNotes({ ...designNotes, client_dislikes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none font-mono text-sm"
                placeholder="• Things to avoid 1&#10;• Things to avoid 2"
              />
            </div>

            {/* Image Style */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Image Style Guide
              </label>
              <textarea
                value={designNotes.image_style}
                onChange={(e) => setDesignNotes({ ...designNotes, image_style: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                placeholder="Product photography style, image treatment preferences..."
              />
            </div>

            {/* Mobile Considerations */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile Considerations
              </label>
              <textarea
                value={designNotes.mobile_notes}
                onChange={(e) => setDesignNotes({ ...designNotes, mobile_notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                placeholder="Mobile-specific requirements, CTA sizes, layout notes..."
              />
            </div>

            {/* Save Button */}
            <button
              onClick={() => console.log('✅ Design notes saved')}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Design Notes
            </button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'calls' && (
        <div className="space-y-4">
          {filteredCalls.map(call => {
            const completedItems = call.action_items.filter(item => item.is_completed).length
            const totalItems = call.action_items.length
            
            return (
              <Card key={call.id} className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Phone className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-gray-900">
                          {call.call_date.toLocaleDateString('en-US', { 
                            weekday: 'short',
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </CardTitle>
                      </div>
                      <div className="text-sm text-gray-600">
                        Attendees: {call.attendees}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {call.agenda_url && (
                        <a
                          href={call.agenda_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <FileText className="h-3 w-3" />
                          Agenda
                        </a>
                      )}
                      {call.recording_url && (
                        <a
                          href={call.recording_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Recording
                        </a>
                      )}
                      <button
                        onClick={() => setEditingCall(call)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit call"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Call Summary */}
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2">Call Summary</div>
                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {call.call_summary}
                    </p>
                  </div>

                  {/* Internal Notes */}
                  {call.internal_notes && (
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-2">Internal Notes</div>
                      <p className="text-gray-700 text-sm bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        {call.internal_notes}
                      </p>
                    </div>
                  )}

                  {/* Action Items */}
                  {call.action_items.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-semibold text-gray-700">
                          Action Items ({completedItems}/{totalItems})
                        </div>
                        <div className="text-xs text-gray-500">
                          {completedItems === totalItems ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              All Complete
                            </span>
                          ) : (
                            <span>{totalItems - completedItems} remaining</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {call.action_items.map(item => (
                          <div
                            key={item.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                              item.is_completed 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-white border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <button
                              onClick={() => toggleActionItem(call.id, item.id)}
                              className="flex-shrink-0 mt-0.5"
                            >
                              {item.is_completed ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors" />
                              )}
                            </button>
                            
                            <div className="flex-1">
                              <div className={`text-sm ${item.is_completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                {item.description}
                              </div>
                              
                              {item.assigned_to && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Assigned: {item.assigned_to}
                                </div>
                              )}
                              
                              {item.completed_at && (
                                <div className="text-xs text-green-600 mt-1">
                                  Completed {item.completed_at.toLocaleDateString()}
                                </div>
                              )}
                              
                              {item.linked_campaign_id && (
                                <div className="text-xs text-blue-600 mt-1">
                                  → Linked to campaign
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}

          {filteredCalls.length === 0 && (
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardContent className="p-12 text-center">
                <Phone className="h-16 w-16 mx-auto mb-4 text-white/40" />
                <div className="text-white text-lg mb-2">No Call Notes Yet</div>
                <div className="text-white/60 text-sm">
                  Add call notes to track client conversations and action items
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Add/Edit Link Modal */}
      {(showAddLink || editingLink) && (
        <LinkEditorModal
          link={editingLink}
          clientId={selectedClient}
          clients={clients}
          onSave={(link) => editingLink ? handleUpdateLink(link as BrandLink) : handleAddLink(link)}
          onClose={() => {
            setShowAddLink(false)
            setEditingLink(null)
          }}
        />
      )}

      {/* Add/Edit Call Modal */}
      {(showAddCall || editingCall) && (
        <CallEditorModal
          call={editingCall}
          clientId={selectedClient}
          onSave={(call) => editingCall ? handleUpdateCall(call as CallNote) : handleAddCall(call)}
          onClose={() => {
            setShowAddCall(false)
            setEditingCall(null)
          }}
        />
      )}
    </div>
  )
}

// Link Editor Modal Component
function LinkEditorModal({ 
  link, 
  clientId, 
  clients,
  onSave, 
  onClose 
}: { 
  link: BrandLink | null
  clientId: string
  clients: any[]
  onSave: (link: Omit<BrandLink, 'id'> | BrandLink) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState<Omit<BrandLink, 'id'>>({
    client_id: link?.client_id || clientId,
    link_title: link?.link_title || '',
    url: link?.url || '',
    category: link?.category || 'other',
    description: link?.description || '',
    is_favorite: link?.is_favorite || false
  })

  const handleSubmit = () => {
    if (!formData.link_title || !formData.url) {
      alert('Please fill in title and URL')
      return
    }
    onSave(link ? { ...(link as BrandLink), ...formData } : formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-white w-full max-w-2xl shadow-2xl">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900">
              {link ? 'Edit Link' : 'Add New Link'}
            </CardTitle>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link Title *
            </label>
            <input
              type="text"
              value={formData.link_title}
              onChange={(e) => setFormData({ ...formData, link_title: e.target.value })}
              placeholder="Email Design System"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL *
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://figma.com/file/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as BrandLink['category'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="figma">Figma Board</option>
              <option value="drive">Google Drive</option>
              <option value="website">Website</option>
              <option value="competitor">Competitor</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              placeholder="Brief description of what this link contains..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="favorite"
              checked={formData.is_favorite}
              onChange={(e) => setFormData({ ...formData, is_favorite: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="favorite" className="text-sm text-gray-700 cursor-pointer">
              Mark as favorite (quick access)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {link ? 'Update Link' : 'Add Link'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Call Editor Modal Component
function CallEditorModal({
  call,
  clientId,
  onSave,
  onClose
}: {
  call: CallNote | null
  clientId: string
  onSave: (call: Omit<CallNote, 'id'> | CallNote) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState<Omit<CallNote, 'id'>>({
    client_id: call?.client_id || clientId,
    call_date: call?.call_date || new Date(),
    agenda_url: call?.agenda_url || '',
    recording_url: call?.recording_url || '',
    attendees: call?.attendees || '',
    call_summary: call?.call_summary || '',
    internal_notes: call?.internal_notes || '',
    action_items: call?.action_items || []
  })

  const handleSubmit = () => {
    if (!formData.attendees) {
      alert('Please fill in attendees')
      return
    }
    onSave(call ? { ...(call as CallNote), ...formData } : formData)
  }

  const addActionItem = () => {
    setFormData({
      ...formData,
      action_items: [
        ...formData.action_items,
        {
          id: `item-${Date.now()}`,
          description: '',
          is_completed: false
        }
      ]
    })
  }

  const updateActionItem = (index: number, description: string) => {
    const updated = [...formData.action_items]
    updated[index] = { ...updated[index], description }
    setFormData({ ...formData, action_items: updated })
  }

  const removeActionItem = (index: number) => {
    setFormData({
      ...formData,
      action_items: formData.action_items.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-white w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900">
              {call ? 'Edit Call Notes' : 'Add Call Notes'}
            </CardTitle>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Workflow Helper */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-900">
              <strong>Workflow:</strong> Create call with agenda before call → After call, click Edit to add recording, notes, and action items
            </div>
          </div>

          {/* Call Date/Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Call Date *
              </label>
              <input
                type="date"
                value={formData.call_date.toISOString().split('T')[0]}
                onChange={(e) => {
                  const newDate = new Date(e.target.value)
                  newDate.setHours(formData.call_date.getHours())
                  newDate.setMinutes(formData.call_date.getMinutes())
                  setFormData({ ...formData, call_date: newDate })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Call Time
              </label>
              <input
                type="time"
                value={`${String(formData.call_date.getHours()).padStart(2, '0')}:${String(formData.call_date.getMinutes()).padStart(2, '0')}`}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':')
                  const newDate = new Date(formData.call_date)
                  newDate.setHours(parseInt(hours))
                  newDate.setMinutes(parseInt(minutes))
                  setFormData({ ...formData, call_date: newDate })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="border-b border-gray-200 pb-4">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Before Call</div>
            
            {/* Attendees */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attendees *
              </label>
              <input
                type="text"
                value={formData.attendees}
                onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                placeholder="Sarah (PM), Mike (Copywriter), Jamie (Client)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            {/* Agenda Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agenda Link (Google Doc)
              </label>
              <input
                type="url"
                value={formData.agenda_url}
                onChange={(e) => setFormData({ ...formData, agenda_url: e.target.value })}
                placeholder="https://docs.google.com/document/d/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-xs text-gray-500 mt-1">Add your call agenda before the meeting</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-3">After Call</div>

            {/* Recording Link */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recording Link
              </label>
              <input
                type="url"
                value={formData.recording_url}
                onChange={(e) => setFormData({ ...formData, recording_url: e.target.value })}
                placeholder="https://zoom.us/rec/share/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Call Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Call Summary (Add after call)
            </label>
            <textarea
              value={formData.call_summary}
              onChange={(e) => setFormData({ ...formData, call_summary: e.target.value })}
              rows={4}
              placeholder="Leave blank before call. After call, add summary of what was discussed..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Internal Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Internal Notes (Add after call)
            </label>
            <textarea
              value={formData.internal_notes}
              onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
              rows={3}
              placeholder="Internal observations, upsell opportunities, client mood, follow-up needed..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Action Items (Add after call)
              </label>
              <button
                type="button"
                onClick={addActionItem}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Item
              </button>
            </div>

            <div className="space-y-2">
              {formData.action_items.map((item, index) => (
                <div key={item.id} className="flex gap-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateActionItem(index, e.target.value)}
                    placeholder="Action item description..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeActionItem(index)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {formData.action_items.length === 0 && (
              <div className="text-xs text-gray-500 italic">
                Add action items after the call to track follow-up tasks
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {call ? 'Update Call' : 'Add Call'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

