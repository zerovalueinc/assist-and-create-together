import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Building, Users, TrendingUp, Target, AlertTriangle, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCompany } from "@/context/CompanyContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';
import EmptyState from './ui/EmptyState';
import { capitalizeFirstLetter, getCache, setCache } from '../lib/utils';
import { Skeleton } from './ui/skeleton';

function normalizeUrl(input: string): string {
  let url = input.trim().toLowerCase();
  url = url.replace(/^https?:\/\//, ''); // Remove protocol
  url = url.replace(/^www\./, ''); // Remove www.
  url = url.replace(/\/$/, ''); // Remove trailing slash
  return `https://${url}`;
}

const CompanyAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { setResearch } = useCompany();
  const { user, session, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [showICPModal, setShowICPModal] = useState(false);
  const [modalICP, setModalICP] = useState<any>(null);
  const lastFetchedUserId = useRef<string | null>(null);
  const hasFetchedReports = useRef(false);
  const [loadingReports, setLoadingReports] = useState(true);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Fetch recent reports
  const fetchReports = async () => {
    setLoadingReports(true);
    if (!user) return;
    try {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('company_analyzer_outputs_unrestricted')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (fallbackError) throw fallbackError;
      const normalized = (fallbackData || []).map((r: any) => ({
        ...r,
        companyName: capitalizeFirstLetter(r.companyName || r.company_name || ''),
        companyUrl: r.companyUrl || r.url || r.websiteUrl || r.website || '',
        createdAt: r.createdAt || r.created_at || '',
      }));
      setReports(normalized);
      setCache('companyanalyzer_reports', normalized);
    } catch (fallbackErr) {
      // Do NOT clear reports on error, just show toast
      toast({
        title: "Error fetching reports",
        description: "Could not load your company analysis reports. Please try again later.",
        variant: "destructive",
      });
      console.error('CompanyAnalyzer: Fetch failed:', fallbackErr);
    } finally {
      setLoadingReports(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    // Show cached reports instantly
    const cachedReports = getCache<any[]>('companyanalyzer_reports', []);
    if (cachedReports.length > 0) setReports(cachedReports);
    setLoadingReports(false);
    if (!user?.id) return;
    if (hasFetchedReports.current) return;
    hasFetchedReports.current = true;
    fetchReports();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a company URL",
        variant: "destructive",
      });
      return;
    }
    const normalizedUrl = normalizeUrl(url);
    setUrl(normalizedUrl);

    if (!session?.access_token) {
      toast({
        title: "Error",
        description: "Please log in to analyze companies",
        variant: "destructive",
      });
      return;
    }

    // Defensive: error if no access token
    if (!session.access_token) {
      toast({
        title: "Auth Error",
        description: "No access token found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      console.log('=== Starting Company Analysis ===');
      console.log('URL:', normalizedUrl);
      console.log('User ID:', user?.id);
      console.log('Session token available:', !!session?.access_token);
      
      const response = await fetch('https://hbogcsztrryrepudceww.supabase.co/functions/v1/company-analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: normalizedUrl, user_id: user?.id })
      });
      const data = await response.json();
      const error = !response.ok ? { message: data.error || 'Analysis request failed' } : null;

      console.log('=== Supabase Function Response ===');
      console.log('Data:', data);
      console.log('Error:', error);

      if (error) {
        console.error('Supabase function error details:', error);
        throw new Error(error.message || 'Analysis request failed');
      }

      if (data?.success && data?.analysis) {
        console.log('Analysis successful:', data.analysis);
        setAnalysis(data.analysis);
        setResearch({
          companyAnalysis: data.analysis,
          isCached: false,
          timestamp: new Date().toISOString()
        });
        setModalICP(data.analysis);
        setShowICPModal(true);
        toast({
          title: "Analysis Complete",
          description: `Successfully analyzed ${data.analysis.companyName}`,
        });
        // Refresh reports after analysis
        fetchReports();
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
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="url" className="text-sm font-medium">
                Company URL
              </label>
              <Input
                id="url"
                type="url"
                placeholder="e.g., outbound.ai, notion.so, zapier.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="text-base"
                autoComplete="off"
                aria-label="Company URL"
              />
            </div>
            <Button type="submit" disabled={authLoading || loading || !session?.access_token || !url.trim()} className="w-full">
              {authLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading user session...
                </>
              ) : loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing (5-Phase Research)...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze Company
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {loadingReports ? (
        <div className="flex flex-col gap-2 py-8">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        // Only show empty state if both cache and fetch are empty
        <EmptyState message="No company analysis reports found. Run an analysis first." />
      ) : (
        <div className="space-y-6">
          {/* Pills selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {reports.map((report) => (
              <Badge
                key={report.id}
                variant={selectedReportId === report.id ? 'default' : 'secondary'}
                className={`cursor-pointer px-4 py-2 text-base transition-all duration-150 ${selectedReportId === report.id ? 'ring-2 ring-blue-500 bg-blue-600 text-white' : 'hover:bg-blue-100 hover:text-blue-900'}`}
                onClick={() => {
                  setSelectedReportId(report.id);
                  setAnalysis(report);
                }}
              >
                <span className="font-semibold">{report.companyName || 'Untitled'}</span>
                <span className="ml-2 text-xs text-muted-foreground">{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : ''}</span>
              </Badge>
            ))}
          </div>
          {/* Details */}
          {analysis && selectedReportId && typeof analysis === 'object' && analysis.companyName ? (
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
                      <p className="font-medium">{analysis.companyName || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Industry</label>
                      <p className="font-medium">{analysis.companyProfile?.industry || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Company Size</label>
                      <p className="font-medium">{analysis.companyProfile?.companySize || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Revenue Range</label>
                      <p className="font-medium">{analysis.companyProfile?.revenueRange || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Location</label>
                      <p className="font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {analysis.location || 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Website</label>
                      <p className="font-medium">
                        <a href={analysis.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {analysis.website}
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
                    {analysis.decisionMakers?.map((role, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {role}
                      </Badge>
                    )) || <p className="text-muted-foreground">No decision makers identified</p>}
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
                    {analysis.painPoints?.map((pain, index) => (
                      <Badge key={index} variant="destructive" className="text-sm">
                        {pain}
                      </Badge>
                    )) || <p className="text-muted-foreground">No pain points identified</p>}
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
                    {analysis.technologies?.map((tech, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {tech}
                      </Badge>
                    )) || <p className="text-muted-foreground">No technologies identified</p>}
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
                      {analysis.marketTrends?.map((trend, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {trend}
                        </Badge>
                      )) || <p className="text-muted-foreground">No market trends identified</p>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Competitive Landscape</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.competitiveLandscape?.map((competitor, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {competitor}
                        </Badge>
                      )) || <p className="text-muted-foreground">No competitors identified</p>}
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
                    {analysis.goToMarketStrategy || 'No strategy identified'}
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
                    {analysis.researchSummary || 'Multi-phase analysis completed with comprehensive company intelligence'}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : selectedReportId ? (
            <div className="text-center text-muted-foreground py-8">Could not load report details. Please try another report.</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default CompanyAnalyzer;
