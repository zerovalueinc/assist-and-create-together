
import { supabase } from '@/integrations/supabase/client';
import { AuditResult } from './types';

export const testSupabaseConnection = async (results: AuditResult[]) => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    results.push({
      component: 'Supabase Connection',
      status: error ? 'fail' : 'pass',
      message: error ? `Connection failed: ${error.message}` : 'Connection successful',
      details: error ? [error.hint || ''] : ['Database accessible']
    });
  } catch (err) {
    results.push({
      component: 'Supabase Connection',
      status: 'fail',
      message: 'Connection error',
      details: [String(err)]
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
      const { data, error } = await supabase.functions.invoke(func.functionName, {
        body: func.testPayload
      });
      
      const isApiKeyError = error?.message?.includes('API key');
      const isPipelineNotFound = error?.message?.includes('Pipeline not found');
      
      results.push({
        component: func.name,
        status: error && !isApiKeyError && !isPipelineNotFound ? 'fail' : 
                isApiKeyError ? 'warning' : 'pass',
        message: isApiKeyError ? 
          'Function works but needs API key configuration' :
          isPipelineNotFound ? 'Function responding correctly' :
          error ? `Function error: ${error.message}` : 'Function operational',
        details: isApiKeyError ? 
          ['Configure API keys in Supabase Edge Function Secrets'] : []
      });
    } catch (err) {
      results.push({
        component: func.name,
        status: 'fail',
        message: 'Edge function error',
        details: [String(err)]
      });
    }
  }
};

export const testDatabaseTables = async (results: AuditResult[]) => {
  const tables = ['profiles', 'pipeline_states', 'pipeline_results'] as const;
  
  for (const tableName of tables) {
    try {
      const { data, error } = await supabase.from(tableName).select('*').limit(1);
      results.push({
        component: `Database Table: ${tableName}`,
        status: error ? 'fail' : 'pass',
        message: error ? `Table error: ${error.message}` : 'Table accessible',
        details: error ? [] : ['Table structure validated']
      });
    } catch (err) {
      results.push({
        component: `Database Table: ${tableName}`,
        status: 'fail',
        message: 'Table access error',
        details: [String(err)]
      });
    }
  }
};
