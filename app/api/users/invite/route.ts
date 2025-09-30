import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create admin client for user management
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, client_id, agency_id, first_name, last_name } = body

    console.log('👤 USER INVITE: Processing invitation for:', email)

    // Validate required fields
    if (!email || !client_id || !agency_id) {
      return NextResponse.json(
        { success: false, error: 'Email, client_id, and agency_id are required' },
        { status: 400 }
      )
    }

    // Step 1: Create auth user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: first_name || '',
        last_name: last_name || ''
      }
    })

    if (authError) {
      console.error('❌ USER INVITE: Auth user creation failed:', authError)
      
      // Check if user already exists
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { success: false, error: 'User with this email already exists' },
          { status: 400 }
        )
      }
      
      throw authError
    }

    console.log('✅ USER INVITE: Auth user created:', authData.user.id)

    // Step 2: Create user profile for client access
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        role: 'client_user',
        agency_id: agency_id,
        client_id: client_id,
        first_name: first_name || '',
        last_name: last_name || ''
      })
      .select()
      .single()

    if (profileError) {
      console.error('❌ USER INVITE: Profile creation failed:', profileError)
      
      // Rollback: Delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      
      throw profileError
    }

    console.log('✅ USER INVITE: User profile created:', profile.id)

    // Step 3: Send password reset email (acts as invitation)
    const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`
      }
    })

    if (resetError) {
      console.warn('⚠️ USER INVITE: Failed to send invitation email:', resetError)
      // Don't fail the whole operation - user can be manually invited later
    } else {
      console.log('✅ USER INVITE: Invitation email sent to:', email)
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: email,
        first_name: first_name,
        last_name: last_name,
        role: 'client_user',
        client_id: client_id
      }
    })

  } catch (error: any) {
    console.error('❌ USER INVITE: Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create user invitation' 
      },
      { status: 500 }
    )
  }
}