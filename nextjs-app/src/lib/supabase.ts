import { createClient } from '@supabase/supabase-js';
import type { Database } from '../integrations/supabase/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://hbogcsztrryrepudceww.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhib2djc3p0cnJ5cmVwdWRjZXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzOTcyMjIsImV4cCI6MjA2Njk3MzIyMn0.3A_GLjBDMO_KK0l_Zb8eON5sRe7m_qZeIOPNsrRoQ_8";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
}); 