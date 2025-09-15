'use client'

import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'

interface TimeframeSelectorProps {
  selectedTimeframe: number
  onTimeframeChange: (days: number) => void
  className?: string
}

const timeframeOptions = [
  { label: 'Last 4 weeks', value: 28 },
  { label: 'Last 8 weeks', value: 56 },
  { label: 'Last 3 months', value: 90 },
  { label: 'Last 6 months', value: 180 },
  { label: 'Last 12 months', value: 365 },
  { label: 'All time', value: 9999 }
]

export function TimeframeSelector({ selectedTimeframe, onTimeframeChange, className }: TimeframeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const selectedOption = timeframeOptions.find(option => option.value === selectedTimeframe) || timeframeOptions[1]

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200 text-white"
      >
        <Calendar className="w-4 h-4" />
        <span className="text-sm font-medium">{selectedOption.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[100]" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-48 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-xl z-[110]">
            <div className="py-2">
              {timeframeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onTimeframeChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-white/20 transition-colors ${
                    option.value === selectedTimeframe 
                      ? 'bg-white/20 text-white font-medium' 
                      : 'text-white/80'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
} 