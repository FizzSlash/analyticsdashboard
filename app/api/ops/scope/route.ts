import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// GET - Fetch scope data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // config, usage, monthly
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json({ success: false, error: 'Client ID required' }, { status: 400 })
    }

    let data, error

    switch (type) {
      case 'config':
        ({ data, error } = await supabase.from('ops_scope_config').select('*').eq('client_id', clientId).single())
        break
      case 'usage':
        const currentMonth = new Date().toISOString().slice(0, 7)
        ({ data, error } = await supabase.from('ops_scope_usage').select('*').eq('client_id', clientId).eq('month_year', currentMonth).single())
        break
      case 'monthly':
        ({ data, error } = await supabase.from('ops_monthly_docs').select('*').eq('client_id', clientId).order('month_year', { ascending: false }))
        break
      default:
        return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 })
    }

    if (error && error.code !== 'PGRST116') throw error

    return NextResponse.json({ success: true, data: data || null })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch scope data' }, { status: 500 })
  }
}

// POST/PATCH - Update scope data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...data } = body

    let result, error

    switch (type) {
      case 'config':
        ({ data: result, error } = await supabase.from('ops_scope_config').upsert(data).select().single())
        break
      case 'monthly':
        ({ data: result, error } = await supabase.from('ops_monthly_docs').upsert(data).select().single())
        break
      default:
        return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 })
    }

    if (error) throw error

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save scope data' }, { status: 500 })
  }
}

