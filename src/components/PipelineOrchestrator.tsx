
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Play, Pause, RotateCcw, CheckCircle, XCircle } from "lucide-react";

interface PipelineConfig {
  url: string;
  userInput: string;
  batchSize: number;
  skipEnrichment: boolean;
}

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

const PipelineOrchestrator = () => {
  const [config, setConfig] = useState<PipelineConfig>({
    url: '',
    userInput: '',
    batchSize: 10,
    skipEnrichment: false
  });
  
  const [currentPipeline, setCurrentPipeline] = useState<PipelineState | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const phaseLabels = {
    'icp_generation': 'ICP Generation',
    'company_discovery': 'Company Discovery',
    'contact_discovery': 'Contact Discovery', 
    'email_personalization': 'Email Personalization',
    'campaign_upload': 'Campaign Upload'
  };

  const statusColors = {
    'idle': 'bg-gray-500',
    'running': 'bg-blue-500 animate-pulse',
    'paused': 'bg-yellow-500',
    'completed': 'bg-green-500',
    'failed': 'bg-red-500'
  };

  const handleStartPipeline = async () => {
    if (!config.url.trim()) {
      toast.error('Please enter a company URL');
      return;
    }

    setIsStarting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('pipeline-orchestrator', {
        body: {
          action: 'start',
          config
        }
      });

      if (error) throw error;

      if (data.success) {
        setCurrentPipeline({
          id: data.pipelineId,
          status: 'running',
          currentPhase: 'icp_generation',
          progress: 0,
          companiesProcessed: 0,
          contactsFound: 0,
          emailsGenerated: 0,
          updatedAt: new Date().toISOString()
        });
        
        toast.success('Pipeline started successfully!');
        
        // Start polling for status updates
        startStatusPolling(data.pipelineId);
      }
    } catch (error) {
      console.error('Error starting pipeline:', error);
      toast.error('Failed to start pipeline');
    } finally {
      setIsStarting(false);
    }
  };

  const startStatusPolling = (pipelineId: string) => {
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
          const pipeline = data.pipeline;
          setCurrentPipeline(pipeline);
          
          // Stop polling if pipeline is completed or failed
          if (pipeline.status === 'completed' || pipeline.status === 'failed') {
            clearInterval(pollInterval);
            
            if (pipeline.status === 'completed') {
              toast.success('Pipeline completed successfully!');
              loadResults(pipelineId);
            } else {
              toast.error(`Pipeline failed: ${pipeline.error}`);
            }
          }
        }
      } catch (error) {
        console.error('Error polling pipeline status:', error);
      }
    }, 3000); // Poll every 3 seconds

    // Clean up interval after 30 minutes
    setTimeout(() => clearInterval(pollInterval), 30 * 60 * 1000);
  };

  const loadResults = async (pipelineId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('pipeline-orchestrator', {
        body: {
          action: 'results',
          pipelineId
        }
      });

      if (error) throw error;

      if (data.success) {
        setResults(data.results);
      }
    } catch (error) {
      console.error('Error loading results:', error);
      toast.error('Failed to load pipeline results');
    }
  };

  const resetPipeline = () => {
    setCurrentPipeline(null);
    setResults([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Multi-Agent Lead Generation Pipeline
          </CardTitle>
          <CardDescription>
            Automated end-to-end lead generation using AI agents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="url" className="text-sm font-medium">
                Company URL *
              </label>
              <Input
                id="url"
                placeholder="https://example.com"
                value={config.url}
                onChange={(e) => setConfig(prev => ({ ...prev, url: e.target.value }))}
                disabled={currentPipeline?.status === 'running'}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="batchSize" className="text-sm font-medium">
                Batch Size
              </label>
              <Input
                id="batchSize"
                type="number"
                placeholder="10"
                value={config.batchSize}
                onChange={(e) => setConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) || 10 }))}
                disabled={currentPipeline?.status === 'running'}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="userInput" className="text-sm font-medium">
              Additional Context (Optional)
            </label>
            <Textarea
              id="userInput"
              placeholder="Provide additional context about the target market, pain points, or messaging preferences..."
              value={config.userInput}
              onChange={(e) => setConfig(prev => ({ ...prev, userInput: e.target.value }))}
              disabled={currentPipeline?.status === 'running'}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleStartPipeline}
              disabled={isStarting || currentPipeline?.status === 'running'}
              className="flex-1"
            >
              {isStarting || currentPipeline?.status === 'running' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Pipeline...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Pipeline
                </>
              )}
            </Button>
            
            {currentPipeline && (
              <Button
                onClick={resetPipeline}
                variant="outline"
                disabled={currentPipeline.status === 'running'}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {currentPipeline && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pipeline Status</span>
              <Badge className={`${statusColors[currentPipeline.status]} text-white`}>
                {currentPipeline.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                {currentPipeline.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                {currentPipeline.status.toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription>
              Current Phase: {phaseLabels[currentPipeline.currentPhase as keyof typeof phaseLabels] || currentPipeline.currentPhase}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{currentPipeline.progress}%</span>
              </div>
              <Progress value={currentPipeline.progress} className="w-full" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-600">
                  {currentPipeline.companiesProcessed}
                </div>
                <div className="text-xs text-gray-500">Companies Processed</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">
                  {currentPipeline.contactsFound}
                </div>
                <div className="text-xs text-gray-500">Contacts Found</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-purple-600">
                  {currentPipeline.emailsGenerated}
                </div>
                <div className="text-xs text-gray-500">Emails Generated</div>
              </div>
            </div>

            {currentPipeline.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">
                  <strong>Error:</strong> {currentPipeline.error}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Results</CardTitle>
            <CardDescription>
              Generated leads and campaign data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PipelineOrchestrator;
