import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Target, Users, Building2, MapPin, DollarSign, ArrowUpRight, Lightbulb, BarChart2, ClipboardList, TrendingUp, FileText, CheckCircle, AlertTriangle, Rocket, Globe, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCompany } from "@/context/CompanyContext";
import { useAuth } from "@/context/AuthContext";
import type { GTMICPSchema } from "@/schema/gtm_icp_schema";
import { z } from 'zod';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin;

const GTMICPSchemaZod = z.object({
  schemaVersion: z.string(),
  personas: z.array(z.object({
    title: z.string(),
    role: z.string(),
    painPoints: z.array(z.string()),
    responsibilities: z.array(z.string()).optional(),
  })),
  firmographics: z.object({
    industry: z.string(),
    companySize: z.string(),
    revenueRange: z.string(),
    region: z.string(),
  }),
  messagingAngles: z.array(z.string()),
  gtmRecommendations: z.string(),
  competitivePositioning: z.string(),
  objectionHandling: z.array(z.string()),
  campaignIdeas: z.array(z.string()),
  metricsToTrack: z.array(z.string()),
  filmReviews: z.string(),
  crossFunctionalAlignment: z.string(),
  demandGenFramework: z.string(),
  iterativeMeasurement: z.string(),
  trainingEnablement: z.string(),
  apolloSearchParams: z.object({
    employeeCount: z.string(),
    titles: z.array(z.string()),
    industries: z.array(z.string()),
    technologies: z.array(z.string()),
    locations: z.array(z.string()),
  }).optional(),
});

