# 📋 Phase 7: Dynamic Forms - Detailed Task Breakdown

**Goal:** Build custom form system for client onboarding and data collection  
**Total Tasks:** 10  
**Estimated Time:** 8-12 hours  
**Priority:** HIGH - Essential for populating Content Hub

---

## ✅ Task Checklist

### **Phase 7: Dynamic Forms**
- [ ] Task 65: Forms tab layout and form list
- [ ] Task 66: Form builder interface
- [ ] Task 67: Pre-built form templates
- [ ] Task 68: Form configuration modal
- [ ] Task 69: Form response viewer
- [ ] Task 70: Auto-populate Content Hub from responses

---

## 📝 Detailed Task Breakdown

---

## **TASK 65: Forms Tab Layout and Form List**

**Goal:** Create Forms tab with list of all forms

**Files to Create:**
- `/components/ops/ops-forms.tsx`

**What to Build:**
```tsx
Forms Tab Structure:
- Header with "Forms" title and "Create Form" button
- Filter tabs: All | Active | Completed | Drafts
- Form list (cards or table)
- Each form shows:
  - Form title
  - Category badge (Onboarding, Strategy, Monthly, etc.)
  - Number of fields
  - Responses (X of Y completed)
  - Due date (if set)
  - Assigned clients
  - Status badge
  - Actions: View Responses, Edit, Delete
```

**Mock Data:**
```tsx
const mockForms = [
  {
    id: '1',
    title: 'Client Onboarding Questionnaire',
    description: 'Gather brand info from new clients',
    category: 'onboarding',
    num_fields: 12,
    assigned_clients: ['Hydrus', 'Peak Design'],
    responses_count: 1,
    total_clients: 2,
    due_date: new Date(2025, 10, 30),
    status: 'active',
    created_at: new Date(2025, 9, 20)
  },
  {
    id: '2',
    title: 'Monthly Strategy Check-in - November',
    category: 'monthly',
    num_fields: 8,
    assigned_clients: ['Hydrus', 'Peak Design', 'Make Waves'],
    responses_count: 3,
    total_clients: 3,
    status: 'completed',
    created_at: new Date(2025, 10, 1)
  }
]
```

**Design:**
- Match portal's dynamic-forms styling
- Glassmorphism cards for dark theme
- Category badges color-coded
- Status badges (Active = green, Draft = orange, Completed = blue)

**Test:**
- Forms display in list
- Filter tabs work
- Click "Create Form" → Opens modal (Task 66)
- Click "View Responses" → Opens response viewer (Task 69)

**Acceptance:**
- ✅ Forms list displays with mock data
- ✅ Filters work
- ✅ Clean, professional design
- ✅ Matches portal style

---

## **TASK 66: Form Builder Interface**

**Goal:** Build modal to create/edit forms with field builder

**Files to Update:**
- `/components/ops/ops-forms.tsx`

**What to Build:**
```tsx
Form Builder Modal:
├── Form Details
│   ├── Form Title (input)
│   ├── Description (textarea)
│   ├── Category (select: Onboarding, Strategy, Monthly, Brief, Custom)
│   └── Assign to Clients (multi-select)
├── Field Builder
│   ├── "Add Field" button with type selector
│   ├── Field types dropdown:
│   │   - Text Input
│   │   - Text Area
│   │   - Select (Dropdown)
│   │   - Checkbox
│   │   - Radio Buttons
│   │   - Date Picker
│   │   - Email
│   │   - Number
│   ├── For each field:
│   │   - Field Label (input)
│   │   - Placeholder (input)
│   │   - Required checkbox
│   │   - Description (optional help text)
│   │   - If select/radio: Options (add/remove)
│   │   - Reorder buttons (up/down arrows)
│   │   - Delete field button
│   └── Field list (showing all added fields)
└── Actions
    ├── Save as Draft
    ├── Activate & Send to Clients
    └── Cancel
```

**Field Editor Example:**
```tsx
Field #1:
├── Type: [Text Input ▼]
├── Label: Brand Name
├── Placeholder: Enter your brand name
├── [x] Required
├── Description: (optional help text)
├── [↑] [↓] [🗑️] (reorder/delete)
```

**Features:**
- Add fields dynamically
- Reorder with arrow buttons
- Delete fields
- For select/radio: Add option, remove option
- Live preview of form (optional)

