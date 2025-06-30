export interface WorkflowState {
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  progress?: number;
  result?: any;
  error?: string;
}

export abstract class BaseWorkflow {
  public state: WorkflowState = { status: 'idle' };
  public abstract name: string;
  public abstract run(params: any): Promise<any>;
  public pause?(): Promise<void>;
  public resume?(): Promise<void>;
  public getState(): WorkflowState {
    return this.state;
  }
} 