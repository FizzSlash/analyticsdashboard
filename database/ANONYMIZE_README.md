# 🎭 Anonymize Hydrus for Demo Dashboard

## Quick Start

**Run this ONE script in Supabase SQL Editor:**
```
database/anonymize_hydrus_for_demo.sql
```

Then access: `http://localhost:3000/client/demo`

---

## ✅ What It Does

### **Anonymizes (Removes Identifying Info):**
- ✅ Brand name: "Hydrus" → "Demo Brand"
- ✅ Brand slug: "hydrus" → "demo"  
- ✅ Campaign names: "Aramalight Technology..." → "Demo Campaign #1, #2, #3..."
- ✅ Subject lines: Generic versions (keeps emojis for realism)
- ✅ Email addresses: "hello@demobrand.com"
- ✅ Logo: Removed
- ✅ Colors: Generic indigo/purple

### **Preserves (Keeps All Real Data):**
- ✅ All revenue numbers
- ✅ All open rates, click rates
- ✅ All recipient counts
- ✅ All date information
- ✅ All flow performance metrics
- ✅ Revenue attribution data
- ✅ List growth trends

### **Adds Portal Demo Data:**
- ✅ 6 portal requests (various statuses: urgent, in_progress, submitted, etc.)
- ✅ 4 A/B test results (with winners, insights, learnings)
- ✅ 5 design annotations (resolved + unresolved feedback)

---

## 📊 Demo Dashboard Includes

### **Analytics Mode:**
- ~9 real campaigns with anonymized names
- 5+ flows with real performance data
- Revenue attribution metrics
- List growth data

### **Portal Mode:**
- Campaign Requests tab (6 items)
- A/B Tests tab (4 completed tests)
- Design Feedback (5 annotations)
- Campaign Calendar
- Flow Progress Tracker

---

## 🔄 To Revert (Restore Hydrus)

```sql
-- Restore original Hydrus branding
UPDATE clients 
SET 
  brand_name = 'Hydrus',
  brand_slug = 'hydrus',
  primary_color = '#ffffff',
  secondary_color = '#ffffff',
  logo_url = 'https://jumpshare.com/s/PqLaNJXkDmXB9CSaOzvx'
WHERE brand_slug = 'demo';

-- Note: Campaign/flow names will need manual restoration or re-sync from Klaviyo
```

---

## 🎯 Benefits

✅ **Uses Real Data** - Actual metrics from your database  
✅ **No Complex SQL** - Simple, reliable UPDATE statements  
✅ **Complete Portal** - Includes A/B tests, requests, annotations  
✅ **One Script** - Run once, works immediately  
✅ **Safe** - Can revert anytime

---

**Perfect for demos, testing, and development without exposing sensitive brand information!** 🚀