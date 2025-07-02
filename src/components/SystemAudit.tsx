
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
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      auditResults.push({
        component: 'Supabase Connection',
        status: error ? 'fail' : 'pass',
        message: error ? `Connection failed: ${error.message}` : 'Connection successful',
        details: error ? [error.hint || ''] : ['Database accessible']
      });
    } catch (err) {
      auditResults.push({
        component: 'Supabase Connection',
        status: 'fail',
        message: 'Connection error',
        details: [String(err)]
      });
    }

    // 2. Test Pipeline Orchestrator Edge Function
    try {
      const { data, error } = await supabase.functions.invoke('pipeline-orchestrator', {
        body: { action: 'status', pipelineId: 'test' }
      });
      auditResults.push({
        component: 'Pipeline Orchestrator',
        status: error && !error.message?.includes('Pipeline not found') ? 'fail' : 'pass',
        message: error && !error.message?.includes('Pipeline not found') ? 
          `Function error: ${error.message}` : 'Function responding correctly',
        details: ['Edge function deployed and accessible']
      });
    } catch (err) {
      auditResults.push({
        component: 'Pipeline Orchestrator',
        status: 'fail',
        message: 'Edge function not accessible',
        details: [String(err)]
      });
    }

    // 3. Test GTM Generate Function
    try {
      const { data, error } = await supabase.functions.invoke('gtm-generate', {
        body: { websiteUrl: 'https://example.com' }
      });
      auditResults.push({
        component: 'GTM Generator',
        status: error && !error.message?.includes('API key') ? 'fail' : 
                error?.message?.includes('API key') ? 'warning' : 'pass',
        message: error?.message?.includes('API key') ? 
          'Function works but needs API key configuration' :
          error ? `Function error: ${error.message}` : 'Function operational',
        details: error?.message?.includes('API key') ? 
          ['Configure OPENROUTER_API_KEY in Supabase secrets'] : []
      });
    } catch (err) {
      auditResults.push({
        component: 'GTM Generator',
        status: 'fail',
        message: 'Edge function error',
        details: [String(err)]
      });
    }

    // 4. Test Company Discovery Function
    try {
      const { data, error } = await supabase.functions.invoke('company-discovery', {
        body: { icpData: { firmographics: { industry: 'Technology' } }, batchSize: 1 }
      });
      auditResults.push({
        component: 'Company Discovery',
        status: error && !error.message?.includes('API key') ? 'fail' : 
                error?.message?.includes('API key') ? 'warning' : 'pass',
        message: error?.message?.includes('API key') ? 
          'Function works but needs Apollo API key' :
          error ? `Function error: ${error.message}` : 'Function operational',
        details: error?.message?.includes('API key') ? 
          ['Configure APOLLO_API_KEY in Supabase secrets'] : []
      });
    } catch (err) {
      auditResults.push({
        component: 'Company Discovery',
        status: 'fail',
        message: 'Edge function error',
        details: [String(err)]
      });
    }

    // 5. Test Contact Discovery Function
    try {
      const { data, error } = await supabase.functions.invoke('contact-discovery', {
        body: { companies: [{ name: 'Test', domain: 'test.com' }], targetPersonas: [] }
      });
      auditResults.push({
        component: 'Contact Discovery',
        status: error && !error.message?.includes('API key') ? 'fail' : 
                error?.message?.includes('API key') ? 'warning' : 'pass',
        message: error?.message?.includes('API key') ? 
          'Function works but needs Apollo API key' :
          error ? `Function error: ${error.message}` : 'Function operational',
        details: error?.message?.includes('API key') ? 
          ['Configure APOLLO_API_KEY in Supabase secrets'] : []
      });
    } catch (err) {
      auditResults.push({
        component: 'Contact Discovery',
        status: 'fail',
        message: 'Edge function error',
        details: [String(err)]
      });
    }

    // 6. Test Email Personalization Function
    try {
      const { data, error } = await supabase.functions.invoke('email-personalization', {
        body: { contacts: [], icpData: {} }
      });
      auditResults.push({
        component: 'Email Personalization',
        status: error && !error.message?.includes('API key') ? 'fail' : 
                error?.message?.includes('API key') ? 'warning' : 'pass',
        message: error?.message?.includes('API key') ? 
          'Function works but needs OpenRouter API key' :
          error ? `Function error: ${error.message}` : 'Function operational',
        details: error?.message?.includes('API key') ? 
          ['Configure OPENROUTER_API_KEY in Supabase secrets'] : []
      });
    } catch (err) {
      auditResults.push({
        component: 'Email Personalization',
        status: 'fail',
        message: 'Edge function error',
        details: [String(err)]
      });
    }

    // 7. Check Database Tables
    const requiredTables = ['profiles', 'pipeline_states', 'pipeline_results'];
    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        auditResults.push({
          component: `Database Table: ${table}`,
          status: error ? 'fail' : 'pass',
          message: error ? `Table error: ${error.message}` : 'Table accessible',
          details: error ? [] : ['Table structure validated']
        });
      } catch (err) {
        auditResults.push({
          component: `Database Table: ${table}`,
          status: 'fail',
          message: 'Table access error',
          details: [String(err)]
        });
      }
    }

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
