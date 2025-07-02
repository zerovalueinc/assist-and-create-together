import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const useUserData = () => {
  const { user, profile } = useAuth();
  
  // Helper to capitalize first letter
  const capitalize = (str?: string) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

  const firstName = capitalize(profile?.first_name) || '';
  const lastName = capitalize(profile?.last_name) || '';

  return {
    email: user?.email || '',
    firstName,
    lastName,
    company: profile?.company || '',
    fullName: firstName && lastName
      ? `${firstName} ${lastName}`
      : user?.email || '',
    initials: firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : user?.email?.[0]?.toUpperCase() || 'U'
  };
};

export function useUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) setUser(session?.user || null);
    });
    return () => { mounted = false; };
  }, []);

  return user;
}
