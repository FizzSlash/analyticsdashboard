# Operating System & Portal Code Summary

**Generated:** December 1, 2025  
**Purpose:** Complete code documentation for Operating System (Ops) and Portal sections for revision planning

---

## 📋 Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Operating System (Ops) Section](#operating-system-ops-section)
3. [Portal Section](#portal-section)
4. [Database Schema](#database-schema)
5. [API Routes](#api-routes)
6. [Key Components](#key-components)
7. [Integration Points](#integration-points)
8. [Revision Opportunities](#revision-opportunities)

---

## 🏗️ System Architecture Overview

### **Three-Layer Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 1: ANALYTICS                       │
│                  (What Happened - Metrics)                  │
│  Route: /client/[slug] (Analytics view)                     │
│  - Campaign performance (opens, clicks, revenue)            │
│  - Flow metrics, subject line insights                      │
│  - AI Assistant for insights                               │
└─────────────────────────────────────────────────────────────┘
                            ↕️
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 2: CLIENT PORTAL                   │
│                   (What's Next - Approvals)                 │
│  Route: /client/[slug] (Portal view - toggle)               │
│  - Campaign approval calendar                               │
│  - Flow approvals, A/B tests                               │
│  - Submit requests                                          │
└─────────────────────────────────────────────────────────────┘
                            ↕️
┌─────────────────────────────────────────────────────────────┐
│                  LAYER 3: INTERNAL OS ⭐                    │
│                (What We're Doing - Workflow)                │
│  Route: /agency/[slug]/ops                                  │
│  - Master campaign calendar (all clients)                   │
│  - Campaign pipeline (strategy → live)                      │
│  - Flow/popup management                                    │
│  - Content hub, scope tracking                             │
│  - Role-based views (copywriter, designer, etc)            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Operating System (Ops) Section

### **Location:** `/app/agency/[slug]/ops/page.tsx`

### **Purpose**
Internal team workflow management for agency staff to:
- Create and manage campaigns across all clients
- Track campaign status through production pipeline
- Manage flows, popups, A/B tests
- Store client assets in content hub
- Track monthly scope limits
- View role-specific dashboards

### **Main Navigation Tabs**

#### **Primary Tabs:**
1. **Overview** - Dashboard with stats, needs attention, recent activity
2. **Campaigns** - Calendar/Pipeline toggle view
3. **Flows** - Flow automation management
4. **Popups** - Popup campaign management
5. **A/B Tests** - Test tracking and management

#### **Secondary Tabs:**
6. **Content Hub** - Client assets and documentation
7. **Forms** - Dynamic form templates
8. **View** - Role-based calendar views (copywriter, designer, QA, etc.)
9. **Scope** - Monthly scope tracking per client
10. **Settings** - AI prompts configuration

### **Key Features**

#### **1. Ops Overview** (`components/ops/ops-overview.tsx`)
- Quick stats cards:
  - Active campaigns count
  - Needs attention (urgent/past due)
  - Sent this week
  - Client approvals pending
- "Needs Attention" list:
  - Past due campaigns
  - Urgent priority items
  - Client approval waiting
- Upcoming sends
- Recent activity feed (placeholder)
- This week summary

#### **2. Campaign Views**

**Calendar View** (`components/ops/ops-calendar.tsx`):
- Monthly calendar layout
- Color-coded by client
- Status badges (strategy, copy, design, QA, client_approval, approved, scheduled, sent)
- Click date to create campaign
- Click campaign to view/edit details

**Pipeline View** (`components/ops/ops-pipeline.tsx`):
- Kanban board with status columns
- Drag & drop to change status
- Priority indicators
- Client filtering

#### **3. Campaign Detail Modal** (`components/ops/campaign-detail-modal.tsx`)
- Full CRUD for campaigns
- Fields:
  - Campaign name, type (email/sms)
  - Client selection
  - Send date/time
  - Subject line, preview text
  - Status, priority
  - Description/notes
  - Copy doc URL
  - Design file URL
  - Klaviyo campaign ID
  - Audience details
  - Internal notes
- Actions:
  - Save changes
  - Delete campaign
  - Change status
  - Move to different date

#### **4. Flow Manager** (`components/ops/flow-manager.tsx`)
- Flow list with search/filter
- Create new flows
- Track flow progress
- Link to Klaviyo
- Client-specific flows

#### **5. Popup Manager** (`components/ops/popup-manager.tsx`)
- Popup campaign management
- Similar structure to campaigns
- Popup-specific fields

#### **6. Content Hub** (`components/ops/content-hub.tsx`)
- Client-specific asset storage
- Categories:
  - Brand guidelines
  - Assets (images, files)
  - Copy notes
  - Design notes
- File upload capability
- Search and filter
- Attach to campaigns

#### **7. Scope Tracker** (`components/ops/scope-tracker.tsx`)
- Monthly scope limits per client
- Auto-count usage:
  - Campaigns used/remaining
  - Flows used/remaining
  - Popups used/remaining
- Visual progress bars
- Warnings at 75%/90% usage
- Scope reset date display

#### **8. Role Views Calendar** (`components/ops/role-views-calendar.tsx`)
- Specialized views for different team roles:
  - **Copywriter View:** Shows campaigns in "copy" status
  - **Designer View:** Shows campaigns in "design" status
  - **QA View:** Shows campaigns in "ready_for_imp_qa" and "qa" status
  - **Implementor View:** Shows approved campaigns ready to schedule
  - **Client Approval View:** Shows campaigns awaiting client approval
- Work-in-progress counter
- Click to open campaign detail modal

#### **9. A/B Test Tracker** (`components/ops/ab-test-tracker.tsx`)
- Test management interface
- Create/edit tests
- Track performance
- Variant comparison

#### **10. Forms Builder** (`components/ops/ops-forms.tsx`)
- Dynamic form template creation
- Form response tracking
- Client-specific forms

### **Code Structure - Main Page**

```typescript
// app/agency/[slug]/ops/page.tsx

type OpsTab = 'overview' | 'campaigns' | 'flows' | 'popups' | 
              'content' | 'forms' | 'abtests' | 'view' | 'scope' | 'settings'

type CampaignView = 'calendar' | 'pipeline'

interface Campaign {
  id: string
  campaign_name: string
  client_id: string
  client_name: string
  client_color: string
  send_date: Date
  status: 'strategy' | 'copy' | 'design' | 'ready_for_imp_qa' | 
          'qa' | 'ready_for_client_approval' | 'client_approval' | 
          'approved' | 'scheduled' | 'sent' | 'revisions'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  campaign_type: 'email' | 'plaintext' | 'sms'
}

// Main state management:
- activeTab: current tab selection
- campaignView: calendar vs pipeline
- selectedClient: filter by client or 'all'
- sharedCampaigns: campaigns shared across views
- sharedFlows: flows data
- selectedCampaignForModal: campaign detail modal

// Data loading:
- Fetches agency data by slug
- Loads clients with portal enabled
- Fetches campaigns from /api/ops/campaigns
- Fetches flows from /api/ops/flows
```

### **Styling & Branding**
- Uses agency branding (primary_color, secondary_color, background_image)
- Gradient backgrounds
- Glassmorphism UI (backdrop blur, transparency)
- Color-coded client badges
- Status badges with icons

---

## 🎨 Portal Section

### **Location:** `components/portal/clean-portal-dashboard.tsx`

### **Purpose**
Client-facing interface for:
- Viewing and approving campaigns
- Reviewing and approving flows
- Managing A/B tests
- Submitting requests to agency
- Filling out forms

### **Main Portal Tabs**

1. **Overview** - Dashboard summary with pending approvals
2. **Campaigns** - Campaign approval calendar
3. **Flows** - Flow review and approval
4. **Popups** - Popup approvals
5. **A/B Tests** - Test results and insights
6. **Requests** - Submit new requests to agency
7. **Forms** - Fill out client questionnaires

### **Key Components**

#### **1. Dashboard Overview** (`components/portal/dashboard-overview.tsx`)
- Pending approvals count
- Active requests summary  
- Recent activity feed
- Upcoming deadlines
- Quick action cards:
  - View campaigns
  - Submit request
  - Approve flows
  - View A/B tests

#### **2. Campaign Approval Calendar** (`components/portal/campaign-approval-calendar-v3.tsx`)

**Features:**
- Monthly calendar view of campaigns
- Status indicators:
  - Draft (gray)
  - Client Approval (yellow)
  - Approved (green)
  - Sent (blue)
- Click campaign to view details:
  - Campaign name
  - Subject line
  - Preview text
  - Design preview image
  - Scheduled send date/time
- **Design Annotations:**
  - Click on preview image to add annotations
  - X/Y coordinates stored
  - Comment text
  - Author tracking
  - Mark as resolved
- **Approval Actions:**
  - Approve campaign
  - Request revisions (with notes)
  - View revision history
- **Airtable Sync:**
  - Auto-syncs to Airtable on create/update
  - Sync status indicators (synced/syncing/not synced)

#### **3. Flow Progress Tracker** (`components/portal/flow-progress-tracker-v2.tsx`)

**Features:**
- List of flows with status
- Individual email review within flows:
  - Email preview
  - Rating system (1-5 stars)
  - Comment on each email
  - Request changes (checkbox list)
  - Approve/reject individual emails
- Flow-level approval
- Overall flow notes
- Performance metrics display (after launch)

#### **4. Popup Approval** (`components/portal/popup-approval.tsx`)
- Similar to campaign approval
- Popup-specific preview
- Approval workflow

#### **5. A/B Test Manager** (`components/portal/ab-test-manager-v2.tsx`)

**Features:**
- Active tests display
- Variant comparison:
  - Variant A vs Variant B
  - Send counts
  - Open rates
  - Click rates  
  - Revenue
- Statistical significance indicator
- Winner declaration
- Test insights and learnings
- Historical tests archive

#### **6. Enhanced Requests** (`components/portal/enhanced-requests.tsx`)

**Request Types:**
- Email campaigns
- SMS campaigns
- Email flows
- Popups
- A/B tests
- Miscellaneous projects

**Request Form Fields:**
- Title
- Description
- Request type
- Priority (low, medium, high, urgent)
- Desired completion date
- Target audience
- Campaign objectives
- Budget (optional)
- Special requirements

**Status Workflow:**
- Submitted
- In Review
- Approved
- In Progress
- Completed
- Rejected

#### **7. Dynamic Forms** (`components/portal/dynamic-forms.tsx`)
- Agency-created custom forms
- Client fills out questionnaires
- Response tracking
- Form history

### **Code Structure - Main Dashboard**

```typescript
// components/portal/clean-portal-dashboard.tsx

interface CleanPortalDashboardProps {
  user: any
  client?: any // For agency admins
  userRole: 'client_user' | 'agency_admin'
  allClients?: any[] // For agency admins
}

type PortalTab = 'overview' | 'campaigns' | 'flows' | 'popups' | 
                 'abtests' | 'requests' | 'forms'

// Main state:
- activeTab: current tab
- selectedClient: for agency admin multi-client view

// Client info determination:
- For client_user: Uses user.client data
- For agency_admin: Can switch between clients

// Features:
- Figma URL integration (button to open design files)
- Agency logo display
- Client-specific portal title
- Tab navigation with icons
```

### **Portal-Analytics Toggle**

**Location:** `components/ui/view-toggle.tsx`

Allows switching between:
- **Analytics View:** Performance metrics, charts, AI assistant
- **Portal View:** Approval workflows, requests, forms

```typescript
export type ViewMode = 'analytics' | 'portal'

interface ViewToggleProps {
  currentMode: ViewMode
  onModeChange: (mode: ViewMode) => void
}
```

Used in:
- `/app/client/[slug]/page.tsx` - Main client dashboard
- `/app/share/[token]/page.tsx` - Shared dashboards

---

## 🗄️ Database Schema

### **Portal Tables**

```sql
-- Campaign approvals
campaign_approvals
├── id (UUID)
├── client_id (UUID) → clients
├── agency_id (UUID) → agencies
├── campaign_name (TEXT)
├── campaign_type (TEXT: 'email' | 'sms')
├── subject_line (TEXT)
├── preview_text (TEXT)
├── preview_url (TEXT) -- Design image URL
├── scheduled_date (TIMESTAMP)
├── status (TEXT: 'draft' | 'client_approval' | 'approved' | 'revisions_requested' | 'sent')
├── client_revisions (TEXT)
├── client_approved (BOOLEAN)
├── approval_date (TIMESTAMP)
├── external_id (TEXT) -- Airtable record ID
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

-- Flow approvals
flow_approvals
├── id (UUID)
├── client_id (UUID) → clients
├── flow_id (TEXT) -- Klaviyo flow ID
├── flow_name (TEXT)
├── flow_type (TEXT)
├── status (TEXT)
├── flow_approved (BOOLEAN)
├── flow_notes (TEXT)
├── approval_date (TIMESTAMP)
└── created_at (TIMESTAMP)

-- Individual flow email approvals
flow_email_approvals
├── id (UUID)
├── flow_approval_id (UUID) → flow_approvals
├── message_id (TEXT) -- Klaviyo message ID
├── email_name (TEXT)
├── step_number (INTEGER)
├── rating (INTEGER: 1-5)
├── comments (TEXT)
├── approved (BOOLEAN)
├── requested_changes (TEXT[])
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

-- Client requests
campaign_requests (also called portal_requests)
├── id (UUID)
├── client_id (UUID) → clients
├── agency_id (UUID) → agencies
├── title (TEXT)
├── description (TEXT)
├── request_type (TEXT: 'email_campaign' | 'sms_campaign' | 'email_flow' | 'popup' | 'ab_test' | 'misc')
├── campaign_type (TEXT) -- deprecated, use request_type
├── priority (TEXT: 'low' | 'medium' | 'high' | 'urgent')
├── status (TEXT: 'submitted' | 'in_review' | 'approved' | 'in_progress' | 'completed' | 'rejected')
├── requested_date (TIMESTAMP)
├── desired_launch_date (TIMESTAMP)
├── objectives (TEXT[])
├── target_audience (TEXT)
├── budget (NUMERIC)
├── special_requirements (TEXT)
├── requested_by_user_id (UUID) → user_profiles
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

-- A/B tests
ab_tests
├── id (UUID)
├── client_id (UUID) → clients
├── test_name (TEXT)
├── test_type (TEXT: 'subject_line' | 'content' | 'send_time' | 'from_name')
├── status (TEXT: 'draft' | 'running' | 'completed' | 'paused')
├── start_date (TIMESTAMP)
├── end_date (TIMESTAMP)
├── winner_variant (TEXT)
├── confidence_score (NUMERIC)
├── insights (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

-- A/B test variants
ab_test_variants
├── id (UUID)
├── ab_test_id (UUID) → ab_tests
├── variant_name (TEXT: 'A' | 'B' | 'C'...)
├── variant_value (TEXT) -- Subject line, content, etc.
├── sent (INTEGER)
├── opens (INTEGER)
├── clicks (INTEGER)
├── revenue (NUMERIC)
├── open_rate (NUMERIC)
├── click_rate (NUMERIC)
└── created_at (TIMESTAMP)

-- Design annotations
design_annotations
├── id (UUID)
├── airtable_record_id (TEXT) -- Links to campaign
├── campaign_approval_id (UUID) → campaign_approvals
├── design_file_id (TEXT)
├── x_position (NUMERIC) -- % from left (0-100)
├── y_position (NUMERIC) -- % from top (0-100)
├── comment (TEXT)
├── author_name (TEXT)
├── author_id (UUID) → user_profiles
├── author_role (TEXT: 'client_user' | 'agency_admin')
├── resolved (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### **Ops Tables** (Currently in use)

```sql
-- Note: Some ops tables are API-only and may not have full schema in DB yet
-- These are the working tables:

-- Ops campaigns (master campaign tracking)
ops_campaigns (via API)
├── id (UUID)
├── client_id (UUID) → clients
├── agency_id (UUID) → agencies
├── campaign_name (TEXT)
├── campaign_type (TEXT: 'email' | 'plaintext' | 'sms')
├── subject_line (TEXT)
├── preview_text (TEXT)
├── send_date (TIMESTAMP)
├── status (TEXT: 'strategy' | 'copy' | 'design' | 'ready_for_imp_qa' | 
              'qa' | 'ready_for_client_approval' | 'client_approval' | 
              'approved' | 'scheduled' | 'sent' | 'revisions')
├── priority (TEXT: 'low' | 'normal' | 'high' | 'urgent')
├── copy_doc_url (TEXT)
├── design_file_url (TEXT)
├── klaviyo_campaign_id (TEXT)
├── internal_notes (TEXT)
├── description (TEXT)
├── audience_details (TEXT)
├── created_by (UUID) → user_profiles
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

-- Ops flows
ops_flows (via API)
├── id (UUID)
├── client_id (UUID)
├── flow_name (TEXT)
├── flow_type (TEXT)
├── status (TEXT)
├── klaviyo_flow_id (TEXT)
└── created_at (TIMESTAMP)

-- Ops popups
ops_popups (via API)
├── id (UUID)
├── client_id (UUID)
├── popup_name (TEXT)
├── status (TEXT)
└── created_at (TIMESTAMP)

-- Content hub items
ops_content_items (via API)
├── id (UUID)
├── client_id (UUID)
├── title (TEXT)
├── content_type (TEXT)
├── file_url (TEXT)
├── category (TEXT)
└── created_at (TIMESTAMP)
```

---

## 🔌 API Routes

### **Portal APIs**

```
GET  /api/portal-overview?clientId={id}
     Returns: stats, recent activity, upcoming deadlines

GET  /api/portal-annotations?airtable_record_id={id}&client_id={id}
POST /api/portal-annotations
     Body: { airtable_record_id, design_file_id, x_position, y_position, comment }
PATCH /api/portal-annotations
      Body: { id, resolved: true }
DELETE /api/portal-annotations?id={id}

GET  /api/portal-requests?clientId={id}&status={status}
POST /api/portal-requests
     Body: { client_id, title, request_type, priority, description, ... }
PATCH /api/portal-requests
      Body: { id, status, ... }
DELETE /api/portal-requests?id={id}

POST /api/sync-to-airtable
     Body: { client, campaign }
     Auto-syncs portal changes to Airtable
```

### **Ops APIs**

```
GET  /api/ops/campaigns?clientId={id|'all'}
     Returns: array of campaigns
POST /api/ops/campaigns
     Body: { client_id, campaign_name, status, send_date, ... }
PATCH /api/ops/campaigns
      Body: { id, ...updates }
DELETE /api/ops/campaigns?id={id}

GET  /api/ops/flows?clientId={id|'all'}
     Returns: array of flows
POST /api/ops/flows
PATCH /api/ops/flows
DELETE /api/ops/flows

GET  /api/ops/popups?clientId={id|'all'}
POST /api/ops/popups
PATCH /api/ops/popups
DELETE /api/ops/popups

GET  /api/ops/content?clientId={id}
POST /api/ops/content
     Body: { client_id, title, file_url, category, ... }

GET  /api/ops/scope?clientId={id}
     Returns: monthly scope usage and limits
```

---

## 🔗 Integration Points

### **1. Ops ↔ Portal Integration**

**When campaign reaches "client_approval" status in Ops:**
```
Ops Campaign (status: 'client_approval')
    ↓
Auto-creates entry in campaign_approvals table
    ↓
Appears in Client Portal → Campaigns tab
    ↓
Client approves
    ↓
campaign_approvals.client_approved = true
    ↓
(TODO: Trigger should update ops_campaigns status to 'approved')
```

**Current State:** One-way sync (Ops → Portal)  
**Future:** Bidirectional sync with triggers

### **2. Portal Requests → Ops Campaigns**

**Client submits request in Portal:**
```
Client fills request form
    ↓
INSERT into campaign_requests
    ↓
(Future: Trigger creates ops_campaigns entry)
    ↓
Appears in Ops dashboard as new campaign
    ↓
Team works on it through normal workflow
```

**Current State:** Manual creation in Ops  
**Future:** Auto-create from requests

### **3. Analytics Integration**

**After campaign sends:**
```
Klaviyo sends campaign
    ↓
Daily sync runs (/api/sync)
    ↓
Data stored in campaign_metrics
    ↓
Visible in:
  - Client Analytics view
  - Portal campaign details (performance)
  - Ops campaign modal (results)
```

### **4. Airtable Integration**

**Portal → Airtable Sync:**
- Uses `enhanced-live-calendar.tsx` component
- Auto-syncs on campaign create/update
- Stores `external_id` (Airtable record ID) in campaign_approvals
- Sync status indicators in UI

**Future: Airtable → Portal:**
- Import existing campaigns
- Webhook listeners for updates
- Bidirectional sync

---

## 🎯 Revision Opportunities

### **High Priority Improvements**

#### **1. Complete Ops ↔ Portal Bidirectional Sync**

**Current Gap:** Portal approvals don't auto-update Ops campaigns

**Solution:**
```sql
-- Add trigger to sync portal approvals back to ops
CREATE OR REPLACE FUNCTION sync_portal_approval_to_ops()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.client_approved = true AND OLD.client_approved != true THEN
    UPDATE ops_campaigns
    SET status = 'approved'
    WHERE id = NEW.ops_campaign_id; -- Need to add this column
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER portal_to_ops_sync
AFTER UPDATE ON campaign_approvals
FOR EACH ROW EXECUTE FUNCTION sync_portal_approval_to_ops();
```

**Files to Update:**
- `database/portal_features_tables.sql` - Add ops_campaign_id column
- `/api/ops/campaigns` - Create campaign_approval when status = 'client_approval'

#### **2. Auto-Create Ops Campaigns from Portal Requests**

**Current Gap:** Requests submitted by clients don't automatically create ops campaigns

**Solution:**
```sql
CREATE OR REPLACE FUNCTION create_ops_campaign_from_request()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ops_campaigns (
    campaign_name,
    client_id,
    agency_id,
    status,
    send_date,
    priority,
    description,
    portal_request_id
  ) VALUES (
    NEW.title,
    NEW.client_id,
    NEW.agency_id,
    'strategy',
    NEW.desired_launch_date,
    NEW.priority,
    NEW.description,
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER request_creates_ops_campaign
AFTER INSERT ON campaign_requests
FOR EACH ROW EXECUTE FUNCTION create_ops_campaign_from_request();
```

#### **3. Load Design Annotations from Database**

**Current Gap:** Annotations API works, but UI doesn't load existing annotations

**Solution:** Update `campaign-approval-calendar-v3.tsx`:
```typescript
useEffect(() => {
  const loadAnnotations = async () => {
    if (!campaign.id) return
    
    const response = await fetch(
      `/api/portal-annotations?campaign_approval_id=${campaign.id}`
    )
    const data = await response.json()
    if (data.success) {
      setAnnotations(data.annotations)
    }
  }
  
  loadAnnotations()
}, [campaign.id])
```

#### **4. Enhance Role Views with Filters**

**Current State:** Role views show all campaigns in that status  
**Improvement:** Add filters for:
- Date range
- Client
- Priority
- Search by campaign name

**Files to Update:**
- `components/ops/role-views-calendar.tsx`

#### **5. Add Scope Warnings**

**Current State:** Scope tracker shows usage  
**Improvement:** Add visual warnings and notifications

**Solution:**
```typescript
// In scope-tracker.tsx
const isNearLimit = (used: number, limit: number) => {
  const percentage = (used / limit) * 100
  return percentage >= 75
}

const isAtLimit = (used: number, limit: number) => {
  return used >= limit
}

// Show badges:
{isAtLimit(campaignsUsed, campaignsMax) && (
  <span className="text-red-500 font-bold">⚠️ LIMIT REACHED</span>
)}
{isNearLimit(campaignsUsed, campaignsMax) && (
  <span className="text-orange-500 font-bold">⚠️ Approaching Limit</span>
)}
```

### **Medium Priority Improvements**

#### **6. Campaign Templates**
- Save campaigns as reusable templates
- Quick create from template
- Template library per client

#### **7. Bulk Actions in Ops**
- Select multiple campaigns
- Bulk status change
- Bulk reschedule
- Bulk delete

#### **8. Enhanced Activity Feed**
- Real activity logging (currently placeholder)
- Filter by activity type
- User avatars
- Click to view related campaign

#### **9. Search & Filters**
- Global search across all campaigns
- Advanced filters (date range, status, client, priority)
- Save filter presets
- Search in content hub

#### **10. Airtable Bidirectional Sync**
- Import existing Airtable campaigns
- Real-time webhook from Airtable
- Conflict resolution
- Sync history log

### **Low Priority / Future Enhancements**

#### **11. Real-time Collaboration**
- WebSockets for live updates
- User presence indicators
- Live annotation placement
- Concurrent editing detection

#### **12. Mobile Optimization**
- Responsive portal layouts
- Touch-friendly controls
- Mobile-optimized calendar
- Swipe gestures

#### **13. Notification System**
- Email notifications
- Slack integration
- In-app notification center
- Digest emails
- @mentions in comments

#### **14. Version Control**
- Save campaign revisions
- Compare versions
- Rollback capability
- Revision history

#### **15. Analytics in Ops**
- Show campaign performance in ops dashboard
- Goal tracking
- ROI calculations
- Client performance leaderboard

---

## 📊 Component File List

### **Ops Components** (`components/ops/`)
```
ops-overview.tsx           - Dashboard with stats
ops-calendar.tsx           - Calendar view
ops-pipeline.tsx           - Kanban board
campaign-detail-modal.tsx  - Campaign CRUD modal
campaign-work-view-modal.tsx - Work view variant
flow-manager.tsx           - Flow management
flow-detail-modal.tsx      - Flow CRUD modal
popup-manager.tsx          - Popup management
popup-detail-modal.tsx     - Popup CRUD modal
ab-test-tracker.tsx        - A/B test management
ab-test-detail-modal.tsx   - A/B test CRUD modal
content-hub.tsx            - Asset storage
scope-tracker.tsx          - Scope tracking
scope-detail-modal.tsx     - Scope details
role-views-calendar.tsx    - Role-specific views
role-views.tsx             - Role view wrapper
ops-forms.tsx              - Form templates
form-builder-modal.tsx     - Form creator
ai-prompts-settings.tsx    - AI settings
brief-ideas-selector.tsx   - Brief ideas helper
```

### **Portal Components** (`components/portal/`)
```
clean-portal-dashboard.tsx          - Main portal wrapper
dashboard-overview.tsx              - Overview tab
campaign-approval-calendar-v3.tsx   - Campaign calendar (latest)
campaign-approval-calendar-v2.tsx   - Previous version
campaign-approval-calendar.tsx      - Original version
campaign-builder.tsx                - Campaign creator
campaign-calendar.tsx               - Basic calendar
flow-progress-tracker-v2.tsx        - Flow tracker (latest)
flow-progress-tracker.tsx           - Original version
flow-email-review.tsx               - Individual email review
popup-approval.tsx                  - Popup approvals
ab-test-manager-v2.tsx              - A/B tests (latest)
ab-test-manager.tsx                 - Original version
enhanced-requests.tsx               - Request system
campaign-requests.tsx               - Basic requests
dynamic-forms.tsx                   - Custom forms
enhanced-live-calendar.tsx          - Live CRUD calendar
live-editable-calendar.tsx          - Editable calendar
unified-campaign-portal.tsx         - Unified view (deprecated?)
portal-dashboard.tsx                - Portal entry point
```

### **Shared Components**
```
components/ui/view-toggle.tsx       - Analytics/Portal toggle
components/dashboard/modern-dashboard.tsx - Main analytics dashboard
components/agency/portal-management.tsx - Agency admin portal hub
components/agency/client-management.tsx - Client CRUD
components/agency/user-management.tsx - User invitations
```

---

## 🚀 Next Steps for Revision

### **Week 1: Critical Integrations**
1. ✅ Add ops_campaign_id to campaign_approvals table
2. ✅ Create trigger for portal → ops status sync
3. ✅ Create trigger for requests → ops campaigns
4. ✅ Load design annotations from database
5. ✅ Test end-to-end workflow

### **Week 2: User Experience**
1. ✅ Add search/filter to ops calendar
2. ✅ Add bulk actions to campaigns
3. ✅ Enhance scope warnings
4. ✅ Improve role views with filters
5. ✅ Add activity feed logging

### **Week 3: Polish & Testing**
1. ✅ Mobile responsive improvements
2. ✅ Loading states everywhere
3. ✅ Error handling improvements
4. ✅ User acceptance testing
5. ✅ Bug fixes

### **Week 4: Documentation & Deployment**
1. ✅ Update user guides
2. ✅ Create video tutorials
3. ✅ API documentation
4. ✅ Production deployment
5. ✅ Team training

---

## 📝 Key Insights for Revision

### **Strengths**
- ✅ Well-architected three-layer system
- ✅ Comprehensive component library
- ✅ Good separation of concerns
- ✅ Strong branding/customization support
- ✅ Multiple view options (calendar, kanban, role-based)

### **Gaps**
- 🔄 Portal → Ops sync incomplete
- 🔄 Manual request → campaign conversion
- 🔄 Annotations not loaded from DB
- 🔄 Limited search/filter capabilities
- 🔄 No bulk actions
- 🔄 Activity feed is placeholder
- 🔄 One-way Airtable sync only

### **Quick Wins**
1. Add database triggers (high impact, low effort)
2. Load annotations in UI (simple useEffect)
3. Add scope warnings (just UI changes)
4. Add search bars (straightforward)
5. Color-code priorities (CSS only)

### **Major Efforts**
1. Bidirectional Airtable sync
2. Real-time notifications
3. Advanced analytics integration
4. Mobile app development
5. Comprehensive testing suite

---

**End of Summary Document**

This document provides a complete overview of the Operating System and Portal sections for revision planning. All code locations, database schemas, API routes, and integration points are documented above.

