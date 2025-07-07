import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Upload, Download, Search, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useSession } from '@supabase/auth-helpers-react';
import { SectionLabel } from "./ui/section-label";
import { getCache, setCache } from '../lib/utils';
import { useUserData } from '../hooks/useUserData';
import { supabase } from '../lib/supabase';

const LeadEnrichment = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const session = useSession();
  const [pipelineId, setPipelineId] = useState<string | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [intelReport, setIntelReport] = useState<any>(null);
  const [gtmPlaybook, setGtmPlaybook] = useState<any>(null);
  const [availableIntelReports, setAvailableIntelReports] = useState<any[]>([]);
  const [availableGtmPlaybooks, setAvailableGtmPlaybooks] = useState<any[]>([]);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const searchLeads = async () => {
    if (!searchQuery) {
      toast({
        title: "Search Query Required",
        description: "Please enter search criteria to find leads.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Connect to your /api/leads endpoint
      const response = await fetch('/api/app/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error('Lead search failed');
      }

      const data = await response.json();
      setLeads(data.leads || []);
      setCache('lead_enrichment_leads', data.leads || []);
      
      toast({
        title: "Leads Found",
        description: `Found ${data.leads?.length || 0} potential leads.`,
      });
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Failed to search for leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const enrichLead = async (leadId) => {
    try {
      const response = await fetch('/api/app/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ leadId }),
      });

      if (!response.ok) {
        throw new Error('Enrichment failed');
      }

      toast({
        title: "Lead Enriched",
        description: "Lead data has been enriched successfully.",
      });
    } catch (error) {
      toast({
        title: "Enrichment Failed",
        description: "Failed to enrich lead data.",
        variant: "destructive",
      });
    }
  };

  // Show cached leads instantly
  useEffect(() => {
    const cachedLeads = getCache<any[]>('lead_enrichment_leads', []);
    if (cachedLeads.length > 0) setLeads(cachedLeads);
  }, []);

  // Fetch available Intel reports for selection (client-side, instant, GTM-style)
  const fetchIntelReports = async () => {
    if (!session?.user?.id) return;
    try {
      const { data, error } = await supabase
        .from('company_analyzer_outputs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAvailableIntelReports(data || []);
      console.log('[LeadEnrichment] Fetched Intel reports for user:', session.user.id, data);
    } catch (error) {
      console.error('Error fetching Intel reports:', error);
      setAvailableIntelReports([]);
    }
  };

  const fetchGtmPlaybooks = async () => {
    if (!session?.user?.id) return;
    try {
      const { data, error } = await supabase
        .from('gtm_playbooks')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAvailableGtmPlaybooks(data || []);
    } catch (error) {
      console.error('Error fetching GTM playbooks:', error);
      setAvailableGtmPlaybooks([]);
    }
  };

  useEffect(() => {
    fetchIntelReports();
    fetchGtmPlaybooks();
  }, [session?.user?.id]);

  // Poll for pipeline results
  useEffect(() => {
    if (pipelineId && pipelineStatus === 'running') {
      const interval = setInterval(async () => {
        try {
          const response = await fetch('/api/pipeline-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
            },
            body: JSON.stringify({ pipelineId }),
          });
          const data = await response.json();
          if (response.ok) {
            setPipelineStatus(data.status);
            if (data.status === 'completed') {
              // Fetch results
              await fetchPipelineResults();
              setPollingInterval(null);
            } else if (data.status === 'failed') {
              toast({ title: 'Pipeline Failed', description: data.error || 'Pipeline failed', variant: 'destructive' });
              setPollingInterval(null);
            }
          }
        } catch (error) {
          console.error('Error polling pipeline:', error);
        }
      }, 2000); // Poll every 2 seconds
      setPollingInterval(interval);
    }
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pipelineId, pipelineStatus, session?.access_token]);

  const fetchPipelineResults = async () => {
    try {
      // Fetch companies and contacts from Supabase
      const companiesResponse = await fetch('/api/companies', {
        method: 'GET',
        headers: {
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
      });
      if (companiesResponse.ok) {
        const companiesData = await companiesResponse.json();
        setCompanies(companiesData.companies || []);
      }

      const contactsResponse = await fetch('/api/contacts', {
        method: 'GET',
        headers: {
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
      });
      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        setContacts(contactsData.contacts || []);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const triggerPipeline = async () => {
    if (!intelReport || !intelReport.icp_id) {
      toast({
        title: 'Intel Report Required',
        description: 'You must select a valid Intel Report before running the pipeline.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    setPipelineStatus(null);
    setPipelineId(null);
    setCompanies([]);
    setContacts([]);
    try {
      const payload = {
        icpId: intelReport.icp_id, // Use the correct icpId from the selected Intel Report
        intelReportId: intelReport.id,
        gtmPlaybookId: gtmPlaybook?.id,
      };
      console.log('[LeadEnrichment] Triggering pipeline with payload:', payload);
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      console.log('[LeadEnrichment] Pipeline response status:', response.status);
      const data = await response.json().catch(() => ({}));
      console.log('[LeadEnrichment] Pipeline response data:', data);
      if (!response.ok) throw new Error(data.error || 'Pipeline failed');
      setPipelineId(data.pipelineId);
      setPipelineStatus(data.status);
      toast({ title: 'Pipeline Started', description: data.message || 'Pipeline started.' });
    } catch (error: any) {
      console.error('[LeadEnrichment] Pipeline Error:', error);
      toast({ title: 'Pipeline Error', description: error.message || error.toString(), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <SectionLabel>Lead Enrichment</SectionLabel>
        </CardTitle>
        <CardDescription>
          Search, enrich, and qualify leads using AI-powered intelligence
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pipeline Trigger Section */}
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter ICP ID or search criteria"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button onClick={triggerPipeline} disabled={loading || !intelReport || !intelReport.icp_id}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Pipeline...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Run Pipeline
                </>
              )}
            </Button>
          </div>
          {/* Intel and GTM Selection Dropdowns */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                Intel Report
                <Button size="sm" variant="outline" onClick={fetchIntelReports}>Refresh</Button>
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {availableIntelReports.length === 0 && (
                  <span className="text-muted-foreground">No Intel reports found. Generate one in the ICP tab.</span>
                )}
                {availableIntelReports.map((report) => {
                  console.log('[LeadEnrichment] Intel report row:', report);
                  return (
                    <Button
                      key={report.id}
                      variant={intelReport?.id === report.id ? "default" : "outline"}
                      onClick={() => setIntelReport(report)}
                      className="flex items-center gap-2 px-3 py-1 text-sm"
                      size="sm"
                    >
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${report.website?.replace(/^https?:\/\//, '') || ''}`}
                        alt="favicon"
                        className="w-4 h-4 mr-1"
                        onError={e => { e.currentTarget.src = '/favicon.ico'; }}
                      />
                      {report.company_name || report.companyName || report.website || report.id}
                    </Button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                GTM Playbook (Optional)
                <Button size="sm" variant="outline" onClick={fetchGtmPlaybooks}>Refresh</Button>
              </label>
              <select
                value={gtmPlaybook?.id || ''}
                onChange={(e) => {
                  const selected = availableGtmPlaybooks.find(p => p.id === e.target.value);
                  setGtmPlaybook(selected || null);
                }}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="">Select GTM Playbook</option>
                {availableGtmPlaybooks.length === 0 && (
                  <option disabled>No playbooks found. Generate one in the GTM tab.</option>
                )}
                {availableGtmPlaybooks.map((playbook) => (
                  <option key={playbook.id} value={playbook.id}>
                    {playbook.company_name || playbook.companyName || playbook.id}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* Pipeline Status */}
        {pipelineStatus && (
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-md">
            <Loader2 className={`h-4 w-4 ${pipelineStatus === 'running' ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Pipeline Status: {pipelineStatus}</span>
            {pipelineStatus === 'running' && (
              <span className="text-xs text-muted-foreground">Polling for results...</span>
            )}
          </div>
        )}
        {/* Results Section: Companies and Contacts */}
        {companies.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Discovered Companies ({companies.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Domain</th>
                      <th className="text-left p-2">Industry</th>
                      <th className="text-left p-2">Employees</th>
                      <th className="text-left p-2">Location</th>
                      <th className="text-left p-2">Intel Report</th>
                      <th className="text-left p-2">GTM Playbook</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company) => (
                      <tr key={company.id || company.domain} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{company.name}</td>
                        <td className="p-2">{company.domain}</td>
                        <td className="p-2">{company.industry}</td>
                        <td className="p-2">{company.employees}</td>
                        <td className="p-2">{company.location}</td>
                        <td className="p-2">
                          {company.intelReportId && (
                            <a href={`/intel/${company.intelReportId}`} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">View</a>
                          )}
                        </td>
                        <td className="p-2">
                          {company.gtmPlaybookId && (
                            <a href={`/gtm/${company.gtmPlaybookId}`} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">View</a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
        {contacts.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Discovered Contacts ({contacts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Title</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Company</th>
                      <th className="text-left p-2">LinkedIn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => (
                      <tr key={contact.id || contact.email} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{contact.firstName} {contact.lastName}</td>
                        <td className="p-2">{contact.title}</td>
                        <td className="p-2 text-blue-600">{contact.email}</td>
                        <td className="p-2">{contact.companyName}</td>
                        <td className="p-2">
                          {contact.linkedinUrl && (
                            <a href={contact.linkedinUrl} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default LeadEnrichment;
