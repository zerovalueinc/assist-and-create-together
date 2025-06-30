// agents/claude.ts
// Handles prompt construction and calls Claude 3 Opus for syntax field generation
import OpenAI from 'openai';
import fetch from 'node-fetch';
import { searchSimilarCompanies, searchMarketIntelligence } from './webCrawler';
import { analyzeWithBestModel } from './analysisAgent';
import { Agent } from './BaseAgent';

// Usage tracking for Claude API calls
const claudeUsageTracker = {
  totalCalls: 0,
  totalTokens: 0,
  totalCost: 0,
  errors: 0,
  lastReset: new Date(),
  
  trackCall(tokens: number, cost: number, success: boolean = true) {
    this.totalCalls++;
    this.totalTokens += tokens;
    this.totalCost += cost;
    if (!success) this.errors++;
    
    // Log usage every 10 calls
    if (this.totalCalls % 10 === 0) {
      console.log(`📊 Claude API Usage: ${this.totalCalls} calls, ${this.totalTokens} tokens, $${this.totalCost.toFixed(4)} cost`);
    }
  },
  
  getStats() {
    return {
      totalCalls: this.totalCalls,
      totalTokens: this.totalTokens,
      totalCost: this.totalCost,
      errors: this.errors,
      averageCostPerCall: this.totalCalls > 0 ? this.totalCost / this.totalCalls : 0,
      successRate: this.totalCalls > 0 ? ((this.totalCalls - this.errors) / this.totalCalls * 100).toFixed(2) + '%' : '0%'
    };
  },
  
  reset() {
    this.totalCalls = 0;
    this.totalTokens = 0;
    this.totalCost = 0;
    this.errors = 0;
    this.lastReset = new Date();
  }
};

// Rate limiting for Claude API
const claudeRateLimiter = {
  calls: 0,
  lastReset: Date.now(),
  maxCallsPerMinute: 60,
  
  canMakeCall(): boolean {
    const now = Date.now();
    if (now - this.lastReset > 60000) { // 1 minute
      this.calls = 0;
      this.lastReset = now;
    }
    return this.calls < this.maxCallsPerMinute;
  },
  
  trackCall() {
    this.calls++;
  }
};

