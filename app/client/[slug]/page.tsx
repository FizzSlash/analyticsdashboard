import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { ClientDashboard } from '@/components/dashboard/client-dashboard'

interface PageProps {
  params: {
    slug: string
  }
}

export default async function ClientDashboardPage({ params }: PageProps) {
  const supabase = createSupabaseServerClient()
  
  // Get current user session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    notFound()
  }

  // Get client data
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('brand_slug', params.slug)
    .single()

  if (clientError || !client) {
    notFound()
  }

  // Verify user has access to this client
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, agency_id, client_id')
    .eq('id', session.user.id)
    .single()

  if (!profile) {
    notFound()
  }

  // Check access permissions
  const hasAccess = 
    // Agency admin can access any client in their agency
    (profile.role === 'agency_admin' && profile.agency_id === client.agency_id) ||
    // Client user can access their specific client
    (profile.role === 'client_user' && profile.client_id === client.id)

  if (!hasAccess) {
    notFound()
  }

  return <ClientDashboard client={client} />
}

export async function generateMetadata({ params }: PageProps) {
  const supabase = createSupabaseServerClient()
  
  const { data: client } = await supabase
    .from('clients')
    .select('brand_name')
    .eq('brand_slug', params.slug)
    .single()
  
  return {
    title: client ? `${client.brand_name} - Analytics Dashboard` : 'Dashboard Not Found',
    description: `Email marketing analytics dashboard for ${client?.brand_name || 'client'}`,
  }
}
