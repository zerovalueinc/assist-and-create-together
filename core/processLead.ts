import { fetchPhantomBusterLinkedIn } from '../agents/phantombuster';
import { fetchSerperContext } from '../agents/webCrawler';
import { callClaude3, estimateIdentifiableTraffic, identifyImportantPageTypes, findSimilarCustomer, estimateAverageACV, identifyPrimaryKpi, identifyDemandGenChannel, identifyCurrentStackTool } from '../agents/claude';
import { appendToGoogleSheet } from '../utils/sheets';
import { enrichLeadFromInstantly } from './enrichLead';

export interface LeadInput {
  firstName: string;
  lastName: string;
  jobTitle: string;
  linkedInUrl: string;
  companyName: string;
  companyDomain: string;
  email: string;
}

export async function enrichLead(lead: LeadInput) {
  const linkedIn = await fetchPhantomBusterLinkedIn(lead.linkedInUrl);
  const latestContext = await fetchSerperContext(lead.companyDomain);
  // TODO: Implement these enrichment functions:
  const trafficEstimate = await estimateIdentifiableTraffic(lead.companyDomain); // e.g., SimilarWeb, math, or Claude
  const targetPageType = await identifyImportantPageTypes(lead.companyDomain); // e.g., scrape nav, Claude, or rules
  const similarCustomer = await findSimilarCustomer(lead.companyDomain); // e.g., static list, Claude, or DB
  const averageACV = await estimateAverageACV(lead.companyDomain); // e.g., industry DB, Claude, or static
  const primaryKpi = await identifyPrimaryKpi(lead.jobTitle, lead.companyDomain); // e.g., Claude or rules
  const demandGenChannel = await identifyDemandGenChannel(lead.companyDomain); // e.g., Claude or rules
  const currentStackTool = await identifyCurrentStackTool([]); // e.g., from techStack (empty for now)
  return {
    ...lead,
    linkedIn,
    latestContext,
    trafficEstimate,
    targetPageType,
    similarCustomer,
    averageACV,
    primaryKpi,
    demandGenChannel,
    currentStackTool,
  };
}

export async function generateSyntaxFields(enriched: any): Promise<Record<string, string>> {
  const prompt = `
You're building syntax variables for a hyper-personalized email campaign targeting Tier 1 execs.

Given:
- Name: ${enriched.firstName} ${enriched.lastName}
- Job Title: ${enriched.jobTitle}
- LinkedIn Summary: ${enriched.linkedIn.headline}, ${enriched.linkedIn.bio}
- Company Name: ${enriched.companyName}
- Recent News/Context: ${JSON.stringify(enriched.latestContext)}

Generate 25+ personalized syntax fields (for use like {{personalizationHook}}, {{demandGenChannel}}, etc.).

Respond in JSON format like:
{
  "personalizationHook": "...",
  "demandGenChannel": "...",
  // ...
}
`;
  const response = await callClaude3(prompt);
  return JSON.parse(response);
}

export function formatRowForSheet(lead: LeadInput, syntax: Record<string, string>) {
  return {
    ...lead,
    ...syntax,
  };
}

export async function processExecutiveLead(lead: LeadInput) {
  const enriched = await enrichLead(lead);
  const syntax = await generateSyntaxFields(enriched);
  const sheetRow = formatRowForSheet(lead, syntax);
  await appendToGoogleSheet('YourSheetIDHere', sheetRow);
}

export async function processLead(lead: any) {
  const enriched = await enrichLeadFromInstantly(lead);
  const syntax = await generateSyntaxFields(enriched);
  return { ...lead, ...syntax };
} 