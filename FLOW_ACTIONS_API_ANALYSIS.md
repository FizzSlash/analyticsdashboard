# 🔄 Flow Actions API - Current vs Future Setup

## 📊 CURRENT FLOW API SETUP

### **What You're Calling Now:**

#### **1. Get Flows (`/flows`)**
```typescript
// lib/klaviyo.ts line 218
async getFlows(cursor?: string)
```

**Returns:**
```json
{
  "data": [{
    "id": "RDsnuS",
    "type": "flow",
    "attributes": {
      "name": "Welcome Series",
      "status": "live",
      "trigger_type": "List"
    },
    "relationships": {
      "flow-actions": {
        "links": {
          "related": "https://a.klaviyo.com/api/flows/RDsnuS/flow-actions/" // ← YOU'RE NOT USING THIS!
        }
      }
    }
  }]
}
```

**What you get:**
- ✅ Flow ID
- ✅ Flow name
- ✅ Status (live/draft/archived)
- ✅ Trigger type
- ❌ NO flow structure
- ❌ NO email sequence
- ❌ NO delay timing

---

#### **2. Get Flow Analytics (`/flow-series-reports`)**
```typescript
// lib/klaviyo.ts line 737
async getFlowAnalytics(flowIds: string[], conversionMetricId: string | null)
```

**Returns:**
```json
{
  "data": {
    "type": "flow-series-report",
    "attributes": {
      "date_times": ["2024-10-21", "2024-10-28", ...],
      "results": [{
        "groupings": {
          "flow_id": "RDsnuS",
          "flow_message_id": "msg123"
        },
        "statistics": {
          "opens": [150, 142, 138, ...],
          "clicks": [45, 42, 40, ...],
          "revenue": [2500, 2300, 2100, ...]
        }
      }]
    }
  }
}
```

**What you get:**
- ✅ Weekly performance per email
- ✅ Opens, clicks, revenue
- ✅ Conversion data
- ❌ NO email subject lines
- ❌ NO email content
- ❌ NO sequence order
- ❌ NO timing between emails

---

### **Current Data Storage:**

**Tables:**
1. **flow_metrics** - One row per flow (aggregated totals)
2. **flow_message_metrics** - One row per email per week (time series)

**What's stored:**
```sql
flow_metrics:
- flow_id, flow_name, flow_status
- total revenue, opens, clicks
- open_rate, click_rate
- date_start, date_end

flow_message_metrics:
- flow_id, message_id
- week_date, revenue, opens, clicks
- subject_line (if available)
- performance data
```

**What's MISSING:**
- ❌ Email sequence order (Email 1, 2, 3, 4...)
- ❌ Delays between emails (Wait 24hr, 48hr, etc.)
- ❌ Conditional splits (IF opened, THEN send X)
- ❌ Trigger details (what starts the flow)
- ❌ Total emails in flow
- ❌ Action types (email vs delay vs split)

---

## 🚀 WITH FLOW-ACTIONS API

### **New API Call:**

```typescript
// Would add to lib/klaviyo.ts
async getFlowActions(flowId: string) {
  return this.makeRequest(`/flows/${flowId}/flow-actions/`)
}
```

**Returns:**
```json
{
  "data": [
    {
      "type": "flow-action",
      "id": "action-trigger-1",
      "attributes": {
        "action_type": "trigger",
        "status": "live",
        "tracking_options": {...},
        "settings": {
          "trigger": {
            "type": "list",
            "list_id": "XyZ123"
          }
        }
      }
    },
    {
      "type": "flow-action", 
      "id": "action-email-1",
      "attributes": {
        "action_type": "email",
        "status": "live",
        "settings": {
          "delay": {
            "type": "immediate"
          }
        }
      },
      "relationships": {
        "flow-message": {
          "data": {
            "id": "msg-abc-123"
          }
        }
      }
    },
    {
      "type": "flow-action",
      "id": "action-delay-1", 
      "attributes": {
        "action_type": "time_delay",
        "status": "live",
        "settings": {
          "delay": {
            "type": "delay",
            "value": 24,
            "unit": "hours"
          }
        }
      }
    },
    {
      "type": "flow-action",
      "id": "action-email-2",
      "attributes": {
        "action_type": "email",
        "status": "live"
      }
    },
    {
      "type": "flow-action",
      "id": "action-split-1",
      "attributes": {
        "action_type": "conditional_split",
        "status": "live",
        "settings": {
          "condition": {
            "type": "has_opened_email",
            "email_id": "msg-abc-123"
          }
        }
      }
    }
  ]
}
```

