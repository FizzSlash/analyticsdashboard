# Call Agendas & 30/60/90 Day Plans Implementation

**Date:** December 1, 2025  
**Status:** IN PROGRESS - Foundation Complete

---

## Progress Summary

### ✅ COMPLETED

#### 1. Database Schema
**File:** `database/add_call_agendas_and_plans.sql`

Created 5 new tables:
- `call_questions` - Client-submitted questions/topics for calls
- `call_action_items` - Action items assigned to clients from calls  
- `call_approvals` - Items discussed in calls that need approval
- `strategic_plans` - 30/60/90 day strategic plans
- `plan_initiatives` - Individual goals within each 30/60/90 phase

Enhanced existing:
- `ops_calls` table - Added `show_in_portal` and `agenda_link` columns
- `clients` table - Added `enable_portal_call_agendas` and `enable_portal_plans` columns

Includes:
- Full RLS policies for security
- Proper indexes for performance
- Auto-update timestamps
- Cascade deletes

#### 2. Client Management Form
**File:** `components/agency/client-management.tsx`

Added portal tab visibility controls:
- Call Agendas checkbox
- 30/60/90 Plans checkbox

Both default to enabled for new clients.

#### 3. API Routes Updated
**Files:** 
- `app/api/clients/route.ts` (POST)
- `app/api/clients/[id]/route.ts` (PATCH)

Both routes now handle the two new tab visibility settings.

#### 4. Portal Dashboard Structure
**File:** `components/portal/clean-portal-dashboard.tsx`

Added tabs to navigation:
- Call Agendas tab (Phone icon)
- 30/60/90 Plans tab (Target icon)

Currently showing placeholder content until full components are built.

---

### 🔨 TODO - Remaining Work

#### 5. API Routes for Features
**Need to create:**

`app/api/call-agendas/route.ts` - GET/POST calls for portal
`app/api/call-questions/route.ts` - GET/POST/PATCH client questions
`app/api/call-action-items/route.ts` - GET/PATCH client action items
`app/api/call-approvals/route.ts` - GET/PATCH client approvals
`app/api/strategic-plans/route.ts` - GET plans for client
`app/api/plan-initiatives/route.ts` - GET initiatives for plan
`app/api/ops/calls/route.ts` - CRUD for ops call management
`app/api/ops/strategic-plans/route.ts` - CRUD for ops plan management

#### 6. Portal Component: Call Agendas
**File:** `components/portal/call-agendas.tsx` (NEW)

**Features:**
- Show upcoming call with agenda link
- Client can add questions/topics
- Show past calls with:
  - Recording link
  - Call summary
  - Action items (checkable)
  - Approvals needed (checkable)

#### 7. Portal Component: 30/60/90 Day Plans
**File:** `components/portal/strategic-plans.tsx` (NEW)

**Features:**
- Show current plan
- Display three phases (30, 60, 90 days)
- Show initiatives with status:
  - Not Started (gray)
  - In Progress (blue)
  - Completed (green)
- Overall progress calculation
- Clean, inspiring design

#### 8. Ops Component: Call Agendas Manager
**Location:** Create new component or integrate into existing calls

**Features:**
- Create upcoming calls (with agenda link)
- Edit existing calls
- See client questions submitted
- Add call summary, recording
- Assign action items to client
- Mark items as discussed
- Toggle `show_in_portal` per call

#### 9. Ops Component: 30/60/90 Plans Manager
**Location:** `components/ops/scope-tracker.tsx` or new tab in Scope

**Features:**
- Create new strategic plan
- Add initiatives to each phase (30, 60, 90)
- Set phase focus (e.g., "List Growth")
- Update initiative status
- Add target metrics and progress
- Archive old plans

---

## Design Specifications

### Call Agendas Portal View

```
┌──────────────────────────────────────────────────────┐
│ Upcoming Call                                        │
│ Weekly Strategy Call - Dec 15, 2025 at 2:00 PM     │
│ [Open Agenda Doc]                                    │
│                                                      │
│ Your Questions/Topics:                              │
│ • Can we test different send times? [You, 2d]      │
│ [+ Add Question/Topic]                              │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ Recent Calls                                         │
│ Nov 28, 2025 - Weekly Strategy Call                │
│ [Watch Recording] [View Notes]                      │
│                                                      │
│ Approvals Needed:                                   │
│ □ Black Friday Email Series                         │
│ □ New Welcome Flow Updates                          │
│                                                      │
│ Your Action Items:                                  │
│ ☑ Send updated logo files [Completed]              │
│ □ Review Q1 calendar [Due: Dec 5]                  │
│                                                      │
│ Call Summary:                                        │
│ Discussed Black Friday performance...               │
└──────────────────────────────────────────────────────┘
```

