-- Enable RLS (if not already enabled)
ALTER TABLE public.company_analyzer_outputs_unrestricted ENABLE ROW LEVEL SECURITY;

-- Remove any open or insecure policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.company_analyzer_outputs_unrestricted;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.company_analyzer_outputs_unrestricted;
DROP POLICY IF EXISTS "Enable update for all users" ON public.company_analyzer_outputs_unrestricted;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.company_analyzer_outputs_unrestricted;
DROP POLICY IF EXISTS "all access" ON public.company_analyzer_outputs_unrestricted;

-- SELECT: Only the owner can read
CREATE POLICY "Users can view their own company analyses"
  ON public.company_analyzer_outputs_unrestricted
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Only the owner can insert
CREATE POLICY "Users can create their own company analyses"
  ON public.company_analyzer_outputs_unrestricted
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Only the owner can update
CREATE POLICY "Users can update their own company analyses"
  ON public.company_analyzer_outputs_unrestricted
  FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE: Only the owner can delete
CREATE POLICY "Users can delete their own company analyses"
  ON public.company_analyzer_outputs_unrestricted
  FOR DELETE
  USING (auth.uid() = user_id); 