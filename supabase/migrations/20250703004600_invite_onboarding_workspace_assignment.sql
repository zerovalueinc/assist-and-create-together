-- Update handle_new_user to support invite onboarding
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  ws_name text;
  ws_id uuid;
  invite_id uuid;
BEGIN
  -- Check for pending invitation for this email
  SELECT id, workspace_id INTO invite_id, ws_id FROM public.invitations WHERE email = NEW.email AND status = 'pending' LIMIT 1;

  IF ws_id IS NOT NULL THEN
    -- Use workspace from invitation
    INSERT INTO public.profiles (id, email, first_name, last_name, workspace_id)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data ->> 'first_name',
      NEW.raw_user_meta_data ->> 'last_name',
      ws_id
    );
    -- Mark invitation as accepted
    UPDATE public.invitations SET status = 'accepted' WHERE id = invite_id;
  ELSE
    -- No invite: create new workspace as before
    ws_name := COALESCE(
      NEW.raw_user_meta_data ->> 'company',
      NEW.raw_user_meta_data ->> 'name',
      NEW.email,
      'My Workspace'
    );
    INSERT INTO public.workspaces (name, owner_id)
    VALUES (ws_name, NEW.id)
    RETURNING id INTO ws_id;
    INSERT INTO public.profiles (id, email, first_name, last_name, workspace_id)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data ->> 'first_name',
      NEW.raw_user_meta_data ->> 'last_name',
      ws_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 