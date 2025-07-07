import { fetchSerperContext } from '../agents/webCrawler';
import { fetchPhantomBusterLinkedIn } from '../agents/phantombuster';
import { estimateIdentifiableTraffic, callClaude3, findSimilarCustomer, estimateAverageACV, identifyPrimaryKpi, identifyDemandGenChannel, identifyCurrentStackTool } from '../agents/claude';

export async function enrichLeadFromInstantly(lead: any) {
  // Use Instantly's news if available, otherwise enrich
  const latestContext = lead.news?.length
    ? lead.news
    : await fetchSerperContext(lead.companyDomain);

  // Always enrich for traffic (Instantly doesn't provide)
  const trafficEstimate = await estimateIdentifiableTraffic(lead.companyDomain);

  // LinkedIn enrichment (if LinkedIn URL is present)
  const linkedIn = lead.linkedInUrl
    ? await fetchPhantomBusterLinkedIn(lead.linkedInUrl)
    : {};

  // AI-powered enrichment using OpenRouter/Claude
  const similarCustomer = await findSimilarCustomer(lead.companyDomain);
  const averageACV = await estimateAverageACV(lead.companyDomain);
  const primaryKpi = await identifyPrimaryKpi(lead.jobTitle, lead.companyDomain);
  const demandGenChannel = await identifyDemandGenChannel(lead.companyDomain);
  const currentStackTool = await identifyCurrentStackTool([]); // No tech stack from BuiltWith

  return {
    ...lead,
    latestContext,
    trafficEstimate,
    linkedIn,
    similarCustomer,
    averageACV,
    primaryKpi,
    demandGenChannel,
    currentStackTool,
  };
} 