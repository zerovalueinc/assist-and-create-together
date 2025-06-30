import { BaseWorkflow, WorkflowState } from './BaseWorkflow';

interface WorkflowRegistryEntry {
  factory: () => BaseWorkflow;
}

export class WorkflowManager {
  private registry: Map<string, WorkflowRegistryEntry> = new Map();
  private activeWorkflows: Map<string, BaseWorkflow> = new Map(); // key: session/user+workflow

  registerWorkflow(name: string, factory: () => BaseWorkflow) {
    this.registry.set(name, { factory });
  }

  startWorkflow(name: string, params: any, sessionId: string): BaseWorkflow | null {
    const entry = this.registry.get(name);
    if (!entry) return null;
    const instance = entry.factory();
    this.activeWorkflows.set(`${sessionId}:${name}`, instance);
    instance.run(params);
    return instance;
  }

  getWorkflowState(name: string, sessionId: string): WorkflowState | null {
    const instance = this.activeWorkflows.get(`${sessionId}:${name}`);
    return instance ? instance.getState() : null;
  }
} 