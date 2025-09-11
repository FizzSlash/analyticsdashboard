import { createClient } from '@supabase/supabase-js'

// Environment variables - only access when needed, not at module level
const getEnvVars = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return { supabaseUrl, supabaseAnonKey, supabaseServiceKey }
}

// Lazy client creation - only when actually needed
let supabaseInstance: any = null
let supabaseAdminInstance: any = null

// Client for browser usage - lazy initialization
export const getSupabaseClient = () => {
  if (!supabaseInstance && typeof window !== 'undefined') {
    const { supabaseUrl, supabaseAnonKey } = getEnvVars()
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

// Admin client for server-side operations - lazy initialization  
export const getSupabaseAdmin = () => {
  if (!supabaseAdminInstance) {
    const { supabaseUrl, supabaseServiceKey } = getEnvVars()
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  return supabaseAdminInstance
}

// Export lazy clients (no immediate creation)
export const supabase = typeof window !== 'undefined' ? getSupabaseClient() : null
export const supabaseAdmin = getSupabaseAdmin()

// Client-side supabase client function
export const createSupabaseClient = () => {
  const { supabaseUrl, supabaseAnonKey } = getEnvVars()
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Database Types - COMPLETE ORIGINAL INTERFACES
export interface Agency {
  id: string
  agency_name: string
  agency_slug: string
  owner_id: string
  primary_color: string
  secondary_color: string
  logo_url?: string
  background_image_url?: string
  custom_domain?: string
  is_active: boolean
  created_at: string
}

export interface UserProfile {
  id: string
  role: 'agency_admin' | 'client_user'
  agency_id?: string
  client_id?: string
  first_name?: string
  last_name?: string
  created_at: string
}

export interface Client {
  id: string
  brand_name: string
  brand_slug: string
  klaviyo_api_key: string
  logo_url?: string
  primary_color: string
  secondary_color: string
  background_image_url?: string
  agency_id: string
  created_at: string
  last_sync: string | null
  is_active: boolean
}

export interface CampaignMetric {
  id: string
  client_id: string
  campaign_id: string
  campaign_name?: string
  subject_line?: string
  send_date?: string
  recipients_count: number
  delivered_count: number
  opened_count: number
  clicked_count: number
  unsubscribed_count: number
  bounced_count: number
  open_rate?: number
  click_rate?: number
  click_to_open_rate?: number
  unsubscribe_rate?: number
  bounce_rate?: number
  revenue: number
  orders_count: number
  revenue_per_recipient?: number
  created_at: string
  updated_at: string
}

export interface FlowMetric {
  id: string
  client_id: string
  flow_id: string
  flow_name: string
  flow_type: string
  flow_status: string
  date_start: string
  date_end: string
  triggered_count: number
  completed_count: number
  completion_rate: number
  revenue: number
  orders_count: number
  revenue_per_trigger: number
  created_at: string
  updated_at: string
}

export interface AudienceMetric {
  id: string
  client_id: string
  date_recorded: string
  total_profiles: number
  subscribed_profiles: number
  unsubscribed_profiles: number
  new_subscribers: number
  unsubscribes: number
  net_growth: number
  growth_rate: number
  engaged_profiles: number
  engagement_rate: number
  // legacy/optional fields for back-compat
  date?: string
  bounced_profiles?: number
  churn_rate?: number
  created_at: string
}

export interface RevenueAttribution {
  id: string
  client_id: string
  date_recorded: string
  campaign_revenue: number
  flow_revenue: number
  total_email_revenue: number
  campaign_orders: number
  flow_orders: number
  total_email_orders: number
  campaign_aov: number
  flow_aov: number
  overall_aov: number
  // legacy/optional fields for back-compat
  date?: string
  email_revenue?: number
  total_revenue?: number
  email_orders?: number
  total_orders?: number
  created_at: string
}