# Client Portal Tabs & Admin Management Overview

**Generated:** December 1, 2025  
**Purpose:** Document client portal tabs, how they're edited internally, and what shows on admin dashboard

---

## 1️⃣ Client Portal Tabs (Available Right Now)

### **Location:** Accessed via `/client/[slug]` with Portal toggle enabled

The client portal currently has **7 tabs** available:

| Tab # | Tab Name | Icon | Purpose | Component |
|-------|----------|------|---------|-----------|
| 1 | **Overview** | BarChart3 | Dashboard summary with pending approvals, recent activity, quick actions | `dashboard-overview.tsx` |
| 2 | **Campaigns** | Calendar | Campaign approval calendar - view, approve/reject campaigns | `campaign-approval-calendar-v3.tsx` |
| 3 | **Flows** | Zap | Flow review and approval - rate and comment on flow emails | `flow-progress-tracker-v2.tsx` |
| 4 | **Popups** | MousePointer | Popup campaign approvals | `popup-approval.tsx` |
| 5 | **A/B Tests** | TestTube | View A/B test results and performance | `ab-test-manager-v2.tsx` |
| 6 | **Requests** | FileText | Submit new requests to the agency (campaigns, flows, etc.) | `enhanced-requests.tsx` |
| 7 | **Forms** | ClipboardList | Fill out agency-created custom forms/questionnaires | `dynamic-forms.tsx` |

### **Tab Configuration Code:**

```typescript
// From: components/portal/clean-portal-dashboard.tsx

const portalTabs = [
  { 
    id: 'overview', 
    label: userRole === 'agency_admin' ? 'Dashboard' : 'Overview', 
    icon: BarChart3 
  },
  { 
    id: 'campaigns', 
    label: userRole === 'agency_admin' ? 'Campaign Calendar' : 'Campaigns', 
    icon: Calendar 
  },
  { 
    id: 'flows', 
    label: userRole === 'agency_admin' ? 'Flow Progress' : 'Flows', 
    icon: Zap 
  },
  { 
    id: 'popups', 
    label: 'Popups', 
    icon: MousePointer 
  },
  { 
    id: 'abtests', 
    label: userRole === 'agency_admin' ? 'A/B Test Manager' : 'A/B Tests', 
    icon: TestTube 
  },
  { 
    id: 'requests', 
    label: userRole === 'agency_admin' ? 'Request Management' : 'Requests', 
    icon: FileText 
  },
  { 
    id: 'forms', 
    label: userRole === 'agency_admin' ? 'Form Templates' : 'Forms', 
    icon: ClipboardList 
  }
]
```

### **Key Features Per Tab:**

#### **1. Overview Tab**
- Pending approvals count
- Active requests summary
- Recent activity feed
- Quick action buttons
- Upcoming deadlines

#### **2. Campaigns Tab**
- Monthly calendar view
- Campaign status badges (Draft, Client Approval, Approved, Sent)
- Design preview images
- **Design Annotations:** Click on preview to add comments with X/Y coordinates
- Approve/Request Revisions functionality
- Airtable sync integration

#### **3. Flows Tab**
- List of all flows
- Individual email review within flows
- Rating system (1-5 stars per email)
- Comment on each email
- Request changes checkbox list
- Flow-level approval

#### **4. Popups Tab**
- Popup campaign management
- Similar to campaigns but popup-specific

#### **5. A/B Tests Tab**
- Active tests display
- Variant comparison (A vs B)
- Performance metrics (opens, clicks, revenue)
- Statistical significance
- Winner declaration

#### **6. Requests Tab**
- Submit new requests with form:
  - Request type (email, SMS, flow, popup, A/B test, misc)
  - Priority level
  - Desired completion date
  - Target audience
  - Campaign objectives
  - Description
- View submitted requests
- Track request status

#### **7. Forms Tab**
- Display agency-created custom forms
- Fill out questionnaires
- Response tracking

---

## 2️⃣ How Portal Tabs Are Edited Internally

### **Where Agency Edits Portal Content**

There are **TWO main locations** where agency staff edit portal content:

### **A. Portal Management Tab** (`/agency/[slug]/admin` → Portal tab)

**Location:** `components/agency/portal-management.tsx`

**Available Tabs for Agency:**

