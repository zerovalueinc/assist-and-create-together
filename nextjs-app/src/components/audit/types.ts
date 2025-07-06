
export interface AuditResult {
  component: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  message: string;
  details?: string[];
}
