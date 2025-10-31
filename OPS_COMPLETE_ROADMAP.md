# 🎯 Operations Dashboard - Complete Build Roadmap

**Date:** October 31, 2025  
**Status:** Phases 1-5 Complete | Phases 6-10 Ready to Build

---

## ✅ COMPLETED PHASES (Tasks 1-20)

### **Phase 1: Foundation** ✅
- [x] Task 1: Create `/agency/[slug]/ops` route
- [x] Task 2: Navigation tabs
- [x] Task 3: Client selector dropdown

### **Phase 2: Campaign Calendar** ✅
- [x] Task 4: Calendar grid with mock data
- [x] Task 5: Month navigation
- [x] Task 6: Campaign card styling
- [x] Task 7: Filters (status)
- [x] Bonus: Drag-to-reschedule
- [x] Bonus: Double-click to add campaign
- [x] Bonus: Multi-campaign scrolling

### **Phase 3: Campaign Pipeline** ✅
- [x] Task 8: Kanban board layout
- [x] Task 9: Campaign cards for kanban
- [x] Task 10: Drag & drop between columns
- [x] Task 11: Status column styling

### **Phase 4: Campaign Detail Modal** ✅
- [x] Task 12: Modal structure
- [x] Task 13: Form fields
- [x] Task 14: Internal notes section
- [x] Task 15: Activity log
- [x] Task 16: Status change functionality
- [x] Bonus: Image upload with drag & drop
- [x] Bonus: Dynamic layout (full-width or split)
- [x] Bonus: A/B test fields
- [x] Bonus: Design → QA validation

### **Phase 5: Overview Dashboard** ✅
- [x] Task 17: Quick stats cards (4)
- [x] Task 18: Needs Attention widget
- [x] Task 19: Recent Activity feed
- [x] Task 20: Upcoming Sends list

---

## 🚀 UPCOMING PHASES (Tasks 21+)

### **Phase 6: Content Hub** 🗂️

**Purpose:** Store and organize client assets, brand guidelines, and notes

**Tasks:**
- [ ] Task 21: Content Hub layout and navigation
- [ ] Task 22: Client selector for content
- [ ] Task 23: Brand Guidelines section
- [ ] Task 24: Asset library (images, files)
- [ ] Task 25: Copy notes per client
- [ ] Task 26: Design notes per client
- [ ] Task 27: File upload with folders
- [ ] Task 28: Search and filter assets
- [ ] Task 29: Tag system for organization
- [ ] Task 30: Quick attach assets to campaigns

**Features:**
```
Content Hub Tab:
├── Brand Guidelines
│   ├── Brand Colors
│   ├── Fonts
│   ├── Logo Files
│   └── Tone of Voice
├── Assets (Folders)
│   ├── Product Images (45 files)
│   ├── Email Headers (12 files)
│   ├── Logos (8 files)
│   └── Social Icons (15 files)
├── Copy Notes
│   ├── Key Phrases
│   ├── Legal Requirements
│   └── Voice & Tone Guide
└── Design Notes
    ├── Design Preferences
    ├── Client Dislikes
    └── Best Practices
```

**Database Tables:**
```sql
ops_content (
  id, client_id, content_type, 
  title, description, file_url, 
  folder, tags[], created_at
)

ops_brand_guidelines (
  id, client_id, brand_colors[],
  fonts[], tone, legal_requirements
)
```

---

### **Phase 7: Scope Tracker** 📊

**Purpose:** Track monthly campaign limits and prevent scope creep

**Tasks:**
- [ ] Task 31: Scope tracking dashboard
- [ ] Task 32: Monthly limit configuration
- [ ] Task 33: Usage counters (auto-update)
- [ ] Task 34: Progress bars per client
- [ ] Task 35: Overage warnings
- [ ] Task 36: Historical scope tracking
- [ ] Task 37: Scope usage reports
- [ ] Task 38: Auto-reset monthly counters

**Features:**
```
Scope Tab:
├── Current Month Overview
│   ├── Hydrus: 8/12 campaigns used (67%)
│   ├── Peak Design: 11/12 campaigns used (92%) ⚠️
│   └── Make Waves: 6/12 campaigns used (50%)
├── Per Client Details
│   ├── Email Campaigns: 8/12
│   ├── SMS Campaigns: 2/4
│   ├── Flows: 1/2
│   └── Popups: 3/4
├── Overage Requests
│   └── [Request Extra Campaign] button
└── Historical View
    └── Oct: 12/12 | Sep: 10/12 | Aug: 12/12
```

**Database Tables:**
```sql
ops_scope_config (
  id, client_id,
  campaigns_min, campaigns_max,
  flows_limit, popups_limit,
  reset_day_of_month
)

ops_scope_usage (
  id, client_id, month,
  campaigns_used, flows_used,
  popups_used, overage_approved
)
```

