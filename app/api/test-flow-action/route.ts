import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { KlaviyoAPI, decryptApiKey } from '@/lib/klaviyo'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientSlug, actionId } = body
    
    if (!clientSlug || !actionId) {
      return NextResponse.json({ error: 'clientSlug and actionId required' }, { status: 400 })
    }
    
    // Get client and API key
    const client = await DatabaseService.getClientBySlug(clientSlug)
    if (!client || !client.klaviyo_api_key) {
      return NextResponse.json({ error: 'Client not found or no API key' }, { status: 404 })
    }
    
    const decryptedKey = decryptApiKey(client.klaviyo_api_key)
    
    // Fetch SINGLE action with full details
    console.log(`🔬 TEST: Fetching single action ${actionId}`)
    
    const response = await fetch(`https://a.klaviyo.com/api/flow-actions/${actionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Klaviyo-API-Key ${decryptedKey}`,
        'Accept': 'application/vnd.api+json',
        'revision': '2024-10-15'
      }
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error(`❌ TEST: Error ${response.status}:`, error)
      return NextResponse.json({ error: `API Error: ${response.status}` }, { status: response.status })
    }
    
    const data = await response.json()
    
    console.log(`✅ TEST: Got single action data`)
    console.log(`📊 TEST: Full response:`, JSON.stringify(data, null, 2))
    
    // Now test the relationship links!
    const relationshipTests: any = {}
    
    // Test 1: Flow relationship
    if (data.data?.relationships?.flow?.links?.related) {
      console.log(`🔗 TEST: Calling flow relationship link...`)
      try {
        const flowRelResponse = await fetch(data.data.relationships.flow.links.related, {
          headers: {
            'Authorization': `Klaviyo-API-Key ${decryptedKey}`,
            'Accept': 'application/vnd.api+json',
            'revision': '2024-10-15'
          }
        })
        const flowRelData = await flowRelResponse.json()
        relationshipTests.flowRelated = flowRelData
        console.log(`✅ TEST: Flow related data:`, JSON.stringify(flowRelData, null, 2))
      } catch (e: any) {
        console.error(`❌ TEST: Flow related failed:`, e.message)
        relationshipTests.flowRelatedError = e.message
      }
    }
    
    // Test 2: Flow messages relationship
    if (data.data?.relationships?.['flow-messages']?.links?.related) {
      console.log(`🔗 TEST: Calling flow-messages relationship link...`)
      try {
        const messagesRelResponse = await fetch(data.data.relationships['flow-messages'].links.related, {
          headers: {
            'Authorization': `Klaviyo-API-Key ${decryptedKey}`,
            'Accept': 'application/vnd.api+json',
            'revision': '2024-10-15'
          }
        })
        const messagesRelData = await messagesRelResponse.json()
        relationshipTests.flowMessagesRelated = messagesRelData
        console.log(`✅ TEST: Flow messages data:`, JSON.stringify(messagesRelData, null, 2))
      } catch (e: any) {
        console.error(`❌ TEST: Flow messages failed:`, e.message)
        relationshipTests.flowMessagesError = e.message
      }
    }
    
    // Test 3: Relationships self links (might return structure data!)
    if (data.data?.relationships?.flow?.links?.self) {
      console.log(`🔗 TEST: Calling flow self relationship link...`)
      try {
        const flowSelfResponse = await fetch(data.data.relationships.flow.links.self, {
          headers: {
            'Authorization': `Klaviyo-API-Key ${decryptedKey}`,
            'Accept': 'application/vnd.api+json',
            'revision': '2024-10-15'
          }
        })
        const flowSelfData = await flowSelfResponse.json()
        relationshipTests.flowSelf = flowSelfData
        console.log(`✅ TEST: Flow self data:`, JSON.stringify(flowSelfData, null, 2))
      } catch (e: any) {
        console.error(`❌ TEST: Flow self failed:`, e.message)
        relationshipTests.flowSelfError = e.message
      }
    }
    
    return NextResponse.json({
      success: true,
      actionId,
      mainResponse: data,
      relationshipTests,
      summary: {
        hasFlowRelated: !!relationshipTests.flowRelated,
        hasFlowMessages: !!relationshipTests.flowMessagesRelated,
        hasFlowSelf: !!relationshipTests.flowSelf
      }
    })
    
  } catch (error: any) {
    console.error('❌ TEST: Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

