
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

// Enhanced connection test with better error handling
export const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connectivity first
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single();
    
    if (healthError) {
      console.error('Supabase health check failed:', healthError);
      return { success: false, error: healthError.message, details: healthError };
    }
    
    console.log('Supabase connection test successful');
    return { success: true, data: healthCheck };
  } catch (err) {
    console.error('Supabase connection test error:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown connection error',
      details: err
    };
  }
}
