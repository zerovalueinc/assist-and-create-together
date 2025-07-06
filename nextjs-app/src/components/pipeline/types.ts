
export interface PipelineState {
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

export interface PipelineConfig {
  url: string;
  userInput: string;
  batchSize: number;
  skipEnrichment: boolean;
}