### 30/60/90 Plans Portal View

```
┌──────────────────────────────────────────────────────┐
│ Q1 2026 Growth Strategy                             │
│ January 1 - March 31, 2026                          │
│ Overall Progress: ████████░░░░ 28%                  │
│                                                      │
│ FIRST 30 DAYS                           60% Done    │
│ Focus: List Growth & Engagement                     │
│ ──────────────────────────────────────────────────  │
│ ✓ Launch new welcome email series                  │
│ ⟳ A/B test subject lines for better opens          │
│ ⟳ Grow email list by 500 new subscribers           │
│ ○ Implement homepage popup                          │
│                                                      │
│ Key Metric: +250 subscribers so far                 │
└──────────────────────────────────────────────────────┘

(Repeat for 60 and 90 day sections)
```

### Status Indicators

**Call Agendas:**
- Upcoming call: Blue border/badge
- Past call: Gray/completed style
- Action items: Checkboxes (green when complete)
- Approvals: Checkboxes (green when approved)

**30/60/90 Plans:**
- ✓ Completed: Green background, checkmark
- ⟳ In Progress: Blue background, loading icon  
- ○ Not Started: Gray background, circle icon
- Progress bars for each phase and overall

---

## Database Workflow

### Call Agendas Flow

```
1. Ops creates upcoming call:
   INSERT INTO ops_calls (show_in_portal=true, agenda_link=URL)

2. Portal displays upcoming call
   Client adds questions:
   INSERT INTO call_questions (call_id, question_text, added_by_client=true)

3. After call, Ops adds:
   - Recording link
   - Call summary
   - Action items: INSERT INTO call_action_items
   - Approvals: INSERT INTO call_approvals

4. Client sees past call and can:
   - Check off action items (UPDATE completed=true)
   - Approve items (UPDATE approved=true)
```

### 30/60/90 Plans Flow

```
1. Ops creates plan:
   INSERT INTO strategic_plans (client_id, plan_name, dates)

2. Ops adds initiatives:
   INSERT INTO plan_initiatives (plan_id, phase='30'|'60'|'90', status)

3. Ops updates status:
   UPDATE plan_initiatives SET status='in_progress'|'completed'

4. Portal calculates progress automatically:
   Count completed / total per phase
```

---

## Next Steps to Complete

1. **Create API Routes** (Priority: HIGH)
   - Build all 8 API routes listed above
   - Test with Postman/Thunder Client

2. **Build Portal Components** (Priority: HIGH)
   - Call Agendas component with full interactivity
   - Strategic Plans component with beautiful design

3. **Build Ops Components** (Priority: MEDIUM)
   - Call manager (enhance existing or new)
   - Strategic Plans manager in Scope section

4. **Testing** (Priority: MEDIUM)
   - Test complete workflow
   - Test RLS policies
   - Test client interactions

5. **Polish** (Priority: LOW)
   - Loading states
   - Error handling
   - Empty states
   - Animations

---

## Files Modified So Far

### Database
- `database/add_call_agendas_and_plans.sql` ✓

### Components
- `components/agency/client-management.tsx` ✓
- `components/portal/clean-portal-dashboard.tsx` ✓

### API
- `app/api/clients/route.ts` ✓
- `app/api/clients/[id]/route.ts` ✓

### Files to Create
- `components/portal/call-agendas.tsx`
- `components/portal/strategic-plans.tsx`
- `components/ops/call-agendas-manager.tsx`
- `components/ops/strategic-plans-manager.tsx`
- `app/api/call-agendas/route.ts`
- `app/api/call-questions/route.ts`
- `app/api/call-action-items/route.ts`
- `app/api/call-approvals/route.ts`
- `app/api/strategic-plans/route.ts`
- `app/api/plan-initiatives/route.ts`
- `app/api/ops/calls/route.ts`
- `app/api/ops/strategic-plans/route.ts`

---

## Estimated Time Remaining

- API Routes: 4-6 hours
- Portal Components: 6-8 hours
- Ops Components: 6-8 hours
- Testing & Polish: 2-3 hours

**Total:** 18-25 hours of development

---

**Current Status:** Foundation is solid. Database schema is complete, tab structure is in place, client settings are ready. Ready to build the actual components and API routes.

