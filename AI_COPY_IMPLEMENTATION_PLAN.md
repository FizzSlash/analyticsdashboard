# 🤖 AI Copy Generation - Complete Implementation Plan

**Date:** November 3, 2025  
**Status:** Ready to Build  
**Time Estimate:** 3-4 hours

---

## 🎯 USER WORKFLOW

### **PHASE 1: Setup Copy Notes (One-Time Per Client)**

**Location:** Content Hub → Copy Notes tab

```
1. Select client
2. Click "Generate Copy Notes with AI" button
3. AI analyzes:
   - Client website (if provided)
   - Existing campaigns
   - Brand name/industry
4. Generates comprehensive Copy Notes
5. You review and edit
6. Save
```

**Generated Fields:**
- Voice & Tone Guidelines
- Key Phrases to Use
- Words/Phrases to Avoid
- Legal/Compliance Notes
- Proven Subject Lines (from past campaigns)
- Target Audience
- Pain Points
- Brand Personality

---

### **PHASE 2: Generate Campaign Copy**

**Location:** Ops Dashboard → Campaign Modal (when status = "copy")

```
┌────────────────────────────────────────┐
│ Campaign: Black Friday Sale           │
│ Client: TriRig                         │
│ Status: copy                           │
│                                        │
│ Brief: [50% off sitewide]             │
│                                        │
│ [🤖 Generate Email Copy] ←─ Click     │
└────────────────────────────────────────┘
```

**What Happens:**

**A. If Copy Notes Exist:**
1. Opens `/generate/[campaignId]` in NEW TAB
2. Full-screen copy generation interface
3. AI generates email blocks
4. You edit blocks
5. Click "Save to Campaign"
6. Returns to Ops Dashboard
7. Copy saved to campaign
8. Copy Doc URL auto-created

**B. If Copy Notes Missing:**
```
⚠️ Copy Notes Required

TriRig doesn't have Copy Notes yet.

[Generate Copy Notes] [Cancel]
```
- Click "Generate Copy Notes" → Opens Content Hub
- Generate notes → Returns to campaign
- Try again → Copy generation works

---

## 📦 **BLOCK STRUCTURE (Your Format)**

Based on your examples, AI generates:

```json
{
  "subject_lines": [
    "Your Off-Season Upgrade Starts Here",
    "Make This Off-Season Count",
    "Three Upgrades Every Triathlete Needs"
  ],
  "preview_text": "Three ways to fine tune your aero setup for next season",
  "email_blocks": [
    {
      "type": "header",
      "content": "Make This Off-Season Count"
    },
    {
      "type": "subheader",
      "content": "If you don't have these upgrades, here's why you should"
    },
    {
      "type": "pic",
      "content": "Clean photo of bike with TriRig cockpit and hydration"
    },
    {
      "type": "cta",
      "content": "Explore Upgrades",
      "link": "{INSERT LINK}"
    },
    {
      "type": "divider"
    },
    {
      "type": "header",
      "content": "Dial In Your Setup"
    },
    {
      "type": "body",
      "content": "The off-season is the perfect time to refine your position..."
    },
    {
      "type": "product",
      "name": "Front-End Hydration",
      "description": "Stay aero while staying fueled. Pair the BTA Riser System...",
      "cta": "Shop Hydration",
      "link": "{INSERT LINK}"
    },
    {
      "type": "product",
      "name": "Arm Cups",
      "description": "Our Scoops Ultimate SL cups deliver unmatched comfort...",
      "cta": "Shop Arm Cups",
      "link": "{INSERT LINK}"
    },
    {
      "type": "checkmarks",
      "items": [
        "Precision adjustability",
        "Ergonomic design",
        "Wind tunnel tested"
      ]
    },
    {
      "type": "footer",
      "content": "Use the off-season to get faster."
    }
  ]
}
```

---

## 🏗️ **TECHNICAL IMPLEMENTATION**

### **New Files to Create:**

**1. Database:**
- `database/add_ai_copy_features.sql` ✅ Created

**2. API Endpoints:**
- `/api/ai/generate-copy-notes` - Generate Copy Notes
- `/api/ai/generate-brief` - Enhance brief
- `/api/ai/generate-copy` - Generate email blocks

**3. Services:**
- `lib/ai-copy-service.ts` - Claude integration (adapted from CopyBot)

**4. UI Pages:**
- `/agency/[slug]/generate/[campaignId]` - Full-screen copy editor
- Content Hub → Copy Notes UI updates
- Campaign Modal → "Generate Copy" button

**5. Components:**
- `CopyBlockEditor` - Edit individual blocks
- `BlockList` - Rearrange blocks
- `CopyPreview` - Preview email
- `ExportToDocs` - Save to Google Docs

---

## 🎨 **COPY GENERATION PAGE UI:**

```
┌─────────────────────────────────────────────────────────┐
│ [Back to Ops] Black Friday Sale - TriRig        [Save] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ SUBJECT LINES (Select one):                            │
│ ○ Your Off-Season Upgrade Starts Here                  │
│ ○ Make This Off-Season Count                           │
│ ○ Three Upgrades Every Triathlete Needs                │
│                                                         │
│ PREVIEW TEXT:                                           │
│ [Three ways to fine tune your aero setup...]           │
│                                                         │
│ EMAIL BLOCKS: [+ Add Block] [Reorder]                  │
│                                                         │
│ ┌─────────────────────────────────┐                   │
│ │ HEADER                          │ [Edit] [Delete]   │
│ │ Make This Off-Season Count      │                   │
│ └─────────────────────────────────┘                   │
│                                                         │
│ ┌─────────────────────────────────┐                   │
│ │ SUBHEADER                       │ [Edit] [Delete]   │
│ │ If you don't have these...      │                   │
│ └─────────────────────────────────┘                   │
│                                                         │
│ ┌─────────────────────────────────┐                   │
│ │ PRODUCT                         │ [Edit] [Delete]   │
│ │ Front-End Hydration             │                   │
│ │ Stay aero while staying fueled  │                   │
│ │ [Shop Hydration] → {link}       │                   │
│ └─────────────────────────────────┘                   │
│                                                         │
│ [+ Add Block Below]                                     │
│                                                         │
│ [Preview Email] [Export to Google Docs] [Save]         │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ **CONFIRMATION - THIS IS THE PLAN:**

**Copy Notes:**
- ✅ "Generate Copy Notes" button per client
- ✅ AI fills in comprehensive notes
- ✅ You can edit after

**Campaign Copy:**
- ✅ "Generate Email Copy" button in campaign modal
- ✅ Opens NEW TAB for editing
- ✅ You can edit all blocks
- ✅ If Copy Notes blank → Prompts to create them first
- ✅ Click "Save" → Saves to campaign, closes tab, returns to Ops

**Safety:**
- ✅ Non-destructive (new columns, new pages)
- ✅ Won't break existing functionality
- ✅ Only visible when status = "copy"

---

**Ready to build?** I'll start with the database changes and work my way up! 🚀
