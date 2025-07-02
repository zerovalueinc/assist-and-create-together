import { useState } from 'react';
import { supabase } from '../../lib/supabase'; // See README for global pattern
import { useToast } from '@/hooks/use-toast';
import { PipelineState, PipelineConfig } from './types';

export function usePipelineOperations() {
  const { toast } = useToast();

  const startPipeline = async (config: PipelineConfig) => {
    try {
      const { data, error } = await supabase.functions.invoke('pipeline-orchestrator', {
        body: {
          action: 'start',
          config: {
            url: config.url.trim(),
            userInput: config.userInput.trim() || 'Generate comprehensive ICP and lead list',
            batchSize: config.batchSize,
            skipEnrichment: false
          }
        }
      });

      if (error) {
        console.error('Pipeline start error:', error);
        
        if (error.message?.includes('API key') || error.message?.includes('configuration')) {
          throw new Error('API_CONFIG_REQUIRED');
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
        
        toast({
          title: "Pipeline Started",
          description: "Your lead generation pipeline is now running.",
        });
        
        return newPipelineState;
      }
    } catch (error: any) {
      console.error('Error starting pipeline:', error);
      
      if (error.message === 'API_CONFIG_REQUIRED') {
        throw error;
      }
      
      toast({
        title: "Pipeline Error",
        description: error.message || "Failed to start the pipeline.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const pollPipelineStatus = async (pipelineId: string): Promise<PipelineState> => {
    const { data, error } = await supabase.functions.invoke('pipeline-orchestrator', {
      body: {
        action: 'status',
        pipelineId
      }
    });

    if (error) throw error;

    if (data.success) {
      return data.pipeline;
    }
    
    throw new Error('Failed to get pipeline status');
  };

  const fetchResults = async (pipelineId: string) => {
    const { data, error } = await supabase.functions.invoke('pipeline-orchestrator', {
      body: {
        action: 'results',
        pipelineId
      }
    });

    if (error) throw error;

    if (data.success) {
      return data.results[0]?.results_data || null;
    }
    
    return null;
  };

  return {
    startPipeline,
    pollPipelineStatus,
    fetchResults
  };
}
