
-- Fix 1: Remove public read access to resumes, scope to owner
DROP POLICY IF EXISTS "Anyone can view resumes" ON storage.objects;

CREATE POLICY "Users can view own resumes"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'resumes'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Fix 2: Scope profile picture uploads to owner's folder
DROP POLICY IF EXISTS "Users can upload profile pictures" ON storage.objects;

CREATE POLICY "Users can upload own profile pictures"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-pictures'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
