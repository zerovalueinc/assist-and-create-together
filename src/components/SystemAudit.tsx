
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AuditResult } from './audit/types';
import { AuditResultCard } from './audit/AuditResultCard';
import { AuditSummary } from './audit/AuditSummary';
import { NetworkDiagnostics } from './audit/NetworkDiagnostics';
import { testSupabaseConnection, testEdgeFunctions, testDatabaseTables } from './audit/auditTests';

export function SystemAudit() {
  const [results, setResults] = useState<AuditResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const runAudit = async () => {
    setIsRunning(true);
    setResults([]);
    const auditResults: AuditResult[] = [];

    console.log('Starting comprehensive system audit...');

    try {
      // Test Supabase connection first
      await testSupabaseConnection(auditResults);
      
      // Only test other components if basic connection works
      const connectionPassed = auditResults.some(r => 
        r.component === 'Supabase Connection' && r.status === 'pass'
      );
      
      if (connectionPassed) {
        console.log('Basic connection successful, testing edge functions...');
        await testEdgeFunctions(auditResults);
        
        console.log('Testing database tables...');
        await testDatabaseTables(auditResults);
      } else {
        console.log('Skipping further tests due to basic connection failure');
        auditResults.push({
          component: 'System Status',
          status: 'fail',
          message: 'Cannot proceed with full audit due to connection issues',
          details: [
            'Fix Supabase connection first',
            'Check network connectivity',
            'Verify project configuration'
          ]
        });
      }
    } catch (error) {
      console.error('Audit process failed:', error);
      auditResults.push({
        component: 'System Audit',
        status: 'fail',
        message: 'Audit process encountered an error',
        details: [
          error instanceof Error ? error.message : 'Unknown error',
          'Try running the audit again'
        ]
      });
    }

    setResults(auditResults);
    setIsRunning(false);

    // Enhanced summary reporting
    const passed = auditResults.filter(r => r.status === 'pass').length;
    const failed = auditResults.filter(r => r.status === 'fail').length;
    const warnings = auditResults.filter(r => r.status === 'warning').length;
    
    console.log(`Audit completed: ${passed} passed, ${warnings} warnings, ${failed} failed`);
    
    let toastVariant: "default" | "destructive" = "default";
    let toastTitle = "Audit Complete";
    let toastDescription = `${passed} passed, ${warnings} warnings, ${failed} failed`;
    
    if (failed > 0) {
      toastVariant = "destructive";
      toastTitle = "Issues Found";
      toastDescription += " - Check results for details";
    } else if (warnings > 0) {
      toastTitle = "Audit Complete with Warnings";
    } else {
      toastTitle = "All Systems Operational";
    }
    
    toast({
      title: toastTitle,
      description: toastDescription,
      variant: toastVariant
    });
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
          <NetworkDiagnostics />
          
          <Button 
            onClick={runAudit} 
            disabled={isRunning}
            className="mb-6"
          >
            {isRunning ? 'Running Comprehensive Audit...' : 'Run System Audit'}
          </Button>

          {results.length > 0 && (
            <div className="space-y-4">
              <AuditSummary results={results} />
              
              <div className="space-y-3">
                {results.map((result, index) => (
                  <AuditResultCard key={index} result={result} />
                ))}
              </div>
              
              {results.some(r => r.status === 'fail') && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-4">
                    <h4 className="font-medium text-red-900 mb-2">Troubleshooting Steps</h4>
                    <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                      <li>Check your internet connection stability</li>
                      <li>Verify Supabase project is active and accessible</li>
                      <li>Confirm API keys are configured correctly</li>
                      <li>Try refreshing the page and running the audit again</li>
                      <li>Check browser console for additional error details</li>
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
