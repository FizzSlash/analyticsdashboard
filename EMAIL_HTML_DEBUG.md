# 🔍 Email HTML Extraction - Debug Guide

## 📞 **Current API Call:**

```http
GET https://a.klaviyo.com/api/campaigns
?filter=equals(messages.channel,'email')
&include=campaign-messages,tags
&fields[campaign]=name,status,send_time,audiences,tracking_options,send_strategy,created_at,updated_at,scheduled_at,archived
&fields[campaign-message]=definition,send_times,created_at,updated_at

Authorization: Klaviyo-API-Key pk_xxx
```

---

## ❌ **Why `email_html` is Blank:**

### **Possible Issue 1: Template vs Drag-and-Drop**

**If email uses a SAVED TEMPLATE:**
- `definition.content.body` = NULL ❌
- HTML is in the `template` object instead
- Need to: `include=campaign-messages,template`

**If email uses DRAG-AND-DROP:**
- `definition.content.body` = Full HTML ✅
- Should work with current call

---

### **Possible Issue 2: HTML vs Plain Text**

**If email is plain text only:**
- `definition.content.body` = Plain text, not HTML

---

### **Possible Issue 3: Field Not Included**

**`definition` might not include `content.body`** by default.

Need to add:
```
fields[campaign-message]=definition.content.body,definition.content.subject
```

---

## ✅ **Solutions to Try:**

### **Solution 1: Add Template Include**
```typescript
// In lib/klaviyo.ts getCampaigns():
const campaigns = await klaviyo.getCampaigns(undefined, 'email', [
  'campaign-messages',
  'template',  // ← ADD THIS
  'tags'
])

// Also add template fields:
params.set('fields[template]', 'name,html')
```

**Then extract:**
```typescript
email_html: messageData?.template?.html || messageData?.definition?.content?.body || null
```

---

### **Solution 2: Request Specific Body Field**
```typescript
// Change fields parameter:
params.set('fields[campaign-message]', 
  'definition.content.body,definition.content.subject,definition.content.preview_text,send_times'
)
```

---

### **Solution 3: Use Campaign Render API**

**Separate API call to get rendered HTML:**
```http
GET https://a.klaviyo.com/api/campaigns/{campaign_id}/campaign-messages/{message_id}
?additional-fields[campaign-message]=rendered_html
```

This gives you the FINAL rendered HTML with all personalization/variables filled in.

---

## 🧪 **Quick Test:**

**Check Klaviyo response in browser console:**
1. Run campaign sync
2. Look for the campaigns-bulk API call
3. Check response → data → included
4. Find a campaign-message object
5. Look at: `included[0].attributes.definition.content`
6. **Is `body` present or null?**

---

## 💡 **My Bet:**

**Your emails probably use SAVED TEMPLATES**, so:
- `definition.content.body` = null
- HTML is in the linked `template` object
- Need to add `include=template` to get it

**Want me to:**
1. Add template include to the API call?
2. Extract HTML from template.html?
3. Add both as fallback (template OR body)?

