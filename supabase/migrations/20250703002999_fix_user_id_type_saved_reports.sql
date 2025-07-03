-- Change user_id to UUID
ALTER TABLE public.saved_reports
  ALTER COLUMN user_id DROP DEFAULT,
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- Re-add foreign key constraint to users.id
ALTER TABLE public.saved_reports
  ADD CONSTRAINT saved_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; 