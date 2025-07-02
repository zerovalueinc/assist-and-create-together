
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AuditResult } from './audit/types';
import { AuditResultCard } from './audit/AuditResultCard';
import { AuditSummary } from './audit/AuditSummary';
import { testSupabaseConnection, testEdgeFunctions, testDatabaseTables } from './audit/auditTests';

export function SystemAudit() {
  const [results, setResults] = useState<AuditResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const runAudit = async () => {
    setIsRunning(true);
    setResults([]);
    const auditResults: AuditResult[] = [];

    // Run all tests
    await testSupabaseConnection(auditResults);
    await testEdgeFunctions(auditResults);
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
              <AuditSummary results={results} />
              {results.map((result, index) => (
                <AuditResultCard key={index} result={result} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
