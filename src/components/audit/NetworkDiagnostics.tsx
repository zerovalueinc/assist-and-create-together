
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';

interface NetworkTest {
  name: string;
  url: string;
  status: 'pending' | 'pass' | 'fail';
  message: string;
}

export function NetworkDiagnostics() {
  const [tests, setTests] = useState<NetworkTest[]>([
    {
      name: 'Internet Connectivity',
      url: 'https://www.google.com',
      status: 'pending',
      message: 'Not tested'
    },
    {
      name: 'Supabase Reachability',
      url: 'https://hbogcsztrryrepudceww.supabase.co',
      status: 'pending',
      message: 'Not tested'
    },
    {
      name: 'Supabase API',
      url: 'https://hbogcsztrryrepudceww.supabase.co/rest/v1/',
      status: 'pending',
      message: 'Not tested'
    }
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const runNetworkTests = async () => {
    setIsRunning(true);
    const updatedTests = [...tests];

    for (let i = 0; i < updatedTests.length; i++) {
      try {
        // Use a simple fetch with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(updatedTests[i].url, {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        updatedTests[i].status = 'pass';
        updatedTests[i].message = 'Reachable';
      } catch (error) {
        updatedTests[i].status = 'fail';
        updatedTests[i].message = error instanceof Error ? error.message : 'Connection failed';
      }

      setTests([...updatedTests]);
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail': return <WifiOff className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pass: 'bg-green-100 text-green-800',
      fail: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={variants[status as keyof typeof variants]}>{status.toUpperCase()}</Badge>;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          Network Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={runNetworkTests} 
          disabled={isRunning}
          className="mb-4"
        >
          {isRunning ? 'Testing Network...' : 'Run Network Tests'}
        </Button>

        <div className="space-y-3">
          {tests.map((test, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(test.status)}
                <div>
                  <p className="font-medium">{test.name}</p>
                  <p className="text-sm text-gray-600">{test.message}</p>
                </div>
              </div>
              {getStatusBadge(test.status)}
            </div>
          ))}
        </div>

        {tests.some(t => t.status === 'fail') && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Network Issues Detected</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Try refreshing the page</li>
              <li>• Check if Supabase is experiencing outages</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
