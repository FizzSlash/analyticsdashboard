# Portal Tab Customization Feature

**Date:** December 1, 2025  
**Feature:** Customize which portal tabs are visible for each client  
**Status:** ✅ Complete and Ready to Use

---

## 🎯 Feature Overview

You can now customize which portal tabs each client sees when they log into their portal. This gives you granular control over the client experience - hiding tabs they don't need and showing only what's relevant to them.

### **Example Use Cases:**

- 🚫 Hide "Forms" tab for clients who don't need custom forms
- 🚫 Hide "A/B Tests" tab for basic clients who only need campaign approvals
- 🚫 Hide "Flows" tab for email-only clients
- 🚫 Hide "Requests" tab if you want clients to communicate via other channels
- ✅ Show only "Campaigns" and "Overview" for simple approval-only clients

---

## 📋 How to Use This Feature

### **Step 1: Run the Database Migration**

First, you need to add the new columns to your database:

```sql
-- Run this in Supabase SQL Editor
-- File: database/add_portal_tab_visibility_settings.sql
```

This adds 7 new columns to the `clients` table:
- `enable_portal_overview` (default: true)
- `enable_portal_campaigns` (default: true)
- `enable_portal_flows` (default: true)
- `enable_portal_popups` (default: true)
- `enable_portal_abtests` (default: true)
- `enable_portal_requests` (default: true)
- `enable_portal_forms` (default: true)

**All existing clients will have all tabs enabled by default** (backwards compatible).

### **Step 2: Edit Client Settings**

1. Go to **Admin Dashboard** (`/agency/[slug]/admin`)
2. Click **Clients** tab
3. Click the **Edit** button (✏️) on any client card
4. Look for the **"Portal Tab Visibility"** section

You'll see a checkbox grid like this:

```
Portal Tab Visibility
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Select which tabs this client can see in their portal.
At least one tab must be enabled.

☑ Overview          ☑ Campaigns
☑ Flows             ☑ Popups
☑ A/B Tests         ☑ Requests
☑ Forms
```

### **Step 3: Customize Tabs**

- **Check** the boxes for tabs you want the client to see
- **Uncheck** the boxes for tabs you want to hide
- Click **"Update Client"** to save

**That's it!** The changes take effect immediately.

---

## 🖼️ What Clients See

### **Before (All Tabs Visible):**

```
┌─────────────────────────────────────────────┐
│  Client Portal                              │
├─────────────────────────────────────────────┤
│ [Overview] [Campaigns] [Flows] [Popups]    │
│ [A/B Tests] [Requests] [Forms]              │
└─────────────────────────────────────────────┘
```

### **After (Customized - Example):**

If you uncheck Flows, Popups, and Forms:

```
┌─────────────────────────────────────────────┐
│  Client Portal                              │
├─────────────────────────────────────────────┤
│ [Overview] [Campaigns] [A/B Tests]          │
│ [Requests]                                  │
└─────────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### **Files Modified:**

1. **Database Migration:**
   - `database/add_portal_tab_visibility_settings.sql` ← NEW

2. **Client Management (Admin UI):**
   - `components/agency/client-management.tsx`
     - Added `ClientFormData` interface fields
     - Added "Portal Tab Visibility" checkbox section
     - Updated form submit handlers

3. **Portal Dashboard (Client UI):**
   - `components/portal/clean-portal-dashboard.tsx`
     - Added tab filtering logic
     - Added `useEffect` to ensure valid active tab
     - Agency admins always see all tabs

4. **API Routes:**
   - `app/api/clients/route.ts` (POST - Create)
     - Added tab visibility fields to `clientData`
   - `app/api/clients/[id]/route.ts` (PATCH - Update)
     - Added tab visibility fields to `updateData`

### **How It Works:**

```typescript
// 1. Portal defines all available tabs with enabledKey
const allPortalTabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3, enabledKey: 'enable_portal_overview' },
  { id: 'campaigns', label: 'Campaigns', icon: Calendar, enabledKey: 'enable_portal_campaigns' },
  // ... etc
]

