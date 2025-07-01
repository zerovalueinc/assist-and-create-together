import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Upload, Download, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { SectionLabel } from "./ui/section-label";
import supabase from '../lib/supabaseClient';

const LeadEnrichment = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { token, user } = useAuth();
  const [error, setError] = useState(null);

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
      const response = await fetch('http://localhost:3001/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error('Lead search failed');
      }

      const data = await response.json();
      setLeads(data.leads || []);
      
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

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setLeads(data || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leads');
      setLoading(false);
    }
  };

  const handleLeadEnrichment = async (leadData: any) => {
    setLoading(true);
    setError(null);
    try {
      // Call Supabase Edge Function for enrichment
      const { data, error } = await supabase.functions.invoke('lead-enrichment', {
        body: leadData,
      });
      if (error) throw error;
      // Optionally, fetch enriched leads from Supabase table
      const { data: enrichedLeads, error: fetchError } = await supabase
        .from('enriched_leads')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (!fetchError && enrichedLeads) setLeads(enrichedLeads);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to enrich lead');
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
        {/* Search Section */}
        <div className="flex space-x-2">
          <Input
            placeholder="Search for leads (e.g., 'SaaS companies in SF with 50+ employees')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button onClick={searchLeads} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search
              </>
            )}
          </Button>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Leads
            </Button>
          </div>
          <Badge variant="secondary">
            {leads.length} leads found
          </Badge>
        </div>

        {/* Leads Table */}
        {leads.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lead Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Company</th>
                      <th className="text-left p-2">Title</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Mock data - will be replaced with real data from your backend */}
                    {[
                      { id: 1, name: 'John Smith', company: 'TechCorp', title: 'VP Sales', email: 'john@techcorp.com', status: 'New' },
                      { id: 2, name: 'Sarah Johnson', company: 'SaaS Inc', title: 'Head of Marketing', email: 'sarah@saas.com', status: 'Qualified' },
                      { id: 3, name: 'Mike Chen', company: 'StartupXYZ', title: 'CEO', email: 'mike@startupxyz.com', status: 'Enriched' },
                    ].map((lead) => (
                      <tr key={lead.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{lead.name}</td>
                        <td className="p-2">{lead.company}</td>
                        <td className="p-2">{lead.title}</td>
                        <td className="p-2 text-blue-600">{lead.email}</td>
                        <td className="p-2">
                          <Badge variant={lead.status === 'New' ? 'secondary' : 'default'}>
                            {lead.status}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleLeadEnrichment({ leadId: lead.id })}
                          >
                            Enrich
                          </Button>
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
