# 🎯 Internal OS Build Tasks - Step by Step

**Strategy:** Build UI first with mock data, test each step, then add database integration

**Design Language:** Match existing portal (glassmorphism, white/10 backgrounds, backdrop-blur)

**Route:** `/agency/[slug]/ops` (matches existing structure like `/agency/[slug]/admin`)

---

## ✅ Task Checklist

### **Phase 1: Foundation & Routing**
- [ ] Task 1: Create basic /ops route and layout
- [ ] Task 2: Build ops dashboard header with tabs
- [ ] Task 3: Add client selector dropdown

### **Phase 2: Campaign Calendar**
- [ ] Task 4: Build calendar grid with mock data
- [ ] Task 5: Add month navigation
- [ ] Task 6: Style campaign cards on calendar
- [ ] Task 7: Add filters (by client, by status)

### **Phase 3: Campaign Pipeline (Kanban)**
- [ ] Task 8: Build kanban board layout
- [ ] Task 9: Create campaign cards with mock data
- [ ] Task 10: Add drag-and-drop functionality
- [ ] Task 11: Style status columns

### **Phase 4: Campaign Detail Modal**
- [ ] Task 12: Build modal structure
- [ ] Task 13: Add campaign form fields
- [ ] Task 14: Add internal notes section
- [ ] Task 15: Add activity log display
- [ ] Task 16: Add status change functionality

### **Phase 5: Dashboard Widgets**
- [ ] Task 17: Build quick stats cards
- [ ] Task 18: Build "Needs Attention" widget
- [ ] Task 19: Build recent activity feed
- [ ] Task 20: Build upcoming sends list

### **Phase 6: Database Integration** (After UI is perfect)
- [ ] Task 21: Create database tables in Supabase
- [ ] Task 22: Build API routes
- [ ] Task 23: Connect UI to real data
- [ ] Task 24: Add triggers for auto-updates

---

## 📝 Detailed Task Breakdown

---

## **TASK 1: Create Basic /ops Route and Layout**

**Goal:** Get the route working with basic structure

**Files to Create:**
- `/app/ops/page.tsx`

**What to Build:**
```tsx
// Minimal structure to test routing works
- Page wrapper with gradient background (match portal style)
- Header with "Operations Dashboard" title
- Empty content area
- Basic navigation back to main site
```

**Test:**
- Navigate to http://localhost:3000/ops
- Should see styled page with header
- Gradient background should match portal

**Acceptance:**
- ✅ Route loads without errors
- ✅ Background matches portal style
- ✅ Header displays correctly

---

## **TASK 2: Build Ops Dashboard Header with Tabs**

**Goal:** Create navigation tabs matching portal design

**Files to Update:**
- `/app/ops/page.tsx`

**What to Build:**
```tsx
Tabs:
1. Overview (active by default)
2. Calendar
3. Pipeline
4. Content Hub (placeholder)
5. Scope (placeholder)

Design:
- Same glassmorphism as portal tabs
- Active tab highlighted
- Click to switch tabs
- Smooth transitions
```

**Mock Data:**
```tsx
const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'pipeline', label: 'Pipeline', icon: Columns },
  { id: 'content', label: 'Content Hub', icon: FolderOpen },
  { id: 'scope', label: 'Scope', icon: Target }
]
```

**Test:**
- Click each tab
- Active tab should highlight
- Content area should show tab name

**Acceptance:**
- ✅ Tabs render and look like portal
- ✅ Click switches active tab
- ✅ Visual feedback on hover/active

---

## **TASK 3: Add Client Selector Dropdown**

