
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, Mail, Target, Calendar, Download, Filter } from "lucide-react";
import AppHeader from '@/components/ui/AppHeader';

export default function Analytics() {
  const [dateRange, setDateRange] = useState('30d');

  // Mock analytics data
  const overviewMetrics = [
    {
      title: "Lead Quality Score",
      value: "94.2%",
      change: "+5.2%",
      description: "Leads generated through PersonaOps",
      trend: "up"
    },
    {
      title: "HubSpot Integration",
      value: "1,247",
      change: "+18%",
      description: "Contacts synced this month",
      trend: "up"
    },
    {
      title: "Email Open Rate",
      value: "67.8%",
      change: "+12.3%",
      description: "From PersonaOps-generated campaigns",
      trend: "up"
    },
    {
      title: "Conversion Rate",
      value: "23.1%",
      change: "+8.7%",
      description: "Lead to opportunity conversion",
      trend: "up"
    }
  ];

  const campaignData = [
    {
      name: "Q4 Enterprise Outreach",
      leads: 342,
      openRate: "72.4%",
      clickRate: "18.9%",
      conversions: 28,
      status: "active"
    },
    {
      name: "SaaS Startup Sequence",
      leads: 156,
      openRate: "68.1%",
      clickRate: "22.3%",
      conversions: 19,
      status: "completed"
    },
    {
      name: "Mid-Market Manufacturing",
      leads: 89,
      openRate: "59.7%",
      clickRate: "15.2%",
      conversions: 8,
      status: "active"
    }
  ];

  const hubspotData = [
    {
      property: "Lead Source",
      personaOpsLeads: 1247,
      otherLeads: 892,
      qualityScore: "94.2%"
    },
    {
      property: "Industry Match",
      personaOpsLeads: 1180,
      otherLeads: 645,
      qualityScore: "96.8%"
    },
    {
      property: "Company Size",
      personaOpsLeads: 1098,
      otherLeads: 723,
      qualityScore: "91.4%"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
            <p className="text-slate-600 mt-1">Track the performance of your PersonaOps-generated leads and campaigns</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overviewMetrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${
                    metric.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {metric.change}
                  </Badge>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                  <p className="text-sm font-medium text-slate-700 mt-1">{metric.title}</p>
                  <p className="text-xs text-slate-500 mt-2">{metric.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="campaigns">Email Campaigns</TabsTrigger>
            <TabsTrigger value="hubspot">HubSpot Integration</TabsTrigger>
            <TabsTrigger value="quality">Lead Quality</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Campaign Performance
                </CardTitle>
                <CardDescription>
                  Performance metrics for campaigns using PersonaOps-generated leads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaignData.map((campaign, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-slate-900">{campaign.name}</h3>
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Leads:</span>
                            <span className="font-medium text-slate-900 ml-1">{campaign.leads}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Open Rate:</span>
                            <span className="font-medium text-green-600 ml-1">{campaign.openRate}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Click Rate:</span>
                            <span className="font-medium text-blue-600 ml-1">{campaign.clickRate}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Conversions:</span>
                            <span className="font-medium text-purple-600 ml-1">{campaign.conversions}</span>
                          </div>
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
                  HubSpot Lead Comparison
                </CardTitle>
                <CardDescription>
                  How PersonaOps leads perform compared to other lead sources in HubSpot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {hubspotData.map((data, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-slate-900">{data.property}</h3>
                        <Badge className="bg-green-100 text-green-800">
                          {data.qualityScore} Quality Score
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-slate-600 mb-1">PersonaOps Leads</p>
                          <p className="text-2xl font-bold text-blue-600">{data.personaOpsLeads.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                          <p className="text-sm text-slate-600 mb-1">Other Sources</p>
                          <p className="text-2xl font-bold text-slate-600">{data.otherLeads.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Quality Breakdown</CardTitle>
                <CardDescription>
                  Detailed analysis of why PersonaOps leads perform better
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-green-100 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">ICP Alignment</h3>
                    <p className="text-3xl font-bold text-green-600 my-2">96.8%</p>
                    <p className="text-sm text-slate-600">of leads match your ideal customer profile</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-100 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Target className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Intent Signals</h3>
                    <p className="text-3xl font-bold text-blue-600 my-2">87.3%</p>
                    <p className="text-sm text-slate-600">show active buying intent signals</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-100 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <BarChart3 className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Conversion Rate</h3>
                    <p className="text-3xl font-bold text-purple-600 my-2">23.1%</p>
                    <p className="text-sm text-slate-600">vs 8.4% industry average</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>
                  Track how your PersonaOps integration is improving over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Trend charts will be displayed here</p>
                  <p className="text-sm text-slate-500">Connect your analytics tools to see detailed trends</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
