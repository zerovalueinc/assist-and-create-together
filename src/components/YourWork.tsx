import * as React from "react";
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Trash2, Eye, ChevronDown, ChevronRight } from 'lucide-react';
import { useUser, useSession } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabaseClient';
import { capitalizeFirstLetter, getCache, setCache } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { useCompany } from '@/context/CompanyContext';
import { getCompanyAnalysis } from '@/lib/supabase/edgeClient';
import { CompanyReportCard } from './ui/CompanyReportCard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || window.location.origin;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

export default function YourWork() {
  const user = useUser();
  const session = useSession();
  const [analyzeWork, setAnalyzeWork] = useState<unknown[]>([]);
  const [gtmWork, setGtmWork] = useState<unknown[]>([]);
  const [analyzeLoading, setAnalyzeLoading] = useState(true);
  const [gtmLoading, setGtmLoading] = useState(true);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [gtmError, setGtmError] = useState<string | null>(null);
  const [analyzeExpanded, setAnalyzeExpanded] = useState(true);
  const [gtmExpanded, setGtmExpanded] = useState(true);
  const [reports, setReports] = useState<unknown[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<unknown | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    getCompanyAnalysis({ userId: session.user.id }).then((data) => {
      setAnalyzeWork(data);
    }).catch(() => {
      setAnalyzeError('Failed to load Company Analyzer reports.');
    }).finally(() => {
      setAnalyzeLoading(false);
    });
  }, [session?.user?.id]);

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
      } catch (err: unknown) {
        if (!cancelled) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load GTM playbooks.';
          setGtmError(errorMessage);
          console.error('Error fetching GTM playbooks:', err);
        }
      }
    };
    fetchGTMPlaybooks();
    return () => { cancelled = true; };
  }, [user?.id]);

  const fetchReports = async () => {
    if (!user) return;
    
    try {
      const { data: reports, error } = await supabase
        .from('company_analyzer_outputs_unrestricted')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        return;
      }

      setReports(reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

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
                  {analyzeWork.map((report) => (
                    <CompanyReportCard
                      key={(report as Record<string, unknown>).id as string}
                      report={report}
                      selected={selectedReportId === (report as Record<string, unknown>).id as string}
                      onClick={() => {
                        setSelectedReportId((report as Record<string, unknown>).id as string);
                        setSelectedCompany(report);
                        // Add any other selection logic as needed
                      }}
                    />
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
                      key={(item as Record<string, unknown>).id as string}
                      variant="outline"
                      className="flex items-center gap-2 px-3 py-1 text-sm"
                      size="sm"
                    >
                      <img src={`https://www.google.com/s2/favicons?domain=${(item as Record<string, unknown>).companyUrl as string || (item as Record<string, unknown>).url as string || ''}`} alt="favicon" className="w-4 h-4 mr-1" onError={e => { e.currentTarget.src = '/favicon.ico'; }} />
                      {(item as Record<string, unknown>).companyName as string || 'Untitled GTM Playbook'}
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
