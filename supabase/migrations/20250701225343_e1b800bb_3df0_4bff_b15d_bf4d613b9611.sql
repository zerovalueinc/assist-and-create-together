
-- Create users table (profiles) since we'll use Supabase Auth
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ICPs table
CREATE TABLE public.icps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  persona TEXT,
  job_titles JSONB,
  company_size JSONB,
  industries JSONB,
  location_country JSONB,
  technologies JSONB,
  pain_points JSONB,
  valid_use_case TEXT,
  funding TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  icp_id UUID REFERENCES public.icps(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  title TEXT,
  company_name TEXT,
  company_domain TEXT,
  linkedin_url TEXT,
  phone TEXT,
  location TEXT,
  company_size TEXT,
  industry TEXT,
  technologies JSONB,
  status TEXT DEFAULT 'new',
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enriched_leads table
CREATE TABLE public.enriched_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  bio TEXT,
  interests JSONB,
  one_sentence_why_they_care TEXT,
  enrichment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_campaigns table
CREATE TABLE public.email_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  icp_id UUID REFERENCES public.icps(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT,
  template TEXT,
  status TEXT DEFAULT 'draft',
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  replied_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved_reports table
CREATE TABLE public.saved_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  icp_id UUID REFERENCES public.icps(id) ON DELETE CASCADE,
  company_name TEXT,
  url TEXT,
  report_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enriched_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for icps
CREATE POLICY "Users can view their own icps" ON public.icps
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own icps" ON public.icps
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own icps" ON public.icps
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own icps" ON public.icps
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for leads
CREATE POLICY "Users can view their own leads" ON public.leads
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own leads" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own leads" ON public.leads
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own leads" ON public.leads
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for enriched_leads
CREATE POLICY "Users can view their own enriched leads" ON public.enriched_leads
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own enriched leads" ON public.enriched_leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own enriched leads" ON public.enriched_leads
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own enriched leads" ON public.enriched_leads
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for email_campaigns
CREATE POLICY "Users can view their own campaigns" ON public.email_campaigns
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own campaigns" ON public.email_campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own campaigns" ON public.email_campaigns
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own campaigns" ON public.email_campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for saved_reports
CREATE POLICY "Users can view their own reports" ON public.saved_reports
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own reports" ON public.saved_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reports" ON public.saved_reports
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reports" ON public.saved_reports
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
