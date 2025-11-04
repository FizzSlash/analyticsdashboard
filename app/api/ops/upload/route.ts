import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Route segment config (Next.js 14+)
export const runtime = 'nodejs'
export const maxDuration = 60

// POST - Upload file to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    // Parse formData with larger size handling
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as string
    const folder = formData.get('folder') as string | null

    if (!file || !bucket) {
      return NextResponse.json(
        { success: false, error: 'File and bucket required' },
        { status: 400 }
      )
    }

    console.log(`📤 Uploading file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    // Convert File to ArrayBuffer for Supabase
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
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

    console.log(`✅ Upload successful: ${publicUrl}`)

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

