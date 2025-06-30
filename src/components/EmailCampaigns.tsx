import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Send, Upload, Users, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EmailCampaigns = () => {
  const [campaignName, setCampaignName] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createCampaign = async () => {
    if (!campaignName || !emailTemplate) {
      toast({
        title: "Required Fields Missing",
        description: "Please provide campaign name and email template.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Connect to your /api/email endpoint
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          campaignName, 
          template: emailTemplate 
        }),
      });

      if (!response.ok) {
        throw new Error('Campaign creation failed');
      }

      const data = await response.json();
      
      toast({
        title: "Campaign Created",
        description: "Email campaign has been created successfully.",
      });

      // Reset form
      setCampaignName('');
      setEmailTemplate('');
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create email campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock campaigns data
  const mockCampaigns = [
    {
      id: 1,
      name: "Q1 Outreach Campaign",
      status: "Active",
      sent: 1247,
      opened: 423,
      replies: 89,
      openRate: "33.9%",
      replyRate: "7.1%"
    },
    {
      id: 2,
      name: "Product Demo Follow-up",
      status: "Scheduled",
      sent: 0,
      opened: 0,
      replies: 0,
      openRate: "-",
      replyRate: "-"
    },
    {
      id: 3,
      name: "Holiday Promotion",
      status: "Completed",
      sent: 2156,
      opened: 987,
      replies: 234,
      openRate: "45.8%",
      replyRate: "10.9%"
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-5 w-5" />
          <span>Email Campaigns</span>
        </CardTitle>
        <CardDescription>
          Create, manage, and track AI-personalized email campaigns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Campaign Creation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Create New Campaign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label htmlFor="campaignName" className="text-sm font-medium">Campaign Name</label>
            <Input
              id="campaignName"
              name="campaignName"
              placeholder="Campaign name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />
            <label htmlFor="emailTemplate" className="text-sm font-medium">Email Template</label>
            <Textarea
              id="emailTemplate"
              name="emailTemplate"
              placeholder="Email template (use {{firstName}}, {{companyName}}, etc. for personalization)"
              value={emailTemplate}
              onChange={(e) => setEmailTemplate(e.target.value)}
              className="min-h-[120px]"
            />
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Leads
                </Button>
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Select Audience
                </Button>
              </div>
              <Button onClick={createCampaign} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Create Campaign
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Campaign Performance</CardTitle>
              <CardDescription>Track and analyze your email campaign results</CardDescription>
            </div>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Campaign</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Sent</th>
                    <th className="text-left p-2">Opened</th>
                    <th className="text-left p-2">Replies</th>
                    <th className="text-left p-2">Open Rate</th>
                    <th className="text-left p-2">Reply Rate</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{campaign.name}</td>
                      <td className="p-2">
                        <Badge variant={
                          campaign.status === 'Active' ? 'default' : 
                          campaign.status === 'Scheduled' ? 'secondary' : 
                          'outline'
                        }>
                          {campaign.status}
                        </Badge>
                      </td>
                      <td className="p-2">{campaign.sent.toLocaleString()}</td>
                      <td className="p-2">{campaign.opened.toLocaleString()}</td>
                      <td className="p-2">{campaign.replies.toLocaleString()}</td>
                      <td className="p-2 text-green-600 font-medium">{campaign.openRate}</td>
                      <td className="p-2 text-blue-600 font-medium">{campaign.replyRate}</td>
                      <td className="p-2">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* AI Personalization Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Personalization Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800">Company Research</h4>
                <p className="text-sm text-blue-700 mt-1">
                  AI automatically researches each prospect's company for personalized messaging
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800">Growth Signals</h4>
                <p className="text-sm text-green-700 mt-1">
                  Mentions recent funding, hiring, or product launches for timely outreach
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-800">Pain Point Detection</h4>
                <p className="text-sm text-purple-700 mt-1">
                  Identifies specific challenges your solution can address
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default EmailCampaigns;
