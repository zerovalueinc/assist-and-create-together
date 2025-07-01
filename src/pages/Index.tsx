
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Target, Users, Mail, BarChart3, Globe, TrendingUp, Calendar, Activity } from "lucide-react";
import CompanyAnalyzer from "@/components/CompanyAnalyzer";
import ICPGenerator from "@/components/ICPGenerator";
import LeadEnrichment from "@/components/LeadEnrichment";
import SalesIntelligence from "@/components/SalesIntelligence";
import EmailCampaigns from "@/components/EmailCampaigns";
import { useAuth } from "@/context/AuthContext";
import AppHeader from '@/components/ui/AppHeader';

const Index = () => {
  const [activeTab, setActiveTab] = useState("analyzer");
  const { user } = useAuth();

  // Mock data for dashboard metrics
  const metrics = [
    {
      title: "Companies Analyzed",
      value: "2,847",
      change: "+12% from last month",
      icon: Globe,
      color: "text-blue-600"
    },
    {
      title: "ICPs Generated",
      value: "1,234",
      change: "+8% from last month", 
      icon: Target,
      color: "text-green-600"
    },
    {
      title: "Leads Enriched",
      value: "8,492",
      change: "+23% from last month",
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "Email Campaigns",
      value: "156",
      change: "+15% from last month",
      icon: Mail,
      color: "text-orange-600"
    }
  ];

  const recentActivity = [
    { action: "Company Analysis", target: "TechCorp Inc.", time: "2 minutes ago", status: "completed" },
    { action: "ICP Generation", target: "SaaS Startups", time: "5 minutes ago", status: "processing" },
    { action: "Lead Enrichment", target: "250 contacts", time: "12 minutes ago", status: "completed" },
    { action: "Email Campaign", target: "Q4 Outreach", time: "1 hour ago", status: "scheduled" }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-600 mt-1">Welcome back, {user?.firstName || 'User'}. Here's what's happening with your sales intelligence.</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Activity className="h-4 w-4 mr-2" />
              New Analysis
            </Button>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">{metric.title}</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">{metric.value}</p>
                      <p className="text-sm text-green-600 mt-1">{metric.change}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-slate-100 ${metric.color}`}>
                      <metric.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest sales intelligence activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'completed' ? 'bg-green-500' :
                          activity.status === 'processing' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`} />
                        <div>
                          <p className="font-medium text-slate-900">{activity.action}</p>
                          <p className="text-sm text-slate-600">{activity.target}</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Quick Start
                </CardTitle>
                <CardDescription>Get started with common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("analyzer")}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Analyze Company
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("icp")}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Generate ICP
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("leads")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Enrich Leads
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("email")}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Campaign
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Tools */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="analyzer" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Company Analyzer</span>
            </TabsTrigger>
            <TabsTrigger value="icp" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>ICP Generator</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Lead Enrichment</span>
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Sales Intelligence</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>Email Campaigns</span>
            </TabsTrigger>
          </TabsList>

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
