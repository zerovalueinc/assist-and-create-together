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
import { getCompanyAnalysis, getCompanyAnalysisById } from '../lib/supabase/edgeClient';
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
        // Handle case where data.output is an array
        let reportObj = data.output;
        if (Array.isArray(data.output)) {
          if (data.output.length > 0) {
            reportObj = data.output[0];
          } else {
            console.warn('[WARN] data.output is an empty array.');
            toast({ title: 'Analysis Error', description: 'No report returned from analysis.', variant: 'destructive' });
            setIsAnalyzing(false);
            return;
          }
        }
        console.log('Analysis successful:', reportObj);
        console.log('[DEBUG] Attempting to fetch fresh report by ID:', reportObj.id, reportObj);
        if (reportObj.id) {
          try {
            const freshReport = await getCompanyAnalysisById(reportObj.id);
            setAnalysis(freshReport);
            setReports(prev => [freshReport, ...prev.filter(r => r.id !== freshReport.id)]);
            setSelectedReportId(freshReport.id || null);
          } catch (fetchErr) {
            console.warn('[WARN] Failed to fetch fresh report by ID, falling back to immediate output:', fetchErr);
            setAnalysis(reportObj);
            setReports(prev => [reportObj, ...prev]);
            setSelectedReportId(reportObj.id || null);
          }
        } else {
          console.warn('[WARN] No ID found on reportObj, using immediate output:', reportObj);
          setAnalysis(reportObj);
          setReports(prev => [reportObj, ...prev]);
          setSelectedReportId(null);
        }
        setResearch({
          companyAnalysis: reportObj,
          isCached: false,
          timestamp: new Date().toISOString()
        });
        // Refresh the DataPreloadProvider to update all components
        refreshData();
        toast({
          title: "Analysis Complete",
          description: `Successfully analyzed ${reportObj.company_name || reportObj.companyName}`,
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
          key={report.id || report.companyUrl || Math.random()}
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

              const name = llm.company_name || llm.companyName || llm.companyname || 'Untitled';
              if (!name) return <div className="text-center text-muted-foreground py-8">Could not load report details. Please try another report.</div>;
              return (
                <div className="space-y-6">
                  {/* Company Overview Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Company Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Company Name</span>
                            <p className="text-lg font-semibold">{renderField(llm.company_name)}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Summary</span>
                            <p className="text-sm">{renderField(llm.summary)}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Industry</span>
                            <p className="text-sm">{renderField(llm.industry)}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Headquarters</span>
                            <p className="text-sm">{renderField(llm.headquarters)}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Founded</span>
                            <p className="text-sm">{renderField(llm.founded)}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Company Type</span>
                            <p className="text-sm">{renderField(llm.company_type)}</p>
                          </div>
                        </div>
                        
                        {/* Size & Financial */}
                        <div className="space-y-4">
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Company Size</span>
                            <p className="text-sm">{renderField(llm.company_size?.employees_range)} ({renderField(llm.company_size?.employee_count)} employees)</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Revenue Range</span>
                            <p className="text-sm">{renderField(llm.revenue_range)}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Funding</span>
                            <p className="text-sm">{renderField(llm.funding?.total_raised)}</p>
                            {llm.funding?.latest_round && (
                              <p className="text-xs text-muted-foreground">
                                Latest: {llm.funding.latest_round.amount} ({llm.funding.latest_round.round_type}, {llm.funding.latest_round.year})
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Products & Market */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Rocket className="h-5 w-5" />
                        Products & Market
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Main Products</span>
                          <div className="mt-2">
                            {llm.main_products && llm.main_products.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {llm.main_products.map((product: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {product}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">No data available</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Target Market</span>
                          <div className="mt-2">
                            {llm.target_market && llm.target_market.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {llm.target_market.map((market: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {market}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">No data available</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Key Features & Platforms */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Cpu className="h-5 w-5" />
                        Key Features & Platforms
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Key Features</span>
                          <div className="mt-2">
                            {llm.key_features && llm.key_features.length > 0 ? (
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {llm.key_features.map((feature: string, i: number) => (
                                  <li key={i}>{feature}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-sm text-muted-foreground">No data available</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Platform Compatibility</span>
                          <div className="mt-2">
                            {llm.platform_compatibility && llm.platform_compatibility.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {llm.platform_compatibility.map((platform: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {platform}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">No data available</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notable Clients */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Notable Clients
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Array.isArray(llm.notable_clients) && llm.notable_clients.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {llm.notable_clients.map((client: string, i: number) => (
                            <Badge key={i} variant="outline">
                              {client}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">{typeof llm.notable_clients === 'string' ? llm.notable_clients : 'No data available'}</span>
                      )}
                    </CardContent>
                  </Card>

                  {/* Social Media */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Social Media & Research Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {llm.social_media && (
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Social Media</span>
                            <div className="mt-2 flex gap-4">
                              {llm.social_media.linkedin && (
                                <a href={`https://linkedin.com/company/${llm.social_media.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                  LinkedIn
                                </a>
                              )}
                              {llm.social_media.twitter && (
                                <a href={`https://twitter.com/${llm.social_media.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                  Twitter
                                </a>
                              )}
                              {llm.social_media.facebook && (
                                <a href={`https://facebook.com/${llm.social_media.facebook}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                  Facebook
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Research Summary</span>
                          <p className="text-sm mt-2">{renderField(llm.research_summary)}</p>
                        </div>
                      </div>
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
