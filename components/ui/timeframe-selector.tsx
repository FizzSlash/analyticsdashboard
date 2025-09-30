'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Calendar, ChevronDown } from 'lucide-react'

interface TimeframeSelectorProps {
  selectedTimeframe: number
  onTimeframeChange: (days: number) => void
  className?: string
  mode?: 'campaign' | 'flow'
}

const campaignTimeframeOptions = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 60 days', value: 60 },
  { label: 'Last 90 days', value: 90 },
  { label: 'Last 180 days', value: 180 },
  { label: 'Last 365 days', value: 365 }
]

const flowTimeframeOptions = [
  { label: 'Last 4 weeks', value: 28 },
  { label: 'Last 8 weeks', value: 56 },
  { label: 'Last 3 months', value: 90 },
  { label: 'Last 6 months', value: 180 },
  { label: 'Last 12 months', value: 365 },
  { label: 'All time', value: 9999 }
]

export function TimeframeSelector({ selectedTimeframe, onTimeframeChange, className, mode = 'campaign' }: TimeframeSelectorProps & { className?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const componentId = useRef(`timeframe-selector-${Math.random().toString(36).substr(2, 9)}`)
  
  // Get options based on mode
  const timeframeOptions = mode === 'flow' ? flowTimeframeOptions : campaignTimeframeOptions
  const selectedOption = timeframeOptions.find(option => option.value === selectedTimeframe) || timeframeOptions[1]

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const newPosition = {
        top: rect.bottom + 8,
        left: Math.max(rect.left, 10) // Ensure dropdown doesn't go off left edge
      }
      console.log(`📍 Calculating dropdown position:`, newPosition, `from button rect:`, rect)
      setDropdownPosition(newPosition)
    }
  }, [isOpen])

  // Debug when isOpen state changes
  useEffect(() => {
    console.log(`🔄 TimeframeSelector isOpen changed to: ${isOpen}`)
    if (isOpen) {
      console.log(`📍 Dropdown position:`, dropdownPosition)
      console.log(`📋 Available options:`, timeframeOptions.length, timeframeOptions.map(o => o.label))
    }
  }, [isOpen, dropdownPosition, timeframeOptions])

  // No longer need click outside handler - backdrop handles it

  const dropdown = isOpen && createPortal(
    <>
      {/* Invisible backdrop to prevent outside clicks */}
      <div 
        className="fixed inset-0"
        style={{ zIndex: 999998 }}
        onClick={() => {
          console.log(`🖱️ TimeframeSelector backdrop clicked - closing - ID: ${componentId.current}`)
          setIsOpen(false)
        }}
      />
      
      {/* Dropdown menu */}
      <div 
        className="fixed bg-slate-900 border border-slate-600 rounded-lg shadow-2xl"
        style={{ 
          zIndex: 99999,
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          minWidth: '192px'
        }}
        onClick={(e) => {
          console.log(`📋 TimeframeSelector dropdown clicked (should not close) - ID: ${componentId.current}`)
          e.stopPropagation()
        }}
      >
        <div className="py-2">
          {timeframeOptions.map((option) => (
            <button
              key={option.value}
              onClick={(e) => {
                console.log(`🎯 TimeframeSelector option clicked: ${option.value} (${option.label}) - ID: ${componentId.current}`)
                e.preventDefault()
                e.stopPropagation()
                console.log(`📞 Calling onTimeframeChange with: ${option.value}`)
                onTimeframeChange(option.value)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-800 transition-colors cursor-pointer ${
                option.value === selectedTimeframe 
                  ? 'bg-slate-800 text-white font-medium' 
                  : 'text-slate-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </>,
    document.body
  )

  return (
    <div className={`relative ${className}`} style={{ zIndex: 9999 }}>
      <button
        ref={buttonRef}
        onClick={() => {
          console.log(`🔘 TimeframeSelector button clicked - isOpen: ${isOpen} → ${!isOpen} - ID: ${componentId.current}`)
          setIsOpen(!isOpen)
        }}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200 text-white relative"
        style={{ zIndex: 9999 }}
      >
        <Calendar className="w-4 h-4" />
        <span className="text-sm font-medium">{selectedOption.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdown}
    </div>
  )
} 