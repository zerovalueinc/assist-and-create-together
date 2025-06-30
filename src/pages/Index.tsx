
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Target, Users, Mail, BarChart3, Zap, LogOut, User, Settings, TrendingUp, Globe, Building2, Brain, Rocket, ArrowRight, ChevronRight, Sparkles, Shield, Clock, Award } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import CompanyAnalyzer from "@/components/CompanyAnalyzer";
import ICPGenerator from "@/components/ICPGenerator";
import LeadEnrichment from "@/components/LeadEnrichment";
import SalesIntelligence from "@/components/SalesIntelligence";
import EmailCampaigns from "@/components/EmailCampaigns";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const [activeTab, setActiveTab] = useState("analyzer");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const features = [
    {
      id: "analyzer",
      icon: Search,
      title: "AI Company Analyzer",
      description: "Deep intelligence on any company in seconds",
      color: "from-blue-500 to-cyan-500",
      metrics: "2,847 companies analyzed"
    },
    {
      id: "icp",
      icon: Target,
      title: "ICP Generator",
      description: "Perfect customer profiles with AI precision",
      color: "from-purple-500 to-pink-500",
      metrics: "1,234 ICPs generated"
    },
    {
      id: "leads",
      icon: Users,
      title: "Lead Enrichment",
      description: "Enrich and qualify leads automatically",
      color: "from-green-500 to-emerald-500",
      metrics: "8,492 leads enriched"
    },
    {
      id: "intelligence",
      icon: BarChart3,
      title: "Sales Intelligence",
      description: "Real-time insights and analytics",
      color: "from-orange-500 to-red-500",
      metrics: "847K revenue tracked"
    },
    {
      id: "email",
      icon: Mail,
      title: "AI Email Campaigns",
      description: "Personalized outreach at scale",
      color: "from-indigo-500 to-purple-500",
      metrics: "156 campaigns sent"
    }
  ];

  const liveMetrics = [
    { label: "Active Users", value: "12,847", change: "+23%", trend: "up" },
    { label: "Revenue (ARR)", value: "$2.4M", change: "+47%", trend: "up" },
    { label: "Conversion Rate", value: "34.2%", change: "+5.7%", trend: "up" },
    { label: "Customer LTV", value: "$45K", change: "+12%", trend: "up" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Zap className="h-8 w-8 text-blue-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    PersonaOps
                  </h1>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI-Powered
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Enterprise
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <nav className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-1 text-sm text-slate-600">
                <Clock className="h-4 w-4" />
                <span>{currentTime.toLocaleTimeString()}</span>
              </div>
              
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg">
                <Rocket className="h-4 w-4 mr-2" />
                Upgrade Pro
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-slate-100">
                    <Avatar className="h-10 w-10 ring-2 ring-blue-100">
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-700 font-semibold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg mb-2">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-700 font-semibold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user?.email
                        }
                      </p>
                      {user?.company && (
                        <p className="text-sm text-slate-600 truncate">
                          {user.company}
                        </p>
                      )}
                      <div className="flex items-center space-x-1 mt-1">
                        <Shield className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">Pro Plan</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuItem onClick={() => navigate('/account')} className="cursor-pointer">
                    <User className="mr-3 h-4 w-4" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200 px-4 py-2">
                <Brain className="h-4 w-4 mr-2" />
                Powered by Advanced AI
              </Badge>
            </div>
            
            <h2 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent mb-6 leading-tight">
              Transform Your Sales Process with
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                AI-Powered Intelligence
              </span>
            </h2>
            
            <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Enterprise-grade sales intelligence platform that analyzes companies, generates ICPs, 
              enriches leads, and automates personalized campaigns—all powered by cutting-edge AI.
            </p>

            <div className="flex justify-center space-x-4 mb-12">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 text-lg shadow-xl">
                <Rocket className="h-5 w-5 mr-2" />
                Start Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg border-2 hover:bg-slate-50">
                Watch Demo
              </Button>
            </div>

            {/* Live Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              {liveMetrics.map((metric, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 shadow-sm">
                  <div className="text-sm text-slate-600 mb-1">{metric.label}</div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">{metric.value}</div>
                  <div className="flex items-center text-green-600 text-sm">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {metric.change}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-slate-900 mb-4">
            Enterprise Sales Intelligence Suite
          </h3>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Five powerful AI tools working together to accelerate your sales pipeline
          </p>
        </div>

        {/* Interactive Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.slice(0, 3).map((feature) => (
            <Card key={feature.id} className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${feature.color}`}></div>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-lg`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="text-slate-600 text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{feature.metrics}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setActiveTab(feature.id)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    Explore
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {features.slice(3).map((feature) => (
            <Card key={feature.id} className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${feature.color}`}></div>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-lg`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="text-slate-600 text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{feature.metrics}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setActiveTab(feature.id)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    Explore
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-5 bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg rounded-2xl p-2">
              {features.map((feature) => (
                <TabsTrigger 
                  key={feature.id}
                  value={feature.id} 
                  className="flex items-center space-x-2 px-6 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white transition-all duration-200"
                >
                  <feature.icon className="h-4 w-4" />
                  <span className="hidden md:inline">{feature.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200/50 shadow-xl p-8">
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
          </div>
        </Tabs>
      </section>

      {/* Enterprise Trust Section */}
      <section className="bg-gradient-to-r from-slate-50 to-blue-50 py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              Trusted by Enterprise Sales Teams
            </h3>
            <p className="text-lg text-slate-600">
              Join thousands of sales professionals accelerating their pipeline
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <Award className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-2xl font-bold text-slate-900">99.9%</h4>
              <p className="text-slate-600">Uptime SLA</p>
            </div>
            <div className="text-center">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h4 className="text-2xl font-bold text-slate-900">SOC2</h4>
              <p className="text-slate-600">Compliant</p>
            </div>
            <div className="text-center">
              <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h4 className="text-2xl font-bold text-slate-900">150+</h4>
              <p className="text-slate-600">Countries</p>
            </div>
            <div className="text-center">
              <Building2 className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h4 className="text-2xl font-bold text-slate-900">10K+</h4>
              <p className="text-slate-600">Companies</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
