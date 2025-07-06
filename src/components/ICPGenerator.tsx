import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Target, Users, Building2, MapPin, DollarSign, ArrowUpRight, Lightbulb, BarChart2, ClipboardList, TrendingUp, FileText, CheckCircle, AlertTriangle, Rocket, Globe, Zap, RefreshCw, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCompany } from "@/context/CompanyContext";
import { useUser, useSession } from '@supabase/auth-helpers-react';
import type { GTMICPSchema } from "@/schema/gtm_icp_schema";
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { supabase } from '../lib/supabase'; // See README for global pattern
import { capitalizeFirstLetter, getCache, setCache } from '../lib/utils';
import { useDataPreload } from '@/context/DataPreloadProvider';
import { getCompanyAnalysis } from '../lib/supabase/edgeClient';
import { CompanyReportCard } from './ui/CompanyReportCard';
import { GTMPlaybookModal } from './ui/GTMPlaybookModal';

const SUPABASE_FUNCTIONS_BASE = 'https://hbogcsztrryrepudceww.functions.supabase.co';

const GTMICPSchemaZod = z.object({
  schemaVersion: z.string().optional(),
  personas: z.array(z.object({
    title: z.string(),
    role: z.string(),
    painPoints: z.array(z.string()),
    responsibilities: z.array(z.string())
  })).optional(),
  firmographics: z.object({
    industry: z.string(),
    companySize: z.string(),
    revenueRange: z.string(),
    region: z.string()
  }).optional(),
  messagingAngles: z.array(z.string()).optional(),
  gtmRecommendations: z.string().optional(),
  competitivePositioning: z.string().optional(),
  objectionHandling: z.array(z.string()).optional(),
  campaignIdeas: z.array(z.string()).optional(),
  metricsToTrack: z.array(z.string()).optional(),
  filmReviews: z.string().optional(),
  crossFunctionalAlignment: z.string().optional(),
  demandGenFramework: z.string().optional(),
  iterativeMeasurement: z.string().optional(),
  trainingEnablement: z.string().optional(),
  apolloSearchParams: z.object({
    employeeCount: z.string(),
    titles: z.array(z.string()),
    industries: z.array(z.string()),
    technologies: z.array(z.string()),
    locations: z.array(z.string())
  }).optional()
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
  const user = useUser();
  const session = useSession();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { data: preloadData, retry: refreshData } = useDataPreload();
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [recentPlaybooks, setRecentPlaybooks] = useState<any[]>([]);
  const [showICPModal, setShowICPModal] = useState(false);
  const [modalICP, setModalICP] = useState<any>(null);
  const [availableCompanies, setAvailableCompanies] = useState<any[]>([]);
  const [showPlaybookModal, setShowPlaybookModal] = useState(false);
  const [playbookData, setPlaybookData] = useState(null);
  const [savedPlaybooks, setSavedPlaybooks] = useState<any[]>([]);
  const [showSavedPlaybooksModal, setShowSavedPlaybooksModal] = useState(false);

  // Debug log for recentReports (only when it changes)
  useEffect(() => {
    console.log('recentReports updated:', recentReports);
  }, [recentReports]);

  // Add a refresh function for company analyses
  const handleRefreshCompanies = () => {
    refreshData();
    toast({
      title: "Refreshing",
      description: "Updating available company analyses...",
    });
  };

  // Add a refresh function for saved playbooks
  const handleRefreshPlaybooks = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('gtm_playbooks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error refreshing playbooks:', error);
        toast({
          title: "Error",
          description: "Failed to refresh playbooks",
          variant: "destructive",
        });
        return;
      }
      
      setSavedPlaybooks(data || []);
      toast({
        title: "Refreshed",
        description: "Updated saved playbooks",
      });
    } catch (error) {
      console.error('Error refreshing playbooks:', error);
      toast({
        title: "Error",
        description: "Failed to refresh playbooks",
        variant: "destructive",
      });
    }
  };

  // Fetch recent/generated reports with embedded ICP profiles
  const hasFetchedReports = useRef(false);

  useEffect(() => {
    if (!user) return;
    getCompanyAnalysis({ userId: user.id }).then((data) => {
      setAvailableCompanies(data);
      setRecentReports(data);
      hasFetchedReports.current = true;
    });
  }, [user]);

  // Fetch saved GTM playbooks
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchSavedPlaybooks = async () => {
      try {
        const { data, error } = await supabase
          .from('gtm_playbooks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching saved playbooks:', error);
          return;
        }
        
        setSavedPlaybooks(data || []);
        console.log('Loaded saved playbooks:', data);
      } catch (error) {
        console.error('Error fetching saved playbooks:', error);
      }
    };

    fetchSavedPlaybooks();
  }, [user?.id]);

  // Auto-select company when reports are loaded
  useEffect(() => {
    if (selectedCompany && recentReports.length > 0) {
      const match = recentReports.find((report) => report.company_url === selectedCompany.companyUrl);
      if (match) {
        try {
          const parsed = GTMICPSchemaZod.safeParse(match.icp_profile);
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
  }, [selectedCompany, recentReports]);

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

  const handleSubmit = async () => {
    if (!selectedCompany) {
      toast({ title: "No company selected", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        websiteUrl: selectedCompany.website || selectedCompany.companyUrl,
        useExistingAnalysis: true,
        analysisId: selectedCompany.id,
        gtmFormAnswers: {
          playbookType,
          productStage,
          channelExpansion,
          targetMarket,
          salesCycle,
          competitivePosition,
          primaryGoals,
          marketingChannels,
          additionalContext,
        },
        selectedCompany,
      };
      const response = await fetch('/api/gtm-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        toast({ title: "GTM Playbook Generated", description: "Your playbook is ready!" });
        // Map the API response to the expected modal structure
        const modalData = {
          gtmPlaybook: result.gtmPlaybook || result.playbook || result.data,
          researchSummary: result.researchSummary || result.summary || 'GTM Playbook generated successfully',
          confidence: result.confidence || 85,
          sources: result.sources || ['Company Analysis', 'Market Research'],
        };
        console.log('Setting playbook data for modal:', modalData);
        setPlaybookData(modalData);
        setShowPlaybookModal(true);
        
        // Refresh the saved playbooks list
        const { data: updatedPlaybooks, error } = await supabase
          .from('gtm_playbooks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (!error) {
          setSavedPlaybooks(updatedPlaybooks || []);
        }
      } else {
        toast({ title: "Generation Failed", description: result.error || "Unknown error", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Generation Failed", description: error.message || "Unknown error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openICPModal = (report: any) => {
    setModalICP(report.icp_profile);
    setShowICPModal(true);
  };

  const openSavedPlaybook = (playbook: any) => {
    console.log('Opening saved playbook:', playbook);
    console.log('Playbook structure:', {
      id: playbook.id,
      companyName: playbook.companyName,
      website: playbook.website,
      playbook: playbook.playbook,
      playbookKeys: playbook.playbook ? Object.keys(playbook.playbook) : 'No playbook field'
    });
    console.log('Full playbook object:', JSON.stringify(playbook, null, 2));
    console.log('Playbook.playbook field:', JSON.stringify(playbook.playbook, null, 2));
    
    // The playbook.playbook field contains the full GTM playbook structure
    // We need to extract the gtmPlaybook from it
    let gtmPlaybookData = null;
    let researchSummary = 'Saved GTM Playbook';
    let confidence = 85;
    let sources = ['Saved Analysis'];
    
    if (playbook.playbook) {
      // The playbook field contains the full structure with gtmPlaybook nested inside
      if (playbook.playbook.gtmPlaybook) {
        gtmPlaybookData = playbook.playbook.gtmPlaybook;
        researchSummary = playbook.playbook.researchSummary || researchSummary;
        confidence = playbook.playbook.confidence || confidence;
        sources = playbook.playbook.sources || sources;
      } else if (playbook.playbook.executiveSummary) {
        // If it has executiveSummary, it's already a gtmPlaybook structure
        gtmPlaybookData = playbook.playbook;
      } else {
        // If no gtmPlaybook field, the playbook itself might be the gtmPlaybook
        gtmPlaybookData = playbook.playbook;
      }
    }
    
    // Also check for other possible field names
    if (!gtmPlaybookData && playbook.playbook_data) {
      gtmPlaybookData = playbook.playbook_data.gtmPlaybook || playbook.playbook_data;
      researchSummary = playbook.playbook_data.researchSummary || researchSummary;
      confidence = playbook.playbook_data.confidence || confidence;
      sources = playbook.playbook_data.sources || sources;
    }
    
    if (!gtmPlaybookData && playbook.icp_data) {
      gtmPlaybookData = playbook.icp_data;
    }
    
    console.log('Extracted gtmPlaybook data:', gtmPlaybookData);
    
    // Map the saved playbook data to the expected modal structure
    const modalData = {
      gtmPlaybook: gtmPlaybookData,
      researchSummary: researchSummary,
      confidence: confidence,
      sources: sources,
    };
    
    // Create a company object for the modal
    const companyData = {
      companyName: playbook.companyName,
      website: playbook.website,
      companyUrl: playbook.website,
    };
    setPlaybookData(modalData);
    setSelectedCompany(companyData);
    setShowPlaybookModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">GTM Playbook Generator</h2>
          <p className="text-muted-foreground">
            Generate comprehensive go-to-market strategies based on company analysis
          </p>
        </div>
        <Button onClick={handleRefreshCompanies} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Recent Reports with ICP Profiles */}
      {recentReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Company Analysis Reports with ICP Profiles
            </CardTitle>
            <CardDescription>
              Select a company to generate a GTM playbook based on its analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {recentReports.map((report) => (
                <CompanyReportCard
                  key={report.id}
                  report={report}
                  selected={selectedCompany?.id === report.id}
                  onClick={() => setSelectedCompany(report)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved GTM Playbooks */}
      {savedPlaybooks.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  Saved GTM Playbooks
                </CardTitle>
                <CardDescription>
                  Your previously generated GTM playbooks
                </CardDescription>
              </div>
              <Button onClick={handleRefreshPlaybooks} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {savedPlaybooks.map((playbook) => (
                <Button
                  key={playbook.id}
                  variant="outline"
                  onClick={() => openSavedPlaybook(playbook)}
                  className="flex items-center gap-2 px-3 py-1 text-sm"
                  size="sm"
                >
                  <img 
                    src={`https://www.google.com/s2/favicons?domain=${playbook.website?.replace(/^https?:\/\//, '') || ''}`} 
                    alt="favicon" 
                    className="w-4 h-4 mr-1" 
                    onError={e => { e.currentTarget.src = '/favicon.ico'; }} 
                  />
                  {playbook.companyName || 'Untitled Playbook'}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ICP Modal */}
      <Dialog open={showICPModal} onOpenChange={setShowICPModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ICP Profile Details</DialogTitle>
            <DialogDescription>
              Comprehensive Ideal Customer Profile analysis
            </DialogDescription>
          </DialogHeader>
          {modalICP && (
            <div className="space-y-6">
              {/* Personas */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">Buyer Personas</CardTitle>
                </CardHeader>
                <CardContent>
                  {modalICP.personas ? (
                    <div className="space-y-3">
                      {modalICP.personas.map((persona: any, index: number) => (
                        <div key={index} className="border rounded-lg p-3">
                          <h4 className="font-semibold">{persona.title}</h4>
                          <p className="text-sm text-gray-600">{persona.role}</p>
                          {persona.painPoints && (
                            <div className="mt-2">
                              <span className="text-xs font-medium text-gray-500">Pain Points:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {persona.painPoints.map((point: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {point}
                                  </Badge>
                                ))}
                              </div>
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
                  <Building2 className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-lg">Firmographics</CardTitle>
                </CardHeader>
                <CardContent>
                  {modalICP.firmographics ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-medium text-gray-500">Industry</span>
                        <p className="text-sm">{modalICP.firmographics.industry}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">Company Size</span>
                        <p className="text-sm">{modalICP.firmographics.companySize}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">Revenue Range</span>
                        <p className="text-sm">{modalICP.firmographics.revenueRange}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">Region</span>
                        <p className="text-sm">{modalICP.firmographics.region}</p>
                      </div>
                    </div>
                  ) : <div className="text-xs text-gray-400">No firmographics available.</div>}
                </CardContent>
              </Card>

              {/* Messaging Angles */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-lg">Messaging Angles</CardTitle>
                </CardHeader>
                <CardContent>
                  {modalICP.messagingAngles ? (
                    <div className="flex flex-wrap gap-2">
                      {modalICP.messagingAngles.map((angle: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {angle}
                        </Badge>
                      ))}
                    </div>
                  ) : <div className="text-xs text-gray-400">No messaging angles available.</div>}
                </CardContent>
              </Card>

              {/* GTM Recommendations */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Rocket className="h-5 w-5 text-orange-500" />
                  <CardTitle className="text-lg">GTM Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  {modalICP.gtmRecommendations ? (
                    <div className="text-sm text-gray-700 whitespace-pre-line">{modalICP.gtmRecommendations}</div>
                  ) : <div className="text-xs text-gray-400">No GTM recommendations available.</div>}
                </CardContent>
              </Card>

              {/* Training & Enablement */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-500" />
                  <CardTitle className="text-lg">Training & Enablement</CardTitle>
                </CardHeader>
                <CardContent>
                  {modalICP.trainingEnablement ? (
                    <div className="text-sm text-gray-700 whitespace-pre-line">{modalICP.trainingEnablement}</div>
                  ) : <div className="text-xs text-gray-400">No training & enablement available.</div>}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* GTM Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle>GTM Configuration</CardTitle>
          <CardDescription>
            Configure your go-to-market strategy parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Playbook Type */}
          <div className="space-y-2">
            <Label>Playbook Type</Label>
            <Select value={playbookType} onValueChange={setPlaybookType}>
              <SelectTrigger>
                <SelectValue placeholder="Select playbook type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="mid-market">Mid-Market</SelectItem>
                <SelectItem value="startup">Startup</SelectItem>
                <SelectItem value="scale-up">Scale-Up</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Product Stage */}
          <div className="space-y-2">
            <Label>Product Stage</Label>
            <Select value={productStage} onValueChange={setProductStage}>
              <SelectTrigger>
                <SelectValue placeholder="Select product stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mvp">MVP</SelectItem>
                <SelectItem value="product-market-fit">Product-Market Fit</SelectItem>
                <SelectItem value="growth">Growth</SelectItem>
                <SelectItem value="scale">Scale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Channel Expansion */}
          <div className="space-y-2">
            <Label>Channel Expansion</Label>
            <Select value={channelExpansion} onValueChange={setChannelExpansion}>
              <SelectTrigger>
                <SelectValue placeholder="Select channel strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct-sales">Direct Sales</SelectItem>
                <SelectItem value="partnerships">Partnerships</SelectItem>
                <SelectItem value="digital-marketing">Digital Marketing</SelectItem>
                <SelectItem value="multi-channel">Multi-Channel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target Market */}
          <div className="space-y-2">
            <Label>Target Market</Label>
            <Select value={targetMarket} onValueChange={setTargetMarket}>
              <SelectTrigger>
                <SelectValue placeholder="Select target market" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="domestic">Domestic</SelectItem>
                <SelectItem value="international">International</SelectItem>
                <SelectItem value="global">Global</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sales Cycle */}
          <div className="space-y-2">
            <Label>Sales Cycle</Label>
            <Select value={salesCycle} onValueChange={setSalesCycle}>
              <SelectTrigger>
                <SelectValue placeholder="Select sales cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short (1-3 months)</SelectItem>
                <SelectItem value="medium">Medium (3-6 months)</SelectItem>
                <SelectItem value="long">Long (6+ months)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Competitive Position */}
          <div className="space-y-2">
            <Label>Competitive Position</Label>
            <Select value={competitivePosition} onValueChange={setCompetitivePosition}>
              <SelectTrigger>
                <SelectValue placeholder="Select competitive position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market-leader">Market Leader</SelectItem>
                <SelectItem value="challenger">Challenger</SelectItem>
                <SelectItem value="niche">Niche Player</SelectItem>
                <SelectItem value="new-entrant">New Entrant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Primary Goals */}
          <div className="space-y-2">
            <Label>Primary Goals</Label>
            <div className="grid grid-cols-2 gap-4">
              {[
                'Revenue Growth',
                'Market Share',
                'Customer Acquisition',
                'Brand Awareness',
                'Product Adoption',
                'Customer Retention'
              ].map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={goal}
                    checked={primaryGoals.includes(goal)}
                    onCheckedChange={(checked) => handleGoalChange(goal, checked === true)}
                  />
                  <Label htmlFor={goal} className="text-sm">{goal}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Marketing Channels */}
          <div className="space-y-2">
            <Label>Marketing Channels</Label>
            <div className="grid grid-cols-2 gap-4">
              {[
                'Content Marketing',
                'Social Media',
                'Email Marketing',
                'SEO/SEM',
                'Events/Webinars',
                'Influencer Marketing',
                'PR',
                'Direct Mail'
              ].map((channel) => (
                <div key={channel} className="flex items-center space-x-2">
                  <Checkbox
                    id={channel}
                    checked={marketingChannels.includes(channel)}
                    onCheckedChange={(checked) => handleChannelChange(channel, checked === true)}
                  />
                  <Label htmlFor={channel} className="text-sm">{channel}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Context */}
          <div className="space-y-2">
            <Label>Additional Context</Label>
            <Textarea
              placeholder="Any additional context, constraints, or specific requirements..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="flex gap-4">
        <Button 
          onClick={handleSubmit} 
          disabled={!selectedCompany || loading}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating GTM Playbook...
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-4 w-4" />
              Generate GTM Playbook
            </>
          )}
        </Button>
        {icp && (
          <Button onClick={handleSubmit} variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Save Playbook
          </Button>
        )}
      </div>

      {/* Generated ICP Display */}
      {icp && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Generated GTM Playbook
            </CardTitle>
            <CardDescription>
              Comprehensive go-to-market strategy for {selectedCompany?.companyName || selectedCompany?.company_name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personas */}
            {icp.personas && icp.personas.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Buyer Personas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {icp.personas.map((persona, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <h4 className="font-semibold">{persona.title}</h4>
                        <p className="text-sm text-muted-foreground">{persona.role}</p>
                        {persona.painPoints && persona.painPoints.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-medium">Pain Points:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {persona.painPoints.map((point, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {point}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Firmographics */}
            {icp.firmographics && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Firmographics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Industry</span>
                    <p>{icp.firmographics.industry}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Company Size</span>
                    <p>{icp.firmographics.companySize}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Revenue Range</span>
                    <p>{icp.firmographics.revenueRange}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Region</span>
                    <p>{icp.firmographics.region}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Messaging Angles */}
            {icp.messagingAngles && icp.messagingAngles.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Messaging Angles</h3>
                <div className="flex flex-wrap gap-2">
                  {icp.messagingAngles.map((angle, index) => (
                    <Badge key={index} variant="outline">
                      {angle}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* GTM Recommendations */}
            {icp.gtmRecommendations && (
              <div>
                <h3 className="text-lg font-semibold mb-3">GTM Recommendations</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="whitespace-pre-line">{icp.gtmRecommendations}</p>
                </div>
              </div>
            )}

            {/* Apollo Search Parameters */}
            {icp.apolloSearchParams && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Apollo Search Parameters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Employee Count</span>
                    <p>{icp.apolloSearchParams.employeeCount}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Titles</span>
                    <div className="flex flex-wrap gap-1">
                      {icp.apolloSearchParams.titles.map((title, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Industries</span>
                    <div className="flex flex-wrap gap-1">
                      {icp.apolloSearchParams.industries.map((industry, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {industry}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Locations</span>
                    <div className="flex flex-wrap gap-1">
                      {icp.apolloSearchParams.locations.map((location, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {location}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <GTMPlaybookModal open={showPlaybookModal} onClose={() => setShowPlaybookModal(false)} playbookData={playbookData} company={selectedCompany} />
    </div>
  );
};

export default ICPGenerator;
