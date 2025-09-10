import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for browser usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Client-side supabase client
export const createSupabaseClient = () => createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Agency {
  id: string
  agency_name: string
  agency_slug: string
  owner_id: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  background_image_url: string | null
  custom_domain: string | null
  created_at: string
  is_active: boolean
}

export interface UserProfile {
  id: string
  role: 'agency_admin' | 'client_user'
  agency_id: string
  client_id?: string
  first_name?: string
  last_name?: string
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  agency_id: string
  brand_name: string
  brand_slug: string
  klaviyo_api_key: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  background_image_url: string | null
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
  flow_name?: string
  flow_type?: string
  flow_status?: string
  date_start?: string
  date_end?: string
  triggered_count: number
  completed_count: number
  revenue: number
  orders_count: number
  completion_rate?: number
  revenue_per_trigger?: number
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
  growth_rate?: number
  engaged_profiles: number
  engagement_rate?: number
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
  campaign_aov?: number
  flow_aov?: number
  overall_aov?: number
  created_at: string
}
