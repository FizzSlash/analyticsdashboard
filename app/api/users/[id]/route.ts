import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    console.log('🗑️ USER DELETE: Removing user:', userId)

    // Step 1: Delete user profile (will cascade delete via foreign key)
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('❌ USER DELETE: Profile deletion failed:', profileError)
      throw profileError
    }

    console.log('✅ USER DELETE: User profile deleted')

    // Step 2: Delete auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('❌ USER DELETE: Auth user deletion failed:', authError)
      throw authError
    }

    console.log('✅ USER DELETE: Auth user deleted:', userId)

    return NextResponse.json({
      success: true,
      message: 'User successfully removed'
    })

  } catch (error: any) {
    console.error('❌ USER DELETE: Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete user' 
      },
      { status: 500 }
    )
  }
}