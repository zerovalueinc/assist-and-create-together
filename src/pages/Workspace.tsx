
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, FolderOpen, BarChart3, Users, Zap, Settings, Link2, FileText, Trash2, Eye, Plus, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import AppHeader from '@/components/ui/AppHeader';
import YourWork from '@/components/YourWork';

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
  const [searchTerm, setSearchTerm] = useState('');

  const workspaceStats = [
    { label: 'Active Projects', value: analyzeWork.length + playbooks.length, icon: FolderOpen, color: 'text-blue-600' },
    { label: 'Completed Analyses', value: analyzeWork.length, icon: BarChart3, color: 'text-green-600' },
    { label: 'Generated ICPs', value: playbooks.length, icon: FileText, color: 'text-purple-600' },
    { label: 'Team Members', value: '3', icon: Users, color: 'text-orange-600' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Company Analyzer data
      setAnalyzeLoading(true);
      setAnalyzeError(null);
      try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(`${API_BASE_URL}/api/company-analyze/reports`, { headers });
        if (res.ok) {
          const data = await res.json();
          setAnalyzeWork(data.reports || []);
        }
      } catch (err) {
        setAnalyzeError('Failed to load reports.');
      } finally {
        setAnalyzeLoading(false);
      }

      // Fetch Playbooks data
      setPlaybooksLoading(true);
      setPlaybooksError(null);
      try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const [icpRes, playbookRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/icp/reports`, { headers }),
          fetch(`${API_BASE_URL}/api/icp/playbooks`, { headers })
        ]);
        
        const icps = icpRes.ok ? (await icpRes.json()) : {};
        const playbooksData = playbookRes.ok ? (await playbookRes.json()) : {};
        
        const icpArray = icps.icps || [];
        const playbooksArray = playbooksData.playbooks || [];
        const allPlaybooks = [...icpArray, ...playbooksArray].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        setPlaybooks(allPlaybooks);
      } catch (err) {
        setPlaybooksError('Failed to load playbooks.');
      } finally {
        setPlaybooksLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const getWorkspaceInitials = () => {
    if (user?.company) return user.company.slice(0, 2).toUpperCase();
    if (user?.firstName && user?.lastName) return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    return user?.email?.[0]?.toUpperCase() || 'W';
  };

  const filteredAnalyzeWork = analyzeWork.filter(item => 
    (item.companyName || item.company || item.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPlaybooks = playbooks.filter(item => 
    (item.companyName || item.company || item.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Workspace Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
                {getWorkspaceInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {user?.company || `${user?.firstName}'s Workspace` || 'Workspace'}
              </h1>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Zap className="h-3 w-3 mr-1" />
                  Pro Workspace
                </Badge>
                <Badge variant="outline">
                  AI-Powered
                </Badge>
              </div>
            </div>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {workspaceStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-slate-100 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search projects, analyses, and playbooks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="yourwork" className="flex items-center space-x-2">
              <FolderOpen className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="analyses" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analyses</span>
            </TabsTrigger>
            <TabsTrigger value="playbooks" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Playbooks</span>
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

          <TabsContent value="analyses">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Company Analyses</span>
                  <Badge variant="secondary">{filteredAnalyzeWork.length} total</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyzeLoading ? (
                  <div className="py-8 text-center text-slate-500">Loading analyses...</div>
                ) : analyzeError ? (
                  <div className="py-8 text-center text-red-500">{analyzeError}</div>
                ) : filteredAnalyzeWork.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    {searchTerm ? 'No analyses match your search.' : 'No analyses yet. Run your first company analysis to see it here!'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAnalyzeWork.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition">
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900">
                            {item.companyName || item.company || item.title || item.companyUrl || 'Untitled Analysis'}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'No date'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="playbooks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>ICP Playbooks</span>
                  <Badge variant="secondary">{filteredPlaybooks.length} total</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {playbooksLoading ? (
                  <div className="py-8 text-center text-slate-500">Loading playbooks...</div>
                ) : playbooksError ? (
                  <div className="py-8 text-center text-red-500">{playbooksError}</div>
                ) : filteredPlaybooks.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    {searchTerm ? 'No playbooks match your search.' : 'No playbooks yet. Generate your first ICP to see it here!'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredPlaybooks.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition">
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900">
                            {item.companyName || item.company || item.title || 'Untitled Playbook'}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'No date'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">HubSpot CRM</h3>
                      <Badge variant="secondary">Connected</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">Sync leads and track campaign performance</p>
                    <Button variant="outline" size="sm" className="w-full">Configure</Button>
                  </div>
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Salesforce</h3>
                      <Badge variant="outline">Available</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">Connect your Salesforce CRM</p>
                    <Button variant="outline" size="sm" className="w-full">Connect</Button>
                  </div>
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Slack</h3>
                      <Badge variant="outline">Available</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">Get notifications in Slack</p>
                    <Button variant="outline" size="sm" className="w-full">Connect</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {getWorkspaceInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                        <p className="text-sm text-slate-500">Owner</p>
                      </div>
                    </div>
                    <Badge>Admin</Badge>
                  </div>
                  <div className="text-center py-8 text-slate-400">
                    <Users className="h-12 w-12 mx-auto mb-3" />
                    <p>Invite team members to collaborate</p>
                    <Button variant="outline" className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Invite Team Member
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Workspace Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Workspace Name</h3>
                    <Input value={user?.company || 'Workspace'} />
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Subscription</h3>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span>Pro Plan</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">API Usage</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>This month</span>
                        <span>2,847 / 10,000 requests</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '28%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
