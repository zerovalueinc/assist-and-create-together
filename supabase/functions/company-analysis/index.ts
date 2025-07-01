// deno-lint-ignore-file no-explicit-any
// @ts-ignore: Deno global and remote imports are valid in Supabase Edge Functions

// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

console.log("Hello from Functions!")

// --- Types ---

interface SalesIntelligenceReport {
  companyOverview: {
    companyName: string;
    websiteUrl: string;
    domain: string;
    headquarters: string;
    foundingYear: number;
    employeeRange: string;
    industryClassification: string;
    executiveTeam: Array<{
      name: string;
      title: string;
      linkedInUrl: string;
      background: string;
    }>;
  };
  marketIntelligence: {
    totalAddressableMarket: string;
    customerSegments: string[];
    positioningStatement: string;
    competitiveLandscape: {
      directCompetitors: string[];
      differentiators: string[];
      marketTrends: string[];
    };
  };
  financialPerformance: {
    estimatedAnnualRevenue: string;
    fundingRounds: Array<{
      round: string;
      amount: string;
      date: string;
      investors: string[];
    }>;
    totalAmountRaised: string;
    keyInvestors: string[];
    fundingStage: string;
    revenueModel: string;
  };
  technologyStack: {
    productOfferings: string[];
    integrations: string[];
    techStackComponents: string[];
    uniqueSellingPropositions: string[];
  };
  salesMarketingStrategy: {
    goToMarketStrategy: string;
    targetAudience: {
      icpCharacteristics: {
        companySize: string[];
        industryVerticals: string[];
        keyPersonas: string[];
      };
    };
    marketingChannels: string[];
    salesProcess: {
      inboundOutboundRatio: string;
      salesCycleLength: string;
      averageDealSize: string;
    };
  };
  ibpCapabilityMaturity: {
    ibpProcesses: string[];
    dataIntegration: {
      dataSilos: string;
      dataCentralizationPercentage: number;
      realTimeDataAvailability: boolean;
    };
    analyticsForecasting: {
      useOfAdvancedAnalytics: boolean;
      forecastAccuracyPercentage: number;
      scenarioPlanningCapabilities: boolean;
    };
    maturityLevel: number;
    maturityScore: number;
  };
  salesOpportunityInsights: {
    buyingSignals: string[];
    intentData: {
      websiteVisits: number;
      contentDownloads: number;
      keywordSearches: string[];
    };
    engagementMetrics: {
      emailOpenRate: number;
      clickThroughRate: number;
      eventAttendance: number;
    };
    identifiedPainPoints: string[];
    triggerScore: number;
  };
}

// --- Demo web search (replace with real API/LLM later) ---
async function searchWeb(query: string): Promise<any[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return [
    {
      title: `Demo result for: ${query}`,
      snippet: `Demo data for the search query "${query}".`,
      link: "https://example.com/demo-result"
    }
  ];
}

