// Robust client-side Supabase client with better error handling
import { createClient } from '@supabase/supabase-js'

let supabaseClient: any = null

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  // Get environment variables with fallbacks and debugging
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('🔍 Supabase Environment Check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    urlLength: supabaseUrl?.length || 0,
    keyLength: supabaseKey?.length || 0,
    urlStart: supabaseUrl?.substring(0, 20) || 'missing',
    keyStart: supabaseKey?.substring(0, 20) || 'missing'
  })

  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is missing or empty')
    console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('SUPABASE')))
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required')
  }

  if (!supabaseKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or empty')
    console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('SUPABASE')))
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is required')
  }

  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey)
    console.log('✅ Supabase client created successfully')
    return supabaseClient
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error)
    throw error
  }
}

// Export a default instance
export const supabase = getSupabaseClient()
