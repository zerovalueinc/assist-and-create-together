import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Target, Users, DollarSign, Calendar } from "lucide-react";
import { SectionLabel } from "./ui/section-label";
import { useUser, useSession } from '@supabase/auth-helpers-react';
import { supabase } from '../lib/supabase'; // See README for global pattern
import { getCache, setCache } from '../lib/utils';
import { useCompany } from '../context/CompanyContext';

const SalesIntelligence = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useUser();
  const session = useSession();
  const { workspaceId } = useCompany();
  const hasFetched = useRef(false);

  useEffect(() => {
    // Show cached reports instantly
    const cachedReports = getCache<any[]>('salesintel_reports', []);
    if (cachedReports.length > 0) setReports(cachedReports);
    if (!user || !workspaceId || hasFetched.current) return;
    hasFetched.current = true;
    setLoading(true);
    setError(null);
    const fetchReports = async () => {
      try {
        const { data, error } = await supabase
          .from('saved_reports')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setReports(data || []);
        setCache('salesintel_reports', data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch sales intelligence reports.');
        console.error('Failed to fetch reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [user, workspaceId]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <SectionLabel>Sales Intelligence</SectionLabel>
        </CardTitle>
        <CardDescription>
          AI-powered insights and analytics for your sales performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$847K</div>
              <p className="text-xs text-muted-foreground">+12% from last quarter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">34.2%</div>
              <p className="text-xs text-muted-foreground">+2.1% from last quarter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">+8.3% from last quarter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12.4K</div>
              <p className="text-xs text-muted-foreground">+5.7% from last quarter</p>
            </CardContent>
          </Card>
        </div>

        {/* Reports Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Intelligence Reports</CardTitle>
            <CardDescription>
              AI-generated insights and analysis reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="py-8 text-center text-red-500">{error}</div>
            ) : reports.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No sales intelligence reports found. Run an analysis first.</div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">{report.title}</h3>
                        <p className="text-sm text-gray-500">{report.type} • {report.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={report.status === 'Complete' ? 'default' : 'secondary'}>
                        {report.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        View Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                <p className="text-sm font-medium text-blue-800">Growth Opportunity Detected</p>
                <p className="text-sm text-blue-700">SaaS companies in the 50-200 employee range show 23% higher conversion rates than average.</p>
              </div>
              <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                <p className="text-sm font-medium text-green-800">ICP Validation Success</p>
                <p className="text-sm text-green-700">Your current ICP matches 78% of your highest-value customers. Consider expanding to similar profiles.</p>
              </div>
              <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="text-sm font-medium text-yellow-800">Optimization Recommendation</p>
                <p className="text-sm text-yellow-700">Email response rates increase by 41% when personalized with company growth signals.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default SalesIntelligence;
