import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import supabase from '../lib/supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: SupabaseUser | null;
  token: string | null;
  setUser: (user: SupabaseUser | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, firstName?: string, lastName?: string, company?: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: () => Promise<boolean>;
  bypassAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  console.log('[AuthContext] window.location.href:', window.location.href);
  try {
    localStorage.setItem('test', '1');
    localStorage.removeItem('test');
    console.log('[AuthContext] localStorage is available');
  } catch (e) {
    console.warn('[AuthContext] localStorage is NOT available', e);
  }
  try {
    document.cookie = 'testcookie=1';
    if (document.cookie.indexOf('testcookie=1') !== -1) {
      console.log('[AuthContext] cookies are available');
      document.cookie = 'testcookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    } else {
      console.warn('[AuthContext] cookies are NOT available');
    }
  } catch (e) {
    console.warn('[AuthContext] cookies are NOT available', e);
  }

  // Check for existing token on app load
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthContext] onAuthStateChange:', { event, session });
      setUser(session?.user || null);
      setToken(session?.access_token || null);
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('[AuthContext] getSession (after onAuthStateChange):', { session });
      });
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AuthContext] getSession (on mount):', { session });
      setUser(session?.user || null);
      setToken(session?.access_token || null);
      setLoading(false);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const bypassAuth = () => {
    const mockUser: SupabaseUser = {
      id: '1',
      aud: 'authenticated',
      email: 'dev@personaops.com',
      created_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: { firstName: 'Developer', lastName: 'User', company: 'PersonaOps', role: 'admin' },
      identities: [],
      phone: null,
    };
    setUser(mockUser);
    setToken('dev-token');
    localStorage.setItem('devMode', 'true');
    
    toast({
      title: "Development Mode",
      description: "Bypassed authentication for development",
    });
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } else {
      setUser(data.user as any);
      setToken(data.session?.access_token || null);
      localStorage.setItem('authToken', data.session?.access_token || '');
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user?.email}!`,
      });
      return true;
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    company?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } else {
      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account before logging in.",
      });
      return true;
    }
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('devMode');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    setLoading(false);
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      setLoading(false);
      if (error) {
        setError(error.message);
        toast({
          title: 'Google Login Failed',
          description: error.message,
          variant: 'destructive',
        });
        console.error('[AuthContext] Google OAuth error:', error);
        return false;
      } else {
        toast({
          title: 'Login Redirect',
          description: 'You will be redirected to Google to complete login.',
        });
        return true;
      }
    } catch (e) {
      setLoading(false);
      setError('Unknown error during Google OAuth');
      toast({
        title: 'Google Login Failed',
        description: 'Unknown error during Google OAuth',
        variant: 'destructive',
      });
      console.error('[AuthContext] Google OAuth exception:', e);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    setUser,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user && !!token,
    loginWithGoogle,
    bypassAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
