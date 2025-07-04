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
import { getCompanyAnalysis } from '../lib/supabase/edgeClient';
import { CompanyReportCard } from './ui/CompanyReportCard';
import ICPProfileDisplay from './ui/ICPProfileDisplay';

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

// Normalization function for LLM output
function normalizeLLMOutput(llm: any) {
  if (!llm) return {};
  // If already in the expected format, return as is
  if (llm.icp || llm.ibp) return llm;
  // If using the new icp_analysis format, map fields
  if (llm.icp_analysis) {
    return {
      icp: {
        painPoints: llm.icp_analysis.pain_points,
        buyerPersonas: llm.icp_analysis.buyer_personas,
        buyingTriggers: llm.icp_analysis.buying_triggers,
        valuePropositions: llm.icp_analysis.value_propositions,
        techStack: llm.icp_analysis.tech_stack_alignment,
        apolloSearchParameters: llm.icp_analysis.apollo_search_parameters,
        targetingRecommendations: llm.icp_analysis.targeting_recommendations,
        targetCompanyCharacteristics: llm.icp_analysis.target_company_characteristics,
      },
      // Add other mappings as needed
    };
  }
  return llm;
}

// Helper to safely render any field
function renderField(field: any) {
  if (field == null) return 'N/A';
  if (typeof field === 'string') return field;
  if (Array.isArray(field)) return field.join(', ');
  if (typeof field === 'object') return JSON.stringify(field);
  return String(field);
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
    getCompanyAnalysis({ userId: user.id }).then((data) => {
      setReports(data);
      if (data.length > 0) {
        setSelectedReportId(data[0].id);
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
      {reports.map((report) => (
        <CompanyReportCard
          key={report.id}
          report={report}
          selected={selectedReportId === report.id}
          onClick={() => {
            setSelectedReportId(report.id);
            setAnalysis(report);
          }}
        />
      ))}
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
              // --- Use llm_output as the single source of truth ---
              let llm = analysis.llm_output ? (typeof analysis.llm_output === 'string' ? JSON.parse(analysis.llm_output) : analysis.llm_output) : {};
              llm = normalizeLLMOutput(llm);
              // --- End llm_output normalization ---

              const name = llm.companyName || llm.company_name || llm.companyname || 'Untitled';
              if (!name) return <div className="text-center text-muted-foreground py-8">Could not load report details. Please try another report.</div>;
              return (
                <div className="space-y-6">
                  {/* IBP Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Ideal Business Profile (IBP)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><span className="text-sm font-medium text-muted-foreground">Industry</span><p className="text-sm">{renderField(llm.ibp?.industry)}</p></div>
                        <div><span className="text-sm font-medium text-muted-foreground">Segment</span><p className="text-sm">{renderField(llm.ibp?.segment)}</p></div>
                        <div><span className="text-sm font-medium text-muted-foreground">Company Size</span><p className="text-sm">{renderField(llm.ibp?.companySize)}</p></div>
                        <div><span className="text-sm font-medium text-muted-foreground">Revenue Range</span><p className="text-sm">{renderField(llm.ibp?.revenueRange)}</p></div>
                        <div><span className="text-sm font-medium text-muted-foreground">Geography</span><p className="text-sm">{renderField(llm.ibp?.geography)}</p></div>
                        <div><span className="text-sm font-medium text-muted-foreground">Business Model</span><p className="text-sm">{renderField(llm.ibp?.businessModel)}</p></div>
                        <div><span className="text-sm font-medium text-muted-foreground">Sales Motion</span><p className="text-sm">{renderField(llm.ibp?.salesMotion)}</p></div>
                        <div><span className="text-sm font-medium text-muted-foreground">Go-To-Market Model</span><p className="text-sm">{renderField(llm.ibp?.goToMarketModel)}</p></div>
                        <div className="md:col-span-2"><span className="text-sm font-medium text-muted-foreground">Tech Stack</span><p className="text-sm">{renderField(llm.ibp?.techStack)}</p></div>
                        <div className="md:col-span-2"><span className="text-sm font-medium text-muted-foreground">Fit Signals</span><p className="text-sm">{renderField(llm.ibp?.fitSignals)}</p></div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* ICP Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Ideal Customer Profile (ICP)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><span className="text-sm font-medium text-muted-foreground">Buyer Titles</span><p className="text-sm">{renderField(llm.icp?.buyerTitles)}</p></div>
                        <div><span className="text-sm font-medium text-muted-foreground">Department</span><p className="text-sm">{renderField(llm.icp?.department)}</p></div>
                        <div><span className="text-sm font-medium text-muted-foreground">Seniority Level</span><p className="text-sm">{renderField(llm.icp?.seniorityLevel)}</p></div>
                        <div><span className="text-sm font-medium text-muted-foreground">Key Responsibilities</span><p className="text-sm">{renderField(llm.icp?.keyResponsibilities)}</p></div>
                        <div><span className="text-sm font-medium text-muted-foreground">Pain Points</span><p className="text-sm">{renderField(llm.icp?.painPoints)}</p></div>
                        <div><span className="text-sm font-medium text-muted-foreground">Buying Triggers</span><p className="text-sm">{renderField(llm.icp?.buyingTriggers)}</p></div>
                        <div><span className="text-sm font-medium text-muted-foreground">KPIs</span><p className="text-sm">{renderField(llm.icp?.KPIs)}</p></div>
                        <div><span className="text-sm font-medium text-muted-foreground">Tech Stack</span><p className="text-sm">{renderField(llm.icp?.techStack)}</p></div>
                        <div><span className="text-sm font-medium text-muted-foreground">Decision Process</span><p className="text-sm">{renderField(llm.icp?.decisionProcess)}</p></div>
                        <div><span className="text-sm font-medium text-muted-foreground">Common Objections</span><p className="text-sm">{renderField(llm.icp?.commonObjections)}</p></div>
                        <div><span className="text-sm font-medium text-muted-foreground">Budget Range</span><p className="text-sm">{renderField(llm.icp?.budgetRange)}</p></div>
                        <div><span className="text-sm font-medium text-muted-foreground">Emotional Drivers</span><p className="text-sm">{renderField(llm.icp?.emotionalDrivers)}</p></div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* GTM Insights Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Go-To-Market Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{renderField(llm.goToMarketInsights)}</p>
                    </CardContent>
                  </Card>

                  {/* Market Trends Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Market Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(llm.marketTrends && llm.marketTrends.length > 0) ? (
                        <ul className="list-disc pl-5">{llm.marketTrends.map((mt: string, i: number) => <li key={i}>{mt}</li>)}</ul>
                      ) : (
                        <span className="text-sm">No data available</span>
                      )}
                    </CardContent>
                  </Card>

                  {/* Competitive Landscape Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Competitive Landscape</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(llm.competitiveLandscape && llm.competitiveLandscape.length > 0) ? (
                        <ul className="list-disc pl-5">{llm.competitiveLandscape.map((cl: string, i: number) => <li key={i}>{cl}</li>)}</ul>
                      ) : (
                        <span className="text-sm">No data available</span>
                      )}
                    </CardContent>
                  </Card>

                  {/* Decision Makers Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Decision Makers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(llm.decisionMakers && llm.decisionMakers.length > 0) ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr>
                                <th className="text-left font-medium pr-4">Name</th>
                                <th className="text-left font-medium pr-4">Title</th>
                                <th className="text-left font-medium">LinkedIn</th>
                              </tr>
                            </thead>
                            <tbody>
                              {llm.decisionMakers.map((dm: any, i: number) => (
                                <tr key={i} className="border-t">
                                  <td className="pr-4">{renderField(dm.name)}</td>
                                  <td className="pr-4">{renderField(dm.title)}</td>
                                  <td>{dm.linkedin ? <a href={dm.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">LinkedIn</a> : 'N/A'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <span className="text-sm">No data available</span>
                      )}
                    </CardContent>
                  </Card>

                  {/* Research Summary Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Research Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{renderField(llm.researchSummary)}</p>
                    </CardContent>
                  </Card>
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
