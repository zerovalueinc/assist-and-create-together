
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Target, Users, Mail, BarChart3, Globe, TrendingUp, Calendar, Activity, Zap, AlertCircle, CheckCircle2, Clock, Brain, Shield, Settings, Bell, FileText, Bot, Workflow, PieChart, MessageSquare, Filter, ChevronRight, Play, Pause, RefreshCw } from "lucide-react";
import CompanyAnalyzer from "@/components/CompanyAnalyzer";
import ICPGenerator from "@/components/ICPGenerator";
import LeadEnrichment from "@/components/LeadEnrichment";
import SalesIntelligence from "@/components/SalesIntelligence";
import EmailCampaigns from "@/components/EmailCampaigns";
import { useAuth } from "@/context/AuthContext";
import AppHeader from '@/components/ui/AppHeader';

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();

  // Enhanced KPI metrics for AI-powered sales operations
  const kpiMetrics = [
    {
      title: "AI Lead Quality Score",
      value: "94.2%",
      change: "+5.2%",
      description: "Multi-agent LLM qualified leads vs manual",
      icon: Brain,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "up"
    },
    {
      title: "Pipeline Velocity",
      value: "< 2hrs",
      change: "-67%",
      description: "AI-powered lead response time",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "up"
    },
    {
      title: "Revenue Attribution",
      value: "$2.4M",
      change: "+127%",
      description: "PersonaOps generated pipeline",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "up"
    },
    {
      title: "Team Efficiency",
      value: "340%",
      change: "+89%",
      description: "AI-enhanced productivity boost",
      icon: Zap,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: "up"
    }
  ];

  // Active AI workflows
  const activeWorkflows = [
    { 
      id: 1,
      name: "Enterprise SaaS Q1 Campaign", 
      stage: "AI Lead Enrichment", 
      progress: 87, 
      leads: 342,
      priority: "high",
      assignee: "Sarah Chen (AE)",
      eta: "2 hours",
      status: "running",
      platform: "Instantly"
    },
    { 
      id: 2,
      name: "Mid-Market Manufacturing", 
      stage: "ICP Validation", 
      progress: 23, 
      leads: 156,
      priority: "medium",
      assignee: "Mike Rodriguez (SDR)",
      eta: "4 hours",
      status: "running",
      platform: "HubSpot"
    },
    { 
      id: 3,
      name: "FinTech Expansion", 
      stage: "Email Sequencing", 
      progress: 94, 
      leads: 89,
      priority: "low",
      assignee: "Alex Thompson (SDR)",
      eta: "30 mins",
      status: "completing",
      platform: "Instantly"
    }
  ];

  // Enhanced team performance with AI metrics
  const teamPerformance = [
    { name: "Sarah Chen", role: "Senior AE", leads: 45, meetings: 12, closed: 3, revenue: "$340K", aiScore: 94, efficiency: "+45%" },
    { name: "Mike Rodriguez", role: "SDR", leads: 89, meetings: 23, closed: 8, revenue: "$120K", aiScore: 87, efficiency: "+32%" },
    { name: "Alex Thompson", role: "SDR", leads: 67, meetings: 18, closed: 5, revenue: "$85K", aiScore: 83, efficiency: "+28%" },
    { name: "Jessica Park", role: "AE", leads: 34, meetings: 9, closed: 2, revenue: "$190K", aiScore: 91, efficiency: "+38%" }
  ];

  // Enhanced quick actions with enterprise features
  const quickActions = [
    { label: "AI Market Analysis", action: () => setActiveTab("analyzer"), icon: Search, color: "bg-blue-600", description: "Launch multi-agent company analysis" },
    { label: "Generate ICP", action: () => setActiveTab("icp"), icon: Target, color: "bg-green-600", description: "AI-powered ideal customer profiling" },
    { label: "Enrich Lead Lists", action: () => setActiveTab("leads"), icon: Users, color: "bg-purple-600", description: "Multi-source lead enrichment" },
    { label: "Launch Campaigns", action: () => setActiveTab("email"), icon: Mail, color: "bg-orange-600", description: "Instantly & HubSpot integration" }
  ];

  // Email campaign performance metrics
  const emailMetrics = [
    { platform: "Instantly", campaigns: 12, leads: 1247, openRate: "68.4%", replyRate: "12.3%", meetings: 47 },
    { platform: "HubSpot", campaigns: 8, leads: 892, openRate: "71.2%", replyRate: "9.8%", meetings: 34 }
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50">
        <AppHeader />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">AI Sales Command Center</h1>
                <p className="text-slate-600 mt-1">Hey {user?.firstName || 'Director'}, your multi-agent AI revenue engine is optimizing your pipeline.</p>
              </div>
              <TabsList className="bg-white border shadow-sm h-12">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="overview" className="flex items-center space-x-2 transition-all duration-200 data-[state=active]:px-4 data-[state=inactive]:px-3">
                      <BarChart3 className="h-4 w-4" />
                      <span className="data-[state=inactive]:hidden data-[state=active]:inline transition-all duration-200">Overview</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Dashboard Overview</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="analyzer" className="flex items-center space-x-2 transition-all duration-200 data-[state=active]:px-4 data-[state=inactive]:px-3">
                      <Search className="h-4 w-4" />
                      <span className="data-[state=inactive]:hidden data-[state=active]:inline transition-all duration-200">Company Intel</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>AI Company Analysis</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="icp" className="flex items-center space-x-2 transition-all duration-200 data-[state=active]:px-4 data-[state=inactive]:px-3">
                      <Target className="h-4 w-4" />
                      <span className="data-[state=inactive]:hidden data-[state=active]:inline transition-all duration-200">ICP Engine</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>AI ICP Generator</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="leads" className="flex items-center space-x-2 transition-all duration-200 data-[state=active]:px-4 data-[state=inactive]:px-3">
                      <Users className="h-4 w-4" />
                      <span className="data-[state=inactive]:hidden data-[state=active]:inline transition-all duration-200">Lead Factory</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Lead Enrichment Engine</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="intelligence" className="flex items-center space-x-2 transition-all duration-200 data-[state=active]:px-4 data-[state=inactive]:px-3">
                      <Brain className="h-4 w-4" />
                      <span className="data-[state=inactive]:hidden data-[state=active]:inline transition-all duration-200">Sales Intel</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>AI Sales Intelligence</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="email" className="flex items-center space-x-2 transition-all duration-200 data-[state=active]:px-4 data-[state=inactive]:px-3">
                      <Mail className="h-4 w-4" />
                      <span className="data-[state=inactive]:hidden data-[state=active]:inline transition-all duration-200">Campaign Hub</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Email Campaign Management</p>
                  </TooltipContent>
                </Tooltip>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-6">
              {/* Enhanced KPI Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiMetrics.map((metric, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent hover:border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-full ${metric.bgColor}`}>
                          <metric.icon className={`h-6 w-6 ${metric.color}`} />
                        </div>
                        <Badge variant="secondary" className={`text-xs font-medium ${metric.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {metric.change}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900 mb-1">{metric.value}</p>
                        <p className="text-sm font-medium text-slate-700 mb-1">{metric.title}</p>
                        <p className="text-xs text-slate-500">{metric.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Enhanced Active Workflows */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Activity className="h-5 w-5 mr-2" />
                        Active AI Workflows
                      </div>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </CardTitle>
                    <CardDescription>Multi-agent AI systems processing your revenue pipeline</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activeWorkflows.map((workflow) => (
                        <div key={workflow.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                                workflow.status === 'running' ? 'bg-green-500 animate-pulse' :
                                workflow.status === 'completing' ? 'bg-blue-500' : 'bg-yellow-500'
                              }`}>
                                {workflow.status === 'running' && <div className="w-1 h-1 bg-white rounded-full" />}
                              </div>
                              <h3 className="font-medium text-slate-900">{workflow.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {workflow.leads} leads
                              </Badge>
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                {workflow.platform}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-slate-500">ETA: {workflow.eta}</span>
                              <Button variant="ghost" size="sm">
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-600">{workflow.stage}</span>
                            <span className="text-sm font-medium text-slate-900">{workflow.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${workflow.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-500">Assigned to {workflow.assignee}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="h-5 w-5 mr-2" />
                      AI Quick Launch
                    </CardTitle>
                    <CardDescription>Start new AI-powered workflows</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {quickActions.map((action, index) => (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start hover:bg-slate-50 hover:border-blue-300 transition-all duration-200 group"
                            onClick={action.action}
                          >
                            <div className={`p-1 rounded ${action.color} mr-3 group-hover:scale-110 transition-transform duration-200`}>
                              <action.icon className="h-3 w-3 text-white" />
                            </div>
                            <span className="font-medium">{action.label}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p>{action.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Email Campaign Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Email Campaign Performance
                  </CardTitle>
                  <CardDescription>PersonaOps-powered email campaigns across platforms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {emailMetrics.map((platform, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-slate-900">{platform.platform}</h3>
                          <Badge className={platform.platform === 'Instantly' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}>
                            {platform.campaigns} campaigns
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Leads:</span>
                            <span className="font-medium text-slate-900 ml-1">{platform.leads.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Meetings:</span>
                            <span className="font-medium text-purple-600 ml-1">{platform.meetings}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Open Rate:</span>
                            <span className="font-medium text-green-600 ml-1">{platform.openRate}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Reply Rate:</span>
                            <span className="font-medium text-blue-600 ml-1">{platform.replyRate}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Team Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    AI-Enhanced Team Performance
                  </CardTitle>
                  <CardDescription>Your sales team's AI-assisted performance and revenue attribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="text-left p-3 font-semibold">Rep</th>
                          <th className="text-left p-3 font-semibold">Role</th>
                          <th className="text-left p-3 font-semibold">AI Leads</th>
                          <th className="text-left p-3 font-semibold">Meetings</th>
                          <th className="text-left p-3 font-semibold">Closed</th>
                          <th className="text-left p-3 font-semibold">Revenue</th>
                          <th className="text-left p-3 font-semibold">AI Score</th>
                          <th className="text-left p-3 font-semibold">Efficiency</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamPerformance.map((rep, index) => (
                          <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-medium text-slate-900">{rep.name}</td>
                            <td className="p-3 text-slate-600">{rep.role}</td>
                            <td className="p-3 font-medium">{rep.leads}</td>
                            <td className="p-3">{rep.meetings}</td>
                            <td className="p-3 font-medium text-green-600">{rep.closed}</td>
                            <td className="p-3 font-semibold text-purple-600">{rep.revenue}</td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{rep.aiScore}</span>
                                <div className="w-12 bg-slate-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-gradient-to-r from-green-400 to-green-600 h-1.5 rounded-full" 
                                    style={{ width: `${rep.aiScore}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {rep.efficiency}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analyzer">
              <CompanyAnalyzer />
            </TabsContent>

            <TabsContent value="icp">
              <ICPGenerator />
            </TabsContent>

            <TabsContent value="leads">
              <LeadEnrichment />
            </TabsContent>

            <TabsContent value="intelligence">
              <SalesIntelligence />
            </TabsContent>

            <TabsContent value="email">
              <EmailCampaigns />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </TooltipProvider>
  );
};

export default Index;
