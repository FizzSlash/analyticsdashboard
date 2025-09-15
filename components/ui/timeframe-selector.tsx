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

export function TimeframeSelector({ selectedTimeframe, onTimeframeChange, className, mode = 'campaign' }: TimeframeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  
  // Get options based on mode
  const timeframeOptions = mode === 'flow' ? flowTimeframeOptions : campaignTimeframeOptions
  const selectedOption = timeframeOptions.find(option => option.value === selectedTimeframe) || timeframeOptions[1]

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left
      })
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const dropdown = isOpen ? createPortal(
    <div 
      className="w-48 bg-gray-900/98 border border-white/30 rounded-lg shadow-2xl"
      style={{
        position: 'fixed',
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        zIndex: 999999
      }}
    >
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
    </div>,
    document.body
  ) : null

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200 text-white"
      >
        <Calendar className="w-4 h-4" />
        <span className="text-sm font-medium">{selectedOption.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdown}
    </div>
  )
} 