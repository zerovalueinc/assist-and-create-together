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
import supabase from '../lib/supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin;
const SUPABASE_FUNCTIONS_URL = `${window.location.origin}/functions/v1`;

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
  const { token, user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [recentICPs, setRecentICPs] = useState<any[]>([]);
  const [recentPlaybooks, setRecentPlaybooks] = useState<any[]>([]);
  const [playbook, setPlaybook] = useState<any>(null);
  const [gtmForm, setGtmForm] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  // Debug log for recentICPs
  console.log('recentICPs:', recentICPs);

  // Fetch analyzed companies (CompanyAnalyzer reports)
  useEffect(() => {
    if (!token) return;
    const fetchCompanies = async () => {
      const { data, error } = await supabase
        .from('company_analyses')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setCompanies(data.map((r: any) => ({
          ...r,
          companyUrl: r.website_url || r.companyUrl || r.url || r.websiteUrl || r.website || '',
          companyName: r.companyName || r.company_name || r.company || '',
        })));
      }
    };
    fetchCompanies();
  }, [token, user?.id]);

  // Fetch recent/generated ICPs
  useEffect(() => {
    if (!token) return;
    const fetchICPs = async () => {
      const { data, error } = await supabase
        .from('icp_analyses')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (!error && data) setRecentICPs(data);
    };
    fetchICPs();
  }, [token, user?.id, icp]);

  // Fetch recent playbooks
  useEffect(() => {
    if (!token) return;
    const fetchPlaybooks = async () => {
      const { data, error } = await supabase
        .from('playbook_analyses')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (!error && data) setRecentPlaybooks(data);
    };
    fetchPlaybooks();
  }, [token, user?.id, icp]);

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

  const handleGenerateICP = async (input: any) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('icp-generator', {
        body: input,
      });
      if (error) throw error;
      setLoading(false);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to generate ICP');
      setLoading(false);
      throw err;
    }
  };

  const handleGeneratePlaybook = async (input: any) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('playbook-generator', {
        body: input,
      });
      if (error) throw error;
      setLoading(false);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to generate playbook');
      setLoading(false);
      throw err;
    }
  };

  const startICPWorkflow = async () => {
    if (!selectedCompany) {
      toast({ title: "Select a company first", variant: "destructive" });
      return;
    }
    setLoading(true);
    setICP(null);
    setSessionId(null);
    try {
      const icpData = await handleGenerateICP({ websiteUrl: selectedCompany.companyUrl });
      setICP(icpData);
      toast({ title: "ICP Generated", description: "Review and augment the ICP below." });
    } catch (error: any) {
      toast({ title: "ICP Generation Failed", description: error.message || String(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const generatePlaybook = async () => {
    if (!selectedCompany || !icp || !gtmForm) {
      toast({ title: "Fill out all fields before generating playbook", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const playbookData = await handleGeneratePlaybook({ websiteUrl: selectedCompany.companyUrl, icp, gtmForm });
      setPlaybook(playbookData);
      toast({ title: "Playbook Generated", description: "Your GTM playbook is ready." });
    } catch (error: any) {
      toast({ title: "Playbook Generation Failed", description: error.message || String(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
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
        {icp && !playbook && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Review & Augment ICP</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Target Company Size</Label>
                  <Input
                    value={icp.firmographics?.companySize || ''}
                    onChange={e => setICP({ ...icp, firmographics: { ...icp.firmographics, companySize: e.target.value } })}
                    placeholder="e.g. 11-50"
                  />
                </div>
                <div>
                  <Label>Target Industries</Label>
                  <Input
                    value={icp.firmographics?.industry || ''}
                    onChange={e => setICP({ ...icp, firmographics: { ...icp.firmographics, industry: e.target.value } })}
                    placeholder="e.g. B2B SaaS, Technology"
                  />
                </div>
                <div>
                  <Label>Buyer Personas</Label>
                  <Textarea
                    value={icp.personas?.map(p => `${p.title} (${p.role}${p.painPoints?.length ? ', ' + p.painPoints.join('; ') : ''})`).join('\n') || ''}
                    onChange={e => setICP({ ...icp, personas: e.target.value.split('\n').map(line => { const [title, rest] = line.split(' ('); if (!rest) return { title: line, role: '', painPoints: [] }; const [role, painPoints] = rest.replace(')', '').split(', '); return { title, role, painPoints: painPoints ? painPoints.split(';').map(s => s.trim()) : [] }; }) })}
                    placeholder="e.g. VP of Sales (Sales leadership, pain1; pain2)"
                  />
                </div>
              </CardContent>
            </Card>
            {/* GTM Form Section */}
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold">GTM Form</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>GTM Strategy</Label>
                  <Input
                    value={gtmForm.strategy || ''}
                    onChange={e => setGtmForm({ ...gtmForm, strategy: e.target.value })}
                    placeholder="e.g. Outbound, ABM, Product-led, etc."
                  />
                </div>
                <div>
                  <Label>Primary Channels</Label>
                  <Input
                    value={gtmForm.channels || ''}
                    onChange={e => setGtmForm({ ...gtmForm, channels: e.target.value })}
                    placeholder="e.g. Email, LinkedIn, Events"
                  />
                </div>
                <div>
                  <Label>Goals</Label>
                  <Input
                    value={gtmForm.goals || ''}
                    onChange={e => setGtmForm({ ...gtmForm, goals: e.target.value })}
                    placeholder="e.g. Meetings booked, pipeline, revenue"
                  />
                </div>
                <div>
                  <Label>Budget</Label>
                  <Input
                    value={gtmForm.budget || ''}
                    onChange={e => setGtmForm({ ...gtmForm, budget: e.target.value })}
                    placeholder="e.g. $10,000/month"
                  />
                </div>
                <div>
                  <Label>Timeline</Label>
                  <Input
                    value={gtmForm.timeline || ''}
                    onChange={e => setGtmForm({ ...gtmForm, timeline: e.target.value })}
                    placeholder="e.g. Q3 2024"
                  />
                </div>
              </CardContent>
            </Card>
            {/* Generate Playbook Button */}
            <Button
              onClick={generatePlaybook}
              disabled={loading || !icp.firmographics?.companySize || !icp.firmographics?.industry || !icp.personas?.length || !gtmForm.strategy || !gtmForm.channels || !gtmForm.goals || !gtmForm.budget || !gtmForm.timeline}
              className="w-full h-12 text-base font-medium mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating Playbook...
                </>
              ) : (
                <>
                  <Rocket className="h-5 w-5 mr-2" />
                  Generate Playbook
                </>
              )}
            </Button>
          </div>
        )}

        {/* Playbook Result */}
        {playbook && (
          <Card className="bg-gradient-to-r from-pink-50 to-pink-100 border-pink-200 mt-8">
            <CardHeader className="flex flex-row items-center gap-3">
              <FileText className="h-6 w-6 text-pink-500" />
              <CardTitle className="text-xl font-bold">Generated GTM Playbook</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <strong>Summary:</strong>
                <div className="text-base text-gray-700 whitespace-pre-line">{playbook.summary}</div>
              </div>
              <div className="mb-4">
                <strong>Steps:</strong>
                <ol className="list-decimal ml-6 text-base text-gray-700">
                  {playbook.steps?.map((step: string, idx: number) => <li key={idx}>{step}</li>)}
                </ol>
              </div>
              <div className="mb-4">
                <strong>ICP Used:</strong>
                <pre className="bg-slate-100 rounded p-2 text-xs overflow-x-auto">{JSON.stringify(playbook.icpUsed, null, 2)}</pre>
              </div>
              <div className="mb-4">
                <strong>GTM Form Used:</strong>
                <pre className="bg-slate-100 rounded p-2 text-xs overflow-x-auto">{JSON.stringify(playbook.gtmFormUsed, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default ICPGenerator;
