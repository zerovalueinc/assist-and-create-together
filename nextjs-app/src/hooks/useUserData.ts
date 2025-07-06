'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useUserData() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUser(data.session.user);
        console.debug('[Frontend] Supabase user.id:', data.session.user.id);
      } else {
        console.warn('[Frontend] No user session found', error);
        setUser(null);
      }
      setLoading(false);
    };
    getSession();
  }, []);

  return { user, loading };
}
