# 📋 Phase 11: Dynamic Forms System

**Priority:** HIGH - Essential for client onboarding and data gathering  
**Build After:** Phases 6 (Content Hub) - since forms will populate content hub data

---

## 🎯 Purpose

Create custom forms to gather information from clients and populate the Content Hub automatically.

**Use Cases:**
1. **Client Onboarding** - New client fills form → Auto-populates brand guidelines, demographics
2. **Strategy Questionnaires** - Gather goals, target audience, pain points
3. **Monthly Check-ins** - Recurring feedback forms
4. **Content Briefs** - Campaign-specific information requests
5. **Demographic Surveys** - Audience insights

---

## 📝 PHASE 11: Dynamic Forms (10 Tasks)

### **Task 65: Forms Tab Layout**
- New tab in ops navigation (after Content Hub)
- Form list view (all forms across clients)
- Filter by: Client, Category, Status
- Create New Form button

### **Task 66: Form Builder Interface**
- Drag & drop form field builder (or simple add fields)
- Field types:
  - Text input
  - Text area
  - Dropdown (select)
  - Radio buttons
  - Checkboxes
  - Date picker
  - Email input
  - Number input
- Reorder fields
- Mark fields as required
- Add field descriptions

### **Task 67: Form Templates**
- Pre-built templates:
  - **Client Onboarding Form**
  - **Brand Guidelines Questionnaire**
  - **Monthly Strategy Form**
  - **Campaign Brief Form**
  - **Demographic Survey**
- Load template → Customize → Save

### **Task 68: Form Configuration**
- Form title
- Description
- Category (onboarding, strategy, monthly, brief, custom)
- Assign to clients (select which clients should fill it)
- Due date (optional)
- Status (draft, active, archived)

### **Task 69: Form Distribution**
- Generate unique share link
- Send to client email (integration with portal)
- Client sees form in their portal "Forms" tab
- Track who has/hasn't completed

### **Task 70: Response Collection**
- Client submits form
- Responses saved to database
- View responses in table format
- Download responses as CSV
- Response timestamps

### **Task 71: Auto-Populate Content Hub**
- Map form fields to Content Hub fields
- Example:
  - "Brand Colors" question → Populates Brand Guidelines colors
  - "Tone of Voice" question → Populates Copy Notes
  - "Design Preferences" → Populates Design Notes
- One-click "Import to Content Hub" button

### **Task 72: Form Response Viewer**
- Click form → See all responses
- Filter by client
- Compare responses across clients
- Export individual or bulk responses

### **Task 73: Onboarding Form Template (Pre-built)**
**Sample fields:**
```
Section 1: Brand Basics
- Brand Name
- Website URL
- Industry
- Target Audience (demographics)

Section 2: Brand Identity
- Brand Colors (3-5 hex codes)
- Fonts Used
- Brand Voice (energetic, professional, friendly, etc.)
- Key Brand Messages

Section 3: Legal & Compliance
- Required Disclaimers
- Privacy Policy URL
- Legal Requirements

Section 4: Design Preferences
- Design Styles You Love
- Design Styles to Avoid
- Image Preferences
- CTA Button Preferences

Section 5: Strategy
- Email Marketing Goals
- Current Pain Points
- Competitor Websites (3-5)
- Success Metrics
```

### **Task 74: Integration with Portal**
- Forms automatically appear in client's portal
- Client fills out and submits
- Syncs back to ops dashboard
- Notification when completed
- Review and approve responses

---

## 🎨 UI Design

### **Forms List View:**
```
┌─────────────────────────────────────────────────────────┐
│ Forms                                    [Create Form]  │
├─────────────────────────────────────────────────────────┤
│ [All] [Pending] [Completed]                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Client Onboarding Questionnaire                        │
│ Strategy • 12 fields • 3/5 responses • Due Nov 30      │
│ Assigned: Hydrus, Peak Design, Make Waves             │
│ [View Responses] [Edit] [Send Reminder]                │
│                                                         │
│ ─────────────────────────────────────────────────────  │
│                                                         │
│ Monthly Check-in - October                             │
│ Monthly • 8 fields • 5/5 responses ✅ • Completed      │
│ [View Responses] [Export CSV]                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### **Form Builder:**
```
┌─────────────────────────────────────────────────────────┐
│ Create New Form                                    [X]  │
├─────────────────────────────────────────────────────────┤
│ Form Title: Client Onboarding                          │
│ Description: Gather brand info from new clients        │
│ Category: [Onboarding ▼]                               │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Form Fields:                          [Add Field]   ││
│ ├─────────────────────────────────────────────────────┤│
│ │ 1. Brand Name (Text) [Required]          [Edit] [×]││
│ │ 2. Brand Colors (Text)                   [Edit] [×]││
│ │ 3. Target Audience (Textarea) [Required] [Edit] [×]││
│ │ 4. Design Preferences (Textarea)         [Edit] [×]││
│ │ 5. Tone of Voice (Select)                [Edit] [×]││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ Assign to Clients: [Select Clients ▼]                  │
│ Due Date: [Nov 30, 2025]                               │
│                                                         │
│ [Save as Draft] [Activate & Send to Clients]           │
└─────────────────────────────────────────────────────────┘
```

### **Response Viewer:**
```
┌─────────────────────────────────────────────────────────┐
│ Client Onboarding - Responses (3/5)                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ✅ Hydrus - Completed Oct 28                           │
│    Brand Colors: #3B82F6, #1D4ED8                      │
│    Target Audience: Health-conscious millennials       │
│    [View Full Response] [Import to Content Hub]        │
│                                                         │
│ ✅ Peak Design - Completed Oct 29                      │
│    [View Full Response] [Import to Content Hub]        │
│                                                         │
│ ⏳ Make Waves - Not Yet Completed                      │
│    [Send Reminder]                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

