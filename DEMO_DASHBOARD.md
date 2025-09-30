# 🎨 Demo Dashboard Setup

## Overview

The demo dashboard provides a **fully functional test environment** with realistic mock data for development, testing, and demonstrations - without requiring Klaviyo API access.

**Demo URL:** `http://localhost:3000/client/demo`

---

## 🚀 Quick Setup

### **Step 1: Run the SQL Script**

Open your **Supabase SQL Editor** and run:
```bash
database/create_demo_dashboard.sql
```

This creates:
- ✅ 1 demo client (`brand_slug: demo`)
- ✅ 20 realistic campaigns (last 60 days)
- ✅ 5 flows with 8 weeks of performance data each
- ✅ 60 days of revenue attribution metrics
- ✅ 60 days of list growth data

### **Step 2: Access the Dashboard**

Navigate to:
```
http://localhost:3000/client/demo
```

**No authentication required** - the demo client is public for testing.

---

## 📊 Mock Data Specifications

### **Campaigns (20 total)**
- **Date Range:** Last 60 days
- **Recipients:** 10k - 50k per campaign
- **Open Rate:** 35% - 70%
- **Click Rate:** 1.5% - 6%
- **Revenue:** $500 - $5,500 per campaign
- **Status:** All "Sent" (no drafts in analytics)

### **Flows (5 flows)**
1. Welcome Series
2. Abandoned Cart Recovery (highest revenue)
3. Post-Purchase Follow-up
4. Win-Back Campaign
5. Browse Abandonment

**Weekly Data:** 8 weeks per flow
- **Open Rate:** 45% - 70%
- **Click Rate:** 5% - 15%
- **Revenue:** Varies by flow type (cart recovery highest)

### **Revenue Attribution (60 days)**
- **Email Revenue:** $1k - $4k per day
- **SMS Revenue:** $0 - $500 per day
- **Total Store Revenue:** $2k - $7k per day
- **Email Attribution:** 35% - 65%

### **List Growth (60 days)**
- **Net Growth:** -20 to +40 per day (realistic ups and downs)
- **Email Subscriptions:** 20 - 60 per day
- **Email Unsubscribes:** 10 - 40 per day
- **SMS Growth:** 1 - 7 per day

---

## 🎯 Use Cases

### **1. Development & Testing**
- Test timeframe selector with different date ranges
- Verify chart rendering with various data patterns
- Test outlier detection with realistic data distributions
- Debug UI/UX without affecting production clients

### **2. Demonstrations & Sales**
- Show potential clients the dashboard capabilities
- Present analytics features without exposing real data
- Demo different timeframe views (7/30/60/90/180/365 days)

### **3. UI/UX Iteration**
- Test design changes with consistent data
- Verify responsive layouts across all tabs
- Prototype new features without Klaviyo dependency

---

## 🔧 Customization

### **Update Demo Client Branding**
```sql
UPDATE clients 
SET 
  primary_color = '#your_color',
  secondary_color = '#your_color',
  portal_title = 'Custom Demo Title',
  logo_url = 'https://your-logo-url.com/logo.png'
WHERE brand_slug = 'demo';
```

### **Regenerate Data**
Simply re-run the SQL script to generate fresh random data with different values.

### **Add More Campaigns/Flows**
Edit the SQL script loops to increase data volume:
```sql
-- Change this line:
FOR campaign_num IN 1..20 LOOP  -- Increase to 50, 100, etc.
```

---

## 📋 Data Validation

After running the script, verify data was created:
```sql
SELECT 
  'Campaigns' as type, COUNT(*) as count 
FROM campaign_metrics 
WHERE client_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 'Flow Messages', COUNT(*) 
FROM flow_message_metrics 
WHERE client_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 'Revenue Attribution', COUNT(*) 
FROM revenue_attribution_metrics 
WHERE client_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 'List Growth', COUNT(*) 
FROM list_growth_metrics 
WHERE client_id = '00000000-0000-0000-0000-000000000001';
```

**Expected Results:**
- Campaigns: 20
- Flow Messages: 40 (5 flows × 8 weeks)
- Revenue Attribution: 60
- List Growth: 60

---

## 🎉 Features to Test

With the demo dashboard, you can test:

✅ **Timeframe Selector** - All ranges (7/30/60/90/180/365 days)  
✅ **All 6 Analytics Tabs** - Overview, Campaigns, Flows, Subject Lines, List Growth, Deliverability
✅ **Portal Mode** - Campaign management interface
✅ **Charts & Visualizations** - All chart types with realistic data
✅ **Filtering & Sorting** - Campaign/flow tables
✅ **Responsive Design** - Mobile, tablet, desktop views
✅ **Brand Customization** - Colors, styling, theming

---

## 🛠️ Troubleshooting

**Dashboard shows "Client not found":**
- Verify SQL script ran successfully
- Check client exists: `SELECT * FROM clients WHERE brand_slug = 'demo';`

**No data showing in tabs:**
- Run verification query above to check data counts
- Check browser console for errors
- Verify timeframe selector is set appropriately

**Want to reset demo data:**
- Re-run the entire SQL script (it deletes and recreates everything)

---

## ✨ Pro Tip

**Combine with Hydrus client** for comprehensive testing:
- **Demo** (`/client/demo`) - Controlled mock data
- **Hydrus** (`/client/hydrus`) - Real Klaviyo integration
- **Safari** (`/client/safari`) - Production data

This gives you isolated environments for every testing scenario!

---

**Happy Testing! 🚀**