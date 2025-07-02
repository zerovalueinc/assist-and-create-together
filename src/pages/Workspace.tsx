
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanyAnalyzer from "@/components/CompanyAnalyzer";
import ICPGenerator from "@/components/ICPGenerator";
import GTMGenerator from "@/components/GTMGenerator";
import LeadEnrichment from "@/components/LeadEnrichment";
import EmailCampaigns from "@/components/EmailCampaigns";
import SalesIntelligence from "@/components/SalesIntelligence";
import PipelineOrchestrator from "@/components/PipelineOrchestrator";
import YourWork from "@/components/YourWork";

const Workspace = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">PersonaOps Workspace</h1>
        <p className="text-gray-600 mt-2">
          AI-powered tools for lead generation, analysis, and outreach automation
        </p>
      </div>
      
      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList className="grid w-full grid-cols-8 mb-8">
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="icp">ICP</TabsTrigger>
          <TabsTrigger value="gtm">GTM</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
          <TabsTrigger value="work">Your Work</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pipeline">
          <PipelineOrchestrator />
        </TabsContent>
        
        <TabsContent value="company">
          <CompanyAnalyzer />
        </TabsContent>
        
        <TabsContent value="icp">
          <ICPGenerator />
        </TabsContent>
        
        <TabsContent value="gtm">
          <GTMGenerator />
        </TabsContent>
        
        <TabsContent value="leads">
          <LeadEnrichment />
        </TabsContent>
        
        <TabsContent value="email">
          <EmailCampaigns />
        </TabsContent>
        
        <TabsContent value="intelligence">
          <SalesIntelligence />
        </TabsContent>
        
        <TabsContent value="work">
          <YourWork />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Workspace;
