# 🎯 Unified Operating System - Complete Strategy

**Date:** October 31, 2025  
**Approach:** Single unified dashboard for all team members (no role complexity)  
**Philosophy:** Start simple, iterate based on real usage

---

## 📋 Table of Contents
1. [Strategy Overview](#strategy-overview)
2. [System Architecture](#system-architecture)
3. [Core Features](#core-features)
4. [Data Flow](#data-flow)
5. [Implementation Roadmap](#implementation-roadmap)
6. [Future Improvements](#future-improvements)

---

## 🎯 Strategy Overview

### **The Problem You're Solving:**

**Current State (Airtable Workflow):**
```
1. Client calls → Manual notes
2. Open Airtable → Create record
3. Assign to copywriter (manually)
4. Copywriter writes copy → Updates Airtable
5. Designer gets notified → Creates design
6. Upload to Airtable → Link design file
7. QA checks → Updates status
8. Send to client for approval → Email/portal
9. Client approves → Update Airtable
10. Implementor schedules → Update Airtable
11. Campaign sends → Check Klaviyo for metrics
12. Manually track scope → Spreadsheet

ISSUES:
- 😫 Too many manual steps
- 🔄 Context switching between tools
- 📊 Metrics separated from workflow
- 💸 Paying $50/month for Airtable
- 🐌 No real-time updates
- 😕 Clients can't see progress
```

**New State (Unified OS):**
```
1. Client calls → Create campaign live during call
2. Campaign auto-appears in team dashboard
3. Everyone sees it → First available person claims it
4. Progress tracked in real-time → Status updates
5. Client approves in portal → Instant team notification
6. Implementor schedules → Links to Klaviyo
7. Performance auto-syncs → Visible in dashboard
8. Scope auto-tracked → No manual counting

BENEFITS:
- ✅ One unified interface
- ✅ Real-time collaboration
- ✅ Metrics integrated
- ✅ Zero extra cost
- ✅ Instant updates
- ✅ Client visibility built-in
```

---

## 🏗️ System Architecture

### **The Three-Layer Cake:**

```
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 1: ANALYTICS                       │
│                  (What Happened - Metrics)                  │
├─────────────────────────────────────────────────────────────┤
│  Route: /client/[slug] (Analytics view)                     │
│                                                             │
│  Shows:                                                     │
│  • Campaign performance (opens, clicks, revenue)            │
│  • Flow metrics (completion rate, revenue)                 │
│  • Subject line insights                                   │
│  • List growth trends                                      │
│  • AI Assistant for insights                               │
│                                                             │
│  Data Source: Synced from Klaviyo daily                    │
└─────────────────────────────────────────────────────────────┘
                            ↕️
              (Same database, different view)
                            ↕️
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 2: CLIENT PORTAL                   │
│                   (What's Next - Approvals)                 │
├─────────────────────────────────────────────────────────────┤
│  Route: /client/[slug] (Portal view - toggle)               │
│                                                             │
│  Shows:                                                     │
│  • Campaign calendar (upcoming campaigns)                   │
│  • Approve/reject campaigns                                │
│  • Approve/reject flows                                    │
│  • View A/B test results                                   │
│  • Submit new requests                                     │
│  • Leave feedback/annotations                              │
│                                                             │
│  User: Clients only                                        │
└─────────────────────────────────────────────────────────────┘
                            ↕️
              (Updates flow to internal team)
                            ↕️
┌─────────────────────────────────────────────────────────────┐
│                  LAYER 3: INTERNAL OS ⭐                    │
│                (What We're Doing - Workflow)                │
├─────────────────────────────────────────────────────────────┤
│  Route: /ops (or /team)                                     │
│                                                             │
│  Shows:                                                     │
│  • Master campaign calendar (all clients)                   │
│  • Campaign pipeline (strategy → live)                      │
│  • Flow pipeline                                           │
│  • Content hub (per-client assets)                         │
│  • Scope tracking (monthly limits)                         │
│  • Call recordings                                         │
│  • Team activity feed                                      │
│                                                             │
│  Users: ALL team members (no role restrictions!)           │
│  Access: Everyone sees everything, anyone can do anything  │
└─────────────────────────────────────────────────────────────┘
```

### **Database: Single Source of Truth**

```sql
SUPABASE DATABASE
├── Core Tables
│   ├── agencies (your agency info)
│   ├── clients (all your clients)
│   └── user_profiles (team + client users)
│
├── Analytics Tables (← Klaviyo sync)
│   ├── campaign_metrics
│   ├── flow_metrics
│   ├── audience_metrics
│   └── revenue_attribution
│
├── Client Portal Tables
│   ├── campaign_approvals (campaigns awaiting client approval)
│   ├── flow_approvals (flows awaiting approval)
│   ├── campaign_requests (client-submitted requests)
│   └── design_annotations (client feedback on designs)
│
└── Internal OS Tables (← NEW!)
    ├── ops_campaigns (master campaign tracking)
    ├── ops_flows (flow production tracking)
    ├── ops_content (content hub - assets, notes)
    ├── ops_scope (monthly scope tracking)
    ├── ops_calls (call recordings)
    └── ops_activity (team activity log)
```

---

## 🎨 Core Features

### **1. Master Campaign Calendar**

**What It Does:**
- Visual calendar showing ALL campaigns for ALL clients
- Color-coded by client
- Status badges (Strategy → Copy → Design → QA → Client Approval → Scheduled → Sent)
- Click any date to add campaign
- Click any campaign to edit details
- Drag & drop to reschedule

**Example View:**
```
October 2025

Mon 27          Tue 28              Wed 29              Thu 30
────────────────────────────────────────────────────────────────
                Hydrus              Hydrus
                Black Friday        Welcome Email
                [Client Approval]   [Design] 🎨
                
                Peak Design         Make Waves
                Newsletter          Product Launch
                [QA] ✅            [Copy] ✏️

────────────────────────────────────────────────────────────────

📊 This Week: 12 campaigns | 3 need attention | 2 ready to schedule
```

**Features:**
- ✅ Filter by client
- ✅ Filter by status
- ✅ Search campaigns
- ✅ Bulk actions (change status, assign date)
- ✅ Export to CSV/PDF
- ✅ Month/week/day views
- ✅ "Today's Focus" widget

---

### **2. Campaign Pipeline (Kanban Board)**

**What It Does:**
- Kanban-style board showing campaign workflow
- Columns: Strategy → Copy → Design → QA → Client Approval → Scheduled → Sent
- Drag campaigns between columns to update status
- Shows who's working on what (optional)
- Cards show: Client name, campaign name, due date, priority

**Example View:**
```
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│  Strategy   │    Copy     │   Design    │     QA      │   Client    │
│             │             │             │             │  Approval   │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│             │             │             │             │             │
│ [Hydrus]    │ [Peak]      │ [Hydrus]    │ [Make Wave] │ [Peak]      │
│ Holiday     │ Newsletter  │ Black Fri   │ Welcome     │ Product     │
│ Strategy    │ Due: Oct 30 │ Hero Image  │ All links ✓ │ Launch      │
│ 🔴 Urgent   │             │ Due: Oct 31 │             │ ⏰ Waiting  │
│             │             │             │             │             │
│ [Make Wave] │ [Hydrus]    │             │             │             │
│ Q4 Plan     │ Winback     │             │             │             │
│ Due: Nov 1  │ Subject ln  │             │             │             │
│             │             │             │             │             │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘

Quick Stats: 2 urgent | 5 due this week | 3 awaiting client
```

**Features:**
- ✅ Drag & drop between columns
- ✅ Quick add campaign from any column
- ✅ Priority flags (🔴 Urgent, 🟡 High, 🟢 Normal)
- ✅ Due date warnings
- ✅ Click card for full details
- ✅ Bulk move campaigns

---

### **3. Campaign Detail Modal**

**What It Shows:**
```
╔═══════════════════════════════════════════════════════════════╗
║  Black Friday Campaign - Hydrus                          ⚙️ ✖️ ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Status: [Design] 🎨                    Priority: [Urgent] 🔴 ║
║  Send Date: November 24, 2025 6:00 AM   Client: Hydrus       ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │ Campaign Details                                        │ ║
║  ├─────────────────────────────────────────────────────────┤ ║
║  │ Subject Line: Get 50% OFF Everything - Limited Time! 🔥│ ║
║  │ Preview Text: Our biggest sale of the year starts NOW  │ ║
║  │ Target Audience: All subscribers (15,234)              │ ║
║  │ Campaign Type: Promotional                             │ ║
║  └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │ Copy & Design                                           │ ║
║  ├─────────────────────────────────────────────────────────┤ ║
║  │ Copy Doc: [Link to Google Doc] 📝                      │ ║
║  │ Design File: [Link to Figma] 🎨                        │ ║
║  │ HTML Preview: [View in browser] 🌐                     │ ║
║  └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │ Internal Notes                                          │ ║
║  ├─────────────────────────────────────────────────────────┤ ║
║  │ • Client requested blue CTA buttons                     │ ║
║  │ • Include free shipping disclaimer                      │ ║
║  │ • Use product images from Oct photoshoot                │ ║
║  │                                                          │ ║
║  │ [Add note...]                                           │ ║
║  └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │ Activity Log                                            │ ║
║  ├─────────────────────────────────────────────────────────┤ ║
║  │ Oct 28, 2:30 PM - Sarah moved to Design                │ ║
║  │ Oct 27, 4:15 PM - Mike added copy doc                  │ ║
║  │ Oct 27, 10:00 AM - Campaign created                    │ ║
║  └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
║  [Update Status ▼]  [Save]  [Send to Client]  [Delete]      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

**Features:**
- ✅ Edit all fields inline
- ✅ Upload design files
- ✅ Link copy docs
- ✅ Add internal notes
- ✅ See activity history
- ✅ One-click "Send to Client" (creates approval in portal)
- ✅ Attach to call recording
- ✅ View analytics (after sent)

---

### **4. Content Hub**

**What It Does:**
- Store all client assets organized by client
- Brand guidelines, logos, product images, email headers, etc.
- Copy notes per client (tone of voice, common phrases, disclaimers)
- Design notes per client (colors, fonts, style preferences)
- Searchable and taggable

**Example View:**
```
Content Hub

┌─────────────────────────────────────────────────────────────┐
│ Select Client: [Hydrus ▼]                    🔍 Search...   │
└─────────────────────────────────────────────────────────────┘

┌─────────────┬─────────────┬─────────────┬─────────────────┐
│ 📋 Brand    │ 🖼️ Assets  │ ✏️ Copy    │ 🎨 Design      │
│ Guidelines  │            │   Notes     │   Notes         │
└─────────────┴─────────────┴─────────────┴─────────────────┘

📋 Brand Guidelines
├── Brand colors: #FF6B35, #004E89, #F7F7FF
├── Fonts: Montserrat (headings), Open Sans (body)
├── Logo files: [PNG] [SVG] [White version]
├── Tone: Energetic, friendly, health-focused
└── Last updated: Oct 15, 2025

🖼️ Assets (127 files)
├── Logos & Branding (8)
│   ├── hydrus-logo-main.png
│   ├── hydrus-logo-white.png
│   └── favicon.ico
├── Product Images (45)
│   ├── product-hero-blue.jpg
│   ├── product-lifestyle-1.jpg
│   └── ...
├── Email Headers (12)
│   ├── header-sale.jpg
│   ├── header-welcome.jpg
│   └── ...
└── Email Components (62)
    ├── cta-button-blue.png
    ├── social-icons.png
    └── ...

✏️ Copy Notes
┌───────────────────────────────────────────────────────────┐
│ Voice & Tone:                                             │
│ • Active, energetic, inspiring                            │
│ • Use "you" and "your"                                    │
│ • Avoid medical claims                                    │
│                                                           │
│ Key Phrases:                                              │
│ • "Hydrate smarter, not harder"                           │
│ • "Science-backed hydration"                              │
│ • "Your body's best friend"                               │
│                                                           │
│ Legal Requirements:                                       │
│ • Always include: "These statements have not been..."    │
│ • Link to privacy policy in footer                       │
│                                                           │
│ [Edit Notes]                                              │
└───────────────────────────────────────────────────────────┘

🎨 Design Notes
┌───────────────────────────────────────────────────────────┐
│ Design Preferences:                                       │
│ • Hero images must show product in lifestyle setting     │
│ • CTA buttons: Blue (#004E89), rounded corners           │
│ • White space is important - don't cram                   │
│ • Mobile-first design (70% open on mobile)               │
│                                                           │
│ Client Dislikes:                                          │
│ • No all-caps headlines                                   │
│ • Avoid stock photos with models                         │
│ • Don't use red (competitor's color)                     │
│                                                           │
│ [Edit Notes]                                              │
└───────────────────────────────────────────────────────────┘
```

**Features:**
- ✅ Drag & drop file upload
- ✅ Folders/categories
- ✅ Tags for easy finding
- ✅ Search across all clients
- ✅ Quick attach to campaigns
- ✅ Version history
- ✅ File preview (images, PDFs)

---

### **5. Scope Tracker**

**What It Does:**
- Track each client's monthly scope (how many campaigns/flows they pay for)
- Auto-count how many used this month
- Warn when approaching limit
- Show overage requests

**Example View:**
```
Scope Management

┌─────────────────────────────────────────────────────────────┐
│                         October 2025                         │
└─────────────────────────────────────────────────────────────┘

Client: Hydrus
Monthly Retainer: $3,500/month

┌──────────────────────────────────────┐
│ Email Campaigns                      │
├──────────────────────────────────────┤
│ Contracted: 8-12 campaigns           │
│ Used: ████████░░░░ 8/12              │
│ Remaining: 4 campaigns               │
│ Status: ✅ On track                  │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Flows                                │
├──────────────────────────────────────┤
│ Contracted: 2 flows                  │
│ Used: █████░░░░░ 1/2                 │
│ Remaining: 1 flow                    │
│ Status: ✅ On track                  │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Popups                               │
├──────────────────────────────────────┤
│ Contracted: 4 popups                 │
│ Used: ███████░░░ 3/4                 │
│ Remaining: 1 popup                   │
│ Status: ⚠️ 75% used                  │
└──────────────────────────────────────┘

Scope resets: November 1, 2025 (2 days)

─────────────────────────────────────────

All Clients Overview:

Hydrus          ████████░░░░ 8/12    ✅ On track
Peak Design     ██████████░░ 10/12   ⚠️ 83% used
Make Waves      ███████████░ 11/12   🔴 92% used
Brand Co        ██████░░░░░░ 6/12    ✅ On track

🔴 Make Waves approaching limit - only 1 campaign remaining
```

**Features:**
- ✅ Auto-count campaigns/flows/popups
- ✅ Visual progress bars
- ✅ Email alerts at 75% and 90%
- ✅ Overage approval workflow
- ✅ Historical tracking (see past months)
- ✅ Export for invoicing

---

### **6. Call Recordings**

**What It Does:**
- Store client call recordings
- Link to campaigns created during call
- Transcripts (if available)
- Action items extracted

**Example View:**
```
Call Recordings

┌─────────────────────────────────────────────────────────────┐
│ Client: [All Clients ▼]     Date: [Last 30 days ▼]         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Oct 28, 2025 - Hydrus Strategy Call                    45m  │
├─────────────────────────────────────────────────────────────┤
│ Attendees: Sarah (PM), Mike (Copy), Client (Jamie)         │
│ Recording: [▶️ Play] [⬇️ Download]                          │
│ Transcript: [📄 View]                                       │
│                                                             │
│ Campaigns Created:                                          │
│ • Black Friday Email Series (3 emails)                     │
│ • Welcome Flow Update                                       │
│                                                             │
│ Action Items:                                               │
│ ✅ Send brand guideline updates - Sarah (Done)             │
│ 🔲 Schedule design review - Mike (Due Oct 30)              │
│ 🔲 Draft Q4 strategy doc - Sarah (Due Nov 5)               │
│                                                             │
│ Notes:                                                      │
│ Client wants to focus on retention in Q4. New product      │
│ launch planned for December. Need to update email header   │
│ with new branding.                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Oct 25, 2025 - Peak Design Monthly Review              30m  │
├─────────────────────────────────────────────────────────────┤
│ Attendees: Sarah (PM), Client (Alex)                       │
│ Recording: [▶️ Play] [⬇️ Download]                          │
│ ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- ✅ Upload recordings (video or audio)
- ✅ Auto-transcription (optional integration)
- ✅ Link to campaigns discussed
- ✅ Extract action items
- ✅ Search transcripts
- ✅ Tag calls (strategy, review, troubleshooting)

---

### **7. Quick Stats Dashboard**

**What It Shows:**
```
╔═══════════════════════════════════════════════════════════════╗
║  Operations Dashboard                        Today: Oct 30    ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  This Week                                                    ║
║  ┌──────────┬──────────┬──────────┬──────────┬──────────┐   ║
║  │    12    │    5     │    3     │    8     │   28     │   ║
║  │ Campaigns│  Flows   │ Calls    │ Sent     │  Active  │   ║
║  │ In Pipe  │ In Pipe  │ This Week│ This Week│ Clients  │   ║
║  └──────────┴──────────┴──────────┴──────────┴──────────┘   ║
║                                                               ║
║  Needs Attention (3)                                          ║
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │ 🔴 Make Waves - Product Launch - Past due (QA stage)   │ ║
║  │ 🟡 Hydrus - Black Friday - Due tomorrow (Design)       │ ║
║  │ 🟡 Peak Design - Newsletter - Awaiting client approval │ ║
║  └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
║  Recent Activity                                              ║
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │ 2:30 PM - Sarah moved "Black Friday" to Design          │ ║
║  │ 1:45 PM - Mike added copy doc to "Newsletter"           │ ║
║  │ 11:20 AM - Client approved "Welcome Email"              │ ║
║  │ 10:15 AM - New campaign request from Hydrus             │ ║
║  └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
║  Upcoming Sends (Next 7 days)                                 ║
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │ Oct 30 - Peak Design - Newsletter                       │ ║
║  │ Oct 31 - Hydrus - Product Update                        │ ║
║  │ Nov 1 - Make Waves - Welcome Email (Flow)               │ ║
║  │ Nov 3 - Brand Co - Black Friday Preview                 │ ║
║  └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

**Features:**
- ✅ Real-time updates
- ✅ Filterable by client
- ✅ Click any item to jump to detail
- ✅ Customizable widgets
- ✅ Daily digest email

---

## 🔄 Data Flow: How Everything Connects

### **Scenario 1: Creating a Campaign During Client Call**

```
STEP 1: During Call with Hydrus
──────────────────────────────────
You're on Zoom with client, discussing Black Friday strategy

Action: Open /ops → Calendar → Click November 24
Form appears: "Create Campaign"

Fill in:
• Campaign Name: "Black Friday - 50% Off"
• Client: Hydrus
• Type: Email Campaign
• Subject Line: "Get 50% OFF Everything - Limited Time! 🔥"
• Send Date: Nov 24, 6:00 AM
• Audience: All Subscribers
• Status: Strategy
• Notes: "Client wants hero image with product, blue CTAs"

Click "Create"

─────────────────────────────────

WHAT HAPPENS IN DATABASE:
┌──────────────────────────────────────┐
│ ops_campaigns table                  │
├──────────────────────────────────────┤
│ INSERT new row:                      │
│ • id: uuid-123                       │
│ • campaign_name: "Black Friday..."   │
│ • client_id: hydrus-uuid             │
│ • status: "strategy"                 │
│ • send_date: 2025-11-24 06:00:00    │
│ • created_at: NOW()                  │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ ops_activity table                   │
├──────────────────────────────────────┤
│ INSERT new row:                      │
│ • activity: "Campaign created"       │
│ • campaign_id: uuid-123              │
│ • user: "Sarah"                      │
│ • timestamp: NOW()                   │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ ops_scope table                      │
├──────────────────────────────────────┤
│ UPDATE:                              │
│ • campaigns_used = campaigns_used + 1│
│ WHERE client = Hydrus AND month = 10│
└──────────────────────────────────────┘

─────────────────────────────────

INSTANT UPDATES IN UI:
✅ Calendar shows new campaign on Nov 24
✅ Pipeline shows card in "Strategy" column
✅ Scope tracker shows 9/12 campaigns used
✅ Activity feed shows "Campaign created"
✅ Dashboard "Active Campaigns" count +1

Client can see it live on screen during call!
```

---

### **Scenario 2: Moving Campaign Through Workflow**

```
STEP 1: Copywriter Finishes Copy
─────────────────────────────────
Copywriter writes subject line and body copy in Google Doc
Links doc to campaign in /ops

Action: Open campaign → Add copy doc link → Change status to "Copy Complete"

─────────────────────────────────

WHAT HAPPENS:
┌──────────────────────────────────────┐
│ ops_campaigns                        │
├──────────────────────────────────────┤
│ UPDATE:                              │
│ • status: "copy" → "design"          │
│ • copy_doc_url: "https://docs..."    │
│ • updated_at: NOW()                  │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ ops_activity                         │
├──────────────────────────────────────┤
│ INSERT:                              │
│ • activity: "Status changed"         │
│ • old_status: "copy"                 │
│ • new_status: "design"               │
│ • user: "Mike"                       │
└──────────────────────────────────────┘

─────────────────────────────────

INSTANT UI UPDATES:
✅ Card moves from "Copy" to "Design" column on Kanban
✅ Activity feed: "Mike moved Black Friday to Design"
✅ Designer sees new campaign in their queue

─────────────────────────────────

STEP 2: Designer Creates Design
─────────────────────────────────
Designer creates email in Figma/Klaviyo
Links design file

Action: Open campaign → Add design URL → Change status to "QA"

Updates same way as above

─────────────────────────────────

STEP 3: QA Approves
─────────────────────────────────
QA person reviews links, copy, design

Action: Change status to "Client Approval"

─────────────────────────────────

WHAT HAPPENS (IMPORTANT!):
┌──────────────────────────────────────┐
│ ops_campaigns                        │
├──────────────────────────────────────┤
│ UPDATE:                              │
│ • status: "qa" → "client_approval"   │
└──────────────────────────────────────┘

🎯 TRIGGER AUTOMATICALLY CREATES PORTAL ENTRY:

┌──────────────────────────────────────┐
│ campaign_approvals table             │
├──────────────────────────────────────┤
│ INSERT:                              │
│ • ops_campaign_id: uuid-123          │
│ • client_id: hydrus-uuid             │
│ • campaign_name: "Black Friday..."   │
│ • subject_line: "Get 50%..."         │
│ • preview_url: [design URL]          │
│ • status: "client_approval"          │
│ • scheduled_date: Nov 24             │
└──────────────────────────────────────┘

─────────────────────────────────

CLIENT NOW SEES IN PORTAL:
Client logs into /client/hydrus → Portal view

Calendar shows:
┌─────────────────────────────────┐
│ Nov 24 - Black Friday Campaign  │
│ Status: Awaiting Your Approval  │
│ [View & Approve]                │
└─────────────────────────────────┘

Client clicks, sees preview, clicks "Approve"

─────────────────────────────────

APPROVAL UPDATES BOTH TABLES:
┌──────────────────────────────────────┐
│ campaign_approvals                   │
├──────────────────────────────────────┤
│ UPDATE:                              │
│ • client_approved: true              │
│ • approval_date: NOW()               │
└──────────────────────────────────────┘

🎯 TRIGGER UPDATES OPS CAMPAIGN:

┌──────────────────────────────────────┐
│ ops_campaigns                        │
├──────────────────────────────────────┤
│ UPDATE:                              │
│ • status: "client_approval"→"approved"│
└──────────────────────────────────────┘

─────────────────────────────────

TEAM SEES INSTANT UPDATE:
✅ Card moves to "Approved" column
✅ Activity feed: "Client approved Black Friday"
✅ Implementor sees it in queue to schedule

─────────────────────────────────

STEP 4: Implementor Schedules
─────────────────────────────────
Implementor builds in Klaviyo, schedules for Nov 24

Action: Change status to "Scheduled", add Klaviyo campaign ID

┌──────────────────────────────────────┐
│ ops_campaigns                        │
├──────────────────────────────────────┤
│ UPDATE:                              │
│ • status: "approved" → "scheduled"   │
│ • klaviyo_campaign_id: "abc123"      │
└──────────────────────────────────────┘

─────────────────────────────────

STEP 5: Campaign Sends
─────────────────────────────────
Nov 24, 6:00 AM - Klaviyo sends campaign

Daily sync runs at 8:00 AM:

┌──────────────────────────────────────┐
│ campaign_metrics table               │
├──────────────────────────────────────┤
│ INSERT:                              │
│ • klaviyo_campaign_id: "abc123"      │
│ • sent: 15,234                       │
│ • opens: 4,250 (initial)             │
│ • clicks: 892                        │
│ • revenue: $12,450                   │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ ops_campaigns                        │
├──────────────────────────────────────┤
│ UPDATE:                              │
│ • status: "scheduled" → "sent"       │
│ • actual_send_date: 2025-11-24       │
└──────────────────────────────────────┘

─────────────────────────────────

NOW VISIBLE IN THREE PLACES:

1. /ops (Team View)
   • Shows as "Sent" in pipeline
   • Click to see analytics
   • Links to Klaviyo

2. /client/hydrus (Client Analytics)
   • Performance metrics visible
   • Charts update with data

3. /client/hydrus (Client Portal)
   • Shows as "Sent" on calendar
   • Can see performance
```

**Total time from idea to launch: ~3-5 days**
**Manual sync points: ZERO**
**Data consistency: PERFECT**

---

### **Scenario 3: Client Submits Request**

```
STEP 1: Client Submits Request in Portal
──────────────────────────────────────────
Client: "We want to send a product launch campaign for our new flavor"

Client goes to /client/hydrus → Portal → Requests tab
Fills form:
• Request Type: Email Campaign
• Title: "New Flavor Launch"
• Description: "Announce our new Berry Blast flavor"
• Priority: High
• Desired Send Date: November 15
• Target Audience: Engaged subscribers

Clicks "Submit Request"

──────────────────────────────────────────

WHAT HAPPENS:
┌──────────────────────────────────────┐
│ campaign_requests table              │
├──────────────────────────────────────┤
│ INSERT:                              │
│ • client_id: hydrus-uuid             │
│ • title: "New Flavor Launch"         │
│ • status: "submitted"                │
│ • desired_date: Nov 15               │
└──────────────────────────────────────┘

🎯 TRIGGER AUTO-CREATES OPS CAMPAIGN:

┌──────────────────────────────────────┐
│ ops_campaigns                        │
├──────────────────────────────────────┤
│ INSERT:                              │
│ • campaign_name: "New Flavor Launch" │
│ • client_id: hydrus-uuid             │
│ • status: "strategy"                 │
│ • send_date: 2025-11-15              │
│ • portal_request_id: [link back]     │
│ • priority: "high"                   │
│ • description: [from request]        │
└──────────────────────────────────────┘

──────────────────────────────────────────

TEAM SEES IMMEDIATELY:
✅ New card appears in "Strategy" column (marked HIGH PRIORITY 🔴)
✅ Shows on calendar for Nov 15
✅ Activity feed: "New request from Hydrus"
✅ Dashboard "Needs Attention" count +1

──────────────────────────────────────────

TEAM TAKES ACTION:
Someone opens the campaign, reviews request, starts strategy

All workflow continues same as Scenario 2!
```

---

## 🛠️ Implementation Roadmap

### **Phase 1: Foundation (Week 1) - MVP**

**Goal:** Get basic internal OS working

#### **Database Setup:**
```sql
-- 1. Run in Supabase SQL Editor

CREATE TABLE ops_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  agency_id UUID REFERENCES agencies(id) NOT NULL,
  
  -- Campaign details
  campaign_name TEXT NOT NULL,
  campaign_type TEXT CHECK (campaign_type IN ('email', 'sms')) DEFAULT 'email',
  subject_line TEXT,
  preview_text TEXT,
  
  -- Workflow
  status TEXT CHECK (status IN (
    'strategy', 'copy', 'design', 'qa', 
    'client_approval', 'approved', 'scheduled', 'sent'
  )) DEFAULT 'strategy',
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  
  -- Scheduling
  send_date TIMESTAMP WITH TIME ZONE,
  actual_send_date TIMESTAMP WITH TIME ZONE,
  
  -- Links
  copy_doc_url TEXT,
  design_file_url TEXT,
  preview_url TEXT,
  klaviyo_campaign_id TEXT,
  portal_request_id UUID REFERENCES campaign_requests(id),
  
  -- Details
  target_audience TEXT,
  internal_notes TEXT,
  
  -- Tracking
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity log
CREATE TABLE ops_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type TEXT NOT NULL,
  campaign_id UUID REFERENCES ops_campaigns(id),
  flow_id UUID REFERENCES ops_flows(id),
  user_id UUID REFERENCES user_profiles(id),
  user_name TEXT,
  description TEXT,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ops_campaigns_client ON ops_campaigns(client_id, status);
CREATE INDEX idx_ops_campaigns_date ON ops_campaigns(send_date);
CREATE INDEX idx_ops_activity_campaign ON ops_activity(campaign_id);

-- RLS Policies
ALTER TABLE ops_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_activity ENABLE ROW LEVEL SECURITY;

-- Everyone on the team can see and edit everything (simple!)
CREATE POLICY "Team members can manage ops campaigns"
ON ops_campaigns FOR ALL
USING (
  agency_id IN (
    SELECT agency_id FROM user_profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Team members can view activity"
ON ops_activity FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM ops_campaigns
    WHERE id = ops_activity.campaign_id
    AND agency_id IN (
      SELECT agency_id FROM user_profiles WHERE id = auth.uid()
    )
  )
);

-- Triggers
CREATE OR REPLACE FUNCTION update_ops_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ops_campaigns_updated_at
BEFORE UPDATE ON ops_campaigns
FOR EACH ROW EXECUTE FUNCTION update_ops_updated_at();

-- Auto-log activity when status changes
CREATE OR REPLACE FUNCTION log_ops_campaign_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO ops_activity (
      activity_type,
      campaign_id,
      user_id,
      description,
      old_value,
      new_value
    ) VALUES (
      'status_change',
      NEW.id,
      auth.uid(),
      'Status changed',
      OLD.status,
      NEW.status
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ops_campaigns_status_change
AFTER UPDATE ON ops_campaigns
FOR EACH ROW EXECUTE FUNCTION log_ops_campaign_changes();
```

#### **Routes to Create:**
```
app/
└── ops/
    └── page.tsx   (Main dashboard)
```

#### **Components to Build:**
```
components/
└── ops/
    ├── ops-dashboard.tsx        (Main wrapper)
    ├── campaign-calendar.tsx    (Calendar view)
    ├── campaign-kanban.tsx      (Pipeline board)
    └── campaign-detail.tsx      (Detail modal)
```

#### **API Routes:**
```
app/api/
└── ops/
    ├── campaigns/
    │   ├── route.ts           (GET all, POST new)
    │   └── [id]/route.ts      (GET, PATCH, DELETE)
    └── activity/
        └── route.ts           (GET activity feed)
```

**Estimated Time:** 20-30 hours

---

### **Phase 2: Content & Scope (Week 2)**

**Goal:** Add content hub and scope tracking

#### **Database:**
```sql
CREATE TABLE ops_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  agency_id UUID REFERENCES agencies(id) NOT NULL,
  
  content_type TEXT CHECK (content_type IN (
    'asset', 'brand_guideline', 'copy_note', 'design_note', 'other'
  )) NOT NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT, -- 'image', 'pdf', 'doc', etc.
  folder TEXT,
  tags TEXT[],
  
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ops_scope (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) NOT NULL UNIQUE,
  
  -- Monthly limits
  campaigns_min INTEGER DEFAULT 8,
  campaigns_max INTEGER DEFAULT 20,
  flows_limit INTEGER DEFAULT 2,
  popups_limit INTEGER DEFAULT 4,
  
  -- Current month (auto-reset)
  current_month DATE DEFAULT DATE_TRUNC('month', NOW()),
  campaigns_used INTEGER DEFAULT 0,
  flows_used INTEGER DEFAULT 0,
  popups_used INTEGER DEFAULT 0,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-increment scope when campaign created
CREATE OR REPLACE FUNCTION increment_scope()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ops_scope
  SET campaigns_used = campaigns_used + 1
  WHERE client_id = NEW.client_id
  AND current_month = DATE_TRUNC('month', NOW());
  
  -- Create scope entry if doesn't exist
  IF NOT FOUND THEN
    INSERT INTO ops_scope (client_id, campaigns_used)
    VALUES (NEW.client_id, 1)
    ON CONFLICT (client_id) DO UPDATE
    SET campaigns_used = ops_scope.campaigns_used + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_campaign_scope
AFTER INSERT ON ops_campaigns
FOR EACH ROW EXECUTE FUNCTION increment_scope();
```

#### **Components:**
```
components/ops/
├── content-hub.tsx
├── scope-tracker.tsx
└── scope-widget.tsx  (for dashboard)
```

**Estimated Time:** 15-20 hours

---

### **Phase 3: Portal Integration (Week 3)**

**Goal:** Connect internal OS to client portal

#### **Database:**
```sql
-- Add link from campaign_approvals back to ops_campaigns
ALTER TABLE campaign_approvals
ADD COLUMN ops_campaign_id UUID REFERENCES ops_campaigns(id);

-- Auto-create approval when status = client_approval
CREATE OR REPLACE FUNCTION create_campaign_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'client_approval' AND OLD.status != 'client_approval' THEN
    INSERT INTO campaign_approvals (
      ops_campaign_id,
      client_id,
      agency_id,
      campaign_name,
      subject_line,
      preview_url,
      scheduled_date,
      status
    ) VALUES (
      NEW.id,
      NEW.client_id,
      NEW.agency_id,
      NEW.campaign_name,
      NEW.subject_line,
      NEW.preview_url,
      NEW.send_date,
      'client_approval'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ops_to_portal_approval
AFTER UPDATE ON ops_campaigns
FOR EACH ROW EXECUTE FUNCTION create_campaign_approval();

-- Update ops when client approves
CREATE OR REPLACE FUNCTION sync_approval_to_ops()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.client_approved = true AND OLD.client_approved != true THEN
    UPDATE ops_campaigns
    SET status = 'approved'
    WHERE id = NEW.ops_campaign_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER portal_to_ops_approval
AFTER UPDATE ON campaign_approvals
FOR EACH ROW EXECUTE FUNCTION sync_approval_to_ops();
```

#### **Auto-Create Campaign from Request:**
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
    internal_notes,
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

CREATE TRIGGER request_to_ops_campaign
AFTER INSERT ON campaign_requests
FOR EACH ROW EXECUTE FUNCTION create_ops_campaign_from_request();
```

**Estimated Time:** 10-15 hours

---

### **Phase 4: Call Recordings & Polish (Week 4)**

#### **Database:**
```sql
CREATE TABLE ops_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  call_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER,
  
  recording_url TEXT,
  transcript_url TEXT,
  
  attendees TEXT[],
  call_type TEXT, -- 'strategy', 'review', 'kickoff', 'troubleshooting'
  
  notes TEXT,
  action_items JSONB, -- [{task, assignee, due_date, done}]
  
  campaigns_discussed UUID[], -- Array of campaign IDs
  
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Components:**
```
components/ops/
├── call-recordings.tsx
├── call-detail.tsx
└── calls-widget.tsx  (for dashboard)
```

#### **Polish:**
- ✅ Add search everywhere
- ✅ Add bulk actions
- ✅ Add keyboard shortcuts
- ✅ Add onboarding tour
- ✅ Add export functionality
- ✅ Improve mobile responsiveness

**Estimated Time:** 15-20 hours

---

## 🚀 Future Improvements

### **Phase 5: Analytics Integration (Month 2)**

**Show campaign performance in ops dashboard:**
```typescript
// When viewing sent campaign, show metrics
const campaign = await supabase
  .from('ops_campaigns')
  .select(`
    *,
    metrics:campaign_metrics(
      sent,
      opens,
      clicks,
      revenue,
      open_rate,
      click_rate
    )
  `)
  .eq('id', campaignId)
  .single()

// Display in campaign detail:
Performance:
├── Sent: 15,234
├── Opens: 4,250 (27.9%)
├── Clicks: 892 (5.9%)
└── Revenue: $12,450
```

---

### **Phase 6: Flow Management (Month 3)**

**Add flow pipeline:**
```sql
CREATE TABLE ops_flows (
  -- Same structure as ops_campaigns
  -- But for email flows
)
```

Kanban board for flows similar to campaigns

---

### **Phase 7: Team Features (Month 4)**

**Add optional team features (when you're ready):**

1. **Assignment:**
   - Add "assigned_to" field to campaigns
   - Filter "My Campaigns"
   - Workload balancing

2. **Comments:**
   - Internal discussion threads on campaigns
   - @mentions
   - File attachments

3. **Templates:**
   - Save campaigns as templates
   - Quick create from template
   - Template library

4. **Time Tracking:**
   - Log hours per campaign
   - Track by task type (copy, design, etc.)
   - Billing reports

---

### **Phase 8: Automation (Month 5-6)**

1. **Notifications:**
   - Email when campaign needs attention
   - Slack integration
   - In-app notifications

2. **Smart Scheduling:**
   - AI suggests best send times
   - Avoid sending conflicts
   - Optimal spacing between campaigns

3. **AI Copy Assistant:**
   - Generate subject lines
   - Suggest copy improvements
   - Tone analysis

4. **Analytics Insights:**
   - Auto-flag underperforming campaigns
   - Suggest optimizations
   - Predict performance

---

### **Phase 9: Advanced Features (Future)**

1. **Version Control:**
   - Save copy/design revisions
   - Rollback to previous version
   - Compare versions

2. **Approval Workflows:**
   - Multi-step internal approvals
   - QA checklists
   - Compliance checks

3. **Client Self-Service:**
   - Let clients upload assets to content hub
   - Submit detailed briefs
   - View campaign performance

4. **Reporting:**
   - Monthly client reports (auto-generated)
   - Agency performance dashboards
   - Scope compliance reports

5. **Integrations:**
   - Figma (auto-import designs)
   - Google Docs (auto-sync copy)
   - Slack (notifications)
   - Zapier (custom workflows)

---

## 💰 Cost Analysis

### **Current State (With Airtable):**
```
Airtable Pro: $20/seat × 3 seats = $60/month = $720/year
OR
Airtable Team: $45/seat × 3 seats = $135/month = $1,620/year

Time cost: ~5 hours/week managing Airtable = $2,500/month (at $125/hr)

Total: $1,620 + $30,000/year = $31,620/year
```

### **New State (Internal OS):**
```
Additional Supabase cost: $0 (within free tier, or +$25/month if scaled)
Development time: 80 hours @ $125/hr = $10,000 (one-time)

Ongoing: $0/month (or $25/month max)
Time saved: 5 hours/week × $125 = $2,500/month saved

Year 1: -$10,000 (development) + $30,000 (saved) = +$20,000
Year 2+: +$30,000/year saved

ROI: 200% in year 1, infinite thereafter
```

---

## 🎯 Success Metrics

### **Internal Efficiency:**
- ⏱️ Campaign creation time: 30 min → 5 min (6x faster)
- 🔄 Context switching: 10x/day → 0 (work in one place)
- ❌ Data entry errors: 10% → <1% (auto-populate)
- 📊 Scope tracking: Manual → Automatic

### **Client Satisfaction:**
- 👀 Visibility: None → Real-time
- ⚡ Approval speed: 3 days → Same day
- 💬 Communication: Email threads → Centralized portal
- 🎯 Campaign quality: Better briefing → Better results

### **Team Happiness:**
- 😊 Tool satisfaction: Airtable 3/5 → Custom OS 5/5
- 🚀 Productivity: +300%
- 🧠 Context retention: Scattered → Centralized
- 💪 Autonomy: Can see full picture

---

## ✅ Final Recommendations

### **Do This:**
1. ✅ Start with Phase 1 (Foundation) - Get MVP working
2. ✅ Use it for ONE client first (beta test)
3. ✅ Gather feedback from team
4. ✅ Iterate and improve
5. ✅ Roll out to all clients
6. ✅ Add features based on real needs

### **Don't Do This:**
1. ❌ Don't build everything at once
2. ❌ Don't add role complexity yet
3. ❌ Don't over-engineer
4. ❌ Don't migrate from Airtable until new system works
5. ❌ Don't stress about perfection - iterate!

---

## 🚀 Next Steps

**This Week:**
1. Review this strategy doc
2. Decide on route name (`/ops` vs `/team`)
3. Run Phase 1 database migrations
4. Start building dashboard component

**Next Week:**
1. Build calendar view
2. Build kanban board
3. Connect to API
4. Test with sample data

**Week 3:**
1. Add portal integration
2. Test end-to-end workflow
3. Fix bugs

**Week 4:**
1. Polish UI
2. Add content hub
3. Add scope tracking
4. Launch with one client

---

## 📞 Questions to Decide

Before starting, decide:

1. **Route Name:**
   - `/ops` (operations - shorter, clean)
   - `/team` (team dashboard - descriptive)
   - Your preference?

2. **Priority Features:**
   - Which features do you need ASAP?
   - Which can wait?

3. **Migration Strategy:**
   - Keep Airtable running during transition?
   - Hard cutover date?
   - Gradual client migration?

4. **Success Criteria:**
   - What defines "ready to use"?
   - What's the minimum viable feature set?

---

**Ready to build? I can help with any part of this!** 🚀

What would you like to tackle first?

