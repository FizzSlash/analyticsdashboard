import { NextRequest, NextResponse } from 'next/server'
import { AICopyService } from '@/lib/ai-copy-service'

export async function POST(request: NextRequest) {
  try {
    const { currentCopy, revisionNotes, copyNotes, agencyId } = await request.json()

    if (!currentCopy || !revisionNotes) {
      return NextResponse.json({ error: 'Current copy and revision notes required' }, { status: 400 })
    }

    console.log('🔄 Revising copy with notes:', revisionNotes)

    const aiService = new AICopyService(agencyId || 'default')
    const revisedCopy = await aiService.reviseCopy({
      current_copy: currentCopy,
      revision_notes: revisionNotes,
      copy_notes: copyNotes
    })

    console.log('✅ Copy revised successfully')

    return NextResponse.json({
      success: true,
      data: revisedCopy,
      message: 'Copy revised successfully'
    })

  } catch (error) {
    console.error('❌ Revise copy error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to revise copy'
    }, { status: 500 })
  }
}

