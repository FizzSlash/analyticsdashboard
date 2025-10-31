# 📋 Operations Dashboard - Phases 6-10 Detailed Tasks

**Ready to build after completing Phases 1-5**

---

## 🗂️ PHASE 6: Content Hub (10 Tasks)

### **Task 21: Content Hub Layout**
- Build main content hub page structure
- Client selector (reuse existing pattern)
- Tab navigation: Brand Guidelines | Assets | Copy Notes | Design Notes
- Search bar at top

### **Task 22: Brand Guidelines Section**
- Display client brand colors (color picker display)
- Font specifications
- Logo files (upload and display)
- Tone of voice text area
- Legal requirements text area
- Save/edit functionality

### **Task 23: Asset Library Grid**
- Folder structure (Logos, Product Images, Email Headers, etc.)
- Grid view of files with thumbnails
- File details (name, size, upload date)
- Click to preview full size

### **Task 24: File Upload**
- Drag & drop upload area (like campaign images)
- Multiple file upload
- Progress bars
- Automatic folder assignment
- Support: PNG, JPG, GIF, PDF, SVG

### **Task 25: Folder Management**
- Create new folders
- Rename folders
- Move files between folders
- Delete folders (with confirmation)

### **Task 26: Copy Notes Editor**
- Rich text area or markdown editor
- Sections:
  - Voice & Tone guidelines
  - Key phrases to use
  - Words/phrases to avoid
  - Legal requirements
  - Competitor mentions policy
- Auto-save

### **Task 27: Design Notes Editor**
- Same structure as copy notes
- Sections:
  - Design preferences
  - Client likes/dislikes
  - Color usage rules
  - Image style guide
  - Mobile considerations
- Auto-save

### **Task 28: Asset Search & Filter**
- Search by filename
- Filter by folder
- Filter by file type (images, PDFs, etc.)
- Filter by upload date
- Clear filters button

### **Task 29: Tag System**
- Add tags to files (e.g., "product", "hero", "cta-button")
- Filter by tags
- Tag suggestions
- Bulk tag editing

### **Task 30: Quick Attach to Campaigns**
- "Attach to Campaign" button on assets
- Opens modal to select campaign
- Adds reference to campaign
- Shows in campaign modal

**Deliverable:** Centralized content management system

---

## 📊 PHASE 7: Scope Tracker (8 Tasks)

### **Task 31: Scope Dashboard Layout**
- Grid of all clients
- Progress bars for each
- Color coding (green < 75%, yellow 75-90%, red > 90%)
- Click client to see details

### **Task 32: Scope Configuration Modal**
- Set monthly limits per client
- Email campaigns: Min-Max range (e.g., 8-12)
- SMS campaigns limit
- Flows limit (e.g., 2 per month)
- Popups limit
- Monthly reset date

### **Task 33: Auto-Count Integration**
- Count campaigns created this month
- Count flows created this month
- Count popups created this month
- Real-time updates
- Display: Used / Limit

### **Task 34: Client Scope Detail View**
- Full breakdown for one client
- Progress bars for each category
- List of campaigns/flows this month
- Overage history
- Monthly trends (last 6 months)

### **Task 35: Overage Warning System**
- Alert at 75% usage
- Warning at 90% usage
- Block at 100% (unless approved)
- Email notifications (optional)

### **Task 36: Overage Request Workflow**
- "Request Overage" button
- Specify reason
- Get approval from admin
- Track approved overages
- Show in scope detail

### **Task 37: Historical Tracking**
- Month-by-month usage chart
- Compare to limits
- Identify trends
- Export to CSV for billing

### **Task 38: Auto-Reset Monthly**
- Cron job or trigger to reset on 1st of month
- Archive previous month data
- Reset counters to 0
- Notification to team

**Deliverable:** Complete scope management system

---

## ⚡ PHASE 8: Flow Management (7 Tasks)

### **Task 39: Flow List View**
- Grid or list of all flows
- Similar to campaign pipeline
- Status badges
- Client grouping
- Click to view details

### **Task 40: Flow Pipeline (Kanban)**
- Same columns as campaigns
- Each flow card shows:
  - Flow name
  - Client
  - Number of emails (e.g., "3 emails")
  - Status
  - Priority
- Drag between columns

### **Task 41: Flow Detail Modal**
- Flow name
- Trigger type (Welcome, Abandoned Cart, Post-Purchase, Browse Abandonment, etc.)
- Number of emails in sequence
- Description
- Status
- Client
- Timing between emails

### **Task 42: Flow Email Sequence Builder**
- List of emails in flow (Email 1, Email 2, Email 3...)
- For each email:
  - Email name
  - Subject line
  - Time delay (e.g., "2 hours after", "1 day after")
  - Design file
  - Status (each email has own status)
- Add/remove emails
- Reorder emails

### **Task 43: Flow Approval Workflow**
- When flow reaches "client_approval"
- Auto-create entries in `flow_approvals` table (existing)
- Client sees in their portal
- Reviews each email in sequence
- Approves all or requests changes

### **Task 44: Flow Analytics Integration**
- After flow is live
- Show performance metrics (from existing flow_metrics table)
- Completion rate
- Revenue attribution
- Link to analytics dashboard

### **Task 45: Flow Template Library**
- Save flows as templates
- Common flows:
  - Welcome Series (3-5 emails)
  - Abandoned Cart (2-3 emails)
  - Post-Purchase (2-4 emails)
  - Winback (2-3 emails)
  - VIP nurture (ongoing)
- Quick create from template

**Deliverable:** Full flow management system (same quality as campaigns)

---