// --- Helper extraction functions (stubs for demo) ---
function extractCompanyName(domain: string, searchResults: any[]): string { return domain; }
function extractHeadquarters(searchResults: any[]): string { return "Demo HQ"; }
function extractFoundingYear(searchResults: any[]): number { return 2015; }
function extractEmployeeRange(searchResults: any[]): string { return "100-500"; }
function extractIndustryClassification(searchResults: any[]): string { return "Technology"; }
function extractExecutiveTeam(searchResults: any[]): Array<any> { return [{ name: "John Doe", title: "CEO", linkedInUrl: "https://linkedin.com/in/johndoe", background: "Demo background" }]; }
function extractTAM(searchResults: any[]): string { return "$1B+"; }
function extractCustomerSegments(searchResults: any[]): string[] { return ["SMB", "Enterprise"]; }
function extractPositioningStatement(searchResults: any[]): string { return "Demo positioning"; }
function extractDirectCompetitors(searchResults: any[]): string[] { return ["Competitor A", "Competitor B"]; }
function extractDifferentiators(searchResults: any[]): string[] { return ["Feature X", "Feature Y"]; }
function extractMarketTrends(searchResults: any[]): string[] { return ["Trend 1", "Trend 2"]; }
function extractRevenue(searchResults: any[]): string { return "$10M-$50M"; }
function extractFundingRounds(searchResults: any[]): Array<any> { return [{ round: "Series A", amount: "$5M", date: "2020", investors: ["VC1"] }]; }
function extractTotalFunding(searchResults: any[]): string { return "$10M"; }
function extractKeyInvestors(searchResults: any[]): string[] { return ["VC1", "VC2"]; }
function extractFundingStage(searchResults: any[]): string { return "Series A"; }
function extractRevenueModel(searchResults: any[]): string { return "SaaS"; }
function extractProductOfferings(searchResults: any[]): string[] { return ["Product 1", "Product 2"]; }
function extractIntegrations(searchResults: any[]): string[] { return ["Integration 1"]; }
function extractTechStackComponents(searchResults: any[]): string[] { return ["React", "Node.js"]; }
function extractUSPs(searchResults: any[]): string[] { return ["USP 1", "USP 2"]; }
function extractGTMStrategy(searchResults: any[]): string { return "Demo GTM"; }
function extractTargetCompanySizes(searchResults: any[]): string[] { return ["11-50", "51-200"]; }
function extractTargetIndustries(searchResults: any[]): string[] { return ["Tech", "Finance"]; }
function extractKeyPersonas(searchResults: any[]): string[] { return ["CTO", "CFO"]; }
function extractMarketingChannels(searchResults: any[]): string[] { return ["Email", "Events"]; }
function extractInboundOutboundRatio(searchResults: any[]): string { return "60/40"; }
function extractSalesCycleLength(searchResults: any[]): string { return "3 months"; }
function extractAverageDealSize(searchResults: any[]): string { return "$20k"; }
function extractIBPProcesses(searchResults: any[]): string[] { return ["Process 1"]; }
function assessDataSilos(searchResults: any[]): string { return "Low"; }
function assessDataCentralization(searchResults: any[]): number { return 80; }
function assessRealTimeData(searchResults: any[]): boolean { return true; }
function assessAdvancedAnalytics(searchResults: any[]): boolean { return true; }
function assessForecastAccuracy(searchResults: any[]): number { return 90; }
function assessScenarioPlanning(searchResults: any[]): boolean { return true; }
function assessMaturityLevel(searchResults: any[]): number { return 4; }
function calculateMaturityScore(searchResults: any[]): number { return 85; }
function extractBuyingSignals(searchResults: any[]): string[] { return ["Signal 1"]; }
function extractIntentData(searchResults: any[]): any { return { websiteVisits: 100, contentDownloads: 10, keywordSearches: ["AI"] }; }
function extractEngagementMetrics(searchResults: any[]): any { return { emailOpenRate: 28, clickThroughRate: 4.2, eventAttendance: 2 }; }
function extractPainPoints(searchResults: any[]): string[] { return ["Pain 1"]; }
function calculateTriggerScore(buyingSignals: string[], intentData: any, engagementMetrics: any): number { return 75; }

// --- Main analysis logic ---
async function gatherCompanyData(websiteUrl: string, domain: string) {
  const searches = [
    `${domain} company overview`,
    `${domain} about us`,
    `${domain} leadership team`,
    `${domain} headquarters location`,
    `${domain} founding year`,
    `${domain} employee count`
  ];
  const searchResults = await Promise.all(searches.map(search => searchWeb(search)));
  return {
    companyName: extractCompanyName(domain, searchResults),
    websiteUrl,
    domain,
    headquarters: extractHeadquarters(searchResults),
    foundingYear: extractFoundingYear(searchResults),
    employeeRange: extractEmployeeRange(searchResults),
    industryClassification: extractIndustryClassification(searchResults),
    executiveTeam: extractExecutiveTeam(searchResults)
  };
}

