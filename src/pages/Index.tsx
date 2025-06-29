
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Target, Users, Mail, BarChart3, Upload, Globe, Zap } from "lucide-react";
import CompanyAnalyzer from "@/components/CompanyAnalyzer";
import ICPGenerator from "@/components/ICPGenerator";
import LeadEnrichment from "@/components/LeadEnrichment";
import SalesIntelligence from "@/components/SalesIntelligence";
import EmailCampaigns from "@/components/EmailCampaigns";

const Index = () => {
  const [activeTab, setActiveTab] = useState("analyzer");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-slate-900">SalesIQ</h1>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                AI-Powered
              </Badge>
            </div>
            <nav className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button variant="ghost" size="sm">
                Settings
              </Button>
              <Button size="sm">
                Upgrade
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            AI-Powered Sales Intelligence Platform
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Transform your sales process with intelligent company analysis, ICP generation, 
            lead enrichment, and automated email campaigns.
          </p>
        </div>

        {/* Feature Tabs */}
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies Analyzed</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ICPs Generated</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Enriched</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8,492</div>
              <p className="text-xs text-muted-foreground">+23% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Email Campaigns</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">+4% from last month</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
