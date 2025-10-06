# 🤖 AI AUDIT TAB - Setup & Usage Guide

**Status:** ✅ FULLY IMPLEMENTED - Ready to Use!

---

## 🚀 **Quick Setup (5 minutes)**

### **Step 1: Add Your Anthropic API Key**

1. Get your API key from: https://console.anthropic.com/
   - Create account (free)
   - Go to API Keys
   - Click "Create Key"
   - Copy the key (starts with `sk-ant-...`)

2. Add to your `.env.local`:
   ```env
   ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
   ```

3. Restart your dev server:
   ```bash
   npm run dev
   ```

---

### **Step 2: Run Database Migration**

Execute in Supabase SQL Editor:
```bash
database/create_audit_system.sql
```

This creates:
- `audit_results` table (stores AI analyses)
- `audit_enabled` column on clients (toggle per client)
- Indexes for performance
- Auto-update triggers

---

### **Step 3: Enable for Clients**

**Agency Dashboard → Clients Tab:**

1. Look for purple Sparkles icon (✨) next to sync button
2. Purple/filled = AI Audit enabled
3. Gray/outline = AI Audit disabled
4. Click to toggle on/off per client

**Clients with AI Audit enabled will see a 7th tab: "AI Audit"**

---

## 🎯 **How It Works**

### **For Clients:**

1. **Open Client Dashboard** (`/client/[slug]`)
2. **Click "AI Audit" tab** (if enabled by agency)
3. **Click "Run Audit" button**
4. **Wait 10-15 seconds** while Claude analyzes data
5. **Review insights:**
   - Overall score (0-10) and grade (A-F)
   - High priority items (red)
   - Medium priority items (yellow)
   - Opportunities (blue)
   - Strengths (green)
6. **Click findings to expand** for full analysis
7. **Click "Export PDF"** to save report

---

### **For Agency Admins:**

**Control Audit Access:**
- Agency Dashboard → Clients tab
- Click ✨ Sparkles icon to toggle per client
- Purple = Enabled, Gray = Disabled

**Monitor Usage:**
- Check Supabase `audit_results` table
- See `tokens_used` and `api_cost_usd` columns
- Track which clients run audits most frequently

---

## 📊 **What Gets Analyzed**

Claude analyzes:
- ✅ **90 days of historical data**
- ✅ **All campaigns** (send times, subject lines, performance)
- ✅ **All flows** (missing flows, underperforming flows)
- ✅ **Revenue attribution** (flow vs campaign revenue)
- ✅ **List health** (growth, churn, subscriptions)
- ✅ **Subject line patterns** (emoji, length, personalization)
- ✅ **Send time optimization** (best days, best hours)

---

## 💰 **Cost Tracking**

### **Per Audit:**
- Input: ~15,000 tokens @ $3/M = $0.045
- Output: ~2,000-4,000 tokens @ $15/M = $0.03-0.06
- **Total: ~$0.075-0.105 per audit**

### **Monthly Estimates:**
- **10 clients, 1 audit each/month:** ~$0.75-1.00/month
- **10 clients, weekly audits:** ~$3-4/month
- **10 clients, daily audits:** ~$22-30/month

### **Track Actual Usage:**
```sql
-- See total costs this month
SELECT 
  SUM(api_cost_usd) as total_cost,
  COUNT(*) as total_audits,
  SUM(tokens_used) as total_tokens
FROM audit_results
WHERE audit_date >= DATE_TRUNC('month', NOW());
```

---

## 🎨 **Example Audit Output**

