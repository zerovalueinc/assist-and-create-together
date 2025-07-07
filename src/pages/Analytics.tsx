
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BarChart3, TrendingUp, Users, Mail, Target, Calendar, Download, Filter, Brain, Zap, Globe, MessageSquare, PieChart, CheckCircle2, AlertTriangle, RefreshCw, ExternalLink } from "lucide-react";
import AppHeader from '@/components/ui/AppHeader';

export default function Analytics() {
  const [dateRange, setDateRange] = useState('30d');

  // Enhanced analytics data focusing on PersonaOps performance
  const overviewMetrics = [
    {
      title: "AI Lead Quality Score",
      value: "94.2%",
      change: "+5.2%",
      description: "PersonaOps multi-agent qualified leads",
      trend: "up",
      benchmark: "vs 34% industry avg"
    },
    {
      title: "HubSpot Integration",
      value: "1,247",
      change: "+18%",
      description: "AI-enriched contacts synced",
      trend: "up",
      benchmark: "847 this quarter"
    },
    {
      title: "Campaign Performance",
      value: "67.8%",
      change: "+12.3%",
      description: "Avg open rate across platforms",
      trend: "up",
      benchmark: "vs 21% industry avg"
    },
    {
      title: "Revenue Attribution",
      value: "$2.4M",
      change: "+127%",
      description: "Pipeline from PersonaOps leads",
      trend: "up",
      benchmark: "847% ROI"
    }
  ];

  // Enhanced campaign data with platform integration
  const campaignData = [
    {
      name: "Q4 Enterprise SaaS Outreach",
      platform: "Instantly",
      leads: 342,
      openRate: "72.4%",
      clickRate: "18.9%",
      replyRate: "8.3%",
      meetings: 28,
      closed: 7,
      revenue: "$340K",
      status: "active",
      aiScore: 94
    },
    {
      name: "Mid-Market Manufacturing",
      platform: "HubSpot",
      leads: 156,
      openRate: "68.1%",
      clickRate: "22.3%",
      replyRate: "12.1%",
      meetings: 19,
      closed: 4,
      revenue: "$190K",
      status: "active",
      aiScore: 87
    },
    {
      name: "FinTech Startup Sequence",
      platform: "Instantly",
      leads: 89,
      openRate: "59.7%",
      clickRate: "15.2%",
      replyRate: "6.8%",
      meetings: 8,
      closed: 2,
      revenue: "$85K",
      status: "completed",
      aiScore: 83
    }
  ];

  // HubSpot vs PersonaOps comparison data
  const hubspotComparison = [
    {
      metric: "Lead Source Quality",
      personaOpsValue: 1247,
      hubspotValue: 892,
      personaOpsScore: "94.2%",
      hubspotScore: "67.3%",
      improvement: "+39.8%"
    },
    {
      metric: "Industry Match Accuracy",
      personaOpsValue: 1180,
      hubspotValue: 645,
      personaOpsScore: "96.8%",
      hubspotScore: "72.1%",
      improvement: "+34.3%"
    },
    {
      metric: "Company Size Targeting",
      personaOpsValue: 1098,
      hubspotValue: 723,
      personaOpsScore: "91.4%",
      hubspotScore: "68.9%",
      improvement: "+32.6%"
    },
    {
      metric: "Revenue Conversion",
      personaOpsValue: 847,
      hubspotValue: 234,
      personaOpsScore: "23.1%",
      hubspotScore: "8.4%",
      improvement: "+175%"
    }
  ];

  // AI agent performance breakdown
  const agentPerformance = [
    { agent: "Company Analyzer", tasks: 1247, successRate: "97.3%", avgTime: "2.3s", impact: "High" },
    { agent: "ICP Generator", tasks: 892, successRate: "94.1%", avgTime: "4.7s", impact: "High" },
    { agent: "Lead Enricher", tasks: 2104, successRate: "91.8%", avgTime: "1.8s", impact: "Critical" },
    { agent: "Sales Intelligence", tasks: 645, successRate: "89.2%", avgTime: "6.2s", impact: "Medium" },
    { agent: "Email Optimizer", tasks: 1534, successRate: "96.7%", avgTime: "3.1s", impact: "High" }
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50">
        <AppHeader />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Revenue Analytics</h1>
              <p className="text-slate-600 mt-1">Track the performance of your AI-powered revenue engine and campaign effectiveness</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="hover:bg-slate-100 transition-colors">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="hover:bg-slate-100 transition-colors">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" className="hover:bg-slate-100 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Enhanced Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {overviewMetrics.map((metric, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent hover:border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${
                      metric.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <Badge variant="secondary" className={`text-xs font-medium ${
                      metric.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {metric.change}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                    <p className="text-sm font-medium text-slate-700 mt-1">{metric.title}</p>
                    <p className="text-xs text-slate-500 mt-2">{metric.description}</p>
                    <p className="text-xs text-blue-600 font-medium mt-1">{metric.benchmark}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="campaigns" className="w-full">
            <TabsList className="mb-8 bg-white border shadow-sm">
              <TabsTrigger value="campaigns" className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Email Campaigns</span>
              </TabsTrigger>
              <TabsTrigger value="hubspot" className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>HubSpot Integration</span>
              </TabsTrigger>
              <TabsTrigger value="agents" className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>AI Agents</span>
              </TabsTrigger>
              <TabsTrigger value="quality" className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Lead Quality</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 mr-2" />
                      Campaign Performance Dashboard
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View in Platform
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    PersonaOps-powered campaigns across Instantly and HubSpot platforms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {campaignData.map((campaign, index) => (
                      <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-slate-900 text-lg">{campaign.name}</h3>
                            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'} className="px-3 py-1">
                              {campaign.status}
                            </Badge>
                            <Badge className={campaign.platform === 'Instantly' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}>
                              {campaign.platform}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-slate-500">AI Score:</span>
                            <Badge className="bg-green-100 text-green-800 font-semibold">
                              {campaign.aiScore}%
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-sm">
                          <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-slate-500 block">Leads</span>
                            <span className="font-semibold text-slate-900 text-lg">{campaign.leads}</span>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <span className="text-slate-500 block">Open Rate</span>
                            <span className="font-semibold text-green-600 text-lg">{campaign.openRate}</span>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <span className="text-slate-500 block">Click Rate</span>
                            <span className="font-semibold text-blue-600 text-lg">{campaign.clickRate}</span>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <span className="text-slate-500 block">Reply Rate</span>
                            <span className="font-semibold text-purple-600 text-lg">{campaign.replyRate}</span>
                          </div>
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <span className="text-slate-500 block">Meetings</span>
                            <span className="font-semibold text-orange-600 text-lg">{campaign.meetings}</span>
                          </div>
                          <div className="text-center p-3 bg-emerald-50 rounded-lg">
                            <span className="text-slate-500 block">Closed</span>
                            <span className="font-semibold text-emerald-600 text-lg">{campaign.closed}</span>
                          </div>
                          <div className="text-center p-3 bg-indigo-50 rounded-lg">
                            <span className="text-slate-500 block">Revenue</span>
                            <span className="font-semibold text-indigo-600 text-lg">{campaign.revenue}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hubspot" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    PersonaOps vs HubSpot Native Performance
                  </CardTitle>
                  <CardDescription>
                    Comparative analysis showing the superiority of AI-enhanced lead generation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {hubspotComparison.map((data, index) => (
                      <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-slate-900 text-lg">{data.metric}</h3>
                          <Badge className="bg-green-100 text-green-800 px-3 py-1 font-semibold">
                            {data.improvement} improvement
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-slate-600">PersonaOps AI</p>
                              <Brain className="h-4 w-4 text-blue-600" />
                            </div>
                            <p className="text-2xl font-bold text-blue-600 mb-1">{data.personaOpsValue.toLocaleString()}</p>
                            <p className="text-sm font-semibold text-green-600">Quality Score: {data.personaOpsScore}</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-slate-600">HubSpot Native</p>
                              <Globe className="h-4 w-4 text-slate-600" />
                            </div>
                            <p className="text-2xl font-bold text-slate-600 mb-1">{data.hubspotValue.toLocaleString()}</p>
                            <p className="text-sm font-medium text-slate-500">Quality Score: {data.hubspotScore}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="agents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    Multi-Agent AI Performance
                  </CardTitle>
                  <CardDescription>
                    Real-time performance metrics for your AI agent workforce
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="text-left p-4 font-semibold">AI Agent</th>
                          <th className="text-left p-4 font-semibold">Tasks Completed</th>
                          <th className="text-left p-4 font-semibold">Success Rate</th>
                          <th className="text-left p-4 font-semibold">Avg Processing Time</th>
                          <th className="text-left p-4 font-semibold">Business Impact</th>
                          <th className="text-left p-4 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agentPerformance.map((agent, index) => (
                          <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Brain className="h-4 w-4 text-blue-600" />
                                <span className="font-medium text-slate-900">{agent.agent}</span>
                              </div>
                            </td>
                            <td className="p-4 font-semibold">{agent.tasks.toLocaleString()}</td>
                            <td className="p-4">
                              <span className="font-medium text-green-600">{agent.successRate}</span>
                            </td>
                            <td className="p-4 font-medium">{agent.avgTime}</td>
                            <td className="p-4">
                              <Badge variant={
                                agent.impact === 'Critical' ? 'destructive' : 
                                agent.impact === 'High' ? 'default' : 'secondary'
                              }>
                                {agent.impact}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-green-600 font-medium">Active</span>
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

            <TabsContent value="quality" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Quality Excellence</CardTitle>
                  <CardDescription>
                    Why PersonaOps leads consistently outperform traditional lead generation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className="bg-green-100 p-8 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <Target className="h-12 w-12 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900 text-lg mb-2">ICP Alignment</h3>
                      <p className="text-4xl font-bold text-green-600 my-3">96.8%</p>
                      <p className="text-sm text-slate-600 mb-2">of leads match your ideal customer profile</p>
                      <Badge className="bg-green-100 text-green-800">vs 34% industry average</Badge>
                    </div>
                    <div className="text-center">
                      <div className="bg-blue-100 p-8 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <Zap className="h-12 w-12 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900 text-lg mb-2">Intent Signals</h3>
                      <p className="text-4xl font-bold text-blue-600 my-3">87.3%</p>
                      <p className="text-sm text-slate-600 mb-2">show active buying intent signals</p>
                      <Badge className="bg-blue-100 text-blue-800">vs 12% industry average</Badge>
                    </div>
                    <div className="text-center">
                      <div className="bg-purple-100 p-8 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <TrendingUp className="h-12 w-12 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900 text-lg mb-2">Conversion Rate</h3>
                      <p className="text-4xl font-bold text-purple-600 my-3">23.1%</p>
                      <p className="text-sm text-slate-600 mb-2">lead to opportunity conversion</p>
                      <Badge className="bg-purple-100 text-purple-800">vs 8.4% industry average</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </TooltipProvider>
  );
}
