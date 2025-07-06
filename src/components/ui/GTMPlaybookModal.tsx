import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Users, TrendingUp, MessageSquare, Rocket, FileText, BarChart2, Share2, Download, Copy } from 'lucide-react';

export function GTMPlaybookModal({ open, onClose, playbookData, company }: { open: any; onClose: any; playbookData: any; company: any }) {
  // Handle different data structures from database
  let gtmPlaybook, researchSummary, confidence, sources;
  
  if (playbookData) {
    // Log the full playbookData for debugging
    console.log('[GTMPlaybookModal] Received playbookData:', JSON.stringify(playbookData, null, 2));
    // Handle legacy playbook_data structure
    if (playbookData.playbook_data) {
      gtmPlaybook = playbookData.playbook_data.gtmPlaybook || playbookData.playbook_data;
      researchSummary = playbookData.playbook_data.researchSummary || playbookData.research_summary;
      confidence = playbookData.playbook_data.confidence || playbookData.confidence;
      sources = playbookData.playbook_data.sources || playbookData.sources;
    }
    // Handle new playbook structure
    else if (playbookData.playbook) {
      gtmPlaybook = playbookData.playbook.gtmPlaybook || playbookData.playbook;
      researchSummary = playbookData.playbook.researchSummary || playbookData.research_summary;
      confidence = playbookData.playbook.confidence || playbookData.confidence;
      sources = playbookData.playbook.sources || playbookData.sources;
    }
    // Handle direct gtmPlaybook structure (for backward compatibility)
    else if (playbookData.gtmPlaybook) {
      gtmPlaybook = playbookData.gtmPlaybook;
      researchSummary = playbookData.researchSummary;
      confidence = playbookData.confidence;
      sources = playbookData.sources;
    }
  }

  if (!playbookData || !gtmPlaybook) {
    console.log('GTMPlaybookModal: No playbook data available', { playbookData, gtmPlaybook });
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>No Playbook Data</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p>No playbook data available to display.</p>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
              {JSON.stringify({ playbookData, gtmPlaybook }, null, 2)}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  // Defensive check for gtmPlaybook structure
  if (!gtmPlaybook || typeof gtmPlaybook !== 'object') {
    console.error('GTMPlaybookModal: Invalid gtmPlaybook structure', { gtmPlaybook });
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invalid Playbook Data</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p>Invalid playbook data structure.</p>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
              {JSON.stringify({ gtmPlaybook }, null, 2)}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  // Debug log to see the actual data structure
  console.log('GTMPlaybookModal: Rendering with data', { gtmPlaybook, researchSummary, confidence, sources });

  // Animation classes (Tailwind)
  const animation = 'animate-fade-in-up';

  // Copy to clipboard handler
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(playbookData, null, 2));
  };

  // TODO: Implement PDF export logic
  const handleDownloadPDF = () => {
    // ...
  };

  // TODO: Implement share with team logic
  const handleShare = () => {
    // ...
  };

  try {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className={`max-w-5xl max-h-[90vh] overflow-y-auto ${animation}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <Rocket className="h-6 w-6 text-primary" />
            {company?.companyName || company?.company_name} — Enterprise GTM Playbook
          </DialogTitle>
          <div className="text-muted-foreground text-sm flex flex-wrap gap-4 items-center mt-2">
            <span>Confidence: {confidence || 85}%</span>
            <span>Sources: {sources?.join(', ')}</span>
            <span className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCopy}><Copy className="h-4 w-4 mr-1" />Copy</Button>
              <Button size="sm" variant="outline" onClick={handleDownloadPDF}><Download className="h-4 w-4 mr-1" />Download PDF</Button>
              <Button size="sm" variant="default" onClick={handleShare}><Share2 className="h-4 w-4 mr-1" />Share with Team</Button>
            </span>
          </div>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <Card>
            <CardHeader>Executive Summary</CardHeader>
            <CardContent>{gtmPlaybook.executiveSummary || 'Executive summary not available'}</CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Market Analysis</CardHeader>
            <CardContent>
              <div><b>TAM:</b> {gtmPlaybook.marketAnalysis?.totalAddressableMarket || 'N/A'}</div>
              <div><b>SAM:</b> {gtmPlaybook.marketAnalysis?.servicableAddressableMarket || 'N/A'}</div>
              <div className="mt-2"><b>Target Segments:</b> {gtmPlaybook.marketAnalysis?.targetMarketSegments?.join(', ') || 'N/A'}</div>
              <div className="mt-2"><b>Competitors:</b> {gtmPlaybook.marketAnalysis?.competitiveLandscape?.join(', ') || 'N/A'}</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(gtmPlaybook.marketAnalysis?.marketTrends || []).map((trend: any, i: number) => (
                  <Badge key={i}>{trend}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center gap-2"><Users className="h-5 w-5" />Ideal Customer Profile</CardHeader>
            <CardContent>
              <div className="mb-2"><b>Industries:</b> {gtmPlaybook.idealCustomerProfile?.firmographics?.industry?.join(', ') || 'N/A'}</div>
              <div className="mb-2"><b>Geography:</b> {gtmPlaybook.idealCustomerProfile?.firmographics?.geography?.join(', ') || 'N/A'}</div>
              <div className="mb-2"><b>Company Size:</b> {gtmPlaybook.idealCustomerProfile?.firmographics?.companySize || 'N/A'}</div>
              <div className="mb-2"><b>Revenue Range:</b> {gtmPlaybook.idealCustomerProfile?.firmographics?.revenueRange || 'N/A'}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {gtmPlaybook.idealCustomerProfile?.personas?.map((persona: any, i: number) => (
                  <Card key={i} className="bg-muted/50">
                    <CardContent className="flex flex-col gap-2 p-4">
                      {/* TODO: Use avatar/logo if available */}
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{persona.title}</span>
                        <span className="text-xs text-muted-foreground">({persona.role})</span>
                      </div>
                      <div><b>Pain Points:</b> {persona.painPoints?.join(', ') || 'N/A'}</div>
                      <div><b>Responsibilities:</b> {persona.responsibilities?.join(', ') || 'N/A'}</div>
                      <div><b>Buying Influence:</b> {persona.buyingInfluence || 'N/A'}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>Value Proposition</CardHeader>
            <CardContent>
              <div><b>Primary Value:</b> {gtmPlaybook.valueProposition?.primaryValue || 'N/A'}</div>
              <div className="mt-2"><b>Key Differentiators:</b> {gtmPlaybook.valueProposition?.keyDifferentiators?.join(', ') || 'N/A'}</div>
              <div className="mt-2"><b>Competitive Advantages:</b> {gtmPlaybook.valueProposition?.competitiveAdvantages?.join(', ') || 'N/A'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>Go-to-Market Strategy</CardHeader>
            <CardContent>
              <div><b>Channel:</b> {gtmPlaybook.goToMarketStrategy?.channel || 'N/A'}</div>
              <div><b>Sales Motion:</b> {gtmPlaybook.goToMarketStrategy?.salesMotion || 'N/A'}</div>
              <div><b>Pricing Strategy:</b> {gtmPlaybook.goToMarketStrategy?.pricingStrategy || 'N/A'}</div>
              <div><b>Sales Cycle Length:</b> {gtmPlaybook.goToMarketStrategy?.salesCycleLength || 'N/A'}</div>
              <div><b>Customer Acquisition Cost:</b> {gtmPlaybook.goToMarketStrategy?.customerAcquisitionCost || 'N/A'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />Messaging Framework</CardHeader>
            <CardContent>
              <div><b>Primary Message:</b> {gtmPlaybook.messagingFramework?.primaryMessage || 'N/A'}</div>
              <div className="mt-2"><b>Secondary Messages:</b> {gtmPlaybook.messagingFramework?.secondaryMessages?.join(', ') || 'N/A'}</div>
              <div className="mt-2"><b>Objection Handling:</b>
                <ul className="list-disc ml-6">
                  {gtmPlaybook.messagingFramework?.objectionHandling?.map((o: any, i: number) => (
                    <li key={i}><b>{o.objection}:</b> {o.response || 'N/A'}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>Sales Enablement</CardHeader>
            <CardContent>
              <div><b>Talk Tracks:</b> {Array.isArray(gtmPlaybook.salesEnablement?.talkTracks) && gtmPlaybook.salesEnablement.talkTracks.length > 0 ? gtmPlaybook.salesEnablement.talkTracks.join(', ') : 'N/A'}</div>
              <div className="mt-2"><b>Battle Cards:</b> {Array.isArray(gtmPlaybook.salesEnablement?.battleCards) && gtmPlaybook.salesEnablement.battleCards.length > 0 ? gtmPlaybook.salesEnablement.battleCards.join(', ') : 'N/A'}</div>
              <div className="mt-2"><b>Case Studies:</b> {Array.isArray(gtmPlaybook.salesEnablement?.caseStudies) && gtmPlaybook.salesEnablement.caseStudies.length > 0 ? gtmPlaybook.salesEnablement.caseStudies.join(', ') : 'N/A'}</div>
              <div className="mt-2"><b>Demo Scripts:</b> {Array.isArray(gtmPlaybook.salesEnablement?.demoScripts) && gtmPlaybook.salesEnablement.demoScripts.length > 0 ? gtmPlaybook.salesEnablement.demoScripts.join(', ') : 'N/A'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>Demand Generation</CardHeader>
            <CardContent>
              <div><b>Channels:</b> {Array.isArray(gtmPlaybook.demandGeneration?.channels) && gtmPlaybook.demandGeneration.channels.length > 0 ? gtmPlaybook.demandGeneration.channels.join(', ') : 'N/A'}</div>
              <div className="mt-2"><b>Lead Magnets:</b> {Array.isArray(gtmPlaybook.demandGeneration?.leadMagnets) && gtmPlaybook.demandGeneration.leadMagnets.length > 0 ? gtmPlaybook.demandGeneration.leadMagnets.join(', ') : 'N/A'}</div>
              <div className="mt-2"><b>Campaign Ideas:</b> {Array.isArray(gtmPlaybook.demandGeneration?.campaignIdeas) && gtmPlaybook.demandGeneration.campaignIdeas.length > 0 ? gtmPlaybook.demandGeneration.campaignIdeas.join(', ') : 'N/A'}</div>
              <div className="mt-2"><b>Content Strategy:</b> {Array.isArray(gtmPlaybook.demandGeneration?.contentStrategy) && gtmPlaybook.demandGeneration.contentStrategy.length > 0 ? gtmPlaybook.demandGeneration.contentStrategy.join(', ') : 'N/A'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center gap-2"><BarChart2 className="h-5 w-5" />Metrics & KPIs</CardHeader>
            <CardContent>
              <div><b>Success Metrics:</b> {Array.isArray(gtmPlaybook.metricsAndKPIs?.successMetrics) && gtmPlaybook.metricsAndKPIs.successMetrics.length > 0 ? gtmPlaybook.metricsAndKPIs.successMetrics.join(', ') : 'N/A'}</div>
              <div className="mt-2"><b>Leading Indicators:</b> {Array.isArray(gtmPlaybook.metricsAndKPIs?.leadingIndicators) && gtmPlaybook.metricsAndKPIs.leadingIndicators.length > 0 ? gtmPlaybook.metricsAndKPIs.leadingIndicators.join(', ') : 'N/A'}</div>
              <div className="mt-2"><b>Lagging Indicators:</b> {Array.isArray(gtmPlaybook.metricsAndKPIs?.laggingIndicators) && gtmPlaybook.metricsAndKPIs.laggingIndicators.length > 0 ? gtmPlaybook.metricsAndKPIs.laggingIndicators.join(', ') : 'N/A'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>Research Summary</CardHeader>
            <CardContent>{researchSummary || 'N/A'}</CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
  } catch (error) {
    console.error('GTMPlaybookModal: Error rendering modal:', error);
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Error Loading Playbook</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p>An error occurred while loading the playbook data.</p>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
              {(error as any)?.message || 'Unknown error'}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
} 