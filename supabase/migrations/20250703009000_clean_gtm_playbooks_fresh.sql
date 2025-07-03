-- Nuke any old GTM playbooks tables
DROP TABLE IF EXISTS public.gtm_playbooks CASCADE;

-- Create a simple, secure table for GTM Playbook results
CREATE TABLE public.gtm_playbooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  companyName TEXT NOT NULL,
  website TEXT NOT NULL,
  playbook JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.gtm_playbooks ENABLE ROW LEVEL SECURITY;

-- Simple, secure policies - only owner can access their own data
CREATE POLICY "owner_access" ON public.gtm_playbooks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_gtm_playbooks_user_website ON public.gtm_playbooks(user_id, website); 