```sql
CREATE TABLE ops_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) NOT NULL,
  
  -- Form Details
  form_title TEXT NOT NULL,
  form_description TEXT,
  category TEXT CHECK (category IN ('onboarding', 'strategy', 'monthly', 'brief', 'demographic', 'custom')),
  
  -- Configuration
  fields JSONB NOT NULL,  -- Array of form fields
  status TEXT CHECK (status IN ('draft', 'active', 'archived')) DEFAULT 'draft',
  
  -- Assignment
  assigned_client_ids UUID[],  -- Array of client IDs
  due_date TIMESTAMP WITH TIME ZONE,
  
  -- Sharing
  share_token TEXT UNIQUE,  -- For shareable link
  
  -- Metadata
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ops_form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES ops_forms(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  
  -- Response Data
  response_data JSONB NOT NULL,  -- Field ID → Answer mapping
  
  -- Status
  status TEXT CHECK (status IN ('incomplete', 'submitted', 'reviewed')) DEFAULT 'submitted',
  imported_to_content_hub BOOLEAN DEFAULT false,
  
  -- User
  submitted_by UUID REFERENCES user_profiles(id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_by UUID REFERENCES user_profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_ops_forms_agency ON ops_forms(agency_id, status);
CREATE INDEX idx_ops_form_responses_form ON ops_form_responses(form_id, status);
CREATE INDEX idx_ops_form_responses_client ON ops_form_responses(client_id);
```

---

## 🔗 Integration with Content Hub

### **Auto-Import Mapping:**
```typescript
// When clicking "Import to Content Hub" on a response:
const importFormToContentHub = async (response: FormResponse) => {
  const data = response.response_data
  
  // Map to Brand Guidelines
  await supabase.from('ops_brand_guidelines').upsert({
    client_id: response.client_id,
    brand_colors: data['brand_colors']?.split(',') || [],
    fonts: data['fonts'],
    tone_of_voice: data['tone_of_voice'],
    legal_requirements: data['legal_requirements'],
    key_messaging: data['key_messages']
  })
  
  // Map to Copy Notes
  await supabase.from('ops_copy_notes').upsert({
    client_id: response.client_id,
    voice_tone: data['voice_description'],
    key_phrases: data['key_phrases'],
    avoid_phrases: data['avoid_words']
  })
  
  // Map to Design Notes
  await supabase.from('ops_design_notes').upsert({
    client_id: response.client_id,
    design_preferences: data['design_preferences'],
    client_likes: data['design_likes'],
    client_dislikes: data['design_dislikes']
  })
  
  // Mark as imported
  await supabase.from('ops_form_responses').update({
    imported_to_content_hub: true
  }).eq('id', response.id)
}
```

---

## 📋 Pre-Built Form Templates

### **1. Client Onboarding Form**
```javascript
{
  title: "Client Onboarding Questionnaire",
  category: "onboarding",
  fields: [
    { type: 'text', label: 'Brand Name', required: true },
    { type: 'email', label: 'Primary Contact Email', required: true },
    { type: 'text', label: 'Website URL' },
    { type: 'text', label: 'Brand Colors (comma-separated hex codes)', placeholder: '#3B82F6, #1D4ED8' },
    { type: 'text', label: 'Primary Font', placeholder: 'Montserrat' },
    { type: 'select', label: 'Brand Voice', options: ['Professional', 'Friendly', 'Energetic', 'Luxurious', 'Playful'], required: true },
    { type: 'textarea', label: 'Key Brand Messages' },
    { type: 'textarea', label: 'Legal/Compliance Requirements' },
    { type: 'textarea', label: 'Design Preferences' },
    { type: 'textarea', label: 'Design Dislikes' },
    { type: 'text', label: 'Target Audience Demographics', required: true },
    { type: 'textarea', label: 'Top 3 Competitors (with URLs)' }
  ]
}
```

### **2. Strategy & Demographics Form**
```javascript
{
  title: "Strategy & Audience Demographics",
  category: "strategy",
  fields: [
    { type: 'textarea', label: 'What are your main business goals for email marketing?', required: true },
    { type: 'text', label: 'Target Annual Revenue from Email' },
    { type: 'textarea', label: 'Describe your ideal customer' },
    { type: 'checkbox', label: 'Target Demographics', options: ['18-24', '25-34', '35-44', '45-54', '55+'] },
    { type: 'select', label: 'Primary Gender', options: ['Female-focused', 'Male-focused', 'Gender-neutral'] },
    { type: 'textarea', label: 'What problems does your product solve?' },
    { type: 'textarea', label: 'What makes you different from competitors?' },
    { type: 'select', label: 'Current Email Frequency', options: ['1-2/week', '3-4/week', 'Daily', 'As needed'] }
  ]
}
```

