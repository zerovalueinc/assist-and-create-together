import * as React from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface PipelineFormProps {
  url: string;
  setUrl: (url: string) => void;
  userInput: string;
  setUserInput: (input: string) => void;
  batchSize: number;
  setBatchSize: (size: number) => void;
  onStartPipeline: () => void;
  onShowApiSetup: () => void;
  isLoading: boolean;
}

export function PipelineForm({
  url,
  setUrl,
  userInput,
  setUserInput,
  batchSize,
  setBatchSize,
  onStartPipeline,
  onShowApiSetup,
  isLoading
}: PipelineFormProps) {
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a company website URL to analyze.",
        variant: "destructive",
      });
      return;
    }
    onStartPipeline();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url">Company Website URL</Label>
        <Input
          id="url"
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="userInput">Additional Context (Optional)</Label>
        <Input
          id="userInput"
          placeholder="Any specific requirements or context..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="batchSize">Batch Size</Label>
        <Input
          id="batchSize"
          type="number"
          min="1"
          max="50"
          value={batchSize}
          onChange={(e) => setBatchSize(parseInt(e.target.value) || 10)}
        />
      </div>
      
      <Button 
        onClick={handleSubmit} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Starting Pipeline...' : 'Start Pipeline'}
      </Button>
      
      <div className="text-center">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onShowApiSetup}
        >
          Configure API Keys
        </Button>
      </div>
    </div>
  );
}
