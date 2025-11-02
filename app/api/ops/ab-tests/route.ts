import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    let query = supabase.from('ops_ab_tests').select('*').order('created_at', { ascending: false })

    if (clientId && clientId !== 'all') {
      query = query.eq('client_id', clientId)
    }

    const { data: tests, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, tests })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch tests' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { client_name, client_color, ...dbData } = body // Remove UI-only fields

    const { data: test, error } = await supabase
      .from('ops_ab_tests')
      .insert([dbData])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json({ success: true, test })
  } catch (error) {
    console.error('Error creating test:', error)
    return NextResponse.json({ success: false, error: 'Failed to create test' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, client_name, client_color, ...updates } = body // Remove UI-only fields

    const { data: test, error } = await supabase
      .from('ops_ab_tests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json({ success: true, test })
  } catch (error) {
    console.error('Error updating test:', error)
    return NextResponse.json({ success: false, error: 'Failed to update test' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    const { error } = await supabase.from('ops_ab_tests').delete().eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete test' }, { status: 500 })
  }
}

