// Database Types - Separated from Supabase client creation
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
  date: string
  total_profiles: number
  subscribed_profiles: number
  unsubscribed_profiles: number
  bounced_profiles: number
  growth_rate: number
  churn_rate: number
  created_at: string
}

export interface RevenueAttribution {
  id: string
  client_id: string
  date: string
  email_revenue: number
  flow_revenue: number
  campaign_revenue: number
  total_revenue: number
  email_orders: number
  flow_orders: number
  campaign_orders: number
  total_orders: number
  created_at: string
}
