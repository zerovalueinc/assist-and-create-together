'use client';
import * as React from "react";
import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCache, setCache } from '@/lib/utils';
import { useUser, useSession } from '@supabase/auth-helpers-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCompany } from './CompanyContext';
import { getCompanyAnalysis } from '@/lib/supabase/edgeClient';

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
  const user = useUser();
  const session = useSession();
  const [loading, setLoading] = useState(true);
  const [preloadError, setPreloadError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const lastFetchRef = useRef(0);
  let globalFetchCount = 0;
  const hasFetched = useRef(false);

  const retry = () => setRetryCount((c) => c + 1);

  useEffect(() => {
    if (!user || !session) {
      setLoading(false);
      setPreloadError('You must be logged in to view your GTM data.');
      setDashboardData(null);
      hasFetched.current = false;
      console.warn('[DataPreloadProvider] No user or session. user:', user, 'session:', session);
      return;
    }
    if (hasFetched.current && retryCount === 0) return;
    hasFetched.current = true;
    let cancelled = false;
    setLoading(true);
    setPreloadError(null);
    setDashboardData(null);

    const fetchAll = async () => {
      const now = Date.now();
      if (typeof user.id !== 'string' || !user.id) {
        console.error('[DataPreloadProvider] Blocked fetch: invalid user', { user });
        return;
      }
      if (now - lastFetchRef.current < 1000) {
        console.warn('[DataPreloadProvider] Blocked fetch: too frequent');
        return;
      }
      lastFetchRef.current = now;
      globalFetchCount++;
      console.log(`[DataPreloadProvider] Fetch #${globalFetchCount} for user`, { user, stack: new Error().stack });
      console.log('[DataPreloadProvider] Fetching dashboard data for user', { user });
      try {
        const [companyAnalyzer, playbooks] = await Promise.all([
          getCompanyAnalysis({ userId: user.id }),
          supabase.from('gtm_playbooks').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
        ]);
        if (cancelled) return;
        const normalize = (arr: any[] = []) => arr.map((r: any) => {
          const name = r.companyName || r.company_name || r.companyname || '';
          return {
            ...r,
            companyName: name,
            company_name: name,
            companyname: name,
            companyUrl: r.companyUrl || r.company_url || r.url || r.websiteUrl || r.website || '',
            createdAt: r.createdAt || r.created_at || '',
          };
        });
        const data: DashboardData = {
          companyAnalyzer: companyAnalyzer,
          icps: [], // ICPs are now embedded in company_analyzer_outputs_unrestricted
          playbooks: playbooks.data || [],
          salesintel: [],
        };
        setCache('companyanalyzer_reports', data.companyAnalyzer);
        setCache('yourwork_analyze', data.companyAnalyzer);
        setCache('icp_playbooks', data.playbooks);
        setCache('yourwork_gtm', data.playbooks);
        console.log('[DataPreloadProvider] companyAnalyzer:', data.companyAnalyzer);
        console.log('[DataPreloadProvider] playbooks:', data.playbooks);
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
  }, [user, session, retryCount]);

  return (
    <DataPreloadContext.Provider value={{ loading, preloadError, data: dashboardData, retry }}>
      {preloadError && (
        <div className="w-full bg-red-100 text-red-700 text-center py-2">{preloadError}</div>
      )}
      {children}
    </DataPreloadContext.Provider>
  );
}; 