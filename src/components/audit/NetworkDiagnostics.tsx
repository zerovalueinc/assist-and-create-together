import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase'; // See README for global pattern

interface NetworkTest {
  name: string;
  status: 'pending' | 'pass' | 'fail';
  message: string;
}

export function NetworkDiagnostics() {
  const [tests, setTests] = useState<NetworkTest[]>([
    {
      name: 'Internet Connectivity',
      status: 'pending',
      message: 'Not tested'
    },
    {
      name: 'Supabase Database',
      status: 'pending',
      message: 'Not tested'
    },
    {
      name: 'Supabase Authentication',
      status: 'pending',
      message: 'Not tested'
    }
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const runNetworkTests = async () => {
    setIsRunning(true);
    const updatedTests = [...tests];

    // Test 1: Internet Connectivity - Use a more reliable method
    try {
      const response = await fetch('https://api.github.com/zen', { 
        method: 'GET',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        updatedTests[0].status = 'pass';
        updatedTests[0].message = 'Internet connection active';
      } else {
        updatedTests[0].status = 'fail';
        updatedTests[0].message = 'Internet connection issues detected';
      }
    } catch (error) {
      updatedTests[0].status = 'fail';
      updatedTests[0].message = 'No internet connection';
    }
    setTests([...updatedTests]);

    // Test 2: Supabase Database Connection
    try {
      console.log('Testing Supabase database connection...');
      
      // Use a simple query that works regardless of authentication status
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (error) {
        // Check if it's an auth/RLS error (which means Supabase is reachable)
        if (error.message.includes('JWT') || 
            error.message.includes('RLS') || 
            error.message.includes('policy') ||
            error.message.includes('authentication') ||
            error.code === 'PGRST301') {
          updatedTests[1].status = 'pass';
          updatedTests[1].message = 'Database reachable (auth required for data)';
        } else {
          updatedTests[1].status = 'fail';
          updatedTests[1].message = `Database error: ${error.message}`;
        }
      } else {
        updatedTests[1].status = 'pass';
        updatedTests[1].message = 'Database connection successful';
      }
    } catch (error) {
      // Check if it's a network error vs auth error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        updatedTests[1].status = 'fail';
        updatedTests[1].message = 'Cannot reach Supabase servers';
      } else {
        updatedTests[1].status = 'pass';
        updatedTests[1].message = 'Database reachable (auth/permissions issue)';
      }
    }
    setTests([...updatedTests]);

    // Test 3: Supabase Authentication Service
    try {
      console.log('Testing Supabase auth service...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        // If we can get an error from auth, the service is reachable
        updatedTests[2].status = 'pass';
        updatedTests[2].message = `Auth service accessible (${error.message})`;
      } else {
        updatedTests[2].status = 'pass';
        updatedTests[2].message = session ? 'Authenticated user session' : 'Auth service accessible (no session)';
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('Failed to fetch')) {
        updatedTests[2].status = 'fail';
        updatedTests[2].message = 'Cannot reach Supabase auth service';
      } else {
        updatedTests[2].status = 'fail';
        updatedTests[2].message = errorMessage;
      }
    }
    setTests([...updatedTests]);

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
              <li>• If Supabase auth fails, try logging in again</li>
            </ul>
          </div>
        )}

        {tests.every(t => t.status === 'pass') && tests[0].status !== 'pending' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">All Network Tests Passed</h4>
            <p className="text-sm text-green-800">Your connection to Supabase is working correctly.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
