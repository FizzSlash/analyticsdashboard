# 🤖 Claude AI Assistant with Klaviyo Integration

## ✅ What's Implemented

The AI Assistant now uses **Claude 3.5 Sonnet with tool calling** to access Klaviyo data and provide intelligent insights!

## How It Works

```
User Question
    ↓
Frontend sends to /api/ai-assistant
    ↓
Backend calls Claude API with tool definitions
    ↓
Claude analyzes question and decides what data it needs
    ↓
Claude requests tool: "get_flows" or "get_flow_report"
    ↓
Backend fetches data from Klaviyo API
    ↓
Returns data to Claude
    ↓
Claude analyzes data and generates intelligent response
    ↓
Response shown to user
```

## Requirements

### 1. Anthropic API Key ✅
You already have this! Just make sure it's in your environment:

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

### 2. Client Klaviyo API Keys ✅
Already in database - each client has their Klaviyo API key stored

### 3. Anthropic SDK ✅
Already installed with `npm install @anthropic-ai/sdk`

## Features

### 🎯 What Claude Can Do

1. **Get Flows List**
   - Fetches all flows from Klaviyo
   - Claude can see names, statuses, metrics
   
2. **Get Flow Reports**
   - Detailed performance data for specific flows
   - Messages, metrics, trends
   
3. **Get Campaigns**
   - List of all campaigns
   - Send times, statuses
   
4. **Get Campaign Reports**
   - Detailed campaign performance
   - Opens, clicks, revenue, etc.

5. **Analyze Dashboard Data**
   - Uses already-loaded dashboard context
   - Fast analysis without API calls
   - Top performers, comparisons, optimization tips

### 💬 Example Questions

**"What are my top performing flows?"**
→ Claude uses `analyze_dashboard_data` tool with `top_flows` analysis

**"Show me details about my Welcome Series flow"**
→ Claude uses `get_flows` to find the flow ID, then `get_flow_report` for details

**"How did my campaigns perform last month?"**
→ Claude uses `get_campaigns` and analyzes performance data

**"Give me optimization recommendations"**
→ Claude uses `analyze_dashboard_data` with `optimization_tips`, then provides insights

## Architecture Details

### Tool Calling Flow

1. **Initial Call to Claude**
   ```typescript
   anthropic.messages.create({
     model: 'claude-3-5-sonnet-20241022',
     messages: [{ role: 'user', content: userQuestion }],
     tools: [/* tool definitions */]
   })
   ```

2. **Claude Requests Tool**
   ```json
   {
     "stop_reason": "tool_use",
     "content": [
       {
         "type": "tool_use",
         "name": "get_flows",
         "input": {}
       }
     ]
   }
   ```

3. **Execute Tool**
   ```typescript
   const result = await getFlowsFromKlaviyo(clientApiKey)
   ```

4. **Return to Claude**
   ```typescript
   anthropic.messages.create({
     messages: [
       originalMessage,
       claudeResponse,
       { role: 'user', content: toolResults }
     ]
   })
   ```

5. **Claude Analyzes and Responds**
   ```json
   {
     "stop_reason": "end_turn",
     "content": [
       {
         "type": "text",
         "text": "Based on your flows data..."
       }
     ]
   }
   ```

### Implemented Tools

```typescript
[
  {
    name: 'get_flows',
    description: 'Get all flows with metrics',
    input_schema: { properties: {} }
  },
  {
    name: 'get_flow_report',
    description: 'Get detailed flow report',
    input_schema: {
      properties: {
        flow_id: { type: 'string' }
      }
    }
  },
  {
    name: 'get_campaigns',
    description: 'Get all campaigns',
    input_schema: { properties: {} }
  },
  {
    name: 'get_campaign_report',
    description: 'Get detailed campaign report',
    input_schema: {
      properties: {
        campaign_id: { type: 'string' }
      }
    }
  },
  {
    name: 'analyze_dashboard_data',
    description: 'Analyze loaded dashboard data',
    input_schema: {
      properties: {
        analysis_type: {
          enum: ['top_flows', 'campaign_performance', 'optimization_tips']
        }
      }
    }
  }
]
```

## Cost Estimate

### Per Conversation

**Input Tokens:**
- System prompt: ~300 tokens
- User question: ~50 tokens
- Context data: ~500 tokens
- Tool results: ~1,000 tokens
- **Total Input: ~1,850 tokens**

**Output Tokens:**
- Tool calls: ~100 tokens
- Final response: ~500 tokens
- **Total Output: ~600 tokens**

