-- Fix Supabase Storage Permissions for campaign-previews bucket
-- This allows all authenticated users (designers, copywriters, PMs) to upload images

-- 1. DROP existing policies (if any) to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to upload campaign images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for campaign previews" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete" ON storage.objects;

-- 2. CREATE new policies with proper permissions

-- Allow ALL authenticated users to INSERT (upload) to campaign-previews
CREATE POLICY "Allow authenticated users to upload campaign images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'campaign-previews');

-- Allow public SELECT (read) so images display for everyone
CREATE POLICY "Public read access for campaign previews"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'campaign-previews');

-- Allow authenticated users to UPDATE their uploads
CREATE POLICY "Allow authenticated users to update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'campaign-previews');

-- Allow authenticated users to DELETE uploads
CREATE POLICY "Allow authenticated users to delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'campaign-previews');

-- Verify policies were created
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%campaign%';

