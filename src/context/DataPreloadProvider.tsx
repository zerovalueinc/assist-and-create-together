import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCache, setCache } from '@/lib/utils';
import { useAuth } from './AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardData {
  companyAnalyzer: any[];
  icps: any[];
  playbooks: any[];
  salesintel: any[];
}

interface DataPreloadContextType {
  loading: boolean;
  preloadError: string | null;
  data: DashboardData | null;
  retry: () => void;
}

const DataPreloadContext = createContext<DataPreloadContextType>({ loading: true, preloadError: null, data: null, retry: () => {} });

export const useDataPreload = () => useContext(DataPreloadContext);

export const DataPreloadProvider = ({ children }: { children: ReactNode }) => {
  const { user, session, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [preloadError, setPreloadError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const retry = () => setRetryCount((c) => c + 1);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !session) {
      setLoading(false);
      setPreloadError(null);
      setDashboardData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setPreloadError(null);
    setDashboardData(null);

    const fetchAll = async () => {
      try {
        const [companyAnalyzer, icps, playbooks, salesintel] = await Promise.all([
          supabase.from('company_analyzer_outputs_unrestricted').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
          supabase.from('icps').select('*').eq('user_id', Number(user.id)).order('created_at', { ascending: false }),
          supabase.from('saved_reports').select('*').eq('user_id', Number(user.id)).order('created_at', { ascending: false }),
          supabase.from('saved_reports').select('*').eq('user_id', Number(user.id)).order('created_at', { ascending: false })
        ]);
        if (cancelled) return;
        const normalize = (arr: any[] = []) => arr.map((r: any) => ({
          ...r,
          companyName: r.companyName || r.company_name || '',
          companyUrl: r.companyUrl || r.url || r.websiteUrl || r.website || '',
          createdAt: r.createdAt || r.created_at || '',
        }));
        const data: DashboardData = {
          companyAnalyzer: normalize(companyAnalyzer.data),
          icps: icps.data || [],
          playbooks: playbooks.data || [],
          salesintel: salesintel.data || [],
        };
        setCache('companyanalyzer_reports', data.companyAnalyzer);
        setCache('yourwork_analyze', data.companyAnalyzer);
        setCache('icp_icps', data.icps);
        setCache('icp_playbooks', data.playbooks);
        setCache('salesintel_reports', data.salesintel);
        setCache('yourwork_gtm', [...data.icps, ...data.playbooks]);
        setDashboardData(data);
        setLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          setPreloadError(err.message || 'Failed to preload dashboard data.');
          setLoading(false);
          setDashboardData(null);
          console.error('DataPreloadProvider preload error:', err);
        }
      }
    };
    fetchAll();
    return () => { cancelled = true; };
  }, [user, session, authLoading, retryCount]);

  if (authLoading) return <>{children}</>; // Never block public routes

  if (user && session && loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Skeleton className="w-32 h-32 mb-4" />
        {preloadError && (
          <div className="text-red-600 text-center">
            <div className="mb-2">{preloadError}</div>
            <button onClick={retry} className="px-4 py-2 bg-blue-600 text-white rounded">Retry</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <DataPreloadContext.Provider value={{ loading, preloadError, data: dashboardData, retry }}>
      {children}
    </DataPreloadContext.Provider>
  );
}; 