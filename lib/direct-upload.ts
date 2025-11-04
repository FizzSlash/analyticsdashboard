/**
 * Direct Upload to Supabase Storage
 * Bypasses Vercel's 4.5MB function payload limit by uploading directly from browser to Supabase
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Upload file directly to Supabase Storage from the browser
 * This bypasses Vercel's 4.5MB function payload limit
 * 
 * @param file - File to upload
 * @param bucket - Supabase storage bucket name
 * @param folder - Optional folder path within bucket
 * @param shareToken - Optional share token for unauthenticated uploads
 * @returns Promise with upload result containing public URL
 */
export async function uploadToSupabase(
  file: File,
  bucket: string = 'campaign-previews',
  folder?: string,
  shareToken?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Auto-detect if we're on a share link page
    const isShareLink = typeof window !== 'undefined' && window.location.pathname.includes('/ops-share/')
    let detectedToken = shareToken
    
    if (isShareLink) {
      // Extract token from URL: /ops-share/[token]
      const pathParts = window.location.pathname.split('/ops-share/')
      if (pathParts.length > 1) {
        // Remove any trailing slashes or query params
        detectedToken = pathParts[1].split('/')[0].split('?')[0]
        console.log(`🔑 Detected share token from URL: ${detectedToken}`)
      }
    }
    
    // If on share link or token provided, use the share upload API (bypasses auth)
    if (detectedToken) {
      console.log(`📤 Share link upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', bucket)
      formData.append('shareToken', detectedToken)
      if (folder) formData.append('folder', folder)
      
      const response = await fetch('/api/ops-share/upload', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }
      
      console.log(`✅ Share upload successful: ${result.url}`)
      return {
        success: true,
        url: result.url
      }
    }
    
    // Otherwise, use direct Supabase upload (requires authentication)
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    const fileName = `${folder ? folder + '/' : ''}${timestamp}-${random}.${fileExt}`

    console.log(`📤 Direct upload to Supabase: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

    // Upload directly to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
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

    return {
      success: true,
      url: publicUrl
    }
  } catch (error: any) {
    console.error('❌ Upload failed:', error)
    return {
      success: false,
      error: error?.message || 'Upload failed'
    }
  }
}

/**
 * Upload with progress tracking
 */
export async function uploadWithProgress(
  file: File,
  bucket: string = 'campaign-previews',
  folder?: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    const fileName = `${folder ? folder + '/' : ''}${timestamp}-${random}.${fileExt}`

    // For progress tracking, we need to use XMLHttpRequest or fetch with streams
    // Supabase client doesn't expose progress, so we'll simulate it
    if (onProgress) {
      // Simulate progress (Supabase JS client doesn't support true progress)
      onProgress(10)
      setTimeout(() => onProgress(30), 100)
      setTimeout(() => onProgress(60), 300)
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (onProgress) onProgress(90)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    if (onProgress) onProgress(100)

    return {
      success: true,
      url: publicUrl
    }
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Upload failed'
    }
  }
}

