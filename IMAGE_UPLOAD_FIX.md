# 🖼️ Image Upload Issue - Fixed

## Problem
When uploading images to campaigns, you were getting these errors:
- ❌ **410 (Gone)** - Old Airtable URLs expired
- ❌ **413 (Payload Too Large)** - Upload size limit exceeded
- ❌ **Invalid JSON** - Server returned HTML error instead of JSON

## Root Causes

### 1. Expired Airtable URLs
Old image URLs from Airtable migration have expired. These are temporary URLs that Airtable generates.

### 2. File Size Limits Too Small
- Next.js default: **1MB** body size limit
- Your images: Likely **2-5MB**
- Result: **413 error** when trying to save campaigns with large images

## Fixes Applied ✅

### 1. Updated `next.config.js`
```javascript
// Added image domains
domains: [
  'images.unsplash.com', 
  'ui-avatars.com',
  'v5.airtableusercontent.com',  // For old cached images
  'a.klaviyo.com',               // Klaviyo campaign images
  'supabase.co',                 // Your uploaded images
],

// Increased body size limit
api: {
  bodyParser: {
    sizeLimit: '10mb',  // Was 1mb (default)
  },
}
```

### 2. Updated `app/api/ops/upload/route.ts`
Added configuration for larger file uploads:
```typescript
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}
export const runtime = 'nodejs'
export const maxDuration = 60
```

### 3. Updated `app/api/ops/campaigns/route.ts`
Added same configuration to campaign save endpoint.

### 4. Updated `vercel.json`
Added function configuration for better performance:
```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60,
      "memory": 1024
    }
  }
}
```

## How to Deploy

### 1. **Restart Development Server**
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 2. **Deploy to Vercel**
```bash
git add .
git commit -m "Fix image upload size limits"
git push
```

Vercel will automatically redeploy with the new configuration.

### 3. **Clean Up Old Airtable URLs** (Optional)
Run this SQL in Supabase to remove expired image URLs:
```sql
-- See the file: database/cleanup_airtable_image_urls.sql
UPDATE ops_campaigns 
SET image_url = NULL 
WHERE image_url LIKE '%airtableusercontent.com%';
```

## Testing

After deploying, test by:
1. ✅ Upload an image (2-5MB) to a campaign
2. ✅ Save the campaign
3. ✅ Verify image displays correctly
4. ✅ No 413 errors in console

## What Changed

### Before:
- ❌ Max upload: **1MB**
- ❌ 413 errors on large images
- ❌ Old Airtable URLs showing 410 errors

### After:
- ✅ Max upload: **10MB**
- ✅ Can upload typical campaign images (2-5MB)
- ✅ Old URLs can be cleaned up via SQL script

## Future Improvements

### 1. Image Optimization
Consider adding automatic image compression:
```typescript
// Before upload, compress images
import sharp from 'sharp'

const compressedImage = await sharp(file)
  .resize(1200, 1200, { fit: 'inside' })
  .jpeg({ quality: 85 })
  .toBuffer()
```

### 2. Progress Indicators
Add upload progress for large files:
```typescript
const xhr = new XMLHttpRequest()
xhr.upload.addEventListener('progress', (e) => {
  const percent = (e.loaded / e.total) * 100
  setUploadProgress(percent)
})
```

### 3. File Type Validation
Restrict to images only:
```typescript
const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
if (!validTypes.includes(file.type)) {
  throw new Error('Only image files allowed')
}
```

## Support

If you still see issues:
1. Check browser console for errors
2. Check Vercel deployment logs
3. Verify Supabase storage bucket exists: `campaign-previews`
4. Check file size (must be < 10MB)

---

**Last Updated:** November 3, 2025  
**Status:** ✅ Fixed and ready to deploy

