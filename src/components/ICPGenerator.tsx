import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Target, Users, Building2, MapPin, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCompany } from "@/context/CompanyContext";

const ICPGenerator = () => {
  const [companyInfo, setCompanyInfo] = useState('');
  const [icp, setICP] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { research } = useCompany();

  const generateICP = async () => {
    if (!companyInfo && !research) {
      toast({
        title: "Company Information Required",
        description: "Please provide company information or analyze a company first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Send both research and user input to the backend
      const response = await fetch('/api/icp/deep-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ research, userInput: companyInfo }),
      });

      if (!response.ok) {
        throw new Error('ICP generation failed');
      }

      const data = await response.json();
      setICP(data.icp || data);
      toast({
        title: "ICP Generated",
        description: "Ideal Customer Profile has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate ICP. Please try again.",
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
          <Target className="h-5 w-5" />
          <span>ICP Generator</span>
        </CardTitle>
        <CardDescription>
          Generate detailed Ideal Customer Profiles based on your company information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Textarea
            placeholder="Describe your company, products, and current customers..."
            value={companyInfo}
            onChange={(e) => setCompanyInfo(e.target.value)}
            className="min-h-[100px]"
          />
          <Button onClick={generateICP} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating ICP...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Generate ICP
              </>
            )}
          </Button>
        </div>

        {icp && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Company Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Industry</p>
                    <Badge variant="outline">{icp.companyProfile?.industry || 'SaaS Technology'}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Company Size</p>
                    <p className="text-sm">{icp.companyProfile?.size || '50-200 employees'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue Range</p>
                    <p className="text-sm flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {icp.companyProfile?.revenue || '$5M - $50M ARR'}
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
                    {(icp.decisionMakers || ['VP of Sales', 'Head of Marketing', 'Revenue Operations']).map((dm: string) => (
                      <Badge key={dm} variant="secondary">{dm}</Badge>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pain Points</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {(icp.painPoints || ['Manual lead qualification','Low conversion rates','Lack of sales intelligence']).map((pp: string) => (
                        <li key={pp}>{pp}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>ICP Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={icp.summary || "Your ideal customers are mid-market B2B SaaS companies experiencing rapid growth and looking to scale their sales operations. They typically have 50-200 employees, $5M-$50M in ARR, and are actively seeking AI-powered solutions to improve their sales efficiency and lead qualification processes."}
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

export default ICPGenerator;
