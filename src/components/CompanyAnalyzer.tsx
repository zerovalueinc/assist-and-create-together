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
import { supabase } from "@/integrations/supabase/client";
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
  const { user, session } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const pillsRef = useRef<HTMLDivElement>(null);

  // Fetch recent reports
  const fetchReports = async () => {
    if (!user) return;
    try {
      const { data: reportsData, error: reportsError } = await supabase
        .from('saved_reports')
        .select('*')
        .eq('user_id', parseInt(user.id))
        .order('created_at', { ascending: false });

      if (reportsError) {
        console.error('Error fetching reports:', reportsError);
      } else {
        setReports(reportsData || []);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchReports();
  }, [user]);

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
      console.log('Starting company analysis for:', url);
      
      const { data, error } = await supabase.functions.invoke('company-analyze', {
        body: { url: url.trim() }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Analysis failed');
      }

      if (data.success) {
        console.log('Analysis completed:', data.analysis);
        setAnalysis(data.analysis);
        setReport(data.analysis);
        setResearch({
          companyAnalysis: data.analysis,
          isCached: false,
          timestamp: new Date().toISOString()
        });
        toast({
          title: "Analysis Complete",
          description: "Company analysis generated successfully",
        });
        // Refresh reports after analysis
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Helper to trigger analysis for a given URL
  const triggerAnalysis = async (companyUrl: string) => {
    setUrl(companyUrl);
    if (!companyUrl.trim()) return;
    setLoading(true);
    setAnalysis(null);
    setReport(null);
    try {
      const { data, error } = await supabase.functions.invoke('company-analyze', {
        body: { url: companyUrl.trim() }
      });

      if (error) {
        throw new Error(error.message || 'Analysis failed');
      }

      if (data.success) {
        setAnalysis(data.analysis);
        setReport(data.analysis);
        setResearch({
          companyAnalysis: data.analysis,
          isCached: false,
          timestamp: new Date().toISOString()
        });
        toast({
          title: "Analysis Complete",
          description: "Company analysis generated successfully",
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
            <Button type="submit" disabled={loading || !url.trim()} className="w-full">
              {loading ? (
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
                <Globe className="h-5 w-5" />
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
      )}
    </div>
  );
};

export default CompanyAnalyzer;
