import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabaseClient';
import { useCompany } from "@/context/CompanyContext";
import { useUser, useSession } from '@supabase/auth-helpers-react';
import { useDataPreload } from '@/context/DataPreloadProvider';
import { getCompanyAnalysis, getCompanyResearchSteps } from '@/lib/supabase/edgeClient';
import CanonicalReportRenderer from './ui/CanonicalReportRenderer';
import { CompanyReportPills } from './ui/CompanyReportPills';

function normalizeUrl(input: string): string {
  let url = input.trim().toLowerCase();
  url = url.replace(/^https?:\/\//, ''); // Remove protocol
  url = url.replace(/^www\./, ''); // Remove www.
  url = url.replace(/\/$/, ''); // Remove trailing slash
  return `https://${url}`;
}

// Helper to coerce a value to an array (supports comma-separated strings)
function toArray(val: unknown): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

// Normalization function for LLM output
function normalizeLLMOutput(llm: unknown) {
  if (!llm) return {};
  // If already in the expected format, return as is
  if (typeof llm === 'object' && llm !== null && ('icp' in llm || 'ibp' in llm)) return llm;
  // If using the new icp_analysis format, map fields
  if (typeof llm === 'object' && llm !== null && 'icp_analysis' in llm) {
    const llmObj = llm as { icp_analysis: Record<string, unknown> };
    return {
      icp: {
        painPoints: llmObj.icp_analysis.pain_points,
        buyerPersonas: llmObj.icp_analysis.buyer_personas,
        buyingTriggers: llmObj.icp_analysis.buying_triggers,
        valuePropositions: llmObj.icp_analysis.value_propositions,
        techStack: llmObj.icp_analysis.tech_stack_alignment,
        apolloSearchParameters: llmObj.icp_analysis.apollo_search_parameters,
        targetingRecommendations: llmObj.icp_analysis.targeting_recommendations,
        targetCompanyCharacteristics: llmObj.icp_analysis.target_company_characteristics,
      },
      // Add other mappings as needed
    };
  }
  return llm;
}

// Helper to safely render any field
function renderField(field: unknown) {
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

// Helper to normalize company name for pills
function normalizeReportCompanyName(report: Record<string, unknown>) {
  let name = report.company_name as string;
  if (!name && report.company_overview) {
    const overview = report.company_overview as Record<string, unknown>;
    name = overview.company_name as string;
  }
  if (!name && report.llm_output) {
    let canonical = report.llm_output;
    if (typeof canonical === 'string') {
      try { canonical = JSON.parse(canonical); } catch {}
    }
    if (typeof canonical === 'object' && canonical !== null) {
      const canonicalObj = canonical as Record<string, unknown>;
      name = canonicalObj.company_name as string || 
             (canonicalObj.company_overview as Record<string, unknown>)?.company_name as string;
    }
  }
  return { ...report, company_name: name || 'Untitled' };
}

const CompanyAnalyzer = () => {
  const [url, setUrl] = useState('');
  const { toast } = useToast();
  const { setResearch } = useCompany();
  const user = useUser();
  const session = useSession();

  // Use direct result from getCompanyAnalysis for pills
  const [reports, setReports] = useState<Record<string, unknown>[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<unknown>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');

  useEffect(() => {
    if (!user?.id) return;
    getCompanyAnalysis({ userId: user.id }).then((data) => {
      setReports(data);
      if (data.length > 0) {
        setSelectedReportId(data[0].id as string);
      }
    });
  }, [user?.id]);

  // Fetch research steps when analysis or selectedReportId changes
  useEffect(() => {
    async function fetchSteps() {
      if (!analysis || !selectedReportId || !user?.id) {
        return;
      }
      const analysisAny = analysis as Record<string, unknown>;
      const companyUrl = analysisAny.company_url as string || 
                        analysisAny.companyUrl as string || 
                        (analysisAny.llm_output && 
                         (typeof analysisAny.llm_output === 'string' ? 
                          JSON.parse(analysisAny.llm_output).company_url : 
                          (analysisAny.llm_output as Record<string, unknown>).company_url as string));
      if (!companyUrl) {
        return;
      }
      try {
        await getCompanyResearchSteps({ companyUrl, userId: user.id });
      } catch {
        // Silently handle error
      }
    }
    fetchSteps();
  }, [analysis, selectedReportId, user?.id]);

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
        // FULL INTEGRATION: Always extract canonical structure from llm_output if present
        let canonical = reportObj;
        if (reportObj.llm_output) {
          canonical = reportObj.llm_output;
          if (typeof canonical === 'string') {
            try { canonical = JSON.parse(canonical); } catch {}
          }
        }
        setAnalysis(canonical);
        setReports(prev => [canonical, ...prev.filter(r => r.id !== reportObj.id)]);
        setSelectedReportId(reportObj.id || null);
        setResearch({
          companyAnalysis: canonical,
          isCached: false,
          timestamp: new Date().toISOString()
        });
        toast({
          title: "Analysis Complete",
          description: `Successfully analyzed ${canonical.company_name || canonical.companyName}`,
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
          {reports.length > 0 && (
            <CompanyReportPills
              reports={reports}
              selectedId={selectedReportId}
              onSelect={(report: Record<string, unknown>) => {
                setSelectedReportId(report.id as string);
                setAnalysis(report);
              }}
            />
          )}
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
            <CanonicalReportRenderer reportData={analysis} />
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
