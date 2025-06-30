export interface Agent {
  name: string;
  execute(params: any): Promise<any>;
  getCapabilities?(): string[];
} 