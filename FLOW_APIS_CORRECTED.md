# 🔄 Flow APIs - What You're ACTUALLY Calling (Corrected)

## ✅ CURRENT SETUP (What You Have)

### **API Calls During Flow Sync:**

#### **1. GET /flows**
```typescript
// lib/klaviyo.ts line 218
getFlows()
```
**Returns:** Flow metadata (name, status, ID, trigger_type)

---

#### **2. POST /flow-series-reports** 
```typescript
// lib/klaviyo.ts line 737
getFlowAnalytics(flowIds, conversionMetricId)
```
**Returns:** Weekly performance data for each email
- Opens, clicks, revenue per week
- **Includes:** `flow_message_id` for each email

---

#### **3. GET /flow-messages/{id}** ✅ **YOU HAVE THIS!**
```typescript
// lib/klaviyo.ts line 242
getFlowMessages(messageIds)
```
**Returns:** Email content for each message
- Subject line
- Preview text
- From email
- Channel
- Created/updated dates

**Found in:** 
- `components/agency/client-management.tsx` line 951
- `app/api/klaviyo-proxy/flow-messages/route.ts`

---

## 📊 WHAT YOU CURRENTLY GET

**For each flow, you have:**

```javascript
Flow: "Welcome Series" (ID: RDsnuS)
├─ Metadata: name, status, trigger_type
├─ Performance (weekly):
│  ├─ Message msg-1: 1,234 opens, $5,678 revenue
│  ├─ Message msg-2: 987 opens, $4,321 revenue  
│  └─ Message msg-3: 654 opens, $2,109 revenue
└─ Message Content:
   ├─ msg-1: Subject: "Welcome!", Preview: "Get started..."
   ├─ msg-2: Subject: "Your Guide", Preview: "Here's how..."
   └─ msg-3: Subject: "Special Offer", Preview: "Save 20%..."
```

**Pretty good!** You have performance AND content.

---

## ❌ WHAT YOU'RE STILL MISSING

**The big gap: SEQUENCE & TIMING**

You DON'T know:
1. **Which email is first?** (msg-1, msg-2, or msg-3?)
2. **What are the delays?** (24hr? 48hr? 1 week?)
3. **Order of execution** (Does msg-2 come before or after msg-3?)
4. **Conditional logic** (Are there IF/THEN branches?)
5. **Total action count** (3 emails + 2 delays = 5 actions?)

**Example problem:**
```
You see:
- msg-1: Subject "Welcome!" - 1,234 opens
- msg-2: Subject "Your Guide" - 987 opens  
- msg-3: Subject "Special Offer" - 654 opens

Question: Is msg-3's low performance because it's:
A) Email 3 (natural drop-off)
B) Email 1 with bad subject
C) Email 2 sent too soon

Answer: You don't know! 🤷
```

---

## 🎯 WHAT FLOW-ACTIONS ADDS

**The missing piece: FLOW STRUCTURE**

```typescript
GET /flows/{flowId}/flow-actions/
```

**Returns:**
```json
{
  "data": [
    {
      "type": "flow-action",
      "id": "01",
      "attributes": {
        "action_type": "trigger"
      }
    },
    {
      "type": "flow-action",
      "id": "02",
      "attributes": {
        "action_type": "email",
        "delay": { "type": "immediate" }
      },
      "relationships": {
        "flow-message": {
          "data": { "id": "msg-1" }  // ← Links to your message data!
        }
      }
    },
    {
      "type": "flow-action",
      "id": "03",
      "attributes": {
        "action_type": "time_delay",
        "delay": { "value": 24, "unit": "hours" }  // ← THE TIMING!
      }
    },
    {
      "type": "flow-action",
      "id": "04",
      "attributes": {
        "action_type": "email"
      },
      "relationships": {
        "flow-message": {
          "data": { "id": "msg-2" }
        }
      }
    },
    {
      "type": "flow-action",
      "id": "05",
      "attributes": {
        "action_type": "time_delay",
        "delay": { "value": 48, "unit": "hours" }
      }
    },
    {
      "type": "flow-action",
      "id": "06",
      "attributes": {
        "action_type": "email"
      },
      "relationships": {
        "flow-message": {
          "data": { "id": "msg-3" }
        }
      }
    }
  ]
}
```