// 2. Filter tabs based on client settings
const portalTabs = userRole === 'agency_admin' 
  ? allPortalTabs // Agency admins see all tabs
  : allPortalTabs.filter(tab => {
      const isEnabled = clientInfo[tab.enabledKey]
      return isEnabled !== false // Show if true or undefined
    })

// 3. Auto-switch to first available tab if current tab is hidden
useEffect(() => {
  const isActiveTabAvailable = portalTabs.some(tab => tab.id === activeTab)
  if (!isActiveTabAvailable && portalTabs.length > 0) {
    setActiveTab(portalTabs[0].id)
  }
}, [portalTabs, activeTab])
```

---

## 🎨 UI/UX Design

### **Client Edit Form - Portal Tab Visibility Section:**

```tsx
{formData.enable_portal && (
  <div className="md:col-span-2">
    <label>Portal Tab Visibility</label>
    <div className="bg-gray-50 border rounded-lg p-4">
      <p className="text-xs text-gray-600 mb-3">
        Select which tabs this client can see in their portal.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {/* 7 checkboxes for each tab */}
        <label>
          <input type="checkbox" checked={formData.enable_portal_overview} />
          <span>Overview</span>
        </label>
        {/* ... more checkboxes */}
      </div>
    </div>
  </div>
)}
```

**Key Design Decisions:**
- ✅ Only shows when Portal is enabled
- ✅ Clear visual grouping with border and background
- ✅ 2-column grid for compact layout
- ✅ Helpful instruction text

---

## 🔒 Security & Permissions

### **Agency Admins:**
- ✅ Can see and edit all tab visibility settings
- ✅ Always see ALL tabs in portal (not affected by client settings)
- ✅ Full control over client experience

### **Client Users:**
- ✅ Only see tabs that are enabled for their client
- ✅ Cannot modify their own tab visibility
- ✅ If current tab is disabled, auto-switched to first available tab

---

## 💾 Database Schema

### **Columns Added to `clients` Table:**

| Column Name | Type | Default | Description |
|-------------|------|---------|-------------|
| `enable_portal_overview` | BOOLEAN | `true` | Show Overview tab |
| `enable_portal_campaigns` | BOOLEAN | `true` | Show Campaigns tab |
| `enable_portal_flows` | BOOLEAN | `true` | Show Flows tab |
| `enable_portal_popups` | BOOLEAN | `true` | Show Popups tab |
| `enable_portal_abtests` | BOOLEAN | `true` | Show A/B Tests tab |
| `enable_portal_requests` | BOOLEAN | `true` | Show Requests tab |
| `enable_portal_forms` | BOOLEAN | `true` | Show Forms tab |

**All columns default to `true`** to maintain backwards compatibility.

### **Example Database Queries:**

```sql
-- Hide Forms and A/B Tests for a specific client
UPDATE clients 
SET 
  enable_portal_forms = false,
  enable_portal_abtests = false
WHERE brand_slug = 'hydrus';

-- Show only Campaigns tab (minimal portal)
UPDATE clients 
SET 
  enable_portal_overview = true,
  enable_portal_campaigns = true,
  enable_portal_flows = false,
  enable_portal_popups = false,
  enable_portal_abtests = false,
  enable_portal_requests = false,
  enable_portal_forms = false
WHERE brand_slug = 'minimalist-client';

-- Re-enable all tabs
UPDATE clients 
SET 
  enable_portal_overview = true,
  enable_portal_campaigns = true,
  enable_portal_flows = true,
  enable_portal_popups = true,
  enable_portal_abtests = true,
  enable_portal_requests = true,
  enable_portal_forms = true
