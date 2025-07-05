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

              // --- Company Overview ---
              const companyOverviewFields = [
                ['Company Name', merged.company_name],
                ['Company Type', merged.company_type],
                ['Headquarters', merged.headquarters],
                ['Founded', merged.founded],
                ['Company Size', merged.company_size],
                ['Revenue Range', merged.revenue_range],
                ['Industry', merged.industry],
                ['Summary', merged.summary],
                ['Funding', merged.funding],
              ];

              // --- Competitors ---
              const competitors = Array.isArray(merged.competitors) ? merged.competitors : [];

              // --- Key Features, Tech Stack, Platform, Integrations ---
              const keyFeatures = merged.key_features || {};
              const techStack = merged.technology_stack || {};
              const platformCompat = merged.platform_compatibility || {};
              const integrationCaps = merged.integration_capabilities || {};

              // --- Market Intelligence ---
              const positioning = merged.positioning || {};
              const marketTrends = merged.market_trends || [];
              const targetMarket = merged.target_market || {};
              const valueProp = merged.value_proposition || {};
              const mainProducts = merged.main_products || [];

              // --- Sales GTM ---
              const socialMedia = merged.social_media || {};
              const notableClients = merged.notable_clients || [];
              const researchSummary = merged.research_summary || {};
              const gtmRecs = merged.gtm_recommendations || [];
              const salesOpps = merged.sales_opportunities || [];

              // --- Helper: Render badge ---
              const Badge = ({ children, color = 'secondary' }) => (
                <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold bg-${color}-100 text-${color}-800 mr-2 mb-1`}>{children}</span>
              );

              // --- Helper: Render list ---
              const RenderList = ({ items }) => (
                <ul className="list-disc pl-5 space-y-1">
                  {items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              );

              // --- Helper: Render object as key-value list ---
              const RenderObjList = ({ obj }) => (
                <ul className="space-y-1">
                  {Object.entries(obj).map(([k, v], i) => (
                    <li key={i}><span className="font-medium text-muted-foreground">{String(k)}:</span> {Array.isArray(v) ? v.map(item => typeof item === 'object' ? JSON.stringify(item) : String(item)).join(', ') : (v === undefined || v === null ? '' : (typeof v === 'object' ? JSON.stringify(v) : String(v)))}</li>
                  ))}
                </ul>
              );

              // --- Helper: Render competitors as table ---
              const RenderCompetitors = ({ competitors }) => (
                <table className="min-w-full text-xs border mt-2">
                  <thead><tr><th className="border px-2 py-1">Name</th><th className="border px-2 py-1">Focus</th></tr></thead>
                  <tbody>
                    {competitors.map((c, i) => (
                      <tr key={i} className="odd:bg-muted">
                        <td className="border px-2 py-1 font-semibold">{c.name}</td>
                        <td className="border px-2 py-1">{c.focus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );

              // --- Helper: Render social media as icons ---
              const RenderSocialMedia = ({ social }) => (
                <div className="flex gap-4 items-center">
                  {social.twitter && <a href={social.twitter} target="_blank" rel="noopener noreferrer" title="Twitter"><svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775A4.932 4.932 0 0 0 23.337 3.1a9.864 9.864 0 0 1-3.127 1.195A4.916 4.916 0 0 0 16.616 3c-2.72 0-4.924 2.206-4.924 4.924 0 .386.044.763.127 1.124C7.728 8.807 4.1 6.884 1.671 3.965c-.423.724-.666 1.562-.666 2.475 0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.212c9.057 0 14.009-7.514 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/></svg></a>}
                  {social.facebook && <a href={social.facebook} target="_blank" rel="noopener noreferrer" title="Facebook"><svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.406.595 24 1.326 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.406 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg></a>}
                  {social.linkedin && <a href={social.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn"><svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.327-.027-3.037-1.849-3.037-1.851 0-2.132 1.445-2.132 2.939v5.667H9.358V9h3.414v1.561h.049c.476-.899 1.637-1.849 3.37-1.849 3.602 0 4.267 2.369 4.267 5.455v6.285zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.554V9h3.565v11.452zM22.225 0H1.771C.792 0 0 .771 0 1.723v20.549C0 23.229.792 24 1.771 24h20.451C23.2 24 24 23.229 24 22.271V1.723C24 .771 23.2 0 22.225 0z"/></svg></a>}
                </div>
              );

              // --- Helper: Render badge list ---
              const RenderBadgeList = ({ items }) => (
                <div className="flex flex-wrap gap-2">
                  {items.map((item, i) => <span key={i} className="bg-muted px-2 py-1 rounded text-xs font-medium">{String(item)}</span>)}
                </div>
              );

              // --- Helper: Render multi-column badge list ---
              const RenderMultiColObj = ({ obj }) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(obj).map(([k, v], i) => (
                    <div key={i}>
                      <span className="font-medium text-muted-foreground">{String(k)}</span>
                      {Array.isArray(v)
                        ? <RenderBadgeList items={v.map(item => typeof item === 'object' ? JSON.stringify(item) : String(item))} />
                        : <div className="text-sm mt-1">{v === undefined || v === null ? '' : (typeof v === 'object' ? JSON.stringify(v) : String(v))}</div>}
                    </div>
                  ))}
                </div>
              );

              // --- Helper: Render sales opportunities ---
              const RenderSalesOpps = ({ opps }) => (
                <ul className="list-disc pl-5 space-y-1">
                  {opps.map((op, i) => (
                    <li key={i}><span className="font-semibold">{op.segment}:</span> {op.approach} <span className="text-muted-foreground text-xs">{op.rationale}</span></li>
                  ))}
                </ul>
              );

              // --- Helper: Render GTM Recommendations ---
              const RenderGTMRecs = ({ recs }) => (
                <div className="space-y-2">
                  {recs.map((rec, i) => (
                    <div key={i} className="border rounded p-2 bg-muted">
                      {Object.entries(rec).map(([k, v], j) => (
                        <div key={j}><span className="font-medium text-muted-foreground">{k.replace(/_/g, ' ')}:</span> {Array.isArray(v) ? <RenderList items={v} /> : v}</div>
                      ))}
                    </div>
                  ))}
                </div>
              );

              // --- Helper: Render research summary ---
              const RenderResearchSummary = ({ summary }) => (
                <div className="space-y-1">
                  {Object.entries(summary).map(([k, v], i) => (
                    <div key={i}><span className="font-medium text-muted-foreground">{k.replace(/_/g, ' ')}:</span> {Array.isArray(v) ? <RenderList items={v} /> : v}</div>
                  ))}
                </div>
              );

              return (
                <div className="space-y-10">
                  {/* Company Overview */}
                  <Card>
                    <CardHeader className="border-b pb-2 mb-2 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-primary" />
                        <span className="text-xl font-bold">Company Overview</span>
                      </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="text-2xl font-bold mb-1">{merged.company_name}</div>
                        <div className="flex gap-2 mb-2">
                          {merged.company_type && <Badge color="primary">{merged.company_type}</Badge>}
                          {merged.funding && <Badge color="secondary">{typeof merged.funding === 'string' ? merged.funding : merged.funding.status}</Badge>}
                        </div>
                        {merged.headquarters && <div className="text-sm text-muted-foreground">{merged.headquarters}</div>}
                        {merged.founded && <div className="text-sm text-muted-foreground">Founded: {merged.founded}</div>}
                        {merged.company_size && <div className="text-sm text-muted-foreground">Size: {merged.company_size}</div>}
                        {merged.revenue_range && <div className="text-sm text-muted-foreground">Revenue: {merged.revenue_range}</div>}
                        {merged.industry && <div className="text-sm text-muted-foreground">Industry: {merged.industry}</div>}
                      </div>
                      <div className="space-y-2">
                        {merged.summary && <div className="text-base font-medium mb-2">{merged.summary}</div>}
                        {merged.notable_rounds && <div><span className="font-medium text-muted-foreground">Notable Rounds:</span> {Array.isArray(merged.notable_rounds) ? <RenderBadgeList items={merged.notable_rounds} /> : merged.notable_rounds}</div>}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Market Intelligence */}
                  <Card>
                    <CardHeader className="border-b pb-2 mb-2 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <BarChart2 className="h-5 w-5 text-primary" />
                        <span className="text-xl font-bold">Market Intelligence</span>
                      </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        {competitors.length > 0 && <div><span className="font-medium text-muted-foreground">Competitors:</span> <RenderCompetitors competitors={competitors} /></div>}
                        {positioning.differentiators && <div><span className="font-medium text-muted-foreground">Differentiators:</span> <RenderBadgeList items={positioning.differentiators} /></div>}
                        {positioning.market_position && <div><span className="font-medium text-muted-foreground">Market Position:</span> {positioning.market_position}</div>}
                        {marketTrends.length > 0 && <div><span className="font-medium text-muted-foreground">Market Trends:</span> <RenderList items={marketTrends} /></div>}
                      </div>
                      <div className="space-y-2">
                        {mainProducts.length > 0 && <div><span className="font-medium text-muted-foreground">Main Products:</span> <RenderBadgeList items={mainProducts} /></div>}
                        {targetMarket.primary && <div><span className="font-medium text-muted-foreground">Target Market:</span> {targetMarket.primary}</div>}
                        {valueProp.key_features && <div><span className="font-medium text-muted-foreground">Value Proposition:</span> <RenderBadgeList items={valueProp.key_features} /></div>}
                        {valueProp.primary_benefits && <div><span className="font-medium text-muted-foreground">Unique Benefits:</span> <RenderBadgeList items={valueProp.primary_benefits} /></div>}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sales GTM */}
                  <Card>
                    <CardHeader className="border-b pb-2 mb-2 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Rocket className="h-5 w-5 text-primary" />
                        <span className="text-xl font-bold">Sales GTM</span>
                      </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        {Object.keys(socialMedia).length > 0 && <div><span className="font-medium text-muted-foreground">Social Media:</span> <RenderSocialMedia social={socialMedia} /></div>}
                        {notableClients.length > 0 && <div><span className="font-medium text-muted-foreground">Notable Clients:</span> <RenderList items={notableClients} /></div>}
                        {researchSummary && Object.keys(researchSummary).length > 0 && <div><span className="font-medium text-muted-foreground">Research Summary:</span> <RenderResearchSummary summary={researchSummary} /></div>}
                      </div>
                      <div className="space-y-2">
                        {gtmRecs.length > 0 && <div><span className="font-medium text-muted-foreground">GTM Recommendations:</span> <RenderGTMRecs recs={gtmRecs} /></div>}
                        {salesOpps.length > 0 && <div><span className="font-medium text-muted-foreground">Sales Opportunities:</span> <RenderSalesOpps opps={salesOpps} /></div>}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tech Stack */}
                  <Card>
                    <CardHeader className="border-b pb-2 mb-2 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-5 w-5 text-primary" />
                        <span className="text-xl font-bold">Tech Stack</span>
                      </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        {Object.keys(keyFeatures).length > 0 && <div><span className="font-medium text-muted-foreground">Key Features:</span> <RenderMultiColObj obj={keyFeatures} /></div>}
                        {Object.keys(techStack).length > 0 && <div><span className="font-medium text-muted-foreground">Technology Stack:</span> <RenderMultiColObj obj={techStack} /></div>}
                      </div>
                      <div className="space-y-2">
                        {Object.keys(platformCompat).length > 0 && <div><span className="font-medium text-muted-foreground">Platform Compatibility:</span> <RenderMultiColObj obj={platformCompat} /></div>}
                        {Object.keys(integrationCaps).length > 0 && <div><span className="font-medium text-muted-foreground">Integration Capabilities:</span> <RenderMultiColObj obj={integrationCaps} /></div>}
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
