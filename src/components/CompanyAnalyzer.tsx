import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Building, Users, TrendingUp, Target, AlertTriangle, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCompany } from "@/context/CompanyContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from '../lib/supabase'; // See README for global pattern
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';
import EmptyState from './ui/EmptyState';
import { capitalizeFirstLetter, getCache, setCache } from '../lib/utils';
import { Skeleton } from './ui/skeleton';
import { useDataPreload } from '@/context/DataPreloadProvider';
import { useUser } from '../hooks/useUserData';

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
  const { user, session, isLoading } = useUser();
  const { data: preloadData, loading: preloadLoading } = useDataPreload();

  // Use preloaded reports or fallback to cache
  let initialReports = preloadData?.companyAnalyzer || [];
  if (!initialReports.length) {
    initialReports = getCache('yourwork_analyze', []);
  }
  const [reports, setReports] = useState(initialReports);
  const [analysis, setAnalysis] = useState(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    console.log('[CompanyAnalyzer] handleSubmit triggered', { url, user, session, isLoading });
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
        // Prepend new report to reports and update pills/inline
        setReports(prev => [data.analysis, ...prev]);
        setSelectedReportId(data.analysis.id || null);
        toast({
          title: "Analysis Complete",
          description: `Successfully analyzed ${data.analysis.companyName}`,
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
                disabled={isLoading || isAnalyzing}
                className="text-base"
                autoComplete="off"
                aria-label="Company URL"
              />
            </div>
            <Button type="submit" disabled={isLoading || isAnalyzing || !url.trim()} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading user session...
                </>
              ) : isAnalyzing ? (
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
        <EmptyState message="No company analysis reports found. Run an analysis first." />
      ) : (
        <div className="space-y-6">
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
                    {toArray(analysis.decisionMakers).length > 0 ? (
                      toArray(analysis.decisionMakers).map((role, index) => (
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
                    {toArray(analysis.painPoints).length > 0 ? (
                      toArray(analysis.painPoints).map((pain, index) => (
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
                    {toArray(analysis.technologies).length > 0 ? (
                      toArray(analysis.technologies).map((tech, index) => (
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
                      {toArray(analysis.marketTrends).length > 0 ? (
                        toArray(analysis.marketTrends).map((trend, index) => (
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
                      {toArray(analysis.competitiveLandscape).length > 0 ? (
                        toArray(analysis.competitiveLandscape).map((competitor, index) => (
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
