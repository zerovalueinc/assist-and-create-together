
-- Enable RLS on tables that don't have it
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Create RLS policies for icps table
CREATE POLICY "Users can view their own icps" ON public.icps
  FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can create their own icps" ON public.icps
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own icps" ON public.icps
  FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own icps" ON public.icps
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create RLS policies for saved_reports table
CREATE POLICY "Users can view their own reports" ON public.saved_reports
  FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can create their own reports" ON public.saved_reports
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own reports" ON public.saved_reports
  FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own reports" ON public.saved_reports
  FOR DELETE USING (auth.uid()::text = user_id::text);
