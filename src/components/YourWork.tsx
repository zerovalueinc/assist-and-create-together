import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Trash2, Eye, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin;

export default function YourWork() {
  const { token } = useAuth();
  const [analyzeWork, setAnalyzeWork] = useState<any[]>([]);
  const [gtmWork, setGtmWork] = useState<any[]>([]);
  const [analyzeLoading, setAnalyzeLoading] = useState(true);
  const [gtmLoading, setGtmLoading] = useState(true);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [gtmError, setGtmError] = useState<string | null>(null);
  const [analyzeExpanded, setAnalyzeExpanded] = useState(true);
  const [gtmExpanded, setGtmExpanded] = useState(true);

  useEffect(() => {
    const fetchCompanyAnalyzer = async () => {
      setAnalyzeLoading(true);
      setAnalyzeError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/company-analyze/reports`, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
        if (!res.ok) throw new Error('Failed to fetch Company Analyzer reports');
        const data = await res.json();
        setAnalyzeWork(data.reports || []);
      } catch (err) {
        setAnalyzeError('Failed to load Company Analyzer reports.');
      } finally {
        setAnalyzeLoading(false);
      }
    };
    const fetchGTM = async () => {
      setGtmLoading(true);
      setGtmError(null);
      try {
        const [icpRes, playbookRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/icp/reports`, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }),
          fetch(`${API_BASE_URL}/api/icp/playbooks`, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }),
        ]);
        const icps = icpRes.ok ? (await icpRes.json()).icps || [] : [];
        const playbooks = playbookRes.ok ? (await playbookRes.json()).playbooks || [] : [];
        // Merge and dedupe by id (if needed)
        const allGTM = [...icps, ...playbooks].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        setGtmWork(allGTM);
      } catch (err) {
        setGtmError('Failed to load GTM Generator reports.');
      } finally {
        setGtmLoading(false);
      }
    };
    if (token) {
      fetchCompanyAnalyzer();
      fetchGTM();
    }
  }, [token]);

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
              {analyzeLoading ? (
                <div className="py-8 text-center text-slate-500">Loading Company Analyzer reports...</div>
              ) : analyzeError ? (
                <div className="py-8 text-center text-red-500">{analyzeError}</div>
              ) : analyzeWork.length === 0 ? (
                <div className="py-8 text-center text-slate-400">No Company Analyzer reports yet.<br/>Run an analysis to see it here!</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {analyzeWork.map((item) => (
                    <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between bg-white rounded-lg border px-4 py-3 hover:shadow-sm transition">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-lg text-slate-900">{item.companyName || item.company || item.title || item.companyUrl || 'Untitled'}</span>
                        <span className="text-xs text-slate-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                      <div className="flex gap-2 mt-2 md:mt-0">
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <Eye className="h-4 w-4" /> View
                        </Button>
                        <Button size="sm" variant="destructive" className="flex items-center gap-1">
                          <Trash2 className="h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </div>
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
              {gtmLoading ? (
                <div className="py-8 text-center text-slate-500">Loading GTM Playbooks...</div>
              ) : gtmError ? (
                <div className="py-8 text-center text-red-500">{gtmError}</div>
              ) : gtmWork.length === 0 ? (
                <div className="py-8 text-center text-slate-400">No GTM Playbooks yet.<br/>Generate a GTM Playbook to see it here!</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {gtmWork.map((item) => (
                    <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between bg-white rounded-lg border px-4 py-3 hover:shadow-sm transition">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-lg text-slate-900">{item.companyName || item.company || item.title || item.companyUrl || 'Untitled GTM Playbook'}</span>
                        <span className="text-xs text-slate-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                      <div className="flex gap-2 mt-2 md:mt-0">
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <Eye className="h-4 w-4" /> View
                        </Button>
                        <Button size="sm" variant="destructive" className="flex items-center gap-1">
                          <Trash2 className="h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </div>
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