**Auto-Increment Logic:**
```sql
-- Trigger on campaign creation
CREATE TRIGGER increment_scope_usage
AFTER INSERT ON ops_campaigns
FOR EACH ROW
EXECUTE FUNCTION update_scope_count();
```

---

### **Phase 8: Flow Management** ⚡

**Purpose:** Manage email flows (automated sequences)

**Tasks:**
- [ ] Task 39: Flow list/grid view
- [ ] Task 40: Flow detail modal
- [ ] Task 41: Flow email sequence builder
- [ ] Task 42: Flow status pipeline
- [ ] Task 43: Flow approval workflow
- [ ] Task 44: Flow analytics integration
- [ ] Task 45: Flow template library

**Features:**
```
Flows Tab:
├── Flow Pipeline (Kanban)
│   ├── Strategy
│   ├── Copy
│   ├── Design
│   ├── QA
│   ├── Client Approval
│   ├── Approved
│   └── Live in Klaviyo
├── Flow Detail Modal
│   ├── Flow Name
│   ├── Trigger Type (abandoned cart, welcome, post-purchase)
│   ├── Email Sequence (3-5 emails)
│   ├── Timing between emails
│   └── Performance metrics (after live)
└── Flow Cards
    ├── Welcome Flow (3 emails) - Live
    ├── Abandoned Cart (4 emails) - Design
    └── Post-Purchase (2 emails) - Copy
```

**Database Tables:**
```sql
ops_flows (
  id, client_id, flow_name, trigger_type,
  status, num_emails, klaviyo_flow_id
)

ops_flow_emails (
  id, flow_id, email_number, email_name,
  subject_line, design_url, status
)
```

**Flow Workflow:**
Each flow has multiple emails, each goes through:
```
Strategy → Copy (all emails) → Design (all emails) → QA → Client Approval → Live
```

---

### **Phase 9: A/B Test Tracker** 🧪

**Purpose:** Centralized A/B test management and results tracking

**Tasks:**
- [ ] Task 46: A/B test list view
- [ ] Task 47: Create new test wizard
- [ ] Task 48: Test configuration (variants, split %)
- [ ] Task 49: Link campaigns to tests
- [ ] Task 50: Results dashboard
- [ ] Task 51: Winner declaration
- [ ] Task 52: Insights and learnings
- [ ] Task 53: Test history and archive

**Features:**
```
A/B Tests (New Tab or within Campaigns):
├── Active Tests
│   ├── Black Friday Subject Line Test
│   │   ├── Variant A: "Get 50% OFF Everything" (50% traffic)
│   │   ├── Variant B: "Limited Time: Half Off Sale" (50% traffic)
│   │   ├── Metrics: Opens, Clicks, Revenue
│   │   └── Status: Running | Winner: TBD
│   │
│   └── Product Launch Time Test
│       ├── Variant A: Send at 9am (33%)
│       ├── Variant B: Send at 2pm (33%)
│       ├── Variant C: Send at 6pm (34%)
│       └── Status: Analyzing
│
├── Test Configuration
│   ├── Test Name
│   ├── Test Type (Subject Line, Content, Time, From Name, Offer)
│   ├── Variants (2-4)
│   ├── Traffic Split (%)
│   ├── Success Metric (Opens, Clicks, Revenue)
│   └── Minimum Sample Size
│
├── Results Dashboard
│   ├── Performance by Variant
│   │   ├── Sent: 5,000 vs 5,000
│   │   ├── Opens: 1,250 (25%) vs 1,400 (28%) ✅ Winner
│   │   ├── Clicks: 312 vs 350
│   │   └── Revenue: $2,100 vs $2,450
│   ├── Statistical Significance: 95% ✅
│   └── Recommended Winner: Variant B
│
└── Insights Library
    ├── Subject Lines: Questions outperform statements (+15%)
    ├── Send Times: 9am best for B2B, 6pm for B2C
    └── Content: Short emails (< 200 words) click 23% higher
```

**Database Tables:**
```sql
ops_ab_tests (
  id, client_id, test_name, test_type,
  start_date, end_date, status,
  winner_variant, confidence_score
)

ops_ab_test_variants (
  id, ab_test_id, variant_name,
  campaign_id, traffic_percentage,
  sent, opens, clicks, revenue
)

ops_ab_test_insights (
  id, ab_test_id, insight_text,
  recommendation, applies_to_future
)
```

**Integration with Campaigns:**
- Link multiple campaigns to one test
- Auto-populate results from campaign_metrics
- Calculate statistical significance
- Declare winner
- Store learnings for future reference

---

### **Phase 10: QA/Management View** 👁️

**Purpose:** Internal review dashboard for QA team and management

**Tasks:**
- [ ] Task 54: Add "View" tab to navigation
- [ ] Task 55: Build role view selector
- [ ] Task 56: QA/Management dashboard
- [ ] Task 57: Campaigns awaiting review list
- [ ] Task 58: QA approval modal (approve/send back)
- [ ] Task 59: Revision notes system
- [ ] Task 60: Production metrics (written/designed counts)
- [ ] Task 61: Quality metrics (revision rates)
- [ ] Task 62: Writer's View (future)
- [ ] Task 63: Designer's View (future)
- [ ] Task 64: Implementor's View (future)

