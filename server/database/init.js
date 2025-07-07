// Basic database initialization (JavaScript version)
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function initDatabase() {
  try {
    // Initialize database connection
    console.log('Database initialized');
    return supabase;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

module.exports = { supabase, initDatabase }; 