export async function callClaude3(prompt: string, retries: number = 3): Promise<string> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured');
  }

  if (!claudeRateLimiter.canMakeCall()) {
    throw new Error('Claude API rate limit exceeded. Please wait before making another call.');
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1'
  });

  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      claudeRateLimiter.trackCall();
      
      console.log(`🤖 Claude API call attempt ${attempt}/${retries}`);
      
      const response = await openai.chat.completions.create({
        model: "anthropic/claude-3.5-sonnet",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4000
      });

      const content = response.choices[0].message.content || '';
      const usage = response.usage;
      
      // Estimate cost (approximate pricing)
      const estimatedCost = usage ? (usage.total_tokens / 1000) * 0.015 : 0.01; // ~$0.015 per 1K tokens
      
      claudeUsageTracker.trackCall(usage?.total_tokens || 0, estimatedCost, true);
      
      console.log(`✅ Claude API call successful (${usage?.total_tokens || 0} tokens, ~$${estimatedCost.toFixed(4)})`);
      
      return content;
      
    } catch (error) {
      lastError = error as Error;
      claudeUsageTracker.trackCall(0, 0, false);
      
      console.error(`❌ Claude API call failed (attempt ${attempt}/${retries}):`, error);
      
      if (attempt < retries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Claude API failed after ${retries} attempts: ${lastError?.message || 'Unknown error'}`);
}

// Get Claude usage statistics
export function getClaudeUsageStats() {
  return claudeUsageTracker.getStats();
}

// Reset Claude usage tracking
export function resetClaudeUsage() {
  claudeUsageTracker.reset();
}

// Strict schema for company analysis
const DEFAULT_COMPANY_ANALYSIS_SCHEMA = {
  companyProfile: {
    industry: '',
    companySize: '',
    revenueRange: ''
  },
  decisionMakers: [],
  painPoints: [],
  researchSummary: '',
  website: '',
  companyName: '',
  technologies: [],
  location: '',
  marketTrends: [],
  competitiveLandscape: [],
  goToMarketStrategy: ''
};

export function coerceToCompanyAnalysisSchema(data: any) {
  return {
    companyProfile: {
      industry: data.companyProfile?.industry || '',
      companySize: data.companyProfile?.companySize || '',
      revenueRange: data.companyProfile?.revenueRange || ''
    },
    decisionMakers: Array.isArray(data.decisionMakers) ? data.decisionMakers : [],
    painPoints: Array.isArray(data.painPoints) ? data.painPoints : [],
    researchSummary: data.researchSummary || '',
    website: data.website || '',
    companyName: data.companyName || '',
    technologies: Array.isArray(data.technologies) ? data.technologies : [],
    location: data.location || '',
    marketTrends: Array.isArray(data.marketTrends) ? data.marketTrends : [],
    competitiveLandscape: Array.isArray(data.competitiveLandscape) ? data.competitiveLandscape : [],
    goToMarketStrategy: data.goToMarketStrategy || ''
  };
}

// Enhanced ICP/IBP Research with Serper API integration
export async function generateComprehensiveIBP(websiteUrl: string): Promise<any> {
  console.log(`🔬 Starting comprehensive IBP research for: ${websiteUrl}`);
  try {
    // Step 1: Extract company domain and basic info
    const domain = extractDomain(websiteUrl);
    console.log(`📊 Extracted domain: ${domain}`);

    // Step 2: Research similar companies using Serper
    const similarCompanies = await researchSimilarCompanies(domain);
    console.log(`🏢 Found ${similarCompanies.length} similar companies`);

    // Step 3: Research market intelligence
    const marketIntelligence = await researchMarketIntelligence(domain, similarCompanies);
    console.log(`📈 Market intelligence gathered`);

    // Step 4: Generate comprehensive IBP using Claude
    const comprehensiveIBP = await generateIBPWithClaude(websiteUrl, similarCompanies, marketIntelligence);
    console.log(`✅ Comprehensive IBP generated`);
    console.log('LLM RAW OUTPUT:', JSON.stringify(comprehensiveIBP, null, 2));
    return comprehensiveIBP;
  } catch (error) {
    console.error('Error in comprehensive IBP research:', error);
    throw error;
  }
}

// Extract domain from URL
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url.replace('www.', '').split('/')[0];
  }
}

// Research similar companies using web crawler
async function researchSimilarCompanies(domain: string): Promise<any[]> {
  console.log(`🔍 Researching similar companies for: ${domain}`);
  
  try {
    const similarCompanies = await searchSimilarCompanies(domain);
    console.log(`✅ Found ${similarCompanies.length} unique similar companies`);
    return similarCompanies;
  } catch (error) {
    console.error('Error researching similar companies:', error);
    return [];
  }
}

// Research market intelligence using web crawler
async function researchMarketIntelligence(domain: string, similarCompanies: any[]): Promise<any> {
  console.log(`📊 Researching market intelligence for: ${domain}`);
  
  try {
    const marketData = await searchMarketIntelligence(domain);
    console.log(`📈 Market intelligence gathered`);
    return marketData;
  } catch (error) {
    console.error('Error researching market intelligence:', error);
    return {};
  }
}

// Generate comprehensive IBP using high-quality analysis
async function generateIBPWithClaude(websiteUrl: string, similarCompanies: any[], marketIntelligence: any): Promise<any> {
  console.log(`🧠 Using high-quality analysis for IBP generation`);
  
  // Extract domain for research
  const domain = extractDomain(websiteUrl);
  
  // Multi-stage research pipeline
  console.log(`🔬 Starting comprehensive research pipeline for: ${domain}`);
  
  // Stage 1: Competitor Analysis
  console.log(`📊 Stage 1: Competitor Analysis`);
  const competitors = await researchCompetitors(domain);
  
  // Stage 2: Customer Tech Stack Research
  console.log(`🔧 Stage 2: Customer Tech Stack Research`);
  const customerTechStack = await researchCustomerTechStack(domain, competitors);
  
  // Stage 3: Decision Maker Research
  console.log(`👥 Stage 3: Decision Maker Research`);
  const decisionMakers = await researchDecisionMakers(domain, competitors);
  
  // Stage 4: Pain Point Research
  console.log(`💡 Stage 4: Pain Point Research`);
  const painPoints = await researchPainPoints(domain, competitors);
  
  // Stage 5: Market Trends Research
  console.log(`📈 Stage 5: Market Trends Research`);
  const marketTrends = await researchMarketTrends(domain);
  
  // Stage 6: Company Profile Research
  console.log(`🏢 Stage 6: Company Profile Research`);
  const companyProfile = await researchCompanyProfile(websiteUrl);
  
  // Stage 7: Go-to-Market Strategy Research
  console.log(`🎯 Stage 7: Go-to-Market Strategy Research`);
  const goToMarketStrategy = await researchGoToMarketStrategy(websiteUrl);
  
  // Compile all research into final analysis
  const comprehensiveAnalysis = {
    companyProfile,
    decisionMakers,
    painPoints,
    technologies: customerTechStack,
    competitiveLandscape: competitors,
    marketTrends,
    goToMarketStrategy,
    website: websiteUrl,
    companyName: companyProfile.companyName || 'Research in Progress',
    location: companyProfile.location || 'Research in Progress',
    researchSummary: generateResearchSummary({
      companyProfile,
      decisionMakers,
      painPoints,
      customerTechStack,
      competitors,
      marketTrends,
      goToMarketStrategy
    })
  };
  
  console.log(`✅ Comprehensive research pipeline completed`);
  return comprehensiveAnalysis;
}

// Stage 1: Competitor Analysis
async function researchCompetitors(domain: string): Promise<string[]> {
  const prompt = `You are a competitive intelligence analyst specializing in B2B SaaS.

Research and identify the top 5-8 direct competitors to ${domain}.

Focus on:
- Companies offering similar products/services
- Companies targeting the same customer base
- Companies in the same market segment

Return ONLY a JSON array of competitor company names (no URLs, no descriptions, just names).

Example: ["Competitor A", "Competitor B", "Competitor C"]

Research ${domain} and return the most relevant competitors:`;

  try {
    const result = await analyzeWithBestModel({
      type: 'competitor_research',
      data: { domain },
      context: prompt
    });
    
    if (result.success && result.data) {
      let competitors = result.data;
      if (typeof competitors === 'string') {
        try {
          competitors = JSON.parse(competitors);
        } catch (e) {
          competitors = [];
        }
      }
      return Array.isArray(competitors) ? competitors : [];
    }
  } catch (error) {
    console.error('Error in competitor research:', error);
  }
  
  return [];
}

// Stage 2: Customer Tech Stack Research
async function researchCustomerTechStack(domain: string, competitors: string[]): Promise<string[]> {
  const competitorList = competitors.join(', ');
  
  const prompt = `You are a technology stack analyst specializing in B2B SaaS integrations.

Research what technologies and tools are commonly used by customers of ${domain} and its competitors (${competitorList}).

Focus on:
- CRM systems (Salesforce, HubSpot, Pipedrive, etc.)
- Marketing tools (Marketo, Mailchimp, etc.)
- Sales tools (Apollo, ZoomInfo, etc.)
- Analytics platforms (Google Analytics, Mixpanel, etc.)
- Communication tools (Slack, Teams, etc.)
- Other relevant B2B SaaS tools

These will be used for Apollo search targeting to find similar companies.

Return ONLY a JSON array of technology names (no descriptions, just names).

Example: ["Salesforce", "HubSpot", "Apollo", "Slack", "Google Analytics"]

Research and return the most relevant technologies:`;

  try {
    const result = await analyzeWithBestModel({
      type: 'tech_stack_research',
      data: { domain, competitors },
      context: prompt
    });
    
    if (result.success && result.data) {
      let technologies = result.data;
      if (typeof technologies === 'string') {
        try {
          technologies = JSON.parse(technologies);
        } catch (e) {
          technologies = [];
        }
      }
      return Array.isArray(technologies) ? technologies : [];
    }
  } catch (error) {
    console.error('Error in tech stack research:', error);
  }
  
  return [];
}

// Stage 3: Decision Maker Research
async function researchDecisionMakers(domain: string, competitors: string[]): Promise<string[]> {
  const competitorList = competitors.join(', ');
  
  const prompt = `You are a B2B sales intelligence analyst specializing in buyer personas.

Research the most common job titles and roles of decision makers who purchase products from ${domain} and its competitors (${competitorList}).

Focus on:
- VP/Director level roles
- Head of Department roles
- Manager level roles
- Specific job titles (not generic descriptions)

These will be used for Apollo search targeting to find the right contacts.

Return ONLY a JSON array of job titles (no descriptions, just titles).

Example: ["VP of Sales", "Head of Marketing", "Revenue Operations Manager", "Sales Director"]

Research and return the most relevant job titles:`;

  try {
    const result = await analyzeWithBestModel({
      type: 'decision_maker_research',
      data: { domain, competitors },
      context: prompt
    });
    
    if (result.success && result.data) {
      let decisionMakers = result.data;
      if (typeof decisionMakers === 'string') {
        try {
          decisionMakers = JSON.parse(decisionMakers);
        } catch (e) {
          decisionMakers = [];
        }
      }
      return Array.isArray(decisionMakers) ? decisionMakers : [];
    }
  } catch (error) {
    console.error('Error in decision maker research:', error);
  }
  
  return [];
}

// Stage 4: Pain Point Research
async function researchPainPoints(domain: string, competitors: string[]): Promise<string[]> {
  const competitorList = competitors.join(', ');
  
  const prompt = `You are a customer success analyst specializing in B2B SaaS pain points.

Research the most common pain points and challenges that lead companies to purchase products from ${domain} and its competitors (${competitorList}).

Focus on:
- Operational challenges
- Growth-related problems
- Efficiency issues
- Specific business problems (not generic descriptions)

These will be used for sales messaging and targeting.

Return ONLY a JSON array of pain points (no descriptions, just the pain points).

Example: ["Manual lead qualification", "Low conversion rates", "Lack of sales intelligence", "Inefficient prospecting"]

Research and return the most relevant pain points:`;

  try {
    const result = await analyzeWithBestModel({
      type: 'pain_point_research',
      data: { domain, competitors },
      context: prompt
    });
    
    if (result.success && result.data) {
      let painPoints = result.data;
      if (typeof painPoints === 'string') {
        try {
          painPoints = JSON.parse(painPoints);
        } catch (e) {
          painPoints = [];
        }
      }
      return Array.isArray(painPoints) ? painPoints : [];
    }
  } catch (error) {
    console.error('Error in pain point research:', error);
  }
  
  return [];
}

// Stage 5: Market Trends Research
async function researchMarketTrends(domain: string): Promise<string[]> {
  const prompt = `You are a market intelligence analyst specializing in B2B SaaS trends.

Research the key market trends and industry developments that are driving adoption of products like ${domain}.

Focus on:
- Technology trends
- Business model shifts
- Market dynamics
- Industry-specific trends

These will be used for market positioning and messaging.

Return ONLY a JSON array of market trends (no descriptions, just the trends).

Example: ["AI-powered sales automation", "Remote work adoption", "Digital transformation", "Revenue operations focus"]

Research and return the most relevant market trends:`;

  try {
    const result = await analyzeWithBestModel({
      type: 'market_trends_research',
      data: { domain },
      context: prompt
    });
    
    if (result.success && result.data) {
      let marketTrends = result.data;
      if (typeof marketTrends === 'string') {
        try {
          marketTrends = JSON.parse(marketTrends);
        } catch (e) {
          marketTrends = [];
        }
      }
      return Array.isArray(marketTrends) ? marketTrends : [];
    }
  } catch (error) {
    console.error('Error in market trends research:', error);
  }
  
  return [];
}

// Stage 6: Company Profile Research
async function researchCompanyProfile(websiteUrl: string): Promise<any> {
  const prompt = `You are a company intelligence analyst specializing in B2B SaaS companies.

Research and analyze the company at ${websiteUrl} to determine:
- Industry classification
- Estimated company size (employee count range)
- Estimated revenue range
- Company name
- Location/headquarters

Focus on publicly available information and reasonable estimates based on company stage and market.

Return ONLY a JSON object with this structure:
{
  "industry": "string",
  "companySize": "string (e.g., '11-50', '51-200', '201-1000')",
  "revenueRange": "string (e.g., '$1M-$10M', '$10M-$50M', '$50M-$100M')",
  "companyName": "string",
  "location": "string"
}

Research ${websiteUrl} and return the company profile:`;

  try {
    const result = await analyzeWithBestModel({
      type: 'company_profile_research',
      data: { websiteUrl },
      context: prompt
    });
    
    if (result.success && result.data) {
      let profile = result.data;
      if (typeof profile === 'string') {
        try {
          profile = JSON.parse(profile);
        } catch (e) {
          profile = {};
        }
      }
      return profile;
    }
  } catch (error) {
    console.error('Error in company profile research:', error);
  }
  
  return {
    industry: 'Software',
    companySize: '51-200',
    revenueRange: '$10M-$50M',
    companyName: 'Research in Progress',
    location: 'Research in Progress'
  };
}

// Stage 7: Go-to-Market Strategy Research
async function researchGoToMarketStrategy(websiteUrl: string): Promise<string> {
  const prompt = `You are a go-to-market strategy analyst specializing in B2B SaaS.

Research and analyze the go-to-market strategy of the company at ${websiteUrl}.

Look for:
- Sales model (inbound, outbound, product-led growth, etc.)
- Marketing channels
- Target customer approach
- Pricing strategy indicators

Return ONLY a concise description of their go-to-market strategy (1-2 sentences max).

Example: "Product-led growth with targeted outbound sales and content marketing."

Research ${websiteUrl} and return the go-to-market strategy:`;

  try {
    const result = await analyzeWithBestModel({
      type: 'gtm_strategy_research',
      data: { websiteUrl },
      context: prompt
    });
    
    if (result.success && result.data) {
      return typeof result.data === 'string' ? result.data : 'Research in Progress';
    }
  } catch (error) {
    console.error('Error in GTM strategy research:', error);
  }
  
  return 'Research in Progress';
}

// Generate research summary from all findings
function generateResearchSummary(research: any): string {
  const { companyProfile, decisionMakers, painPoints, customerTechStack, competitors, marketTrends, goToMarketStrategy } = research;
  
  return `Comprehensive analysis of ${companyProfile.companyName || 'the company'} reveals a ${companyProfile.industry} company targeting ${companyProfile.companySize} organizations with ${companyProfile.revenueRange} revenue. 

Key decision makers include ${decisionMakers.slice(0, 3).join(', ')} roles, while common pain points include ${painPoints.slice(0, 3).join(', ')}. 

The company's customers typically use ${customerTechStack.slice(0, 3).join(', ')} alongside their solution, competing with ${competitors.slice(0, 3).join(', ')} in a market driven by ${marketTrends.slice(0, 2).join(', ')} trends.

Their go-to-market approach focuses on ${goToMarketStrategy}.`;
}

// Generate ICP from website URL (enhanced version)
export async function generateICPFromWebsite(websiteUrl: string): Promise<any> {
  console.log(`🌐 Researching ICP from website: ${websiteUrl}`);
  
  const systemMessage = `You are a world-class B2B Go-To-Market strategist and sales researcher.

Your sole job is to analyze B2B websites and infer who the company is trying to sell to — their Ideal Customer Profile (ICP).

You are not describing the company itself. You are reverse-engineering the **target customer** they are selling to, based on their:
- product positioning
- messaging and taglines
- features and use cases
- integrations
- customer case studies
- demo CTAs and pricing
- job titles mentioned or implied

Your output will be used to build lead lists, write outbound messaging, and feed into Apollo's filters.

You must return a structured, clean JSON object. Do not return explanations, comments, or markdown formatting.`;

  const userMessage = `Visit and analyze the following company website:  
${websiteUrl}

Based only on the content found on that website, infer the Ideal Customer Profile (ICP) that this company is targeting for outbound.

Your job is to describe the **target customer** — not the company itself.

---

Return your output as a valid, well-structured JSON object using the following schema:

{
  "targetCompanySize": {
    "employeeRange": "e.g. 11–50",
    "revenueRange": "e.g. $2M–$10M"
  },
  "targetIndustries": [
    "e.g. B2B SaaS",
    "e.g. eCommerce Brands",
    "e.g. Marketing Agencies"
  ],
  "buyerPersonas": [
    {
      "title": "e.g. VP of Marketing",
      "role": "e.g. Marketing leadership",
      "seniority": "Manager / Director / VP / CXO"
    }
  ],
  "painPointsAndTriggers": [
    "e.g. Manual outbound takes too much time",
    "e.g. Struggling to personalize outreach at scale",
    "e.g. Outbound team underperforming"
  ],
  "messagingAngles": [
    "Automated workflows for lead personalization",
    "AI-powered outbound",
    "No manual research required"
  ],
  "caseStudiesOrProof": [
    "e.g. Helped X company increase reply rate by 3x",
    "e.g. Used by leading RevOps teams"
  ],
  "recommendedApolloSearchParams": {
    "employeeCount": "e.g. 11–50",
    "titles": [
      "e.g. VP of Sales",
      "e.g. Head of Revenue Operations"
    ],
    "seniorityLevels": [
      "Manager", "Director", "VP", "CXO", "Owner"
    ],
    "industries": [
      "e.g. Software", "e.g. Marketing & Advertising"
    ],
    "technologies": [
      "e.g. HubSpot", "e.g. Salesforce", "e.g. Apollo"
    ],
    "locations": [
      "e.g. North America", "e.g. UK", "e.g. Europe"
    ]
  }
}

---

❗Important rules:
- Never describe the company itself (do not say "This company is a..."
- Do not guess if data is unclear — leave the field empty or comment in the field.
- Output only the JSON object. No formatting, preamble, or commentary.`;

  try {
    const response = await callClaude3(userMessage);
    return JSON.parse(response);
  } catch (error) {
    console.error('Error generating ICP:', error);
    // Return a fallback ICP structure
    return {
      targetCompanySize: {
        employeeRange: "11-50",
        revenueRange: "$2M-$10M"
      },
      targetIndustries: ["B2B SaaS", "Technology"],
      buyerPersonas: [
        {
          title: "VP of Sales",
          role: "Sales leadership",
          seniority: "VP"
        }
      ],
      painPointsAndTriggers: [
        "Manual outbound takes too much time",
        "Struggling to personalize outreach at scale"
      ],
      messagingAngles: [
        "Automated workflows for lead personalization",
        "AI-powered outbound"
      ],
      caseStudiesOrProof: [
        "Used by leading RevOps teams"
      ],
      recommendedApolloSearchParams: {
        employeeCount: "11-50",
        titles: ["VP of Sales", "VP of Marketing"],
        seniorityLevels: ["VP", "Director"],
        industries: ["Software", "Technology"],
        technologies: ["HubSpot", "Salesforce"],
        locations: ["United States"]
      }
    };
  }
}

// Estimate the number of identifiable visitors (e.g., using SimilarWeb, or LLM math)
export async function estimateIdentifiableTraffic(companyDomain: string) {
  // Example: Use SimilarWeb API, or prompt Claude for an estimate
  // Prompt: "Estimate the monthly US website traffic for the company with domain: {companyDomain}. Return a number."
  return '';
}

// Identify the most important web page types for the company (e.g., pricing, demo, solutions)
export async function identifyImportantPageTypes(companyDomain: string) {
  // Example: Scrape navigation, or prompt Claude for likely key page types
  // Prompt: "Given the company website {companyDomain}, what is the most important page type for high-intent buyers (e.g., pricing, demo, solutions, product)? Return a single page type."
  return '';
}

// Find a similar customer (logo or company name) for social proof
export async function findSimilarCustomer(companyDomain: string) {
  // Example: Use a static list, CRM, or prompt Claude for a similar company
  // Prompt: "Suggest a well-known company similar to {companyDomain} that would be a relevant social proof for a B2B SaaS buyer."
  return '';
}

// Estimate average ACV (annual contract value) for the company/industry
export async function estimateAverageACV(companyDomain: string) {
  // Example: Use industry DB, or prompt Claude for an estimate
  // Prompt: "Estimate the average annual contract value (ACV) for a company like {companyDomain} in its industry. Return a dollar amount."
  return '';
}

// Identify the primary KPI for the lead's job title and company
export async function identifyPrimaryKpi(jobTitle: string, companyDomain: string) {
  // Example: Prompt Claude for the most likely KPI
  // Prompt: "Given the job title '{jobTitle}' at {companyDomain}, what is the primary KPI this person cares about?"
  return '';
}

// Identify the main demand generation channel for the company
export async function identifyDemandGenChannel(companyDomain: string) {
  // Example: Prompt Claude for the most likely demand gen channel
  // Prompt: "For a company with domain {companyDomain}, what is the primary demand generation channel (e.g., paid search, content, outbound, events)?"
  return '';
}

// Identify the most relevant tool in the company's tech stack
export async function identifyCurrentStackTool(techStack: any) {
  // Example: Pick from techStack, or prompt Claude for the most relevant tool for SDRs
  // Prompt: "Given this tech stack: {JSON.stringify(techStack)}, what is the most relevant tool for SDRs to receive new leads?"
  return '';
}

// Generate personalized email using Claude
export async function generatePersonalizedEmail(data: {
  lead: any;
  icp: any;
  enrichment?: any;
  tone?: string;
  style?: string;
}): Promise<{ subject: string; body: string }> {
  const { lead, icp, enrichment, tone = 'professional', style = 'outbound' } = data;
  
  const systemMessage = `You are a world-class B2B sales copywriter specializing in personalized outbound emails.

Your job is to write compelling, personalized email templates that:
- Are highly relevant to the recipient's role and company
- Address specific pain points and business challenges
- Have a clear, actionable call-to-action
- Match the requested tone and style
- Are concise but impactful (under 150 words)

You must return a JSON object with "subject" and "body" fields. No explanations or markdown formatting.`;

  const userMessage = `Write a personalized ${tone} ${style} email for:

**Recipient:** ${lead.fullName} (${lead.title}) at ${lead.companyName}
**Email:** ${lead.email}

**ICP Context:**
- Industry: ${icp.industries?.join(', ') || 'Technology'}
- Pain Points: ${icp.painPoints?.join(', ') || 'Business efficiency'}
- Technologies: ${icp.technologies?.join(', ') || 'Web technologies'}
- Company Size: ${icp.companySize?.join(', ') || '11-50 employees'}

**Enrichment Data:** ${enrichment ? `
- Bio: ${enrichment.bio || 'Not available'}
- Interests: ${enrichment.interests || 'Not available'}
- Why They Care: ${enrichment.oneSentenceWhyTheyCare || 'Not available'}` : 'Not available'}

**Tone:** ${tone}
**Style:** ${style}

Create a compelling subject line and personalized email body that resonates with this specific person and their business context.`;

  try {
    const response = await callClaude3(userMessage);
    
    // Try to parse as JSON, fallback to structured response
    try {
      const parsed = JSON.parse(response);
      if (parsed.subject && parsed.body) {
        return {
          subject: parsed.subject,
          body: parsed.body
        };
      }
    } catch (parseError) {
      // Fallback: extract subject and body from text
      const lines = response.split('\n').filter(line => line.trim());
      const subject = lines[0]?.replace(/^subject:\s*/i, '').trim() || 
                     `Quick question about ${icp.validUseCase || 'business efficiency'} at ${lead.companyName}`;
      
      const body = lines.slice(1).join('\n').trim() || 
                  `Hi ${lead.firstName},\n\nI noticed you're the ${lead.title} at ${lead.companyName}. Would you be open to a quick call about ${icp.painPoints?.[0] || 'business challenges'}?\n\nBest regards,\n[Your Name]`;
      
      return { subject, body };
    }
    
    // Final fallback
    return {
      subject: `Quick question about ${icp.validUseCase || 'business efficiency'} at ${lead.companyName}`,
      body: `Hi ${lead.firstName},\n\nI noticed you're the ${lead.title} at ${lead.companyName}. Would you be open to a quick call about ${icp.painPoints?.[0] || 'business challenges'}?\n\nBest regards,\n[Your Name]`
    };
    
  } catch (error) {
    console.error('Error generating personalized email:', error);
    throw new Error('Failed to generate personalized email');
  }
}

export class ClaudeAgent implements Agent {
  name = 'ClaudeAgent';

  async execute(params: { prompt: string; retries?: number }): Promise<string> {
    return callClaude3(params.prompt, params.retries);
  }

  getCapabilities() {
    return ['llm', 'chat', 'icp', 'ibp', 'email_generation'];
  }
} 