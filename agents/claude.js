"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.callClaude3 = callClaude3;
exports.generateComprehensiveIBP = generateComprehensiveIBP;
exports.generateICPFromWebsite = generateICPFromWebsite;
exports.estimateIdentifiableTraffic = estimateIdentifiableTraffic;
exports.identifyImportantPageTypes = identifyImportantPageTypes;
exports.findSimilarCustomer = findSimilarCustomer;
exports.estimateAverageACV = estimateAverageACV;
exports.identifyPrimaryKpi = identifyPrimaryKpi;
exports.identifyDemandGenChannel = identifyDemandGenChannel;
exports.identifyCurrentStackTool = identifyCurrentStackTool;
// agents/claude.ts
// Handles prompt construction and calls Claude 3 Opus for syntax field generation
const openai_1 = __importDefault(require("openai"));
const webCrawler_1 = require("./webCrawler");
const analysisAgent_1 = require("./analysisAgent");
function callClaude3(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        const openai = new openai_1.default({
            apiKey: process.env.OPENROUTER_API_KEY,
            baseURL: 'https://openrouter.ai/api/v1' // Use OpenRouter's API endpoint
        });
        try {
            const response = yield openai.chat.completions.create({
                model: "anthropic/claude-3.5-sonnet",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            });
            return response.choices[0].message.content || '';
        }
        catch (error) {
            console.error('Error calling Claude:', error);
            throw new Error('Failed to call Claude API');
        }
    });
}
// Enhanced ICP/IBP Research with Serper API integration
function generateComprehensiveIBP(websiteUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`🔬 Starting comprehensive IBP research for: ${websiteUrl}`);
        try {
            // Step 1: Extract company domain and basic info
            const domain = extractDomain(websiteUrl);
            console.log(`📊 Extracted domain: ${domain}`);
            // Step 2: Research similar companies using Serper
            const similarCompanies = yield researchSimilarCompanies(domain);
            console.log(`🏢 Found ${similarCompanies.length} similar companies`);
            // Step 3: Research market intelligence
            const marketIntelligence = yield researchMarketIntelligence(domain, similarCompanies);
            console.log(`📈 Market intelligence gathered`);
            // Step 4: Generate comprehensive IBP using Claude
            const comprehensiveIBP = yield generateIBPWithClaude(websiteUrl, similarCompanies, marketIntelligence);
            console.log(`✅ Comprehensive IBP generated`);
            return comprehensiveIBP;
        }
        catch (error) {
            console.error('Error in comprehensive IBP research:', error);
            throw error;
        }
    });
}
// Extract domain from URL
function extractDomain(url) {
    try {
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
        return urlObj.hostname.replace('www.', '');
    }
    catch (_a) {
        return url.replace('www.', '').split('/')[0];
    }
}
// Research similar companies using web crawler
function researchSimilarCompanies(domain) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`🔍 Researching similar companies for: ${domain}`);
        try {
            const similarCompanies = yield (0, webCrawler_1.searchSimilarCompanies)(domain);
            console.log(`✅ Found ${similarCompanies.length} unique similar companies`);
            return similarCompanies;
        }
        catch (error) {
            console.error('Error researching similar companies:', error);
            return [];
        }
    });
}
// Research market intelligence using web crawler
function researchMarketIntelligence(domain, similarCompanies) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`📊 Researching market intelligence for: ${domain}`);
        try {
            const marketData = yield (0, webCrawler_1.searchMarketIntelligence)(domain);
            console.log(`📈 Market intelligence gathered`);
            return marketData;
        }
        catch (error) {
            console.error('Error researching market intelligence:', error);
            return {};
        }
    });
}
// Generate comprehensive IBP using high-quality analysis
function generateIBPWithClaude(websiteUrl, similarCompanies, marketIntelligence) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`🧠 Using high-quality analysis for IBP generation`);
        // Prepare data for analysis
        const analysisData = {
            websiteUrl,
            similarCompanies,
            marketIntelligence,
            timestamp: new Date().toISOString()
        };
        // Use the best model for analysis
        const result = yield (0, analysisAgent_1.analyzeWithBestModel)({
            type: 'ibp_analysis',
            data: analysisData,
            context: 'Comprehensive IBP generation for sales intelligence'
        });
        if (result.success) {
            console.log(`✅ High-quality IBP generated using ${result.model_used} (${result.cost_estimate})`);
            return result.data;
        }
        else {
            console.warn('⚠️ High-quality analysis failed, falling back to basic generation');
            return generateBasicIBP(websiteUrl, similarCompanies, marketIntelligence);
        }
    });
}
// Fallback basic IBP generation
function generateBasicIBP(websiteUrl, similarCompanies, marketIntelligence) {
    return __awaiter(this, void 0, void 0, function* () {
        const systemMessage = `You are a Sales Intelligence Research Analyst specializing in B2B market analysis and Ideal Business Persona (IBP) development.`;
        const userMessage = `Analyze the following data to create a comprehensive Ideal Business Persona (IBP) for sales intelligence:

**Target Company:** ${websiteUrl}

**Similar Companies Research:**
${JSON.stringify(similarCompanies, null, 2)}

**Market Intelligence:**
${JSON.stringify(marketIntelligence, null, 2)}

Create a comprehensive IBP that includes:

1. **Quantitative Market Analysis**
2. **Enhanced Buyer Personas**
3. **Sales Intelligence**
4. **Competitive Intelligence**
5. **Revenue Optimization**

Return as a structured JSON object with detailed, actionable insights for sales teams.`;
        try {
            const response = yield callClaude3(userMessage);
            return JSON.parse(response);
        }
        catch (error) {
            console.error('Error generating basic IBP:', error);
            return {
                quantitativeMarketAnalysis: {
                    marketSize: "To be researched",
                    growthRate: "To be researched",
                    marketMaturity: "To be researched"
                },
                buyerPersonas: {
                    decisionMaker: { role: "To be analyzed" },
                    influencer: { role: "To be analyzed" },
                    economicBuyer: { role: "To be analyzed" }
                },
                salesIntelligence: {
                    buyingTriggers: ["To be analyzed"],
                    decisionTimeline: "To be analyzed",
                    riskFactors: ["To be analyzed"]
                },
                competitiveIntelligence: {
                    directCompetitors: ["To be analyzed"],
                    competitiveAdvantages: ["To be analyzed"]
                },
                revenueOptimization: {
                    pricingStrategy: "To be analyzed",
                    salesCycle: "To be analyzed",
                    customerLifetimeValue: "To be analyzed"
                }
            };
        }
    });
}
// Generate ICP from website URL (enhanced version)
function generateICPFromWebsite(websiteUrl) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const response = yield callClaude3(userMessage);
            return JSON.parse(response);
        }
        catch (error) {
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
    });
}
// Estimate the number of identifiable visitors (e.g., using SimilarWeb, or LLM math)
function estimateIdentifiableTraffic(companyDomain) {
    return __awaiter(this, void 0, void 0, function* () {
        // Example: Use SimilarWeb API, or prompt Claude for an estimate
        // Prompt: "Estimate the monthly US website traffic for the company with domain: {companyDomain}. Return a number."
        return '';
    });
}
// Identify the most important web page types for the company (e.g., pricing, demo, solutions)
function identifyImportantPageTypes(companyDomain) {
    return __awaiter(this, void 0, void 0, function* () {
        // Example: Scrape navigation, or prompt Claude for likely key page types
        // Prompt: "Given the company website {companyDomain}, what is the most important page type for high-intent buyers (e.g., pricing, demo, solutions, product)? Return a single page type."
        return '';
    });
}
// Find a similar customer (logo or company name) for social proof
function findSimilarCustomer(companyDomain) {
    return __awaiter(this, void 0, void 0, function* () {
        // Example: Use a static list, CRM, or prompt Claude for a similar company
        // Prompt: "Suggest a well-known company similar to {companyDomain} that would be a relevant social proof for a B2B SaaS buyer."
        return '';
    });
}
// Estimate average ACV (annual contract value) for the company/industry
function estimateAverageACV(companyDomain) {
    return __awaiter(this, void 0, void 0, function* () {
        // Example: Use industry DB, or prompt Claude for an estimate
        // Prompt: "Estimate the average annual contract value (ACV) for a company like {companyDomain} in its industry. Return a dollar amount."
        return '';
    });
}
// Identify the primary KPI for the lead's job title and company
function identifyPrimaryKpi(jobTitle, companyDomain) {
    return __awaiter(this, void 0, void 0, function* () {
        // Example: Prompt Claude for the most likely KPI
        // Prompt: "Given the job title '{jobTitle}' at {companyDomain}, what is the primary KPI this person cares about?"
        return '';
    });
}
// Identify the main demand generation channel for the company
function identifyDemandGenChannel(companyDomain) {
    return __awaiter(this, void 0, void 0, function* () {
        // Example: Prompt Claude for the most likely demand gen channel
        // Prompt: "For a company with domain {companyDomain}, what is the primary demand generation channel (e.g., paid search, content, outbound, events)?"
        return '';
    });
}
// Identify the most relevant tool in the company's tech stack
function identifyCurrentStackTool(techStack) {
    return __awaiter(this, void 0, void 0, function* () {
        // Example: Pick from techStack, or prompt Claude for the most relevant tool for SDRs
        // Prompt: "Given this tech stack: {JSON.stringify(techStack)}, what is the most relevant tool for SDRs to receive new leads?"
        return '';
    });
}
