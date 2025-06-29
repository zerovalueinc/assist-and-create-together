import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Globe, Building, Users, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCompany } from "@/context/CompanyContext";

const CompanyAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { setResearch } = useCompany();
  const [report, setReport] = useState(null);

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
      const response = await fetch('/api/company-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      const data = await response.json();
      if (!data.success || !data.analysis) {
        throw new Error('No analysis returned');
      }
      setAnalysis(data.analysis);
      setReport(data.report || null);
      setResearch(data.analysis); // Store in context for ICP Generator
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                analyzeCompany();
              }
            }}
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

        {report && (
          <div className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Company Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Industry</p>
                    <Badge variant="outline">{report.companyOverview?.industryClassification || 'N/A'}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Company Size</p>
                    <p className="text-sm">{report.companyOverview?.employeeRange || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue Range</p>
                    <p className="text-sm flex items-center">
                      <span className="mr-1">$</span>
                      {report.financialPerformance?.estimatedAnnualRevenue || 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Decision Makers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {(report.salesMarketingStrategy?.targetAudience?.keyPersonas || ['N/A']).map((dm: string) => (
                      <Badge key={dm} variant="secondary">{dm}</Badge>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pain Points</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {(report.salesOpportunityInsights?.identifiedPainPoints || ['N/A']).map((pp: string) => (
                        <li key={pp}>{pp}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Research Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={report.reportData?.summary || analysis?.summary || "AI-powered research summary will appear here with detailed insights about the company's business model, target market, competitive landscape, and growth opportunities."}
                  readOnly
                  className="min-h-[120px]"
                />
              </CardContent>
            </Card>
          </div>
        )}
        {!report && analysis && (
          <div className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Company Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Industry</p>
                    <Badge variant="outline">{analysis.industry || 'SaaS Technology'}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Company Size</p>
                    <p className="text-sm">{analysis.companySize || '50-200 employees'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue Range</p>
                    <p className="text-sm flex items-center">
                      <span className="mr-1">$</span>
                      {analysis.funding || '$5M - $50M ARR'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Decision Makers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {(analysis.jobTitles || ['VP of Sales', 'Head of Marketing', 'Revenue Operations']).map((dm: string) => (
                      <Badge key={dm} variant="secondary">{dm}</Badge>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pain Points</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {(analysis.painPoints || ['Manual lead qualification','Low conversion rates','Lack of sales intelligence']).map((pp: string) => (
                        <li key={pp}>{pp}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Research Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={analysis.summary || "AI-powered research summary will appear here with detailed insights about the company's business model, target market, competitive landscape, and growth opportunities."}
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
