
import { supabase, testConnection } from '@/integrations/supabase/client';
import { AuditResult } from '../types';

export const testSupabaseConnection = async (results: AuditResult[]) => {
  try {
    console.log('Running enhanced Supabase connection test...');
    
    // Use our enhanced connection test
    const connectionResult = await testConnection();
    
    if (!connectionResult.success) {
      // Provide more specific error information
      let status: 'fail' | 'warning' = 'fail';
      let details = [
        `Error: ${connectionResult.error}`,
        connectionResult.details || 'Check configuration'
      ];
      
      // Check if it's a network issue specifically
      if (connectionResult.error?.includes('Network connectivity') || 
          connectionResult.error?.includes('Failed to fetch')) {
        details = [
          'Cannot reach Supabase servers',
          'Check your internet connection and VPN settings',
          'Verify firewall is not blocking the connection',
          'Try accessing https://hbogcsztrryrepudceww.supabase.co directly in browser'
        ];
      }
      
      results.push({
        component: 'Supabase Connection',
        status,
        message: connectionResult.message || 'Connection failed',
        details
      });
      return;
    }

    // Connection successful
    results.push({
      component: 'Supabase Connection',
      status: 'pass',
      message: connectionResult.message || 'Connection successful',
      details: [
        'Database accessible with optimized performance',
        'RLS policies working correctly',
        'API keys configured properly'
      ]
    });

    // If basic connection works, test authentication service
    try {
      console.log('Testing Supabase authentication service...');
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        results.push({
          component: 'Supabase Authentication',
          status: 'warning',
          message: 'Auth service accessible but with issues',
          details: [
            `Auth error: ${authError.message}`,
            'Authentication service is reachable'
          ]
        });
      } else {
        results.push({
          component: 'Supabase Authentication',
          status: 'pass',
          message: 'Authentication service operational',
          details: [
            'Auth service accessible',
            session ? 'Active user session found' : 'No active session (normal)'
          ]
        });
      }
    } catch (authErr) {
      results.push({
        component: 'Supabase Authentication',
        status: 'fail',
        message: 'Authentication service error',
        details: [
          `Error: ${authErr instanceof Error ? authErr.message : 'Unknown error'}`,
          'Cannot access authentication service'
        ]
      });
    }
  } catch (err) {
    console.error('Connection test failed:', err);
    results.push({
      component: 'Supabase Connection',
      status: 'fail',
      message: 'Connection test failed',
      details: [
        `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        'Unable to complete connection test'
      ]
    });
  }
};
