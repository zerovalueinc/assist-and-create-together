import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Target, Users, Building2, MapPin, DollarSign, ArrowUpRight, Lightbulb, BarChart2, ClipboardList, TrendingUp, FileText, CheckCircle, AlertTriangle } from "lucide-react";
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
  const [companyInfo, setCompanyInfo] = useState('');
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

  // Debug log for recentICPs
  console.log('recentICPs:', recentICPs);

  // Fetch analyzed companies (CompanyAnalyzer reports)
  useEffect(() => {
    const fetchCompanies = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/company-analyze/reports`, {
          headers: { 'Authorization': `Bearer ${token}` },
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
  }, [token]);

  // Fetch recent/generated ICPs
  useEffect(() => {
    const fetchICPs = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/icp/reports`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) setRecentICPs(data.icps);
        else console.error('Failed to fetch ICPs:', data);
      } catch (err) {
        console.error('Error fetching ICPs:', err);
      }
    };
    fetchICPs();
  }, [token, icp]);

  // Fetch recent playbooks
  useEffect(() => {
    const fetchPlaybooks = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/icp/playbooks`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) setRecentPlaybooks(data.playbooks);
      } catch (err) {
        console.error('Error fetching playbooks:', err);
      }
    };
    fetchPlaybooks();
  }, [token, icp]);

  // 1. On mount, auto-load the most recent saved playbook if icp is null
  useEffect(() => {
    if (!icp && recentICPs.length > 0) {
      try {
        const latest = recentICPs[0];
        const parsed = GTMICPSchemaZod.safeParse(JSON.parse(latest.icpData));
        if (parsed.success) {
          setICP(parsed.data as GTMICPSchema);
        } else {
          toast({ title: 'Invalid GTM playbook', description: 'Saved playbook failed schema validation.', variant: 'destructive' });
        }
      } catch {
        toast({ title: 'Error loading playbook', description: 'Failed to parse saved playbook.', variant: 'destructive' });
      }
    }
  }, [recentICPs, icp]);

  // 2. When a company is selected, auto-load the saved playbook for that company (if available)
  useEffect(() => {
    if (selectedCompany && recentICPs.length > 0) {
      const match = recentICPs.find((icp) => icp.companyUrl === selectedCompany.companyUrl);
      if (match) {
        try {
          const parsed = GTMICPSchemaZod.safeParse(JSON.parse(match.icpData));
          if (parsed.success) {
            setICP(parsed.data as GTMICPSchema);
          } else {
            toast({ title: 'Invalid GTM playbook', description: 'Saved playbook failed schema validation.', variant: 'destructive' });
          }
        } catch {
          toast({ title: 'Error loading playbook', description: 'Failed to parse saved playbook.', variant: 'destructive' });
        }
      } else {
        setICP(null); // Clear if no saved playbook for this company
      }
    }
  }, [selectedCompany, recentICPs]);

  const startICPWorkflow = async () => {
    if (!selectedCompany && !companyInfo) {
      toast({
        title: "Company Selection Required",
        description: "Please select a company or provide company information.",
        variant: "destructive",
      });
      return;
    }
    if (selectedCompany && !selectedCompany.companyUrl) {
      toast({
        title: "Missing Company URL",
        description: "The selected company is missing a valid URL. Please analyze a company with a valid website.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setICP(null);
    setSessionId(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/workflow/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          workflowName: 'icp-generator',
          params: {
            url: selectedCompany?.companyUrl || '',
            comprehensive: false,
            userId: user?.id,
            userInput: companyInfo,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to start ICP workflow');
      }
      setSessionId(data.sessionId);
      toast({
        title: "ICP Generation Started",
        description: "Your ICP is being generated. This may take a moment.",
      });
      pollWorkflowState(data.sessionId);
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to start ICP workflow.",
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
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        const data = await response.json();
        if (data.success && data.state) {
          if (data.state.status === 'completed') {
            setICP(data.state.result as GTMICPSchema);
            setLoading(false);
            toast({
              title: "ICP Generated",
              description: "Ideal Customer Profile has been created successfully.",
            });
            // Auto-save the result to the backend
            try {
              await fetch(`${API_BASE_URL}/api/icp/save`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                  companyUrl: selectedCompany?.companyUrl || '',
                  icpData: data.state.result,
                }),
              });
            } catch (saveErr) {
              console.error('Failed to save GTM ICP result:', saveErr);
            }
            return;
          } else if (data.state.status === 'failed') {
            setLoading(false);
            toast({
              title: "Generation Failed",
              description: data.state.error || "ICP generation failed.",
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
            description: "ICP generation took too long. Please try again.",
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
          <Target className="h-5 w-5" />
          <span>GTM Generator</span>
        </CardTitle>
        <CardDescription>
          <span className="font-semibold">Step 2 of 5:</span> Select a company and generate an Ideal Customer Profile based on your company analysis and additional input.
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
                else parsed = null;
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
                    else toast({ title: 'Invalid GTM playbook', description: 'This playbook could not be loaded.', variant: 'destructive' });
                  }}
                  aria-label={`Load GTM playbook for ${icpObj.companyName || icpObj.companyUrl}`}
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
          <label className="text-sm font-medium">Select Company</label>
          <div className="flex flex-wrap gap-2">
            {companies.length === 0 && <span className="text-gray-500 text-sm">No companies analyzed yet.</span>}
            {companies.map((c) => (
              <Button
                key={c.id}
                variant={selectedCompany?.id === c.id ? 'secondary' : 'outline'}
                onClick={() => setSelectedCompany(c)}
                className="flex items-center gap-2 px-3 py-1 text-sm"
                size="sm"
              >
                <img src={`https://www.google.com/s2/favicons?domain=${c.companyUrl}`} alt="favicon" className="w-4 h-4 mr-1" />
                {c.companyName || c.companyUrl}
                {selectedCompany?.id === c.id && <ArrowUpRight className="h-3 w-3 ml-1" />}
              </Button>
            ))}
          </div>
        </div>
        {/* User Input */}
        <div className="space-y-4">
          <label htmlFor="companyInfo" className="text-sm font-medium">Additional Company Info</label>
          <Textarea
            id="companyInfo"
            name="companyInfo"
            value={companyInfo}
            onChange={(e) => setCompanyInfo(e.target.value)}
            placeholder="Add any extra info about the company here..."
            className="min-h-[100px]"
            disabled={loading}
          />
          <Button onClick={startICPWorkflow} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating ICP...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Generate ICP
              </>
            )}
          </Button>
        </div>

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
