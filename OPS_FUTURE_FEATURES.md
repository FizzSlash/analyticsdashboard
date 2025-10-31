# 🚀 Operations Dashboard - Future Features

**Date:** October 31, 2025  
**Status:** UI Complete - Future Enhancements Planned

---

## 🎯 Priority Features for Next Phase

### **1. Role-Based View Tabs (High Priority)**

**Concept:** Add a "View" tab that shows different perspectives based on team role

#### **View Tab Structure:**
```
Overview | Campaigns | Flows | View | Content Hub | Scope
                              ↑ NEW TAB
```

#### **Sub-tabs within View:**
```
View Tab:
├── Writer's View
├── Designer's View  
├── Implementor's View
└── QA / Management View
```

---

### **Writer's View**

**Purpose:** Show copywriters what needs their attention

**Widgets:**
```
┌─────────────────────────────────────────────────────┐
│ Campaigns Awaiting Copy (Status: "copy")            │
├─────────────────────────────────────────────────────┤
│ • Black Friday Email - Hydrus - Due Nov 20          │
│ • Welcome Series - Peak Design - Due Nov 22         │
│ • Product Launch - Make Waves - Due Nov 25          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Flows Awaiting Copy (Status: "copy")                │
├─────────────────────────────────────────────────────┤
│ • Abandoned Cart Flow - Hydrus - Due Dec 1          │
│ • Post-Purchase Flow - Peak Design - Due Dec 5      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ My Completed This Week                              │
├─────────────────────────────────────────────────────┤
│ Campaigns: 5 | Flows: 2 | Total: 7                  │
└─────────────────────────────────────────────────────┘
```

**Filters:**
- My assigned campaigns
- Urgent first
- Sortable by due date

---

### **Designer's View**

**Purpose:** Show designers what needs design work

**Widgets:**
```
┌─────────────────────────────────────────────────────┐
│ Campaigns Awaiting Design (Status: "design")        │
├─────────────────────────────────────────────────────┤
│ • Holiday Sale - Hydrus - Due Nov 21                │
│   [View Copy Doc] → links to Google Doc             │
│                                                     │
│ • Newsletter - Peak Design - Due Nov 23             │
│   [View Copy Doc]                                   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Awaiting Design QA (Status: "design_qa")            │
├─────────────────────────────────────────────────────┤
│ • Black Friday - Hydrus                             │
│   [View Design] [Send to QA] [Send Back to Design]  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ My Completed This Week                              │
├─────────────────────────────────────────────────────┤
│ Campaigns: 8 | Flows: 1 | Total: 9                  │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Quick access to copy docs
- One-click upload design
- Mark as complete → moves to Design QA

---

### **Implementor's View**

**Purpose:** Show implementors what needs to be built in Klaviyo

**Widgets:**
```
┌─────────────────────────────────────────────────────┐
│ Ready to Schedule (Status: "approved")              │
├─────────────────────────────────────────────────────┤
│ • Product Launch - Make Waves - Send Nov 25         │
│   [View Design] [Mark as Scheduled]                 │
│                                                     │
│ • Flash Sale - Hydrus - Send Nov 26                 │
│   [View Design] [Mark as Scheduled]                 │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Scheduled (Status: "scheduled")                     │
├─────────────────────────────────────────────────────┤
│ • Black Friday - Hydrus - Nov 24, 9:00 AM           │
│   Klaviyo ID: abc123 [View in Klaviyo]             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Flows Ready to Build                                │
├─────────────────────────────────────────────────────┤
│ • Welcome Flow Update - Peak Design                 │
│ • Abandoned Cart - Hydrus                           │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Direct links to Klaviyo
- Mark as scheduled with one click
- Add Klaviyo campaign ID
- Track what's in Klaviyo

---

### **QA / Management View** ⭐

**Purpose:** Review all work before client sees it

#### **Campaigns Section:**
```
┌─────────────────────────────────────────────────────┐
│ Campaigns Written (Status: "copy" → "design")       │
├─────────────────────────────────────────────────────┤
│ Hydrus:        3 campaigns                          │
│ Peak Design:   2 campaigns                          │
│ Make Waves:    1 campaign                           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Campaigns Designed (Status: "design" → "design_qa") │
├─────────────────────────────────────────────────────┤
│ Hydrus:        4 campaigns                          │
│ Peak Design:   3 campaigns                          │
│ Make Waves:    2 campaigns                          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Awaiting QA Review (Status: "design_qa")            │
├─────────────────────────────────────────────────────┤
│ • Black Friday - Hydrus                             │
│   [View Image] [Approve] [Send to Copy] [Send to Design] │
│   Revisions: _______________________________        │
│   [Save Revisions]                                  │
│                                                     │
│ • Product Launch - Make Waves                       │
│   [View Image] [Approve] [Send to Copy] [Send to Design] │
└─────────────────────────────────────────────────────┘
```

#### **Flows Section:**
```
┌─────────────────────────────────────────────────────┐
│ Flows Written                                       │
├─────────────────────────────────────────────────────┤
│ Hydrus:        1 flow (3 emails)                    │
│ Peak Design:   1 flow (5 emails)                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Flows Designed                                      │
├─────────────────────────────────────────────────────┤
│ Hydrus:        2 flows (8 emails total)             │
│ Make Waves:    1 flow (4 emails)                    │
└─────────────────────────────────────────────────────┘
```

