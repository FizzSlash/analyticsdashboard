# 🎨 Portal Customization Guide

## 🖼️ **Adding Background Images**

### **Method 1: Client Database (Recommended)**
Add `background_image_url` to your client records in Supabase:

```sql
-- Update client with background image
UPDATE clients 
SET background_image_url = 'https://your-domain.com/hydrus-background.jpg'
WHERE brand_slug = 'hydrus';
```

### **Method 2: Environment Variables (Global)**
Add to your `.env.local` file:

```bash
# Portal Background (applies to all clients if no client-specific image)
NEXT_PUBLIC_PORTAL_BACKGROUND_IMAGE_URL=https://your-domain.com/portal-background.jpg
NEXT_PUBLIC_PORTAL_BACKGROUND_OPACITY=0.15
```

### **Method 3: Agency Database**
Add `background_image_url` to your agency records:

```sql
-- Update agency with background image  
UPDATE agencies
SET background_image_url = 'https://your-domain.com/agency-background.jpg'
WHERE agency_slug = 'retention-harbor';
```

---

## 🎨 **Brand Colors**

Both portals automatically use brand colors from your database:

### **Client Portal:**
```sql
UPDATE clients 
SET 
  primary_color = '#1E40AF',    -- Blue
  secondary_color = '#3B82F6'   -- Lighter blue
WHERE brand_slug = 'hydrus';
```

### **Agency Portal:**
```sql
UPDATE agencies
SET 
  primary_color = '#1E40AF',    -- Blue
  secondary_color = '#3B82F6'   -- Lighter blue  
WHERE agency_slug = 'retention-harbor';
```

---

## 🏷️ **Adding Logos**

### **Client Logo:**
```sql
UPDATE clients 
SET logo_url = 'https://your-domain.com/hydrus-logo.png'
WHERE brand_slug = 'hydrus';
```

### **Agency Logo:**
```sql
UPDATE agencies
SET logo_url = 'https://your-domain.com/retention-harbor-logo.png'
WHERE agency_slug = 'retention-harbor';
```

---

## 🎯 **Portal Layout Differences FIXED:**

### **✅ BEFORE:**
- **Agency Portal:** Full width (`max-w-7xl`)
- **Client Portal:** Constrained width (different container)

### **✅ NOW:**
- **Both Portals:** Same full width (`max-w-7xl mx-auto px-6 py-8`)
- **Both Portals:** Same brand color integration
- **Both Portals:** Same background image support
- **Both Portals:** Same logo positioning

---

## 🖼️ **Recommended Background Images:**

### **🎨 Design Inspiration:**
- **Subtle textures:** Low opacity geometric patterns
- **Brand photography:** Product/team photos at low opacity
- **Gradients:** Complementary to brand colors
- **Abstract:** Professional abstract backgrounds

### **📱 Technical Requirements:**
- **Format:** JPG or PNG
- **Size:** 1920x1080 or larger for best quality
- **Optimization:** Compressed for web (< 500KB)
- **Opacity:** 0.10-0.20 (automatically applied)

---

## 🚀 **Quick Setup:**

1. **Upload image** to your hosting/CDN
2. **Update database** with image URL
3. **Portal automatically** shows background
4. **Adjust opacity** via environment variable if needed

**Your portal will now have full width and beautiful brand-aligned styling!** 🎯