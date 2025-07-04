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
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Company Name</span>
                          <p className="text-lg font-semibold">{name}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Website</span>
                          <p className="text-sm">{analysis.company_url || llm.companyUrl || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Location</span>
                          <p className="text-sm">{analysis.location || llm.location || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Industry</span>
                          <p className="text-sm">{llm.industry || llm.company_profile?.industry || 'N/A'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Decision Makers */}
                  {analysis.decision_makers && analysis.decision_makers.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Decision Makers
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {analysis.decision_makers.map((maker: string, index: number) => (
                            <Badge key={index} variant="secondary">
                              {maker}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Pain Points */}
                  {analysis.pain_points && analysis.pain_points.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          Pain Points
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {analysis.pain_points.map((point: string, index: number) => (
                            <Badge key={index} variant="destructive">
                              {point}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Technologies */}
                  {analysis.technologies && analysis.technologies.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Cpu className="h-5 w-5" />
                          Technologies
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {analysis.technologies.map((tech: string, index: number) => (
                            <Badge key={index} variant="outline">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Market Trends */}
                  {analysis.market_trends && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Market Trends
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{analysis.market_trends}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Competitive Landscape */}
                  {analysis.competitive_landscape && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart2 className="h-5 w-5" />
                          Competitive Landscape
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{analysis.competitive_landscape}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Go-to-Market Strategy */}
                  {analysis.go_to_market_strategy && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Rocket className="h-5 w-5" />
                          Go-to-Market Strategy
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{analysis.go_to_market_strategy}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Research Summary */}
                  {analysis.research_summary && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Research Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{analysis.research_summary}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* ICP Profile */}
                  {analysis.icp_profile && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          ICP Profile
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {analysis.icp_profile.target_industries && (
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">Target Industries</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {analysis.icp_profile.target_industries.map((industry: string, index: number) => (
                                  <Badge key={index} variant="secondary">
                                    {industry}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {analysis.icp_profile.buyer_personas && (
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">Buyer Personas</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {analysis.icp_profile.buyer_personas.map((persona: any, index: number) => (
                                  <Badge key={index} variant="outline">
                                    {persona.title}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {analysis.icp_profile.messaging_angles && (
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">Messaging Angles</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {analysis.icp_profile.messaging_angles.map((angle: string, index: number) => (
                                  <Badge key={index} variant="default">
                                    {angle}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
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
