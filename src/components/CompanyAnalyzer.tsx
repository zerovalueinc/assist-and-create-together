import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Building, Users, TrendingUp, Target, AlertTriangle, MapPin } from "lucide-react";
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

  const handleDeleteReport = async (id: string) => {
    const prevReports = reports;
    setReports(reports.filter(r => r.id !== id));
    if (selectedReportId === id) {
      setAnalysis(null);
      setSelectedReportId(null);
    }
    const { error } = await supabase.from('company_analyzer_outputs_unrestricted').delete().eq('id', id);
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
        // Normalize company name for pill
        const llm = report.llm_output ? JSON.parse(report.llm_output) : report;
        const name = llm.companyName || llm.company_name || llm.companyname || 'Untitled';
        return (
          <Button
            key={report.id}
            variant={selectedReportId === report.id ? 'default' : 'outline'}
            onClick={() => {
              setSelectedReportId(report.id);
              setAnalysis({ ...report, companyName: name, company_name: name, companyname: name });
            }}
            className="flex items-center gap-2 px-3 py-1 text-sm"
            size="sm"
          >
            <img src={`https://www.google.com/s2/favicons?domain=${llm.companyUrl || llm.website || ''}`} alt="favicon" className="w-4 h-4 mr-1" onError={e => { e.currentTarget.src = '/favicon.ico'; }} />
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
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                          <p className="font-medium">{name}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Industry</label>
                          <p className="font-medium">{llm.companyProfile?.industry || llm.industry || 'N/A'}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Company Size</label>
                          <p className="font-medium">{llm.companyProfile?.companySize || llm.company_size || 'N/A'}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Revenue Range</label>
                          <p className="font-medium">{llm.companyProfile?.revenueRange || llm.revenue_range || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Location</label>
                          <p className="font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {llm.location || 'N/A'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Website</label>
                          <p className="font-medium">
                            <a href={llm.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {llm.website}
                            </a>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Decision Makers */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Decision Makers
                      </CardTitle>
                      <CardDescription>
                        Key roles and decision makers identified through Phase 1 research
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {toArray(llm.decisionMakers || llm.decision_makers).length > 0 ? (
                          toArray(llm.decisionMakers || llm.decision_makers).map((role, index) => (
                            <Badge key={index} variant="secondary" className="text-sm">
                              {role}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No decision makers identified</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pain Points */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Pain Points
                      </CardTitle>
                      <CardDescription>
                        Challenges identified through Phase 4 technology analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {toArray(llm.painPoints || llm.pain_points).length > 0 ? (
                          toArray(llm.painPoints || llm.pain_points).map((pain, index) => (
                            <Badge key={index} variant="destructive" className="text-sm">
                              {pain}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No pain points identified</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Technologies */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Technology Stack
                      </CardTitle>
                      <CardDescription>
                        Technologies analyzed in Phase 4 research
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {toArray(llm.technologies).length > 0 ? (
                          toArray(llm.technologies).map((tech, index) => (
                            <Badge key={index} variant="outline" className="text-sm">
                              {tech}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No technologies identified</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Market Intelligence */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Market Intelligence
                      </CardTitle>
                      <CardDescription>
                        Insights from Phase 2 & 3 competitive analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Market Trends</h4>
                        <div className="flex flex-wrap gap-2">
                          {toArray(llm.marketTrends || llm.market_trends).length > 0 ? (
                            toArray(llm.marketTrends || llm.market_trends).map((trend, index) => (
                              <Badge key={index} variant="secondary" className="text-sm">
                                {trend}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-muted-foreground">No market trends identified</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Competitive Landscape</h4>
                        <div className="flex flex-wrap gap-2">
                          {toArray(llm.competitiveLandscape || llm.competitive_landscape).length > 0 ? (
                            toArray(llm.competitiveLandscape || llm.competitive_landscape).map((competitor, index) => (
                              <Badge key={index} variant="outline" className="text-sm">
                                {competitor}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-muted-foreground">No competitors identified</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Go-to-Market Strategy */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Go-to-Market Strategy
                      </CardTitle>
                      <CardDescription>
                        Strategic insights from Phase 5 synthesis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">
                        {llm.goToMarketStrategy || llm.go_to_market_strategy || 'No strategy identified'}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Research Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>5-Phase Research Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">
                        {llm.research_summary || llm.researchSummary || 'Multi-phase analysis completed with comprehensive company intelligence'}
                      </p>
                      {/* Optionally show full LLM JSON for debugging */}
                      {/* <pre className="mt-4 text-xs bg-slate-100 p-2 rounded overflow-x-auto">{JSON.stringify(llm, null, 2)}</pre> */}
                    </CardContent>
                  </Card>
                </div>
              );
            })()
          ) : selectedReportId ? (
            <div className="text-center text-muted-foreground py-8">Could not load report details. Please try another report.</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default CompanyAnalyzer;
