import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Users, TrendingUp, MessageSquare, Rocket, FileText, BarChart2, Share2, Download, Copy } from 'lucide-react';

export function GTMPlaybookModal({ open, onClose, playbookData, company }) {
  if (!playbookData) return null;
  const { gtmPlaybook, researchSummary, confidence, sources } = playbookData;

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
            <CardContent>{gtmPlaybook.executiveSummary}</CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Market Analysis</CardHeader>
            <CardContent>
              <div><b>TAM:</b> {gtmPlaybook.marketAnalysis?.totalAddressableMarket || 'N/A'}</div>
              <div><b>SAM:</b> {gtmPlaybook.marketAnalysis?.servicableAddressableMarket || 'N/A'}</div>
              <div className="mt-2"><b>Target Segments:</b> {gtmPlaybook.marketAnalysis?.targetMarketSegments?.join(', ') || 'N/A'}</div>
              <div className="mt-2"><b>Competitors:</b> {gtmPlaybook.marketAnalysis?.competitiveLandscape?.join(', ') || 'N/A'}</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(gtmPlaybook.marketAnalysis?.marketTrends || []).map((trend, i) => (
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
                {gtmPlaybook.idealCustomerProfile?.personas?.map((persona, i) => (
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
                  {gtmPlaybook.messagingFramework?.objectionHandling?.map((o, i) => (
                    <li key={i}><b>{o.objection}:</b> {o.response || 'N/A'}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>Sales Enablement</CardHeader>
            <CardContent>
              <div><b>Talk Tracks:</b> {gtmPlaybook.salesEnablement?.talkTracks?.join(', ') || 'N/A'}</div>
              <div className="mt-2"><b>Battle Cards:</b> {gtmPlaybook.salesEnablement?.battleCards?.join(', ') || 'N/A'}</div>
              <div className="mt-2"><b>Case Studies:</b> {gtmPlaybook.salesEnablement?.caseStudies?.join(', ') || 'N/A'}</div>
              <div className="mt-2"><b>Demo Scripts:</b> {gtmPlaybook.salesEnablement?.demoScripts?.join(', ') || 'N/A'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>Demand Generation</CardHeader>
            <CardContent>
              <div><b>Channels:</b> {gtmPlaybook.demandGeneration?.channels?.join(', ') || 'N/A'}</div>
              <div className="mt-2"><b>Lead Magnets:</b> {gtmPlaybook.demandGeneration?.leadMagnets?.join(', ') || 'N/A'}</div>
              <div className="mt-2"><b>Campaign Ideas:</b> {gtmPlaybook.demandGeneration?.campaignIdeas?.join(', ') || 'N/A'}</div>
              <div className="mt-2"><b>Content Strategy:</b> {gtmPlaybook.demandGeneration?.contentStrategy?.join(', ') || 'N/A'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center gap-2"><BarChart2 className="h-5 w-5" />Metrics & KPIs</CardHeader>
            <CardContent>
              <div><b>Success Metrics:</b> {gtmPlaybook.metricsAndKPIs?.successMetrics?.join(', ') || 'N/A'}</div>
              <div className="mt-2"><b>Leading Indicators:</b> {gtmPlaybook.metricsAndKPIs?.leadingIndicators?.join(', ') || 'N/A'}</div>
              <div className="mt-2"><b>Lagging Indicators:</b> {gtmPlaybook.metricsAndKPIs?.laggingIndicators?.join(', ') || 'N/A'}</div>
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
} 