**Test:**
- Click "Add Field" → Field editor appears
- Fill in field details
- Add multiple fields
- Reorder fields
- Delete a field
- Save form → Appears in list

**Acceptance:**
- ✅ Can add 8+ field types
- ✅ Reorder works
- ✅ Delete works
- ✅ Form saves properly
- ✅ Clean UI

---

## **TASK 67: Pre-Built Form Templates**

**Goal:** Template selector for common forms

**Files to Update:**
- `/components/ops/ops-forms.tsx`

**What to Build:**
```tsx
Template Selector (in Create Form modal):
- "Use Template" button
- Template options:
  1. Client Onboarding (12 fields)
  2. Brand Guidelines Questionnaire (8 fields)
  3. Monthly Strategy Form (6 fields)
  4. Campaign Brief (10 fields)
  5. Demographic Survey (7 fields)
  6. Blank Form (start from scratch)
- Click template → Pre-populates all fields
- Can still edit/customize after loading
```

**Template: Client Onboarding**
```javascript
{
  title: "Client Onboarding Questionnaire",
  description: "Gather essential brand information from new clients",
  category: "onboarding",
  fields: [
    { type: 'text', label: 'Brand Name', required: true },
    { type: 'email', label: 'Primary Contact Email', required: true },
    { type: 'text', label: 'Website URL', required: false },
    { type: 'text', label: 'Brand Colors (hex codes, comma-separated)', 
      placeholder: '#3B82F6, #1D4ED8, #60A5FA' },
    { type: 'text', label: 'Primary Font', placeholder: 'Montserrat' },
    { type: 'text', label: 'Secondary Font', placeholder: 'Open Sans' },
    { type: 'select', label: 'Brand Voice', 
      options: ['Professional', 'Friendly', 'Energetic', 'Luxurious', 'Playful', 'Technical'],
      required: true },
    { type: 'textarea', label: 'Key Brand Messages (one per line)' },
    { type: 'textarea', label: 'Legal/Compliance Requirements' },
    { type: 'textarea', label: 'Design Preferences', 
      description: 'Colors, layouts, image styles you prefer' },
    { type: 'textarea', label: 'Design Dislikes',
      description: 'Things to avoid in designs' },
    { type: 'text', label: 'Target Audience Description', required: true },
    { type: 'textarea', label: 'Top 3-5 Competitors (with URLs)' }
  ]
}
```

**Template: Monthly Strategy**
```javascript
{
  title: "Monthly Strategy Planning",
  category: "monthly",
  fields: [
    { type: 'textarea', label: 'Key Initiatives This Month', required: true },
    { type: 'textarea', label: 'Promotional Calendar (sales, launches, events)' },
    { type: 'textarea', label: 'Content Themes/Focus Areas' },
    { type: 'textarea', label: 'New Products/Services to Highlight?' },
    { type: 'select', label: 'Priority Level', 
      options: ['High', 'Medium', 'Low'] },
    { type: 'textarea', label: 'Additional Requests or Notes' }
  ]
}
```

**Test:**
- Click "Use Template"
- Select "Client Onboarding"
- All 12 fields pre-populated
- Edit field labels if needed
- Save form

**Acceptance:**
- ✅ 5 templates available
- ✅ Templates pre-populate correctly
- ✅ Can customize after loading
- ✅ All field types represented

---

## **TASK 68: Form Configuration & Assignment**

**Goal:** Configure form settings and assign to clients

**What to Build:**
```tsx
Form Settings (in builder modal):
├── Assignment
│   ├── Select Clients (multi-select dropdown)
│   ├── Or "All Clients" checkbox
│   └── Shows: "3 clients selected"
├── Due Date (optional)
│   ├── Date picker
│   └── "No due date" checkbox
├── Status
│   ├── Draft (save but don't send)
│   ├── Active (send to clients immediately)
│   └── Can change later
└── Share Link
    ├── Auto-generated unique token
    ├── URL: /forms/[token]
    ├── Copy link button
    └── Send via email (future)
```