### **3. Monthly Strategy Form**
```javascript
{
  title: "Monthly Strategy Planning",
  category: "monthly",
  fields: [
    { type: 'textarea', label: 'Key Initiatives This Month' },
    { type: 'textarea', label: 'Promotional Calendar (sales, launches, events)' },
    { type: 'textarea', label: 'Content Themes/Focus Areas' },
    { type: 'textarea', label: 'Any New Products/Services to Highlight?' },
    { type: 'select', label: 'Priority Level This Month', options: ['High', 'Medium', 'Low'] },
    { type: 'textarea', label: 'Additional Requests or Notes' }
  ]
}
```

---

## 🎨 Features

### **Agency Admin (Internal OS):**
- ✅ Create custom forms
- ✅ Use pre-built templates
- ✅ Assign to specific clients
- ✅ Set due dates
- ✅ Track completion status
- ✅ View all responses
- ✅ Import responses to Content Hub (one-click)
- ✅ Export responses to CSV

### **Client (Portal):**
- ✅ See assigned forms in portal "Forms" tab
- ✅ Fill out and submit
- ✅ Save draft (partially complete)
- ✅ View previous submissions

### **Auto-Population:**
- ✅ Onboarding form → Auto-fills Content Hub
- ✅ Saves time on manual data entry
- ✅ Standardizes information collection
- ✅ Updates when client submits new info

---

## 🔄 Workflow

```
STEP 1: Create Form (Internal OS)
──────────────────────────────────
Agency admin creates "Client Onboarding" form
- Uses template or builds custom
- Assigns to new client: "Hydrus"
- Sets due date: 3 days

STEP 2: Client Receives (Portal)
──────────────────────────────────
Client logs into portal
- Sees "Forms" tab with notification badge
- Opens "Client Onboarding" form
- Fills out all fields
- Clicks "Submit"

STEP 3: Response Collected (Internal OS)
──────────────────────────────────
Agency admin sees response notification
- Views completed form
- Reviews answers
- Clicks "Import to Content Hub"

STEP 4: Auto-Population (Content Hub)
──────────────────────────────────
Content Hub automatically updates:
✅ Brand Guidelines populated
✅ Copy Notes populated
✅ Design Notes populated
✅ Demographics saved

STEP 5: Ready to Work
──────────────────────────────────
Team has all info needed to create campaigns!
```

---

## 💡 Smart Features

### **Conditional Fields:**
- If answer = X, show additional fields
- Example: "Do you have brand guidelines?" 
  - Yes → Show "Upload URL" field
  - No → Skip

### **Field Validation:**
- Email format validation
- URL format validation
- Required field enforcement
- Character limits
- Number ranges

### **Response Analytics:**
- Average completion time
- Drop-off points (which fields cause abandonment)
- Most common answers
- Completion rates by client

---

## 🎯 Why This is Important

**Without Forms:**
- ❌ Manual data gathering (emails, calls, spreadsheets)
- ❌ Inconsistent information
- ❌ Time-consuming onboarding
- ❌ Missing details
- ❌ Hard to track what's been collected

**With Forms:**
- ✅ Standardized data collection
- ✅ Fast onboarding (send form, get info)
- ✅ Complete information every time
- ✅ Auto-populates Content Hub
- ✅ Track completion status
- ✅ Easy to update when client info changes

---

## 📊 Integration Points

### **With Content Hub:**
- Forms populate brand guidelines
- Forms populate copy/design notes
- One-click import

### **With Campaigns:**
- Campaign briefs as forms
- Gather campaign-specific info
- Attach responses to campaigns

### **With Portal:**
- Forms appear in client portal
- Client fills out
- Syncs automatically

### **With Scope:**
- Demographics inform strategy
- Goals inform scope configuration

---

## 🚀 Build Priority

**Recommendation:** Build Forms BEFORE database integration

**Why:**
- Forms will generate Content Hub data
- Better to have form system in place
- Can test full workflow (form → content hub → campaigns)
- Onboarding new clients will be smooth

**Updated Phase Order:**
1. ✅ Phases 1-5: Campaigns (done)
2. ✅ Phase 6: Content Hub (done)
3. **Phase 11: Forms** ← Build next (reorder to Phase 7)
4. Phase 7 (now 8): Scope Tracker
5. Phase 8 (now 9): Flow Management
6. Phase 9 (now 10): A/B Test Tracker
7. Phase 10 (now 11): QA/Management View

---

## ✅ Summary

**Forms System Adds:**
- Custom questionnaire builder
- Pre-built templates (onboarding, strategy, monthly)
- Client distribution & tracking
- Response collection
- Auto-populate Content Hub
- Export capabilities

**10 tasks, 8-12 hours estimated**

**This is a HIGH priority feature!** Should we build it next? 🚀

