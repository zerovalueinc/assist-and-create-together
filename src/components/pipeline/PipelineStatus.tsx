import * as React from "react";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { PipelineState } from './types';

interface PipelineStatusProps {
  pipelineState: PipelineState;
  results: any;
  onStartNew: () => void;
}

export function PipelineStatus({ pipelineState, results, onStartNew }: PipelineStatusProps) {
  const getPhaseLabel = (phase: string) => {
    const phases = {
      'icp_generation': 'Generating ICP',
      'company_discovery': 'Finding Companies',
      'contact_discovery': 'Finding Contacts',
      'email_personalization': 'Personalizing Emails',
      'campaign_upload': 'Finalizing Campaign'
    };
    return phases[phase as keyof typeof phases] || phase;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Pipeline Status</h3>
        <Badge className={getStatusColor(pipelineState.status)}>
          {pipelineState.status.toUpperCase()}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{getPhaseLabel(pipelineState.currentPhase)}</span>
          <span>{pipelineState.progress}%</span>
        </div>
        <Progress value={pipelineState.progress} />
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold">{pipelineState.companiesProcessed}</div>
          <div className="text-sm text-gray-600">Companies</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{pipelineState.contactsFound}</div>
          <div className="text-sm text-gray-600">Contacts</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{pipelineState.emailsGenerated}</div>
          <div className="text-sm text-gray-600">Emails</div>
        </div>
      </div>
      
      {pipelineState.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error:</p>
          <p className="text-red-700 text-sm">{pipelineState.error}</p>
        </div>
      )}
      
      {pipelineState.status === 'completed' && results && (
        <div className="space-y-4">
          <Separator />
          <h4 className="font-semibold">Results Summary</h4>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">
              Pipeline completed successfully! Generated {results.summary?.emailsGenerated || 0} personalized emails 
              from {results.summary?.contactsFound || 0} contacts across {results.summary?.companiesFound || 0} companies.
            </p>
          </div>
        </div>
      )}
      
      <Button 
        variant="outline" 
        onClick={onStartNew}
      >
        Start New Pipeline
      </Button>
    </div>
  );
}
