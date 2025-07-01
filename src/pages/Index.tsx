
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Target, Users, Mail, BarChart3, Globe, TrendingUp, Calendar, Activity, Zap, AlertCircle, CheckCircle2, Clock } from "lucide-react";
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

  // Key performance metrics for sales directors
  const kpiMetrics = [
    {
      title: "Pipeline Quality Score",
      value: "94.2%",
      change: "+5.2%",
      description: "AI-qualified leads vs manual",
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Lead Response Time",
      value: "< 2hrs",
      change: "-67%",
      description: "Average first contact speed",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Conversion Rate",
      value: "23.8%",
      change: "+127%",
      description: "Lead to opportunity",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Team Efficiency",
      value: "340%",
      change: "+89%",
      description: "Productivity vs baseline",
      icon: Zap,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  // Active workflows and processes
  const activeWorkflows = [
    { 
      id: 1,
      name: "Enterprise SaaS - Q1 Push", 
      stage: "Lead Enrichment", 
      progress: 87, 
      leads: 342,
      priority: "high",
      assignee: "Sarah Chen (AE)",
      eta: "2 hours"
    },
    { 
      id: 2,
      name: "Mid-Market Manufacturing", 
      stage: "ICP Validation", 
      progress: 23, 
      leads: 156,
      priority: "medium",
      assignee: "Mike Rodriguez (SDR)",
      eta: "4 hours"
    },
    { 
      id: 3,
      name: "FinTech Expansion", 
      stage: "Email Sequencing", 
      progress: 94, 
      leads: 89,
      priority: "low",
      assignee: "Alex Thompson (SDR)",
      eta: "30 mins"
    }
  ];

  // Team performance snapshot
  const teamPerformance = [
    { name: "Sarah Chen", role: "Senior AE", leads: 45, meetings: 12, closed: 3, score: 94 },
    { name: "Mike Rodriguez", role: "SDR", leads: 89, meetings: 23, closed: 8, score: 87 },
    { name: "Alex Thompson", role: "SDR", leads: 67, meetings: 18, closed: 5, score: 83 },
    { name: "Jessica Park", role: "AE", leads: 34, meetings: 9, closed: 2, score: 91 }
  ];

  const quickActions = [
    { label: "Analyze New Market", action: () => setActiveTab("analyzer"), icon: Search, color: "bg-blue-600" },
    { label: "Generate ICP", action: () => setActiveTab("icp"), icon: Target, color: "bg-green-600" },
    { label: "Enrich Lead List", action: () => setActiveTab("leads"), icon: Users, color: "bg-purple-600" },
    { label: "Launch Campaign", action: () => setActiveTab("email"), icon: Mail, color: "bg-orange-600" }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Sales Command Center</h1>
              <p className="text-slate-600 mt-1">Hey {user?.firstName || 'Director'}, your AI-powered sales engine is running.</p>
            </div>
            <TabsList className="bg-white border shadow-sm">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="analyzer">Company Intel</TabsTrigger>
              <TabsTrigger value="icp">ICP Engine</TabsTrigger>
              <TabsTrigger value="leads">Lead Factory</TabsTrigger>
              <TabsTrigger value="intelligence">Sales Intel</TabsTrigger>
              <TabsTrigger value="email">Campaign Hub</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            {/* KPI Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpiMetrics.map((metric, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-full ${metric.bgColor}`}>
                        <metric.icon className={`h-6 w-6 ${metric.color}`} />
                      </div>
                      <Badge variant="secondary" className="text-xs font-medium">
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
              {/* Active Workflows */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Active Workflows
                  </CardTitle>
                  <CardDescription>AI-powered lead generation in progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeWorkflows.map((workflow) => (
                      <div key={workflow.id} className="border rounded-lg p-4 hover:bg-slate-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              workflow.priority === 'high' ? 'bg-red-500' :
                              workflow.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`} />
                            <h3 className="font-medium text-slate-900">{workflow.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {workflow.leads} leads
                            </Badge>
                          </div>
                          <span className="text-xs text-slate-500">ETA: {workflow.eta}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-600">{workflow.stage}</span>
                          <span className="text-sm font-medium text-slate-900">{workflow.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${workflow.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500">Assigned to {workflow.assignee}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Quick Launch
                  </CardTitle>
                  <CardDescription>Start new AI workflows</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Button 
                      key={index}
                      variant="outline" 
                      className="w-full justify-start hover:bg-slate-50"
                      onClick={action.action}
                    >
                      <div className={`p-1 rounded ${action.color} mr-3`}>
                        <action.icon className="h-3 w-3 text-white" />
                      </div>
                      {action.label}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Team Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Team Performance
                </CardTitle>
                <CardDescription>Your sales team's AI-assisted performance this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Rep</th>
                        <th className="text-left p-3">Role</th>
                        <th className="text-left p-3">AI Leads</th>
                        <th className="text-left p-3">Meetings</th>
                        <th className="text-left p-3">Closed</th>
                        <th className="text-left p-3">AI Score</th>
                        <th className="text-left p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamPerformance.map((rep, index) => (
                        <tr key={index} className="border-b hover:bg-slate-50">
                          <td className="p-3 font-medium">{rep.name}</td>
                          <td className="p-3 text-slate-600">{rep.role}</td>
                          <td className="p-3">{rep.leads}</td>
                          <td className="p-3">{rep.meetings}</td>
                          <td className="p-3 font-medium text-green-600">{rep.closed}</td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{rep.score}</span>
                              <div className="w-12 bg-slate-200 rounded-full h-1.5">
                                <div 
                                  className="bg-green-500 h-1.5 rounded-full" 
                                  style={{ width: `${rep.score}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </div>
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
  );
};

export default Index;
