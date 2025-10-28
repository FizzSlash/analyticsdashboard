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

// Extend window type for singleton storage
declare global {
  interface Window {
    __SUPABASE_CLIENT__?: any
  }
}

// Client for browser usage - lazy initialization
export const getSupabaseClient = () => {
  if (typeof window === 'undefined') return null
  if (window.__SUPABASE_CLIENT__) return window.__SUPABASE_CLIENT__

  try {
    const { supabaseUrl, supabaseAnonKey } = getEnvVars()

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing')
      return null
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
    window.__SUPABASE_CLIENT__ = supabaseInstance
    return supabaseInstance
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    return null
  }
}

// Admin client for server-side operations - lazy initialization  
export const getSupabaseAdmin = () => {
  if (supabaseAdminInstance) return supabaseAdminInstance

  const { supabaseUrl, supabaseServiceKey } = getEnvVars()
  supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  return supabaseAdminInstance
}

// Export lazy clients (no immediate creation)
// Avoid creating clients at module load; only expose helpers.
export const supabase = null
export const supabaseAdmin = typeof window === 'undefined' ? getSupabaseAdmin() : null

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
  bar_chart_color?: string
  line_chart_color?: string
  ui_accent_color?: string
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
  agency_id: string
  created_at: string
  last_sync: string | null
  is_active: boolean
  audit_enabled?: boolean
  share_token?: string
  share_enabled?: boolean
  share_expires_at?: string
  share_last_accessed?: string
  share_view_count?: number
  conversion_metric_id?: string
  conversion_metric_name?: string
  conversion_metric_integration?: string
  preferred_currency?: string
  timezone?: string
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
  // Core legacy fields
  triggered_count: number
  completed_count: number
  completion_rate: number
  revenue: number
  orders_count: number
  revenue_per_trigger: number
  // Analytics fields from Flow Values Report API (optional)
  opens_unique?: number
  clicks_unique?: number
  opens?: number
  clicks?: number
  sends?: number
  deliveries?: number
  deliveries_unique?: number
  bounces?: number
  bounces_unique?: number
  bounced_or_failed?: number
  bounced_or_failed_rate?: number
  failed?: number
  failed_rate?: number
  delivery_rate?: number
  open_rate?: number
  click_rate?: number
  click_to_open_rate?: number
  bounce_rate?: number
  conversion_rate?: number
  conversions?: number
  conversion_uniques?: number
  conversion_value?: number
  unsubscribes?: number
  unsubscribe_rate?: number
  unsubscribe_uniques?: number
  spam_complaints?: number
  spam_complaint_rate?: number
  recipients?: number
  revenue_per_recipient?: number
  average_order_value?: number
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
  // Flow LUXE attribution fields for TRUE Klaviyo attribution
  sms_revenue?: number
  total_revenue?: number // Cross-channel total (includes attribution overlap)
  flow_email_revenue?: number // From $flow_channel API
  flow_sms_revenue?: number
  campaign_email_revenue?: number // From $campaign_channel API
  campaign_sms_revenue?: number
  // legacy/optional fields for back-compat
  date?: string
  email_revenue?: number
  email_orders?: number
  total_orders?: number
  created_at: string
}

export interface SegmentMetric {
  id: string
  client_id: string
  segment_id: string
  segment_name: string
  date_recorded: string
  profile_count: number
  created_at: string
  updated_at: string
}

export interface DeliverabilityMetric {
  id: string
  client_id: string
  date_recorded: string
  delivery_rate: number
  bounce_rate: number
  spam_rate: number
  reputation_score: number
  created_at: string
}