**Client Multi-Select:**
```tsx
<div>
  <label>Assign to Clients</label>
  <div className="space-y-2 max-h-[200px] overflow-y-auto">
    {clients.map(client => (
      <label key={client.id} className="flex items-center gap-2">
        <input type="checkbox" value={client.id} />
        {client.brand_name}
      </label>
    ))}
  </div>
  <div className="text-sm text-gray-600">
    {selectedClients.length} clients selected
  </div>
</div>
```

**Share Link Generation:**
```typescript
const generateShareToken = () => {
  return `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

const shareUrl = `${window.location.origin}/forms/${shareToken}`
```

**Test:**
- Select 2-3 clients
- Set due date
- Save as "Active"
- Share link generated
- Copy link works

**Acceptance:**
- ✅ Can assign to multiple clients
- ✅ Due date optional
- ✅ Status selection works
- ✅ Share link generates and copies

---

## **TASK 69: Form Response Viewer**

**Goal:** View and manage form responses

**What to Build:**
```tsx
Response Viewer Modal:
├── Header
│   ├── Form title
│   ├── Response count (3 of 5)
│   └── Export to CSV button
├── Response List
│   ├── For each assigned client:
│   │   ├── Client name
│   │   ├── Status: ✅ Completed | ⏳ Pending
│   │   ├── Submitted date (if completed)
│   │   ├── [View Response] button
│   │   ├── [Import to Content Hub] button
│   │   └── [Send Reminder] button (if pending)
│   └── Sortable by status, date
└── Individual Response View
    ├── Client name
    ├── Submitted date
    ├── All questions & answers
    ├── [Import to Content Hub] button
    └── [Export PDF] button
```

**Response Display:**
```tsx
Response from: Hydrus
Submitted: Oct 28, 2025 3:45 PM

Q: Brand Name
A: Hydrus

Q: Brand Colors
A: #3B82F6, #1D4ED8, #60A5FA

Q: Brand Voice
A: Energetic

Q: Target Audience
A: Health-conscious millennials aged 25-40

[Import to Content Hub] [Export PDF]
```

**Mock Response Data:**
```tsx
{
  form_id: '1',
  client_id: 'hydrus-id',
  submitted_at: new Date(2025, 9, 28),
  response_data: {
    'brand_name': 'Hydrus',
    'brand_colors': '#3B82F6, #1D4ED8, #60A5FA',
    'fonts_primary': 'Montserrat',
    'brand_voice': 'Energetic',
    'target_audience': 'Health-conscious millennials aged 25-40',
    'design_preferences': 'Bold colors, lifestyle photos, clean layouts',
    'design_dislikes': 'Stock photos, busy designs, red colors'
  },
  imported_to_content_hub: false
}
```

**Test:**
- Click "View Responses" on form
- See list of clients (completed/pending)
- Click "View Response" → See Q&A
- Click "Import to Content Hub" → Success message

**Acceptance:**
- ✅ Response list displays
- ✅ Can view individual responses
- ✅ Export works
- ✅ Pending/completed status clear

---

## **TASK 70: Auto-Populate Content Hub**

**Goal:** One-click import form responses to Content Hub

**What to Build:**
```tsx
Import Logic:
1. Click "Import to Content Hub" button
2. Show confirmation modal:
   "Import Hydrus's responses to Content Hub?
    This will populate:
    - Brand Guidelines
    - Copy Notes
    - Design Notes"
3. Map form fields to Content Hub fields
4. Save to respective tables
5. Mark response as imported
6. Show success message
```

**Field Mapping:**
```typescript
const importResponseToContentHub = (response) => {
  const data = response.response_data
  
  // Map to Brand Guidelines
  const guidelines = {
    client_id: response.client_id,
    brand_colors: data['brand_colors']?.split(',').map(c => c.trim()) || [],
    fonts: `${data['fonts_primary']}, ${data['fonts_secondary']}`,
    tone_of_voice: data['brand_voice'] || '',
    legal_requirements: data['legal_requirements'] || '',
    key_messaging: data['key_messages'] || ''
  }
  
  // Map to Copy Notes
  const copyNotes = {
    client_id: response.client_id,
    voice_tone: data['brand_voice'] + ' - ' + data['voice_description'],
    key_phrases: data['key_phrases'] || '',
    avoid_phrases: data['avoid_words'] || '',
    legal_notes: data['legal_requirements'] || ''
  }
  
  // Map to Design Notes
  const designNotes = {
    client_id: response.client_id,
    design_preferences: data['design_preferences'] || '',
    client_likes: data['design_likes'] || '',
    client_dislikes: data['design_dislikes'] || '',
    image_style: data['image_preferences'] || '',
    mobile_notes: ''
  }
  
  // Save all (will use API in production)
  console.log('✅ Importing to Content Hub:', { guidelines, copyNotes, designNotes })
  
  // Mark as imported
  response.imported_to_content_hub = true
}
```

**Confirmation Modal:**
```tsx
<Modal>
  <h3>Import to Content Hub?</h3>
  <p>This will populate Content Hub for {clientName}:</p>
  <ul>
    ✅ Brand Guidelines (colors, fonts, tone)
    ✅ Copy Notes (voice, key phrases)
    ✅ Design Notes (preferences, likes/dislikes)
  </ul>
  <p className="text-sm text-gray-600">
    Existing data will be updated. You can edit after import.
  </p>
  <button onClick={importData}>Import Now</button>
  <button onClick={cancel}>Cancel</button>
