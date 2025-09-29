import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientSlug = searchParams.get('clientSlug') || 'hydrus'
    
    console.log(`🔍 DEBUG: Fetching colors for client: ${clientSlug}`)
    
    // Get client data
    const client = await DatabaseService.getClientBySlug(clientSlug)
    
    if (!client) {
      return NextResponse.json({ 
        error: 'Client not found',
        clientSlug 
      }, { status: 404 })
    }

    // Return color debug info
    const colorInfo = {
      client_slug: client.brand_slug,
      client_name: client.brand_name,
      primary_color: client.primary_color,
      secondary_color: client.secondary_color,
      logo_url: client.logo_url,
      background_image_url: client.background_image_url,
      
      // Show what the gradient will look like
      current_gradient: `linear-gradient(135deg, ${client.primary_color || '#3B82F6'} 0%, ${client.secondary_color || '#1D4ED8'} 100%)`,
      
      // Show defaults being used
      using_defaults: !client.primary_color || !client.secondary_color,
      default_primary: '#3B82F6',
      default_secondary: '#1D4ED8'
    }
    
    console.log('🔍 DEBUG: Color info:', colorInfo)

    return NextResponse.json(colorInfo)

  } catch (error: any) {
    console.error('🔍 DEBUG: Error:', error)
    return NextResponse.json({
      error: 'Failed to fetch client colors',
      message: error.message
    }, { status: 500 })
  }
}