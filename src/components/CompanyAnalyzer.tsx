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
import { getCompanyAnalysis, getCompanyAnalysisById, getCompanyResearchSteps } from '../lib/supabase/edgeClient';
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
  const [currentStep, setCurrentStep] = useState<string>('');
  const [researchSteps, setResearchSteps] = useState<any[]>([]);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [expandedStepIndexes, setExpandedStepIndexes] = useState<number[]>([]);

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

  // Fetch research steps when analysis or selectedReportId changes
  useEffect(() => {
    async function fetchSteps() {
      if (!analysis || !selectedReportId || !user?.id) {
        setResearchSteps([]);
        return;
      }
      const companyUrl = analysis.company_url || analysis.companyUrl || (analysis.llm_output && (typeof analysis.llm_output === 'string' ? JSON.parse(analysis.llm_output).company_url : analysis.llm_output.company_url));
      if (!companyUrl) {
        setResearchSteps([]);
        return;
      }
      setStepsLoading(true);
      try {
        const steps = await getCompanyResearchSteps({ companyUrl, userId: user.id });
        setResearchSteps(steps);
      } catch (err) {
        setResearchSteps([]);
      } finally {
        setStepsLoading(false);
      }
    }
    fetchSteps();
  }, [analysis, selectedReportId, user?.id]);

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
    setCurrentStep('Company Overview...');

    // Realistic step progression based on backend logs
    const stepTimeouts: NodeJS.Timeout[] = [];
    stepTimeouts.push(setTimeout(() => setCurrentStep('Market Intelligence...'), 4000)); // after 4s
    stepTimeouts.push(setTimeout(() => setCurrentStep('Tech Stack Analysis...'), 13000)); // after 13s
    stepTimeouts.push(setTimeout(() => setCurrentStep('Sales & GTM Research...'), 33000)); // after 33s
    stepTimeouts.push(setTimeout(() => setCurrentStep('Finalizing Report...'), 45000)); // after 45s

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
            setCurrentStep('');
            stepTimeouts.forEach(clearTimeout);
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
      setCurrentStep('');
      stepTimeouts.forEach(clearTimeout);
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
                  {currentStep || 'Analyzing...'}
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
              let merged = analysis && analysis.llm_output ? (typeof analysis.llm_output === 'string' ? JSON.parse(analysis.llm_output) : analysis.llm_output) : null;
              if (!merged) return <div className="text-center text-muted-foreground py-8">Could not load report details. Please try another report.</div>;
              const { company_overview, products_positioning, icp_and_buying, features_ecosystem_gtm } = merged;
              return (
                <div className="space-y-6">
                  {/* Company Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5" />Company Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div><span className="text-sm font-medium text-muted-foreground">Company Name</span><p className="text-lg font-semibold">{renderField(company_overview?.company_name)}</p></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Website</span><p className="text-sm">{renderField(company_overview?.website)}</p></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Overview</span><p className="text-sm">{renderField(company_overview?.overview)}</p></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Company Size</span><p className="text-sm">{renderField(company_overview?.company_size)}</p></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Employees (Global)</span><p className="text-sm">{renderField(company_overview?.employees_global)}</p></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Employees (Key Regions)</span><p className="text-sm">{renderField(company_overview?.employees_key_regions)}</p></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Revenue</span><p className="text-sm">{renderField(company_overview?.revenue)}</p></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Industry Segments</span><p className="text-sm">{renderField(company_overview?.industry_segments)}</p></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Funding Status</span><p className="text-sm">{renderField(company_overview?.funding_status)}</p></div>
                        </div>
                        <div className="space-y-4">
                          <div><span className="text-sm font-medium text-muted-foreground">Key Contacts</span>
                            {Array.isArray(company_overview?.key_contacts) && company_overview.key_contacts.length > 0 ? (
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {company_overview.key_contacts.map((c, i) => (
                                  <li key={i}>{c.name} ({c.title}) {c.linkedin && <a href={c.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn</a>}</li>
                                ))}
                              </ul>
                            ) : <span className="text-sm text-muted-foreground">No data available</span>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Products & Positioning */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Rocket className="h-5 w-5" />Products & Positioning</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div><span className="text-sm font-medium text-muted-foreground">Core Product Suite</span><p className="text-sm">{renderField(products_positioning?.core_product_suite)}</p></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Unique Selling Points</span><p className="text-sm">{renderField(products_positioning?.unique_selling_points)}</p></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Market Positioning</span><p className="text-sm">{renderField(products_positioning?.market_positioning)}</p></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Main Products</span><p className="text-sm">{renderField(products_positioning?.main_products)}</p></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Target Market</span><p className="text-sm">{renderField(products_positioning?.target_market)}</p></div>
                        </div>
                        <div className="space-y-4">
                          <div><span className="text-sm font-medium text-muted-foreground">Key Modules</span>
                            {Array.isArray(products_positioning?.key_modules) && products_positioning.key_modules.length > 0 ? (
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {products_positioning.key_modules.map((m, i) => (
                                  <li key={i}>{m.module} – {m.problem_solved} (for {m.target_user})</li>
                                ))}
                              </ul>
                            ) : <span className="text-sm text-muted-foreground">No data available</span>}
                          </div>
                          <div><span className="text-sm font-medium text-muted-foreground">Value Proposition by Segment</span>
                            {products_positioning?.value_proposition_by_segment && typeof products_positioning.value_proposition_by_segment === 'object' ? (
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {Object.entries(products_positioning.value_proposition_by_segment).map(([seg, val], i) => (
                                  <li key={i}><b>{seg}:</b> {val}</li>
                                ))}
                              </ul>
                            ) : <span className="text-sm text-muted-foreground">No data available</span>}
                          </div>
                          <div><span className="text-sm font-medium text-muted-foreground">Key Differentiators</span>
                            {Array.isArray(products_positioning?.key_differentiators) && products_positioning.key_differentiators.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {products_positioning.key_differentiators.map((d, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">{d}</Badge>
                                ))}
                              </div>
                            ) : <span className="text-sm text-muted-foreground">No data available</span>}
                          </div>
                          <div><span className="text-sm font-medium text-muted-foreground">Competitors</span>
                            {Array.isArray(products_positioning?.competitors) && products_positioning.competitors.length > 0 ? (
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {products_positioning.competitors.map((c, i) => (
                                  <li key={i}>{renderField(c)}</li>
                                ))}
                              </ul>
                            ) : <span className="text-sm text-muted-foreground">No data available</span>}
                          </div>
                          <div><span className="text-sm font-medium text-muted-foreground">Market Trends</span>
                            {Array.isArray(products_positioning?.market_trends) && products_positioning.market_trends.length > 0 ? (
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {products_positioning.market_trends.map((t, i) => (
                                  <li key={i}>{t}</li>
                                ))}
                              </ul>
                            ) : <span className="text-sm text-muted-foreground">No data available</span>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* ICP & Buying Process */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />ICP & Buying Process</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div><span className="text-sm font-medium text-muted-foreground">ICP Demographics</span><pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(icp_and_buying?.icp_demographics, null, 2)}</pre></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Firmographics</span><pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(icp_and_buying?.firmographics, null, 2)}</pre></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Pain Points</span>
                            {Array.isArray(icp_and_buying?.pain_points) && icp_and_buying.pain_points.length > 0 ? (
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {icp_and_buying.pain_points.map((p, i) => (
                                  <li key={i}>{p}</li>
                                ))}
                              </ul>
                            ) : <span className="text-sm text-muted-foreground">No data available</span>}
                          </div>
                          <div><span className="text-sm font-medium text-muted-foreground">KPIs Targeted</span>
                            {Array.isArray(icp_and_buying?.kpis_targeted) && icp_and_buying.kpis_targeted.length > 0 ? (
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {icp_and_buying.kpis_targeted.map((k, i) => (
                                  <li key={i}>{k}</li>
                                ))}
                              </ul>
                            ) : <span className="text-sm text-muted-foreground">No data available</span>}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div><span className="text-sm font-medium text-muted-foreground">Buying Committee Personas</span>
                            {Array.isArray(icp_and_buying?.buying_committee_personas) && icp_and_buying.buying_committee_personas.length > 0 ? (
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {icp_and_buying.buying_committee_personas.map((p, i) => (
                                  <li key={i}>{p.role}: {p.responsibilities}</li>
                                ))}
                              </ul>
                            ) : <span className="text-sm text-muted-foreground">No data available</span>}
                          </div>
                          <div><span className="text-sm font-medium text-muted-foreground">Buying Process</span><pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(icp_and_buying?.buying_process, null, 2)}</pre></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Red Flags</span>
                            {Array.isArray(icp_and_buying?.red_flags) && icp_and_buying.red_flags.length > 0 ? (
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {icp_and_buying.red_flags.map((r, i) => (
                                  <li key={i}>{r}</li>
                                ))}
                              </ul>
                            ) : <span className="text-sm text-muted-foreground">No data available</span>}
                          </div>
                          <div><span className="text-sm font-medium text-muted-foreground">Anti-Personas</span>
                            {Array.isArray(icp_and_buying?.anti_personas) && icp_and_buying.anti_personas.length > 0 ? (
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {icp_and_buying.anti_personas.map((a, i) => (
                                  <li key={i}>{a}</li>
                                ))}
                              </ul>
                            ) : <span className="text-sm text-muted-foreground">No data available</span>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Features, Ecosystem, GTM, Clients, Matrix, Action Steps */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Cpu className="h-5 w-5" />Features, Ecosystem, GTM & More</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div><span className="text-sm font-medium text-muted-foreground">Key Features</span>
                            {Array.isArray(features_ecosystem_gtm?.key_features) && features_ecosystem_gtm.key_features.length > 0 ? (
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {features_ecosystem_gtm.key_features.map((f, i) => (
                                  <li key={i}>{f}</li>
                                ))}
                              </ul>
                            ) : <span className="text-sm text-muted-foreground">No data available</span>}
                          </div>
                          <div><span className="text-sm font-medium text-muted-foreground">Integrations</span>
                            {Array.isArray(features_ecosystem_gtm?.integrations) && features_ecosystem_gtm.integrations.length > 0 ? (
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {features_ecosystem_gtm.integrations.map((i, idx) => (
                                  <li key={idx}>{renderField(i)}</li>
                                ))}
                              </ul>
                            ) : <span className="text-sm text-muted-foreground">No data available</span>}
                          </div>
                          <div><span className="text-sm font-medium text-muted-foreground">API Openness</span><p className="text-sm">{renderField(features_ecosystem_gtm?.api_openness)}</p></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Enterprise Readiness</span><pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(features_ecosystem_gtm?.enterprise_readiness, null, 2)}</pre></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Client Logos</span>
                            {Array.isArray(features_ecosystem_gtm?.client_logos) && features_ecosystem_gtm.client_logos.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {features_ecosystem_gtm.client_logos.map((c, i) => (
                                  <div key={i} className="flex flex-col items-center">
                                    {c.logo_url && <img src={c.logo_url} alt={c.category} className="w-10 h-10 object-contain" />}
                                    <span className="text-xs mt-1">{c.category}</span>
                                    {c.outcome && <span className="text-xs text-muted-foreground">{c.outcome}</span>}
                                  </div>
                                ))}
                              </div>
                            ) : <span className="text-sm text-muted-foreground">No data available</span>}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div><span className="text-sm font-medium text-muted-foreground">Competitors</span>
                            {Array.isArray(features_ecosystem_gtm?.competitors) && features_ecosystem_gtm.competitors.length > 0 ? (
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {features_ecosystem_gtm.competitors.map((c, i) => (
                                  <li key={i}>{renderField(c)}</li>
                                ))}
                              </ul>
                            ) : <span className="text-sm text-muted-foreground">No data available</span>}
                          </div>
                          <div><span className="text-sm font-medium text-muted-foreground">GTM Messaging</span><pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(features_ecosystem_gtm?.gtm_messaging, null, 2)}</pre></div>
                          <div><span className="text-sm font-medium text-muted-foreground">ICP Fit Matrix</span>
                            {Array.isArray(features_ecosystem_gtm?.icp_fit_matrix) && features_ecosystem_gtm.icp_fit_matrix.length > 0 ? (
                              <table className="min-w-full text-xs border mt-2">
                                <thead><tr><th className="border px-2 py-1">Attribute</th><th className="border px-2 py-1">Ideal</th><th className="border px-2 py-1">Acceptable</th><th className="border px-2 py-1">Exclude</th></tr></thead>
                                <tbody>
                                  {features_ecosystem_gtm.icp_fit_matrix.map((row, i) => (
                                    <tr key={i}>
                                      <td className="border px-2 py-1">{row.attribute}</td>
                                      <td className="border px-2 py-1">{row.ideal}</td>
                                      <td className="border px-2 py-1">{row.acceptable}</td>
                                      <td className="border px-2 py-1">{row.exclude}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : <span className="text-sm text-muted-foreground">No data available</span>}
                          </div>
                          <div><span className="text-sm font-medium text-muted-foreground">Action Steps</span><pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(features_ecosystem_gtm?.action_steps, null, 2)}</pre></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Social Media</span><pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(features_ecosystem_gtm?.social_media, null, 2)}</pre></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Research Summary</span><p className="text-sm mt-2">{renderField(features_ecosystem_gtm?.research_summary)}</p></div>
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
