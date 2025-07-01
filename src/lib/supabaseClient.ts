import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
console.log('[supabaseClient] Using URL:', supabaseUrl);
console.log('[supabaseClient] Using Anon Key:', supabaseAnonKey?.slice(0, 8) + '...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase; 