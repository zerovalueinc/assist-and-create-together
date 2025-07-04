import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Building, Users, TrendingUp, Target, AlertTriangle, MapPin, Cpu, Rocket, FileText, BarChart2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCompany } from "@/context/CompanyContext";
import { useUser, useSession } from '@supabase/auth-helpers-react';
import { supabase } from '../lib/supabase'; // See README for global pattern
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';
import { capitalizeFirstLetter, getCache, setCache } from '../lib/utils';
import { Skeleton } from './ui/skeleton';
import { useDataPreload } from '@/context/DataPreloadProvider';

function normalizeUrl(input: string): string {
  let url = input.trim().toLowerCase();
  url = url.replace(/^https?:\/\//, ''); // Remove protocol
  url = url.replace(/^www\./, ''); // Remove www.
  url = url.replace(/\/$/, ''); // Remove trailing slash
  return `https://${url}`;
}

// Helper to coerce a value to an array (supports comma-separated strings)
function toArray(val: any): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

const CompanyAnalyzer = () => {
  const [url, setUrl] = useState('');
  const { toast } = useToast();
  const { setResearch } = useCompany();
  const user = useUser();
  const session = useSession();
  const { data: preloadData, loading: preloadLoading, retry: refreshData } = useDataPreload();

  // Use preloaded reports or fallback to cache
  let initialReports = preloadData?.companyAnalyzer || [];
  if (!initialReports.length) {
    initialReports = getCache('yourwork_analyze', []);
  }
  const [reports, setReports] = useState(initialReports);
  const [analysis, setAnalysis] = useState(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Reload reports when preloadData changes (e.g., on tab switch)
  useEffect(() => {
    let newReports = preloadData?.companyAnalyzer || [];
    if (!newReports.length) {
      newReports = getCache('yourwork_analyze', []);
    }
    setReports(newReports);
  }, [preloadData]);

  useEffect(() => {
    if (!user?.id) return;
    setIsAnalyzing(false);
    setAnalysis(null);
    setSelectedReportId(null);
    setReports([]);
    // Fetch all saved reports for the user
    supabase
      .from('company_analysis_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (data) {
          setReports(data);
          // Optionally, set the first report as selected
          if (data.length > 0) {
            setSelectedReportId(data[0].id);
            setAnalysis(data[0]);
          }
        }
      });
  }, [user?.id]);

  const handleDeleteReport = async (id: string) => {
    const prevReports = reports;
    setReports(reports.filter(r => r.id !== id));
    if (selectedReportId === id) {
      setAnalysis(null);
      setSelectedReportId(null);
    }
    const { error } = await supabase.from('company_analysis_reports').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete Failed', description: error.message, variant: 'destructive' });
      setReports(prevReports); // Rollback UI
    } else {
      toast({ title: 'Report Deleted', description: 'The report was deleted successfully.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    console.log('[CompanyAnalyzer] handleSubmit triggered', { url, user, session });
    if (!session?.access_token) {
      toast({
        title: "Auth Error",
        description: "No access token found. Please log in again.",
        variant: "destructive",
      });
      console.error('[CompanyAnalyzer] No access token found', { user, session });
      return;
    }
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a company URL",
        variant: "destructive",
      });
      return;
    }
    const normalizedUrl = normalizeUrl(url);
    setAnalysis(null);
    setIsAnalyzing(true);
    try {
      console.log('=== Starting Company Analysis ===');
      console.log('URL:', normalizedUrl);
      console.log('User ID:', user?.id);
      console.log('Session token available:', !!session?.access_token);
      const response = await fetch('/api/company-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ url: normalizedUrl }),
      });
      if (!response.ok) {
        let errorMsg = `LLM failed: ${response.status}`;
        try {
          const errJson = await response.json();
          errorMsg = errJson.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      const data = await response.json();
      const error = !response.ok ? { message: data.error || 'Analysis request failed' } : null;

      console.log('=== Supabase Function Response ===');
      console.log('Data:', data);
      console.log('Error:', error);

      if (error) {
        console.error('Supabase function error details:', error);
        throw new Error(error.message || 'Analysis request failed');
      }

      if (data?.success && data?.output) {
        console.log('Analysis successful:', data.output);
        setAnalysis(data.output);
        setResearch({
          companyAnalysis: data.output,
          isCached: false,
          timestamp: new Date().toISOString()
        });
        // Prepend new report to reports and update pills/inline
        setReports(prev => [data.output, ...prev]);
        setSelectedReportId(data.output.id || null);
        // Refresh the DataPreloadProvider to update all components
        refreshData();
        toast({
          title: "Analysis Complete",
          description: `Successfully analyzed ${data.output.company_name || data.output.companyName}`,
        });
      } else {
        console.error('Analysis failed - no success flag or analysis data');
        throw new Error(data?.error || 'Analysis failed - no data returned');
      }
    } catch (error: any) {
      console.error('=== Analysis Error ===');
      console.error('Error type:', typeof error);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze company. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Pills selector for reports
  const renderReportPills = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      {reports.map((report) => {
        const llm = report.llm_output ? JSON.parse(report.llm_output) : report;
        const name = llm.companyName || llm.company_name || llm.companyname || 'Untitled';
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${llm.website || llm.companyUrl || report.company_url || ''}`;
        return (
          <Button
            key={report.id}
            variant={selectedReportId === report.id ? 'default' : 'outline'}
            onClick={() => {
              setSelectedReportId(report.id);
              setAnalysis(report);
            }}
            className="flex items-center gap-2 px-3 py-1 text-sm"
            size="sm"
          >
            <img src={faviconUrl} alt="favicon" className="w-4 h-4 mr-1" onError={e => { e.currentTarget.src = '/favicon.ico'; }} />
            {name}
            {selectedReportId === report.id && <CheckCircle className="h-3 w-3 ml-1" />}
          </Button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Company Analysis
          </CardTitle>
          <CardDescription>
            Enter a company URL to generate comprehensive business intelligence using our 5-phase research process
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length > 0 && renderReportPills()}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="url" className="text-sm font-medium">
                Company URL
              </label>
              <Input
                id="url"
                type="text"
                placeholder="e.g., outbound.ai, notion.so, zapier.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isAnalyzing}
                className="text-base"
                autoComplete="off"
                aria-label="Company URL"
              />
            </div>
            <Button type="submit" disabled={isAnalyzing || !url.trim()} className="w-full">
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : user ? (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze Company
                </>
              ) : (
                <>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Please log in
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {reports.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">No company analysis reports found. Run an analysis first.</div>
      ) : (
        <div className="space-y-6">
          {/* Details */}
          {analysis && selectedReportId && typeof analysis === 'object' ? (
            (() => {
              const llm = analysis.llm_output ? JSON.parse(analysis.llm_output) : analysis;
              const name = llm.companyName || llm.company_name || llm.companyname || 'Untitled';
              if (!name) return <div className="text-center text-muted-foreground py-8">Could not load report details. Please try another report.</div>;
              return (
                <div className="space-y-6">
                  {/* Company Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Company Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Company Name</span>
                          <p className="text-lg font-semibold">{name}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Website</span>
                          <p className="text-sm">{analysis.company_url || llm.website || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Location</span>
                          <p className="text-sm">{analysis.location || llm.location || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Industry</span>
                          <p className="text-sm">{llm.industry || llm.companyProfile?.industry || llm.company_profile?.industry || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Company Size</span>
                          <p className="text-sm">{llm.companyProfile?.companySize || llm.company_profile?.companySize || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Revenue Range</span>
                          <p className="text-sm">{llm.companyProfile?.revenueRange || llm.company_profile?.revenueRange || 'N/A'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Technologies */}
                  {llm.technologies && llm.technologies.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Cpu className="h-5 w-5" />
                          Technologies
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {llm.technologies.map((tech: string, i: number) => (
                            <Badge key={i} variant="outline">{tech}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Decision Makers */}
                  {llm.decisionMakers && llm.decisionMakers.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Decision Makers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5">
                          {llm.decisionMakers.map((dm: string, i: number) => <li key={i}>{dm}</li>)}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Pain Points */}
                  {llm.painPoints && llm.painPoints.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Pain Points</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5">
                          {llm.painPoints.map((pp: string, i: number) => <li key={i}>{pp}</li>)}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Market Trends */}
                  {llm.marketTrends && llm.marketTrends.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Market Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5">
                          {llm.marketTrends.map((mt: string, i: number) => <li key={i}>{mt}</li>)}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Competitive Landscape */}
                  {llm.competitiveLandscape && llm.competitiveLandscape.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Competitive Landscape</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5">
                          {llm.competitiveLandscape.map((cl: string, i: number) => <li key={i}>{cl}</li>)}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Go-to-Market Strategy */}
                  {llm.goToMarketStrategy && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Go-to-Market Strategy</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{llm.goToMarketStrategy}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Research Summary */}
                  {llm.researchSummary && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Research Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{llm.researchSummary}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Select a report to view details
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanyAnalyzer;
