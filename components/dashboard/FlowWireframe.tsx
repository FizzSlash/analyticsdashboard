'use client'

import { Mail, Clock, GitBranch, Zap } from 'lucide-react'

interface FlowWireframeProps {
  actions: any[]
  emails: any[]  // Performance data from flow_message_metrics
  flowId: string
}

export function FlowWireframe({ actions, emails, flowId }: FlowWireframeProps) {
  if (!actions || actions.length === 0) {
    return (
      <div className="text-white/60 text-sm py-4 text-center">
        No flow structure data available. Run sync to fetch.
      </div>
    )
  }

  // Create lookup for email performance data
  const emailPerformance: { [messageId: string]: any } = {}
  emails.forEach((email: any) => {
    emailPerformance[email.message_id] = email
  })

  // Helper to format delay
  const formatDelay = (action: any) => {
    if (action.delay_type === 'immediate') return 'Immediately'
    if (action.delay_value) {
      const hours = action.delay_value
      if (hours < 24) return `Wait ${hours} hours`
      if (hours % 24 === 0) return `Wait ${hours / 24} day${hours / 24 > 1 ? 's' : ''}`
      return `Wait ${hours} hours`
    }
    return 'Delay'
  }

  // Helper to get email data
  const getEmailData = (messageId: string) => {
    return emailPerformance[messageId] || {}
  }

  return (
    <div className="py-6">
      <h4 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
        <GitBranch className="h-4 w-4" />
        Flow Structure
      </h4>
      
      <div className="space-y-3">
        {actions.map((action, index) => {
          const actionType = action.action_type
          const messageData = action.flow_message_id ? getEmailData(action.flow_message_id) : null
          
          // Render different block types
          if (actionType === 'trigger' || index === 0) {
            return (
              <div key={action.action_id} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-purple-300" />
                </div>
                <div className="flex-1 bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <div className="text-purple-300 text-xs font-medium uppercase tracking-wide mb-1">Trigger</div>
                  <div className="text-white font-semibold">{action.trigger_type || 'Flow Triggered'}</div>
                </div>
              </div>
            )
          }
          
          if (actionType === 'send_email' || actionType === 'email') {
            const emailNumber = actions.filter(a => 
              (a.action_type === 'send_email' || a.action_type === 'email') && 
              a.sequence_position <= action.sequence_position
            ).length
            
            // Try to find matching email by sequence
            const matchingEmail = emails[emailNumber - 1] || null
            const displayData = messageData || matchingEmail
            
            return (
              <div key={action.action_id}>
                {/* Connector line */}
                {index > 0 && (
                  <div className="ml-4 w-0.5 h-3 bg-white/20"></div>
                )}
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-blue-300" />
                  </div>
                  <div className="flex-1 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-blue-300 text-xs font-medium uppercase tracking-wide">
                        Email {emailNumber}
                      </div>
                      {action.cumulative_delay_hours > 0 && (
                        <div className="text-white/60 text-xs">
                          +{action.cumulative_delay_hours}hr
                        </div>
                      )}
                    </div>
                    
                    {displayData ? (
                      <>
                        <div className="text-white font-semibold mb-2">
                          {displayData.subject_line || displayData.message_name || `Email ${emailNumber}`}
                        </div>
                        
                        {/* Performance metrics */}
                        <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-white/10">
                          <div>
                            <div className="text-white/60 text-xs">Opens</div>
                            <div className="text-white font-semibold">{(displayData.opens || 0).toLocaleString()}</div>
                            <div className="text-green-300 text-xs">{((displayData.open_rate || 0) * 100).toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="text-white/60 text-xs">Clicks</div>
                            <div className="text-white font-semibold">{(displayData.clicks || 0).toLocaleString()}</div>
                            <div className="text-blue-300 text-xs">{((displayData.click_rate || 0) * 100).toFixed(2)}%</div>
                          </div>
                          <div>
                            <div className="text-white/60 text-xs">Revenue</div>
                            <div className="text-white font-semibold">${(displayData.revenue || 0).toLocaleString()}</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-white font-semibold">Email {emailNumber}</div>
                    )}
                  </div>
                </div>
              </div>
            )
          }
          
          if (actionType === 'time_delay') {
            return (
              <div key={action.action_id}>
                {/* Connector line */}
                <div className="ml-4 w-0.5 h-3 bg-white/20"></div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-yellow-300" />
                  </div>
                  <div className="flex-1 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <div className="text-yellow-300 font-medium">{formatDelay(action)}</div>
                  </div>
                </div>
              </div>
            )
          }
          
          if (actionType === 'conditional_split') {
            return (
              <div key={action.action_id}>
                {/* Connector line */}
                <div className="ml-4 w-0.5 h-3 bg-white/20"></div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
                    <GitBranch className="h-4 w-4 text-orange-300" />
                  </div>
                  <div className="flex-1 bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                    <div className="text-orange-300 text-xs font-medium uppercase tracking-wide mb-1">Conditional Split</div>
                    <div className="text-white/80 text-sm">{action.condition_type || 'IF/THEN Logic'}</div>
                  </div>
                </div>
              </div>
            )
          }
          
          // Default for unknown action types
          return (
            <div key={action.action_id}>
              {index > 0 && <div className="ml-4 w-0.5 h-3 bg-white/20"></div>}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-500/20 border border-gray-500/40"></div>
                <div className="flex-1 bg-gray-500/10 border border-gray-500/30 rounded-lg p-3">
                  <div className="text-white/60 text-sm">{actionType}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

