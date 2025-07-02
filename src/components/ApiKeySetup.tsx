
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ApiKeySetup() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Configuration Required</CardTitle>
          <CardDescription>
            To use the pipeline system, you'll need to configure your API keys in Supabase Edge Function Secrets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Required API Keys:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li><strong>OPENROUTER_API_KEY</strong> - For ICP generation and email personalization (using Claude)</li>
              <li><strong>APOLLO_API_KEY</strong> - For company and contact discovery</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              Once you add these keys to your Supabase Edge Function Secrets, the pipeline system will be fully functional.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
