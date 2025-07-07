-- Drop all RLS policies on saved_reports for development
DROP POLICY IF EXISTS "Users can view their own reports" ON public.saved_reports;
DROP POLICY IF EXISTS "Users can create their own reports" ON public.saved_reports;
DROP POLICY IF EXISTS "Users can update their own reports" ON public.saved_reports;
DROP POLICY IF EXISTS "Users can delete their own reports" ON public.saved_reports;

-- Enable RLS but allow all for development
ALTER TABLE public.saved_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for dev" ON public.saved_reports FOR ALL USING (true) WITH CHECK (true); 