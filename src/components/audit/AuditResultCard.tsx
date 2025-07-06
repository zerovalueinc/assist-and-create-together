import * as React from "react";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { AuditResult } from './types';

interface AuditResultCardProps {
  result: AuditResult;
}

export function AuditResultCard({ result }: AuditResultCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pass: 'bg-green-100 text-green-800',
      fail: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={variants[status as keyof typeof variants]}>{status.toUpperCase()}</Badge>;
  };

  return (
    <Card className="border-l-4 border-l-gray-200">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {getStatusIcon(result.status)}
            <h3 className="font-medium">{result.component}</h3>
          </div>
          {getStatusBadge(result.status)}
        </div>
        <p className="text-gray-600 mb-2">{result.message}</p>
        {result.details && result.details.length > 0 && (
          <ul className="text-sm text-gray-500 list-disc list-inside">
            {result.details.map((detail, i) => (
              <li key={i}>{detail}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
