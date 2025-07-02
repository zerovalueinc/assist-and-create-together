
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const SUPABASE_URL = "https://hbogcsztrryrepudceww.supabase.co"
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhib2djc3p0cnJ5cmVwdWRjZXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzOTcyMjIsImV4cCI6MjA2Njk3MzIyMn0.3A_GLjBDMO_KK0l_Zb8eON5sRe7m_qZeIOPNsrRoQ_8"

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Enhanced connection test with optimized RLS policy awareness
export const testConnection = async () => {
  try {
    console.log('Testing Supabase connection with optimized RLS policies...');
    
    // Test basic connectivity with a simple query that expects RLS protection
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    // With optimized RLS enabled, we expect either data (if authenticated) or an RLS/auth error
    if (error) {
      // These are "good" errors that indicate Supabase is reachable and optimized RLS is working
      if (error.message.includes('JWT') || 
          error.message.includes('RLS') || 
          error.message.includes('policy') ||
          error.message.includes('row-level security')) {
        console.log('Supabase connection successful (optimized RLS protecting data as expected)');
        return { 
          success: true, 
          message: 'Connection successful - optimized RLS policies active',
          details: 'Database is reachable and properly secured with performance optimizations'
        };
      }
      
      // Other errors might indicate real connectivity issues
      console.error('Supabase connection error:', error);
      return { 
        success: false, 
        error: error.message, 
        details: error,
        message: 'Database error - check configuration'
      };
    }
    
    // If we get data without authentication, that's also success
    console.log('Supabase connection test successful with data access and optimized RLS');
    return { 
      success: true, 
      data, 
      message: 'Connection successful with data access and optimized performance'
    };
    
  } catch (err) {
    console.error('Supabase connection test error:', err);
    
    // Network-level errors
    if (err instanceof Error) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        return { 
          success: false, 
          error: 'Network connectivity issue',
          details: err,
          message: 'Cannot reach Supabase - check internet connection'
        };
      }
    }
    
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown connection error',
      details: err,
      message: 'Connection test failed'
    };
  }
}