**Cost per conversation:**
- Input: 1,850 tokens × $3/1M = $0.0056
- Output: 600 tokens × $15/1M = $0.009
- **Total: ~$0.015 per conversation** (1.5 cents)

### Monthly Estimate

If each client asks 10 questions/month:
- 10 clients × 10 questions = 100 conversations
- 100 × $0.015 = **$1.50/month**

Very affordable! 💰

## Fallback System

If Claude API fails (network, rate limit, etc.), it automatically falls back to:
- Intelligent data analysis using dashboard context
- Same response format
- Slightly less sophisticated but still helpful
- Zero additional cost

## Testing

### Quick Test

1. Open any client dashboard
2. Click sparkle button (✨)
3. Ask: "What are my top flows?"
4. Watch console for:
   ```
   🤖 AI Assistant: Processing request for client: client-name
   🤖 AI Assistant: Calling Claude API...
   🤖 AI Assistant: Claude requested tool use (1/3)
   🤖 AI Assistant: Executing tool: analyze_dashboard_data
   🤖 AI Assistant: Response complete
   ```

### Expected Response

```
Here are your top 5 performing flows by revenue:

1. **SMS Welcome Series with Discount**
   - Revenue: $159,497
   - Opens: 14,523 (42.3% open rate)
   - This flow significantly outperforms others

2. **RH | Abandoned Checkout SMS Flow**
   - Revenue: $98,234
   - Opens: 8,912 (38.1% open rate)

[... continues with analysis and recommendations]

💡 **Key Insight**: Your SMS flows generate 67% more revenue
than email flows on average. Consider adding SMS messages to 
your highest-traffic email flows for similar performance gains.
```

## Advantages Over Previous Approach

| Feature | Data Analysis | Claude AI |
|---------|---------------|-----------|
| **Intelligence** | Pattern matching | Real AI reasoning |
| **Data Access** | Dashboard only | Can fetch ANY Klaviyo data |
| **Flexibility** | Predefined queries | Natural language |
| **Accuracy** | Rule-based | Context-aware |
| **Insights** | Template-based | Dynamic analysis |
| **Follow-ups** | Limited | Conversational |
| **Cost** | Free | ~$0.015/query |

## Monitoring

### Console Logs

Watch for these in your logs:
- ✅ `Claude requested tool use` - Claude is working
- ✅ `Executing tool: tool_name` - Fetching data
- ✅ `Response complete` - Success
- ⚠️ `fallback: true` - Using backup (Claude API issue)

### Usage Tracking

Each response includes:
```json
{
  "usage": {
    "input_tokens": 1850,
    "output_tokens": 600
  },
  "tool_uses": 1
}
```

Track this to monitor costs and usage patterns.

## Security

### API Key Storage
- ✅ Client Klaviyo keys stored encrypted in database
- ✅ Anthropic key in environment variables
- ✅ Never exposed to frontend
- ✅ Used only in backend API routes

### Data Privacy
- ✅ Each client only sees their own data
- ✅ Claude context scoped to specific client
- ✅ No cross-client data leakage
- ✅ Klaviyo API calls use client-specific keys

### Rate Limiting
- Default: Claude API has generous rate limits
- Fallback: Activates if limits hit
- Consider: Adding application-level rate limiting (20 queries/hour per client)

## Future Enhancements

### Phase 1 (Current) ✅
- Claude with tool calling
- Basic Klaviyo data access
- Intelligent fallback

### Phase 2 (Next)
- Implement full reporting APIs
- Add campaign creation tool
- Profile updates
- Segment analysis

### Phase 3 (Future)
- Proactive insights ("AI noticed...")
- Weekly AI summaries via email
- Voice input support
- Multi-turn conversations with memory

## Troubleshooting

### Error: "Missing ANTHROPIC_API_KEY"
**Solution:** Add to `.env.local`:
```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Error: "Client not found or missing Klaviyo API key"
**Solution:** Ensure client has Klaviyo API key in database

### Response: "fallback: true"
**Cause:** Claude API issue (network, rate limit)
**Impact:** Still works, uses data analysis instead
**Action:** Monitor for patterns, may need to upgrade Anthropic plan

### Slow Responses
**Cause:** Tool calling adds latency (2-3 extra API calls)
**Normal:** 2-4 seconds total
**If >10 seconds:** Check network, Klaviyo API response times

## Conclusion

✅ **Claude AI with Klaviyo tool calling is now live!**

Benefits:
- Real AI intelligence
- Access to all Klaviyo data
- Natural conversation
- Cost-effective (~$0.015/query)
- Reliable fallback

Test it now - the sparkle button (✨) is waiting! 

---

**Need help?** Check console logs or ask Claude itself: "How do you work?" 😄

