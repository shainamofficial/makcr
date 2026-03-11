-- Fix 1: Make profile-pictures bucket private
UPDATE storage.buckets SET public = false WHERE id = 'profile-pictures';

-- Fix 2: Restrict chat_message inserts to role='user' from client
DROP POLICY IF EXISTS "Users can insert own chat messages" ON public.chat_message;

CREATE POLICY "Users can insert own user-role chat messages"
ON public.chat_message
FOR INSERT
TO public
WITH CHECK (
  role = 'user'
  AND EXISTS (
    SELECT 1 FROM chat_session cs
    WHERE cs.id = chat_message.chat_session_id
    AND cs.user_id = auth.uid()
  )
);