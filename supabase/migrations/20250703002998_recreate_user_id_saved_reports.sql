-- Drop and re-add user_id as UUID in saved_reports for workspace consistency
ALTER TABLE saved_reports DROP COLUMN IF EXISTS user_id;
ALTER TABLE saved_reports ADD COLUMN user_id UUID REFERENCES profiles(id) ON DELETE CASCADE; 