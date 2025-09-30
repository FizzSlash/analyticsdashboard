'use client'

import { useState, useEffect, useRef } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'

interface TimeframeSelectorProps {
  selectedTimeframe: number
  onTimeframeChange: (days: number) => void
  className?: string
}

// ONE SET OF OPTIONS FOR ALL TABS
const timeframeOptions = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 60 days', value: 60 },
  { label: 'Last 90 days', value: 90 },
  { label: 'Last 180 days', value: 180 },
  { label: 'Last 365 days', value: 365 }
]

export function TimeframeSelector({ selectedTimeframe, onTimeframeChange, className }: TimeframeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  
  const selectedOption = timeframeOptions.find(option => option.value === selectedTimeframe) || timeframeOptions[1]

  // Handle clicks outside dropdown and escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.parentElement?.contains(event.target as Node)) {
        console.log('🔘 Clicking outside - closing dropdown')
        setIsOpen(false)
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        console.log('🔘 Escape key - closing dropdown')
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscapeKey)
      }
    }
  }, [isOpen])

  const handleOptionClick = (value: number) => {
    console.log(`🎯 Timeframe selected: ${value} days`)
    console.log(`🔄 Current selected: ${selectedTimeframe} → New: ${value}`)
    onTimeframeChange(value)
    setIsOpen(false)
    console.log(`✅ Dropdown closed, state updated`)
  }

  return (
    <div className={`relative ${className}`} style={{ zIndex: 9999 }}>
      <button
        ref={buttonRef}
        onClick={() => {
          console.log(`🔘 Timeframe button clicked, isOpen: ${isOpen} → ${!isOpen}`)
          setIsOpen(!isOpen)
        }}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200 text-white"
      >
        <Calendar className="w-4 h-4" />
        <span className="text-sm font-medium">{selectedOption.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 w-48 bg-slate-900 border border-slate-600 rounded-lg shadow-2xl"
          style={{
            zIndex: 999999 // Very high z-index
          }}
        >
          <div className="py-2">
            {timeframeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  console.log(`🔘 Option ${option.value} clicked`)
                  handleOptionClick(option.value)
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
      )}
    </div>
  )
}