WHERE brand_slug = 'full-access-client';
```

---

## 🎯 Common Use Cases

### **1. Approval-Only Client (Simple)**
**Needs:** Just campaign approvals, no extra features

**Settings:**
- ✅ Overview
- ✅ Campaigns
- ❌ Flows
- ❌ Popups
- ❌ A/B Tests
- ❌ Requests
- ❌ Forms

**Result:** Clean, minimal portal with just campaign calendar

---

### **2. Email-Only Client (No SMS/Popups)**
**Needs:** Email campaigns and flows only

**Settings:**
- ✅ Overview
- ✅ Campaigns
- ✅ Flows
- ❌ Popups
- ✅ A/B Tests
- ✅ Requests
- ❌ Forms

**Result:** No confusion with popup features they don't use

---

### **3. Strategic Client (Full Access)**
**Needs:** Everything including A/B tests and forms

**Settings:**
- ✅ Overview
- ✅ Campaigns
- ✅ Flows
- ✅ Popups
- ✅ A/B Tests
- ✅ Requests
- ✅ Forms

**Result:** Full-featured portal experience

---

### **4. Communication-Only Client**
**Needs:** Don't want clients submitting requests via portal

**Settings:**
- ✅ Overview
- ✅ Campaigns
- ✅ Flows
- ✅ Popups
- ✅ A/B Tests
- ❌ Requests
- ❌ Forms

**Result:** Approval-only portal, requests handled externally

---

## 🐛 Edge Cases Handled

### **1. No Tabs Enabled**
**Scenario:** All tabs are disabled

**Behavior:** Portal still loads with empty navigation. Consider this a configuration error - at least one tab should be enabled.

**Recommendation:** Always enable at least "Overview" tab.

---

### **2. Current Tab Disabled**
**Scenario:** Client is viewing "Forms" tab, then admin disables it

**Behavior:** 
- Client's page shows empty (tab content won't render)
- On next page refresh, auto-switches to first available tab
- `useEffect` handles switching if tabs change while user is active

---

### **3. Agency Admin View**
**Scenario:** Agency admin views client portal

**Behavior:** Agency admin ALWAYS sees all tabs regardless of client settings. This allows admins to:
- Test all features
- Manage client portal without restrictions
- View hidden tabs for troubleshooting

---

### **4. API Backwards Compatibility**
**Scenario:** Old clients without these columns

**Behavior:**
- Database defaults all columns to `true`
- API checks `!== false` (so `undefined` is treated as `true`)
- Existing clients automatically get all tabs enabled

---

## ✅ Testing Checklist

Before deploying, verify:

- [ ] Database migration runs without errors
- [ ] Can create new client with custom tab settings
- [ ] Can edit existing client and change tab visibility
- [ ] Client portal respects tab visibility settings
- [ ] Agency admin always sees all tabs
- [ ] Tab switching works when current tab is disabled
- [ ] Checkbox states persist after save
- [ ] API includes all fields in create/update

---

## 📊 Benefits

### **For Agency:**
- ✅ **Cleaner client experience** - No overwhelming features
- ✅ **Flexible pricing tiers** - Show features based on plan
- ✅ **Reduce support** - Clients don't see unused features
- ✅ **Professional appearance** - Tailored to each client's needs

### **For Clients:**
- ✅ **Less confusion** - Only see what they need
- ✅ **Faster navigation** - Fewer tabs to click through
- ✅ **Better UX** - Portal feels custom-built for them

---

## 🚀 Future Enhancements

Possible improvements for later:

1. **Bulk Tab Management**
   - Set default tab visibility for new clients
   - Apply tab template to multiple clients at once

2. **Client Tier Presets**
   - "Basic" tier: Overview + Campaigns only
   - "Pro" tier: All tabs except Forms
   - "Enterprise" tier: Everything

3. **Tab Usage Analytics**
   - Track which tabs clients actually use
   - Recommend hiding unused tabs

4. **Dynamic Tab Labels**
   - Rename tabs per client (e.g., "Campaigns" → "Email Approvals")

5. **Tab Ordering**
   - Allow reordering tabs per client
   - Pin important tabs to front

---

## 📝 Summary

**What Changed:**
- ✅ Added 7 new database columns for tab visibility
- ✅ Added "Portal Tab Visibility" section to client edit form
- ✅ Portal now filters tabs based on client settings
- ✅ API supports saving tab visibility settings
- ✅ Agency admins always see all tabs

**How to Use:**
1. Run database migration
2. Edit client → Customize Portal Tab Visibility section
3. Check/uncheck tabs you want client to see
4. Save → Client's portal updates immediately

**Impact:**
- 🎯 Better client experience
- 🎯 More control over features
- 🎯 Professional, tailored portals
- 🎯 Backwards compatible - all existing clients keep all tabs

---

**Feature is now complete and ready to use!** 🎉

