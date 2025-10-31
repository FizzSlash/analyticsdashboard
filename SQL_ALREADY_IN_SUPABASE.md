# SQL Tables Already in Production Supabase
## Brief for Next Agent

---

## ✅ **Tables That Exist in Production:**

### **Core Tables (Working):**
- `agencies` - Agency branding and settings
- `clients` - Client accounts with Klaviyo API keys
- `user_profiles` - User authentication and roles

### **Analytics Tables (Working):**
- `campaign_metrics` - Email campaign performance from Klaviyo
- `flow_metrics` - Automated flow performance
- `audience_metrics` - Subscriber growth and engagement
- `revenue_attribution` - Revenue tracking by source
- `segment_metrics` - Segment data
- `deliverability_metrics` - Email deliverability stats
- `list_growth_metrics` - List growth trends
- `revenue_attribution_metrics` - Revenue attribution tracking
- `flow_message_metrics` - Individual flow email performance

### **Portal Tables (Working):**
- `campaign_approvals` - Campaign approval workflow for clients
- `flow_approvals` - Flow-level approvals
- `flow_email_approvals` - Individual flow email feedback
- `campaign_requests` - Client campaign requests
- `ab_tests` - A/B test tracking (may or may not exist)
- `ab_test_variants` - Test variant performance

---

## ⚠️ **Tables Created But Not Yet Used:**

These SQL files exist in `/database/` but may or may not have been run:

**CRM Tables (in create_team_crm.sql):**
- `crm_campaigns`
- `crm_flows`
- `crm_flow_emails`
- `crm_notifications`
- `crm_workload_logs`
- `crm_comments`
- `crm_ab_tests`
- `crm_popups`
- `crm_scope_items`

**Content Hub Tables (in create_content_hub.sql):**
- `content_documents`
- `content_sections`
- `content_attachments`
- `brand_guidelines`
- `copy_snippets`
- `content_templates`
- `content_quick_links`
- `content_changelog`
- `content_favorites`

**Status:** These tables were created in SQL files but may not be in production Supabase yet.

---

## 📁 **Database Migration Files Available:**

Located in `/database/` folder:
- `schema.sql` - Original core schema
- `create_portal_tables.sql` - Portal/approval system
- `create_team_crm.sql` - Internal CRM (not run yet)
- `create_content_hub.sql` - Content hub (not run yet)
- `create_internal_crm.sql` - Alternative CRM design (not run yet)
- `fix_crm_rls_and_triggers.sql` - RLS policy fixes (not run yet)

---

## 🔑 **Current User Roles:**

The `user_profiles` table supports these roles:
- `agency_admin` - Full access (Reid is this)
- `client_user` - Client portal access only

**Extended roles available but not used yet:**
- `copywriter`, `designer`, `pm`, `strategist`, `qa`, `implementor`

---

## 🌐 **Current Routes That Work:**

### **Client-Facing:**
- `/client/[slug]` - Client dashboard (Analytics + Portal toggle)
- `/login` - Authentication
- `/share/[token]` - Shareable links

### **Agency Admin:**
- `/agency/[slug]/admin` - Manage clients and users

### **API Routes (Working):**
- `/api/dashboard` - Analytics data
- `/api/clients` - Client management
- `/api/sync` - Klaviyo data sync
- `/api/portal/*` - Portal operations
- `/api/ai-assistant` - AI chat

---

## 📝 **Airtable Integration:**

**Current Status:**
- Trying to sync to Airtable (causing issues)
- Want to replace with internal CRM
- Airtable has "Retention" table with 100+ campaigns

**Airtable API:**
- Token: `[Ask Reid for token]`
- Base ID: `appC4CfK2BkIVT0mN`
- Main table: "Retention"

**Airtable Structure:**
- 13-step workflow (too complex)
- Campaigns + Flows + Popups
- Assignees, due dates, copy docs, design files
- See `/scripts/migrate-from-airtable.ts` for full mapping

---

## 🎯 **What Reid Wants (Next Steps):**

### **Goal:**
Build internal CRM to replace Airtable

### **Requirements:**
- **One dashboard for everyone initially** (no role-based complexity yet)
- Sequential workflow: Strategy → Copy → Design → QA → Client Approval → Ready for Schedule → Scheduled
- When status = "Client Approval", auto-create entry in existing `campaign_approvals` table
- Preview image REQUIRED for client approval
- Internal copy editor (no Google Docs)
- Track campaigns AND flows
- Manage client monthly scope (8-20 campaigns/month + 2 flows)
- Content hub for client resources

### **Design System:**
- Glassmorphism styling (bg-white/10, backdrop-blur-md)
- Same colors as existing portal
- Agency branding (background images, colors from `agencies` table)

---

## 🔧 **Technical Notes:**

### **Auth:**
- Supabase Auth
- Row Level Security (RLS) on all tables
- Agency-based access control

### **Styling:**
- Tailwind CSS
- Glassmorphism pattern
- Agency primary_color and secondary_color for branding

### **Integration Points:**
- CRM should auto-create entries in `campaign_approvals` when ready for client
- Link to `campaign_metrics` after campaign sends (analytics data)
- Use existing portal components (already built)

---

## 📦 **Backup:**

All CRM work is saved in git branch: `crm-work-backup`

To see what was built:
```bash
git checkout crm-work-backup
```

Files created (for reference):
- `/app/team/*` - Team dashboard routes
- `/components/crm/*` - CRM components
- `/app/api/crm/*` - CRM API routes
- `/database/create_team_crm.sql` - Database schema
- Multiple documentation files

---

## ✅ **Current State:**

- **Main branch:** Clean, no CRM code
- **Backup branch:** All CRM work preserved
- **Production:** Deploying clean version
- **Database:** Only core tables (no CRM tables added)

**Ready for you to start fresh with the next agent!** 🎯