</Modal>
```

**Success Indication:**
- Checkmark appears on response
- "Imported" badge shows
- Link to view in Content Hub
- Can re-import if needed (updates data)

**Test:**
- Click "Import to Content Hub"
- Confirmation appears
- Click "Import Now"
- Success message
- Go to Content Hub → See data populated!

**Acceptance:**
- ✅ Import button works
- ✅ Confirmation modal shows
- ✅ Data maps correctly
- ✅ Success feedback clear
- ✅ Imported status tracked

---

## **BONUS TASKS (Optional but Recommended):**

### **Task 71: Form Share Link & Portal Integration**

**Goal:** Send forms to clients, they fill in portal

**What to Build:**
- Generate unique share token
- Copy share link button
- Client sees form in portal "Forms" tab
- Client fills out and submits
- Response appears in ops dashboard

**Portal Integration:**
```typescript
// In client portal (already has DynamicForms component)
// Load forms assigned to this client
const assignedForms = await supabase
  .from('ops_forms')
  .select('*')
  .contains('assigned_client_ids', [clientId])
  .eq('status', 'active')

// Show in portal Forms tab
// Client fills and submits
// Creates entry in ops_form_responses
```

---

### **Task 72: Send Form Reminders**

**Goal:** Remind clients to complete forms

**What to Build:**
- "Send Reminder" button on pending responses
- Email notification (optional)
- Track reminder sent date
- Don't spam (max 1 reminder per 3 days)

---

### **Task 73: Export Responses**

**Goal:** Export form data

**What to Build:**
- Export single response as PDF
- Export all responses as CSV
- Include all questions and answers
- Timestamp and client info

**CSV Format:**
```
Client, Submitted Date, Brand Name, Brand Colors, Brand Voice, ...
Hydrus, 10/28/2025, Hydrus, #3B82F6..., Energetic, ...
Peak Design, 10/29/2025, Peak Design, #10B981..., Professional, ...
```

---

## 🎨 Complete Forms Workflow

### **Scenario: Onboarding New Client**

```
STEP 1: Create Form (Before Client Onboards)
──────────────────────────────────────────────
Agency admin:
1. Click "Forms" tab
2. Click "Create Form"
3. Click "Use Template" → "Client Onboarding"
4. Review pre-filled 12 fields
5. Customize if needed
6. Assign to: "New Client (Hydrus)"
7. Due date: 3 days from now
8. Click "Activate & Send"

Result: Form active, share link generated

STEP 2: Send to Client
──────────────────────────────────────────────
Agency admin:
1. Copy share link
2. Email to client: "Please fill out this form before our kickoff call"

Client:
3. Opens link
4. Sees form in their portal
5. Fills out all 12 questions (20 min)
6. Clicks "Submit"

STEP 3: View Response (After Client Submits)
──────────────────────────────────────────────
Agency admin:
1. Notification: "Hydrus completed onboarding form"
2. Go to Forms tab
3. See "1 of 1 responses" on form
4. Click "View Responses"
5. Click "View Response" next to Hydrus
6. Review all answers

STEP 4: Import to Content Hub
──────────────────────────────────────────────
Agency admin:
1. Click "Import to Content Hub"
2. Confirmation: "This will populate Brand Guidelines, Copy Notes, Design Notes"
3. Click "Import Now"
4. Success: "✅ Hydrus's data imported to Content Hub"

