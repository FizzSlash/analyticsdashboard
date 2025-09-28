'use client'

import { BarChart3, Settings } from 'lucide-react'

export type ViewMode = 'analytics' | 'portal'

interface ViewToggleProps {
  currentMode: ViewMode
  onModeChange: (mode: ViewMode) => void
  className?: string
}

export function ViewToggle({ currentMode, onModeChange, className = '' }: ViewToggleProps) {
  return (
    <div className={`flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-1 ${className}`}>
      <button
        onClick={() => onModeChange('analytics')}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
          ${currentMode === 'analytics' 
            ? 'bg-white/20 text-white shadow-lg' 
            : 'text-white/70 hover:text-white hover:bg-white/10'
          }
        `}
      >
        <BarChart3 className="h-4 w-4" />
        Analytics
      </button>
      
      <button
        onClick={() => onModeChange('portal')}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
          ${currentMode === 'portal' 
            ? 'bg-white/20 text-white shadow-lg' 
            : 'text-white/70 hover:text-white hover:bg-white/10'
          }
        `}
      >
        <Settings className="h-4 w-4" />
        Portal
      </button>
    </div>
  )
}