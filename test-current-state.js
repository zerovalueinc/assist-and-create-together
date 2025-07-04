// Test current state of the pipeline
const { createClient } = require('@supabase/supabase-js');

async function testCurrentState() {
  console.log('=== Testing Current Pipeline State ===');
  
  // Test 1: Check if edge function is accessible
  console.log('1. Testing edge function accessibility...');
  try {
    const response = await fetch('https://hbogcsztrryrepudceww.functions.supabase.co/company-analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({ url: 'https://test.com' })
    });
    
    console.log('Edge function response status:', response.status);
    const responseText = await response.text();
    console.log('Edge function response:', responseText);
    
    if (response.status === 401) {
      console.log('✅ Edge function is accessible (401 auth required is expected)');
    } else {
      console.log('⚠️ Unexpected response from edge function');
    }
  } catch (error) {
    console.error('❌ Edge function test failed:', error.message);
  }
  
  // Test 2: Check if we can access Supabase with env vars
  console.log('\n2. Testing Supabase access...');
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing Supabase environment variables');
    console.log('SUPABASE_URL:', !!supabaseUrl);
    console.log('SUPABASE_ANON_KEY:', !!supabaseKey);
    return;
  }
  
  console.log('✅ Supabase environment variables found');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test 3: Check if company_research_steps table exists
  console.log('\n3. Testing company_research_steps table...');
  try {
    const { data, error } = await supabase
      .from('company_research_steps')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Table access error:', error.message);
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
    } else {
      console.log('✅ company_research_steps table exists and is accessible');
    }
  } catch (err) {
    console.error('❌ Table test failed:', err.message);
  }
  
  // Test 4: Check if company_analyzer_outputs table exists
  console.log('\n4. Testing company_analyzer_outputs table...');
  try {
    const { data, error } = await supabase
      .from('company_analyzer_outputs')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Table access error:', error.message);
    } else {
      console.log('✅ company_analyzer_outputs table exists and is accessible');
    }
  } catch (err) {
    console.error('❌ Table test failed:', err.message);
  }
  
  // Test 5: Check recent data in company_analyzer_outputs
  console.log('\n5. Checking recent company analysis data...');
  try {
    const { data, error } = await supabase
      .from('company_analyzer_outputs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (error) {
      console.error('❌ Data fetch error:', error.message);
    } else {
      console.log(`✅ Found ${data?.length || 0} recent company analyses`);
      if (data && data.length > 0) {
        console.log('Most recent analysis:', {
          id: data[0].id,
          website: data[0].website,
          created_at: data[0].created_at,
          has_llm_output: !!data[0].llm_output
        });
      }
    }
  } catch (err) {
    console.error('❌ Data fetch failed:', err.message);
  }
}

// Run the test
testCurrentState(); 