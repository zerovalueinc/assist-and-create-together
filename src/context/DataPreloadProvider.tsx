import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCache, setCache } from '@/lib/utils';
import { useAuth } from './AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface DataPreloadContextType {
  loading: boolean;
  preloadError: string | null;
}

const DataPreloadContext = createContext<DataPreloadContextType>({ loading: true, preloadError: null });

export const useDataPreload = () => useContext(DataPreloadContext);

export const DataPreloadProvider = ({ children }: { children: ReactNode }) => {
  const { user, session, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [preloadError, setPreloadError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !session) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setPreloadError(null);

    // Fetch all dashboard data in parallel
    const fetchAll = async () => {
      try {
        const [companyAnalyzer, icps, playbooks, salesintel] = await Promise.all([
          supabase.from('company_analyzer_outputs_unrestricted').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
          supabase.from('icps').select('*').eq('user_id', Number(user.id)).order('created_at', { ascending: false }),
          supabase.from('saved_reports').select('*').eq('user_id', Number(user.id)).order('created_at', { ascending: false }),
          supabase.from('saved_reports').select('*').eq('user_id', Number(user.id)).order('created_at', { ascending: false })
        ]);
        if (cancelled) return;
        // Normalize and cache
        const normalize = (arr: any[] = []) => arr.map((r: any) => ({
          ...r,
          companyName: r.companyName || r.company_name || '',
          companyUrl: r.companyUrl || r.url || r.websiteUrl || r.website || '',
          createdAt: r.createdAt || r.created_at || '',
        }));
        setCache('companyanalyzer_reports', normalize(companyAnalyzer.data));
        setCache('yourwork_analyze', normalize(companyAnalyzer.data));
        setCache('icp_icps', icps.data || []);
        setCache('icp_playbooks', playbooks.data || []);
        setCache('salesintel_reports', salesintel.data || []);
        setCache('yourwork_gtm', [...(icps.data || []), ...(playbooks.data || [])]);
      } catch (err: any) {
        if (!cancelled) setPreloadError(err.message || 'Failed to preload dashboard data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAll();
    return () => { cancelled = true; };
  }, [user, session, authLoading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-32 h-32" />
      </div>
    );
  }

  return (
    <DataPreloadContext.Provider value={{ loading, preloadError }}>
      {children}
    </DataPreloadContext.Provider>
  );
}; 