import { supabase } from '@/lib/supabaseClient';
import { AuditResult } from '../types';

interface EdgeFunction {
  name: string;
  functionName: string;
  testPayload: any;
}

const EDGE_FUNCTIONS: EdgeFunction[] = [
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

const classifyEdgeFunctionError = (errorMessage: string) => {
  const isNetworkError = errorMessage.includes('Failed to fetch') || 
                        errorMessage.includes('NetworkError') ||
                        errorMessage.includes('fetch');
  const isConfigError = errorMessage.includes('API key') || 
                       errorMessage.includes('configuration') ||
                       errorMessage.includes('secret');
  const isNotFoundError = errorMessage.includes('not found') || 
                         errorMessage.includes('Pipeline not found');
  
  return { isNetworkError, isConfigError, isNotFoundError };
};

const handleEdgeFunctionError = (func: EdgeFunction, errorMessage: string): AuditResult => {
  const { isNetworkError, isConfigError, isNotFoundError } = classifyEdgeFunctionError(errorMessage);
  
  if (isNetworkError) {
    return {
      component: func.name,
      status: 'fail',
      message: 'Network connectivity issue',
      details: [
        'Cannot reach Supabase Edge Functions',
        'Check internet connection',
        'Verify Supabase project status'
      ]
    };
  }
  
  if (isConfigError) {
    return {
      component: func.name,
      status: 'warning',
      message: 'Function accessible but needs configuration',
      details: [
        'Edge function is deployed',
        'API keys may need to be configured',
        'Check Supabase Edge Function Secrets'
      ]
    };
  }
  
  if (isNotFoundError) {
    return {
      component: func.name,
      status: 'pass',
      message: 'Function responding correctly',
      details: [
        'Edge function is deployed and responding',
        'Test data not found as expected'
      ]
    };
  }
  
  return {
    component: func.name,
    status: 'warning',
    message: `Function error: ${errorMessage}`,
    details: [
      'Function is accessible but returned an error',
      'May need configuration or debugging'
    ]
  };
};

export const testEdgeFunctions = async (results: AuditResult[]) => {
  for (const func of EDGE_FUNCTIONS) {
    try {
      console.log(`Testing edge function: ${func.name}`);
      
      const { data, error } = await supabase.functions.invoke(func.functionName, {
        body: func.testPayload
      });
      
      if (error) {
        const errorMessage = error.message || 'Unknown error';
        results.push(handleEdgeFunctionError(func, errorMessage));
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

// NOTE: The following E2E/API tests are for diagnostics and health checks only.
// They use mock/test data (e.g., https://example.com) and do NOT simulate the full user journey.
// These tests are safe for CI/staging and do not persist meaningful production data.
// TODO: If needed, add cleanup logic to remove test data after running these tests.

// E2E test for Company Analyze and GTM Playbook flows
export const testIntelAndGTMFlows = async (results: AuditResult[]) => {
  // Test Company Analyze
  try {
    const analyzeRes = await fetch('/api/company-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com' })
    });
    const analyzeData = await analyzeRes.json();
    if (analyzeRes.ok && (analyzeData.success || analyzeData.companyName || analyzeData.company_name)) {
      results.push({
        component: 'Company Analyze (Intel)',
        status: 'pass',
        message: 'Company Analyze API operational',
        details: ['Received valid response', JSON.stringify(analyzeData).slice(0, 200)]
      });
    } else {
      results.push({
        component: 'Company Analyze (Intel)',
        status: 'fail',
        message: 'Company Analyze API error',
        details: [analyzeData.error || 'No valid response']
      });
    }
  } catch (err: any) {
    results.push({
      component: 'Company Analyze (Intel)',
      status: 'fail',
      message: 'Company Analyze API error',
      details: [err.message || 'Unknown error']
    });
  }

  // Test GTM Playbook
  try {
    const gtmRes = await fetch('/api/gtm-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        websiteUrl: 'https://example.com',
        workspace_id: 'test-workspace',
        gtmFormAnswers: { productStage: 'MVP', channel: 'Outbound', salesCycle: '30 days', primaryGoals: 'Growth', additionalContext: 'Test' },
        selectedCompany: { companyName: 'Example', workspace_id: 'test-workspace' }
      })
    });
    const gtmData = await gtmRes.json();
    if (gtmRes.ok && (gtmData.success || gtmData.gtmPlaybook)) {
      results.push({
        component: 'GTM Playbook',
        status: 'pass',
        message: 'GTM Playbook API operational',
        details: ['Received valid response', JSON.stringify(gtmData).slice(0, 200)]
      });
    } else {
      results.push({
        component: 'GTM Playbook',
        status: 'fail',
        message: 'GTM Playbook API error',
        details: [gtmData.error || 'No valid response']
      });
    }
  } catch (err: any) {
    results.push({
      component: 'GTM Playbook',
      status: 'fail',
      message: 'GTM Playbook API error',
      details: [err.message || 'Unknown error']
    });
  }
};

// Run all edge function and E2E tests
// NOTE: This is for diagnostics/testing only, not for production or permanent data.
export const runAllEdgeTests = async () => {
  const results: AuditResult[] = [];
  await testEdgeFunctions(results);
  await testIntelAndGTMFlows(results);
  return results;
};
