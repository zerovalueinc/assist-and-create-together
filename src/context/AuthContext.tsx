import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase'; // See README for global pattern
import { useToast } from '@/hooks/use-toast';
import { useCompany } from './CompanyContext';

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

  const fetchProfile = async (userId: string) => {
    let cancelled = false;
    let failureCount = 0;
    const maxFailures = 3;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (!error && data) {
        if (!cancelled) setProfile(data);
        failureCount = 0;
      } else {
        failureCount++;
        if (failureCount >= maxFailures) {
          if (!cancelled) {
            toast({
              title: "Profile Load Failed",
              description: "Could not load your profile after multiple attempts. Please refresh or contact support.",
              variant: "destructive",
            });
          }
          return;
        }
        // Fallback to basic profile from user data if no profile exists
        const basicProfile: Profile = {
          id: userId,
          email: user?.email || '',
          first_name: user?.user_metadata?.first_name,
          last_name: user?.user_metadata?.last_name,
          company: user?.user_metadata?.company,
        };
        if (!cancelled) setProfile(basicProfile);
      }
    } catch (error) {
      failureCount++;
      if (failureCount >= maxFailures) {
        if (!cancelled) {
          toast({
            title: "Profile Load Failed",
            description: "Could not load your profile after multiple attempts. Please refresh or contact support.",
            variant: "destructive",
          });
        }
        return;
      }
      // Fallback to basic profile from user metadata
      if (user) {
        const basicProfile: Profile = {
          id: userId,
          email: user.email || '',
          first_name: user.user_metadata?.first_name,
          last_name: user.user_metadata?.last_name,
          company: user.user_metadata?.company,
        };
        if (!cancelled) setProfile(basicProfile);
      }
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
          // Fetch workspace_id for this user
          const { data: workspace, error: wsError } = await supabase
            .from('workspaces')
            .select('id')
            .eq('owner_id', session.user.id)
            .maybeSingle();
          if (!wsError && workspace?.id) {
            setWorkspaceId(workspace.id);
          } else {
            setWorkspaceId(null);
          }
        } else {
          setProfile(null);
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
        fetchProfile(session.user.id);
        // Fetch workspace_id for this user
        const { data: workspace, error: wsError } = await supabase
          .from('workspaces')
          .select('id')
          .eq('owner_id', session.user.id)
          .maybeSingle();
        if (!wsError && workspace?.id) {
          setWorkspaceId(workspace.id);
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
      // Force reload to clear all cached state/UI
      window.location.reload();
    } catch (error: any) {
      if (error?.name === 'AuthSessionMissingError') {
        toast({
          title: "Signed Out",
          description: "You have been signed out successfully.",
        });
        setSession(null);
        setUser(null);
        setProfile(null);
        window.location.reload();
      } else {
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive",
        });
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