**What you'd get:**
- ✅ Complete flow structure
- ✅ Email sequence order
- ✅ Exact delays (24 hours, 2 days, etc.)
- ✅ Conditional logic (IF/THEN branches)
- ✅ Trigger configuration
- ✅ Action statuses (live/draft)
- ✅ Flow message IDs (link to content)

---

## 🎯 BEFORE vs AFTER

### **BEFORE (Current):**

```
Flow: Welcome Series
├─ ID: RDsnuS
├─ Status: Live
├─ Performance Data:
│  ├─ Email msg-1: 1,234 opens, $5,678 revenue
│  ├─ Email msg-2: 987 opens, $4,321 revenue
│  └─ Email msg-3: 654 opens, $2,109 revenue
└─ ❌ Unknown: sequence order, delays, structure
```

**What you DON'T know:**
- Which email is 1st, 2nd, 3rd?
- How long between emails?
- Are there conditional branches?
- What triggers the flow?

---

### **AFTER (With Flow-Actions):**

```
Flow: Welcome Series (RDsnuS)
│
├─ Trigger: Subscribed to List "Newsletter"
│
├─ 📧 Email 1: "Welcome!" (msg-1)
│   • Status: Live
│   • Delay: Immediate
│   • Performance: 1,234 opens, $5,678 revenue
│   ↓
├─ ⏱️ Wait: 24 hours
│   ↓
├─ 📧 Email 2: "Getting Started Guide" (msg-2)
│   • Status: Live  
│   • Delay: +1 day
│   • Performance: 987 opens, $4,321 revenue
│   ↓
├─ 🔀 Conditional Split: "Did they open Email 2?"
│   ├─ YES → Email 3A: "Advanced Tips"
│   └─ NO  → Email 3B: "Need Help?"
│   ↓
├─ ⏱️ Wait: 48 hours
│   ↓
└─ 📧 Email 3: "Special Offer" (msg-3)
    • Status: Live
    • Delay: +3 days  
    • Performance: 654 opens, $2,109 revenue
```

**What you NOW know:**
- ✅ Exact sequence (1 → 2 → 3)
- ✅ Timing (Immediate, +24hr, +72hr)
- ✅ Conditional logic (splits)
- ✅ Trigger type (List subscription)
- ✅ Total actions (7 actions in this flow)

---

## 🏗️ ARCHITECTURE CHANGES

### **Current Sync Flow:**

```
1. GET /flows
   ↓ Returns: Basic flow metadata
   
2. POST /flow-series-reports  
   ↓ Returns: Weekly performance data
   
3. Save to Database:
   ├─ flow_metrics (aggregated)
   └─ flow_message_metrics (weekly)
```

**APIs called:** 2
**Data depth:** Performance only
**What's missing:** Flow structure

---

### **With Flow-Actions:**

```
1. GET /flows
   ↓ Returns: Basic flow metadata
   
2. POST /flow-series-reports
   ↓ Returns: Weekly performance data
   
3. GET /flows/{id}/flow-actions  ← NEW!
   ↓ Returns: Complete flow structure
   
4. Save to Database:
   ├─ flow_metrics (aggregated)
   ├─ flow_message_metrics (weekly)
   └─ flow_actions (NEW TABLE - structure)
```

**APIs called:** 3 (one extra per flow)
**Data depth:** Performance + Structure
**What's added:** Complete flow diagram

---

## 📊 NEW DATABASE TABLE

### **Would Create:**

```sql
CREATE TABLE flow_actions (
    id UUID PRIMARY KEY,
    client_id UUID REFERENCES clients(id),
    flow_id TEXT NOT NULL,
    action_id TEXT NOT NULL,
    
    -- Action details
    action_type TEXT, -- 'email', 'time_delay', 'conditional_split', 'trigger'
    action_status TEXT, -- 'live', 'draft', 'archived'
    sequence_order INTEGER, -- 1, 2, 3, 4... (our calculated order)
    
    -- Delay information
    delay_type TEXT, -- 'immediate', 'delay'
    delay_value INTEGER, -- 24, 48, etc.
    delay_unit TEXT, -- 'hours', 'days'
    cumulative_delay_hours INTEGER, -- 0, 24, 72, 168... (for timeline)
    
    -- Email reference
    flow_message_id TEXT, -- Links to flow_message_metrics
    
    -- Conditional logic
    condition_type TEXT, -- 'has_opened_email', 'has_clicked', etc.
    condition_target TEXT, -- Reference to what it's checking
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(client_id, flow_id, action_id)
);
```