**QA Actions:**
- **Approve** → Moves to "qa" (final QA) → "client_approval"
- **Send to Copy** → Moves back to "copy" with revision notes
- **Send to Design** → Moves back to "design" with revision notes
- **Revision Notes** → Attached to campaign, visible to team

---

## 🔄 Updated Status Workflow

### **Old Workflow (Current):**
```
Strategy → Copy → Design → QA → Client Approval → Approved → Scheduled → Sent
```

### **New Workflow (With Design QA):**
```
Strategy → Copy → Design → Design QA → QA → Client Approval → Approved → Scheduled → Sent
                             ↑ NEW
```

**Design QA Stage:**
- **Purpose:** Internal design review before final QA
- **Who:** Design team lead or QA team
- **What:** Review uploaded design image
- **Actions:**
  - Approve → Moves to QA
  - Request copy changes → Back to Copy with notes
  - Request design changes → Back to Design with notes

**Database Update Needed:**
```sql
-- Add new status option
ALTER TABLE ops_campaigns 
DROP CONSTRAINT IF EXISTS ops_campaigns_status_check;

ALTER TABLE ops_campaigns
ADD CONSTRAINT ops_campaigns_status_check
CHECK (status IN (
  'strategy', 
  'copy', 
  'design', 
  'design_qa',  -- NEW STATUS
  'qa', 
  'client_approval', 
  'approved', 
  'scheduled', 
  'sent'
));

-- Add revision tracking
ALTER TABLE ops_campaigns
ADD COLUMN qa_revisions TEXT;
ADD COLUMN revision_count INTEGER DEFAULT 0;
```

---

## 🎨 UI Implementation Notes

### **View Tab Layout:**
```tsx
<div className="space-y-6">
  {/* Role View Selector */}
  <div className="flex gap-2 p-1 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20">
    <button>Writer's View</button>
    <button>Designer's View</button>
    <button>Implementor's View</button>
    <button className="active">QA / Management View</button>
  </div>

  {/* View-Specific Content */}
  {activeView === 'qa' && <QAManagementView />}
  {activeView === 'writer' && <WriterView />}
  {activeView === 'designer' && <DesignerView />}
  {activeView === 'implementor' && <ImplementorView />}
</div>
```

### **QA Review Modal:**
```tsx
<CampaignQAModal>
  {/* Left: Campaign Details */}
  <div>
    Campaign: Black Friday Launch
    Client: Hydrus
    Status: Design QA
    
    [View Copy Doc] [View Design File]
  </div>

  {/* Right: Image Preview */}
  <div>
    <img src={campaign.preview_url} />
  </div>

  {/* Bottom: QA Actions */}
  <div>
    <textarea placeholder="Revision notes (optional)..." />
    
    <button>✅ Approve (Move to QA)</button>
    <button>✏️ Send to Copy (with notes)</button>
    <button>🎨 Send to Design (with notes)</button>
  </div>
</CampaignQAModal>
```

---

## 📊 Metrics for QA/Management View

### **Production Velocity:**
```
This Week:
├── Campaigns Written: 12
├── Campaigns Designed: 10
├── Campaigns QA'd: 8
├── Campaigns Approved: 7
└── Campaigns Sent: 6

Average Time Per Stage:
├── Copy: 2.3 days
├── Design: 1.8 days
├── QA: 0.5 days
└── Client Approval: 1.2 days
```

### **Quality Metrics:**
```
Revision Rates:
├── Copy revisions: 15% (2 of 12)
├── Design revisions: 20% (2 of 10)
└── Client revisions: 10% (1 of 10)

First-Time Approval Rate: 75%
```

---

## 🗂️ Database Schema Updates

### **Add Revision Tracking:**
```sql
CREATE TABLE ops_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES ops_campaigns(id),
  
  -- Revision Details
  revision_type TEXT CHECK (revision_type IN ('copy', 'design', 'qa')),
  requested_by_user_id UUID REFERENCES user_profiles(id),
  requested_by_name TEXT,
  
  -- What needs to change
  revision_notes TEXT NOT NULL,
  
  -- Status
  previous_status TEXT,
  sent_back_to_status TEXT,  -- Where it's going back to
  
  -- Resolution
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES user_profiles(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ops_revisions_campaign ON ops_revisions(campaign_id, resolved);
```

### **Track Who's Assigned:**
```sql
ALTER TABLE ops_campaigns
ADD COLUMN assigned_copywriter UUID REFERENCES user_profiles(id);
ADD COLUMN assigned_designer UUID REFERENCES user_profiles(id);
ADD COLUMN assigned_implementor UUID REFERENCES user_profiles(id);
ADD COLUMN qa_reviewed_by UUID REFERENCES user_profiles(id);
ADD COLUMN qa_reviewed_at TIMESTAMP WITH TIME ZONE;
```

---

## 🎯 Implementation Priority

