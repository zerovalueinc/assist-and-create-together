import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Trash2, Eye, ChevronDown, ChevronRight } from 'lucide-react';
import { useUser, useSession } from '@supabase/auth-helpers-react';
import { supabase } from '../lib/supabase'; // See README for global pattern
import { capitalizeFirstLetter, getCache, setCache } from '../lib/utils';
import { Skeleton } from './ui/skeleton';
import { useCompany } from '../context/CompanyContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin;

export default function YourWork() {
  const user = useUser();
  const session = useSession();
  const [analyzeWork, setAnalyzeWork] = useState<any[]>([]);
  const [gtmWork, setGtmWork] = useState<any[]>([]);
  const [analyzeLoading, setAnalyzeLoading] = useState(true);
  const [gtmLoading, setGtmLoading] = useState(true);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [gtmError, setGtmError] = useState<string | null>(null);
  const [analyzeExpanded, setAnalyzeExpanded] = useState(true);
  const [gtmExpanded, setGtmExpanded] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    // Show cached data instantly
    const cachedAnalyze = getCache<any[]>('yourwork_analyze', []);
    const cachedGTM = getCache<any[]>('yourwork_gtm', []);
    if (cachedAnalyze.length > 0) setAnalyzeWork(cachedAnalyze);
    if (cachedGTM.length > 0) setGtmWork(cachedGTM);
    setAnalyzeLoading(false);
    setGtmLoading(false);

    let cancelled = false;
    const fetchCompanyAnalyzer = async () => {
      setAnalyzeError(null);
      try {
        const { data, error } = await supabase
          .from('company_analyzer_outputs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        const normalized = (data || []).map((r: any) => ({
          ...r,
          companyName: capitalizeFirstLetter(r.companyName || r.company_name || ''),
          companyUrl: r.companyUrl || r.url || r.websiteUrl || r.website || '',
          createdAt: r.createdAt || r.created_at || '',
        }));
        setAnalyzeWork(normalized);
        setCache('yourwork_analyze', normalized);
      } catch (err: any) {
        if (!cancelled) {
          setAnalyzeError(err.message || 'Failed to load Company Analyzer reports.');
          console.error('Error fetching company analyzer reports:', err);
        }
      }
    };
    fetchCompanyAnalyzer();
    return () => { cancelled = true; };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    const fetchGTMPlaybooks = async () => {
      setGtmError(null);
      try {
        const { data, error } = await supabase
          .from('gtm_playbooks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setGtmWork(data || []);
        setCache('yourwork_gtm', data || []);
      } catch (err: any) {
        if (!cancelled) {
          setGtmError(err.message || 'Failed to load GTM playbooks.');
          console.error('Error fetching GTM playbooks:', err);
        }
      }
    };
    fetchGTMPlaybooks();
    return () => { cancelled = true; };
  }, [user?.id]);

  if (!user) {
    return <div className="min-h-[80vh] w-full flex flex-col items-center justify-center bg-slate-50 py-12"><span>Please log in to view your work.</span></div>;
  }

  return (
    <div className="min-h-[80vh] w-full flex flex-col items-center justify-start bg-slate-50 py-12">
      <div className="w-full max-w-2xl flex flex-col gap-8">
        <Card className="shadow-lg border-2 border-slate-100">
          <CardHeader
            className="flex flex-row items-center gap-4 pb-2 cursor-pointer select-none transition hover:bg-slate-100 rounded-t-lg px-6 py-4"
            onClick={() => setAnalyzeExpanded((prev) => !prev)}
            tabIndex={0}
            role="button"
            aria-expanded={analyzeExpanded}
          >
            {analyzeExpanded ? (
              <ChevronDown className="h-6 w-6 text-blue-600 transition" />
            ) : (
              <ChevronRight className="h-6 w-6 text-blue-600 transition" />
            )}
            <FolderOpen className="h-7 w-7 text-blue-600" />
            <CardTitle className="text-2xl font-extrabold tracking-tight text-slate-900">Company Analyzer</CardTitle>
          </CardHeader>
          {analyzeExpanded && (
            <CardContent className="px-6 pb-6 pt-2">
              {analyzeError ? (
                <div className="py-8 text-center text-red-500">{analyzeError}</div>
              ) : analyzeWork.length === 0 ? (
                <div className="py-8 text-center text-slate-500">No company analysis reports found. Run an analysis first.</div>
              ) : (
                <div className="flex flex-wrap gap-2 mb-4">
                  {analyzeWork.map((item) => (
                    <Button
                      key={item.id}
                      variant="outline"
                      className="flex items-center gap-2 px-3 py-1 text-sm"
                      size="sm"
                    >
                      <img src={`https://www.google.com/s2/favicons?domain=${item.companyUrl || item.url || ''}`} alt="favicon" className="w-4 h-4 mr-1" onError={e => { e.currentTarget.src = '/favicon.ico'; }} />
                      {item.companyName || 'Untitled'}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>
        <Card className="shadow-lg border-2 border-slate-100">
          <CardHeader
            className="flex flex-row items-center gap-4 pb-2 cursor-pointer select-none transition hover:bg-slate-100 rounded-t-lg px-6 py-4"
            onClick={() => setGtmExpanded((prev) => !prev)}
            tabIndex={0}
            role="button"
            aria-expanded={gtmExpanded}
          >
            {gtmExpanded ? (
              <ChevronDown className="h-6 w-6 text-green-600 transition" />
            ) : (
              <ChevronRight className="h-6 w-6 text-green-600 transition" />
            )}
            <FolderOpen className="h-7 w-7 text-green-600" />
            <CardTitle className="text-2xl font-extrabold tracking-tight text-slate-900">GTM Generator</CardTitle>
          </CardHeader>
          {gtmExpanded && (
            <CardContent className="px-6 pb-6 pt-2">
              {gtmError ? (
                <div className="py-8 text-center text-red-500">{gtmError}</div>
              ) : gtmWork.length === 0 ? (
                <div className="py-8 text-center text-slate-500">No GTM or ICP reports found. Generate a playbook or ICP first.</div>
              ) : (
                <div className="flex flex-wrap gap-2 mb-4">
                  {gtmWork.map((item) => (
                    <Button
                      key={item.id}
                      variant="outline"
                      className="flex items-center gap-2 px-3 py-1 text-sm"
                      size="sm"
                    >
                      <img src={`https://www.google.com/s2/favicons?domain=${item.companyUrl || item.url || ''}`} alt="favicon" className="w-4 h-4 mr-1" onError={e => { e.currentTarget.src = '/favicon.ico'; }} />
                      {item.companyName || 'Untitled GTM Playbook'}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