const ICPGenerator = () => {
  // Form state
  const [playbookType, setPlaybookType] = useState('');
  const [productStage, setProductStage] = useState('');
  const [channelExpansion, setChannelExpansion] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [salesCycle, setSalesCycle] = useState('');
  const [competitivePosition, setCompetitivePosition] = useState('');
  const [primaryGoals, setPrimaryGoals] = useState([]);
  const [marketingChannels, setMarketingChannels] = useState([]);
  const [additionalContext, setAdditionalContext] = useState('');

  const [icp, setICP] = useState<GTMICPSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { research } = useCompany();
  const { session, user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [recentICPs, setRecentICPs] = useState<any[]>([]);
  const [recentPlaybooks, setRecentPlaybooks] = useState<any[]>([]);

  // Debug log for recentICPs
  console.log('recentICPs:', recentICPs);

  // Fetch analyzed companies (CompanyAnalyzer reports)
  useEffect(() => {
    const fetchCompanies = async () => {
      if (!session?.access_token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/company-analyze/reports`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` },
        });
        const data = await response.json();
        if (data.success) {
          // Map to ensure each company has a companyUrl field
          setCompanies(data.reports.map((r: any) => ({
            ...r,
            companyUrl: r.companyUrl || r.url || r.websiteUrl || r.website || '',
          })));
        }
      } catch (err) {
        console.error('Error fetching companies:', err);
      }
    };
    fetchCompanies();
  }, [session?.access_token]);

  // Fetch recent/generated ICPs
  useEffect(() => {
    const fetchICPs = async () => {
      if (!session?.access_token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/icp/reports`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` },
        });
        const data = await response.json();
        if (data.success) setRecentICPs(data.icps);
        else console.error('Failed to fetch ICPs:', data);
      } catch (err) {
        console.error('Error fetching ICPs:', err);
      }
    };
    fetchICPs();
  }, [session?.access_token, icp]);

  // Fetch recent playbooks
  useEffect(() => {
    const fetchPlaybooks = async () => {
      if (!session?.access_token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/icp/playbooks`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` },
        });
        const data = await response.json();
        if (data.success) setRecentPlaybooks(data.playbooks);
      } catch (err) {
        console.error('Error fetching playbooks:', err);
      }
    };
    fetchPlaybooks();
  }, [session?.access_token, icp]);

  // Auto-load saved playbooks
  useEffect(() => {
    if (!icp && recentICPs.length > 0) {
      try {
        const latest = recentICPs[0];
        const parsed = GTMICPSchemaZod.safeParse(JSON.parse(latest.icpData));
        if (parsed.success) {
          setICP(parsed.data as GTMICPSchema);
        }
      } catch {
        // Handle parsing error silently
      }
    }
  }, [recentICPs, icp]);

  useEffect(() => {
    if (selectedCompany && recentICPs.length > 0) {
      const match = recentICPs.find((icp) => icp.companyUrl === selectedCompany.companyUrl);
      if (match) {
        try {
          const parsed = GTMICPSchemaZod.safeParse(JSON.parse(match.icpData));
          if (parsed.success) {
            setICP(parsed.data as GTMICPSchema);
          }
        } catch {
          // Handle parsing error silently
        }
      } else {
        setICP(null);
      }
    }
  }, [selectedCompany, recentICPs]);

  const handleGoalChange = (goal: string, checked: boolean) => {
    if (checked) {
      setPrimaryGoals([...primaryGoals, goal]);
    } else {
      setPrimaryGoals(primaryGoals.filter(g => g !== goal));
    }
  };

  const handleChannelChange = (channel: string, checked: boolean) => {
    if (checked) {
      setMarketingChannels([...marketingChannels, channel]);
    } else {
      setMarketingChannels(marketingChannels.filter(c => c !== channel));
    }
  };

  const startICPWorkflow = async () => {
    if (!selectedCompany || !playbookType || !productStage || !channelExpansion || !targetMarket || !salesCycle || !competitivePosition || primaryGoals.length === 0 || marketingChannels.length === 0) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill out all required fields before generating the GTM playbook.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setICP(null);
    setSessionId(null);
    
    try {
      const formData = {
        playbookType,
        productStage,
        channelExpansion,
        targetMarket,
        salesCycle,
        competitivePosition,
        primaryGoals,
        marketingChannels,
        additionalContext
      };

      const response = await fetch(`${API_BASE_URL}/api/workflow/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          workflowName: 'icp-generator',
          params: {
            url: selectedCompany?.companyUrl || '',
            comprehensive: false,
            userId: user?.id,
            formData: formData,
          },
        }),
      });
      
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to start GTM playbook generation');
      }
      
      setSessionId(data.sessionId);
      toast({
        title: "GTM Playbook Generation Started",
        description: "Your enterprise GTM playbook is being generated. This may take a few moments.",
      });
      
      pollWorkflowState(data.sessionId);
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to start GTM playbook generation.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Poll for workflow state/results
  const pollWorkflowState = async (sessionId: string) => {
    let attempts = 0;
    const maxAttempts = 30;
    const poll = async () => {
      attempts++;
      try {
        const response = await fetch(`${API_BASE_URL}/api/workflow/state?workflowName=icp-generator&sessionId=${encodeURIComponent(sessionId)}`, {
          headers: session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {},
        });
        const data = await response.json();
        if (data.success && data.state) {
          if (data.state.status === 'completed') {
            setICP(data.state.result as GTMICPSchema);
            setLoading(false);
            toast({
              title: "GTM Playbook Generated",
              description: "Your enterprise GTM playbook has been created successfully.",
            });
            // Auto-save the result
            try {
              await fetch(`${API_BASE_URL}/api/icp/playbooks`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
                },
                body: JSON.stringify({
                  companyUrl: selectedCompany?.companyUrl || '',
                  icpData: data.state.result,
                  playbookContent: JSON.stringify(data.state.result),
                }),
              });
            } catch (saveErr) {
              console.error('Failed to save GTM playbook:', saveErr);
            }
            return;
          } else if (data.state.status === 'failed') {
            setLoading(false);
            toast({
              title: "Generation Failed",
              description: data.state.error || "GTM playbook generation failed.",
              variant: "destructive",
            });
            return;
          }
        }
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setLoading(false);
          toast({
            title: "Timeout",
            description: "GTM playbook generation took too long. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        setLoading(false);
        toast({
          title: "Polling Error",
          description: error.message || "Failed to poll workflow state.",
          variant: "destructive",
        });
      }
    };
    poll();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-blue-600" />
          <span>Enterprise GTM Playbook Generator</span>
        </CardTitle>
        <CardDescription>
          <span className="font-semibold">Step 2 of 5:</span> Select a company and configure your go-to-market strategy parameters to generate a comprehensive enterprise GTM playbook.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Saved GTM Playbook Pills */}
        {recentICPs.length > 0 && (
          <div className="flex flex-row gap-2 overflow-x-auto pb-2 hide-scrollbar mb-4">
            {recentICPs.map((icpObj) => {
              let parsed: GTMICPSchema | null = null;
              try {
                const result = GTMICPSchemaZod.safeParse(JSON.parse(icpObj.icpData));
                if (result.success) parsed = result.data as GTMICPSchema;
              } catch {
                parsed = null;
              }
              const isActive = icp && parsed && JSON.stringify(icp) === JSON.stringify(parsed);
              return (
                <button
                  key={icpObj.id}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full border transition text-sm font-medium min-w-[120px] max-w-[220px] truncate ${isActive ? 'bg-primary text-white border-primary' : 'bg-background border-muted text-foreground hover:bg-accent/40'}`}
                  style={{ flex: '0 0 auto' }}
                  onClick={() => {
                    if (parsed) setICP(parsed as GTMICPSchema);
                  }}
                >
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${icpObj.companyUrl}`}
                    alt="favicon"
                    className="w-4 h-4 mr-1 rounded"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/favicon.ico'; }}
                  />
                  <span className="truncate">{icpObj.companyName || icpObj.companyUrl}</span>
                </button>
              );
            })}
          </div>
        )}
        {/* Company Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Target Company</label>
          <div className="flex flex-wrap gap-2">
            {companies.length === 0 && <span className="text-gray-500 text-sm">No companies analyzed yet. Use Company Analyzer first.</span>}
            {companies.map((c) => (
              <Button
                key={c.id}
                variant={selectedCompany?.id === c.id ? 'default' : 'outline'}
                onClick={() => setSelectedCompany(c)}
                className="flex items-center gap-2 px-3 py-1 text-sm"
                size="sm"
              >
                <img src={`https://www.google.com/s2/favicons?domain=${c.companyUrl}`} alt="favicon" className="w-4 h-4 mr-1" />
                {c.companyName || c.companyUrl}
                {selectedCompany?.id === c.id && <CheckCircle className="h-3 w-3 ml-1" />}
              </Button>
            ))}
          </div>
        </div>

        {/* GTM Configuration Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
          {/* Playbook Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Playbook Type</Label>
            <Select value={playbookType} onValueChange={setPlaybookType}>
              <SelectTrigger>
                <SelectValue placeholder="Select playbook type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales Playbook</SelectItem>
                <SelectItem value="marketing">Marketing Playbook</SelectItem>
                <SelectItem value="integrated">Integrated Sales & Marketing</SelectItem>
                <SelectItem value="account-based">Account-Based Marketing</SelectItem>
                <SelectItem value="product-led">Product-Led Growth</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Product Stage */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Product Stage</Label>
            <Select value={productStage} onValueChange={setProductStage}>
              <SelectTrigger>
                <SelectValue placeholder="Select product stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new-product">New Product Launch</SelectItem>
                <SelectItem value="existing-product">Existing Product</SelectItem>
                <SelectItem value="product-expansion">Product Feature Expansion</SelectItem>
                <SelectItem value="market-expansion">Market Expansion</SelectItem>
                <SelectItem value="rebranding">Product Rebranding</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Channel Expansion */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Channel Strategy</Label>
            <Select value={channelExpansion} onValueChange={setChannelExpansion}>
              <SelectTrigger>
                <SelectValue placeholder="Select channel strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct-sales">Direct Sales</SelectItem>
                <SelectItem value="partner-channel">Partner Channel</SelectItem>
                <SelectItem value="multi-channel">Multi-Channel</SelectItem>
                <SelectItem value="digital-first">Digital-First</SelectItem>
                <SelectItem value="enterprise-sales">Enterprise Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target Market */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Target Market</Label>
            <Select value={targetMarket} onValueChange={setTargetMarket}>
              <SelectTrigger>
                <SelectValue placeholder="Select target market" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enterprise">Enterprise (1000+ employees)</SelectItem>
                <SelectItem value="mid-market">Mid-Market (100-1000 employees)</SelectItem>
                <SelectItem value="smb">Small Business (1-100 employees)</SelectItem>
                <SelectItem value="startup">Startups & Scale-ups</SelectItem>
                <SelectItem value="multi-segment">Multi-Segment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sales Cycle */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Expected Sales Cycle</Label>
            <Select value={salesCycle} onValueChange={setSalesCycle}>
              <SelectTrigger>
                <SelectValue placeholder="Select sales cycle length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short (0-3 months)</SelectItem>
                <SelectItem value="medium">Medium (3-6 months)</SelectItem>
                <SelectItem value="long">Long (6-12 months)</SelectItem>
                <SelectItem value="complex">Complex (12+ months)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Competitive Position */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Competitive Position</Label>
            <Select value={competitivePosition} onValueChange={setCompetitivePosition}>
              <SelectTrigger>
                <SelectValue placeholder="Select competitive position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market-leader">Market Leader</SelectItem>
                <SelectItem value="challenger">Challenger</SelectItem>
                <SelectItem value="niche-player">Niche Player</SelectItem>
                <SelectItem value="disruptor">Disruptor</SelectItem>
                <SelectItem value="follower">Market Follower</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Primary Goals */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Primary Goals (Select all that apply)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              'Increase Market Share',
              'Generate New Leads',
              'Improve Conversion Rates',
              'Expand to New Markets',
              'Increase Deal Size',
              'Reduce Sales Cycle',
              'Improve Customer Retention',
              'Launch New Product',
              'Competitive Displacement'
            ].map((goal) => (
              <div key={goal} className="flex items-center space-x-2">
                <Checkbox 
                  id={goal}
                  checked={!!primaryGoals.includes(goal)}
                  onCheckedChange={(checked) => handleGoalChange(goal, checked === true)}
                />
                <Label htmlFor={goal} className="text-sm">{goal}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Marketing Channels */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Preferred Marketing Channels</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              'Email Marketing',
              'Social Media',
              'Content Marketing',
              'Paid Advertising',
              'SEO/SEM',
              'Events & Webinars',
              'Partner Marketing',
              'Direct Mail'
            ].map((channel) => (
              <div key={channel} className="flex items-center space-x-2">
                <Checkbox 
                  id={channel}
                  checked={!!marketingChannels.includes(channel)}
                  onCheckedChange={(checked) => handleChannelChange(channel, checked === true)}
                />
                <Label htmlFor={channel} className="text-sm">{channel}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Context */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Additional Context (Optional)</Label>
          <Textarea
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="Any specific requirements, constraints, or additional context for your GTM strategy..."
            className="min-h-[80px]"
          />
        </div>

        {/* Generate Button */}
        <Button onClick={startICPWorkflow} disabled={loading} className="w-full h-12 text-base font-medium">
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Generating Enterprise GTM Playbook...
            </>
          ) : (
            <>
              <Rocket className="h-5 w-5 mr-2" />
              Generate GTM Playbook
            </>
          )}
        </Button>

        {/* Step/Progress UI */}
        <div className="text-xs text-gray-500">Step 2 of 5: ICP Generation</div>

        {/* Recent Playbooks */}
        {recentPlaybooks.length > 0 && (
          <div className="mt-8">
            <div className="font-semibold mb-2 text-lg">Recent GTM Playbooks</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentPlaybooks.map((pb) => {
                let parsed;
                try {
                  parsed = JSON.parse(pb.icpData);
                } catch {
                  parsed = { summary: pb.icpData };
                }
                return (
                  <Card key={pb.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="truncate text-base">{parsed.icp?.companyName || pb.companyUrl || 'GTM Playbook'}</CardTitle>
                      <div className="text-xs text-gray-500">{new Date(pb.createdAt).toLocaleString()}</div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-gray-700 truncate">{parsed.summary || parsed.gtmRecommendations || 'Open to view details.'}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ICP Result */}
        {icp && (
          <div className="space-y-8">
            {/* Executive Summary Card */}
            {(icp.gtmRecommendations) && (
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="flex flex-row items-center gap-3">
                  <BarChart2 className="h-6 w-6 text-blue-500" />
                  <CardTitle className="text-xl font-bold">Executive Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-base text-gray-700 whitespace-pre-line">
                    {icp.gtmRecommendations}
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Main Playbook Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personas */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-500" />
                  <CardTitle className="text-lg">Target Personas</CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(icp.personas) && icp.personas.length > 0 ? (
                    <div className="space-y-2">
                      {icp.personas.map((persona: any, idx: number) => (
                        <div key={idx} className="mb-2 p-2 rounded bg-muted/40">
                          <div className="font-semibold text-sm">{persona.title}{persona.role ? ` (${persona.role})` : ''}</div>
                          {persona.painPoints && Array.isArray(persona.painPoints) && (
                            <div className="text-xs text-gray-600 mt-1">
                              <span className="font-medium">Pain Points:</span>
                              <ul className="list-disc list-inside ml-4">
                                {persona.painPoints.map((pp: string, i: number) => (
                                  <li key={i}>{pp}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {persona.responsibilities && Array.isArray(persona.responsibilities) && (
                            <div className="text-xs text-gray-600 mt-1">
                              <span className="font-medium">Responsibilities:</span>
                              <ul className="list-disc list-inside ml-4">
                                {persona.responsibilities.map((r: string, i: number) => (
                                  <li key={i}>{r}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : <div className="text-xs text-gray-400">No personas available.</div>}
                </CardContent>
              </Card>
              {/* Firmographics */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-lg">Firmographics</CardTitle>
                </CardHeader>
                <CardContent>
                  {icp.firmographics && typeof icp.firmographics === 'object' ? (
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {Object.entries(icp.firmographics).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          <span>{String(value) || 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  ) : <div className="text-xs text-gray-400">No firmographics available.</div>}
                </CardContent>
              </Card>
              {/* Messaging Angles */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <CardTitle className="text-lg">Messaging Angles</CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(icp.messagingAngles) && icp.messagingAngles.length > 0 ? (
                    <ul className="list-disc list-inside ml-4 text-sm text-gray-600">
                      {icp.messagingAngles.map((m: string, i: number) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  ) : <div className="text-xs text-gray-400">No messaging angles available.</div>}
                </CardContent>
              </Card>
              {/* GTM Recommendations */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-pink-500" />
                  <CardTitle className="text-lg">GTM Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  {icp.gtmRecommendations ? (
                    <div className="text-sm text-gray-700 whitespace-pre-line">{icp.gtmRecommendations}</div>
                  ) : <div className="text-xs text-gray-400">No recommendations available.</div>}
                </CardContent>
              </Card>
              {/* Competitive Positioning */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-orange-500" />
                  <CardTitle className="text-lg">Competitive Positioning</CardTitle>
                </CardHeader>
                <CardContent>
                  {icp.competitivePositioning ? (
                    <div className="text-sm text-gray-700 whitespace-pre-line">{icp.competitivePositioning}</div>
                  ) : <div className="text-xs text-gray-400">No competitive positioning available.</div>}
                </CardContent>
              </Card>
              {/* Objection Handling */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <CardTitle className="text-lg">Objection Handling</CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(icp.objectionHandling) && icp.objectionHandling.length > 0 ? (
                    <ul className="list-disc list-inside ml-4 text-sm text-gray-600">
                      {icp.objectionHandling.map((o: string, i: number) => (
                        <li key={i}>{o}</li>
                      ))}
                    </ul>
                  ) : <div className="text-xs text-gray-400">No objection handling available.</div>}
                </CardContent>
              </Card>
              {/* Campaign Ideas */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-cyan-500" />
                  <CardTitle className="text-lg">Campaign Ideas</CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(icp.campaignIdeas) && icp.campaignIdeas.length > 0 ? (
                    <ul className="list-disc list-inside ml-4 text-sm text-gray-600">
                      {icp.campaignIdeas.map((c: string, i: number) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  ) : <div className="text-xs text-gray-400">No campaign ideas available.</div>}
                </CardContent>
              </Card>
              {/* Metrics to Track */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-lime-500" />
                  <CardTitle className="text-lg">Metrics to Track</CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(icp.metricsToTrack) && icp.metricsToTrack.length > 0 ? (
                    <ul className="list-disc list-inside ml-4 text-sm text-gray-600">
                      {icp.metricsToTrack.map((m: string, i: number) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  ) : <div className="text-xs text-gray-400">No metrics available.</div>}
                </CardContent>
              </Card>
              {/* Film Reviews */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <FileText className="h-5 w-5 text-violet-500" />
                  <CardTitle className="text-lg">Film Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {icp.filmReviews ? (
                    <div className="text-sm text-gray-700 whitespace-pre-line">{icp.filmReviews}</div>
                  ) : <div className="text-xs text-gray-400">No film reviews available.</div>}
                </CardContent>
              </Card>
              {/* Cross-Functional Alignment */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Users className="h-5 w-5 text-fuchsia-500" />
                  <CardTitle className="text-lg">Cross-Functional Alignment</CardTitle>
                </CardHeader>
                <CardContent>
                  {icp.crossFunctionalAlignment ? (
                    <div className="text-sm text-gray-700 whitespace-pre-line">{icp.crossFunctionalAlignment}</div>
                  ) : <div className="text-xs text-gray-400">No cross-functional alignment available.</div>}
                </CardContent>
              </Card>
              {/* Demand Generation Framework */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-lg">Demand Generation Framework</CardTitle>
                </CardHeader>
                <CardContent>
                  {icp.demandGenFramework ? (
                    <div className="text-sm text-gray-700 whitespace-pre-line">{icp.demandGenFramework}</div>
                  ) : <div className="text-xs text-gray-400">No demand generation framework available.</div>}
                </CardContent>
              </Card>
              {/* Iterative Measurement */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-sky-500" />
                  <CardTitle className="text-lg">Iterative Measurement</CardTitle>
                </CardHeader>
                <CardContent>
                  {icp.iterativeMeasurement ? (
                    <div className="text-sm text-gray-700 whitespace-pre-line">{icp.iterativeMeasurement}</div>
                  ) : <div className="text-xs text-gray-400">No iterative measurement available.</div>}
                </CardContent>
              </Card>
              {/* Training & Enablement */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-500" />
                  <CardTitle className="text-lg">Training & Enablement</CardTitle>
                </CardHeader>
                <CardContent>
                  {icp.trainingEnablement ? (
                    <div className="text-sm text-gray-700 whitespace-pre-line">{icp.trainingEnablement}</div>
                  ) : <div className="text-xs text-gray-400">No training & enablement available.</div>}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ICPGenerator;