**This tells you:**
- Action 02: Email msg-1 (FIRST - immediate)
- Action 03: Wait 24 hours
- Action 04: Email msg-2 (SECOND - at +24hr)
- Action 05: Wait 48 hours  
- Action 06: Email msg-3 (THIRD - at +72hr)

**NOW you can answer:**
```
msg-3 performs worst because:
✓ It's Email 3 (natural drop-off)
✓ Sent at +72 hours (3 days delay)
✓ Only 53% of Email 1 recipients still engaged

Recommendation: Consider reducing to +48hr total
```

---

## 🔄 COMPLETE DATA FLOW

### **What You'd Have:**

```javascript
{
  // From GET /flows
  flow_id: "RDsnuS",
  flow_name: "Welcome Series",
  flow_status: "live",
  trigger_type: "List",
  
  // From POST /flow-series-reports
  performance: {
    "msg-1": { opens: 1234, revenue: 5678 },
    "msg-2": { opens: 987, revenue: 4321 },
    "msg-3": { opens: 654, revenue: 2109 }
  },
  
  // From GET /flow-messages/{id}
  messages: {
    "msg-1": { 
      subject: "Welcome!",
      preview: "Get started...",
      from_email: "hello@brand.com"
    },
    "msg-2": {
      subject: "Your Guide",
      preview: "Here's how...",
      from_email: "hello@brand.com"
    },
    "msg-3": {
      subject: "Special Offer",
      preview: "Save 20%...",
      from_email: "hello@brand.com"
    }
  },
  
  // From GET /flows/{id}/flow-actions ← NEW!
  sequence: [
    { 
      order: 1, 
      type: "trigger",
      trigger: "List Subscription"
    },
    { 
      order: 2, 
      type: "email", 
      message_id: "msg-1",
      delay: "immediate",
      cumulative_hours: 0,
      // Links to messages & performance above!
      subject: "Welcome!",
      opens: 1234,
      revenue: 5678
    },
    { 
      order: 3, 
      type: "delay", 
      hours: 24 
    },
    { 
      order: 4, 
      type: "email", 
      message_id: "msg-2",
      delay: "+24 hours",
      cumulative_hours: 24,
      subject: "Your Guide",
      opens: 987,
      revenue: 4321
    },
    { 
      order: 5, 
      type: "delay", 
      hours: 48 
    },
    { 
      order: 6, 
      type: "email", 
      message_id: "msg-3",
      delay: "+72 hours",
      cumulative_hours: 72,
      subject: "Special Offer",
      opens: 654,
      revenue: 2109
    }
  ]
}
```

**Complete picture!** Performance + Content + Structure

---

## 🎯 WHAT CHANGES

### **Before:**
You have **separate pieces**:
- Performance data (which message has what revenue)
- Message content (subject lines)
- ❌ NO connection between them
- ❌ NO sequence order

### **After:**
You have **complete story**:
- Performance + Content + **Structure**
- Know which email is 1st, 2nd, 3rd
- Know exact delays
- Can build timeline
- Can optimize timing

---

## 💡 THE ONE NEW API CALL

**Just add:**
```typescript
// lib/klaviyo.ts
async getFlowActions(flowId: string) {
  return this.makeRequest(`/flows/${flowId}/flow-actions/`)
}
```

**Call it during sync:**
```typescript
// After getting flow messages
const actions = await klaviyo.getFlowActions(flow.id)
```

**Save to database:**
```sql
INSERT INTO flow_actions (
  flow_id, 
  action_type, 
  sequence_order, 
  delay_hours,
  message_id
) VALUES ...
```

---

## 🚀 IMPLEMENTATION EFFORT

**Changes needed:**
1. Add `getFlowActions()` method (10 lines)
2. Create `flow_actions` table (SQL script)
3. Update sync to call it (20 lines)
4. Parse and store actions (50 lines)
5. Join with messages for display (30 lines)

**Total: ~2 hours of coding**

**Value: Unlocks complete flow visibility!**

---

Want me to implement it? It's a small change with huge impact! 🚀

