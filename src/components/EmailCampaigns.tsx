import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Mail, Send, Users, BarChart3, ExternalLink, Bot, Zap, TrendingUp, Clock, Target, CheckCircle2, ArrowUpRight, Play, Pause, Settings, Brain, BookOpen, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const EmailCampaigns = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('instantly');
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  // Mock real-time campaign data
  const activeCampaigns = [
    {
      id: 1,
      name: "Enterprise SaaS Q1 Outreach",
      platform: "Instantly",
      status: "Active",
      leads: 547,
      sent: 2341,
      opened: 1687,
      replies: 298,
      meetings: 67,
      openRate: "72.1%",
      replyRate: "12.7%",
      meetingRate: "2.9%",
      revenue: "$890K potential",
      aiPersonalization: "97.3%",
      lastUpdated: "2 mins ago"
    },
    {
      id: 2,
      name: "Mid-Market Manufacturing Push",
      platform: "HubSpot",
      status: "Active",
      leads: 234,
      sent: 1456,
      opened: 1089,
      replies: 187,
      meetings: 34,
      openRate: "74.8%",
      replyRate: "12.8%",
      meetingRate: "2.3%",
      revenue: "$345K potential",
      aiPersonalization: "94.7%",
      lastUpdated: "5 mins ago"
    },
    {
      id: 3,
      name: "FinTech Vertical Expansion",
      platform: "Instantly",
      status: "Scheduled",
      leads: 178,
      sent: 0,
      opened: 0,
      replies: 0,
      meetings: 0,
      openRate: "-",
      replyRate: "-",
      meetingRate: "-",
      revenue: "$234K potential",
      aiPersonalization: "Ready",
      lastUpdated: "Launch in 2 hours"
    }
  ];

  const launchAICampaign = async () => {
    setLoading(true);
    try {
      // Simulate API call to launch campaign
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "AI Campaign Launched",
        description: `New PersonaOps campaign launched on ${selectedPlatform}. AI agents are now generating personalized outreach.`,
      });
    } catch (error) {
      toast({
        title: "Launch Failed",
        description: "Failed to launch AI campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-5 w-5 text-blue-600" />
          <span>AI-Powered Email Campaigns</span>
        </CardTitle>
        <CardDescription>
          <span className="font-semibold">Step 5 of 5:</span> Launch fully automated, AI-personalized email campaigns through Instantly and HubSpot integrations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Platform Integration Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-blue-800">Instantly Integration</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Connected</Badge>
              </div>
              <p className="text-sm text-blue-700">API connected • Auto-sync enabled</p>
              <div className="flex items-center space-x-4 mt-3 text-xs text-blue-600">
                <span>• 2 Active Campaigns</span>
                <span>• 725 Leads in Pipeline</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-orange-800">HubSpot Integration</span>
                </div>
                <Badge className="bg-orange-100 text-orange-800">Connected</Badge>
              </div>
              <p className="text-sm text-orange-700">CRM sync active • Lead scoring enabled</p>
              <div className="flex items-center space-x-4 mt-3 text-xs text-orange-600">
                <span>• 1 Active Campaign</span>
                <span>• 234 Leads in Pipeline</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Best Practices & Resources */}
        <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-indigo-800">
              <BookOpen className="h-5 w-5 mr-2" />
              Email Campaign Best Practices
            </CardTitle>
            <CardDescription className="text-indigo-700">
              Download our whitepaper or explore training to maximize your results.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
              <Button asChild variant="outline" className="bg-white border-indigo-200 text-indigo-800 hover:bg-indigo-50">
                <a href="/whitepaper.pdf" target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Download Whitepaper
                </a>
              </Button>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                <a href="/training" target="_blank" rel="noopener noreferrer">
                  <Play className="h-4 w-4 mr-2" />
                  View Training
                </a>
              </Button>
            </div>
            <div className="pt-4 border-t">
              <h4 className="font-medium text-slate-800 text-sm mb-2">Top 3 Tips for High-Performing Campaigns</h4>
              <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                <li>Personalize every email—use dynamic fields and AI insights for relevance.</li>
                <li>Keep subject lines short, clear, and curiosity-driven (30–50 characters).</li>
                <li>Follow up 2–3 times, but always provide value and a clear call to action.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Active Campaign Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Campaign Performance Dashboard</CardTitle>
              <CardDescription>Real-time performance metrics for your AI-powered campaigns</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {activeCampaigns.filter(c => c.status === 'Active').length} Active
              </Badge>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Platform
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeCampaigns.map((campaign) => (
                <div key={campaign.id} className="border rounded-lg p-4 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        campaign.status === 'Active' ? 'bg-green-500 animate-pulse' :
                        campaign.status === 'Scheduled' ? 'bg-blue-500' : 'bg-gray-500'
                      }`} />
                      <h3 className="font-semibold text-slate-900">{campaign.name}</h3>
                      <Badge variant={campaign.status === 'Active' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                      <Badge className={campaign.platform === 'Instantly' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}>
                        {campaign.platform}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-green-600">{campaign.revenue}</span>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-sm">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-500 block text-xs">Leads</span>
                      <span className="font-semibold text-slate-900">{campaign.leads}</span>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-slate-500 block text-xs">Sent</span>
                      <span className="font-semibold text-blue-600">{campaign.sent.toLocaleString()}</span>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <span className="text-slate-500 block text-xs">Opened</span>
                      <span className="font-semibold text-green-600">{campaign.opened.toLocaleString()}</span>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-slate-500 block text-xs">Replies</span>
                      <span className="font-semibold text-purple-600">{campaign.replies}</span>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-slate-500 block text-xs">Meetings</span>
                      <span className="font-semibold text-orange-600">{campaign.meetings}</span>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                      <span className="text-slate-500 block text-xs">Open Rate</span>
                      <span className="font-semibold text-emerald-600">{campaign.openRate}</span>
                    </div>
                    <div className="text-center p-3 bg-indigo-50 rounded-lg">
                      <span className="text-slate-500 block text-xs">Reply Rate</span>
                      <span className="font-semibold text-indigo-600">{campaign.replyRate}</span>
                    </div>
                    <div className="text-center p-3 bg-pink-50 rounded-lg">
                      <span className="text-slate-500 block text-xs">AI Score</span>
                      <span className="font-semibold text-pink-600">{campaign.aiPersonalization}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-slate-500">
                    <span>Last updated: {campaign.lastUpdated}</span>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3" />
                      <span>AI optimizing in real-time</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Brain className="h-5 w-5 mr-2" />
              AI Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-green-600 mb-1">94.7%</div>
                <div className="text-sm font-medium text-slate-700">Average AI Personalization Score</div>
                <div className="text-xs text-slate-500 mt-1">vs 23% manual personalization</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-blue-600 mb-1">73.2%</div>
                <div className="text-sm font-medium text-slate-700">Average Open Rate</div>
                <div className="text-xs text-slate-500 mt-1">vs 21% industry average</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-purple-600 mb-1">12.8%</div>
                <div className="text-sm font-medium text-slate-700">Average Reply Rate</div>
                <div className="text-xs text-slate-500 mt-1">vs 1.2% industry average</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default EmailCampaigns;
