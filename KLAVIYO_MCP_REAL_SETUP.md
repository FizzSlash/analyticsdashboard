# 🚀 Real Klaviyo MCP Integration - Complete Setup

## ✅ What This Does

Your AI assistant now uses the **real Klaviyo MCP server** with access to rich reporting data that's not available via regular API!

### Architecture

```
User asks question
    ↓
Your Backend API (/api/ai-assistant)
    ↓
MCP Client (in your code)
    ↓
Local Klaviyo MCP Server (subprocess)
    ↓
Klaviyo Internal APIs (rich data!)
    ↓
Claude analyzes
    ↓
Intelligent response
```

## 📋 Setup Steps

### Step 1: Install `uv` (Python Package Manager)

The Klaviyo MCP server runs via `uvx`, which requires `uv`:

```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Add to PATH (add to ~/.zshrc or ~/.bashrc)
export PATH="$HOME/.local/bin:$PATH"

# Reload shell
source ~/.zshrc  # or source ~/.bashrc

# Verify installation
uv --version
uvx --version
```

### Step 2: Test Klaviyo MCP Server

```bash
# Test with a Klaviyo API key
export PRIVATE_API_KEY="your_klaviyo_private_key"
export READ_ONLY="false"
export ALLOW_USER_GENERATED_CONTENT="false"

# Run the server (will install and start)
uvx klaviyo-mcp-server@latest

# You should see MCP server starting up
# Press Ctrl+C to stop
```

### Step 3: Verify Your Environment

Make sure you have in `.env.local`:

```bash
# Claude API Key (already have this)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Klaviyo API keys are stored per-client in database ✅
```

### Step 4: Deploy

If deploying to Vercel/production, you need to:

**Option A: Include `uv` in Docker image** (if using containers)
```dockerfile
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:$PATH"
```

**Option B: Use Vercel** (simpler)
Vercel supports Python runtimes, so `uvx` should work automatically.

**Option C: Use serverless functions** (recommended)
The current implementation spawns processes, which works in:
- ✅ Development (localhost)
- ✅ VPS/dedicated servers
- ⚠️ Serverless (may time out on cold starts)

For serverless, consider using Vercel's Python runtime or edge functions.

## 🎯 What You Get

### Rich MCP Tools

