# ✨ Where to Find the Sparkles Button

## 📍 **Location: Agency Admin Dashboard → Clients Tab**

---

## 🔍 **Step-by-Step:**

1. **Go to your Agency Admin Dashboard:**
   ```
   http://localhost:3000/agency/retention-harbor/admin
   ```

2. **Click the "Clients" tab** (second tab in navigation)

3. **Look at any client card** - You'll see a row of action buttons:

```
┌─────────────────────────────────────────────────────────────┐
│  Hydrus                                    [Active] [AI Audit] │
│  /hydrus                                                       │
│  Last sync: Oct 6, 2025                                       │
│                                                                │
│  [Purple color swatches shown here]                           │
│                                                                │
│  Action Buttons:                                              │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                         │
│  │ ✨ │ │ 🔄 │ │ 🔗 │ │ ✏️ │ │ 🗑️│                         │
│  └────┘ └────┘ └────┘ └────┘ └────┘                         │
│  Audit  Sync   View   Edit  Delete                           │
│  Toggle                                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 **Visual States:**

### **AI Audit ENABLED (Default):**
```
✨ Purple sparkles on purple background
   Tooltip: "AI Audit Enabled - Click to disable"
```

### **AI Audit DISABLED:**
```
✨ Gray sparkles on white background  
   Tooltip: "AI Audit Disabled - Click to enable"
```

---

## ✅ **How to Enable:**

1. Find client card in Clients tab
2. Look for **first button** (left of sync button)
3. Click the ✨ Sparkles icon
4. It turns **purple** = Enabled
5. Success message appears: "AI Audit enabled for [Client Name]"

---

## 🧪 **How to Test:**

1. **Enable audit** - Click gray sparkles → turns purple
2. **Go to client dashboard** - Open `/client/hydrus` in new tab
3. **Look for tabs** - Should see 7 tabs now:
   ```
   Overview | Campaigns | Flows | Subject Lines | 
   List Growth | Deliverability | AI Audit ⭐ (NEW!)
   ```
4. **Click "AI Audit" tab**
5. **Click "Run Audit" button**
6. **Wait 10-15 seconds**
7. **See AI insights!**

---

## 🎯 **Button Order (Left to Right):**

```
1. ✨ Sparkles = AI Audit toggle
2. 🔄 Sync = Sync all data
3. 🔗 External link = View dashboard
4. ✏️ Edit = Edit client details  
5. 🗑️ Trash = Delete client
```

---

## 📸 **What You Should See:**

**When AI Audit is ENABLED:**
- Purple ✨ button in client card
- Purple "AI Audit" badge next to client name
- "AI Audit" tab appears in client dashboard

**When AI Audit is DISABLED:**
- Gray ✨ button in client card
- No badge on client name
- No "AI Audit" tab in dashboard

---

## 🐛 **Troubleshooting:**

**Can't see Sparkles button?**
- Refresh your browser (Ctrl+R or Cmd+R)
- Check you're on the "Clients" tab (not Overview/Users/Settings)
- Look at the button row on each client card

**Sparkles is there but gray?**
- That's correct! Gray = disabled
- Click it to turn purple and enable

**Clicked but nothing happened?**
- Check browser console for errors
- Make sure database migration ran successfully
- Refresh the page

---

That's it! The ✨ Sparkles button is the **first button** on each client card in the **Clients tab**! 🚀

