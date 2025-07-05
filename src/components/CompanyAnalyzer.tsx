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
import { prettifyLabel, getCache, setCache, normalizeReportSection } from '../lib/utils';
import { Skeleton } from './ui/skeleton';
import { useDataPreload } from '@/context/DataPreloadProvider';
import { getCompanyAnalysis, getCompanyAnalysisById, getCompanyResearchSteps } from '../lib/supabase/edgeClient';
import { CompanyReportCard } from './ui/CompanyReportCard';
import ICPProfileDisplay from './ui/ICPProfileDisplay';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table';
import { SectionLabel } from './ui/section-label';

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

// Helper to safely render unknown values as string
const renderValue = (val: unknown): string => {
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.map(renderValue).join(', ');
  if (typeof val === 'object' && val !== null) return JSON.stringify(val);
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  return '';
};

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
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Search className="h-6 w-6 text-primary" />
            Company Analysis
          </CardTitle>
          <CardDescription className="text-base">
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
        <div className="space-y-8">
          {/* Details */}
          {analysis && selectedReportId && typeof analysis === 'object' ? (
            (() => {
              let merged = analysis && analysis.llm_output ? (typeof analysis.llm_output === 'string' ? JSON.parse(analysis.llm_output) : analysis.llm_output) : null;
              if (!merged) return <div className="text-center text-muted-foreground py-8">Could not load report details. Please try another report.</div>;

              return (
                <div className="space-y-10">
                  {/* Company Overview - Enterprise Layout */}
                  <Card className="p-8 shadow-lg rounded-2xl">
                    <CardHeader className="mb-4 pb-0 border-b-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Building className="h-7 w-7 text-primary" />
                        <h2 className="company-name text-3xl font-extrabold text-gray-900 mb-0">{merged.company_name}</h2>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="company-details grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <div>
                          {merged.company_size && (
                            <div className="detail-group mb-3">
                              <div className="detail-label">Company Size</div>
                              <div className="detail-value">{merged.company_size}</div>
                            </div>
                          )}
                          {merged.founded && (
                            <div className="detail-group mb-3">
                              <div className="detail-label">Founded</div>
                              <div className="detail-value">{merged.founded}</div>
                            </div>
                          )}
                          {merged.industry && (
                            <div className="detail-group mb-3">
                              <div className="detail-label">Industry</div>
                              <div className="detail-value">{merged.industry}</div>
                            </div>
                          )}
                          {merged.headquarters && (
                            <div className="detail-group mb-3">
                              <div className="detail-label">Headquarters</div>
                              <div className="detail-value">{merged.headquarters}</div>
                            </div>
                          )}
                        </div>
                        <div>
                          {merged.revenue_range && (
                            <div className="detail-group mb-3">
                              <div className="detail-label">Revenue Range</div>
                              <div className="detail-value">{merged.revenue_range}</div>
                            </div>
                          )}
                          {merged.company_type && (
                            <div className="detail-group mb-3">
                              <div className="detail-label">Company Type</div>
                              <div className="detail-value">{merged.company_type}</div>
                            </div>
                          )}
                          {merged.funding && (
                            <div className="detail-group mb-3">
                              <div className="detail-label">Funding Status</div>
                              <div className="detail-value">{typeof merged.funding === 'string' ? merged.funding : JSON.stringify(merged.funding)}</div>
                            </div>
                          )}
                        </div>
                      </div>
                      {merged.summary && (
                        <div className="subsection mb-6">
                          <div className="detail-value text-lg font-medium text-gray-800">{merged.summary}</div>
                        </div>
                      )}
                      {Array.isArray(merged.notable_clients) && merged.notable_clients.length > 0 && (
                        <div className="subsection mb-6">
                          <div className="subsection-title font-semibold text-lg mb-2">Notable Clients</div>
                          <div className="notable-clients flex flex-wrap gap-3">
                            {merged.notable_clients.map((client, i) => (
                              <span key={i} className="client-item bg-orange-50 border border-orange-300 px-4 py-2 rounded-full text-sm font-medium">{client}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {merged.social_media && Object.keys(merged.social_media).length > 0 && (
                        <div className="subsection mb-2">
                          <div className="subsection-title font-semibold text-lg mb-2">Social Media</div>
                          <div className="social-links flex gap-4">
                            {merged.social_media.twitter && <a href={merged.social_media.twitter} className="social-link text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">Twitter</a>}
                            {merged.social_media.facebook && <a href={merged.social_media.facebook} className="social-link text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">Facebook</a>}
                            {merged.social_media.linkedin && <a href={merged.social_media.linkedin} className="social-link text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">LinkedIn</a>}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  {/* Market Intelligence - Enterprise Layout */}
                  <Card className="p-8 shadow-lg rounded-2xl">
                    <CardHeader className="mb-4 pb-0 border-b-0">
                      <div className="flex items-center gap-3 mb-2">
                        <BarChart2 className="h-7 w-7 text-primary" />
                        <h2 className="section-title text-2xl font-bold text-gray-900 mb-0">Market Intelligence</h2>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="two-column grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <div>
                          {Array.isArray(merged.main_products) && merged.main_products.length > 0 && (
                            <div className="subsection mb-6">
                              <div className="subsection-title font-semibold text-lg mb-2">Main Products</div>
                              <div className="list-grid grid grid-cols-2 gap-2">
                                {merged.main_products.map((prod, i) => (
                                  <div key={i} className="list-item bg-gray-50 border-l-4 border-indigo-500 px-3 py-2 rounded text-sm font-medium">{prod}</div>
                                ))}
                              </div>
                            </div>
                          )}
                          {merged.target_market && (
                            <div className="subsection mb-6">
                              <div className="subsection-title font-semibold text-lg mb-2">Target Market</div>
                              <div className="icp-section bg-green-50 border border-green-400 rounded-lg p-4">
                                {merged.target_market.primary && <div><strong>Primary:</strong> {merged.target_market.primary}</div>}
                                {merged.target_market.size_range && <div className="mt-2"><strong>Size Range:</strong> {merged.target_market.size_range}</div>}
                                {merged.target_market.industry_focus && <div className="mt-2"><strong>Industry Focus:</strong> {Array.isArray(merged.target_market.industry_focus) ? merged.target_market.industry_focus.join(', ') : merged.target_market.industry_focus}</div>}
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          {Array.isArray(merged.competitors) && merged.competitors.length > 0 && (
                            <div className="subsection mb-6">
                              <div className="subsection-title font-semibold text-lg mb-2">Direct Competitors</div>
                              <div className="competitor-grid grid grid-cols-2 gap-2">
                                {merged.competitors.map((comp, i) => (
                                  <div key={i} className="competitor-item bg-yellow-50 border border-yellow-400 px-3 py-2 rounded text-center font-medium">{typeof comp === 'string' ? comp : comp.name || JSON.stringify(comp)}</div>
                                ))}
                              </div>
                            </div>
                          )}
                          {merged.positioning && Array.isArray(merged.positioning.differentiators) && merged.positioning.differentiators.length > 0 && (
                            <div className="subsection mb-6">
                              <div className="subsection-title font-semibold text-lg mb-2">Key Differentiators</div>
                              <ul className="list-disc pl-5">
                                {merged.positioning.differentiators.map((diff, i) => (
                                  <li key={i}>{diff}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                      {Array.isArray(merged.market_trends) && merged.market_trends.length > 0 && (
                        <div className="subsection mb-2">
                          <div className="subsection-title font-semibold text-lg mb-2">Market Trends</div>
                          <div className="list-grid grid grid-cols-2 gap-2">
                            {merged.market_trends.map((trend, i) => (
                              <div key={i} className="list-item bg-gray-50 border-l-4 border-indigo-500 px-3 py-2 rounded text-sm font-medium">{trend}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  {/* ICP/IBP Framework - Enterprise Layout */}
                  {(merged.target_market || (merged.icp && merged.icp.buyerPersonas && merged.icp.buyerPersonas.length > 0)) && (
                    <Card className="p-8 shadow-lg rounded-2xl">
                      <CardHeader className="mb-4 pb-0 border-b-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Users className="h-7 w-7 text-primary" />
                          <h2 className="section-title text-2xl font-bold text-gray-900 mb-0">Ideal Customer & Buyer Profiles</h2>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* ICP Section */}
                        {merged.target_market && (
                          <div className="subsection mb-6">
                            <div className="subsection-title font-semibold text-lg mb-2">Ideal Customer Profile (ICP)</div>
                            <div className="icp-section bg-green-50 border border-green-400 rounded-lg p-4">
                              {merged.target_market.company_characteristics && (
                                <>
                                  <strong>Company Characteristics:</strong>
                                  <ul className="list-disc pl-5">
                                    {Array.isArray(merged.target_market.company_characteristics)
                                      ? merged.target_market.company_characteristics.map((c, i) => <li key={i}>{c}</li>)
                                      : <li>{merged.target_market.company_characteristics}</li>}
                                  </ul>
                                </>
                              )}
                              {merged.target_market.technology_profile && (
                                <>
                                  <strong>Technology Profile:</strong>
                                  <ul className="list-disc pl-5">
                                    {Array.isArray(merged.target_market.technology_profile)
                                      ? merged.target_market.technology_profile.map((c, i) => <li key={i}>{c}</li>)
                                      : <li>{merged.target_market.technology_profile}</li>}
                                  </ul>
                                </>
                              )}
                              {/* Fallback: show primary, size_range, industry_focus if no above */}
                              {!merged.target_market.company_characteristics && !merged.target_market.technology_profile && (
                                <>
                                  {merged.target_market.primary && <div><strong>Primary:</strong> {merged.target_market.primary}</div>}
                                  {merged.target_market.size_range && <div className="mt-2"><strong>Size Range:</strong> {merged.target_market.size_range}</div>}
                                  {merged.target_market.industry_focus && <div className="mt-2"><strong>Industry Focus:</strong> {Array.isArray(merged.target_market.industry_focus) ? merged.target_market.industry_focus.join(', ') : merged.target_market.industry_focus}</div>}
                                </>
                              )}
                            </div>
                          </div>
                        )}
                        {/* Buyer Personas Section */}
                        {merged.icp && Array.isArray(merged.icp.buyerPersonas) && merged.icp.buyerPersonas.length > 0 && (
                          <div className="subsection mb-6">
                            <div className="subsection-title font-semibold text-lg mb-2">Buyer Personas</div>
                            {merged.icp.buyerPersonas.map((persona, i) => (
                              <div key={i} className="buyer-persona bg-purple-50 border border-purple-400 rounded-lg p-4 mb-4">
                                <div className="persona-title font-semibold text-purple-800 mb-2">{persona.title || persona.role}</div>
                                {persona.demographics && <div><strong>Demographics:</strong> {persona.demographics}</div>}
                                {persona.painPoints && <div><strong>Pain Points:</strong> {Array.isArray(persona.painPoints) ? persona.painPoints.join(', ') : persona.painPoints}</div>}
                                {persona.successMetrics && <div><strong>Success Metrics:</strong> {Array.isArray(persona.successMetrics) ? persona.successMetrics.join(', ') : persona.successMetrics}</div>}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                  {/* Sales GTM - Enterprise Layout */}
                  {(Array.isArray(merged.sales_opportunities) && merged.sales_opportunities.length > 0) || (Array.isArray(merged.gtm_recommendations) && merged.gtm_recommendations.length > 0) ? (
                    <Card className="p-8 shadow-lg rounded-2xl">
                      <CardHeader className="mb-4 pb-0 border-b-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Rocket className="h-7 w-7 text-primary" />
                          <h2 className="section-title text-2xl font-bold text-gray-900 mb-0">Sales GTM Strategy</h2>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Sales Opportunities */}
                        {Array.isArray(merged.sales_opportunities) && merged.sales_opportunities.length > 0 && (
                          <div className="subsection mb-6">
                            <div className="subsection-title font-semibold text-lg mb-2">Sales Opportunities</div>
                            {merged.sales_opportunities.map((op, i) => (
                              <div key={i} className="opportunity-item bg-emerald-50 border-l-4 border-emerald-400 px-4 py-3 mb-3 rounded-r-lg">
                                <div className="opportunity-title font-semibold text-emerald-900 mb-1">{op.segment}</div>
                                <div>{op.approach}</div>
                                {op.rationale && <div className="text-xs text-emerald-700 mt-1">{op.rationale}</div>}
                              </div>
                            ))}
                          </div>
                        )}
                        {/* GTM Recommendations */}
                        {Array.isArray(merged.gtm_recommendations) && merged.gtm_recommendations.length > 0 && (
                          <div className="subsection mb-6">
                            <div className="subsection-title font-semibold text-lg mb-2">GTM Recommendations</div>
                            <div className="two-column grid grid-cols-1 md:grid-cols-2 gap-8">
                              {merged.gtm_recommendations.map((rec, i) => (
                                <div key={i} className="mb-4">
                                  {rec.strategy && <div className="font-semibold mb-1">{rec.strategy}</div>}
                                  {Array.isArray(rec.actions) && (
                                    <ul className="list-disc pl-5">
                                      {rec.actions.map((action, j) => <li key={j}>{action}</li>)}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Metrics Grid (if present) */}
                        {merged.metrics && Array.isArray(merged.metrics) && merged.metrics.length > 0 && (
                          <div className="metrics-grid grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                            {merged.metrics.map((metric, i) => (
                              <div key={i} className="metric-card bg-sky-50 border border-sky-400 rounded-lg p-4 text-center">
                                <div className="metric-value text-xl font-bold text-sky-800 mb-1">{metric.value}</div>
                                <div className="metric-label text-xs text-sky-700">{metric.label}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : null}
                  {/* Tech Stack - Enterprise Layout */}
                  {(merged.technology_stack || merged.key_features || merged.integration_capabilities || merged.platform_compatibility) && (
                    <Card className="p-8 shadow-lg rounded-2xl">
                      <CardHeader className="mb-4 pb-0 border-b-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Cpu className="h-7 w-7 text-primary" />
                          <h2 className="section-title text-2xl font-bold text-gray-900 mb-0">Technology Stack</h2>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="two-column grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                          <div>
                            {/* Backend Technologies */}
                            {merged.technology_stack && Array.isArray(merged.technology_stack.backend) && merged.technology_stack.backend.length > 0 && (
                              <div className="tech-category mb-6">
                                <div className="subsection-title font-semibold text-lg mb-2">Backend Technologies</div>
                                <div className="tech-list flex flex-wrap gap-2">
                                  {merged.technology_stack.backend.map((tech, i) => (
                                    <span key={i} className="tech-item bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">{tech}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Frontend Technologies */}
                            {merged.technology_stack && Array.isArray(merged.technology_stack.frontend) && merged.technology_stack.frontend.length > 0 && (
                              <div className="tech-category mb-6">
                                <div className="subsection-title font-semibold text-lg mb-2">Frontend Technologies</div>
                                <div className="tech-list flex flex-wrap gap-2">
                                  {merged.technology_stack.frontend.map((tech, i) => (
                                    <span key={i} className="tech-item bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">{tech}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Infrastructure */}
                            {merged.technology_stack && Array.isArray(merged.technology_stack.infrastructure) && merged.technology_stack.infrastructure.length > 0 && (
                              <div className="tech-category mb-6">
                                <div className="subsection-title font-semibold text-lg mb-2">Infrastructure</div>
                                <div className="tech-list flex flex-wrap gap-2">
                                  {merged.technology_stack.infrastructure.map((tech, i) => (
                                    <span key={i} className="tech-item bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">{tech}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div>
                            {/* Key Platform Features */}
                            {merged.key_features && Object.keys(merged.key_features).length > 0 && (
                              <div className="tech-category mb-6">
                                <div className="subsection-title font-semibold text-lg mb-2">Key Platform Features</div>
                                <ul className="list-disc pl-5">
                                  {Object.values(merged.key_features).map((feature, i) => (
                                    <li key={i}>{renderValue(feature)}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {/* Integration Capabilities */}
                            {merged.integration_capabilities && (
                              <div className="tech-category mb-6">
                                <div className="subsection-title font-semibold text-lg mb-2">Integration Capabilities</div>
                                <ul className="list-disc pl-5">
                                  {normalizeReportSection(merged.integration_capabilities).map((item, i) => (
                                    <li key={i}>
                                      {item.label ? <strong>{prettifyLabel(item.label)}: </strong> : null}
                                      {Array.isArray(item.value)
                                        ? item.value.map((v, j) => <span key={j} className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium mr-1 mb-1">{v}</span>)
                                        : typeof item.value === 'string' && item.value.startsWith('{')
                                          ? <details><summary>Details</summary><pre className="bg-gray-50 rounded p-2 text-xs overflow-x-auto">{item.value}</pre></details>
                                          : item.value}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {/* Platform Compatibility */}
                            {merged.platform_compatibility && (
                              <div className="tech-category mb-6">
                                <div className="subsection-title font-semibold text-lg mb-2">Platform Compatibility</div>
                                <ul className="list-disc pl-5">
                                  {normalizeReportSection(merged.platform_compatibility).map((item, i) => (
                                    <li key={i}>
                                      {item.label ? <strong>{prettifyLabel(item.label)}: </strong> : null}
                                      {Array.isArray(item.value)
                                        ? item.value.map((v, j) => <span key={j} className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium mr-1 mb-1">{v}</span>)
                                        : typeof item.value === 'string' && item.value.startsWith('{')
                                          ? <details><summary>Details</summary><pre className="bg-gray-50 rounded p-2 text-xs overflow-x-auto">{item.value}</pre></details>
                                          : item.value}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
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
