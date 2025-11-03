import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { agencyId } = await request.json()

    if (!agencyId) {
      return NextResponse.json({ error: 'Agency ID required' }, { status: 400 })
    }

    // Generate unique token
    const token = randomBytes(32).toString('hex')

    // Save to database (reuse agencies table or create new ops_share_tokens table)
    const { data, error } = await supabase
      .from('agencies')
      .update({
        ops_share_token: token,
        ops_share_enabled: true,
        ops_share_last_accessed: null,
        ops_share_view_count: 0
      })
      .eq('id', agencyId)
      .select()
      .single()

    if (error) {
      console.error('Error generating ops share token:', error)
      return NextResponse.json({ error: 'Failed to generate share link' }, { status: 500 })
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://analytics.retentionharbor.com'}/ops-share/${token}`

    return NextResponse.json({
      success: true,
      token,
      url: shareUrl,
      message: 'Ops share link generated successfully'
    })

  } catch (error) {
    console.error('Generate ops share error:', error)
    return NextResponse.json({ error: 'Failed to generate link' }, { status: 500 })
  }
}

