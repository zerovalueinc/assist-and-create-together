// Simple test to verify the pipeline is working
const { createClient } = require('@supabase/supabase-js');

// Test the pipeline directly
async function testPipeline() {
  console.log('Testing pipeline...');
  
  // Test URL
  const testUrl = 'https://boldcommerce.com';
  const testUserId = '9ceb63f6-d071-4140-b310-7e4bd3a3596a';
  
  try {
    // Call the edge function
    const response = await fetch('https://hbogcsztrryrepudceww.functions.supabase.co/company-analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // You'll need to add a real token
      },
      body: JSON.stringify({ url: testUrl })
    });
    
    console.log('Response status:', response.status);
    const data = await response.text();
    console.log('Response data:', data);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Check if company_research_steps table exists and has data
async function checkTable() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Check if table exists
    const { data, error } = await supabase
      .from('company_research_steps')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('Table check error:', error);
    } else {
      console.log('Table exists, found records:', data?.length || 0);
      console.log('Sample data:', data);
    }
  } catch (err) {
    console.error('Check failed:', err);
  }
}

// Run tests
checkTable();
// testPipeline(); // Uncomment when you have a token 