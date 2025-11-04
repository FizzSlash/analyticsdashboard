import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Route config
export const runtime = 'nodejs'
export const maxDuration = 60

// POST - Upload file via shareable link (bypasses auth)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as string
    const folder = formData.get('folder') as string | null
    const shareToken = formData.get('shareToken') as string

    if (!file || !bucket || !shareToken) {
      return NextResponse.json(
        { success: false, error: 'File, bucket, and shareToken required' },
        { status: 400 }
      )
    }

    // Verify the share token is valid (stored in agencies table)
    const { data: shareData, error: shareError } = await supabase
      .from('agencies')
      .select('*')
      .eq('ops_share_token', shareToken)
      .eq('ops_share_enabled', true)
      .single()

    if (shareError || !shareData) {
      console.error('Invalid share token:', shareToken)
      return NextResponse.json(
        { success: false, error: 'Invalid or expired share token' },
        { status: 403 }
      )
    }

    console.log(`✅ Valid share token for agency: ${shareData.agency_name}`)

    console.log(`📤 Share upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    // Convert File to ArrayBuffer for Supabase
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Upload using SERVICE ROLE (bypasses RLS)
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('❌ Supabase upload error:', error)
      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    console.log(`✅ Share upload successful: ${publicUrl}`)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName
    })
  } catch (error: any) {
    console.error('❌ Upload error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error?.message || 'Failed to upload file',
        details: error?.toString()
      },
      { status: 500 }
    )
  }
}