According to [Klaviyo docs](https://developers.klaviyo.com/en/docs/klaviyo_mcp_server#available-tools), the MCP server provides:

| Tool | What It Does | Data Quality |
|------|--------------|--------------|
| `get_flow_report` | Full flow performance with message-level data, trends, attribution | ⭐⭐⭐⭐⭐ |
| `get_campaign_report` | Complete campaign metrics with deliverability, engagement, revenue | ⭐⭐⭐⭐⭐ |
| `get_flows` | All flows with complete metadata | ⭐⭐⭐⭐ |
| `get_campaigns` | All campaigns with details | ⭐⭐⭐⭐ |
| `get_account_details` | Account info, timezone, settings | ⭐⭐⭐ |
| Plus: profiles, events, segments, lists, catalogs, templates | Full Klaviyo ecosystem access | ⭐⭐⭐⭐⭐ |

### Better Than REST API Because:

✅ **Pre-aggregated reports** - No need to calculate metrics yourself  
✅ **Message-level data** - See performance of each flow message  
✅ **Trend analysis** - Historical data built-in  
✅ **Attribution data** - Accurate revenue attribution  
✅ **Complete metadata** - All the context Claude needs  

## 🧪 Testing

### Test 1: MCP Client Connection

```bash
# In your project directory
npm run dev

# Watch logs for:
# ✅ "🔌 Connecting to Klaviyo MCP server..."
# ✅ "✅ Connected to Klaviyo MCP server"
```

### Test 2: Ask Questions

Open dashboard, click AI assistant (✨), try:

**"Show me detailed performance for my Welcome Series flow"**
→ Claude will:
1. Call `get_flows` to find the flow ID
2. Call `get_flow_report` to get detailed data
3. Analyze message-level performance
4. Provide specific recommendations

**"How did my campaigns perform last month?"**
→ Claude will:
1. Call `get_campaigns` to get campaign list
2. Call `get_campaign_report` for each relevant campaign
3. Compare performance metrics
4. Identify patterns and opportunities

### Expected Console Logs

```
🤖 AI Assistant: Processing request for client: jonathan-ader
🤖 AI Assistant: Calling Claude API with MCP tools...
🤖 AI Assistant: Claude requested tools (1/5)
🔧 Executing tool: get_flows
🔌 Connecting to Klaviyo MCP server...
✅ Connected to Klaviyo MCP server
🔧 Calling MCP tool: get_flows
✅ Tool result received
🤖 AI Assistant: Claude requested tools (2/5)
🔧 Executing tool: get_flow_report {"flow_id":"WZCeMQ"}
🔧 Calling MCP tool: get_flow_report
✅ Tool result received
✅ AI Assistant: Response complete
```

## 💰 Cost

### With MCP Tools

**More tool calls but richer data:**
- Average 2-3 tool calls per conversation
- Input: ~3,000 tokens
- Output: ~800 tokens
- **Cost: ~$0.025 per conversation** (2.5 cents)

**Monthly estimate:**
- 10 clients × 10 questions = 100 conversations
- 100 × $0.025 = **$2.50/month**

Still very affordable! The better data quality is worth it.

## 🔧 Troubleshooting

### Error: "uvx: command not found"

```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Add to PATH
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Error: "Not connected" or "MCP client error"

**Cause:** MCP server failed to start

**Debug:**
```bash
# Test manually
PRIVATE_API_KEY=your_key uvx klaviyo-mcp-server@latest

# Check for errors
# Common issues:
# - Invalid API key
# - Network blocked
# - Python not installed
```

**Solution:** Check API key is valid and has proper permissions

### Error: "Tool execution error"

**Cause:** MCP tool call failed

**Check:**
1. Is the Klaviyo API key valid?
2. Does it have proper scopes? (Need: Flows Read, Campaigns Read, etc.)
3. Is network available?

**Debug logs:**
```
❌ Tool execution error: [error message]
```

### Slow Responses

**Normal:** 3-6 seconds (MCP server startup + tool calls + Claude analysis)

**If > 10 seconds:**
- Check internet connection
- Check Klaviyo API status
- MCP server may be slow to start (first call takes longer)

**Optimization:**
- MCP client pooling reduces repeated startups
- Consider keeping server running as daemon

## 🚀 Production Deployment

### Recommended Architecture

**For high traffic:**

1. **Run MCP server as separate service**
```bash
# Start MCP server on dedicated port
PRIVATE_API_KEY=your_key uvx klaviyo-mcp-server@latest --port 3001

# Your backend connects to localhost:3001
```

2. **Use connection pooling** (already implemented)
   - Reuses MCP connections
   - Reduces startup overhead

3. **Add caching layer**
   - Cache tool results for 5-10 minutes
   - Reduces API calls and costs

### For Vercel/Serverless

**Current implementation may have cold start issues.**

**Alternative:** Use Klaviyo REST API + our smart analysis  
(Falls back automatically if MCP fails)

## 📊 Comparison

| Approach | Data Quality | Speed | Cost | Complexity |
|----------|--------------|-------|------|------------|
| **MCP Server (Current)** | ⭐⭐⭐⭐⭐ | Medium (3-6s) | $0.025/query | Medium |
| **REST API + Analysis** | ⭐⭐⭐ | Fast (1-2s) | $0.015/query | Low |
| **Dashboard Data Only** | ⭐⭐ | Instant | Free | Very Low |

**Verdict:** MCP gives **significantly better data** for reasonable cost increase.

## 📚 Next Steps

1. **Install uv** ✅
2. **Test locally** - Try AI assistant with detailed questions
3. **Monitor performance** - Check console logs
4. **Deploy** - Push to production
5. **Optimize** - Add caching if needed

## 🎉 What This Unlocks

With real MCP access, Claude can now:

✅ **See individual message performance** within flows  
✅ **Identify exact drop-off points** in flow sequences  
✅ **Compare time periods** with historical data  
✅ **Analyze attribution** more accurately  
✅ **Provide segment insights** from detailed data  
✅ **Create campaigns** (if you enable write tools)  

This is **professional-grade analytics AI** with enterprise data access! 🚀

---

**Status:** 
- ✅ Code implemented
- ⏳ Needs `uv` installation
- ⏳ Needs testing
- 🚀 Ready to deploy after testing

