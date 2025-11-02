import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const { data: forms, error } = await supabase
      .from('ops_forms')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, forms })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch forms' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data: form, error } = await supabase
      .from('ops_forms')
      .insert([body])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, form })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create form' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    const { data: form, error } = await supabase
      .from('ops_forms')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, form })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update form' }, { status: 500 })
  }
}

