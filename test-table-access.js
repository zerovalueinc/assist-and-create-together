// Test table access and permissions
const { createClient } = require('@supabase/supabase-js');

async function testTableAccess() {
  console.log('Testing company_research_steps table access...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test 1: Check if table exists
    console.log('1. Checking if table exists...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('company_research_steps')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table access error:', tableError);
      console.error('Error details:', JSON.stringify(tableError, null, 2));
    } else {
      console.log('✅ Table exists and is accessible');
    }
    
    // Test 2: Try to insert test data
    console.log('2. Testing insert with anon key...');
    const testPayload = {
      user_id: '9ceb63f6-d071-4140-b310-7e4bd3a3596a',
      company_url: 'https://test.com',
      step_name: 'test_step',
      step_output: { test: 'data' }
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('company_research_steps')
      .insert(testPayload)
      .select();
    
    if (insertError) {
      console.error('❌ Insert error (expected with anon key):', insertError.message);
      console.error('Error code:', insertError.code);
      console.error('Error details:', insertError.details);
      console.error('Error hint:', insertError.hint);
    } else {
      console.log('✅ Insert succeeded (unexpected with anon key):', insertData);
    }
    
    // Test 3: Check existing data
    console.log('3. Checking existing data...');
    const { data: existingData, error: selectError } = await supabase
      .from('company_research_steps')
      .select('*')
      .limit(5);
    
    if (selectError) {
      console.error('❌ Select error:', selectError);
    } else {
      console.log('✅ Found existing records:', existingData?.length || 0);
      if (existingData && existingData.length > 0) {
        console.log('Sample record:', existingData[0]);
      }
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

// Run the test
testTableAccess(); 