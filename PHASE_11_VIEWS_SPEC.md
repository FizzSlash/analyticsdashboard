# Phase 11: Role Views - Final Specification

**Goal:** ONE "View" tab with dropdown to switch between 5 helpful dashboards  
**Access:** Everyone can see all views (no restrictions)  
**Purpose:** Different perspectives on the same data

---

## 🎯 The 5 Views:

### **1. Overview (Production Board)** - Default View

**Shows:**
```
This Week Production Stats:
├── Campaigns Written: 12 (Hydrus: 5, Peak: 4, Make Waves: 3)
├── Campaigns Designed: 10 (Hydrus: 4, Peak: 4, Make Waves: 2)
├── Flows Written: 2 (Hydrus: 1, Peak: 1)
└── Flows Designed: 1 (Hydrus: 1)

Progress Bars by Client:
Hydrus       ████████ 8 campaigns  ██ 1 flow
Peak Design  ███████  7 campaigns  █  1 flow  
Make Waves   ████     4 campaigns  -  0 flows

Needs Attention:
• 3 campaigns in Design (need design work)
• 2 flows in Client Approval (waiting for response)
• 1 campaign past due (Black Friday)
```

### **2. Copywriter View**

**Shows:**
```
My Writing Queue:
├── Campaigns Awaiting Copy (5)
│   • Black Friday Email - Hydrus - Due Nov 20
│   • Newsletter - Peak Design - Due Nov 22
│   [Quick access to copy notes, brand voice, key phrases]
│
├── Flows Awaiting Copy (2)
│   • Welcome Flow Update - Hydrus
│   [Quick access to flow strategy docs]
│
└── Completed This Week: 7 campaigns, 1 flow
```

**Quick Links:**
- Copy Notes (all clients)
- Brand Guidelines
- Forms responses (for reference)

### **3. Designer View**

**Shows:**
```
My Design Queue:
├── Campaigns Awaiting Design (6)
│   • Product Launch - Make Waves - Due Nov 21
│   [View Copy Doc] [Brand Guidelines] [Upload Design]
│
├── Flows Awaiting Design (1)
│   • Abandoned Cart - Peak Design
│
└── Completed This Week: 8 campaigns, 1 flow
```

**Quick Links:**
- Design Notes (all clients)
- Brand Assets (Figma links, color palettes)
- File uploads

### **4. Implementor View**

**Shows:**
```
Ready to Schedule in Klaviyo:
├── Campaigns Approved (5)
│   • Black Friday - Hydrus - Send Nov 24, 9am
│   [View Design] [Mark as Scheduled] [Add Klaviyo ID]
│
├── Flows Ready to Build (2)
│   • Welcome Series Update - Hydrus
│   [View Design] [Mark as Live]
│
└── Currently Live: 12 campaigns, 4 flows
```

**Quick Links:**
- Klaviyo (external)
- Campaign previews
- Flow diagrams

### **5. Project Manager View**

**Shows:**
```
Handoff Tracker:
├── Pending Handoffs
│   • Copy → Design: 3 campaigns ready for design
│   • Design → QA: 2 campaigns have images uploaded
│   • QA → Client: 1 campaign ready for client approval
│
├── Client Approvals Pending (4)
│   • 2 campaigns awaiting approval (sent 2 days ago)
│   • 1 flow awaiting approval (sent 1 day ago)
│   [Send Reminder]
│
├── Past Due Items (2)
│   • Holiday Campaign - should have sent yesterday
│   • Newsletter - overdue by 3 days
│
└── Status Overview
    Strategy: 5 | Copy: 8 | Design: 6 | QA: 3 | Client: 4 | Live: 20
```

**Quick Links:**
- All campaigns (filter view)
- All flows (filter view)
- Scope tracking

---

## 🎨 UI Design:

```
┌──────────────────────────────────────────────────────────────┐
│ View Tab                                                     │
├──────────────────────────────────────────────────────────────┤
│ Select View: [Overview ▼]                                    │
│ Options:                                                     │
│   • Overview (Production Board)                             │
│   • Copywriter                                              │
│   • Designer                                                │
│   • Implementor                                             │
│   • Project Manager                                         │
└──────────────────────────────────────────────────────────────┘

[Content changes based on selection]
```

**Everyone** can switch between views - useful for:
- Copywriters checking design queue
- Designers seeing PM view
- PMs checking copywriter workload
- Cross-functional visibility

---

## 📊 Estimated Time:

**All 5 Views:** 3-4 hours  
**Just Overview:** 1 hour

**OR** Save for next session after database integration (when data is real)

---

## ✅ TODAY'S ACCOMPLISHMENT:

**69 TASKS COMPLETE:**
- All 10 phases built
- Production-ready OS
- Ready for database

**Views can be Phase 12 if you want to do database first!**

---

**Want me to build Views now, or stop here and do database integration next session?** 🎯

