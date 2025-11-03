# 📋 AIRTABLE TO OPS SYSTEM - MIGRATION PLAN

**Date:** November 3, 2025  
**Status:** Planning Phase - Ready to Execute

---

## 🎯 CURRENT STATE

### **Airtable Configuration:**
- **Base ID:** `appC4CfK2BkIVT0mN`
- **Table:** `Retention` (ID: `tblG1qADMDrBjuX5R`)
- **Total Records:** 100+ (campaigns and flows combined)
- **Connection Status:** ✅ Working

### **Airtable Data Structure:**

**Fields in Airtable:**
```
- Tasks (campaign/flow name)
- Client (TriRig, Hydrus, Ramrods Archery, Safari Pedals, etc.)
- Stage (Content Strategy, Copy, Design, QA, Client Approval, etc.)
- Type (Campaigns, Flows, Popup)
- Campaign Type (email, sms)
- Send Date
- Assignee (name + email object)
- Notes (description)
- Offer (subject line)
- Copy Link (Google Docs URL)
- Client Revisions (client feedback)
- A/B Test
- File (design files array with thumbnails)
- Copy Due Date
- Design Due Date
```

**Current Data:**
- **Campaigns:** ~40-50
- **Flows:** ~50-60
- **Clients:** TriRig, Hydrus, Ramrods Archery, Safari Pedals, Nyan, montis, brilliant scents
- **Statuses:** Content Strategy, Copy, Design, Client Approval, Scheduled - Close, etc.

---

## 🗄️ OPS SYSTEM STRUCTURE

### **Tables You Have:**
```
ops_campaigns:
├─ id (UUID)
├─ client_id (UUID FK to clients)
├─ campaign_name
├─ campaign_type (email/sms)
├─ status
├─ send_date
├─ subject_line
├─ target_audience
├─ assignee
├─ copy_doc_url
├─ preview_url (single image URL)
├─ internal_notes
├─ client_notes
├─ client_revisions
├─ client_approved
├─ approval_date
├─ revision_date
└─ airtable_record_id (for tracking)

ops_flows:
├─ id (UUID)
├─ client_id (UUID FK to clients)
├─ flow_name
├─ flow_type
├─ status
├─ trigger_type
├─ num_emails
├─ target_audience
├─ description
├─ notes
├─ client_notes
├─ client_revisions
├─ flow_approved
├─ approval_date
├─ assignee
├─ copy_doc_url
├─ go_live_date
└─ airtable_record_id (for tracking)
```

---

## 🔄 MIGRATION STRATEGY

### **Option 1: ONE-TIME BULK IMPORT (Recommended)**

**Pros:**
- ✅ Fast - Import all data at once
- ✅ Clean slate - Start fresh in Ops system
- ✅ Can verify before switching over
- ✅ Keep Airtable as backup

**Cons:**
- ⚠️ One-time effort needed
- ⚠️ Need to map all fields correctly
- ⚠️ Design files need handling (100+ images)

**Process:**
1. Fetch all Airtable records via API
2. Map fields to ops_campaigns/ops_flows
3. Upload design files to storage (Vercel Blob, S3, or Supabase Storage)
4. Insert into ops_campaigns and ops_flows tables
5. Store Airtable record IDs for reference
6. Verify all data migrated correctly
7. **Switch portal to use Ops system only**
8. Keep Airtable as read-only backup

---

### **Option 2: DUAL-SYNC (Bridge Period)**

**Pros:**
- ✅ Gradual transition
- ✅ Can test before full switch
- ✅ Both systems work in parallel

**Cons:**
- ⚠️ Complex - Need to sync both ways
- ⚠️ Double work updating both systems
- ⚠️ Potential sync conflicts

**Process:**
1. New campaigns created in Ops → Sync to Airtable
2. Airtable updates → Sync to Ops (webhook or polling)
3. Test for 1-2 weeks
4. Switch off Airtable sync
5. Archive Airtable

---

### **Option 3: FRESH START (Clean Slate)**

**Pros:**
- ✅ Simplest - Just start using Ops
- ✅ No migration needed
- ✅ Clean system

**Cons:**
- ⚠️ Lose historical data
- ⚠️ Need to recreate active campaigns/flows
- ⚠️ No archive of past work

**Process:**
1. Export Airtable to CSV (backup)
2. Start creating new campaigns in Ops Dashboard
3. Old campaigns stay in Airtable for reference
4. Portal only shows new Ops campaigns

---

## 💡 RECOMMENDED APPROACH: **Option 1 - Bulk Import**

### **Why This is Best:**
1. ✅ Preserves all historical data
2. ✅ One-time effort (4-6 hours)
3. ✅ Can verify before switching
4. ✅ Portal works with all data immediately
5. ✅ Keep Airtable as backup/archive

---

## 📝 FIELD MAPPING

