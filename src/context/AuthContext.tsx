import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase'; // See README for global pattern
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchProfile = async (userId: string, updateCache = true) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (!error && data) {
        setProfile(data);
        if (updateCache) localStorage.setItem('personaops_profile', JSON.stringify(data));
        return data;
      } else if (!data) {
        // Only insert if truly missing
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: userId, email: user?.email || '' });
        if (!insertError) {
          const { data: newProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          setProfile(newProfile);
          if (updateCache && newProfile) localStorage.setItem('personaops_profile', JSON.stringify(newProfile));
          return newProfile;
        } else {
          setProfile(null);
          if (updateCache) localStorage.removeItem('personaops_profile');
          return null;
        }
      } else {
        setProfile(null);
        if (updateCache) localStorage.removeItem('personaops_profile');
        return null;
      }
    } catch (err) {
      setProfile(null);
      if (updateCache) localStorage.removeItem('personaops_profile');
      return null;
    }
  };

  useEffect(() => {
    // Load cached profile instantly
    const cached = localStorage.getItem('personaops_profile');
    if (cached) {
      try {
        setProfile(JSON.parse(cached));
      } catch {}
    }
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          localStorage.removeItem('personaops_profile');
        }
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
