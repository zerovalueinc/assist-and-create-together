
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ApiKeySetup } from './ApiKeySetup';

interface PipelineState {
  id: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  currentPhase: string;
  progress: number;
  companiesProcessed: number;
  contactsFound: number;
  emailsGenerated: number;
  error?: string;
  updatedAt: string;
}

export default function PipelineOrchestrator() {
  const [url, setUrl] = useState('');
  const [userInput, setUserInput] = useState('');
  const [batchSize, setBatchSize] = useState(10);
  const [pipelineState, setPipelineState] = useState<PipelineState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showApiSetup, setShowApiSetup] = useState(false);
  const { toast } = useToast();

  const startPipeline = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a company website URL to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pipeline-orchestrator', {
        body: {
          action: 'start',
          config: {
            url: url.trim(),
            userInput: userInput.trim() || 'Generate comprehensive ICP and lead list',
            batchSize,
            skipEnrichment: false
          }
        }
      });

      if (error) {
        console.error('Pipeline start error:', error);
        
        if (error.message?.includes('API key') || error.message?.includes('configuration')) {
          setShowApiSetup(true);
          toast({
            title: "API Configuration Required",
            description: "Please configure your API keys in Supabase Edge Function Secrets.",
            variant: "destructive",
          });
          return;
        }
        
        throw error;
      }

      if (data.success) {
        const newPipelineState: PipelineState = {
          id: data.pipelineId,
          status: data.status,
          currentPhase: 'icp_generation',
          progress: 0,
          companiesProcessed: 0,
          contactsFound: 0,
          emailsGenerated: 0,
          updatedAt: new Date().toISOString()
        };
        
        setPipelineState(newPipelineState);
        pollPipelineStatus(data.pipelineId);
        
        toast({
          title: "Pipeline Started",
          description: "Your lead generation pipeline is now running.",
        });
      }
    } catch (error: any) {
      console.error('Error starting pipeline:', error);
      toast({
        title: "Pipeline Error",
        description: error.message || "Failed to start the pipeline.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pollPipelineStatus = async (pipelineId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('pipeline-orchestrator', {
          body: {
            action: 'status',
            pipelineId
          }
        });

        if (error) throw error;

        if (data.success) {
          setPipelineState(data.pipeline);
          
          if (data.pipeline.status === 'completed' || data.pipeline.status === 'failed') {
            clearInterval(pollInterval);
            
            if (data.pipeline.status === 'completed') {
              fetchResults(pipelineId);
              toast({
                title: "Pipeline Completed",
                description: `Successfully processed ${data.pipeline.companiesProcessed} companies and found ${data.pipeline.contactsFound} contacts.`,
              });
            }
          }
        }
      } catch (error) {
        console.error('Error polling pipeline status:', error);
        clearInterval(pollInterval);
      }
    }, 2000);
  };

  const fetchResults = async (pipelineId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('pipeline-orchestrator', {
        body: {
          action: 'results',
          pipelineId
        }
      });

      if (error) throw error;

      if (data.success) {
        setResults(data.results[0]?.results_data || null);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

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

  if (showApiSetup) {
    return <ApiKeySetup />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Orchestrator</CardTitle>
          <CardDescription>
            Generate ICPs, discover companies and contacts, then create personalized email campaigns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!pipelineState && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Company Website URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="userInput">Additional Context (Optional)</Label>
                <Input
                  id="userInput"
                  placeholder="Any specific requirements or context..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="batchSize">Batch Size</Label>
                <Input
                  id="batchSize"
                  type="number"
                  min="1"
                  max="50"
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value) || 10)}
                />
              </div>
              
              <Button 
                onClick={startPipeline} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Starting Pipeline...' : 'Start Pipeline'}
              </Button>
              
              <div className="text-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowApiSetup(true)}
                >
                  Configure API Keys
                </Button>
              </div>
            </div>
          )}
          
          {pipelineState && (
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
                onClick={() => {
                  setPipelineState(null);
                  setResults(null);
                }}
              >
                Start New Pipeline
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
