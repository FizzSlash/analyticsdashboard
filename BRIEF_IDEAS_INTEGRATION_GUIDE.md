# 🚀 Brief Ideas Integration Guide

## How to Integrate the 3-Step Copy Workflow

### Step 1: Run Database Migration

```sql
-- Add new fields to ops_campaigns table
ALTER TABLE ops_campaigns 
ADD COLUMN IF NOT EXISTS brief_ideas JSONB,
ADD COLUMN IF NOT EXISTS brief_ideas_context TEXT,
ADD COLUMN IF NOT EXISTS selected_brief_idea INTEGER;
```

### Step 2: Update Your Copy Generation Page/Component

Replace the old direct "Generate Copy" button with the new workflow:

```typescript
import { BriefIdeasSelector } from '@/components/ops/brief-ideas-selector'
import { useState } from 'react'

// In your component:
const [briefIdeas, setBriefIdeas] = useState(null)
const [loadingIdeas, setLoadingIdeas] = useState(false)
const [selectedBriefIdea, setSelectedBriefIdea] = useState(null)

// Step 1: Generate 3 brief ideas
const handleGenerateBriefIdeas = async () => {
  setLoadingIdeas(true)
  try {
    const response = await fetch('/api/ai/generate-brief-ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: campaign.id,
        initialIdea: campaign.internal_notes || '',
        productUrls: productUrls || []
      })
    })
    
    const data = await response.json()
    if (data.success) {
      setBriefIdeas(data.data)
    }
  } catch (error) {
    console.error('Error generating ideas:', error)
  } finally {
    setLoadingIdeas(false)
  }
}

// Step 2: User selects/edits an idea
const handleSelectIdea = (ideaNumber, idea) => {
  setSelectedBriefIdea({ number: ideaNumber, ...idea })
  // Proceed to step 3 (generate copy)
  handleGenerateCopy(idea)
}

// Step 2b: User wants new ideas
const handleRegenerateIdeas = async (context) => {
  setLoadingIdeas(true)
  try {
    const response = await fetch('/api/ai/generate-brief-ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: campaign.id,
        initialIdea: campaign.internal_notes || '',
        regenerateContext: context, // User feedback
        productUrls: productUrls || []
      })
    })
    
    const data = await response.json()
    if (data.success) {
      setBriefIdeas(data.data)
    }
  } finally {
    setLoadingIdeas(false)
  }
}

// Step 3: Generate actual copy using selected idea
const handleGenerateCopy = async (selectedIdea) => {
  // Use existing /api/ai/generate-copy endpoint
  // Pass selectedIdea.brief as the brief parameter
  try {
    const response = await fetch('/api/ai/generate-copy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: campaign.id,
        brief: selectedIdea.brief, // Use the selected brief
        productUrls: productUrls || []
      })
    })
    
    const data = await response.json()
    if (data.success) {
      console.log('✅ Copy generated!', data.data)
      // Show the copy editor
    }
  } catch (error) {
    console.error('Error generating copy:', error)
  }
}
```

### Step 3: Render the Component

```tsx
<BriefIdeasSelector
  campaignId={campaign.id}
  campaignName={campaign.campaign_name}
  briefIdeas={briefIdeas}
  onSelect={handleSelectIdea}
  onRegenerate={handleRegenerateIdeas}
  loading={loadingIdeas}
/>
```

---

## 🎨 UI Flow

### **Initial State:**
Shows placeholder with "Generate Brief Ideas" prompt

### **After Generating:**
Shows 3 cards side-by-side:
- **Idea 1** (Blue) - Direct approach
- **Idea 2** (Purple) - Story-driven
- **Idea 3** (Green) - Value/benefit

Each card shows:
- 🎯 Strategy (why it works)
- 💡 Brief (full description)
- 📐 Block Layout (visual structure)
- Buttons: **Select** | **Edit**

### **When Selected:**
Green banner appears: "Ready to generate email copy"

### **Edit Modal:**
Full-screen editor to customize:
- Title
- Brief
- Block layout
- Strategy

### **Not Happy Box:**
Orange card with:
- "Not happy with these ideas?"
- Text area for feedback
- "Generate 3 New Ideas" button

---

## 📊 Example Workflow

**Copywriter workflow:**
1. Opens campaign in Ops dashboard
2. Clicks "Generate Brief Ideas"
3. Waits 10-15 seconds
4. Sees 3 ideas:
   - "Holiday Gift Rush" (direct)
   - "The Perfect Gift Story" (narrative)
   - "5 Reasons They'll Love It" (value)
5. Likes Idea 2 but wants tweaks
6. Clicks "Edit" on Idea 2
7. Adjusts the brief strategy
8. Clicks "Save & Use This Idea"
9. Clicks "Generate Email Copy"
10. Gets full copy based on refined brief

**Alternative: Not Happy**
1. Doesn't like any of the 3 ideas
2. Clicks "Generate 3 New Ideas"
3. Enters: "Make them more urgent, focus on limited stock"
4. Gets 3 NEW ideas with that context
5. Selects one → Generates copy

---

## 🔧 Integration Locations

### Where to Add This:

**Primary Location:**
- `app/agency/[slug]/generate/[campaignId]/page.tsx`
- Replace direct copy generation with this workflow

**Secondary Locations:**
- Copy generation modal in Ops dashboard
- Content Hub copy generation flow

---

## ✅ What's Already Done

- ✅ AI service method (`generateBriefIdeas`)
- ✅ API endpoint (`/api/ai/generate-brief-ideas`)
- ✅ Database migration SQL
- ✅ UI component (`BriefIdeasSelector`)
- ✅ Documentation

## 🔨 What You Need to Do

1. **Run the SQL migration** in Supabase
2. **Find your copy generation page** (likely in `app/agency/[slug]/generate` or `app/agency/[slug]/copy`)
3. **Import and use** `BriefIdeasSelector` component
4. **Wire up the handlers** (see Step 2 above)

---

**Status:** ✅ Backend Complete, Frontend Component Ready  
**Next:** Integration into existing copy generation flow

