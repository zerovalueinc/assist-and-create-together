
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, FolderOpen, BarChart3, Users, Zap, Settings, Link2, FileText, Trash2, Eye, Plus, Filter, Search, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import AppHeader from '@/components/ui/AppHeader';
import YourWork from '@/components/YourWork';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin;

export default function Workspace() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [analyzeWork, setAnalyzeWork] = useState<any[]>([]);
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [analyzeLoading, setAnalyzeLoading] = useState(true);
  const [playbooksLoading, setPlaybooksLoading] = useState(true);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [playbooksError, setPlaybooksError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Enhanced workspace stats with real-time updates
  const workspaceStats = [
    { 
      label: 'Companies Analyzed', 
      value: analyzeWork.length.toLocaleString(), 
      icon: FolderOpen, 
      change: '+12%',
      color: 'text-blue-600 bg-blue-50'
    },
    { 
      label: 'Active Playbooks', 
      value: playbooks.length.toString(), 
      icon: FileText, 
      change: '+8%',
      color: 'text-purple-600 bg-purple-50'
    },
    { 
      label: 'Team Members', 
      value: '8', 
      icon: Users, 
      change: '+3',
      color: 'text-green-600 bg-green-50'
    },
    { 
      label: 'Integrations', 
      value: '3', 
      icon: Link2, 
      change: '+1',
      color: 'text-orange-600 bg-orange-50'
    },
  ];

  const recentActivity = [
    { action: 'Company Analysis', target: 'Acme Corp', time: '2 hours ago', type: 'analysis' },
    { action: 'Playbook Created', target: 'SaaS Outreach', time: '4 hours ago', type: 'playbook' },
    { action: 'Report Generated', target: 'Q1 Performance', time: '1 day ago', type: 'report' },
    { action: 'Team Member Added', target: 'john@company.com', time: '2 days ago', type: 'team' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      // Fetch company analyzer data
      setAnalyzeLoading(true);
      setAnalyzeError(null);
      try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(`${API_BASE_URL}/api/company-analyze/reports`, { headers });
        if (!res.ok) throw new Error('Failed to fetch Company Analyzer reports');
        const data = await res.json();
        setAnalyzeWork(data.reports || []);
      } catch (err) {
        setAnalyzeError('Failed to load Company Analyzer reports.');
      } finally {
        setAnalyzeLoading(false);
      }

      // Fetch playbooks data
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
    (item.companyName || item.company || item.title || 'Untitled')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const filteredPlaybooks = playbooks.filter(item => 
    (item.companyName || item.company || item.title || 'Untitled')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          {/* Workspace Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                  {getWorkspaceInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {user?.company || 'Your Workspace'}
                </h1>
                <div className="flex items-center space-x-3 mt-2">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    <Zap className="h-3 w-3 mr-1" />
                    Pro Workspace
                  </Badge>
                  <Badge variant="outline" className="border-blue-200 text-blue-600">
                    AI-Powered
                  </Badge>
                </div>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              New Analysis
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {workspaceStats.map((stat, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div className="flex items-center text-sm text-green-600 font-medium">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
            <TabsList className="grid grid-cols-6 bg-white/80 backdrop-blur-sm border shadow-lg">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="yourwork" className="flex items-center space-x-2">
                <FolderOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Your Work</span>
              </TabsTrigger>
              <TabsTrigger value="playbooks" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Playbooks</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Team</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200"
                />
              </div>
              <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border-0 overflow-hidden">
            <TabsContent value="overview" className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>Recent Activity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{activity.action}</p>
                            <p className="text-sm text-slate-600">{activity.target}</p>
                          </div>
                          <span className="text-xs text-slate-500">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Button className="h-20 flex-col bg-blue-500 hover:bg-blue-600 text-white">
                        <Search className="h-6 w-6 mb-2" />
                        Analyze Company
                      </Button>
                      <Button className="h-20 flex-col bg-purple-500 hover:bg-purple-600 text-white">
                        <Target className="h-6 w-6 mb-2" />
                        Create ICP
                      </Button>
                      <Button className="h-20 flex-col bg-green-500 hover:bg-green-600 text-white">
                        <Users className="h-6 w-6 mb-2" />
                        Enrich Leads
                      </Button>
                      <Button className="h-20 flex-col bg-orange-500 hover:bg-orange-600 text-white">
                        <Mail className="h-6 w-6 mb-2" />
                        Email Campaign
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="yourwork" className="p-8">
              <YourWork />
            </TabsContent>

            <TabsContent value="playbooks" className="p-8">
              {playbooksLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-slate-600">Loading playbooks...</span>
                </div>
              ) : playbooksError ? (
                <div className="text-center py-12">
                  <div className="text-red-500 mb-4">{playbooksError}</div>
                  <Button variant="outline">Try Again</Button>
                </div>
              ) : filteredPlaybooks.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">No playbooks found</h3>
                  <p className="text-slate-500 mb-6">Generate or import a playbook to see it here!</p>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Playbook
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPlaybooks.map((item) => (
                    <Card key={item.id} className="hover:shadow-lg transition-shadow border-0 shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-slate-900 mb-1">
                              {item.companyName || item.company || item.title || item.companyUrl || 'Untitled Playbook'}
                            </h3>
                            <p className="text-sm text-slate-500">
                              Created {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown date'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" className="bg-white">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reports" className="p-8">
              {analyzeLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-slate-600">Loading reports...</span>
                </div>
              ) : analyzeError ? (
                <div className="text-center py-12">
                  <div className="text-red-500 mb-4">{analyzeError}</div>
                  <Button variant="outline">Try Again</Button>
                </div>
              ) : filteredAnalyzeWork.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">No reports found</h3>
                  <p className="text-slate-500 mb-6">Run an analysis to see it here!</p>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Report
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAnalyzeWork.map((item) => (
                    <Card key={item.id} className="hover:shadow-lg transition-shadow border-0 shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-slate-900 mb-1">
                              {item.companyName || item.company || item.title || item.companyUrl || 'Untitled Report'}
                            </h3>
                            <p className="text-sm text-slate-500">
                              Created {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown date'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" className="bg-white">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="team" className="p-8">
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">Team Management</h3>
                <p className="text-slate-500 mb-6">Invite your team to collaborate in your workspace.</p>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Team Member
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="p-8">
              <div className="text-center py-12">
                <Settings className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">Workspace Settings</h3>
                <p className="text-slate-500 mb-6">Manage workspace preferences, billing, and more.</p>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <Settings className="h-4 w-4 mr-2" />
                  Open Settings
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
