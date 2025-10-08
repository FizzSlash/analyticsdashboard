# 🔍 What to Check in Actual Klaviyo Response

## 📞 **Current API Call (Line 24 in campaigns-bulk/route.ts):**

```typescript
const campaigns = await klaviyo.getCampaigns(undefined, 'email', [
  'campaign-messages',
  'tags'
])
```

**This translates to:**
```
GET /campaigns?filter=equals(messages.channel,'email')&include=campaign-messages,tags&fields[campaign-message]=definition,send_times,created_at,updated_at
```

---

## 🧪 **To See What Klaviyo ACTUALLY Returns:**

**Run campaign sync and check browser console:**

1. Open browser DevTools → Network tab
2. Run campaign sync (🔄 button)
3. Find request to: `/api/klaviyo-proxy/campaigns-bulk`
4. Click on it → Preview/Response tab
5. Look at: `data.included` array
6. Find an object with `type: "campaign-message"`
7. **Check what's in `attributes.definition.content`**

**Specifically check:**
```javascript
attributes: {
  definition: {
    content: {
      subject: "...",          // ← Is this here?
      preview_text: "...",     // ← Is this here?
      body: "...",             // ← Is this here? Or NULL?
      from_email: "...",       // ← Is this here?
      // What else is in here?
    }
  }
}
```

---

## 📋 **I Don't Actually Know What Fields Exist!**

**I need YOU to check the actual response and tell me:**

1. **Is `definition.content.body` present but NULL?**
2. **Is `definition.content.body` not even in the response?**
3. **Is there a `template` object in the included array?**
4. **What DOES exist in `attributes.definition`?**

---

## 🎯 **Once You Tell Me What's in the Response:**

I can tell you exactly what to add to get the HTML!

**The Klaviyo API docs you linked** (developers.klaviyo.com/en/v2025-07-15/reference/api-overview#sparse-fieldsets) would show all available fields, but I can't access external URLs.

**Can you:**
1. Run a campaign sync
2. Check the network response
3. Tell me what you see in `included[0].attributes.definition`?

That will tell us exactly what Klaviyo is returning! 🔍

