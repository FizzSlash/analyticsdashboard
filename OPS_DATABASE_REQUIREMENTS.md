# 📋 Operations Dashboard - Database Requirements

**Date:** October 31, 2025  
**Status:** UI Complete - Ready for Database Integration

---

## 🎯 Critical Business Rules

### **1. Image Upload Requirement (CRITICAL!)**

**Rule:** Campaign preview image is **REQUIRED** before moving to QA or Client Approval stages.

**Workflow:**
```
Strategy → Copy → Design → [IMAGE UPLOAD] → QA → Client Approval → Approved → Scheduled → Sent
                              ↑ REQUIRED
```

**Why This Matters:**
- ✅ Clients approve campaigns based on preview image
- ✅ QA team needs visual to review design
- ✅ Image shows in client portal for approval
- ✅ Links internal workflow to client-facing portal

**Implementation:**
```typescript
// In database trigger or API validation:
if (status IN ('qa', 'client_approval', 'approved', 'scheduled', 'sent')) {
  if (!preview_url || preview_url === '') {
    throw new Error('Campaign preview image required for this status')
  }
}
```

**Database Column:**
```sql
preview_url TEXT  -- URL to uploaded image (Supabase Storage)
```

---

## 🗄️ Database Schema

### **ops_campaigns Table**

```sql
CREATE TABLE ops_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Client & Agency
  client_id UUID REFERENCES clients(id) NOT NULL,
  agency_id UUID REFERENCES agencies(id) NOT NULL,
  
  -- Campaign Details
  campaign_name TEXT NOT NULL,
  campaign_type TEXT CHECK (campaign_type IN ('email', 'sms')) DEFAULT 'email',
  subject_line TEXT,
  preview_text TEXT,
  target_audience TEXT,
  
  -- Workflow Status
  status TEXT CHECK (status IN (
    'strategy', 'copy', 'design', 'qa', 
    'client_approval', 'approved', 'scheduled', 'sent'
  )) DEFAULT 'strategy',
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  
  -- Scheduling
  send_date TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_send_date TIMESTAMP WITH TIME ZONE,
  
  -- File Links
  copy_doc_url TEXT,
  design_file_url TEXT,
  preview_url TEXT,  -- ⚠️ REQUIRED for qa, client_approval, approved, scheduled, sent
  klaviyo_campaign_id TEXT,
  
  -- Notes
  internal_notes TEXT,
  
  -- Portal Integration
  portal_approval_id UUID REFERENCES campaign_approvals(id),  -- Links to client portal
  
  -- Metadata
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VALIDATION TRIGGER: Enforce image requirement
CREATE OR REPLACE FUNCTION validate_campaign_image()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if status requires image
  IF NEW.status IN ('qa', 'client_approval', 'approved', 'scheduled', 'sent') THEN
    IF NEW.preview_url IS NULL OR NEW.preview_url = '' THEN
      RAISE EXCEPTION 'Campaign preview image is required for status: %', NEW.status;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_campaign_image
  BEFORE INSERT OR UPDATE ON ops_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION validate_campaign_image();
```

---

## 🔄 Portal Integration Logic

### **Auto-Create Portal Approval When Status = "client_approval"**

```sql
CREATE OR REPLACE FUNCTION create_portal_approval_from_ops()
RETURNS TRIGGER AS $$
BEGIN
  -- When campaign status changes TO client_approval
  IF NEW.status = 'client_approval' AND (OLD.status IS NULL OR OLD.status != 'client_approval') THEN
    
    -- Validate image exists
    IF NEW.preview_url IS NULL OR NEW.preview_url = '' THEN
      RAISE EXCEPTION 'Cannot send to client approval without preview image';
    END IF;
    
    -- Create entry in campaign_approvals table (client portal)
    INSERT INTO campaign_approvals (
      ops_campaign_id,
      client_id,
      agency_id,
      campaign_name,
      campaign_type,
      subject_line,
      preview_url,  -- This is what client sees!
      scheduled_date,
      status
    ) VALUES (
      NEW.id,
      NEW.client_id,
      NEW.agency_id,
      NEW.campaign_name,
      NEW.campaign_type,
      NEW.subject_line,
      NEW.preview_url,
      NEW.send_date,
      'client_approval'
    )
    ON CONFLICT (ops_campaign_id) 
    DO UPDATE SET
      preview_url = NEW.preview_url,
      updated_at = NOW();
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ops_to_portal_approval
  AFTER INSERT OR UPDATE ON ops_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION create_portal_approval_from_ops();
```

### **Sync Back When Client Approves**

```sql
CREATE OR REPLACE FUNCTION sync_client_approval_to_ops()
RETURNS TRIGGER AS $$
BEGIN
  -- When client approves in portal
  IF NEW.client_approved = true AND (OLD.client_approved IS NULL OR OLD.client_approved != true) THEN
    
    -- Update ops campaign status
    UPDATE ops_campaigns
    SET status = 'approved'
    WHERE id = NEW.ops_campaign_id;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER portal_approval_to_ops
  AFTER UPDATE ON campaign_approvals
  FOR EACH ROW
  EXECUTE FUNCTION sync_client_approval_to_ops();
```

