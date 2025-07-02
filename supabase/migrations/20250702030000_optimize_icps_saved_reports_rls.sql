-- Optimize RLS policies for icps and saved_reports tables to avoid performance warnings
-- Replace auth.uid() with (select auth.uid()) for better performance

-- Drop existing policies for icps
drop policy if exists "Users can view their own icps" on public.icps;
drop policy if exists "Users can create their own icps" on public.icps;
drop policy if exists "Users can update their own icps" on public.icps;
drop policy if exists "Users can delete their own icps" on public.icps;

-- Recreate optimized policies for icps
create policy "Users can view their own icps" on public.icps
  for select using ((select auth.uid())::text = user_id::text);
create policy "Users can create their own icps" on public.icps
  for insert with check ((select auth.uid())::text = user_id::text);
create policy "Users can update their own icps" on public.icps
  for update using ((select auth.uid())::text = user_id::text);
create policy "Users can delete their own icps" on public.icps
  for delete using ((select auth.uid())::text = user_id::text);

-- Drop existing policies for saved_reports
drop policy if exists "Users can view their own reports" on public.saved_reports;
drop policy if exists "Users can create their own reports" on public.saved_reports;
drop policy if exists "Users can update their own reports" on public.saved_reports;
drop policy if exists "Users can delete their own reports" on public.saved_reports;

-- Recreate optimized policies for saved_reports
create policy "Users can view their own reports" on public.saved_reports
  for select using ((select auth.uid())::text = user_id::text);
create policy "Users can create their own reports" on public.saved_reports
  for insert with check ((select auth.uid())::text = user_id::text);
create policy "Users can update their own reports" on public.saved_reports
  for update using ((select auth.uid())::text = user_id::text);
create policy "Users can delete their own reports" on public.saved_reports
  for delete using ((select auth.uid())::text = user_id::text); 