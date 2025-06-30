import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Globe, Building, Users, TrendingUp, Target, AlertTriangle, MapPin, DollarSign, ArrowUpRight, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCompany } from "@/context/CompanyContext";
import { useAuth } from "@/context/AuthContext";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { SectionLabel } from "@/components/ui/section-label";

// Helper to get favicon from a URL
const getFaviconUrl = (url: string) => {
  try {
    const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}`;
  } catch {
    return '/favicon.ico';
  }
};

const CompanyAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { setResearch } = useCompany();
  const [report, setReport] = useState(null);
  const { user, token } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const pillsRef = useRef<HTMLDivElement>(null);

  // Fetch recent reports
  const fetchReports = async () => {
    if (!token) return;
    try {
      const response = await fetch('http://localhost:3001/api/company-analyze/reports', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setReports(data.reports);
    } catch (err) {
      // Optionally handle error
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line
  }, [token]);

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

    setLoading(true);
    setAnalysis(null);
    setReport(null);

    try {
      const response = await fetch('http://localhost:3001/api/company-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      if (data.success) {
        setAnalysis(data.analysis);
        setReport(data.report);
        setResearch({
          companyAnalysis: data.analysis,
          isCached: data.isCached,
          timestamp: new Date().toISOString()
        });
        toast({
          title: "Analysis Complete",
          description: data.isCached ? "Retrieved from cache" : "New analysis generated",
        });
        // Refresh reports after analysis
        fetchReports();
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze company",
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

  // Helper to trigger analysis for a given URL (simulate form submit)
  const triggerAnalysis = async (companyUrl: string) => {
    setUrl(companyUrl);
    if (!companyUrl.trim()) return;
    setLoading(true);
    setAnalysis(null);
    setReport(null);
    try {
      const response = await fetch('http://localhost:3001/api/company-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ url: companyUrl.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }
      if (data.success) {
        setAnalysis(data.analysis);
        setReport(data.report);
        setResearch({
          companyAnalysis: data.analysis,
          isCached: data.isCached,
          timestamp: new Date().toISOString()
        });
        toast({
          title: "Analysis Complete",
          description: data.isCached ? "Retrieved from cache" : "New analysis generated",
        });
        fetchReports();
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze company",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
            Enter a company URL to generate comprehensive business intelligence
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
            <Button type="submit" disabled={loading || !url.trim()} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze Company
                </>
              )}
            </Button>
          </form>
          {/* Recent Analyses Bar - label above pills */}
          {reports && reports.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-col items-center w-full">
                <SectionLabel className="text-center mb-1">Recent Analyses</SectionLabel>
              </div>
              <div className="flex flex-row gap-3 justify-center overflow-x-auto pb-1 hide-scrollbar w-full">
                {reports.slice(0, 3).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className="flex items-center gap-2 bg-background border rounded-lg px-3 py-2 min-w-[140px] max-w-[180px] transition hover:bg-accent/20 focus:ring-2 focus:ring-primary/40 outline-none cursor-pointer w-full"
                    style={{ flex: '0 0 auto' }}
                    onClick={() => triggerAnalysis(r.url)}
                    aria-label={`View analysis for ${r.companyName}`}
                    disabled={loading}
                    tabIndex={0}
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded bg-muted/40 border">
                      <img
                        src={getFaviconUrl(r.url)}
                        alt="favicon"
                        className="w-4 h-4 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/favicon.ico'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="truncate font-medium text-xs text-foreground leading-tight">
                        {r.companyName}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                      </div>
                    </div>
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center">
                            <ArrowUpRight className="w-4 h-4 ml-1 text-muted-foreground group-hover:text-primary transition-all duration-150" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          View analysis
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {analysis && (
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
                Key roles and decision makers at the company
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
                Identified challenges and pain points
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
                <Globe className="h-5 w-5" />
                Technology Stack
              </CardTitle>
              <CardDescription>
                Technologies and tools used by the company
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
                Market trends and competitive landscape
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
              <CardTitle>Research Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                {analysis.researchSummary || 'No summary available'}
              </p>
            </CardContent>
          </Card>

          {/* Report Info */}
          {report && (
            <Card>
              <CardHeader>
                <CardTitle>Report Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Report ID:</span> {report.id}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {new Date(report.created_at).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Score:</span> {report.icpFitScore || 'N/A'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanyAnalyzer;