---

## 📁 File Storage

### **Supabase Storage Buckets:**

```sql
-- Create storage bucket for campaign images
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-previews', 'campaign-previews', true);

-- RLS Policies
CREATE POLICY "Team can upload campaign images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'campaign-previews'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Anyone can view campaign images"
ON storage.objects FOR SELECT
USING (bucket_id = 'campaign-previews');
```

### **Upload Flow (Frontend):**

```typescript
async function uploadCampaignImage(file: File, campaignId: string) {
  const fileName = `${campaignId}-${Date.now()}.${file.name.split('.').pop()}`
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('campaign-previews')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) throw error
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('campaign-previews')
    .getPublicUrl(fileName)
  
  return publicUrl
}
```

---

## 🔗 Integration with Existing Portal

### **Current Portal Tables:**

```sql
campaign_approvals
├── id
├── client_id
├── campaign_name
├── subject_line
├── preview_url          ← Same image from ops_campaigns!
├── status               ← client_approval, approved, revisions_requested
├── client_approved      ← Boolean flag
├── client_revisions     ← Client feedback
└── ops_campaign_id      ← Link back to internal OS (ADD THIS COLUMN!)
```

### **Add Link Column to Portal:**

```sql
ALTER TABLE campaign_approvals
ADD COLUMN ops_campaign_id UUID REFERENCES ops_campaigns(id);

CREATE INDEX idx_campaign_approvals_ops_id 
ON campaign_approvals(ops_campaign_id);
```

---

## 📊 Activity Log Table

```sql
CREATE TABLE ops_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference
  campaign_id UUID REFERENCES ops_campaigns(id) ON DELETE CASCADE,
  flow_id UUID REFERENCES ops_flows(id) ON DELETE CASCADE,
  
  -- Activity Details
  activity_type TEXT CHECK (activity_type IN (
    'created', 'status_change', 'note_added', 'file_uploaded', 
    'updated', 'deleted', 'client_approved', 'client_rejected'
  )) NOT NULL,
  description TEXT NOT NULL,
  
  -- Changes
  old_value TEXT,
  new_value TEXT,
  
  -- User
  user_id UUID REFERENCES user_profiles(id),
  user_name TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ops_activity_campaign ON ops_activity(campaign_id, created_at DESC);
```

---

## ⚡ Auto-Log Activity Trigger

```sql
CREATE OR REPLACE FUNCTION log_campaign_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes
  IF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
    INSERT INTO ops_activity (
      campaign_id,
      activity_type,
      description,
      old_value,
      new_value,
      user_id
    ) VALUES (
      NEW.id,
      'status_change',
      'Status changed from ' || OLD.status || ' to ' || NEW.status,
      OLD.status,
      NEW.status,
      auth.uid()
    );
  END IF;
  
  -- Log image uploads
  IF TG_OP = 'UPDATE' AND NEW.preview_url IS NOT NULL AND (OLD.preview_url IS NULL OR OLD.preview_url != NEW.preview_url) THEN
    INSERT INTO ops_activity (
      campaign_id,
      activity_type,
      description,
      user_id
    ) VALUES (
      NEW.id,
      'file_uploaded',
      'Campaign preview image uploaded',
      auth.uid()
    );
  END IF;
  
  -- Log creation
  IF TG_OP = 'INSERT' THEN
    INSERT INTO ops_activity (
      campaign_id,
      activity_type,
      description,
      user_id
    ) VALUES (
      NEW.id,
      'created',
      'Campaign created',
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_campaign_changes
  AFTER INSERT OR UPDATE ON ops_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION log_campaign_activity();
```

---

## 🎯 Summary of Requirements

### **MUST HAVE:**
1. ✅ `preview_url` column in `ops_campaigns`
2. ✅ Database validation preventing QA/approval without image
3. ✅ Auto-create portal approval when status = 'client_approval'
4. ✅ Image stored in Supabase Storage
5. ✅ Activity logging for all changes
6. ✅ Link between ops_campaigns and campaign_approvals

### **WORKFLOW ENFORCEMENT:**
- Strategy → Copy → Design: Image OPTIONAL
- Design → QA: Image REQUIRED (blocks if missing)
- QA → Client Approval: Image REQUIRED
- Client Approval → Portal: Auto-creates with image

### **CLIENT PORTAL:**
- Client sees campaign with preview image
- Client approves/rejects based on image
- Approval syncs back to ops_campaigns
- Status updates to "approved"

---

## 🚀 Next Steps for Database Integration

1. Run SQL to create `ops_campaigns` table
2. Run SQL to create `ops_activity` table
3. Add `ops_campaign_id` column to existing `campaign_approvals` table
4. Create Supabase Storage bucket for images
5. Update API routes to handle file uploads
6. Replace mock data with real database queries
7. Test full workflow end-to-end

---

**This document ensures the image requirement is enforced at every level!** 🎯