---

## 🔄 SYNC PROCESS CHANGES

### **Current:**

```typescript
syncFlows() {
  1. Get flows list → 27 flows
  2. Get analytics for all 27 → performance data
  3. Save to 2 tables
  
  Time: ~30 seconds
  API calls: 2
}
```

---

### **With Flow-Actions:**

```typescript
syncFlows() {
  1. Get flows list → 27 flows
  2. Get analytics for all 27 → performance data
  3. For each flow:
     ├─ Get flow-actions → structure
     └─ Parse sequence order & delays
  4. Save to 3 tables
  
  Time: ~2-3 minutes (27 extra API calls)
  API calls: 29 (2 + 27 individual)
  Rate limiting: Need delays between calls
}
```

**Optimization:**
- Could batch/parallelize
- Cache flow-actions (structure rarely changes)
- Only fetch on flow update

---

## 💡 WHAT THIS ENABLES

### **1. Flow Visualization**

**Current:**
```
Welcome Series
- 3 emails
- $12,345 revenue
```

**With Actions:**
```
Welcome Series
├─ Trigger: Subscribed to "Newsletter" list
├─ 📧 Welcome Email (Immediate)
├─ ⏱️ Wait 24 hours
├─ 📧 Getting Started (+1 day)
├─ ⏱️ Wait 48 hours  
└─ 📧 Special Offer (+3 days)

Timeline: 0hr → 24hr → 72hr
Total: 3 emails, 2 delays
```

---

### **2. Flow Comparison (ENHANCED)**

**Current:**
```
Flow A vs Flow B
Revenue: $45k vs $52k
Open Rate: 68% vs 72%
```

**With Actions:**
```
Flow A vs Flow B

Structure:
Flow A: Trigger → Email 1 → 48hr → Email 2 → 48hr → Email 3
Flow B: Trigger → Email 1 → 24hr → Email 2 → 24hr → Email 3

Insight: Flow B follows up FASTER (24hr vs 48hr)
This explains higher engagement!

Performance:
Email 1: 75% OR vs 78% OR (B faster = better!)
Email 2: 42% OR vs 48% OR (B maintains momentum)
Email 3: 28% OR vs 32% OR (B still leading)

Recommendation: Shorten Flow A delays from 48hr to 24hr
```

---

### **3. Flow Optimization Insights**

**Current (Limited):**
```
"Email 2 has low open rate"
↓ What can you do? 🤷
```

**With Actions (Actionable):**
```
"Email 2 has low open rate (42%)"
├─ Sent at: +48 hours after Email 1
├─ Best practice: Send at +24 hours
└─ Recommendation: Reduce delay from 48hr to 24hr

Expected impact: +15% engagement (based on industry data)
```

---

### **4. Message-Level Context**

**Current:**
```
Message ID: msg-abc-123
Opens: 1,234
Clicks: 456
Revenue: $5,678
```

**With Actions:**
```
Message ID: msg-abc-123
Position: Email 2 of 4
Trigger delay: +24 hours from Email 1
Opens: 1,234 (42% OR - LOW for position 2)
Clicks: 456 (3.2% CTR)
Revenue: $5,678

Context: This is the first follow-up email
Typical OR for Email 2: 50-60%
Possible issues:
- Too long delay? (24hr might be too slow)
- Subject line weak?
- Sent at wrong time?
```

---

## 📈 DATA COMPARISON

### **Current Data Structure:**

```javascript
flow = {
  flow_id: "RDsnuS",
  flow_name: "Welcome Series",
  flow_status: "live",
  revenue: 12345,
  opens: 3456,
  
  // Just numbers, no context
  messages: [
    { message_id: "msg1", revenue: 5678 },
    { message_id: "msg2", revenue: 4321 },
    { message_id: "msg3", revenue: 2346 }
  ]
}
```

**Question:** Which message is first? 🤷
**Answer:** You don't know!

---

### **With Flow-Actions:**

