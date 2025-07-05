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

              // --- Company Overview Card ---
              const companyOverviewFields = [
                ['Company Name', merged.company_name],
                ['Company Type', merged.company_type],
                ['Headquarters', merged.headquarters],
                ['Founded', merged.founded],
                ['Company Size', merged.company_size],
                ['Revenue Range', merged.revenue_range],
                ['Industry', merged.industry],
                ['Summary', merged.summary],
                ['Funding Status', merged.funding?.status],
                ['Total Raised', merged.funding?.total_raised],
                ['Notable Rounds', merged.funding?.notable_rounds],
              ];

              // --- Market Intelligence Card ---
              const competitors = merged.competitors || {};
              const positioning = merged.positioning || {};
              const valueProp = merged.value_proposition || {};
              const targetMarket = merged.target_market || {};

              // --- Sales GTM Card ---
              const socialMedia = merged.social_media || {};
              const notableClients = merged.notable_clients || [];
              const researchSummary = merged.research_summary || {};
              const gtmRecs = merged.gtm_recommendations || [];
              const salesOpps = merged.sales_opportunities || [];

              // --- Tech Stack Card ---
              const keyFeatures = merged.key_features || {};
              const techStack = merged.technology_stack || {};
              const platformCompat = merged.platform_compatibility || {};
              const integrationCaps = merged.integration_capabilities || {};

              return (
                <div className="space-y-6">
                  {/* Company Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5" />Company Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {companyOverviewFields.map(([label, value], idx) => (
                          <div key={idx}><span className="text-sm font-medium text-muted-foreground">{label}</span><p className="text-sm font-semibold">{renderField(value)}</p></div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Market Intelligence */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5" />Market Intelligence</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div><span className="text-sm font-medium text-muted-foreground">Direct Competitors</span><p className="text-sm">{renderField(competitors.direct || competitors.main_rivals)}</p></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Indirect Competitors</span><p className="text-sm">{renderField(competitors.indirect || competitors.direct_competitors)}</p></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Core Message</span><p className="text-sm">{renderField(positioning.core_message)}</p></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Differentiators</span><p className="text-sm">{renderField(positioning.differentiators)}</p></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Market Position</span><p className="text-sm">{renderField(positioning.market_position)}</p></div>
                        </div>
                        <div className="space-y-4">
                          <div><span className="text-sm font-medium text-muted-foreground">Main Products</span><p className="text-sm">{renderField(merged.main_products)}</p></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Market Trends</span><p className="text-sm">{renderField(merged.market_trends)}</p></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Target Market</span><p className="text-sm">{renderField(targetMarket.primary)}</p></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Value Proposition (Merchants)</span><p className="text-sm">{renderField(valueProp.merchants)}</p></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Unique Benefits</span><p className="text-sm">{renderField(valueProp.unique_benefits || valueProp.key_advantages)}</p></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sales GTM */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Rocket className="h-5 w-5" />Sales GTM</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div><span className="text-sm font-medium text-muted-foreground">Social Media</span><pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(socialMedia, null, 2)}</pre></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Notable Clients</span>
                            {Array.isArray(notableClients) && notableClients.length > 0 ? (
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {notableClients.map((c, i) => <li key={i}>{c}</li>)}
                              </ul>
                            ) : <span className="text-sm text-muted-foreground">No data available</span>}
                          </div>
                          <div><span className="text-sm font-medium text-muted-foreground">Research Summary</span><pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(researchSummary, null, 2)}</pre></div>
                        </div>
                        <div className="space-y-4">
                          <div><span className="text-sm font-medium text-muted-foreground">GTM Recommendations</span>
                            {Array.isArray(gtmRecs) && gtmRecs.length > 0 ? (
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {gtmRecs.map((rec, i) => <li key={i}><b>{rec.strategy}:</b> {renderField(rec.actions)}</li>)}
                              </ul>
                            ) : <span className="text-sm text-muted-foreground">No data available</span>}
                          </div>
                          <div><span className="text-sm font-medium text-muted-foreground">Sales Opportunities</span>
                            {Array.isArray(salesOpps) && salesOpps.length > 0 ? (
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {salesOpps.map((op, i) => <li key={i}><b>{op.segment}:</b> {op.why} – {op.approach}</li>)}
                              </ul>
                            ) : <span className="text-sm text-muted-foreground">No data available</span>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tech Stack */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Cpu className="h-5 w-5" />Tech Stack</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div><span className="text-sm font-medium text-muted-foreground">Key Features</span><pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(keyFeatures, null, 2)}</pre></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Technology Stack</span><pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(techStack, null, 2)}</pre></div>
                        </div>
                        <div className="space-y-4">
                          <div><span className="text-sm font-medium text-muted-foreground">Platform Compatibility</span><pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(platformCompat, null, 2)}</pre></div>
                          <div><span className="text-sm font-medium text-muted-foreground">Integration Capabilities</span><pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(integrationCaps, null, 2)}</pre></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Debug Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Raw JSON Output (Debug)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs whitespace-pre-wrap break-all bg-muted p-2 rounded border max-h-96 overflow-auto">{JSON.stringify(merged, null, 2)}</pre>
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
