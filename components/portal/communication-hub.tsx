'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  MessageSquare,
  Send,
  Phone,
  Mail,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Paperclip,
  Smile
} from 'lucide-react'

interface Message {
  id: string
  content: string
  author: string
  author_role: 'client_user' | 'agency_admin'
  timestamp: Date
  type: 'message' | 'system' | 'approval' | 'request'
  attachments?: { name: string; url: string }[]
  priority?: 'normal' | 'high' | 'urgent'
  read: boolean
  thread_id?: string
}

interface CommunicationThread {
  id: string
  title: string
  type: 'general' | 'campaign' | 'request' | 'urgent'
  participants: string[]
  last_message: Date
  unread_count: number
  messages: Message[]
  status: 'active' | 'resolved' | 'archived'
}

interface CommunicationHubProps {
  client: any
  userRole: 'client_user' | 'agency_admin'
}

export function CommunicationHub({ client, userRole }: CommunicationHubProps) {
  const [threads, setThreads] = useState<CommunicationThread[]>([])
  const [selectedThread, setSelectedThread] = useState<CommunicationThread | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'urgent'>('all')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadThreads()
  }, [client])

  useEffect(() => {
    scrollToBottom()
  }, [selectedThread?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadThreads = async () => {
    setLoading(true)
    try {
      // TODO: Load from database
      setThreads(generateMockThreads())
    } catch (error) {
      console.error('Error loading threads:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockThreads = (): CommunicationThread[] => [
    {
      id: 'thread1',
      title: 'General Discussion',
      type: 'general',
      participants: ['Client Team', 'Agency Team'],
      last_message: new Date(2025, 9, 28, 15, 30),
      unread_count: 2,
      status: 'active',
      messages: [
        {
          id: 'msg1',
          content: 'Hi! Quick question about the Black Friday campaign timeline.',
          author: 'Client Team',
          author_role: 'client_user',
          timestamp: new Date(2025, 9, 28, 14, 15),
          type: 'message',
          read: true
        },
        {
          id: 'msg2',
          content: 'Hi there! Happy to help. We\'re on track for the Oct 25th send date. Is there anything specific you\'d like to adjust?',
          author: 'Agency Team',
          author_role: 'agency_admin',
          timestamp: new Date(2025, 9, 28, 15, 30),
          type: 'message',
          read: false
        },
        {
          id: 'msg3',
          content: 'Perfect! Just wanted to confirm the discount codes will be ready.',
          author: 'Client Team',
          author_role: 'client_user',
          timestamp: new Date(2025, 9, 28, 15, 45),
          type: 'message',
          read: false
        }
      ]
    },
    {
      id: 'thread2',
      title: 'Holiday Campaign Feedback',
      type: 'campaign',
      participants: ['Client Team', 'Design Team'],
      last_message: new Date(2025, 9, 27, 11, 20),
      unread_count: 0,
      status: 'active',
      messages: [
        {
          id: 'msg4',
          content: 'The holiday designs look fantastic! Love the color scheme.',
          author: 'Client Team',
          author_role: 'client_user',
          timestamp: new Date(2025, 9, 27, 10, 30),
          type: 'message',
          read: true
        },
        {
          id: 'msg5',
          content: 'Thank you! We\'ll have the final versions ready by tomorrow.',
          author: 'Design Team',
          author_role: 'agency_admin',
          timestamp: new Date(2025, 9, 27, 11, 20),
          type: 'message',
          read: true
        }
      ]
    }
  ]

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedThread) return

    const message: Message = {
      id: `msg-${Date.now()}`,
      content: newMessage,
      author: userRole === 'agency_admin' ? 'Agency Team' : 'Client Team',
      author_role: userRole,
      timestamp: new Date(),
      type: 'message',
      read: false
    }

    // Update thread with new message
    setThreads(prev => prev.map(thread => 
      thread.id === selectedThread.id 
        ? {
            ...thread,
            messages: [...thread.messages, message],
            last_message: new Date(),
            unread_count: userRole === 'client_user' ? thread.unread_count : thread.unread_count + 1
          }
        : thread
    ))

    // Update selected thread
    setSelectedThread(prev => prev ? {
      ...prev,
      messages: [...prev.messages, message],
      last_message: new Date()
    } : null)

    setNewMessage('')

    // TODO: Save to database
    console.log('💬 Sent message:', message)
  }

  const markThreadAsRead = (threadId: string) => {
    setThreads(prev => prev.map(thread => 
      thread.id === threadId 
        ? { ...thread, unread_count: 0 }
        : thread
    ))
  }

  const getThreadIcon = (type: string) => {
    switch (type) {
      case 'urgent': return AlertCircle
      case 'campaign': return Calendar
      case 'request': return MessageSquare
      default: return Users
    }
  }

  const getThreadColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'text-red-400'
      case 'campaign': return 'text-purple-400'
      case 'request': return 'text-blue-400'
      default: return 'text-green-400'
    }
  }

  const filteredThreads = threads.filter(thread => {
    if (activeFilter === 'unread') return thread.unread_count > 0
    if (activeFilter === 'urgent') return thread.type === 'urgent'
    return true
  })

  const totalUnread = threads.reduce((sum, thread) => sum + thread.unread_count, 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
      {/* Thread List */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages
              {totalUnread > 0 && (
                <span className="bg-red-500/30 text-red-300 text-xs px-2 py-1 rounded-full">
                  {totalUnread}
                </span>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Filter Tabs */}
          <div className="flex border-b border-white/10 px-4">
            {[
              { id: 'all', label: 'All', count: threads.length },
              { id: 'unread', label: 'Unread', count: threads.filter(t => t.unread_count > 0).length },
              { id: 'urgent', label: 'Urgent', count: threads.filter(t => t.type === 'urgent').length }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id as any)}
                className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeFilter === filter.id 
                    ? 'text-white border-b-2 border-blue-400' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {filter.label}
                {filter.count > 0 && (
                  <span className="bg-white/20 text-white/80 text-xs px-2 py-1 rounded">
                    {filter.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Thread List */}
          <div className="max-h-[50vh] overflow-y-auto">
            {filteredThreads.map(thread => {
              const Icon = getThreadIcon(thread.type)
              return (
                <div
                  key={thread.id}
                  className={`p-4 border-b border-white/10 cursor-pointer hover:bg-white/10 transition-colors ${
                    selectedThread?.id === thread.id ? 'bg-white/10' : ''
                  }`}
                  onClick={() => {
                    setSelectedThread(thread)
                    markThreadAsRead(thread.id)
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-white/10 ${getThreadColor(thread.type)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-medium text-sm truncate">{thread.title}</p>
                        {thread.unread_count > 0 && (
                          <span className="bg-blue-500/30 text-blue-300 text-xs px-2 py-1 rounded-full">
                            {thread.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-white/70 text-xs mt-1">
                        {thread.messages[thread.messages.length - 1]?.content.slice(0, 60)}...
                      </p>
                      <p className="text-white/60 text-xs mt-1">
                        {thread.last_message.toLocaleDateString()} • {thread.participants.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <div className="lg:col-span-2">
        {selectedThread ? (
          <Card className="bg-white/5 border-white/10 h-full flex flex-col">
            <CardHeader className="border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = getThreadIcon(selectedThread.type)
                    return <Icon className={`h-5 w-5 ${getThreadColor(selectedThread.type)}`} />
                  })()}
                  <div>
                    <CardTitle className="text-white text-lg">{selectedThread.title}</CardTitle>
                    <p className="text-white/70 text-sm">
                      {selectedThread.participants.join(' • ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <Phone className="h-4 w-4" />
                  </button>
                  <button className="text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-hidden p-0">
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedThread.messages.map(message => (
                    <div 
                      key={message.id}
                      className={`flex ${
                        message.author_role === userRole ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div className={`max-w-[70%] ${
                        message.author_role === userRole
                          ? 'bg-blue-600/80 text-white'
                          : 'bg-white/10 text-white'
                      } rounded-lg p-3`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium opacity-80">{message.author}</span>
                          <span className="text-xs opacity-60">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                        {message.priority === 'high' && (
                          <span className="inline-block mt-1 px-2 py-1 bg-red-500/30 text-red-300 text-xs rounded">
                            High Priority
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t border-white/10 p-4">
                  <div className="flex gap-2">
                    <button className="text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newMessage.trim()) {
                          sendMessage()
                        }
                      }}
                    />
                    <button className="text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <Smile className="h-4 w-4" />
                    </button>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-blue-600/80 hover:bg-blue-600 disabled:bg-blue-600/40 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/5 border-white/10 h-full">
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/70">Select a conversation to start messaging</p>
                <p className="text-white/50 text-sm mt-1">Direct communication with your agency team</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Contact Actions - Floating */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        <button
          onClick={() => {
            // Create new urgent thread
            const urgentThread: CommunicationThread = {
              id: `urgent-${Date.now()}`,
              title: 'Urgent Support',
              type: 'urgent',
              participants: ['Client Team', 'Agency Team'],
              last_message: new Date(),
              unread_count: 0,
              status: 'active',
              messages: []
            }
            setThreads(prev => [urgentThread, ...prev])
            setSelectedThread(urgentThread)
          }}
          className="bg-red-600/80 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110 backdrop-blur-sm"
          title="Urgent Support"
        >
          <AlertCircle className="h-5 w-5" />
        </button>
        
        <button
          onClick={() => window.open('mailto:support@youragency.com')}
          className="bg-blue-600/80 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110 backdrop-blur-sm"
          title="Email Support"
        >
          <Mail className="h-5 w-5" />
        </button>
        
        <button
          onClick={() => window.open('tel:+1234567890')}
          className="bg-green-600/80 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110 backdrop-blur-sm"
          title="Call Support"
        >
          <Phone className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}