import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { KlaviyoAPI, decryptApiKey } from '@/lib/klaviyo'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientSlug, flowId } = body
    
    if (!clientSlug || !flowId) {
      return NextResponse.json({ error: 'clientSlug and flowId required' }, { status: 400 })
    }
    
    // Get client and API key
    const client = await DatabaseService.getClientBySlug(clientSlug)
    if (!client || !client.klaviyo_api_key) {
      return NextResponse.json({ error: 'Client not found or no API key' }, { status: 404 })
    }
    
    const decryptedKey = decryptApiKey(client.klaviyo_api_key)
    
    // First, get all actions for this flow
    console.log(`🔬 TEST: Fetching all actions for flow ${flowId}`)
    
    const actionsResponse = await fetch(`https://a.klaviyo.com/api/flows/${flowId}/flow-actions/`, {
      method: 'GET',
      headers: {
        'Authorization': `Klaviyo-API-Key ${decryptedKey}`,
        'Accept': 'application/vnd.api+json',
        'revision': '2024-10-15'
      }
    })
    
    if (!actionsResponse.ok) {
      const error = await actionsResponse.text()
      console.error(`❌ TEST: Error fetching actions ${actionsResponse.status}:`, error)
      return NextResponse.json({ error: `API Error: ${actionsResponse.status}` }, { status: actionsResponse.status })
    }
    
    const actionsData = await actionsResponse.json()
    const actions = actionsData.data || []
    
    console.log(`✅ TEST: Found ${actions.length} actions in flow ${flowId}`)
    
    // Test relationship links for each action
    const allResults: any[] = []
    
    for (const action of actions) {
      const actionId = action.id
      const actionType = action.attributes?.action_type
      
      console.log(`\n🔬 TEST: Testing action ${actionId} (${actionType})`)
      
      const actionResult: any = {
        actionId,
        actionType,
        relationships: {}
      }
      
      // Test 1: Flow relationship (related link)
      if (action.relationships?.flow?.links?.related) {
        console.log(`🔗 TEST: Calling flow related link for ${actionId}...`)
        try {
          const flowRelResponse = await fetch(action.relationships.flow.links.related, {
            headers: {
              'Authorization': `Klaviyo-API-Key ${decryptedKey}`,
              'Accept': 'application/vnd.api+json',
              'revision': '2024-10-15'
            }
          })
          const flowRelData = await flowRelResponse.json()
          actionResult.relationships.flowRelated = {
            status: flowRelResponse.status,
            hasData: !!flowRelData.data,
            dataType: flowRelData.data?.type,
            hasIncludes: !!flowRelData.included,
            includesCount: flowRelData.included?.length || 0,
            sample: flowRelData
          }
          console.log(`✅ TEST: Flow related returned type: ${flowRelData.data?.type}`)
          if (flowRelData.included) {
            console.log(`📦 TEST: Includes ${flowRelData.included.length} related resources`)
          }
        } catch (e: any) {
          console.error(`❌ TEST: Flow related failed:`, e.message)
          actionResult.relationships.flowRelatedError = e.message
        }
      }
      
      // Test 2: Flow messages relationship (for email actions)
      if (action.relationships?.['flow-messages']?.links?.related) {
        console.log(`🔗 TEST: Calling flow-messages link for ${actionId}...`)
        try {
          const messagesRelResponse = await fetch(action.relationships['flow-messages'].links.related, {
            headers: {
              'Authorization': `Klaviyo-API-Key ${decryptedKey}`,
              'Accept': 'application/vnd.api+json',
              'revision': '2024-10-15'
            }
          })
          const messagesRelData = await messagesRelResponse.json()
          actionResult.relationships.flowMessages = {
            status: messagesRelResponse.status,
            messageCount: messagesRelData.data?.length || 0,
            messages: messagesRelData.data
          }
          console.log(`✅ TEST: Found ${messagesRelData.data?.length || 0} messages`)
        } catch (e: any) {
          console.error(`❌ TEST: Flow messages failed:`, e.message)
          actionResult.relationships.flowMessagesError = e.message
        }
      }
      
      // Test 3: Relationships self links
      if (action.relationships?.flow?.links?.self) {
        console.log(`🔗 TEST: Calling flow self link for ${actionId}...`)
        try {
          const flowSelfResponse = await fetch(action.relationships.flow.links.self, {
            headers: {
              'Authorization': `Klaviyo-API-Key ${decryptedKey}`,
              'Accept': 'application/vnd.api+json',
              'revision': '2024-10-15'
            }
          })
          const flowSelfData = await flowSelfResponse.json()
          actionResult.relationships.flowSelf = {
            status: flowSelfResponse.status,
            data: flowSelfData
          }
          console.log(`✅ TEST: Flow self returned data`)
        } catch (e: any) {
          console.error(`❌ TEST: Flow self failed:`, e.message)
          actionResult.relationships.flowSelfError = e.message
        }
      }
      
      allResults.push(actionResult)
      
      // Rate limit: small delay between actions
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    console.log(`\n📊 TEST COMPLETE: Tested ${actions.length} actions`)
    
    return NextResponse.json({
      success: true,
      flowId,
      totalActions: actions.length,
      results: allResults,
      summary: {
        booleanBranches: allResults.filter(r => r.actionType === 'BOOLEAN_BRANCH').length,
        sendEmails: allResults.filter(r => r.actionType === 'SEND_EMAIL').length,
        timeDelays: allResults.filter(r => r.actionType === 'TIME_DELAY').length,
        hasFlowRelatedData: allResults.some(r => r.relationships.flowRelated?.hasData),
        hasIncludedData: allResults.some(r => r.relationships.flowRelated?.hasIncludes)
      }
    })
    
  } catch (error: any) {
    console.error('❌ TEST: Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