## 🧪 PHASE 9: A/B Test Tracker (8 Tasks)

### **Task 46: A/B Test Dashboard**
- List of all tests (active, completed, archived)
- Test status badges
- Click to view results
- "Create New Test" button

### **Task 47: Create New Test Wizard**
- Step 1: Test details (name, type, goal)
- Step 2: Configure variants (2-4 variants)
- Step 3: Set traffic split (%)
- Step 4: Link campaigns
- Step 5: Review and create

### **Task 48: Test Configuration Form**
- Test name
- Test type (dropdown: Subject Line, Content, Send Time, From Name, Offer)
- Success metric (Opens, Clicks, Revenue, Conversions)
- Start/end dates
- Minimum sample size
- Confidence level (90%, 95%, 99%)

### **Task 49: Variant Builder**
- Add variant button (up to 4 variants)
- For each variant:
  - Variant name (A, B, C, Control)
  - Traffic % (auto-calculates to 100%)
  - Link to campaign (or create new)
  - Expected hypothesis
- Remove variant button

### **Task 50: Link Campaigns to Test**
- Select existing campaigns
- OR create new campaigns as variants
- Each variant is a separate campaign
- All linked to parent test
- Show test badge on campaign cards

### **Task 51: Results Dashboard**
- Live results table:
  ```
  Variant | Sent | Opens | Clicks | Revenue | Open Rate | Click Rate | Conv Rate
  A       | 5K   | 1.2K  | 312    | $2.1K   | 25%       | 6.2%       | 2.1%
  B       | 5K   | 1.4K  | 350    | $2.5K   | 28% ✅    | 7.0% ✅    | 2.4% ✅
  ```
- Winner highlighting
- Statistical significance indicator
- Confidence score
- Chart visualizations

### **Task 52: Winner Declaration**
- "Declare Winner" button
- Shows statistical analysis
- Confidence level
- Recommended action
- Save decision
- Apply learnings to future campaigns

### **Task 53: Insights & Learnings**
- Text area for insights
- What worked and why
- What to apply next time
- Tag insights by category
- Search insights library
- Reference in future campaigns

**Deliverable:** Complete A/B testing system with insights

---

## 👁️ PHASE 10: QA/Management View (11 Tasks)

### **Task 54: Add "View" Tab**
- New tab in main navigation
- Icon: Eye or User icon
- Shows between Campaigns and Content Hub

### **Task 55: Role View Selector**
- 4 buttons at top:
  - Writer's View
  - Designer's View
  - Implementor's View
  - QA / Management View (default)
- Active view highlighted
- Switch between views

### **Task 56: Add "Design QA" Status**
- Update status dropdown everywhere
- Add to campaign modal
- Add to pipeline (new column)
- Add database constraint

### **Task 57: QA Review Queue**
- List campaigns in "design_qa" status
- Show campaign image preview
- Group by client
- Sort by due date
- Priority flagging

### **Task 58: QA Approval Modal**
- Show campaign details
- Large image preview
- Action buttons:
  - ✅ Approve (move to QA)
  - ✏️ Send to Copy
  - 🎨 Send to Design
- Revision notes text area
- Previous revisions history

### **Task 59: Revision Notes System**
- Revision text area
- Save revision to ops_revisions table
- Display revision history
- Show who requested and when
- Track resolution

### **Task 60: Production Metrics Widget**
- Campaigns written this week (count)
- Campaigns designed this week (count)
- Flows written this week (count)
- Flows designed this week (count)
- Breakdown by client
- Trend indicators (up/down vs last week)

### **Task 61: Quality Metrics Widget**
- First-time approval rate (%)
- Copy revision rate (%)
- Design revision rate (%)
- Client revision rate (%)
- Average revisions per campaign
- Most common revision types

### **Task 62: Team Workload Display**
- Show assigned campaigns per person
- Filter by status
- Capacity indicators (overloaded / balanced / light)
- Reassign campaigns
- Balance workload feature

### **Task 63: Writer's View (Simplified)**
- My campaigns awaiting copy
- My completed campaigns
- Copy resources (quick access to guidelines)
- Upload copy doc button

### **Task 64: Designer's View (Simplified)**
- My campaigns awaiting design
- My completed designs
- Design resources (brand guidelines, asset library)
- Upload design button

**Deliverable:** Complete internal review and team management system

---

## 🗄️ Database Requirements by Phase

### **Phase 6: Content Hub**
```sql
ops_content
ops_brand_guidelines
ops_content_folders
ops_content_tags
```

### **Phase 7: Scope Tracker**
```sql
ops_scope_config
ops_scope_usage
ops_overage_requests
```

### **Phase 8: Flow Management**
```sql
ops_flows
ops_flow_emails
ops_flow_templates
```

### **Phase 9: A/B Test Tracker**
```sql
ops_ab_tests
ops_ab_test_variants
ops_ab_test_insights
-- Links to existing ops_campaigns
```

### **Phase 10: QA/Management**
```sql
ops_revisions
ops_team_assignments
-- Update ops_campaigns with qa fields
-- Add design_qa status
```

---

## 🎯 Next Steps

**Ready to continue?**

**Option A:** Build Phase 6 (Content Hub) + Phase 7 (Scope Tracker)  
→ Essential tools for daily operations

**Option B:** Build Phase 8 (Flows) + Phase 9 (A/B Tests)  
→ Complete campaign management features

**Option C:** Build Phase 10 (QA/Management View)  
→ Internal review system

**Option D:** Database Integration First  
→ Connect Phases 1-5 to real data, then build more

**What would you like to tackle next?** 🚀