| Tab | Purpose | What Can Be Edited |
|-----|---------|-------------------|
| **Portal Overview** | View stats across all clients | Pending approvals, active requests, running tests, campaigns sent |
| **Live Calendar** ⭐ | Real-time campaign CRUD during calls | Create/edit/delete campaigns live, auto-syncs to Airtable |
| **Campaign Creator** | Build campaigns for clients | Campaign details, subject lines, preview images |
| **Flow Creator** | Build flows for clients | Flow sequences, triggers |
| **A/B Test Manager** | Create and manage A/B tests | Test variants, tracking |
| **Client Requests** | View and manage all client requests | Status updates, assignments |
| **Templates & Assets** | Manage reusable content | Email templates, brand assets |

**Code:**
```typescript
// From: components/agency/portal-management.tsx

const managementTabs = [
  { id: 'overview', label: 'Portal Overview', icon: BarChart3 },
  { id: 'livecalendar', label: 'Live Calendar', icon: Calendar }, // ⭐ KEY FEATURE
  { id: 'campaigns', label: 'Campaign Creator', icon: Mail },
  { id: 'flows', label: 'Flow Creator', icon: Zap },
  { id: 'abtests', label: 'A/B Test Manager', icon: TestTube },
  { id: 'requests', label: 'Client Requests', icon: FileText },
  { id: 'templates', label: 'Templates & Assets', icon: Settings }
]
```

### **B. Operations Dashboard** (`/agency/[slug]/ops`)

**Location:** `app/agency/[slug]/ops/page.tsx`

**This is the PRIMARY internal workflow management system**

**Available Tabs:**

| Tab | Purpose | Edits Portal Via |
|-----|---------|------------------|
| **Overview** | Dashboard stats, needs attention | Read-only overview |
| **Campaigns** | Calendar + Pipeline views | Creates campaigns that feed portal approval calendar |
| **Flows** | Flow management | Creates flows that appear in portal |
| **Popups** | Popup management | Creates popups for portal approval |
| **A/B Tests** | Test tracking | Tracks tests visible in portal |
| **Content Hub** | Store client assets | Assets attachable to campaigns |
| **Forms** | Create dynamic forms | Forms clients fill out in portal |
| **View** | Role-based calendars (copywriter, designer, QA, etc.) | Team workflow |
| **Scope** | Track monthly limits | Auto-tracks campaign/flow usage |
| **Settings** | AI prompts configuration | Backend settings |

### **How Ops Dashboard Edits Feed Portal:**

#### **Campaign Workflow:**
```
1. Create campaign in Ops Dashboard
   ↓
2. Set status through workflow: 
   strategy → copy → design → qa → client_approval
   ↓
3. When status = "client_approval"
   ↓
4. Auto-creates entry in campaign_approvals table
   ↓
5. Appears in Client Portal → Campaigns tab
   ↓
6. Client approves/rejects
   ↓
7. (Future: Status updates back in Ops)
```

#### **Request Workflow:**
```
1. Client submits request in Portal → Requests tab
   ↓
2. Stored in campaign_requests table
   ↓
3. (Future: Auto-creates ops_campaigns entry)
   ↓
4. Visible in Ops Dashboard as new campaign
```

---

## 3️⃣ What Shows on Main Admin Dashboard for Each Client

### **Location:** `/agency/[slug]/admin` → Clients tab

**Component:** `components/agency/client-management.tsx`

### **Client Card Display:**

For each client, the admin dashboard shows:

#### **Client Header:**
- **Brand Name** (large, prominent)
- **Slug** (`/brand-slug`)
- **Status Badge:** 
  - 🟢 "Active" (green) or ⚪ "Inactive" (gray)
- **AI Audit Badge:** 
  - ✨ "AI Audit" (purple) if enabled
- **Last Sync Date**

#### **Action Buttons:**

| Button | Icon | Function |
|--------|------|----------|
| **AI Audit Toggle** | ✨ Sparkles | Enable/disable AI audit feature |
| **Unified Sync** | 🔄 RefreshCw | Sync all data (campaigns, flows, list growth, revenue) |
| **View Dashboard** | 🔗 ExternalLink | Open client dashboard in new tab |
| **Share Link** | 📤 Share2 | Generate shareable public link |
| **Edit Client** | ✏️ Edit | Edit client settings |
| **Delete Client** | 🗑️ Trash2 | Delete client |

#### **Client Branding Display:**
- **Primary Color** preview (color swatch)
- **Secondary Color** preview (color swatch)
- Note: "(from agency)" - shows colors inherited from agency

### **Code Display:**

