# 📅 November Airtable Migration - Ready to Execute!

## 🎯 What Will Be Migrated

**Source:** Airtable November 2024 campaigns and flows  
**Destination:** Ops Dashboard (`ops_campaigns` and `ops_flows` tables)  
**Clients:** Only clients that exist in your database

---

## 📊 Current Clients in Database

1. Brilliant Scents
2. Nyan
3. Hydrus
4. Ramrods Archery
5. UK Soccer Shop
6. Vincero
7. NY & Company
8. Montis
9. JustFloow
10. TriRig
11. Jonathan Adler
12. Safari Pedals

**Any Airtable campaigns for these clients will be imported!**

---

## 🚀 How to Execute Migration

### **Step 1: Preview (See what will be imported)**

Open your browser and go to:
```
https://analytics.retentionharbor.com/api/migrate-november
```

This will show you the API info.

### **Step 2: Execute Migration**

Open browser console (F12) and run:

```javascript
fetch('https://analytics.retentionharbor.com/api/migrate-november', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ preview: true })
})
.then(r => r.json())
.then(data => {
  console.log('PREVIEW:', data);
  console.log('Campaigns:', data.summary.campaigns_count);
  console.log('Flows:', data.summary.flows_count);
  console.table(data.summary.campaigns_preview);
  console.table(data.summary.flows_preview);
})
```

### **Step 3: If Preview Looks Good, Execute Import**

```javascript
fetch('https://analytics.retentionharbor.com/api/migrate-november', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ preview: false })
})
.then(r => r.json())
.then(data => {
  console.log('MIGRATION RESULT:', data);
  if (data.success) {
    console.log('✅ SUCCESS!');
    console.log(`Imported ${data.summary.campaigns_count} campaigns`);
    console.log(`Imported ${data.summary.flows_count} flows`);
  }
})
```

---

## 📋 What Gets Imported

### **For Each Campaign:**
- ✅ Campaign name (from "Tasks" field)
- ✅ Client (mapped to UUID)
- ✅ Send date (from "Send Date")
- ✅ Status (from "Stage")
- ✅ Assignee (from "Assignee")
- ✅ Preview image URL (first image from "File" array)
- ✅ Copy link (from "Copy Link")
- ✅ Subject line (from "Offer")
- ✅ Notes (from "Notes")
- ✅ Campaign type (email/sms)
- ✅ Airtable record ID (for reference)

### **For Each Flow:**
- ✅ Flow name (from "Tasks")
- ✅ Client (mapped to UUID)
- ✅ Flow type (extracted from notes: welcome, abandoned_cart, etc.)
- ✅ Trigger type (extracted from notes)
- ✅ Number of emails (extracted from notes)
- ✅ Status (from "Stage")
- ✅ Assignee
- ✅ Copy link
- ✅ Description
- ✅ Go live date
- ✅ Airtable record ID

---

## ⚠️ Important Notes

1. **Preview first!** Always run with `preview: true` to see what will be imported
2. **Duplicates:** If you run twice, it may create duplicates (no upsert logic yet)
3. **Images:** Uses Airtable URLs (they work fine, don't expire with paid plan)
4. **Clients:** Only imports if client exists in your database
5. **November only:** Only campaigns/flows with November 2024 send dates

---

## 🎯 After Migration

Once imported, you'll see:
1. Campaigns in Ops Dashboard → Calendar/Pipeline
2. Flows in Ops Dashboard → Flows tab
3. All data synced to Portal automatically
4. Clients can review and approve in Portal
5. Preview images and copy links will work

---

## 📊 Expected Results

Based on your Airtable data, you should see:
- **~10-20 November campaigns** imported
- **~5-10 November flows** imported
- All mapped to correct clients
- All statuses preserved
- All assignees preserved
- All copy links working

---

## 🚀 Ready to Run!

1. Open browser
2. Go to your dashboard
3. Open browser console (F12)
4. Copy/paste the preview code above
5. Review the data
6. If good, run the execute code
7. ✅ Done!

**The migration endpoint is now live!** 🎉