### **Phase 6 (After Database Integration):**
1. Add "Design QA" status to dropdown
2. Add QA review modal (approve/send back with notes)
3. Track revisions

### **Phase 7 (Role Views):**
1. Add "View" tab
2. Build Writer's View component
3. Build Designer's View component
4. Build Implementor's View component
5. Build QA/Management View component

### **Phase 8 (Advanced Metrics):**
1. Calculate production velocity
2. Track revision rates
3. Show team performance metrics
4. Generate reports

---

## 💡 Quick Actions for Each View

### **Writer's View Quick Actions:**
```
[Mark Copy Complete]  → Moves to Design
[Request Strategy Clarification]  → Back to Strategy
[Upload Copy Doc]  → Attach Google Doc link
```

### **Designer's View Quick Actions:**
```
[Mark Design Complete]  → Moves to Design QA
[Request Copy Changes]  → Back to Copy
[Upload Design Files]  → Attach Figma + image
```

### **QA View Quick Actions:**
```
[Approve for Client]  → Moves to Client Approval
[Request Copy Revision]  → Back to Copy with notes
[Request Design Revision]  → Back to Design with notes
```

### **Implementor View Quick Actions:**
```
[Mark as Scheduled]  → Add Klaviyo ID
[Mark as Sent]  → Trigger analytics sync
[View in Klaviyo]  → Open Klaviyo campaign
```

---

## 📝 Notes Section

### **Design QA Status Details:**

**When to Use:**
- After designer uploads campaign image
- Before sending to final QA team
- For internal design review

**Who Reviews:**
- Design team lead
- Creative director
- QA manager

**What They Check:**
- Design follows brand guidelines
- Image quality acceptable
- CTAs prominent
- Mobile responsive (if preview shows)
- Copy matches design

**Possible Outcomes:**
1. **Approve** → Move to "QA" (final review)
2. **Send to Copy** → Copy needs adjustments
3. **Send to Design** → Design needs fixes

**Revision Notes Examples:**
- "CTA button too small, needs to be more prominent"
- "Hero image doesn't match brand colors"
- "Subject line got cut off, need to adjust copy"
- "Missing disclaimer at bottom"

---

## 🔗 Integration with Activity Log

**When revision requested:**
```typescript
// Create activity log entry
INSERT INTO ops_activity (
  campaign_id,
  activity_type,
  description,
  old_value,
  new_value,
  user_name
) VALUES (
  campaign.id,
  'revision_requested',
  'QA requested design changes',
  'design_qa',
  'design',
  'Sarah (QA)'
);

// Create revision record
INSERT INTO ops_revisions (
  campaign_id,
  revision_type,
  revision_notes,
  previous_status,
  sent_back_to_status,
  requested_by_user_id
) VALUES (
  campaign.id,
  'design',
  'CTA button too small, needs to be more prominent',
  'design_qa',
  'design',
  current_user_id
);
```

---

## 📊 Metrics to Add to QA/Management View

### **Production Stats:**
```tsx
<div className="grid grid-cols-4 gap-4">
  <StatCard 
    title="Campaigns Written"
    value={campaignsWritten}
    subtitle="Completed copy this week"
    color="blue"
  />
  <StatCard 
    title="Campaigns Designed"
    value={campaignsDesigned}
    subtitle="Design completed this week"
    color="purple"
  />
  <StatCard 
    title="Flows Written"
    value={flowsWritten}
    subtitle="Flow copy completed"
    color="green"
  />
  <StatCard 
    title="Flows Designed"
    value={flowsDesigned}
    subtitle="Flow designs completed"
    color="orange"
  />
</div>
```

### **Quality Dashboard:**
```tsx
<Card>
  <CardHeader>Quality Metrics</CardHeader>
  <CardContent>
    First-Time Approval Rate: 85%
    ──────────────────────────
    Copy Revision Rate: 12%
    Design Revision Rate: 18%
    Client Revision Rate: 8%
    
    Top Issues:
    • CTA placement (5 instances)
    • Mobile formatting (3 instances)
    • Copy length (2 instances)
  </CardContent>
</Card>
```

---

## 🚀 When to Build This

**Recommended Timeline:**
1. **Now:** Complete current UI with database integration
2. **Week 2:** Add Design QA status and basic QA modal
3. **Week 3:** Build View tab with role perspectives
4. **Week 4:** Add metrics and reporting

**Why Wait:**
- Get the core workflow working first
- Gather real usage data
- See what team actually needs
- Avoid over-engineering

**Building Blocks Already in Place:**
- ✅ Campaign modal architecture
- ✅ Status filtering
- ✅ Activity logging structure
- ✅ Clean tab system
- ✅ Can easily add new tabs/views

---

## ✅ Summary

**Documented for Future:**
- Design QA status (internal review step)
- Role-based View tab (Writer, Designer, Implementor, QA)
- QA/Management metrics (campaigns/flows written, designed)
- Revision tracking system
- Production velocity metrics

**When You're Ready:**
All the infrastructure is in place to add these features quickly. Just need to:
1. Add new status
2. Create new components
3. Add revision tracking
4. Build role-specific views

**This will make the OS even more powerful for team collaboration!** 🚀

