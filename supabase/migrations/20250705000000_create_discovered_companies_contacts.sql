-- Create tables for storing discovered companies and contacts from Apollo pipeline
-- This supports the new Intel → GTM → Apollo company/contact search pipeline

-- Create discovered_companies table
CREATE TABLE IF NOT EXISTS public.discovered_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  pipeline_id UUID REFERENCES public.pipeline_states(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  website TEXT,
  domain TEXT,
  industry TEXT,
  company_size TEXT,
  location TEXT,
  description TEXT,
  technologies JSONB,
  apollo_data JSONB, -- Raw Apollo API response
  intel_report_id UUID REFERENCES public.company_analyzer_outputs(id),
  gtm_playbook_id UUID REFERENCES public.gtm_playbooks(id),
  match_score NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'discovered' CHECK (status IN ('discovered', 'contacted', 'qualified', 'converted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create discovered_contacts table
CREATE TABLE IF NOT EXISTS public.discovered_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  pipeline_id UUID REFERENCES public.pipeline_states(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.discovered_companies(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  title TEXT,
  linkedin_url TEXT,
  phone TEXT,
  location TEXT,
  seniority_level TEXT,
  apollo_data JSONB, -- Raw Apollo API response
  intel_report_id UUID REFERENCES public.company_analyzer_outputs(id),
  gtm_playbook_id UUID REFERENCES public.gtm_playbooks(id),
  match_score NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'discovered' CHECK (status IN ('discovered', 'contacted', 'qualified', 'converted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.discovered_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovered_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for discovered_companies
CREATE POLICY "Users can view their own discovered companies" ON public.discovered_companies
  FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own discovered companies" ON public.discovered_companies
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own discovered companies" ON public.discovered_companies
  FOR UPDATE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own discovered companies" ON public.discovered_companies
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- RLS Policies for discovered_contacts
CREATE POLICY "Users can view their own discovered contacts" ON public.discovered_contacts
  FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own discovered contacts" ON public.discovered_contacts
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own discovered contacts" ON public.discovered_contacts
  FOR UPDATE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own discovered contacts" ON public.discovered_contacts
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Create indexes for performance
CREATE INDEX idx_discovered_companies_user_id ON public.discovered_companies(user_id);
CREATE INDEX idx_discovered_companies_pipeline_id ON public.discovered_companies(pipeline_id);
CREATE INDEX idx_discovered_companies_company_name ON public.discovered_companies(company_name);
CREATE INDEX idx_discovered_companies_domain ON public.discovered_companies(domain);
CREATE INDEX idx_discovered_companies_status ON public.discovered_companies(status);

CREATE INDEX idx_discovered_contacts_user_id ON public.discovered_contacts(user_id);
CREATE INDEX idx_discovered_contacts_pipeline_id ON public.discovered_contacts(pipeline_id);
CREATE INDEX idx_discovered_contacts_company_id ON public.discovered_contacts(company_id);
CREATE INDEX idx_discovered_contacts_email ON public.discovered_contacts(email);
CREATE INDEX idx_discovered_contacts_status ON public.discovered_contacts(status);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_discovered_companies_updated_at 
  BEFORE UPDATE ON public.discovered_companies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discovered_contacts_updated_at 
  BEFORE UPDATE ON public.discovered_contacts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 