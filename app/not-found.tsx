'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function NotFound() {
  const [agency, setAgency] = useState<any>(null)

  useEffect(() => {
    const fetchAgency = async () => {
      try {
        const response = await fetch('/api/agency?slug=retention-harbor')
        if (response.ok) {
          const result = await response.json()
          setAgency(result.agency)
        }
      } catch (err) {
        console.log('Could not load agency branding')
      }
    }
    fetchAgency()
  }, [])

  const primaryColor = agency?.primary_color || '#110E12'
  const secondaryColor = agency?.secondary_color || '#23154B'

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
    }}>
      <div className="max-w-md w-full text-center bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8">
        <div className="mx-auto w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="h-8 w-8 text-orange-300" />
        </div>
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-white/70 mb-2">Page Not Found</p>
        <p className="text-sm text-white/60 mb-8">
          The page you're looking for doesn't exist or may have been removed.
        </p>
        <Link 
          href="/login"
          className="inline-block bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-white/30"
        >
          Return to Login
        </Link>
      </div>
    </div>
  )
}
