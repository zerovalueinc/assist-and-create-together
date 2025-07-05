import { useUser } from '@supabase/auth-helpers-react';

export function useUserData() {
  const user = useUser();
  return {
    email: user?.email || '',
    firstName: user?.user_metadata?.firstName || '',
    lastName: user?.user_metadata?.lastName || '',
    company: user?.user_metadata?.company || '',
    initials: `${user?.user_metadata?.firstName?.[0] || ''}${user?.user_metadata?.lastName?.[0] || ''}`.toUpperCase(),
    user,
  };
}
