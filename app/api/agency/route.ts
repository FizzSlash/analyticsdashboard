import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    
    if (!slug) {
      return NextResponse.json({ error: 'Agency slug required' }, { status: 400 })
    }

    const agency = await DatabaseService.getAgencyBySlug(slug)
    
    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    // Return agency branding data (no sensitive info)
    return NextResponse.json({
      success: true,
      agency: {
        id: agency.id,
        agency_name: agency.agency_name,
        agency_slug: agency.agency_slug,
        primary_color: agency.primary_color,
        secondary_color: agency.secondary_color,
        logo_url: agency.logo_url,
        background_image_url: agency.background_image_url
      }
    })

  } catch (error: any) {
    console.error('GET agency error:', error)
    return NextResponse.json({
      error: 'Failed to fetch agency',
      message: error.message
    }, { status: 500 })
  }
}
