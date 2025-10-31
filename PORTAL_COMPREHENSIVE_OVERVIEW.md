# 🎯 Analytics Dashboard Portal - Comprehensive Overview

**Generated:** October 31, 2025  
**Purpose:** Complete understanding of your portal system architecture and capabilities

---

## 📋 Table of Contents
1. [System Architecture](#system-architecture)
2. [Portal Features](#portal-features)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Component Structure](#component-structure)
6. [Current Status](#current-status)
7. [Improvement Opportunities](#improvement-opportunities)

---

## 🏗️ System Architecture

### **Technology Stack**
```
Frontend:
├── Next.js 14 (React Framework)
├── TypeScript (Type Safety)
├── Tailwind CSS (Styling)
└── Lucide React (Icons)

Backend:
├── Next.js API Routes
├── Supabase (PostgreSQL Database)
└── Klaviyo API Integration

Visualization:
└── Recharts (Analytics Charts)

AI Integration:
└── Anthropic Claude SDK (AI Assistant)
```

### **Core Routes**

#### **Client Portal** 
- **URL**: `/client/[slug]`
- **Access**: Authenticated client users only
- **Features**: Analytics + Portal Toggle

#### **Agency Admin Dashboard**
- **URL**: `/agency/[slug]/admin`
- **Access**: Agency administrators only
- **Features**: Full client management + portal creation

---

## 🎨 Portal Features

### **1. Client Portal (`CleanPortalDashboard`)**

#### **Overview Tab**
- Pending approvals count
- Active requests summary
- Recent activity feed
- Upcoming deadlines
- Quick action cards

#### **Campaign Tab** (`CampaignApprovalCalendar`)
- Monthly calendar view
- Campaign status tracking
  - Draft
  - Client Approval
  - Approved
  - Sent
- Design file viewing
- Image annotations with x/y coordinates
- Approval/revision submission
- Airtable sync integration

#### **Flows Tab** (`FlowProgressTracker`)
- Flow automation tracking
- Individual email review
- Step-by-step progress
- Performance metrics
- Client feedback submission

#### **A/B Tests Tab** (`ABTestManager`)
- Active test tracking
- Variant performance comparison
- Statistical significance display
- Winner declaration
- Test insights and learnings

#### **Requests Tab** (`EnhancedRequests`)
- Multi-type request submission:
  - Email campaigns
  - SMS campaigns
  - Email flows
  - Popups
  - A/B tests
  - Miscellaneous projects
- Priority levels (low, medium, high, urgent)
- Status workflow tracking
- Target audience specification
- Desired completion date

#### **Forms Tab** (`DynamicForms`)
- Custom form builder
- Client-specific questionnaires
- Response tracking
- Data export capabilities

---

### **2. Agency Admin Portal (`PortalManagement`)**

#### **Overview Tab**
- Portal statistics dashboard
  - Pending approvals across all clients
  - Active requests count
  - Running A/B tests
  - Campaigns sent this month
- Client activity feed
- Quick action cards:
  - Create campaign
  - Manage A/B tests
  - View requests

#### **Live Calendar Tab** (`EnhancedLiveCalendar`) ⭐
**KEY FEATURE: Real-time CRUD during client calls**
- Add campaigns on any date (click to create)
- Edit campaign details inline
- Delete campaigns instantly
- **Auto-sync to Airtable** on every change
- Sync status indicators:
  - 🟢 Green dot = Synced to Airtable
  - 🔵 Spinning = Currently syncing
  - ⚪ Gray dot = Not yet synced
- Campaign properties:
  - Title
  - Subject line
  - Type (email/SMS)
  - Send date/time
  - Target audience
  - Status
  - Description/notes
- Live mode toggle (🔴 LIVE)
- Perfect for client strategy calls

#### **Campaign Creator Tab**
- Campaign builder interface
- Client selector
- Multi-step creation flow
- Preview image upload
- Auto-submit to approval calendar

#### **Flow Creator Tab**
- Flow automation builder
- Email sequence creator
- Trigger configuration
- Client approval workflow

#### **A/B Test Manager Tab**
- Test creation interface
- Variant configuration
- Performance tracking
- Results analysis

#### **Client Requests Tab**
- Request inbox for all clients
- Status filtering
- Assignment management
- Priority sorting
- Response/approval workflow

#### **Templates & Assets Tab**
- Email template library
- Brand asset management
- Reusable content blocks
- File organization

---

## 🗄️ Database Schema

### **Production Tables (Currently Active)**

#### **Core Tables**
```sql
agencies
├── id (UUID, Primary Key)
├── agency_name (TEXT)
├── agency_slug (TEXT, Unique)
├── primary_color (TEXT)
├── secondary_color (TEXT)
├── background_image_url (TEXT)
├── logo_url (TEXT)
├── owner_id (UUID, References user_profiles)
└── created_at (TIMESTAMP)

clients
├── id (UUID, Primary Key)
├── brand_name (TEXT)
├── brand_slug (TEXT, Unique)
├── agency_id (UUID, References agencies)
├── klaviyo_api_key (TEXT, Encrypted)
├── primary_color (TEXT)
├── secondary_color (TEXT)
├── logo_url (TEXT)
├── figma_url (TEXT)
└── created_at (TIMESTAMP)

user_profiles
├── id (UUID, Primary Key, References auth.users)
├── email (TEXT)
├── full_name (TEXT)
├── role (TEXT: agency_admin | client_user)
├── agency_id (UUID, References agencies)
├── client_id (UUID, References clients)
└── created_at (TIMESTAMP)
```

#### **Analytics Tables**
```sql
campaign_metrics       → Email campaign performance
flow_metrics           → Flow automation metrics
flow_message_metrics   → Individual flow email stats
audience_metrics       → Subscriber growth/engagement
revenue_attribution    → Revenue by source
segment_metrics        → Segment performance
deliverability_metrics → Email deliverability
list_growth_metrics    → List growth trends
```

#### **Portal Tables**
```sql
campaign_approvals
├── id (UUID, Primary Key)
├── client_id (UUID, References clients)
├── agency_id (UUID, References agencies)
├── campaign_name (TEXT)
├── campaign_type (TEXT: email | sms)
├── subject_line (TEXT)
├── preview_url (TEXT)
├── scheduled_date (TIMESTAMP)
├── status (TEXT: draft | client_approval | approved | revisions_requested | sent)
├── client_revisions (TEXT)
├── client_approved (BOOLEAN)
├── approval_date (TIMESTAMP)
├── external_id (TEXT) -- Airtable record ID
└── created_at (TIMESTAMP)

flow_approvals
├── id (UUID, Primary Key)
├── client_id (UUID, References clients)
├── flow_id (TEXT, Klaviyo flow ID)
├── flow_name (TEXT)
├── flow_approved (BOOLEAN)
└── flow_notes (TEXT)

flow_email_approvals
├── id (UUID, Primary Key)
├── flow_approval_id (UUID, References flow_approvals)
├── message_id (TEXT, Klaviyo message ID)
├── email_name (TEXT)
├── rating (INTEGER 1-5)
├── comments (TEXT)
├── approved (BOOLEAN)
└── requested_changes (TEXT[])

campaign_requests
├── id (UUID, Primary Key)
├── client_id (UUID, References clients)
├── title (TEXT)
├── description (TEXT)
├── campaign_type (TEXT: email | sms | both)
├── priority (TEXT: low | medium | high | urgent)
├── status (TEXT: submitted | in_review | approved | in_progress | completed | rejected)
├── requested_date (TIMESTAMP)
├── desired_launch_date (TIMESTAMP)
├── objectives (TEXT[])
├── target_audience (TEXT)
└── requested_by_user_id (UUID)

ab_tests
├── id (UUID, Primary Key)
├── client_id (UUID, References clients)
├── test_name (TEXT)
├── test_type (TEXT: subject_line | content | send_time | from_name)
├── status (TEXT: draft | running | completed | paused)
├── winner_variant (TEXT)
└── confidence_score (NUMERIC)

ab_test_variants
├── id (UUID, Primary Key)
├── ab_test_id (UUID, References ab_tests)
├── variant_name (TEXT)
├── sent (INTEGER)
├── opens (INTEGER)
├── clicks (INTEGER)
├── revenue (NUMERIC)
└── open_rate (NUMERIC)
```

#### **Advanced Portal Tables** (Available, May Need Activation)
```sql
design_annotations
├── id (UUID, Primary Key)
├── airtable_record_id (TEXT)
├── design_file_id (TEXT)
├── x_position (NUMERIC 0-100%)
├── y_position (NUMERIC 0-100%)
├── comment (TEXT)
├── author_name (TEXT)
├── author_role (TEXT: client_user | agency_admin)
├── resolved (BOOLEAN)
└── created_at (TIMESTAMP)

design_likes
├── id (UUID, Primary Key)
├── airtable_record_id (TEXT)
├── design_file_id (TEXT)
├── user_id (UUID, References user_profiles)
└── created_at (TIMESTAMP)

portal_campaign_sync_log
├── id (UUID, Primary Key)
├── airtable_record_id (TEXT)
├── action (TEXT: create | update | delete)
├── sync_direction (TEXT: portal_to_airtable | airtable_to_portal)
├── changed_fields (JSONB)
├── success (BOOLEAN)
└── created_at (TIMESTAMP)

portal_requests (Enhanced version)
├── id (UUID, Primary Key)
├── request_type (TEXT: email_campaign | sms_campaign | email_flow | popup | ab_test | misc)
├── priority (TEXT)
├── status (TEXT)
├── campaign_objectives (TEXT[])
├── budget (NUMERIC)
└── airtable_record_id (TEXT)

ab_test_results
├── id (UUID, Primary Key)
├── test_name (TEXT)
├── test_type (TEXT)
├── variant_a_sent (INTEGER)
├── variant_a_opens (INTEGER)
├── variant_a_clicks (INTEGER)
├── variant_a_revenue (NUMERIC)
├── variant_b_sent (INTEGER)
├── variant_b_opens (INTEGER)
├── variant_b_clicks (INTEGER)
├── variant_b_revenue (NUMERIC)
├── winner_variant (TEXT)
├── statistical_significance (BOOLEAN)
└── insights (TEXT)
```

---

## 🔌 API Endpoints

### **Portal APIs** (Active)
```
GET  /api/portal-overview?clientId={id}
└── Returns: aggregated stats, recent activity, upcoming deadlines

GET  /api/portal-annotations?airtable_record_id={id}&client_id={id}
POST /api/portal-annotations
├── Body: { airtable_record_id, design_file_id, x_position, y_position, comment }
└── Returns: saved annotation

PATCH /api/portal-annotations
└── Body: { id, updates }

DELETE /api/portal-annotations?id={id}

GET  /api/portal-requests?clientId={id}&status={status}
POST /api/portal-requests
├── Body: { client_id, title, request_type, priority, description }
└── Returns: created request

PATCH /api/portal-requests
DELETE /api/portal-requests?id={id}
```

### **Analytics APIs**
```
GET /api/dashboard?clientSlug={slug}&timeframe={days}
└── Returns: comprehensive dashboard data

POST /api/sync
└── Syncs all Klaviyo data for all clients

POST /api/sync/{clientId}
└── Syncs specific client
```

### **Client Management APIs**
```
GET  /api/clients
POST /api/clients
PATCH /api/clients/{id}
DELETE /api/clients/{id}
```

### **User Management APIs**
```
GET  /api/users
POST /api/users/invite
```

### **Airtable Integration** (In Development)
```
POST /api/sync-to-airtable
├── Body: { client, campaign }
└── Auto-syncs portal changes to Airtable

POST /api/load-from-airtable
└── Import existing Airtable campaigns
```

---

## 📁 Component Structure

### **Portal Components** (`/components/portal/`)
```
portal/
├── clean-portal-dashboard.tsx      → Main portal wrapper
├── portal-dashboard.tsx            → Portal entry point
├── dashboard-overview.tsx          → Overview tab
├── campaign-approval-calendar.tsx  → Campaign calendar view
├── enhanced-live-calendar.tsx      → ⭐ Live CRUD calendar
├── campaign-calendar.tsx           → Basic calendar
├── campaign-builder.tsx            → Campaign creation form
├── flow-progress-tracker.tsx       → Flow review interface
├── flow-email-review.tsx           → Individual flow email feedback
├── ab-test-manager.tsx             → A/B test management
├── enhanced-requests.tsx           → Multi-type request system
├── campaign-requests.tsx           → Basic request form
├── dynamic-forms.tsx               → Custom form builder
├── unified-campaign-portal.tsx     → Unified view (deprecated?)
└── live-editable-calendar.tsx      → Calendar with editing (deprecated?)
```

### **Agency Components** (`/components/agency/`)
```
agency/
├── portal-management.tsx           → Agency admin portal hub
├── agency-admin-dashboard.tsx      → Agency dashboard
├── agency-settings.tsx             → Agency configuration
├── client-management.tsx           → Client CRUD
├── user-management.tsx             → User invitation
├── SyncDebugPanel.tsx             → Sync diagnostics
└── MetricSelectorModal.tsx        → Metric configuration
```

### **Dashboard Components** (`/components/dashboard/`)
```
dashboard/
├── modern-dashboard.tsx            → Main analytics dashboard
├── AIAssistant.tsx                → Claude AI chat integration
├── charts.tsx                     → Reusable chart components
├── metrics-grid.tsx               → KPI cards
├── campaign-table.tsx             → Campaign performance table
├── flow-table.tsx                 → Flow performance table
├── subject-line-insights.tsx      → Subject line analysis
└── revenue-attribution.tsx        → Revenue breakdown
```

---

## ✅ Current Status

### **✔️ Fully Functional**
- ✅ Client dashboard with analytics
- ✅ Portal toggle between Analytics/Portal views
- ✅ Campaign approval calendar
- ✅ Flow progress tracker
- ✅ A/B test manager UI
- ✅ Client request submission
- ✅ Agency admin dashboard
- ✅ **Live calendar with CRUD operations**
- ✅ **Auto-sync to Airtable** (on EnhancedLiveCalendar)
- ✅ User authentication & authorization
- ✅ Row Level Security (RLS)
- ✅ Brand color customization
- ✅ Background image support
- ✅ Logo integration
- ✅ Figma file linking
- ✅ AI Assistant integration (Claude)

### **🟡 Partially Implemented**
- 🔄 Design annotations (API ready, needs loading from DB)
- 🔄 Portal requests API (API ready, needs full workflow)
- 🔄 A/B test results tracking (UI ready, needs API integration)
- 🔄 Airtable bidirectional sync (one-way working)
- 🔄 Campaign builder (UI ready, needs save logic)
- 🔄 Flow creator (UI placeholder only)

### **❌ Not Started**
- ❌ Real-time collaboration (WebSockets)
- ❌ Advanced notification system
- ❌ Mobile app version
- ❌ Template library management
- ❌ Brand asset management
- ❌ Content hub implementation
- ❌ Internal CRM (exists on branch `crm-work-backup`)

---

## 🎯 Improvement Opportunities

### **High Priority**

#### 1. **Complete Airtable Bidirectional Sync**
**Current:** One-way sync (portal → Airtable) working on EnhancedLiveCalendar  
**Needed:** 
- Airtable → Portal sync (import existing campaigns)
- Real-time webhook listeners for Airtable changes
- Conflict resolution strategy
- Sync status dashboard

**Files to modify:**
- Create `/app/api/sync-from-airtable/route.ts`
- Update `/components/portal/enhanced-live-calendar.tsx` to load from DB
- Add webhook endpoint `/app/api/webhooks/airtable/route.ts`

#### 2. **Load Annotations from Database**
**Current:** Annotation API fully functional, but UI doesn't load existing annotations  
**Needed:**
- Add `useEffect` to load annotations on component mount
- Display annotations on design images
- Add annotation resolution workflow

**File to modify:**
- `/components/portal/campaign-approval-calendar.tsx`

```typescript
// Add to component
useEffect(() => {
  const loadAnnotations = async () => {
    const response = await fetch(`/api/portal-annotations?airtable_record_id=${recordId}&client_id=${clientId}`)
    const data = await response.json()
    setAnnotations(data.annotations)
  }
  loadAnnotations()
}, [recordId, clientId])
```

#### 3. **Complete Campaign Builder Save Logic**
**Current:** Campaign builder UI exists, but doesn't save to database  
**Needed:**
- Save to `campaign_approvals` table
- Set status to 'client_approval' when ready
- Link to EnhancedLiveCalendar
- Auto-sync to Airtable

**File to modify:**
- `/components/portal/campaign-builder.tsx`
- Create save handler that calls `/api/portal-approvals` (new endpoint)

#### 4. **Implement Portal Requests Workflow**
**Current:** API endpoints exist, UI can submit requests  
**Needed:**
- Request inbox for agency admins
- Status update workflow
- Assignment to team members
- Notification system
- Request → Campaign conversion

**Files to modify:**
- `/components/portal/enhanced-requests.tsx` - add load functionality
- `/components/agency/portal-management.tsx` - add request management view

---

### **Medium Priority**

#### 5. **Flow Creator Implementation**
**Current:** Placeholder UI only  
**Needed:**
- Multi-step flow builder
- Email sequence configuration
- Trigger setup
- Flow approval workflow

**New component needed:**
- `/components/portal/flow-builder.tsx`

#### 6. **Template Library**
**Current:** UI placeholder  
**Needed:**
- Email template storage
- Template categorization
- Template preview
- Apply to campaigns

**New tables needed:**
```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY,
  agency_id UUID REFERENCES agencies,
  template_name TEXT,
  html_content TEXT,
  thumbnail_url TEXT,
  category TEXT,
  created_at TIMESTAMP
);
```

#### 7. **Enhanced Analytics in Portal**
**Current:** Analytics in separate view  
**Needed:**
- Campaign performance preview in approval calendar
- Flow metrics in flow tracker
- A/B test results visualization
- Revenue attribution per campaign

---

### **Low Priority**

#### 8. **Real-time Collaboration**
- WebSocket integration for live updates
- User presence indicators
- Live annotation placement
- Conflict resolution

#### 9. **Mobile Optimization**
- Responsive portal layout
- Touch-friendly annotation controls
- Mobile-optimized calendar

#### 10. **Advanced Notifications**
- Email notifications for approvals
- Slack integration
- In-app notification center
- Digest emails

---

## 🔧 Technical Debt

### **Code Quality**
- [ ] Add TypeScript strict mode
- [ ] Create shared types file for Portal interfaces
- [ ] Extract repeated API call logic into hooks
- [ ] Add error boundaries
- [ ] Implement loading skeletons

### **Performance**
- [ ] Add React Query for data caching
- [ ] Implement virtual scrolling for large calendars
- [ ] Optimize image loading (lazy load, WebP)
- [ ] Add service worker for offline support

### **Testing**
- [ ] Add unit tests for components
- [ ] Add integration tests for API routes
- [ ] Add E2E tests with Playwright/Cypress
- [ ] Add visual regression tests

### **Documentation**
- [ ] Add JSDoc comments to all functions
- [ ] Create API documentation with OpenAPI
- [ ] Add onboarding guide for new clients
- [ ] Create video tutorials for portal usage

---

## 🚀 Quick Wins

### **Easy Improvements (1-2 hours each)**

1. **Add "Last Synced" Timestamp Display**
```tsx
// In EnhancedLiveCalendar, show when each campaign was last synced
{campaign.last_sync && (
  <span className="text-xs text-gray-500">
    Synced {formatDistanceToNow(campaign.last_sync)} ago
  </span>
)}
```

2. **Add Bulk Actions to Calendar**
```tsx
// Select multiple campaigns and:
// - Batch update status
// - Batch sync to Airtable
// - Batch delete
```

3. **Add Campaign Search/Filter**
```tsx
// Filter calendar by:
// - Campaign name
// - Status
// - Type (email/SMS)
// - Date range
```

4. **Add Export Functionality**
```tsx
// Export calendar to:
// - CSV
// - PDF
// - iCal
```

5. **Add Color-Coded Priorities**
```tsx
// Visual priority indicators:
// - Red border: Urgent
// - Orange border: High
// - Blue border: Medium
// - Gray border: Low
```

---

## 📊 Database Migration Checklist

### **Essential Tables** (Run in Supabase SQL Editor)

✅ Already in production:
- `agencies`
- `clients`
- `user_profiles`
- `campaign_metrics`
- `flow_metrics`
- `campaign_approvals`
- `flow_approvals`
- `flow_email_approvals`
- `campaign_requests`
- `ab_tests`
- `ab_test_variants`

⚠️ **May need to run:**
```sql
-- Check if these exist:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'design_annotations',
  'design_likes',
  'portal_campaign_sync_log',
  'portal_requests',
  'ab_test_results'
);

-- If missing, run:
-- /database/portal_features_tables.sql
```

---

## 🎨 Branding & Customization

### **Agency Branding** (applies to all client dashboards)
```sql
UPDATE agencies 
SET 
  primary_color = '#1E40AF',
  secondary_color = '#3B82F6',
  background_image_url = 'https://your-cdn.com/bg.jpg',
  logo_url = 'https://your-cdn.com/logo.png'
WHERE agency_slug = 'your-agency';
```

### **Client Branding** (overrides agency for specific client)
```sql
UPDATE clients 
SET 
  primary_color = '#DC2626',
  secondary_color = '#EF4444',
  logo_url = 'https://your-cdn.com/client-logo.png',
  figma_url = 'https://figma.com/file/...'
WHERE brand_slug = 'client-slug';
```

---

## 🔐 Security & Access Control

### **User Roles**
```typescript
type UserRole = 'agency_admin' | 'client_user'

// Future expansion ready:
type ExtendedRole = 
  | 'agency_admin'
  | 'client_user'
  | 'copywriter'
  | 'designer'
  | 'pm'
  | 'strategist'
  | 'qa'
  | 'implementor'
```

### **Row Level Security (RLS)**
All portal tables have RLS policies:
- ✅ Agency admins: Full access to all client data
- ✅ Client users: Access only to their own data
- ✅ Prevents cross-client data leaks
- ✅ Enforced at database level

---

## 📝 Next Steps Recommendation

### **Week 1: Complete Critical Features**
1. ✅ Load annotations from database
2. ✅ Complete campaign builder save logic
3. ✅ Implement portal requests workflow
4. ✅ Add Airtable import functionality

### **Week 2: Enhance User Experience**
1. ✅ Add search/filter to calendar
2. ✅ Add bulk actions
3. ✅ Add export options
4. ✅ Improve mobile responsiveness

### **Week 3: Analytics Integration**
1. ✅ Show campaign performance in approval calendar
2. ✅ Add flow metrics to flow tracker
3. ✅ Visualize A/B test results
4. ✅ Add revenue attribution per campaign

### **Week 4: Polish & Deploy**
1. ✅ Add comprehensive error handling
2. ✅ Add loading states
3. ✅ Write documentation
4. ✅ User acceptance testing
5. ✅ Production deployment

---

## 🎯 Summary

Your portal system is **well-architected** with:
- ✅ Strong database foundation
- ✅ Comprehensive component library
- ✅ Working API endpoints
- ✅ Security implemented (RLS)
- ✅ Core features functional

**Main gaps:**
- 🔄 Some UI components not connected to database
- 🔄 Airtable sync is one-way (portal → Airtable)
- 🔄 Missing workflow automation
- 🔄 Limited testing coverage

**Biggest win available:**
The **Live Calendar with Auto-Sync** is your standout feature. It's fully functional and provides immediate value during client calls. Focus on making it even better with:
- Historical campaign import from Airtable
- Performance metrics overlay
- Duplicate campaign feature
- Campaign templates

---

**Questions or specific work needed? Let me know what area you'd like to focus on!** 🚀

