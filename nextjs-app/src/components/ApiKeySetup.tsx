import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export function ApiKeySetup() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Configuration Required</CardTitle>
          <CardDescription>
            To use the pipeline system, you&apos;ll need to configure your API keys in Supabase Edge Function Secrets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Required API Keys:</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">OPENROUTER_API_KEY</p>
                  <p className="text-sm text-gray-600">For ICP generation and email personalization using Claude</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">
                    Get Key <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">APOLLO_API_KEY</p>
                  <p className="text-sm text-gray-600">For company and contact discovery</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://apolloapi.io" target="_blank" rel="noopener noreferrer">
                    Get Key <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Configuration Steps:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Go to your Supabase project dashboard</li>
              <li>Navigate to Edge Functions → Settings</li>
              <li>Add the API keys listed above</li>
              <li>Return here to test the pipeline system</li>
            </ol>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> The system will work with mock data if API keys are not configured, 
              but real data requires proper API authentication.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
