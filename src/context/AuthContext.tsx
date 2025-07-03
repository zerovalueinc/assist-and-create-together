import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase'; // See README for global pattern
import { useToast } from '@/hooks/use-toast';
import { useCompany } from './CompanyContext';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  workspace_id?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string, company?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { setWorkspaceId } = useCompany();
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
        // Set workspaceId from cached profile
        const cachedProfile = JSON.parse(cached);
        if (cachedProfile?.workspace_id) setWorkspaceId(cachedProfile.workspace_id);
      } catch {}
    }
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          const prof = await fetchProfile(session.user.id);
          // Set workspaceId from profile
          if (prof?.workspace_id) {
            setWorkspaceId(prof.workspace_id);
          } else {
            setWorkspaceId(null);
          }
        } else {
          setProfile(null);
          localStorage.removeItem('personaops_profile');
          setWorkspaceId(null);
        }
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const prof = await fetchProfile(session.user.id);
        // Set workspaceId from profile
        if (prof?.workspace_id) {
          setWorkspaceId(prof.workspace_id);
        } else {
          setWorkspaceId(null);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string, company?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
            company: company
          }
        }
      });

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Account Created",
        description: "Please check your email to verify your account.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Welcome Back!",
        description: "You have successfully signed in.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        if (error.name === 'AuthSessionMissingError') {
          toast({
            title: "Signed Out",
            description: "You have been signed out successfully.",
          });
        } else {
          toast({
            title: "Sign Out Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Signed Out",
          description: "You have been signed out successfully.",
        });
      }
      setSession(null);
      setUser(null);
      setProfile(null);
      setWorkspaceId(null);
      navigate('/auth', { replace: true });
    } catch (error: any) {
      if (error?.name === 'AuthSessionMissingError') {
        toast({
          title: "Signed Out",
          description: "You have been signed out successfully.",
        });
        setSession(null);
        setUser(null);
        setProfile(null);
        setWorkspaceId(null);
        navigate('/auth', { replace: true });
      } else {
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive",
        });
        setSession(null);
        setUser(null);
        setProfile(null);
        setWorkspaceId(null);
        navigate('/auth', { replace: true });
      }
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user && !!session,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
