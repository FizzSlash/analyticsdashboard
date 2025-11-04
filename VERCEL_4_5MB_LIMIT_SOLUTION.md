# 🚨 Vercel 4.5MB Payload Limit - Solution

## The Problem

Vercel has a **hard 4.5MB limit** on request/response body size for all functions (Hobby, Pro, and Enterprise). This limit **cannot be increased**.

> "The maximum payload size for the request body or the response body of a Vercel Function is 4.5 MB."
> — [Vercel Documentation](https://vercel.com/docs/functions/runtimes/node-js#request-body-size)

When you try to upload images larger than 4.5MB through a Vercel API route:
```
413: FUNCTION_PAYLOAD_TOO_LARGE
```

---

## ✅ The Solution: Direct Client-to-Supabase Upload

**Bypass Vercel entirely** by uploading directly from the browser to Supabase Storage.

### Architecture Change

**Before (Doesn't Work for >4.5MB):**
```
Browser → Vercel API Route → Supabase Storage
         ❌ 4.5MB limit here
```

**After (Works for up to 50MB/5GB):**
```
Browser → Supabase Storage
✅ No Vercel limit
```

---

## 📝 Implementation

### 1. Use the Direct Upload Utility

```typescript
import { uploadToSupabase } from '@/lib/direct-upload'

// In your component
const handleFileUpload = async (file: File) => {
  const result = await uploadToSupabase(
    file,
    'campaign-previews',  // bucket name
    'campaigns'           // optional folder
  )
  
  if (result.success) {
    console.log('Uploaded to:', result.url)
    // Save result.url to your database
  } else {
    console.error('Upload failed:', result.error)
  }
}
```

### 2. With Progress Tracking

```typescript
import { uploadWithProgress } from '@/lib/direct-upload'

const handleFileUpload = async (file: File) => {
  const result = await uploadWithProgress(
    file,
    'campaign-previews',
    'campaigns',
    (progress) => {
      console.log(`Upload progress: ${progress}%`)
      setUploadProgress(progress)
    }
  )
}
```

---

## 🔒 Security Setup

### Required: Enable RLS on Supabase Storage

For direct uploads to work, you need to configure Supabase Storage policies:

```sql
-- Allow authenticated users to upload to campaign-previews bucket
CREATE POLICY "Allow authenticated uploads to campaign-previews"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'campaign-previews');

-- Allow public read access (so images display)
CREATE POLICY "Public read access for campaign-previews"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'campaign-previews');

-- Allow users to update their own uploads
CREATE POLICY "Users can update own uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'campaign-previews' AND auth.uid()::text = owner);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'campaign-previews' AND auth.uid()::text = owner);
```

### Create Storage Bucket (if not exists)

In Supabase Dashboard → Storage → Create bucket:
- Name: `campaign-previews`
- Public: ✅ Yes (so images can be displayed)
- File size limit: 50MB (free) or 5GB (pro)
- Allowed MIME types: `image/*`

---

## 📊 Upload Limits

### Supabase Storage Limits
- **Free tier**: 50MB per file
- **Pro tier**: 5GB per file
- **Enterprise**: Custom

### Browser Limits
- Modern browsers can handle multi-GB uploads
- No practical limit for typical campaign images

---

## 🔧 Migration Guide

### Update Existing Upload Components

Find any code using `/api/ops/upload` and replace with direct upload:

**Before:**
```typescript
const formData = new FormData()
formData.append('file', file)
formData.append('bucket', 'campaign-previews')

const response = await fetch('/api/ops/upload', {
  method: 'POST',
  body: formData
})
```

**After:**
```typescript
import { uploadToSupabase } from '@/lib/direct-upload'

const result = await uploadToSupabase(file, 'campaign-previews')
```

---

## ⚡ Benefits

1. ✅ **No 4.5MB limit** - Upload up to 50MB (free) or 5GB (pro)
2. ✅ **Faster uploads** - Direct connection, no Vercel middleman
3. ✅ **Lower costs** - Doesn't count against Vercel function execution time
4. ✅ **Better UX** - Can show real upload progress
5. ✅ **More reliable** - No Vercel timeout issues

---

## 🧪 Testing

After implementing, test with:

```typescript
// Test with small file (< 4.5MB)
const smallFile = new File(['test'], 'small.jpg', { type: 'image/jpeg' })
await uploadToSupabase(smallFile, 'campaign-previews')

// Test with large file (> 4.5MB)
const largeFile = // ... get a 10MB file
await uploadToSupabase(largeFile, 'campaign-previews')
```

Both should work! ✅

---

## 📚 Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Vercel Function Limits](https://vercel.com/docs/functions/runtimes/node-js#request-body-size)
- [Bypassing Vercel 4.5MB Limit](https://vercel.com/guides/how-to-bypass-vercel-body-size-limit-serverless-functions)

---

**Status**: ✅ Implemented in `lib/direct-upload.ts`  
**Last Updated**: November 3, 2025

