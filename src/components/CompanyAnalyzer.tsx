
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Globe, Building, Users, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CompanyAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const analyzeCompany = async () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a company URL to analyze.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // This will connect to your /api/icp endpoint
      const response = await fetch('/api/icp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysis(data);
      
      toast({
        title: "Analysis Complete",
        description: "Company analysis has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze company. Please try again.",
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
          <Search className="h-5 w-5" />
          <span>Company Analyzer</span>
        </CardTitle>
        <CardDescription>
          Enter a company URL to generate comprehensive business analysis and ICP insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex space-x-2">
          <Input
            placeholder="https://company.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
          />
          <Button onClick={analyzeCompany} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>

        {analysis && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    Company Info
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Industry:</strong> {analysis.industry || 'Technology'}</p>
                    <p className="text-sm"><strong>Size:</strong> {analysis.size || '100-500 employees'}</p>
                    <p className="text-sm"><strong>Location:</strong> {analysis.location || 'San Francisco, CA'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Target Audience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['SMB', 'Enterprise', 'Startups'].map((segment) => (
                      <Badge key={segment} variant="secondary">{segment}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Growth Signals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-green-600">Hiring</Badge>
                    <Badge variant="outline" className="text-blue-600">Funding</Badge>
                    <Badge variant="outline" className="text-purple-600">Product Launch</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={analysis.summary || "AI-powered analysis will appear here with detailed insights about the company's business model, target market, competitive landscape, and growth opportunities."}
                  readOnly
                  className="min-h-[120px]"
                />
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompanyAnalyzer;
