-- Update icps table to match frontend expectations
-- The frontend expects: companyUrl, companyName, icpData (JSON with GTMICPSchema structure)

-- Drop the old icps table and recreate with the correct schema
DROP TABLE IF EXISTS public.icps CASCADE;

-- Create the new icps table with the correct structure
CREATE TABLE public.icps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- No foreign key constraint to profiles
  companyUrl TEXT NOT NULL,
  companyName TEXT NOT NULL,
  icpData JSONB NOT NULL, -- This will contain the GTMICPSchema structure
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.icps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for icps
CREATE POLICY "Users can view their own icps" ON public.icps
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own icps" ON public.icps
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own icps" ON public.icps
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own icps" ON public.icps
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_icps_user_id ON public.icps(user_id);
CREATE INDEX idx_icps_company_url ON public.icps(companyUrl);
CREATE INDEX idx_icps_created_at ON public.icps(created_at); 