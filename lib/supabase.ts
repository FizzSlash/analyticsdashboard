// DEPRECATED: This file is being phased out to avoid module-level Supabase client creation
// Use lib/supabase-admin.ts for server-side clients
// Use lib/supabase-client.ts for client-side clients  
// Use lib/types.ts for TypeScript interfaces

// Re-export types for backwards compatibility
export * from './types'

// Re-export admin client for backwards compatibility
export { supabaseAdmin } from './supabase-admin'

// Note: Do not create any Supabase clients at module level in this file
// as it causes "supabaseKey is required" errors during SSR/build