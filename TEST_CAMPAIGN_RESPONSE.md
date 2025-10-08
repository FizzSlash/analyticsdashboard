# 🧪 Test What Klaviyo Actually Returns

## Based on Klaviyo API Docs - Available Fields:

### **campaign-message fields (from sparse fieldsets):**

```
AVAILABLE TO REQUEST:
- definition
- definition.channel
- definition.label  
- definition.content
- definition.content.subject
- definition.content.preview_text
- definition.content.from_email
- definition.content.from_label
- definition.content.reply_to_email
- definition.content.cc_email
- definition.content.bcc_email
- definition.content.body
- definition.content.media_url
- definition.content.title
- definition.content.dynamic_image
- definition.render_options
- definition.kv_pairs
- definition.notification_type
- definition.options
- send_times
- created_at
- updated_at
```

---

## 🔍 **Current Request:**

```
fields[campaign-message]=definition,send_times,created_at,updated_at
```

**This requests the ENTIRE `definition` object** which should include:
- ✅ definition.content.body
- ✅ definition.content.subject
- ✅ definition.content.preview_text

---

## ❌ **Why it might be NULL:**

### **1. Template-Based Emails**
If the email uses a saved template, `body` field is empty.
HTML is in the linked `template` resource instead.

**Fix:** Add `include=template` and `fields[template]=html`

### **2. Klaviyo Doesn't Return Body in Definition**
Some Klaviyo setups don't populate body in the definition object.

**Fix:** Use Campaign Render endpoint instead

### **3. Permissions**
API key might not have permission to access email content.

**Fix:** Check API key scopes

---

## 🧪 **Test in Browser Console:**

When you run campaign sync, in browser console look for:
```
📧 FRONTEND: Bulk campaigns response: {...}
```

Expand it and check:
```javascript
data.included[0].attributes.definition.content
// Does this have 'body' property?
// Is it null or does it have HTML?
```

---

## ✅ **Recommended Fix:**

Try adding template include:

```typescript
// lib/klaviyo.ts line 82:
if (includes && includes.length > 0) {
  params.set('include', includes.join(','))
}

// Add template fields:
params.set('fields[template]', 'name,html')
```

Then extract with fallback:
```typescript
email_html: messageData?.template?.html || 
            messageData?.definition?.content?.body || 
            null
```

This covers both template-based AND drag-and-drop emails!

