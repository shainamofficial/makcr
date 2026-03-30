-- Fix 1: Replace blanket public read on profile-pictures with owner-scoped policy
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;

CREATE POLICY "Users can view own profile pictures"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'profile-pictures'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Fix 2: Replace unscoped resume upload policy with owner-scoped one
DROP POLICY IF EXISTS "Users can upload resumes" ON storage.objects;

CREATE POLICY "Users can upload own resumes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resumes'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);