async function analyzeMarketIntelligence(domain: string) {
  const searches = [
    `${domain} market size`,
    `${domain} total addressable market`,
    `${domain} customer segments`,
    `${domain} competitors`,
    `${domain} market positioning`,
    `${domain} industry trends`
  ];
  const searchResults = await Promise.all(searches.map(search => searchWeb(search)));
  return {
    totalAddressableMarket: extractTAM(searchResults),
    customerSegments: extractCustomerSegments(searchResults),
    positioningStatement: extractPositioningStatement(searchResults),
    competitiveLandscape: {
      directCompetitors: extractDirectCompetitors(searchResults),
      differentiators: extractDifferentiators(searchResults),
      marketTrends: extractMarketTrends(searchResults)
    }
  };
}

async function researchFinancialPerformance(domain: string) {
  const searches = [
    `${domain} revenue`,
    `${domain} funding rounds`,
    `${domain} investors`,
    `${domain} valuation`,
    `${domain} annual recurring revenue`,
    `${domain} business model`
  ];
  const searchResults = await Promise.all(searches.map(search => searchWeb(search)));
  return {
    estimatedAnnualRevenue: extractRevenue(searchResults),
    fundingRounds: extractFundingRounds(searchResults),
    totalAmountRaised: extractTotalFunding(searchResults),
    keyInvestors: extractKeyInvestors(searchResults),
    fundingStage: extractFundingStage(searchResults),
    revenueModel: extractRevenueModel(searchResults)
  };
}

async function analyzeTechnologyStack(websiteUrl: string, domain: string) {
  const searches = [
    `${domain} integrations`,
    `${domain} API`,
    `${domain} technology stack`,
    `${domain} product features`,
    `${domain} unique selling propositions`
  ];
  const searchResults = await Promise.all(searches.map(search => searchWeb(search)));
  return {
    productOfferings: extractProductOfferings(searchResults),
    integrations: extractIntegrations(searchResults),
    techStackComponents: extractTechStackComponents(searchResults),
    uniqueSellingPropositions: extractUSPs(searchResults)
  };
}

async function assessSalesMarketingStrategy(websiteUrl: string, domain: string) {
  const searches = [
    `${domain} go to market strategy`,
    `${domain} target audience`,
    `${domain} marketing channels`,
    `${domain} sales process`,
    `${domain} ideal customer profile`
  ];
  const searchResults = await Promise.all(searches.map(search => searchWeb(search)));
  return {
    goToMarketStrategy: extractGTMStrategy(searchResults),
    targetAudience: {
      icpCharacteristics: {
        companySize: extractTargetCompanySizes(searchResults),
        industryVerticals: extractTargetIndustries(searchResults),
        keyPersonas: extractKeyPersonas(searchResults)
      }
    },
    marketingChannels: extractMarketingChannels(searchResults),
    salesProcess: {
      inboundOutboundRatio: extractInboundOutboundRatio(searchResults),
      salesCycleLength: extractSalesCycleLength(searchResults),
      averageDealSize: extractAverageDealSize(searchResults)
    }
  };
}

async function evaluateIBPCapabilityMaturity(websiteUrl: string, domain: string) {
  const searches = [
    `${domain} sales operations planning`,
    `${domain} data integration`,
    `${domain} analytics capabilities`,
    `${domain} forecasting`,
    `${domain} business intelligence`
  ];
  const searchResults = await Promise.all(searches.map(search => searchWeb(search)));
  const maturityLevel = assessMaturityLevel(searchResults);
  const maturityScore = calculateMaturityScore(searchResults);
  return {
    ibpProcesses: extractIBPProcesses(searchResults),
    dataIntegration: {
      dataSilos: assessDataSilos(searchResults),
      dataCentralizationPercentage: assessDataCentralization(searchResults),
      realTimeDataAvailability: assessRealTimeData(searchResults)
    },
    analyticsForecasting: {
      useOfAdvancedAnalytics: assessAdvancedAnalytics(searchResults),
      forecastAccuracyPercentage: assessForecastAccuracy(searchResults),
      scenarioPlanningCapabilities: assessScenarioPlanning(searchResults)
    },
    maturityLevel,
    maturityScore
  };
}

