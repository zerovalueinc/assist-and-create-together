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
import { invokeEdgeFunction, getCompanyAnalysis } from '../lib/supabase/edgeClient';
import { CompanyReportCard } from './ui/CompanyReportCard';
import { CompanyReportPills } from './ui/CompanyReportPills';
import { GTMPlaybookModal } from './ui/GTMPlaybookModal';

// Set this to true to use the backend proxy for GTM Playbook
const USE_GTM_PROXY = true;

// Utility function to extract company name from a report object
function getCompanyName(report: any) {
  return (
    report.companyName ||
    report.company_name ||
    (report.overview && report.overview.company_name) ||
    (report.intel && report.intel.company_name) ||
    report.name ||
    'Untitled'
  );
}

function normalizeReportCompanyName(report: any) {
  let name = report.company_name;
  if (!name && report.company_overview) name = report.company_overview.company_name;
  if (!name && report.llm_output) {
    let canonical = report.llm_output;
    if (typeof canonical === 'string') {
      try { canonical = JSON.parse(canonical); } catch {}
    }
    name = canonical?.company_name || canonical?.company_overview?.company_name;
  }
  return { ...report, company_name: name || 'Untitled' };
}

// GTM Playbook Pills Components
function getPlaybookDomain(playbook: any): string {
  return playbook.companyUrl || playbook.website || '';
}

function getPlaybookName(playbook: any): string {
  return playbook.companyName || playbook.company_name || 'Untitled Playbook';
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}

function GTMPlaybookCard({ playbook, selected, onClick }: { playbook: any, selected: boolean, onClick: () => void }) {
  const name = getPlaybookName(playbook);
  const domain = getPlaybookDomain(playbook);
  const date = formatDate(playbook.created_at || playbook.createdAt);
  return (
    <Button
      variant={selected ? 'default' : 'outline'}
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1 text-sm ${selected ? 'ring-2 ring-primary' : ''}`}
      size="sm"
    >
      {domain && (
        <img src={`https://www.google.com/s2/favicons?domain=${domain}`} alt="favicon" className="w-4 h-4 mr-1" onError={e => { e.currentTarget.src = '/favicon.ico'; }} />
      )}
      <span>{name}</span>
      {date && <span className="text-xs text-muted-foreground ml-2">{date}</span>}
      {selected && <CheckCircle className="h-3 w-3 ml-1" />}
    </Button>
  );
}

function GTMPlaybookPills({ playbooks, selectedId, onSelect }: { playbooks: any[], selectedId: string | null, onSelect: (playbook: any) => void }) {
  if (!playbooks.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {playbooks.map((playbook) => (
        <GTMPlaybookCard
          key={playbook.id}
          playbook={playbook}
          selected={selectedId === playbook.id}
          onClick={() => onSelect(playbook)}
        />
      ))}
    </div>
  );
}

const GTMGenerator = () => {
  const [url, setUrl] = useState('');
  const [gtmPlaybook, setGtmPlaybook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useExistingAnalysis, setUseExistingAnalysis] = useState(false);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);
  const [selectedICP, setSelectedICP] = useState(null);
  const { toast } = useToast();
  const user = useUser();
  const session = useSession();
  const hasFetched = useRef(false);
  const { data: preloadData, loading: preloadLoading, retry: refreshData } = useDataPreload();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  // Use direct result from getCompanyAnalysis for pills
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    getCompanyAnalysis({ userId: user.id }).then((data) => {
      setReports(data);
      if (data.length > 0) {
        setSelectedReportId(data[0].id);
      }
    });
  }, [user?.id]);

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
        workspace_id: selectedCompany?.workspace_id,
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
          workspace_id: selectedCompany?.workspace_id,
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

  const [gtmPlaybooks, setGtmPlaybooks] = useState<any[]>([]);
  const [selectedPlaybook, setSelectedPlaybook] = useState<any | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    console.log('[GTMGenerator] Fetching GTM playbooks for user:', user.id);
    supabase
      .from('gtm_playbooks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        console.log('[GTMGenerator] GTM playbooks query result:', { data, error });
        setGtmPlaybooks(data || []);
      });
  }, [user?.id]);

  useEffect(() => {
    if (selectedPlaybook) {
      console.log('[GTMGenerator] selectedPlaybook changed:', selectedPlaybook);
    }
  }, [selectedPlaybook]);

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
            <div className="text-sm font-medium mb-1">Select Target Company</div>
            {reports.length > 0 && (
              <CompanyReportPills
                reports={reports}
                selectedId={selectedReportId}
                onSelect={(report) => {
                  setSelectedReportId(report.id);
                  setSelectedCompany(report);
                  setUrl(report.company_url || report.companyUrl || report.url || '');
                  setUseExistingAnalysis(true);
                }}
              />
            )}
          </div>

          <div className="mt-8">
            <div className="font-semibold text-base mb-1">Saved GTM Playbooks</div>
            <div className="flex flex-wrap gap-2 mb-4">
              {gtmPlaybooks.map(pb => (
                <button
                  key={pb.id}
                  className="rounded-full border px-4 py-1 text-sm bg-blue-100 hover:bg-blue-200"
                  onClick={() => {
                    console.log('[GTMGenerator] Clicked GTM playbook pill:', pb);
                    setSelectedPlaybook(pb);
                  }}
                >
                  {pb.company_name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <div className="font-semibold text-base mb-1">Select ICP Profile</div>
            {reportsWithICP.length > 0 && (
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
            )}
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

      {selectedPlaybook && (
        <GTMPlaybookModal
          open={!!selectedPlaybook}
          onClose={() => setSelectedPlaybook(null)}
          playbookData={selectedPlaybook}
          company={selectedPlaybook.company_name}
        />
      )}

      {reportsWithICP.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">No ICPs found. Generate a playbook first.</div>
      ) : selectedICP ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Ideal Customer Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderICPSection(selectedICP)}
          </CardContent>
        </Card>
      ) : (
        <div className="text-center text-muted-foreground py-8">Select an ICP from the pills above to view details.</div>
      )}
    </div>
  );
};

export default GTMGenerator;