**Goal:** Filter view by client (matches portal's client selector)

**Files to Update:**
- `/app/ops/page.tsx`

**What to Build:**
```tsx
Client Selector:
- Dropdown in header
- "All Clients" option (default)
- List of clients
- Shows selected client name
- Updates when changed
```

**Mock Data:**
```tsx
const mockClients = [
  { id: '1', brand_name: 'Hydrus', brand_slug: 'hydrus' },
  { id: '2', brand_name: 'Peak Design', brand_slug: 'peak-design' },
  { id: '3', brand_name: 'Make Waves', brand_slug: 'make-waves' }
]
```

**Test:**
- Select different clients
- Should see client name in header
- Console log to verify state changes

**Acceptance:**
- ✅ Dropdown works smoothly
- ✅ Selected client updates state
- ✅ Design matches portal

---

## **TASK 4: Build Calendar Grid with Mock Data**

**Goal:** Display month calendar with campaigns

**Files to Create:**
- `/components/ops/ops-calendar.tsx`

**What to Build:**
```tsx
Calendar Features:
- Month view (current month)
- 7 columns (Sun-Sat)
- Days of month in grid
- Show campaigns on dates
- Color-code by client
- Status badges on campaigns
```

**Mock Data:**
```tsx
const mockCampaigns = [
  {
    id: '1',
    campaign_name: 'Black Friday Email',
    client_id: '1',
    client_name: 'Hydrus',
    send_date: new Date(2025, 10, 24), // Nov 24
    status: 'design',
    priority: 'high'
  },
  {
    id: '2',
    campaign_name: 'Welcome Series Part 2',
    client_id: '2',
    client_name: 'Peak Design',
    send_date: new Date(2025, 10, 28),
    status: 'qa',
    priority: 'normal'
  }
  // Add 5-6 more
]
```

**Design Reference:**
- Look at `/components/portal/enhanced-live-calendar.tsx`
- Same grid structure
- Same card style

**Test:**
- Should see current month
- Campaigns appear on correct dates
- Each campaign shows name + status badge

**Acceptance:**
- ✅ Calendar displays correctly
- ✅ Campaigns show on right dates
- ✅ Looks professional and clean

---

## **TASK 5: Add Month Navigation**

**Goal:** Previous/Next month buttons

**Files to Update:**
- `/components/ops/ops-calendar.tsx`

**What to Build:**
```tsx
Navigation:
- Previous month button (left arrow)
- Current month/year display
- Next month button (right arrow)
- Update campaigns when month changes
```

**Test:**
- Click next/previous
- Month should change
- Campaigns should update (mock data filtered by month)

**Acceptance:**
- ✅ Month navigation works
- ✅ Campaigns update correctly
- ✅ Smooth transitions

---

## **TASK 6: Style Campaign Cards on Calendar**

**Goal:** Make campaign cards look professional

**Files to Update:**
- `/components/ops/ops-calendar.tsx`

**What to Build:**
```tsx
Card Features:
- Client name (small, top)
- Campaign name (bold)
- Time (if applicable)
- Status badge with colors:
  - Strategy: gray
  - Copy: blue
  - Design: purple
  - QA: yellow
  - Client Approval: orange
  - Approved: green
  - Scheduled: teal
  - Sent: dark gray
- Priority indicator (🔴 for urgent, 🟡 for high)
- Click to open detail
```

**Design:**
```tsx
Status Colors (match portal):
- strategy: bg-gray-100 text-gray-700
- copy: bg-blue-100 text-blue-700
- design: bg-purple-100 text-purple-700
- qa: bg-yellow-100 text-yellow-700
- client_approval: bg-orange-100 text-orange-700
- approved: bg-green-100 text-green-700
- scheduled: bg-teal-100 text-teal-700
- sent: bg-gray-500 text-white
```

**Test:**
- Campaigns should look polished
- Status colors clear
- Priority visible
- Hover effects work

**Acceptance:**
- ✅ Cards look professional
- ✅ Status colors correct
- ✅ Click detection works

---

## **TASK 7: Add Filters (By Client, By Status)**

**Goal:** Filter calendar view

**Files to Update:**
- `/components/ops/ops-calendar.tsx`

**What to Build:**
```tsx
Filter Controls:
- Filter by client (uses client selector from header)
- Filter by status (dropdown: All, Strategy, Copy, Design, etc.)
- Search by campaign name (text input)
- "Clear Filters" button

Filter Logic:
- Filter campaigns array based on selected filters
- Update count display ("Showing 5 of 12 campaigns")
```

**Test:**
- Select client → should only show that client's campaigns
- Select status → should only show campaigns in that status
- Search → should filter by name
- Clear → should reset all

**Acceptance:**
- ✅ Filters work correctly
- ✅ Multiple filters combine (AND logic)
- ✅ Visual feedback on active filters

---

## **TASK 8: Build Kanban Board Layout**

**Goal:** Create pipeline view (alternative to calendar)

**Files to Create:**
- `/components/ops/ops-pipeline.tsx`

**What to Build:**
```tsx
Kanban Structure:
- 8 columns (one per status)
- Scrollable horizontally
- Each column has:
  - Header with status name
  - Count of campaigns
  - Campaign cards
  - "Add Campaign" button

Column Headers:
1. Strategy
2. Copy
3. Design
4. QA
5. Client Approval
6. Approved
7. Scheduled
8. Sent
```

**Design:**
```tsx
Layout:
- Horizontal scroll container
- Each column: min-width 280px
- Cards stack vertically in columns
- Gap between columns
- Sticky column headers
```

**Mock Data:**
Same as calendar mock data, just displayed differently

**Test:**
- Should see 8 columns
- Campaigns distributed by status
- Horizontal scroll works
- Looks clean and organized

**Acceptance:**
- ✅ Kanban layout displays
- ✅ Campaigns in correct columns
- ✅ Scrollable and responsive

---

## **TASK 9: Create Campaign Cards for Kanban**

**Goal:** Style campaign cards for kanban view

**Files to Update:**
- `/components/ops/ops-pipeline.tsx`

**What to Build:**
```tsx
Card Design (smaller than calendar):
- Client name badge (top, small)
- Campaign name (bold, 2 lines max)
- Send date (small, gray)
- Priority indicator (if urgent/high)
- Due date warning (if approaching)
- Quick actions on hover (view, edit)
```

**Design:**
```tsx
Card Style:
- bg-white rounded-lg shadow-sm
- border-l-4 border-[client-color]
- p-3
- hover:shadow-md transition
- cursor-pointer
```

**Test:**
- Cards should be compact
- All info visible
- Hover effects smooth
- Click opens detail

**Acceptance:**
- ✅ Cards look good
- ✅ Info hierarchy clear
- ✅ Interactions smooth

---

## **TASK 10: Add Drag-and-Drop Functionality**

**Goal:** Drag cards between columns to change status

**Files to Update:**
- `/components/ops/ops-pipeline.tsx`

**What to Build:**
```tsx
Drag & Drop:
- Use @dnd-kit/core or react-beautiful-dnd
- Drag card from one column
- Drop in another column
- Update campaign status
- Animate the movement
- Show drop zones
```

**Implementation:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

**Test:**
- Drag campaign from "Copy" to "Design"
- Should move smoothly
- Column counts update
- Status changes (log to console)

**Acceptance:**
- ✅ Drag works smoothly
- ✅ Drop updates status
- ✅ Animation polished
- ✅ Can't drop in same column (or allow reordering)

---

## **TASK 11: Style Status Columns**

**Goal:** Make columns visually distinct

**Files to Update:**
- `/components/ops/ops-pipeline.tsx`

**What to Build:**
```tsx
Column Styling:
- Header background color (light version of status color)
- Count badge
- Empty state message ("No campaigns in Copy")
- Add campaign button in header

Color Scheme:
- Match status badge colors from Task 6
- Subtle, not overwhelming
```

**Test:**
- Columns should be easy to distinguish
- Empty columns show helpful message
- Counts accurate

**Acceptance:**
- ✅ Columns visually distinct
- ✅ Professional appearance
- ✅ Clear hierarchy

---

## **TASK 12: Build Campaign Detail Modal**

**Goal:** Full campaign details and editing

**Files to Create:**
- `/components/ops/campaign-detail-modal.tsx`

**What to Build:**
```tsx
Modal Structure:
- Overlay (semi-transparent black)
- Modal container (centered, white background)
- Close button (X in corner)
- Scrollable content
- Footer with action buttons

Sections:
1. Header (campaign name, status dropdown)
2. Basic Info (subject line, send date, client, priority)
3. Copy & Design (links to docs/files)
4. Internal Notes (text area)
5. Activity Log (timeline of changes)
6. Action Buttons (Save, Delete, Send to Client)
```

**Design:**
- Match portal modal style
- Max-width: 800px
- Responsive on mobile

**Test:**
- Click campaign → modal opens
- Click overlay or X → modal closes
- All fields editable
- Save button logs changes

**Acceptance:**
- ✅ Modal opens/closes smoothly
- ✅ Layout clean and organized
- ✅ All sections visible

---

## **TASK 13: Add Campaign Form Fields**

**Goal:** Editable fields in modal

**Files to Update:**
- `/components/ops/campaign-detail-modal.tsx`

**What to Build:**
```tsx
Form Fields:
- Campaign Name (text input)
- Subject Line (text input)
- Preview Text (text input)
- Send Date (date picker)
- Send Time (time picker)
- Client (dropdown, disabled if editing)
- Campaign Type (Email/SMS radio)
- Priority (dropdown: Normal, High, Urgent)
- Status (dropdown with all statuses)
- Target Audience (text input)

Styling:
- Labels above inputs
- Full width inputs
- Proper spacing
- Validation styling (red border for errors)
```

**Test:**
- Type in each field
- State updates
- Validation shows errors
- Date/time pickers work

**Acceptance:**
- ✅ All fields functional
- ✅ Good UX (clear labels, spacing)
- ✅ Validation works

---

## **TASK 14: Add Internal Notes Section**

**Goal:** Team collaboration notes

**Files to Update:**
- `/components/ops/campaign-detail-modal.tsx`

**What to Build:**
```tsx
Internal Notes:
- Rich text area (or simple textarea)
- Markdown support (optional)
- Save notes button
- Character count
- Auto-save indicator (future)

Design:
- Expandable section
- Placeholder text with examples
- Clean, spacious
```

**Mock Data:**
```tsx
initialNotes: `
• Client wants blue CTA buttons
• Include free shipping disclaimer
• Use product images from Oct photoshoot
• Avoid mentioning competitors
`
```

**Test:**
- Type notes
- Notes save to state
- Character count updates

**Acceptance:**
- ✅ Notes editor works
- ✅ Easy to use
- ✅ Saves changes

---

## **TASK 15: Add Activity Log Display**

**Goal:** Show timeline of campaign changes

**Files to Update:**
- `/components/ops/campaign-detail-modal.tsx`

**What to Build:**
```tsx
Activity Log:
- Chronological list (newest first)
- Each entry shows:
  - Action type icon
  - Description
  - User name
  - Timestamp (relative: "2 hours ago")
- Icons for different actions:
  - Created: Plus icon
  - Status change: ArrowRight icon
  - Note added: MessageSquare icon
  - File uploaded: Upload icon
```

**Mock Data:**
```tsx
const mockActivity = [
  {
    id: '1',
    type: 'status_change',
    description: 'Status changed from Copy to Design',
    user: 'Sarah',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: '2',
    type: 'note_added',
    description: 'Added internal notes',
    user: 'Mike',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
  },
  {
    id: '3',
    type: 'created',
    description: 'Campaign created',
    user: 'Sarah',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
  }
]
```

**Test:**
- Activity displays chronologically
- Relative time updates
- Icons show correctly

**Acceptance:**
- ✅ Timeline clear and readable
- ✅ Icons appropriate
- ✅ Times formatted well

---

## **TASK 16: Add Status Change Functionality**

**Goal:** Change campaign status from modal

**Files to Update:**
- `/components/ops/campaign-detail-modal.tsx`

**What to Build:**
```tsx
Status Dropdown:
- Current status highlighted
- Click to change
- Update campaign state
- Log activity entry
- Update calendar/kanban in background

Special Logic:
- If changing to "client_approval" → show confirmation
  "This will send to client portal. Continue?"
- If changing to "scheduled" → require send date
- If changing to "sent" → show confirmation
```

**Test:**
- Change status from dropdown
- Confirmation appears (if needed)
- Campaign updates in list
- Activity log adds entry

**Acceptance:**
- ✅ Status changes work
- ✅ Confirmations appear
- ✅ Updates reflect everywhere

---

## **TASK 17: Build Quick Stats Cards**

**Goal:** Dashboard overview widgets

**Files to Create:**
- `/components/ops/ops-overview.tsx`

**What to Build:**
```tsx
4 Stat Cards:
1. Active Campaigns
   - Count of campaigns not in "sent" status
   - Icon: Mail
   
2. Needs Attention
   - Count of urgent + past due
   - Icon: AlertCircle
   
3. Sent This Week
   - Count sent in last 7 days
   - Icon: Send
   
4. Client Approvals
   - Count in "client_approval" status
   - Icon: Clock

Design:
- 4 columns on desktop, 2 on tablet, 1 on mobile
- Card with glassmorphism
- Large number (main stat)
- Label below
- Icon in corner
- Color-coded
```

**Mock Data:**
Calculate from mock campaigns array

**Test:**
- Stats should calculate correctly
- Cards responsive
- Visual hierarchy clear

**Acceptance:**
- ✅ Stats accurate
- ✅ Design matches portal
- ✅ Responsive

---

## **TASK 18: Build "Needs Attention" Widget**

**Goal:** Show campaigns requiring action

**Files to Update:**
- `/components/ops/ops-overview.tsx`

**What to Build:**
```tsx
Needs Attention List:
- Shows campaigns that are:
  - Past due (send_date < today, status not sent)
  - Urgent priority
  - In client_approval > 48 hours
- For each campaign:
  - Client name
  - Campaign name
  - Reason (past due / urgent / waiting)
  - Click to open detail

Design:
- Card with list items
- Each item clickable
- Red/orange/yellow indicators
- Empty state: "All caught up! 🎉"
```

**Mock Data:**
```tsx
Calculate from campaigns:
- Filter by criteria above
- Sort by urgency
```

**Test:**
- Urgent campaigns appear
- Click opens detail modal
- Empty state shows when none

**Acceptance:**
- ✅ Logic correct
- ✅ Helpful for team
- ✅ Clear actionable items

---

## **TASK 19: Build Recent Activity Feed**

**Goal:** Show what's happening across all campaigns

**Files to Update:**
- `/components/ops/ops-overview.tsx`

**What to Build:**
```tsx
Activity Feed:
- Last 10 activities across all campaigns
- Shows:
  - User avatar/initials
  - Action description
  - Campaign name (linked)
  - Relative time
- Types:
  - Campaign created
  - Status changed
  - Client approved
  - Campaign sent
  - Note added

Design:
- Card with scrollable list
- Each item with icon
- Subtle separators
- "View All" link at bottom
```

**Mock Data:**
Combine activity from all mock campaigns

**Test:**
- Activities display
- Times relative
- Click campaign name opens detail

**Acceptance:**
- ✅ Feed useful
- ✅ Design clean
- ✅ Updates in real-time (with mock data changes)

---

## **TASK 20: Build Upcoming Sends List**

**Goal:** Show what's sending soon

**Files to Update:**
- `/components/ops/ops-overview.tsx`

**What to Build:**
```tsx
Upcoming Sends:
- Show next 5-7 campaigns scheduled to send
- Filter: send_date >= today, status = scheduled or approved
- Sort by send_date (soonest first)
- For each:
  - Send date & time
  - Client name
  - Campaign name
  - Status
  - Click to view

Design:
- Card with list
- Date prominently displayed
- Group by day
- Empty state: "No upcoming sends"
```

**Mock Data:**
Filter and sort campaigns

**Test:**
- Upcoming campaigns show
- Sorted correctly
- Empty state works

**Acceptance:**
- ✅ List accurate
- ✅ Helpful for planning
- ✅ Design clear

---

## **TASK 21-24: Database Integration** (Hold for Later)

These tasks will connect everything to Supabase after UI is confirmed working.

---

## 🎯 Testing Protocol

**After Each Task:**
1. Run `npm run dev`
2. Navigate to `/ops`
3. Test the specific feature
4. Check console for errors
5. Test on mobile view
6. Verify design matches portal

**Before Moving to Next Task:**
- Take screenshot (for reference)
- Note any bugs/improvements
- User confirms task is acceptable

---

## 📊 Progress Tracking

**Completed Tasks:** 0/20

**Current Task:** Task 1

**Estimated Time Per Task:** 30-60 minutes

**Total Estimated Time (Tasks 1-20):** 15-25 hours

---

## 🚀 Let's Start!

**Ready to begin with Task 1?**

I'll create the basic `/ops` route with a styled page that matches your portal design. Just say "Start Task 1" and I'll build it!

**Questions before we start:**
1. Route name: `/ops` or `/team`? (I recommend `/ops`)
2. Any specific clients you want in the mock data besides Hydrus, Peak Design, and Make Waves?
3. Should I use your existing clients from the database for mock data?

