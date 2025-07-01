
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Target, Users, Mail, BarChart3, Zap, TrendingUp, ArrowRight, Play, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const features = [
    {
      icon: Search,
      title: "AI Company Analyzer",
      description: "Deep dive into any company's business model, market position, and growth opportunities",
      stats: "2,847 companies analyzed",
      color: "bg-blue-500"
    },
    {
      icon: Target,
      title: "ICP Generator",
      description: "Create data-driven ideal customer profiles with AI-powered market insights",
      stats: "1,234 ICPs generated",
      color: "bg-purple-500"
    },
    {
      icon: Users,
      title: "Lead Enrichment",
      description: "Enrich leads with comprehensive data points and buying signals",
      stats: "8,492 leads enriched",
      color: "bg-green-500"
    },
    {
      icon: BarChart3,
      title: "Sales Intelligence",
      description: "Get actionable insights and recommendations to optimize your sales process",
      stats: "156 reports generated",
      color: "bg-orange-500"
    },
    {
      icon: Mail,
      title: "Email Campaigns",
      description: "Launch personalized email campaigns with AI-generated content",
      stats: "89% open rate",
      color: "bg-red-500"
    }
  ];

  const benefits = [
    "Increase conversion rates by 300%",
    "Reduce research time by 85%",
    "Improve email response rates by 40%",
    "Scale outreach efforts 10x faster"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-4 py-2 text-sm font-medium">
              <Zap className="h-4 w-4 mr-2" />
              Powered by Advanced AI
            </Badge>
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Transform Your Sales Process with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> AI Intelligence</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto mb-8">
            Accelerate your revenue growth with comprehensive company analysis, intelligent lead enrichment, 
            and data-driven sales strategies that convert prospects into customers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => navigate('/workspace')}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-slate-300 hover:border-blue-500 px-8 py-4 text-lg font-semibold transition-colors"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center justify-center text-sm text-slate-600 font-medium">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                {benefit}
              </div>
            ))}
          </div>

          {/* Feature Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900">{feature.title}</CardTitle>
                  <CardDescription className="text-slate-600">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-blue-600">{feature.stats}</span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Interactive Demo Section */}
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-2xl mb-16">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4">Ready to see PersonaOps in action?</h2>
              <p className="text-xl mb-6 text-blue-100">
                Try our interactive demo below or jump straight to your workspace
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 font-semibold"
                  onClick={() => navigate('/workspace')}
                >
                  Go to Workspace
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 font-semibold"
                  onClick={() => setActiveTab("analyzer")}
                >
                  Try Demo Below
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Demo Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-5 w-full max-w-4xl bg-white/80 backdrop-blur-sm border shadow-lg">
              <TabsTrigger value="analyzer" className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Analyzer</span>
              </TabsTrigger>
              <TabsTrigger value="icp" className="flex items-center space-x-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">ICP</span>
              </TabsTrigger>
              <TabsTrigger value="leads" className="flex items-center space-x-2 data-[state=active]:bg-green-500 data-[state=active]:text-white">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Leads</span>
              </TabsTrigger>
              <TabsTrigger value="intelligence" className="flex items-center space-x-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Intelligence</span>
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center space-x-2 data-[state=active]:bg-red-500 data-[state=active]:text-white">
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Email</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border-0 overflow-hidden">
            <TabsContent value="analyzer" className="m-0">
              <CompanyAnalyzer />
            </TabsContent>
            <TabsContent value="icp" className="m-0">
              <ICPGenerator />
            </TabsContent>
            <TabsContent value="leads" className="m-0">
              <LeadEnrichment />
            </TabsContent>
            <TabsContent value="intelligence" className="m-0">
              <SalesIntelligence />
            </TabsContent>
            <TabsContent value="email" className="m-0">
              <EmailCampaigns />
            </TabsContent>
          </div>
        </Tabs>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Card className="bg-slate-900 text-white border-0 shadow-2xl">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">Ready to transform your sales process?</h2>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Join thousands of sales teams who've accelerated their revenue growth with PersonaOps
              </p>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => navigate('/workspace')}
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