```
🤖 AI MARKETING AUDIT

Overall Score: 8.4/10 (Grade: A-)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 HIGH PRIORITY (1 item)

🚨 Missing Abandoned Cart Flow
   Impact: $2,000-5,000/month potential revenue
   Confidence: High
   
   Analysis:
   You don't have an automated abandoned cart recovery flow.
   Industry data shows cart flows recover 10-30% of abandoned
   revenue. Based on your $125 AOV and estimated 250 monthly
   cart abandonments, this represents $31,250 in potentially
   recoverable revenue.
   
   Supporting Data:
   - Your AOV: $125
   - Estimated abandonments: 250/month
   - Industry recovery rate: 10-30%
   - Potential revenue: $6,250-9,375/month
   
   Recommendations:
   1. Create 3-email cart recovery sequence
      - Email 1: 1hr after - "You left something behind"
      - Email 2: 24hr after - Add social proof + urgency
      - Email 3: 72hr after - 10% discount offer
      Expected: 20-30% recovery rate = $1,500-2,800/month
      
   2. Include dynamic product images
      Show exact cart contents using Klaviyo variables
      Expected: +5-10% recovery vs text-only
      
   3. A/B test discount timing
      Test offering discount in Email 2 vs Email 3
      Expected: Find optimal discount strategy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟡 MEDIUM PRIORITY (3 items)

⏰ Suboptimal Send Times
   Impact: +15-20% open rate potential
   
   Your Tuesday 10am campaigns average 64% OR, but 42%
   of your campaigns are sent on weekends with only 28% OR.
   
   Recommendations:
   - Move weekend sends to Tue-Thu mornings
   - Schedule more campaigns for 10am-12pm window
   - Avoid sends after 8pm (22% OR vs 58% morning avg)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ WORKING WELL (4 items)

✨ Exceptional Campaign Open Rates
   Your 48% average OR is 15% above industry (33%).
   Keep doing what you're doing with subject lines!
   Data: 48% OR vs 33% industry avg
```

---

## 🛠️ **Troubleshooting**

### **"Audit Tab Not Showing"**
- Check client has `audit_enabled = true` in database
- Check Sparkles icon is purple (not gray) in admin
- Refresh client dashboard after enabling

### **"Audit Failed" Error**
- Check `ANTHROPIC_API_KEY` is set in `.env.local`
- Check API key is valid (not expired)
- Check Supabase has audit_results table (run migration)
- Check console for detailed error message

### **"Rate Limit" Errors**
- Claude has rate limits: 50 requests/minute
- If running many audits, add delays between clients
- Wait 60 seconds and try again

---

## 📋 **Features Included**

✅ **Fully AI-Powered** - Claude Sonnet 4 analyzes all data  
✅ **Manual Trigger** - "Run Audit" button in tab  
✅ **Toggle Per Client** - Agency controls who gets access  
✅ **Comprehensive Analysis** - All metrics analyzed  
✅ **Export to PDF** - Beautiful printable reports  
✅ **Cost Tracking** - Tokens and $ saved to database  
✅ **Cached Results** - Fast re-loading of previous audits  
✅ **Expandable Cards** - Click to see full details  

---

## 🎯 **Best Practices**

### **For Agencies:**
1. **Enable for premium clients first** to test value
2. **Run weekly audits** for active clients ($3-4/month for 10 clients)
3. **Export PDFs** for client meetings
4. **Monitor costs** in audit_results table

### **For Clients:**
1. **Run audit after major changes** (new flows, campaign strategy changes)
2. **Review high priority items** first
3. **Export PDF** to share with team
4. **Re-run monthly** to track improvements

---

## 💡 **Monetization Ideas**

**Charge for AI Insights:**
- Basic analytics: Free
- AI Audit: +$50/month per client
- Revenue: $500/month (10 clients)
- Cost: $3/month (weekly audits)
- **Profit: $497/month** 🚀

**Package It:**
- "Growth Package" includes AI Audit
- "Premium Analytics" with monthly AI reports
- "Strategy Sessions" using AI audit data

---

## 🔒 **Security & Privacy**

- API key stored in environment variables (never exposed)
- Audits stored in Supabase (secure, client-isolated)
- Row Level Security ensures clients only see their audits
- No data sent to Claude except anonymous metrics
- Client names/emails not included in prompts

---

## 📈 **Success Metrics to Track**

Monitor in `audit_results` table:
- Total audits run
- Average score per client
- Cost per audit
- Most common high-priority findings
- Client engagement (viewed_count)

```sql
-- Dashboard query
SELECT 
  c.brand_name,
  ar.overall_score,
  ar.grade,
  ar.high_priority_count,
  ar.api_cost_usd,
  ar.viewed_count,
  ar.audit_date
FROM audit_results ar
JOIN clients c ON c.id = ar.client_id
ORDER BY ar.audit_date DESC
LIMIT 20;
```

---

## 🎉 **You're All Set!**

The AI Audit Tab is now fully functional. Just:
1. Add `ANTHROPIC_API_KEY` to `.env.local`
2. Run database migration
3. Enable for clients
4. Run your first audit!

**This feature will set you apart from every other analytics dashboard!** 🚀

