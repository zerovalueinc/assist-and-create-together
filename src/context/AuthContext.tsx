import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  role: string;
  lastLogin?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, firstName?: string, lastName?: string, company?: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: (credential: string) => Promise<boolean>;
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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing token on app load
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const devMode = localStorage.getItem('devMode');
    
    if (devMode === 'true') {
      // Development mode - bypass auth
      const mockUser: User = {
        id: 1,
        email: 'dev@personaops.com',
        firstName: 'Developer',
        lastName: 'User',
        company: 'PersonaOps',
        role: 'admin'
      };
      setUser(mockUser);
      setToken('dev-token');
      setLoading(false);
      return;
    }
    
    if (savedToken) {
      setToken(savedToken);
      fetchUserProfile(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('authToken');
        setToken(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('authToken');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const bypassAuth = () => {
    const mockUser: User = {
      id: 1,
      email: 'dev@personaops.com',
      firstName: 'Developer',
      lastName: 'User',
      company: 'PersonaOps',
      role: 'admin'
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
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Check if response is HTML (backend not running)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        toast({
          title: "Backend Not Available",
          description: "Using development mode instead",
        });
        bypassAuth();
        return true;
      }

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('authToken', data.token);
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.user.firstName || data.user.email}!`,
        });
        
        return true;
      } else {
        // Handle email verification requirement
        if (data.requiresVerification) {
          toast({
            title: "Email Verification Required",
            description: "Please check your email and click the verification link before logging in.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Failed",
            description: data.error || 'Invalid email or password',
            variant: "destructive",
          });
        }
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Backend Connection Failed",
        description: "Switching to development mode",
      });
      bypassAuth();
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
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName, company }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Registration Successful",
          description: data.message || "Please check your email to verify your account before logging in.",
        });
        
        return true;
      } else {
        toast({
          title: "Registration Failed",
          description: data.error || 'Registration failed',
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      if (token && token !== 'dev-token') {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('devMode');
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    }
  };

  const loginWithGoogle = async (credential: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('authToken', data.token);
        console.log('[Auth] Google login successful, token set:', data.token);
        // Always fetch user profile from backend to sync state
        await fetchUserProfile(data.token);
        toast({
          title: 'Login Successful',
          description: `Welcome, ${data.user.firstName || data.user.email}!`,
        });
        return true;
      } else {
        toast({
          title: 'Google Login Failed',
          description: data.error || 'Google authentication failed',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      toast({
        title: 'Google Login Failed',
        description: 'Network error. Please try again.',
        variant: 'destructive',
      });
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
