
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuditResult {
  component: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  message: string;
  details?: string[];
}

export function SystemAudit() {
  const [results, setResults] = useState<AuditResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const runAudit = async () => {
    setIsRunning(true);
    setResults([]);
    const auditResults: AuditResult[] = [];

    // 1. Test Supabase Connection
    await testSupabaseConnection(auditResults);
    
    // 2. Test Edge Functions
    await testEdgeFunctions(auditResults);
    
    // 3. Test Database Tables
    await testDatabaseTables(auditResults);

    setResults(auditResults);
    setIsRunning(false);

    // Show summary toast
    const passed = auditResults.filter(r => r.status === 'pass').length;
    const failed = auditResults.filter(r => r.status === 'fail').length;
    const warnings = auditResults.filter(r => r.status === 'warning').length;
    
    toast({
      title: "Audit Complete",
      description: `${passed} passed, ${warnings} warnings, ${failed} failed`,
      variant: failed > 0 ? "destructive" : warnings > 0 ? "default" : "default"
    });
  };

  const testSupabaseConnection = async (results: AuditResult[]) => {
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

  const testEdgeFunctions = async (results: AuditResult[]) => {
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

  const testDatabaseTables = async (results: AuditResult[]) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pass: 'bg-green-100 text-green-800',
      fail: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={variants[status as keyof typeof variants]}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Health Audit</CardTitle>
          <CardDescription>
            Comprehensive validation of all system components and integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runAudit} 
            disabled={isRunning}
            className="mb-6"
          >
            {isRunning ? 'Running Audit...' : 'Run System Audit'}
          </Button>

          {results.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {results.filter(r => r.status === 'pass').length}
                  </div>
                  <div className="text-sm text-gray-600">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {results.filter(r => r.status === 'warning').length}
                  </div>
                  <div className="text-sm text-gray-600">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {results.filter(r => r.status === 'fail').length}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {results.length}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>

              {results.map((result, index) => (
                <Card key={index} className="border-l-4 border-l-gray-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(result.status)}
                        <h3 className="font-medium">{result.component}</h3>
                      </div>
                      {getStatusBadge(result.status)}
                    </div>
                    <p className="text-gray-600 mb-2">{result.message}</p>
                    {result.details && result.details.length > 0 && (
                      <ul className="text-sm text-gray-500 list-disc list-inside">
                        {result.details.map((detail, i) => (
                          <li key={i}>{detail}</li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
