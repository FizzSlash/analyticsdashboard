'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Lock } from 'lucide-react'

export default function UnauthorizedPage() {
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
        <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
          <Lock className="h-8 w-8 text-red-300" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-white/70 mb-8">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
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