### **Campaigns:**
| Airtable Field | ops_campaigns Column | Transformation |
|----------------|---------------------|----------------|
| `Tasks` | `campaign_name` | Direct |
| `Campaign Type[0]` | `campaign_type` | email/sms |
| `Stage` | `status` | Direct |
| `Client` | `client_id` | Lookup client by name |
| `Send Date` | `send_date` | Parse date |
| `Offer` | `subject_line` | Direct |
| `Notes` | `internal_notes` | Direct |
| `Copy Link` | `copy_doc_url` | Direct |
| `Client Revisions` | `client_revisions` | Direct |
| `Assignee.name` | `assignee` | Extract name |
| `File[0].url` | `preview_url` | First image URL |
| `File[]` | Store separately | Array of images |
| `A/B Test` | Store in ops_ab_tests | If not empty |
| Airtable `record.id` | `airtable_record_id` | For tracking |

### **Flows:**
| Airtable Field | ops_flows Column | Transformation |
|----------------|-----------------|----------------|
| `Tasks` | `flow_name` | Direct |
| `Stage` | `status` | Direct |
| `Client` | `client_id` | Lookup client by name |
| `Notes` | `description` + `notes` | Parse |
| `Copy Link` | `copy_doc_url` | Direct |
| `Client Revisions` | `client_revisions` | Direct |
| `Assignee.name` | `assignee` | Extract name |
| `Send Date` (flows) | `go_live_date` | Parse date |
| `Copy Due Date` | `copy_due_date` | Parse date |
| `Design Due Date` | `design_due_date` | Parse date |
| `File[]` | Store separately | Array of images |
| Extracted from Notes | `flow_type` | Parse (welcome, abandoned_cart, etc.) |
| Extracted from Notes | `trigger_type` | Parse |
| Extracted from Notes | `num_emails` | Parse number |
| Airtable `record.id` | `airtable_record_id` | For tracking |

---

## 🚀 MIGRATION SCRIPT OUTLINE

### **Step 1: Fetch All Airtable Data**
```typescript
GET /api/load-from-airtable
- Returns all 100+ records
- Separates campaigns and flows
- Already formatted
```

### **Step 2: Map Clients**
```typescript
const clientMapping = {
  'TriRig': '1a50065f-1387-4231-aadb-1f6c71ac6e45',  // Your actual client IDs
  'Hydrus': 'client-uuid-here',
  'Ramrods Archery': 'client-uuid-here',
  'Safari Pedals': 'client-uuid-here',
  // etc...
}
```

### **Step 3: Upload Design Files**
```typescript
// Option A: Keep Airtable URLs (simple, works for now)
preview_url = airtableRecord.File[0].url

// Option B: Upload to Supabase Storage (permanent)
- Download from Airtable URL
- Upload to Supabase Storage bucket
- Store new URL in ops_campaigns
```

### **Step 4: Bulk Insert**
```typescript
// Insert campaigns
await supabase.from('ops_campaigns').insert(mappedCampaigns)

// Insert flows  
await supabase.from('ops_flows').insert(mappedFlows)
```

### **Step 5: Verify**
```typescript
// Check counts match
// Verify random samples
// Test portal loading
```

---

## 📊 MIGRATION CHECKLIST

### **Pre-Migration:**
- [ ] Get all client UUIDs from database
- [ ] Decide on image storage (Airtable URLs or upload to Supabase)
- [ ] Create migration script
- [ ] Test with 5 sample records
- [ ] Backup current ops_campaigns/ops_flows tables

### **Migration:**
- [ ] Fetch all records from Airtable
- [ ] Map campaigns (40-50 records)
- [ ] Map flows (50-60 records)
- [ ] Handle design files (100+ images)
- [ ] Insert into ops_campaigns
- [ ] Insert into ops_flows
- [ ] Verify counts match

### **Post-Migration:**
- [ ] Test Portal - Campaigns tab
- [ ] Test Portal - Flows tab
- [ ] Verify all statuses correct
- [ ] Check assignees mapped correctly
- [ ] Test preview images work
- [ ] Test copy links work
- [ ] Verify client approval workflow
- [ ] Export Airtable to CSV (backup)
- [ ] Update .env to disable Airtable sync (optional)

---

## ⚠️ KEY DECISIONS NEEDED

### **1. Design Files Strategy:**

**Option A: Keep Airtable URLs** ⭐ RECOMMENDED
- **Pros:** Simple, fast, works immediately
- **Cons:** Relies on Airtable staying active
- **Implementation:** Just copy URLs from Airtable
```typescript
preview_url: airtableFile[0].url  // Direct URL
```

**Option B: Upload to Supabase Storage**
- **Pros:** Permanent, fully self-hosted
- **Cons:** Need to download/reupload 100+ images
- **Implementation:** Download each file, upload to Supabase bucket
```typescript
1. Download from airtableFile.url
2. Upload to Supabase Storage
3. Get public URL
4. Store in preview_url
```

**Option C: Upload to Vercel Blob**
- **Pros:** Fast CDN, integrated with Vercel
- **Cons:** Requires Vercel Blob addon
- **Implementation:** Similar to Option B

**My Recommendation:** Start with **Option A** (keep URLs), migrate to storage later if needed.

---

### **2. Historical Data:**

**Keep everything?**
- ✅ Import all 100+ records
- Full history in Ops system
- May include old/completed projects

**Only active campaigns/flows?**
- ✅ Import only "Client Approval", "Approved", "In Progress" statuses
- Cleaner Ops dashboard
- Old completed items stay in Airtable for reference

