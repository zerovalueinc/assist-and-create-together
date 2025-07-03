import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Target, Users, TrendingUp, MessageSquare, BookOpen, BarChart, Lightbulb, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from '../lib/supabase'; // See README for global pattern
import { capitalizeFirstLetter, getCache, setCache } from '../lib/utils';
import { useDataPreload } from '@/context/DataPreloadProvider';
import { useUser } from '../hooks/useUserData';

const GTMGenerator = () => {
  const [url, setUrl] = useState('');
  const [gtmPlaybook, setGtmPlaybook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useExistingAnalysis, setUseExistingAnalysis] = useState(false);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedICP, setSelectedICP] = useState(null);
  const { toast } = useToast();
  const { user, session } = useUser();
  const hasFetched = useRef(false);
  const { data: preloadData, loading: preloadLoading } = useDataPreload();

  // Debug logging
  console.log("preloadData", preloadData);

  // Use preloaded analyses for pills or fallback to cache
  let availableAnalyses = preloadData?.companyAnalyzer || [];
  if (!availableAnalyses.length) {
    availableAnalyses = getCache('yourwork_analyze', []);
  }

  const [icpProfiles, setIcpProfiles] = useState([]);
  
  useEffect(() => {
    let icps = preloadData?.icps || getCache('yourwork_icp', []);
    setIcpProfiles(icps);
  }, [preloadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    console.log('[GTMGenerator] handleSubmit triggered', { url, user, session });
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
        description: "Please log in to generate GTM playbooks",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setGtmPlaybook(null);

    try {
      console.log('Starting GTM playbook generation for:', url);
      
      const requestBody = {
        websiteUrl: url.trim(),
        useExistingAnalysis,
        analysisId: selectedAnalysisId,
        icpId: selectedICP?.id
      };

      const { data, error } = await supabase.functions.invoke('gtm-generate', {
        body: requestBody,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      console.log('GTM generation response:', { data, error });

      if (error) {
        console.error('GTM generation error:', error);
        throw new Error(error.message || 'GTM generation failed');
      }

      if (data?.success) {
        console.log('GTM playbook generated:', data.gtmPlaybook);
        setGtmPlaybook(data.gtmPlaybook);
        toast({
          title: "GTM Playbook Generated",
          description: "Your comprehensive go-to-market playbook is ready",
        });
      } else {
        throw new Error(data?.error || 'GTM generation failed');
      }
    } catch (error: any) {
      console.error('GTM generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate GTM playbook",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderCompanyPills = () => {
    if (!availableAnalyses.length) {
      return <p className="text-gray-500 mt-2">No companies analyzed yet. Use Company Analyzer first.</p>;
    }

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {availableAnalyses.map((item: any) => (
          <button
            key={item.id}
            onClick={() => {
              console.log("Selected company:", item);
              setSelectedCompany(item);
              setSelectedAnalysisId(item.id);
              setUrl(item.companyUrl || item.url || '');
              setUseExistingAnalysis(true);
            }}
            className={`rounded-full px-4 py-1 text-sm border ${
              selectedCompany?.id === item.id ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {item.companyName || item.name || 'Unnamed'}
          </button>
        ))}
      </div>
    );
  };

  const renderICPPills = () => {
    if (!icpProfiles.length) {
      return <p className="text-gray-500 mt-2">No ICPs found. Generate an ICP first.</p>;
    }

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {icpProfiles.map((icp: any) => (
          <button
            key={icp.id}
            onClick={() => {
              console.log("Selected ICP:", icp);
              setSelectedICP(icp);
            }}
            className={`rounded-full px-4 py-1 text-sm border ${
              selectedICP?.id === icp.id ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {icp.title || icp.name || 'Untitled ICP'}
          </button>
        ))}
      </div>
    );
  };

  const renderICPSection = (icp: any) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Firmographics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Company Size</label>
              <p className="font-medium">{icp.firmographics?.companySize || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Revenue Range</label>
              <p className="font-medium">{icp.firmographics?.revenueRange || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Industries</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {icp.firmographics?.industry?.map((ind: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {ind}
                  </Badge>
                )) || <span className="text-muted-foreground">N/A</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Personas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {icp.personas?.map((persona: any, index: number) => (
                <div key={index} className="border-l-2 border-blue-200 pl-3">
                  <h4 className="font-medium">{persona.title}</h4>
                  <p className="text-sm text-muted-foreground">{persona.role}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {persona.painPoints?.slice(0, 3).map((pain: string, i: number) => (
                      <Badge key={i} variant="destructive" className="text-xs">
                        {pain}
                      </Badge>
                    ))}
                  </div>
                </div>
              )) || <p className="text-muted-foreground">No personas defined</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            GTM Playbook Generator
          </CardTitle>
          <CardDescription>
            Generate comprehensive go-to-market playbooks using our 5-phase intelligence pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableAnalyses.length === 0 && icpProfiles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">No data available</p>
              <p className="text-sm text-gray-400">Run a company analysis or generate an ICP first.</p>
            </div>
          ) : (
            <>
              <div className='mb-4'>{renderCompanyPills()}</div>
              <div className='mb-4'>{renderICPPills()}</div>
            </>
          )}
          {availableAnalyses.length > 0 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium">
                  Company URL
                </label>
                <Input
                  id="url"
                  type="url"
                  placeholder="e.g., salesforce.com, hubspot.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  className="text-base"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="useExisting"
                    checked={useExistingAnalysis}
                    onChange={(e) => setUseExistingAnalysis(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="useExisting" className="text-sm font-medium">
                    Use existing company analysis
                  </label>
                </div>
              </div>
              <Button type="submit" disabled={loading || !url.trim()} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating GTM Playbook (5-Phase Analysis)...
                  </>
                ) : (
                  <>
                    <Target className="mr-2 h-4 w-4" />
                    Generate GTM Playbook
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {gtmPlaybook && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              GTM Playbook Generated
            </CardTitle>
            <CardDescription>
              Comprehensive go-to-market intelligence and strategy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="market">Market</TabsTrigger>
                <TabsTrigger value="icp">ICP</TabsTrigger>
                <TabsTrigger value="strategy">Strategy</TabsTrigger>
                <TabsTrigger value="messaging">Messaging</TabsTrigger>
                <TabsTrigger value="enablement">Enablement</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Executive Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">
                      {gtmPlaybook.gtmPlaybook?.executiveSummary || 'Executive summary not available'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Value Proposition</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Primary Value</h4>
                      <p className="text-sm">{gtmPlaybook.gtmPlaybook?.valueProposition?.primaryValue || 'N/A'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Key Differentiators</h4>
                      <div className="flex flex-wrap gap-2">
                        {gtmPlaybook.gtmPlaybook?.valueProposition?.keyDifferentiators?.map((diff: string, index: number) => (
                          <Badge key={index} variant="outline">{diff}</Badge>
                        )) || <span className="text-muted-foreground">None specified</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="market" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Market Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Total Addressable Market</label>
                        <p className="font-medium text-lg">{gtmPlaybook.gtmPlaybook?.marketAnalysis?.totalAddressableMarket || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Serviceable Addressable Market</label>
                        <p className="font-medium text-lg">{gtmPlaybook.gtmPlaybook?.marketAnalysis?.servicableAddressableMarket || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Market Trends</h4>
                      <div className="flex flex-wrap gap-2">
                        {gtmPlaybook.gtmPlaybook?.marketAnalysis?.marketTrends?.map((trend: string, index: number) => (
                          <Badge key={index} variant="secondary">{trend}</Badge>
                        )) || <span className="text-muted-foreground">No trends identified</span>}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Competitive Landscape</h4>
                      <div className="flex flex-wrap gap-2">
                        {gtmPlaybook.gtmPlaybook?.marketAnalysis?.competitiveLandscape?.map((competitor: string, index: number) => (
                          <Badge key={index} variant="outline">{competitor}</Badge>
                        )) || <span className="text-muted-foreground">No competitors identified</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="icp" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Ideal Customer Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedICP ? (
                      renderICPSection(selectedICP)
                    ) : (
                      <p className="text-gray-500">Select an ICP from the pills above to view details.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="strategy" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Go-to-Market Strategy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Channel Strategy</label>
                        <p className="font-medium">{gtmPlaybook.gtmPlaybook?.goToMarketStrategy?.channel || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Sales Motion</label>
                        <p className="font-medium">{gtmPlaybook.gtmPlaybook?.goToMarketStrategy?.salesMotion || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Pricing Strategy</label>
                        <p className="font-medium">{gtmPlaybook.gtmPlaybook?.goToMarketStrategy?.pricingStrategy || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Sales Cycle Length</label>
                        <p className="font-medium">{gtmPlaybook.gtmPlaybook?.goToMarketStrategy?.salesCycleLength || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="messaging" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Messaging Framework
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Primary Message</h4>
                      <p className="text-sm bg-blue-50 p-3 rounded-md">{gtmPlaybook.gtmPlaybook?.messagingFramework?.primaryMessage || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Secondary Messages</h4>
                      <div className="space-y-2">
                        {gtmPlaybook.gtmPlaybook?.messagingFramework?.secondaryMessages?.map((message: string, index: number) => (
                          <p key={index} className="text-sm bg-gray-50 p-2 rounded-md">• {message}</p>
                        )) || <p className="text-muted-foreground">No secondary messages</p>}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Objection Handling</h4>
                      <div className="space-y-3">
                        {gtmPlaybook.gtmPlaybook?.messagingFramework?.objectionHandling?.map((item: any, index: number) => (
                          <div key={index} className="border-l-2 border-orange-200 pl-3">
                            <p className="text-sm font-medium text-orange-800">"{item.objection}"</p>
                            <p className="text-sm text-gray-600 mt-1">{item.response}</p>
                          </div>
                        )) || <p className="text-muted-foreground">No objection handling defined</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="enablement" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Sales Enablement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Battle Cards</h4>
                      <div className="flex flex-wrap gap-2">
                        {gtmPlaybook.gtmPlaybook?.salesEnablement?.battleCards?.map((card: string, index: number) => (
                          <Badge key={index} variant="outline">{card}</Badge>
                        )) || <span className="text-muted-foreground">No battle cards</span>}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Talk Tracks</h4>
                      <div className="flex flex-wrap gap-2">
                        {gtmPlaybook.gtmPlaybook?.salesEnablement?.talkTracks?.map((track: string, index: number) => (
                          <Badge key={index} variant="secondary">{track}</Badge>
                        )) || <span className="text-muted-foreground">No talk tracks</span>}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Demo Scripts</h4>
                      <div className="flex flex-wrap gap-2">
                        {gtmPlaybook.gtmPlaybook?.salesEnablement?.demoScripts?.map((script: string, index: number) => (
                          <Badge key={index} variant="outline">{script}</Badge>
                        )) || <span className="text-muted-foreground">No demo scripts</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Demand Generation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Channels</h4>
                      <div className="flex flex-wrap gap-2">
                        {gtmPlaybook.gtmPlaybook?.demandGeneration?.channels?.map((channel: string, index: number) => (
                          <Badge key={index} variant="secondary">{channel}</Badge>
                        )) || <span className="text-muted-foreground">No channels defined</span>}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Campaign Ideas</h4>
                      <div className="space-y-2">
                        {gtmPlaybook.gtmPlaybook?.demandGeneration?.campaignIdeas?.map((idea: string, index: number) => (
                          <p key={index} className="text-sm bg-green-50 p-2 rounded-md">• {idea}</p>
                        )) || <p className="text-muted-foreground">No campaign ideas</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="h-5 w-5" />
                      Metrics & KPIs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Leading Indicators</h4>
                      <div className="flex flex-wrap gap-2">
                        {gtmPlaybook.gtmPlaybook?.metricsAndKPIs?.leadingIndicators?.map((metric: string, index: number) => (
                          <Badge key={index} variant="outline">{metric}</Badge>
                        )) || <span className="text-muted-foreground">No leading indicators</span>}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Lagging Indicators</h4>
                      <div className="flex flex-wrap gap-2">
                        {gtmPlaybook.gtmPlaybook?.metricsAndKPIs?.laggingIndicators?.map((metric: string, index: number) => (
                          <Badge key={index} variant="secondary">{metric}</Badge>
                        )) || <span className="text-muted-foreground">No lagging indicators</span>}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Success Metrics</h4>
                      <div className="space-y-2">
                        {gtmPlaybook.gtmPlaybook?.metricsAndKPIs?.successMetrics?.map((metric: string, index: number) => (
                          <p key={index} className="text-sm bg-blue-50 p-2 rounded-md flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            {metric}
                          </p>
                        )) || <p className="text-muted-foreground">No success metrics defined</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GTMGenerator;