```javascript
flow = {
  flow_id: "RDsnuS",
  flow_name: "Welcome Series",
  flow_status: "live",
  revenue: 12345,
  opens: 3456,
  
  // Structured sequence
  actions: [
    {
      sequence: 1,
      type: "trigger",
      trigger_type: "List Subscription"
    },
    {
      sequence: 2,
      type: "email",
      message_id: "msg1",
      delay: "immediate",
      cumulative_hours: 0,
      revenue: 5678
    },
    {
      sequence: 3,
      type: "time_delay",
      delay_hours: 24
    },
    {
      sequence: 4,
      type: "email",
      message_id: "msg2",
      delay: "+24 hours",
      cumulative_hours: 24,
      revenue: 4321
    },
    {
      sequence: 5,
      type: "time_delay",
      delay_hours: 48
    },
    {
      sequence: 6,
      type: "email",
      message_id: "msg3",
      delay: "+72 hours",
      cumulative_hours: 72,
      revenue: 2346
    }
  ]
}
```

**Question:** Which message is first?
**Answer:** Email msg1, sent immediately!

**Question:** When does msg2 send?
**Answer:** 24 hours after msg1!

---

## ⚡ PERFORMANCE IMPACT

### **Current Sync Time:**
```
27 flows × 2 API calls = 54 total calls
├─ 1 call: Get all flows (paginated)
└─ 1 call: Get analytics for ALL flows (batch)

Time: ~30 seconds
```

---

### **With Flow-Actions:**
```
27 flows × 3 API calls = 81 total calls
├─ 1 call: Get all flows (paginated)
├─ 1 call: Get analytics for ALL flows (batch)
└─ 27 calls: Get actions for EACH flow (individual)

Time: ~3 minutes (with rate limit delays)
```

**Optimization strategies:**
1. **Cache flow-actions** - Structure changes rarely
2. **Only fetch on flow update** - Check `updated_at` timestamp
3. **Parallel requests** - Batch 5 at a time
4. **Background job** - Sync actions separately from performance

---

## 🎯 RECOMMENDED IMPLEMENTATION

### **Phase 1: API & Storage**
- [ ] Add `getFlowActions()` method to `KlaviyoAPI`
- [ ] Create `flow_actions` table
- [ ] Add sync logic (with rate limiting)
- [ ] Store action sequence and delays

### **Phase 2: Data Processing**
- [ ] Parse action types
- [ ] Calculate sequence order
- [ ] Compute cumulative delays
- [ ] Link actions to messages

### **Phase 3: UI Display**
- [ ] Flow structure diagram
- [ ] Timeline visualization
- [ ] Enhanced comparison view
- [ ] Optimization recommendations

---

## 📊 USE CASES UNLOCKED

### **1. "Why is Email 2 underperforming?"**

**Current answer:**
"Email 2 has 42% open rate vs 75% for Email 1"

**With Actions:**
"Email 2 sends +48 hours after Email 1
Industry best practice: +24 hours
Your delay is 2x too long
→ Reduce to 24hr for +15% engagement lift"

---

### **2. "Which flow structure works best?"**

**Current:**
Can't answer - don't have structure data

**With Actions:**
```
Flow A: Immediate → 48hr → 96hr (slow follow-up)
Performance: 68% OR, $45k revenue

Flow B: Immediate → 24hr → 48hr (faster follow-up)
Performance: 72% OR, $52k revenue

Conclusion: Faster follow-up = better results
Apply Flow B's timing to Flow A
```

---

### **3. "Is my flow set up correctly?"**

**Current:**
Can only show performance numbers

**With Actions:**
```
✅ Trigger configured correctly
✅ Email 1 sends immediately
⚠️ Email 2 has 48hr delay (recommend 24hr)
❌ Email 3 is in Draft status (not live!)
⚠️ No conditional split after Email 2 (missing opportunity)
```

---

## 💰 COST/BENEFIT

### **Costs:**
- Extra API calls (27 per sync)
- Longer sync time (+2 minutes)
- More database storage (small - just metadata)
- Development time (1-2 days to implement)

### **Benefits:**
- Complete flow understanding
- Better optimization recommendations
- Enhanced comparison tool
- Flow health monitoring
- Actionable insights

### **ROI:**
If this helps you optimize even ONE flow delay:
- Flow revenue: $50k/month
- 10% improvement from timing fix = +$5k/month
- Return: $60k/year from one optimization!

**Worth it? Absolutely!**

---

## 🚀 RECOMMENDATION

**Build it in 2 phases:**

**Phase 1 (MVP - 1 day):**
- Fetch flow-actions for each flow
- Store in database
- Display basic sequence on Flow tab
- Show email order and delays

**Phase 2 (Full - 1 day):**
- Add to Flow Comparison
- Timeline visualization
- Optimization recommendations
- Conditional split support

**Total effort: 2 days**
**Value: Massive** (complete flow visibility)

---

Want me to start building Phase 1? 🚀

