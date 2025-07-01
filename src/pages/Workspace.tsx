import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, FolderOpen, BarChart3, Users, Zap, Settings, Link2, FileText, Trash2, Eye, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import AppHeader from '@/components/ui/AppHeader';
import YourWork from '@/components/YourWork';

const workspaceStats = [
  { label: 'Companies Analyzed', value: '2,847', icon: FolderOpen },
  { label: 'Playbooks', value: '42', icon: FileText },
  { label: 'Team Members', value: '8', icon: Users },
  { label: 'Integrations', value: '3', icon: Link2 },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin;

export default function Workspace() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('yourwork');
  const [analyzeWork, setAnalyzeWork] = useState<any[]>([]);
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [analyzeLoading, setAnalyzeLoading] = useState(true);
  const [playbooksLoading, setPlaybooksLoading] = useState(true);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [playbooksError, setPlaybooksError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyAnalyzer = async () => {
      setAnalyzeLoading(true);
      setAnalyzeError(null);
      try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        console.log('FETCH /api/company-analyze/reports with headers:', headers);
        const res = await fetch(`${API_BASE_URL}/api/company-analyze/reports`, { headers });
        if (!res.ok) throw new Error('Failed to fetch Company Analyzer reports');
        const data = await res.json();
        setAnalyzeWork(data.reports || []);
      } catch (err) {
        setAnalyzeError('Failed to load Company Analyzer reports.');
      } finally {
        setAnalyzeLoading(false);
      }
    };
    const fetchPlaybooks = async () => {
      setPlaybooksLoading(true);
      setPlaybooksError(null);
      try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        console.log('FETCH /api/icp/reports with headers:', headers);
        const icpRes = await fetch(`${API_BASE_URL}/api/icp/reports`, { headers });
        console.log('FETCH /api/icp/playbooks with headers:', headers);
        const playbookRes = await fetch(`${API_BASE_URL}/api/icp/playbooks`, { headers });
        const icps = icpRes.ok ? (await icpRes.json()) : {};
        const playbooksData = playbookRes.ok ? (await playbookRes.json()) : {};
        console.log('ICPs API response:', icps);
        console.log('Playbooks API response:', playbooksData);
        const icpArray = icps.icps || [];
        const playbooksArray = playbooksData.playbooks || [];
        // Merge and dedupe by id (if needed)
        const allPlaybooks = [...icpArray, ...playbooksArray].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        setPlaybooks(allPlaybooks);
      } catch (err) {
        setPlaybooksError('Failed to load playbooks.');
      } finally {
        setPlaybooksLoading(false);
      }
    };
    fetchCompanyAnalyzer();
    fetchPlaybooks();
  }, [token]);

  const getWorkspaceInitials = () => {
    if (user?.company) return user.company.slice(0, 2).toUpperCase();
    if (user?.firstName && user?.lastName) return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    return user?.email?.[0]?.toUpperCase() || 'W';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AppHeader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-lg border border-slate-200">
          <CardContent className="pt-6">
            {/* Workspace Header */}
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-semibold">
                  {getWorkspaceInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {user?.company || 'Workspace'}
                </h2>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Pro Workspace
                  </Badge>
                  <Badge variant="outline">
                    <Zap className="h-3 w-3 mr-1" />
                    AI-Powered
                  </Badge>
                </div>
              </div>
            </div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {workspaceStats.map((stat, index) => (
                <div key={index} className="bg-slate-50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
              ))}
            </div>
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6 mb-8">
                <TabsTrigger value="yourwork" className="flex items-center space-x-2">
                  <FolderOpen className="h-4 w-4" />
                  <span>Your Work</span>
                </TabsTrigger>
                <TabsTrigger value="playbooks" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Playbooks</span>
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Reports</span>
                </TabsTrigger>
                <TabsTrigger value="integrations" className="flex items-center space-x-2">
                  <Link2 className="h-4 w-4" />
                  <span>Integrations</span>
                </TabsTrigger>
                <TabsTrigger value="team" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Team</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="yourwork">
                <YourWork />
              </TabsContent>
              <TabsContent value="playbooks">
                {playbooksLoading ? (
                  <div className="py-8 text-center text-slate-500">Loading playbooks...</div>
                ) : playbooksError ? (
                  <div className="py-8 text-center text-red-500">{playbooksError}</div>
                ) : playbooks.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">No playbooks yet.<br/>Generate or import a playbook to see it here!</div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {playbooks.map((item) => (
                      <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between bg-white rounded-lg border px-4 py-3 hover:shadow-sm transition">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-lg text-slate-900">{item.companyName || item.company || item.title || item.companyUrl || 'Untitled Playbook'}</span>
                          <span className="text-xs text-slate-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</span>
                        </div>
                        <div className="flex gap-2 mt-2 md:mt-0">
                          <button className="px-3 py-1 text-sm rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center gap-1">
                            <Eye className="h-4 w-4" /> View
                          </button>
                          <button className="px-3 py-1 text-sm rounded border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 flex items-center gap-1">
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="reports">
                {analyzeLoading ? (
                  <div className="py-8 text-center text-slate-500">Loading Company Analyzer reports...</div>
                ) : analyzeError ? (
                  <div className="py-8 text-center text-red-500">{analyzeError}</div>
                ) : analyzeWork.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">No Company Analyzer reports yet.<br/>Run an analysis to see it here!</div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {analyzeWork.map((item) => (
                      <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between bg-white rounded-lg border px-4 py-3 hover:shadow-sm transition">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-lg text-slate-900">{item.companyName || item.company || item.title || item.companyUrl || 'Untitled'}</span>
                          <span className="text-xs text-slate-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</span>
                        </div>
                        <div className="flex gap-2 mt-2 md:mt-0">
                          <button className="px-3 py-1 text-sm rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center gap-1">
                            <Eye className="h-4 w-4" /> View
                          </button>
                          <button className="px-3 py-1 text-sm rounded border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 flex items-center gap-1">
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="integrations">
                <div className="min-h-[300px] flex flex-col items-center justify-center text-slate-400">
                  <Link2 className="h-10 w-10 mb-2" />
                  <span className="text-lg font-semibold">No integrations connected.</span>
                  <span className="text-sm">Connect your CRM, email, or Slack to get started.</span>
                </div>
              </TabsContent>
              <TabsContent value="team">
                <div className="min-h-[300px] flex flex-col items-center justify-center text-slate-400">
                  <Users className="h-10 w-10 mb-2" />
                  <span className="text-lg font-semibold">No team members yet.</span>
                  <span className="text-sm">Invite your team to collaborate in your workspace.</span>
                </div>
              </TabsContent>
              <TabsContent value="settings">
                <div className="min-h-[300px] flex flex-col items-center justify-center text-slate-400">
                  <Settings className="h-10 w-10 mb-2" />
                  <span className="text-lg font-semibold">Workspace Settings</span>
                  <span className="text-sm">Manage workspace preferences, billing, and more.</span>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 