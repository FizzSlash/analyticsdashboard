'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Copy, Download } from 'lucide-react'

interface PageProps {
  params: {
    slug: string
    campaignId: string
  }
}

export default function ViewCopyPage({ params }: PageProps) {
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCampaign()
  }, [params.campaignId])

  const loadCampaign = async () => {
    try {
      const response = await fetch(`/api/ops/campaigns?clientId=all`)
      const data = await response.json()
      
      if (data.success) {
        const camp = data.campaigns.find((c: any) => c.id === params.campaignId)
        setCampaign(camp)
      }
    } catch (error) {
      console.error('Error loading campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (campaign?.generated_copy?.formatted_copy) {
      navigator.clipboard.writeText(campaign.generated_copy.formatted_copy)
      alert('✅ Copy text copied to clipboard!')
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  }

  if (!campaign?.generated_copy) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-600">No generated copy found for this campaign</p>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.close()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{campaign.campaign_name}</h1>
                <p className="text-sm text-gray-600">Generated Email Copy</p>
              </div>
            </div>
            <button
              onClick={copyToClipboard}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Text
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card>
          <CardContent className="p-8">
            <pre className="whitespace-pre-wrap font-sans text-gray-900 leading-relaxed">
              {campaign.generated_copy.formatted_copy}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

