import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ApiKeySetup } from './ApiKeySetup';
import { PipelineForm } from './pipeline/PipelineForm';
import { PipelineStatus } from './pipeline/PipelineStatus';
import { usePipelineOperations } from './pipeline/usePipelineOperations';
import { PipelineState } from './pipeline/types';
import { getCache, setCache } from '../lib/utils';
import { useUser } from '../hooks/useUserData';

export default function PipelineOrchestrator() {
  const [url, setUrl] = useState('');
  const [userInput, setUserInput] = useState('');
  const [batchSize, setBatchSize] = useState(10);
  const [pipelineState, setPipelineState] = useState<PipelineState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showApiSetup, setShowApiSetup] = useState(false);
  const { toast } = useToast();
  const { startPipeline, pollPipelineStatus, fetchResults } = usePipelineOperations();
  const { user, session } = useUser();

  // Show cached pipeline state/results instantly
  useEffect(() => {
    if (!user?.id) return;
    const cachedState = getCache<any>(`pipeline_state_${user.id}`, null);
    const cachedResults = getCache<any>(`pipeline_results_${user.id}`, null);
    if (cachedState) setPipelineState(cachedState);
    if (cachedResults) setResults(cachedResults);
  }, [user]);

  const handleStartPipeline = async () => {
    if (!user?.id || !session?.access_token) return;
    setIsLoading(true);
    try {
      const newPipelineState = await startPipeline({
        url,
        userInput,
        batchSize,
        skipEnrichment: false
      });
      
      setPipelineState(newPipelineState);
      setCache(`pipeline_state_${user.id}`, newPipelineState);
      startPolling(newPipelineState.id);
    } catch (error: any) {
      if (error.message === 'API_CONFIG_REQUIRED') {
        setShowApiSetup(true);
        toast({
          title: "API Configuration Required",
          description: "Please configure your API keys in Supabase Edge Function Secrets.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = (pipelineId: string) => {
    const pollInterval = setInterval(async () => {
      if (!user?.id || !session?.access_token) return;
      try {
        const updatedState = await pollPipelineStatus(pipelineId);
        setPipelineState(updatedState);
        setCache(`pipeline_state_${user.id}`, updatedState);
        
        if (updatedState.status === 'completed' || updatedState.status === 'failed') {
          clearInterval(pollInterval);
          
          if (updatedState.status === 'completed') {
            const pipelineResults = await fetchResults(pipelineId);
            setResults(pipelineResults);
            setCache(`pipeline_results_${user.id}`, pipelineResults);
            toast({
              title: "Pipeline Completed",
              description: `Successfully processed ${updatedState.companiesProcessed} companies and found ${updatedState.contactsFound} contacts.`,
            });
          }
        }
      } catch (error) {
        console.error('Error polling pipeline status:', error);
        clearInterval(pollInterval);
      }
    }, 2000);
  };

  const handleStartNew = () => {
    setPipelineState(null);
    setResults(null);
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
          {!pipelineState ? (
            <PipelineForm
              url={url}
              setUrl={setUrl}
              userInput={userInput}
              setUserInput={setUserInput}
              batchSize={batchSize}
              setBatchSize={setBatchSize}
              onStartPipeline={handleStartPipeline}
              onShowApiSetup={() => setShowApiSetup(true)}
              isLoading={isLoading}
            />
          ) : (
            <PipelineStatus
              pipelineState={pipelineState}
              results={results}
              onStartNew={handleStartNew}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
