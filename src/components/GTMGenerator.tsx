import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Target, Users, TrendingUp, MessageSquare, BookOpen, BarChart, Lightbulb, CheckCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useSession } from '@supabase/auth-helpers-react';
import { supabase } from '../lib/supabase'; // See README for global pattern
import { capitalizeFirstLetter, getCache, setCache } from '../lib/utils';
import { useDataPreload } from '@/context/DataPreloadProvider';
import { useCompany } from '../context/CompanyContext';
import { invokeEdgeFunction } from '../lib/supabase/edgeClient';

// Set this to true to use the backend proxy for GTM Playbook
const USE_GTM_PROXY = true;

const GTMGenerator = () => {
  const [url, setUrl] = useState('');
  const [gtmPlaybook, setGtmPlaybook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useExistingAnalysis, setUseExistingAnalysis] = useState(false);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedICP, setSelectedICP] = useState(null);
  const { toast } = useToast();
  const user = useUser();
  const session = useSession();
  const hasFetched = useRef(false);
  const { data: preloadData, loading: preloadLoading, retry: refreshData } = useDataPreload();
  // Use workspaceId from selectedCompany if available
  const workspaceId = selectedCompany?.workspace_id || '';

  // Debug logging
  console.log("preloadData", preloadData);

  // Use preloaded analyses for pills or fallback to cache
  let availableAnalyses = preloadData?.companyAnalyzer || [];
  if (!availableAnalyses.length) {
    availableAnalyses = getCache('yourwork_analyze', []);
  }
  // Normalize company name for all analyses
  availableAnalyses = availableAnalyses.map((item: any) => {
    const name = item.companyName || item.company_name || item.companyname || 'Untitled';
    return { ...item, companyName: name, company_name: name, companyname: name };
  });
  console.log('[GTMGenerator] availableAnalyses:', availableAnalyses);

  // Use preloaded GTM playbooks for pills or fallback to cache
  let availablePlaybooks = preloadData?.playbooks || [];
  if (!availablePlaybooks.length) {
    availablePlaybooks = getCache('yourwork_gtm', []);
  }
  // Normalize playbook names
  availablePlaybooks = availablePlaybooks.map((item: any) => {
    const name = item.companyName || item.company_name || item.companyname || 'Untitled Playbook';
    return { ...item, companyName: name, company_name: name, companyname: name };
  });
  console.log('[GTMGenerator] availablePlaybooks:', availablePlaybooks);

  const [reportsWithICP, setReportsWithICP] = useState([]);
  
  useEffect(() => {
    let reports = preloadData?.companyAnalyzer || getCache('yourwork_analyze', []);
    setReportsWithICP(reports); // No filter, show all for pills
    // If you want to filter for ICP details, do it only in the ICP section
    console.log('[GTMGenerator] reportsWithICP:', reports);
  }, [preloadData]);

  // GTM strategy form fields
  const [productStage, setProductStage] = useState('');
  const [channel, setChannel] = useState('');
  const [salesCycle, setSalesCycle] = useState('');
  const [primaryGoals, setPrimaryGoals] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');

  // Add a refresh button for company analyses
  const handleRefreshAnalyses = () => {
    refreshData();
    toast({
      title: "Refreshing",
      description: "Updating available company analyses...",
    });
  };

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

    if (!workspaceId) {
      throw new Error('Workspace not found. This is a system error.');
    }

    setLoading(true);
    setGtmPlaybook(null);

    try {
      console.log('Starting GTM playbook generation for:', url);
      
      const gtmFormAnswers = {
        productStage,
        channel,
        salesCycle,
        primaryGoals,
        additionalContext,
      };

      const requestBody = {
        websiteUrl: url.trim(),
        useExistingAnalysis,
        analysisId: selectedAnalysisId,
        icpId: selectedICP?.id,
        workspace_id: workspaceId,
        gtmFormAnswers,
        selectedCompany,
      };

      let data, error;
      if (USE_GTM_PROXY) {
        // Use backend proxy
        const response = await fetch('/api/gtm-generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify(requestBody),
        });
        const result = await response.json();
        data = result;
        if (!response.ok) error = { message: result.error || 'GTM generation failed' };
      } else {
        // Use direct edge function call
        const result = await invokeEdgeFunction('gtm-generate', requestBody, {
          workspace_id: workspaceId,
          access_token: session.access_token,
        });
        data = result.data;
        error = result.error;
      }

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
        {availableAnalyses.map((item: any) => {
          const name = item.companyName || item.company_name || item.companyname || 'Untitled';
          return (
            <Button
              key={item.id}
              variant={selectedCompany?.id === item.id ? 'default' : 'outline'}
              onClick={() => {
                setSelectedCompany({ ...item, companyName: name, company_name: name, companyname: name });
                setSelectedAnalysisId(item.id);
                setUrl(item.companyUrl || item.url || '');
                setUseExistingAnalysis(true);
              }}
              className="flex items-center gap-2 px-3 py-1 text-sm"
              size="sm"
            >
              <img src={`https://www.google.com/s2/favicons?domain=${item.companyUrl || item.url || ''}`} alt="favicon" className="w-4 h-4 mr-1" onError={e => { e.currentTarget.src = '/favicon.ico'; }} />
              {name}
              {selectedCompany?.id === item.id && <CheckCircle className="h-3 w-3 ml-1" />}
            </Button>
          );
        })}
      </div>
    );
  };

  const renderICPPills = () => {
    if (!reportsWithICP.length) {
      return <p className="text-gray-500 mt-2">No ICPs found. Generate an ICP first.</p>;
    }

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {reportsWithICP.map((report: any) => (
          <button
            key={report.id}
            onClick={() => {
              console.log("Selected ICP:", report);
              setSelectedICP(report);
            }}
            className={`rounded-full px-4 py-1 text-sm border ${
              selectedICP?.id === report.id ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {report.companyName || report.company_name || report.companyname || 'Untitled ICP'}
          </button>
        ))}
      </div>
    );
  };

  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string | null>(null);
  const [selectedPlaybook, setSelectedPlaybook] = useState<any>(null);

  // Select most recent playbook by default
  useEffect(() => {
    if (availablePlaybooks.length > 0 && !selectedPlaybookId) {
      const mostRecent = availablePlaybooks[0];
      setSelectedPlaybookId(mostRecent.id);
      // Parse playbook_data if present
      let playbookData = mostRecent.playbook_data;
      if (typeof playbookData === 'string') {
        try { playbookData = JSON.parse(playbookData); } catch {}
      }
      setSelectedPlaybook({ ...mostRecent, gtmPlaybook: playbookData || mostRecent.gtmPlaybook });
    }
  }, [availablePlaybooks, selectedPlaybookId]);

  // When a pill is clicked, set selectedPlaybookId and selectedPlaybook
  const handleSelectPlaybook = (item: any) => {
    setSelectedPlaybookId(item.id);
    let playbookData = item.playbook_data;
    if (typeof playbookData === 'string') {
      try { playbookData = JSON.parse(playbookData); } catch {}
    }
    setSelectedPlaybook({ ...item, gtmPlaybook: playbookData || item.gtmPlaybook });
  };

  const renderGTMPlaybookPills = () => {
    if (!availablePlaybooks.length) {
      return <p className="text-gray-500 mt-2">No GTM playbooks found. Generate a playbook first.</p>;
    }
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {availablePlaybooks.map((item: any) => {
          const name = item.companyName || item.company_name || item.companyname || 'Untitled Playbook';
          return (
            <Button
              key={item.id}
              variant={selectedPlaybookId === item.id ? 'default' : 'outline'}
              onClick={() => handleSelectPlaybook(item)}
              className="flex items-center gap-2 px-3 py-1 text-sm"
              size="sm"
            >
              <img src={`https://www.google.com/s2/favicons?domain=${item.companyUrl || item.url || ''}`} alt="favicon" className="w-4 h-4 mr-1" onError={e => { e.currentTarget.src = '/favicon.ico'; }} />
              {name}
              {selectedPlaybookId === item.id && <CheckCircle className="h-3 w-3 ml-1" />}
            </Button>
          );
        })}
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
            Enterprise GTM Playbook Generator
          </CardTitle>
          <CardDescription>
            Step 2 of 5: Select a company and configure your go-to-market strategy parameters to generate a comprehensive enterprise GTM playbook.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <div className="font-semibold text-base">Select Target Company</div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshAnalyses}
                disabled={preloadLoading}
              >
                {preloadLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
            {availableAnalyses.length > 0 && renderCompanyPills()}
          </div>

          <div className="mb-4">
            <div className="font-semibold text-base mb-1">Available GTM Playbooks</div>
            {availablePlaybooks.length > 0 && renderGTMPlaybookPills()}
          </div>

          <div className="mb-4">
            <div className="font-semibold text-base mb-1">Select ICP Profile</div>
            {reportsWithICP.length > 0 && renderICPPills()}
          </div>

          {/* GTM Strategy Form Fields */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Stage</label>
              <Input value={productStage} onChange={e => setProductStage(e.target.value)} placeholder="e.g. MVP, Growth, Mature" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Primary Channel</label>
              <Input value={channel} onChange={e => setChannel(e.target.value)} placeholder="e.g. Outbound, Inbound, Partner" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sales Cycle</label>
              <Input value={salesCycle} onChange={e => setSalesCycle(e.target.value)} placeholder="e.g. 30 days, 90 days" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Primary Goals</label>
              <Input value={primaryGoals} onChange={e => setPrimaryGoals(e.target.value)} placeholder="e.g. Pipeline growth, Revenue, Expansion" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Additional Context</label>
              <Input value={additionalContext} onChange={e => setAdditionalContext(e.target.value)} placeholder="Any extra info for the LLM..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {availablePlaybooks.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">No GTM playbooks found. Generate a playbook first.</div>
      ) : selectedPlaybook && selectedPlaybook.gtmPlaybook ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              GTM Playbook
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
                      {selectedPlaybook.gtmPlaybook?.executiveSummary || 'Executive summary not available'}
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
                      <p className="text-sm">{selectedPlaybook.gtmPlaybook?.valueProposition?.primaryValue || 'N/A'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Key Differentiators</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPlaybook.gtmPlaybook?.valueProposition?.keyDifferentiators?.map((diff: string, index: number) => (
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
                        <p className="font-medium text-lg">{selectedPlaybook.gtmPlaybook?.marketAnalysis?.totalAddressableMarket || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Serviceable Addressable Market</label>
                        <p className="font-medium text-lg">{selectedPlaybook.gtmPlaybook?.marketAnalysis?.servicableAddressableMarket || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Market Trends</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPlaybook.gtmPlaybook?.marketAnalysis?.marketTrends?.map((trend: string, index: number) => (
                          <Badge key={index} variant="secondary">{trend}</Badge>
                        )) || <span className="text-muted-foreground">No trends identified</span>}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Competitive Landscape</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPlaybook.gtmPlaybook?.marketAnalysis?.competitiveLandscape?.map((competitor: string, index: number) => (
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
                        <p className="font-medium">{selectedPlaybook.gtmPlaybook?.goToMarketStrategy?.channel || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Sales Motion</label>
                        <p className="font-medium">{selectedPlaybook.gtmPlaybook?.goToMarketStrategy?.salesMotion || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Pricing Strategy</label>
                        <p className="font-medium">{selectedPlaybook.gtmPlaybook?.goToMarketStrategy?.pricingStrategy || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Sales Cycle Length</label>
                        <p className="font-medium">{selectedPlaybook.gtmPlaybook?.goToMarketStrategy?.salesCycleLength || 'N/A'}</p>
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
                      <p className="text-sm bg-blue-50 p-3 rounded-md">{selectedPlaybook.gtmPlaybook?.messagingFramework?.primaryMessage || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Secondary Messages</h4>
                      <div className="space-y-2">
                        {selectedPlaybook.gtmPlaybook?.messagingFramework?.secondaryMessages?.map((message: string, index: number) => (
                          <p key={index} className="text-sm bg-gray-50 p-2 rounded-md">• {message}</p>
                        )) || <p className="text-muted-foreground">No secondary messages</p>}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Objection Handling</h4>
                      <div className="space-y-3">
                        {selectedPlaybook.gtmPlaybook?.messagingFramework?.objectionHandling?.map((item: any, index: number) => (
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
                        {selectedPlaybook.gtmPlaybook?.salesEnablement?.battleCards?.map((card: string, index: number) => (
                          <Badge key={index} variant="outline">{card}</Badge>
                        )) || <span className="text-muted-foreground">No battle cards</span>}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Talk Tracks</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPlaybook.gtmPlaybook?.salesEnablement?.talkTracks?.map((track: string, index: number) => (
                          <Badge key={index} variant="secondary">{track}</Badge>
                        )) || <span className="text-muted-foreground">No talk tracks</span>}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Demo Scripts</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPlaybook.gtmPlaybook?.salesEnablement?.demoScripts?.map((script: string, index: number) => (
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
                        {selectedPlaybook.gtmPlaybook?.demandGeneration?.channels?.map((channel: string, index: number) => (
                          <Badge key={index} variant="secondary">{channel}</Badge>
                        )) || <span className="text-muted-foreground">No channels defined</span>}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Campaign Ideas</h4>
                      <div className="space-y-2">
                        {selectedPlaybook.gtmPlaybook?.demandGeneration?.campaignIdeas?.map((idea: string, index: number) => (
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
                        {selectedPlaybook.gtmPlaybook?.metricsAndKPIs?.leadingIndicators?.map((metric: string, index: number) => (
                          <Badge key={index} variant="outline">{metric}</Badge>
                        )) || <span className="text-muted-foreground">No leading indicators</span>}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Lagging Indicators</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPlaybook.gtmPlaybook?.metricsAndKPIs?.laggingIndicators?.map((metric: string, index: number) => (
                          <Badge key={index} variant="secondary">{metric}</Badge>
                        )) || <span className="text-muted-foreground">No lagging indicators</span>}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Success Metrics</h4>
                      <div className="space-y-2">
                        {selectedPlaybook.gtmPlaybook?.metricsAndKPIs?.successMetrics?.map((metric: string, index: number) => (
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
      ) : (
        <div className="text-center text-muted-foreground py-8">Select a GTM playbook to view details.</div>
      )}
    </div>
  );
};

export default GTMGenerator;
