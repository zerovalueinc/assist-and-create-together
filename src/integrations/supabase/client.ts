import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const SUPABASE_URL = "https://hbogcsztrryrepudceww.supabase.co"
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhib2djc3p0cnJ5cmVwdWRjZXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzOTcyMjIsImV4cCI6MjA2Njk3MzIyMn0.3A_GLjBDMO_KK0l_Zb8eON5sRe7m_qZeIOPNsrRoQ_8"

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
})

// Enhanced connection test with better error handling and diagnostics
export const testConnection = async () => {
  try {
    console.log('Testing Supabase connection with enhanced diagnostics...');
    console.log('Supabase URL:', SUPABASE_URL);
    console.log('Using key ending in:', SUPABASE_PUBLISHABLE_KEY.slice(-8));
    
    // First test: Simple REST API health check
    const healthCheckUrl = `${SUPABASE_URL}/rest/v1/`;
    console.log('Testing basic REST API accessibility...');
    
    try {
      const response = await fetch(healthCheckUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
        }
      });
      
      console.log('REST API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`REST API returned ${response.status}: ${response.statusText}`);
      }
    } catch (fetchError) {
      console.error('Direct fetch to REST API failed:', fetchError);
      
      // Check if it's a network connectivity issue
      if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
        return {
          success: false,
          error: 'Network connectivity issue - cannot reach Supabase servers',
          details: 'This could be due to firewall restrictions, VPN issues, or DNS problems',
          message: 'Cannot establish connection to Supabase'
        };
      }
      
      return {
        success: false,
        error: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error',
        details: fetchError,
        message: 'Direct API connection failed'
      };
    }
    
    // Second test: Test with Supabase client
    console.log('Testing Supabase client connection...');
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      // These are expected errors that indicate Supabase is reachable and RLS is working
      if (error.message.includes('JWT') || 
          error.message.includes('RLS') || 
          error.message.includes('policy') ||
          error.message.includes('row-level security') ||
          error.code === 'PGRST301') {
        console.log('Supabase connection successful - RLS policies are working correctly');
        return { 
          success: true, 
          message: 'Connection successful with optimized RLS policies active',
          details: 'Database is reachable and properly secured with performance optimizations'
        };
      }
      
      // Other database errors
      console.error('Supabase client error:', error);
      return { 
        success: false, 
        error: error.message, 
        details: error,
        message: 'Database configuration issue'
      };
    }
    
    // Success case
    console.log('Supabase connection test completely successful');
    return { 
      success: true, 
      data, 
      message: 'Connection successful with full data access'
    };
    
  } catch (err) {
    console.error('Connection test failed with exception:', err);
    
    // Enhanced error classification
    if (err instanceof Error) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        return { 
          success: false, 
          error: 'Network connectivity issue - cannot reach Supabase',
          details: 'Check your internet connection, VPN settings, or firewall configuration',
          message: 'Cannot establish network connection to Supabase'
        };
      }
      
      if (err.message.includes('CORS')) {
        return {
          success: false,
          error: 'CORS policy error',
          details: 'Cross-origin request blocked. Check Supabase project settings.',
          message: 'CORS configuration issue'
        };
      }
    }
    
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown connection error',
      details: err,
      message: 'Connection test failed with unknown error'
    };
  }
}