STEP 5: Verify in Content Hub
──────────────────────────────────────────────
Agency admin:
1. Go to Content Hub tab
2. Select Hydrus
3. Check Brand Guidelines → Colors populated ✅
4. Check Copy Notes → Voice & tone populated ✅
5. Check Design Notes → Preferences populated ✅

STEP 6: Start Creating Campaigns
──────────────────────────────────────────────
Agency now has all info needed!
- Brand guidelines complete
- Copy guidelines clear
- Design preferences known
- Can create campaigns immediately
```

**Time Saved:** 2-3 days of back-and-forth emails!

---

## 🗄️ Database Schema (For Reference)

```sql
CREATE TABLE ops_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) NOT NULL,
  
  form_title TEXT NOT NULL,
  form_description TEXT,
  category TEXT CHECK (category IN ('onboarding', 'strategy', 'monthly', 'brief', 'demographic', 'custom')),
  
  fields JSONB NOT NULL,  -- Array of form field objects
  
  assigned_client_ids UUID[] NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  
  status TEXT CHECK (status IN ('draft', 'active', 'completed', 'archived')) DEFAULT 'draft',
  share_token TEXT UNIQUE,
  
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ops_form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES ops_forms(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) NOT NULL,
  
  response_data JSONB NOT NULL,  -- {field_id: answer}
  
  status TEXT CHECK (status IN ('incomplete', 'submitted', 'reviewed')) DEFAULT 'submitted',
  imported_to_content_hub BOOLEAN DEFAULT false,
  import_date TIMESTAMP WITH TIME ZONE,
  
  submitted_by UUID REFERENCES user_profiles(id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ops_forms_agency ON ops_forms(agency_id, status);
CREATE INDEX idx_ops_form_responses_form ON ops_form_responses(form_id);
CREATE INDEX idx_ops_form_responses_client ON ops_form_responses(client_id);
```

---

## 💡 Smart Features to Consider

### **Conditional Logic:**
```
If "Do you have brand guidelines?" = "Yes"
  → Show "Brand Guidelines URL" field
If "Do you have brand guidelines?" = "No"
  → Show "We'll create guidelines for you" message
```

### **Field Validation:**
- Email format validation
- URL format validation  
- Required field enforcement
- Character limits
- Hex code validation for colors

### **Response Analytics:**
- Average completion time
- Common answers (for select/radio fields)
- Completion rate by client
- Drop-off analysis (which fields cause abandonment)

---

## 🎯 Testing Protocol

**After Each Task:**
1. Test form creation
2. Test field builder (add, edit, delete, reorder)
3. Test template loading
4. Test client assignment
5. Test response collection
6. Test import to Content Hub
7. Verify Content Hub updated correctly

**Before Moving to Next Phase:**
- Create onboarding form
- Assign to mock client
- Fill out response (simulate client)
- Import to Content Hub
- Verify all data populated

---

## 📊 Success Metrics

**Forms System Success:**
- ✅ Can create form in < 5 minutes using template
- ✅ Client can complete in < 30 minutes
- ✅ Import to Content Hub in 1 click
- ✅ Zero manual data entry needed
- ✅ All client info centralized

**vs Current Process:**
- ❌ 2-3 days of email back-and-forth
- ❌ Manual data entry
- ❌ Incomplete information
- ❌ Inconsistent format

---

## 🚀 Build Order for Phase 7

**Recommended sequence:**
1. Task 65: Forms list (foundation)
2. Task 67: Templates first (easier to test)
3. Task 66: Form builder (build on templates)
4. Task 68: Configuration (assignment, due dates)
5. Task 69: Response viewer
6. Task 70: Import to Content Hub (the magic!)

**Estimated Time:** 
- Task 65: 1-2 hours
- Task 66: 2-3 hours  
- Task 67: 1 hour
- Task 68: 1-2 hours
- Task 69: 2 hours
- Task 70: 1-2 hours

**Total: 8-12 hours**

---

## ✅ Ready to Build?

**Phase 7 will be incredibly useful!** It solves a real pain point (client onboarding) and auto-populates all the Content Hub data.

**Want me to start building Phase 7 (Forms)?** Just say "start" and I'll begin with Task 65! 🚀

