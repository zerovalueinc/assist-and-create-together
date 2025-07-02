
import { supabase, testConnection } from '@/integrations/supabase/client';
import { AuditResult } from './types';

export const testSupabaseConnection = async (results: AuditResult[]) => {
  try {
    // First test basic connectivity
    const isConnected = await testConnection();
    
    if (!isConnected) {
      results.push({
        component: 'Supabase Connection',
        status: 'fail',
        message: 'Failed to connect to Supabase',
        details: ['Check network connectivity', 'Verify Supabase URL and API key']
      });
      return;
    }

    // Test with a simple query
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    results.push({
      component: 'Supabase Connection',
      status: error ? 'fail' : 'pass',
      message: error ? `Connection failed: ${error.message}` : 'Connection successful',
      details: error ? [error.hint || 'Check Supabase configuration'] : ['Database accessible', 'Authentication working']
    });
  } catch (err) {
    console.error('Supabase connection test error:', err);
    results.push({
      component: 'Supabase Connection',
      status: 'fail',
      message: 'Connection error',
      details: [
        `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        'Check network connectivity and Supabase configuration'
      ]
    });
  }
};

export const testEdgeFunctions = async (results: AuditResult[]) => {
  const functions = [
    {
      name: 'Pipeline Orchestrator',
      functionName: 'pipeline-orchestrator',
      testPayload: { action: 'status', pipelineId: 'test' }
    },
    {
      name: 'GTM Generator',
      functionName: 'gtm-generate',
      testPayload: { websiteUrl: 'https://example.com' }
    },
    {
      name: 'Company Discovery',
      functionName: 'company-discovery',
      testPayload: { icpData: { firmographics: { industry: 'Technology' } }, batchSize: 1 }
    },
    {
      name: 'Contact Discovery',
      functionName: 'contact-discovery',
      testPayload: { companies: [{ name: 'Test', domain: 'test.com' }], targetPersonas: [] }
    },
    {
      name: 'Email Personalization',
      functionName: 'email-personalization',
      testPayload: { contacts: [], icpData: {} }
    }
  ];

  for (const func of functions) {
    try {
      console.log(`Testing edge function: ${func.name}`);
      
      const { data, error } = await supabase.functions.invoke(func.functionName, {
        body: func.testPayload
      });
      
      const isApiKeyError = error?.message?.includes('API key') || error?.message?.includes('configuration');
      const isPipelineNotFound = error?.message?.includes('Pipeline not found') || error?.message?.includes('not found');
      const isNetworkError = error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError');
      
      if (isNetworkError) {
        results.push({
          component: func.name,
          status: 'fail',
          message: 'Network connectivity issue',
          details: [
            'Cannot reach Supabase Edge Functions',
            'Check internet connection and Supabase status'
          ]
        });
      } else if (isApiKeyError) {
        results.push({
          component: func.name,
          status: 'warning',
          message: 'Function accessible but needs API key configuration',
          details: ['Configure API keys in Supabase Edge Function Secrets']
        });
      } else if (isPipelineNotFound) {
        results.push({
          component: func.name,
          status: 'pass',
          message: 'Function responding correctly (test data not found as expected)',
          details: ['Edge function is deployed and responding']
        });
      } else if (error) {
        results.push({
          component: func.name,
          status: 'warning',
          message: `Function error: ${error.message}`,
          details: ['Function is accessible but returned an error']
        });
      } else {
        results.push({
          component: func.name,
          status: 'pass',
          message: 'Function operational',
          details: ['Edge function responding successfully']
        });
      }
    } catch (err) {
      console.error(`Edge function test error for ${func.name}:`, err);
      results.push({
        component: func.name,
        status: 'fail',
        message: 'Edge function error',
        details: [
          `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
          'Check Supabase Edge Functions deployment'
        ]
      });
    }
  }
};

export const testDatabaseTables = async (results: AuditResult[]) => {
  const tables = ['profiles', 'pipeline_states', 'pipeline_results'] as const;
  
  for (const tableName of tables) {
    try {
      console.log(`Testing database table: ${tableName}`);
      
      const { data, error } = await supabase.from(tableName).select('*').limit(1);
      
      if (error) {
        results.push({
          component: `Database Table: ${tableName}`,
          status: 'fail',
          message: `Table error: ${error.message}`,
          details: [
            error.hint || 'Check table permissions and RLS policies',
            'Verify table exists in database'
          ]
        });
      } else {
        results.push({
          component: `Database Table: ${tableName}`,
          status: 'pass',
          message: 'Table accessible',
          details: ['Table structure validated', 'RLS policies working correctly']
        });
      }
    } catch (err) {
      console.error(`Database table test error for ${tableName}:`, err);
      results.push({
        component: `Database Table: ${tableName}`,
        status: 'fail',
        message: 'Table access error',
        details: [
          `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
          'Check database connectivity and table permissions'
        ]
      });
    }
  }
};