async function identifySalesOpportunityInsights(websiteUrl: string, domain: string) {
  const searches = [
    `${domain} hiring`,
    `${domain} job openings`,
    `${domain} recent news`,
    `${domain} product launch`,
    `${domain} partnership`,
    `${domain} expansion`
  ];
  const searchResults = await Promise.all(searches.map(search => searchWeb(search)));
  const buyingSignals = extractBuyingSignals(searchResults);
  const intentData = extractIntentData(searchResults);
  const engagementMetrics = extractEngagementMetrics(searchResults);
  const identifiedPainPoints = extractPainPoints(searchResults);
  const triggerScore = calculateTriggerScore(buyingSignals, intentData, engagementMetrics);
  return {
    buyingSignals,
    intentData,
    engagementMetrics,
    identifiedPainPoints,
    triggerScore
  };
}

export async function generateSalesIntelligenceReport(websiteUrl: string): Promise<SalesIntelligenceReport> {
  const domain = new URL(websiteUrl).hostname.replace('www.', '');
  const companyOverview = await gatherCompanyData(websiteUrl, domain);
  const marketIntelligence = await analyzeMarketIntelligence(domain);
  const financialPerformance = await researchFinancialPerformance(domain);
  const technologyStack = await analyzeTechnologyStack(websiteUrl, domain);
  const salesMarketingStrategy = await assessSalesMarketingStrategy(websiteUrl, domain);
  const ibpCapabilityMaturity = await evaluateIBPCapabilityMaturity(websiteUrl, domain);
  const salesOpportunityInsights = await identifySalesOpportunityInsights(websiteUrl, domain);
  return {
    companyOverview,
    marketIntelligence,
    financialPerformance,
    technologyStack,
    salesMarketingStrategy,
    ibpCapabilityMaturity,
    salesOpportunityInsights
  };
}

// --- Helper to get user from JWT ---
function getUserIdFromJwt(req: Request): string | null {
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return null;
  // JWT is a base64-encoded JSON, sub is the user id
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

// --- HTTP handler with user association, caching, and DB save ---
Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Parse user from JWT
  const userId = getUserIdFromJwt(req);
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized: missing or invalid JWT" }), { status: 401 });
  }

  // Parse input
  let websiteUrl: string;
  try {
    const body = await req.json();
    websiteUrl = body.websiteUrl;
    if (!websiteUrl) throw new Error("Missing websiteUrl");
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400 });
  }

  // Supabase client (Edge runtime)
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization")! } }
  });

  // Check for cached result
  const { data: cached, error: cacheError } = await supabase
    .from("company_analyses")
    .select("analysis_result, updated_at")
    .eq("user_id", userId)
    .eq("website_url", websiteUrl)
    .maybeSingle();

  if (cacheError) {
    return new Response(JSON.stringify({ error: "DB error (cache check)", details: cacheError.message }), { status: 500 });
  }
  if (cached) {
    return new Response(JSON.stringify({ ...cached.analysis_result, cached: true, updated_at: cached.updated_at }), { headers: { "Content-Type": "application/json" } });
  }

  // Run analysis
  try {
    const report = await generateSalesIntelligenceReport(websiteUrl);
    // Save to DB
    const { error: insertError } = await supabase
      .from("company_analyses")
      .insert({ user_id: userId, website_url: websiteUrl, analysis_result: report });
    if (insertError) {
      return new Response(JSON.stringify({ error: "DB error (insert)", details: insertError.message }), { status: 500 });
    }
    return new Response(JSON.stringify(report), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500 });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/company-analysis' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
