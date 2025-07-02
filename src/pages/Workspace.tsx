import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanyAnalyzer from "@/components/CompanyAnalyzer";
import ICPGenerator from "@/components/ICPGenerator";
import SalesIntelligence from "@/components/SalesIntelligence";
import YourWork from "@/components/YourWork";
import GTMGenerator from "@/components/GTMGenerator";

const Workspace = () => {
  const [activeTab, setActiveTab] = useState("analyzer");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Workspace
          </h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="analyzer">Company Analyzer</TabsTrigger>
            <TabsTrigger value="gtm">GTM Generator</TabsTrigger>
            <TabsTrigger value="icp">ICP Generator</TabsTrigger>
            <TabsTrigger value="intelligence">Sales Intelligence</TabsTrigger>
            <TabsTrigger value="work">Your Work</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analyzer" className="mt-6">
            <CompanyAnalyzer />
          </TabsContent>
          
          <TabsContent value="gtm" className="mt-6">
            <GTMGenerator />
          </TabsContent>
          
          <TabsContent value="icp" className="mt-6">
            <ICPGenerator />
          </TabsContent>
          
          <TabsContent value="intelligence" className="mt-6">
            <SalesIntelligence />
          </TabsContent>
          
          <TabsContent value="work" className="mt-6">
            <YourWork />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Workspace;