**My Recommendation:** Import everything, add filters in Ops to hide old/completed.

---

### **3. Airtable After Migration:**

**Option A: Keep as Read-Only Archive**
- Leave data in Airtable
- Don't sync anymore
- Use for historical reference

**Option B: Bidirectional Sync**
- Keep Airtable updated
- Use webhooks or polling
- More complex but flexible

**Option C: Deprecate Completely**
- Export to CSV
- Delete Airtable workspace
- Save costs

**My Recommendation:** Option A - Keep as archive, no more syncing.

---

## 🛠️ IMPLEMENTATION PLAN

### **Phase 1: Preparation (15 min)**
- [x] Test Airtable connection ✅
- [ ] Get all client UUIDs from database
- [ ] Create client name → UUID mapping
- [ ] Decide on image storage strategy

### **Phase 2: Create Migration Script (30 min)**
- [ ] Create `/scripts/migrate-from-airtable.js`
- [ ] Fetch all Airtable records
- [ ] Map fields to ops structure
- [ ] Handle images (URLs or upload)
- [ ] Test with 5 records

### **Phase 3: Execute Migration (15 min)**
- [ ] Run migration script
- [ ] Verify record counts
- [ ] Check random samples
- [ ] Test portal loading

### **Phase 4: Testing (20 min)**
- [ ] Open Portal → Campaigns tab
- [ ] Verify campaigns load
- [ ] Test preview images
- [ ] Test copy links
- [ ] Test approval workflow
- [ ] Open Portal → Flows tab
- [ ] Verify flows load
- [ ] Test flow approval

### **Phase 5: Cleanup (10 min)**
- [ ] Export Airtable to CSV (backup)
- [ ] Update documentation
- [ ] Remove Airtable API calls from portal (already done!)
- [ ] Optional: Disable Airtable env vars

**Total Time: ~90 minutes**

---

## 📈 MIGRATION IMPACT

### **Before (Current):**
```
Airtable (100+ records)
    │
    ├─> Portal loads via /api/load-from-airtable
    ├─> Ops Dashboard syncs TO Airtable
    └─> Two systems (confusing!)
```

### **After (Migrated):**
```
Ops Dashboard (100+ records)
    │
    └─> Portal loads from ops_campaigns/ops_flows
    └─> Single source of truth! ✅
```

---

## 🎯 NEXT STEPS - YOUR CHOICE

### **Option A: Let Me Build Migration Script** ⭐
I can create a migration script that:
1. Fetches all Airtable data
2. Maps to ops structure
3. Inserts into database
4. Verifies everything worked

**Time:** 30-45 minutes  
**Your involvement:** None (automated)  
**Risk:** Low (can test first)

### **Option B: Manual Migration**
You manually create campaigns/flows in Ops Dashboard:
1. Open Airtable
2. For each record, create in Ops
3. Upload images
4. Add copy links

**Time:** 4-6 hours  
**Your involvement:** High (tedious)  
**Risk:** Low (full control)

### **Option C: Hybrid Approach**
I create script to migrate structure, you verify/cleanup:
1. Script imports basics (name, date, status, links)
2. You review and add details
3. You upload key images manually

**Time:** 2-3 hours  
**Your involvement:** Medium  
**Risk:** Low

---

## 💬 QUESTIONS FOR YOU

1. **Which clients from Airtable should we migrate?**
   - All clients? (TriRig, Hydrus, Ramrods, Safari, Nyan, montis, brilliant scents)
   - Or only current active clients?

2. **Design files strategy?**
   - Keep Airtable URLs? (simple, works now)
   - Upload to Supabase Storage? (permanent)
   - Upload to Vercel Blob? (fast CDN)

3. **Historical data?**
   - Import all 100+ records?
   - Only active/in-progress items?
   - Only campaigns with status "Client Approval" or "Approved"?

4. **Airtable after migration?**
   - Keep as read-only archive?
   - Keep syncing bidirectionally?
   - Export and delete?

5. **Timeline?**
   - Migrate now (today)?
   - Plan for next week?
   - Do it gradually?

---

## 🎯 MY RECOMMENDATION

**Best Approach:**
1. **Keep Airtable image URLs** (Option A) - They work fine, don't expire
2. **Import all 100+ records** - Full history is valuable
3. **Keep Airtable as archive** - Don't sync anymore, just reference
4. **Execute today** - I can build and run the migration script

**Result:**
- ✅ All historical data in Ops system
- ✅ Portal loads from ops tables
- ✅ No more Airtable dependency for daily work
- ✅ Airtable stays as backup/reference
- ✅ Single source of truth going forward

---

## 🚀 READY TO PROCEED?

**Let me know:**
1. Which migration option you prefer (1, 2, or 3)?
2. Answers to the questions above
3. And I'll build the migration script and execute!

**Estimated time to complete:** 60-90 minutes for full migration

---

**Current Airtable Data Sample:**
- ✅ Connection working
- ✅ 100+ records accessible
- ✅ Design files available (thumbnails + full size)
- ✅ All fields mapped and understood
- ✅ Ready to migrate!

