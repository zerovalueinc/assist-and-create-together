
import React from 'react';
import { AuditResult } from './types';

interface AuditSummaryProps {
  results: AuditResult[];
}

export function AuditSummary({ results }: AuditSummaryProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">
          {results.filter(r => r.status === 'pass').length}
        </div>
        <div className="text-sm text-gray-600">Passed</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-yellow-600">
          {results.filter(r => r.status === 'warning').length}
        </div>
        <div className="text-sm text-gray-600">Warnings</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-red-600">
          {results.filter(r => r.status === 'fail').length}
        </div>
        <div className="text-sm text-gray-600">Failed</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">
          {results.length}
        </div>
        <div className="text-sm text-gray-600">Total</div>
      </div>
    </div>
  );
}