```tsx
// From: components/agency/client-management.tsx (lines 1577-1713)

<div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6">
  <div className="flex items-center justify-between">
    {/* Left Side - Client Info */}
    <div className="flex items-center gap-4">
      <div>
        <h3 className="text-lg font-semibold text-white">
          {client.brand_name}
        </h3>
        <div className="flex items-center gap-4 text-sm text-white/60">
          <span>/{client.brand_slug}</span>
          
          {/* Active/Inactive Badge */}
          <span className={`px-2 py-1 rounded-full text-xs ${
            client.is_active 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
          }`}>
            {client.is_active ? 'Active' : 'Inactive'}
          </span>
          
          {/* AI Audit Badge */}
          {client.audit_enabled && (
            <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs font-medium border border-purple-500/30">
              <Sparkles className="h-3 w-3" />
              AI Audit
            </span>
          )}
          
          {/* Last Sync */}
          {client.last_sync && (
            <span>
              Last sync: {new Date(client.last_sync).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>

    {/* Right Side - Action Buttons */}
    <div className="flex items-center gap-2">
      {/* AI Audit Toggle */}
      <button onClick={() => toggleAudit(client)}>
        <Sparkles className="h-4 w-4" />
      </button>

      {/* Unified Sync Button */}
      <button onClick={() => syncAllData(client)}>
        <RefreshCw className="h-4 w-4" />
      </button>
      
      {/* View Dashboard */}
      <a href={`/client/${client.brand_slug}`} target="_blank">
        <ExternalLink className="h-4 w-4" />
      </a>

      {/* Share Link */}
      <button onClick={() => generateShareLink(client)}>
        <Share2 className="h-4 w-4" />
      </button>

      {/* Edit */}
      <button onClick={() => handleEdit(client)}>
        <Edit className="h-4 w-4" />
      </button>

      {/* Delete */}
      <button onClick={() => handleDelete(client)}>
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  </div>

  {/* Client Colors Preview */}
  <div className="mt-4 flex items-center gap-4">
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded border" 
           style={{ backgroundColor: agency.primary_color }} />
      <span className="text-xs text-white/60">Primary</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded border" 
           style={{ backgroundColor: agency.secondary_color }} />
      <span className="text-xs text-white/60">Secondary</span>
    </div>
    <span className="text-xs text-white/50 italic">(from agency)</span>
  </div>
</div>
```

### **Admin Dashboard Has 4 Main Tabs:**

| Tab | Purpose |
|-----|---------|
| **Overview** | Agency-wide statistics, sync all clients |
| **Clients** ⭐ | List all clients with cards (shown above) |
| **Users** | Invite and manage user accounts |
| **Settings** | Agency branding, colors, logo, background |

---

## 🔗 Integration Summary

### **How Systems Connect:**

```
┌─────────────────────────────────────┐
│   ADMIN DASHBOARD                   │
│   /agency/[slug]/admin              │
│                                     │
│   Tabs:                             │
│   • Overview                        │
│   • Clients ← Shows client cards    │
│   • Users                           │
│   • Settings                        │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   OPS DASHBOARD (Internal)          │
│   /agency/[slug]/ops                │
│                                     │
│   Create & Edit:                    │
│   • Campaigns → Portal Campaigns    │
│   • Flows → Portal Flows            │
│   • Popups → Portal Popups          │
│   • Forms → Portal Forms            │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   CLIENT PORTAL                     │
│   /client/[slug]                    │
│                                     │
│   7 Tabs:                           │
│   • Overview                        │
│   • Campaigns ← View/Approve        │
│   • Flows ← Review/Approve          │
│   • Popups ← Approve                │
│   • A/B Tests ← View Results        │
│   • Requests ← Submit New           │
│   • Forms ← Fill Out                │
└─────────────────────────────────────┘
```

---

## 🎯 Quick Reference

### **To Edit Portal Content:**

1. **Live during client calls:**
   - Go to Admin Dashboard → Portal tab → Live Calendar
   - Create/edit campaigns in real-time

2. **For campaign workflow management:**
   - Go to Ops Dashboard → Campaigns tab
   - Move through workflow stages
   - When status = "client_approval" → appears in client portal

3. **To create forms for clients:**
   - Go to Ops Dashboard → Forms tab
   - Build custom forms
   - Clients see them in Portal → Forms tab

4. **To manage client requests:**
   - Go to Admin Dashboard → Portal tab → Client Requests
   - View all submitted requests
   - Update status/assignments

### **To View What Clients See:**

1. Click "View Dashboard" button on any client card
2. Toggle to "Portal" view using Analytics/Portal toggle
3. See exact client perspective

---

**End of Document**

