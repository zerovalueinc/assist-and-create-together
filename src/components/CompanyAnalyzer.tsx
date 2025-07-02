import { useState, useEffect } from 'react';
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

const CompanyAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { setResearch } = useCompany();
  const { user, session } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [showICPModal, setShowICPModal] = useState(false);
  const [modalICP, setModalICP] = useState<any>(null);

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

    if (!session?.access_token) {
      toast({
        title: "Error",
        description: "Please log in to analyze companies",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      console.log('=== Starting Company Analysis ===');
      console.log('URL:', url);
      console.log('User ID:', user?.id);
      console.log('Session token available:', !!session?.access_token);
      
      const response = await fetch('https://hbogcsztrryrepudceww.supabase.co/functions/v1/company-analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: url.trim() })
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
      )}

      <Dialog open={showICPModal} onOpenChange={setShowICPModal}>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="text-green-500 h-5 w-5" /> ICP Document <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">Saved!</span>
            </DialogTitle>
            <DialogDescription>
              This ICP was automatically saved for you. Review all details below.
            </DialogDescription>
          </DialogHeader>
          {modalICP && (
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
                      <p className="font-medium">{modalICP.companyName || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Industry</label>
                      <p className="font-medium">{modalICP.companyProfile?.industry || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Company Size</label>
                      <p className="font-medium">{modalICP.companyProfile?.companySize || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Revenue Range</label>
                      <p className="font-medium">{modalICP.companyProfile?.revenueRange || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Location</label>
                      <p className="font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {modalICP.location || 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Website</label>
                      <p className="font-medium">
                        <a href={modalICP.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {modalICP.website}
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
                    {modalICP.decisionMakers?.map((role: string, index: number) => (
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
                    {modalICP.painPoints?.map((pain: string, index: number) => (
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
                    {modalICP.technologies?.map((tech: string, index: number) => (
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
                      {modalICP.marketTrends?.map((trend: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {trend}
                        </Badge>
                      )) || <p className="text-muted-foreground">No market trends identified</p>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Competitive Landscape</h4>
                    <div className="flex flex-wrap gap-2">
                      {modalICP.competitiveLandscape?.map((competitor: string, index: number) => (
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
                    {modalICP.goToMarketStrategy || 'No strategy identified'}
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
                    {modalICP.researchSummary || 'Multi-phase analysis completed with comprehensive company intelligence'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyAnalyzer;
