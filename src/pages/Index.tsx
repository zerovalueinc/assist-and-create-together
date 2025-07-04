import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Target, Users, Mail, BarChart3, Globe, TrendingUp, Calendar, Activity, Zap, AlertCircle, CheckCircle2, Clock, Brain, Shield, Settings, Bell, FileText, Bot, Workflow, PieChart, MessageSquare, Filter, ChevronRight, Play, Pause, RefreshCw, ExternalLink, ArrowUpRight, Database, Cpu, Network, Eye, BookOpen, Download } from "lucide-react";
import CompanyAnalyzer from "@/components/CompanyAnalyzer";
import ICPGenerator from "@/components/ICPGenerator";
import LeadEnrichment from "@/components/LeadEnrichment";
import SalesIntelligence from "@/components/SalesIntelligence";
import EmailCampaigns from "@/components/EmailCampaigns";
import AppHeader from '@/components/ui/AppHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, useSession } from '@supabase/auth-helpers-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const user = useUser();
  const session = useSession();

  // Enhanced enterprise KPIs
  const kpiMetrics = [
    {
      title: "AI Lead Quality Score",
      value: "96.8%",
      change: "+8.3%",
      description: "Multi-agent LLM qualified prospects",
      icon: Brain,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      trend: "up",
      benchmark: "vs 34% industry avg"
    },
    {
      title: "Pipeline Velocity",
      value: "< 1.2hrs",
      change: "-73%",
      description: "Lead to qualified opportunity",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "up",
      benchmark: "vs 48hrs industry avg"
    },
    {
      title: "Revenue Attribution",
      value: "$3.2M",
      change: "+247%",
      description: "PersonaOps generated pipeline",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "up",
      benchmark: "1,247% ROI"
    },
    {
      title: "Team Efficiency",
      value: "540%",
      change: "+127%",
      description: "AI-enhanced productivity boost",
      icon: Zap,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: "up",
      benchmark: "vs manual processes"
    }
  ];

  // Enhanced active workflows with real enterprise data
  const activeWorkflows = [
    { 
      id: 1,
      name: "Enterprise SaaS Q1 Expansion", 
      stage: "AI Lead Scoring & Enrichment", 
      progress: 92, 
      leads: 547,
      priority: "critical",
      assignee: "Sarah Chen (Sr. AE)",
      eta: "45 mins",
      status: "completing",
      platform: "Instantly",
      aiAgents: ["Company Analyzer", "ICP Generator", "Lead Enricher"],
      revenue: "$890K potential"
    },
    { 
      id: 2,
      name: "Mid-Market Manufacturing Push", 
      stage: "GTM Playbook Execution", 
      progress: 67, 
      leads: 234,
      priority: "high",
      assignee: "Mike Rodriguez (SDR)",
      eta: "2.5 hours",
      status: "running",
      platform: "HubSpot",
      aiAgents: ["Sales Intelligence", "Email Optimizer"],
      revenue: "$345K potential"
    },
    { 
      id: 3,
      name: "FinTech Vertical Expansion", 
      stage: "Personalized Outreach Generation", 
      progress: 34, 
      leads: 178,
      priority: "medium",
      assignee: "Alex Thompson (SDR)",
      eta: "4 hours",
      status: "running",
      platform: "Instantly",
      aiAgents: ["Company Analyzer", "Email Optimizer"],
      revenue: "$234K potential"
    }
  ];

  // Enhanced team performance with AI insights
  const teamPerformance = [
    { 
      name: "Sarah Chen", 
      role: "Senior AE", 
      aiLeads: 89, 
      meetings: 34, 
      closed: 12, 
      revenue: "$890K", 
      aiScore: 97, 
      efficiency: "+67%",
      closeRate: "34.8%",
      avgDealSize: "$74K"
    },
    { 
      name: "Mike Rodriguez", 
      role: "SDR", 
      aiLeads: 156, 
      meetings: 47, 
      closed: 19, 
      revenue: "$345K", 
      aiScore: 94, 
      efficiency: "+52%",
      closeRate: "28.2%",
      avgDealSize: "$18K"
    },
    { 
      name: "Alex Thompson", 
      role: "SDR", 
      aiLeads: 134, 
      meetings: 38, 
      closed: 15, 
      revenue: "$267K", 
      aiScore: 91, 
      efficiency: "+45%",
      closeRate: "25.7%",
      avgDealSize: "$18K"
    },
    { 
      name: "Jessica Park", 
      role: "AE", 
      aiLeads: 67, 
      meetings: 23, 
      closed: 8, 
      revenue: "$456K", 
      aiScore: 96, 
      efficiency: "+61%",
      closeRate: "31.2%",
      avgDealSize: "$57K"
    }
  ];

  // Enhanced quick actions with enterprise workflow
  const quickActions = [
    { 
      label: "AI Market Research", 
      action: () => setActiveTab("analyzer"), 
      icon: Search, 
      color: "bg-gradient-to-r from-blue-500 to-blue-600", 
      description: "Multi-agent company intelligence analysis",
      time: "~2 mins"
    },
    { 
      label: "Generate GTM Playbook", 
      action: () => setActiveTab("icp"), 
      icon: Target, 
      color: "bg-gradient-to-r from-emerald-500 to-emerald-600", 
      description: "AI-powered go-to-market strategy",
      time: "~5 mins"
    },
    { 
      label: "Enrich Lead Database", 
      action: () => setActiveTab("leads"), 
      icon: Users, 
      color: "bg-gradient-to-r from-purple-500 to-purple-600", 
      description: "Multi-source data enrichment engine",
      time: "~3 mins"
    },
    { 
      label: "Launch AI Campaigns", 
      action: () => setActiveTab("email"), 
      icon: Mail, 
      color: "bg-gradient-to-r from-orange-500 to-orange-600", 
      description: "Automated personalized outreach",
      time: "~1 min"
    }
  ];

  // AI Performance Metrics
  const aiPerformanceMetrics = [
    { agent: "Company Analyzer", uptime: "99.7%", avgProcessTime: "2.1s", tasksCompleted: 2347, successRate: "98.2%" },
    { agent: "ICP Generator", uptime: "99.9%", avgProcessTime: "4.3s", tasksCompleted: 1892, successRate: "96.8%" },
    { agent: "Lead Enricher", uptime: "99.8%", avgProcessTime: "1.7s", tasksCompleted: 3421, successRate: "97.9%" },
    { agent: "Email Optimizer", uptime: "99.6%", avgProcessTime: "3.2s", tasksCompleted: 2156, successRate: "95.4%" },
    { agent: "Sales Intelligence", uptime: "99.5%", avgProcessTime: "5.8s", tasksCompleted: 1234, successRate: "94.7%" }
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50">
        <AppHeader />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                Welcome back, {user.id} ({user.user_metadata?.fullName || user.user_metadata?.firstName || user.user_metadata?.lastName || user.email})
              </h1>
              <TabsList className="bg-white border shadow-sm h-12" style={{ alignSelf: 'center' }}>
                <TabsTrigger value="overview" className="flex items-center space-x-2 tab-morph">
                  <BarChart3 className="h-4 w-4" />
                  <span className="tab-text">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="analyzer" className="flex items-center space-x-2 tab-morph">
                  <Search className="h-4 w-4" />
                  <span className="tab-text">Intel</span>
                </TabsTrigger>
                <TabsTrigger value="icp" className="flex items-center space-x-2 tab-morph">
                  <Target className="h-4 w-4" />
                  <span className="tab-text">GTM</span>
                </TabsTrigger>
                <TabsTrigger value="leads" className="flex items-center space-x-2 tab-morph">
                  <Users className="h-4 w-4" />
                  <span className="tab-text">Leads</span>
                </TabsTrigger>
                <TabsTrigger value="intelligence" className="flex items-center space-x-2 tab-morph">
                  <Brain className="h-4 w-4" />
                  <span className="tab-text">Intelligence</span>
                </TabsTrigger>
                <TabsTrigger value="email" className="flex items-center space-x-2 tab-morph">
                  <Mail className="h-4 w-4" />
                  <span className="tab-text">Campaigns</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-6">
              {/* Enhanced KPI Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiMetrics.map((metric, index) => (
                  <Card key={index} className="card-hover border-l-4 border-l-transparent hover:border-l-blue-500">
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
                        <p className="text-xs text-slate-500 mb-2">{metric.description}</p>
                        <p className="text-xs text-blue-600 font-medium">{metric.benchmark}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Enhanced Active AI Workflows */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-blue-600" />
                        Active AI Workflows
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {activeWorkflows.filter(w => w.status === 'running').length} Running
                        </Badge>
                        <Button variant="outline" size="sm" className="button-hover">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>Multi-agent AI systems processing your revenue pipeline in real-time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activeWorkflows.map((workflow) => (
                        <div key={workflow.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-all duration-200 hover:shadow-md">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${
                                workflow.status === 'running' ? 'bg-blue-500 animate-pulse' :
                                workflow.status === 'completing' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                              }`} />
                              <h3 className="font-semibold text-slate-900">{workflow.name}</h3>
                              <Badge variant="outline" className="text-xs font-medium">
                                <Users className="h-3 w-3 mr-1" />
                                {workflow.leads}
                              </Badge>
                              <Badge variant="secondary" className={`text-xs ${workflow.platform === 'Instantly' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                                {workflow.platform}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-green-600">{workflow.revenue}</span>
                              <Button variant="ghost" size="sm" className="hover:bg-slate-100">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-600">{workflow.stage}</span>
                            <span className="text-sm font-medium text-slate-900">{workflow.progress}%</span>
                          </div>
                          
                          <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                            <div 
                              className="progress-fill h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${workflow.progress}%` }}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <div className="flex items-center space-x-4">
                              <span>Assigned: {workflow.assignee}</span>
                              <span>ETA: {workflow.eta}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Bot className="h-3 w-3" />
                              <span>{workflow.aiAgents.length} AI agents</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Best Practices & Resources - Compact Badge Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-indigo-600" />
                      Resources
                    </CardTitle>
                    <CardDescription>
                      Unlock expert resources—brought to you by our partners.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    {[
                      {
                        icon: <BookOpen className="h-8 w-8 text-indigo-600" />, // Lucide icon
                        title: "AI GTM Playbook",
                        description: "Master B2B pipeline acceleration.",
                        link: "/whitepaper.pdf",
                        partner: "AcmeAI",
                        partnerColor: "text-indigo-500",
                        partnerIcon: <span className="font-bold">A</span>,
                        bg: "from-white via-white to-indigo-100"
                      },
                      {
                        icon: <Play className="h-8 w-8 text-green-600" />, // Lucide icon
                        title: "PersonaOps Mastery",
                        description: "Onboarding & advanced tactics.",
                        link: "/training",
                        partner: "EnablementPro",
                        partnerColor: "text-green-500",
                        partnerIcon: <span className="font-bold">E</span>,
                        bg: "from-white via-white to-green-100"
                      },
                      {
                        icon: <Shield className="h-8 w-8 text-yellow-500" />, // Lucide icon
                        title: "Compliance Champion",
                        description: "Stay ahead of AI regulations.",
                        link: "/compliance-guide.pdf",
                        partner: "LawTech",
                        partnerColor: "text-yellow-500",
                        partnerIcon: <span className="font-bold">L</span>,
                        bg: "from-white via-white to-yellow-100"
                      }
                    ].map((resource, idx) => (
                      <a
                        key={idx}
                        href={resource.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 rounded-xl border border-slate-200 shadow-sm px-5 py-2.5 bg-gradient-to-r ${resource.bg} transition-all duration-200 hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-200 group cursor-pointer`}
                        style={{ textDecoration: 'none' }}
                      >
                        <div className="flex-shrink-0 flex items-center justify-center">
                          {resource.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 text-base truncate">{resource.title}</div>
                          <div className="text-xs text-slate-600 truncate">{resource.description}</div>
                        </div>
                        <span className={`ml-3 text-sm font-bold ${resource.partnerColor}`} title={`Sponsored by ${resource.partner}`}>{resource.partnerIcon}</span>
                      </a>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* AI Performance Monitoring */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Cpu className="h-5 w-5 mr-2 text-purple-600" />
                      AI Agent Performance Monitoring
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        All Systems Operational
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>Real-time monitoring of your AI agent workforce performance and optimization metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="text-left p-3 font-semibold">AI Agent</th>
                          <th className="text-left p-3 font-semibold">Uptime</th>
                          <th className="text-left p-3 font-semibold">Avg Process Time</th>
                          <th className="text-left p-3 font-semibold">Tasks Completed</th>
                          <th className="text-left p-3 font-semibold">Success Rate</th>
                          <th className="text-left p-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aiPerformanceMetrics.map((agent, index) => (
                          <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <Brain className="h-4 w-4 text-blue-600" />
                                <span className="font-medium text-slate-900">{agent.agent}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="font-medium text-green-600">{agent.uptime}</span>
                            </td>
                            <td className="p-3 font-medium">{agent.avgProcessTime}</td>
                            <td className="p-3 font-semibold">{agent.tasksCompleted.toLocaleString()}</td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-green-600">{agent.successRate}</span>
                                <div className="w-16 bg-slate-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-green-500 h-1.5 rounded-full" 
                                    style={{ width: agent.successRate }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-green-600 font-medium text-xs">Active</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Team Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-indigo-600" />
                      AI-Enhanced Team Performance
                    </div>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </CardTitle>
                  <CardDescription>Your sales team's AI-assisted performance metrics and revenue attribution</CardDescription>
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
                          <th className="text-left p-3 font-semibold">Close Rate</th>
                          <th className="text-left p-3 font-semibold">Revenue</th>
                          <th className="text-left p-3 font-semibold">AI Score</th>
                          <th className="text-left p-3 font-semibold">Efficiency</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamPerformance.map((rep, index) => (
                          <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-medium text-slate-900">{rep.name}</td>
                            <td className="p-3">
                              <Badge variant="outline" className="text-xs">
                                {rep.role}
                              </Badge>
                            </td>
                            <td className="p-3 font-medium">{rep.aiLeads}</td>
                            <td className="p-3 font-medium text-blue-600">{rep.meetings}</td>
                            <td className="p-3 font-medium text-green-600">{rep.closed}</td>
                            <td className="p-3 font-semibold text-purple-600">{rep.closeRate}</td>
                            <td className="p-3 font-semibold text-green-600">{rep.revenue}</td>
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
                              <Badge variant="secondary" className="bg-green-100 text-green-800 font-medium">
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