**QA/Management View Features:**
```
QA / Management View:
├── Review Queue
│   ├── Awaiting Design QA (3 campaigns)
│   │   ├── Black Friday - Hydrus
│   │   │   [View Image] [Approve] [Send to Copy] [Send to Design]
│   │   │   Revision Notes: _______________________
│   │   │   
│   │   ├── Product Launch - Make Waves
│   │   └── Welcome Email - Peak Design
│   │
│   ├── Awaiting Final QA (2 campaigns)
│   └── Awaiting Client Approval (5 campaigns)
│
├── Production Stats
│   ├── Campaigns Written This Week: 12
│   ├── Campaigns Designed This Week: 10
│   ├── Flows Written This Week: 2
│   └── Flows Designed This Week: 1
│
├── Quality Metrics
│   ├── First-Time Approval Rate: 85%
│   ├── Copy Revision Rate: 12%
│   ├── Design Revision Rate: 18%
│   └── Client Revision Rate: 8%
│
└── Team Workload
    ├── Sarah (Writer): 5 campaigns assigned
    ├── Mike (Designer): 7 campaigns assigned
    └── Lisa (Implementor): 3 campaigns ready
```

**New Status Added:**
- `design_qa` - Between Design and QA

**Updated Workflow:**
```
Strategy → Copy → Design → Upload Image → Design QA → QA → Client Approval → Approved → Scheduled → Sent
                                            ↑ NEW
```

**QA Actions:**
- **Approve** → Move to next stage
- **Send to Copy** → Back to Copy status with revision notes
- **Send to Design** → Back to Design status with revision notes
- **Add Notes** → Visible to team, guides revisions

---

## 📅 Updated Build Timeline

### **Completed (Week 1):**
- ✅ Phases 1-5: Foundation, Calendar, Pipeline, Modal, Overview

### **Week 2: Essential Tools**
- **Phase 6:** Content Hub (8 tasks)
  - Brand asset links (Figma, Drive, etc.)
  - Brand guidelines
  - Copy/design notes per client
  - Link manager (not file uploads)
- **Phase 7:** Scope Tracker (10 tasks)
  - Monthly limits tracking
  - **Invoice date tracking**
  - **Monthly documentation** (initiatives, findings)
  - Usage auto-counting
  - Overage warnings

### **Week 3: Flow & Testing**
- **Phase 8:** Flow Management (7 tasks)
  - Flow pipeline (same as campaigns)
  - Multi-email sequence builder
  - Flow approval workflow
  - Flow templates
- **Phase 9:** A/B Test Tracker (8 tasks)
  - Test configuration wizard
  - Variant management
  - Results dashboard
  - Winner declaration + insights

### **Week 4: Team Views**
- **Phase 10:** QA/Management View (11 tasks)
  - **Design QA status** (new workflow step)
  - QA review queue
  - **Production metrics** (campaigns/flows written & designed)
  - Revision notes system
  - Team workload display

### **Future (As Needed):**
- Writer's View
- Designer's View
- Implementor's View
- Advanced reporting
- Team analytics

---

## 🎯 Priority Order

**Must Have (Phases 6-7):**
1. Content Hub - Store client assets and guidelines
2. Scope Tracker - Prevent overage, track usage

**Should Have (Phases 8-9):**
3. Flow Management - Same workflow as campaigns
4. A/B Test Tracker - Track test performance

**Nice to Have (Phase 10):**
5. QA/Management View - Internal review dashboard

---

## 📊 Estimated Time Per Phase

| Phase | Tasks | Estimated Time | Priority | Description |
|-------|-------|----------------|----------|-------------|
| Phase 6: Content Hub | 8 | 6-10 hours | High | Link manager, guidelines, notes |
| Phase 7: Scope Tracker | 10 | 10-15 hours | High | Invoice tracking, monthly docs |
| Phase 8: Flow Management | 7 | 8-12 hours | High | Flow pipeline & sequences |
| Phase 9: A/B Test Tracker | 8 | 6-10 hours | Medium | Test config & results |
| Phase 10: QA/Management View | 11 | 10-15 hours | Medium | Internal review system |

**Total Remaining:** 40-62 hours (about 1-2 weeks of work)

---

## 💡 Quick Reference

**What's Built:**
- ✅ Campaign calendar with drag & drop
- ✅ Campaign pipeline (kanban)
- ✅ Campaign creation and editing
- ✅ Image upload
- ✅ Overview dashboard

**What's Next:**
- 🔜 Content Hub (store assets)
- 🔜 Scope Tracker (monthly limits)
- 🔜 Flow Management (same as campaigns)
- 🔜 A/B Test Tracker (test performance)
- 🔜 QA/Management View (internal review)

**Ready to build Phase 6: Content Hub?** 🚀

