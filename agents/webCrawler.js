"use strict";
// agents/webCrawler.ts
// Web crawling and search functionality using OpenRouter's web search tools
// Replaced with demo data for now to avoid API issues
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchWeb = searchWeb;
exports.searchSimilarCompanies = searchSimilarCompanies;
exports.searchMarketIntelligence = searchMarketIntelligence;
exports.searchCompanyInfo = searchCompanyInfo;
exports.fetchSerperContext = fetchSerperContext;
// Demo data for similar companies
const DEMO_SIMILAR_COMPANIES = [
    {
        name: "Coda",
        description: "All-in-one doc that brings words, data, and teams together",
        industry: "Productivity Software",
        url: "https://coda.io"
    },
    {
        name: "ClickUp",
        description: "One app to replace them all - tasks, docs, goals & more",
        industry: "Project Management",
        url: "https://clickup.com"
    },
    {
        name: "Monday.com",
        description: "Work management platform for teams",
        industry: "Project Management",
        url: "https://monday.com"
    },
    {
        name: "Airtable",
        description: "Organize anything with the power of a database",
        industry: "Productivity Software",
        url: "https://airtable.com"
    },
    {
        name: "Figma",
        description: "Collaborative interface design tool",
        industry: "Design Software",
        url: "https://figma.com"
    }
];
// Demo market intelligence data
const DEMO_MARKET_INTELLIGENCE = {
    marketSize: {
        totalAddressableMarket: "$50B+ collaboration software market",
        currentRevenue: "$250M - $400M annual revenue",
        marketShare: "15-20% in collaborative workspace segment",
        growthRate: "60% YoY growth rate"
    },
    marketMaturity: "Growth stage with increasing consolidation",
    competitiveLandscape: {
        totalCompetitors: "50+ direct competitors",
        marketLeaders: ["Microsoft", "Google", "Atlassian"],
        marketConcentration: "Moderate with several dominant players"
    }
};
// Main web search function using demo data
function searchWeb(query_1) {
    return __awaiter(this, arguments, void 0, function* (query, options = {}) {
        console.log(`🔍 Demo web searching: ${query}`);
        // Simulate processing delay
        yield new Promise(resolve => setTimeout(resolve, 500));
        // Return demo results based on query
        const demoResults = [
            {
                title: `Demo result for: ${query}`,
                snippet: `This is demo data for the search query "${query}". In production, this would contain real web search results.`,
                link: "https://example.com/demo-result",
                source: 'web_search'
            },
            {
                title: `Additional demo result for: ${query}`,
                snippet: `Another demo result showing how the search would work with real data.`,
                link: "https://example.com/demo-result-2",
                source: 'web_search'
            }
        ];
        console.log(`✅ Demo web search completed for: ${query}`);
        return demoResults;
    });
}
// Search for similar companies using demo data
function searchSimilarCompanies(domain) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`🔍 Demo searching similar companies for: ${domain}`);
        // Simulate processing delay
        yield new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`✅ Found ${DEMO_SIMILAR_COMPANIES.length} demo similar companies`);
        return DEMO_SIMILAR_COMPANIES;
    });
}
// Search for market intelligence using demo data
function searchMarketIntelligence(domain) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`📊 Demo researching market intelligence for: ${domain}`);
        // Simulate processing delay
        yield new Promise(resolve => setTimeout(resolve, 800));
        console.log(`📈 Demo market intelligence gathered`);
        return DEMO_MARKET_INTELLIGENCE;
    });
}
// Search for company information using demo data
function searchCompanyInfo(domain) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`🏢 Demo searching company info for: ${domain}`);
        // Simulate processing delay
        yield new Promise(resolve => setTimeout(resolve, 600));
        const demoCompanyInfo = {
            name: domain.replace('.com', '').replace('www.', ''),
            description: `Demo company information for ${domain}`,
            industry: "Technology",
            founded: "2015",
            employees: "100-500",
            revenue: "$10M-$50M",
            website: `https://${domain}`
        };
        console.log(`✅ Demo company info gathered for: ${domain}`);
        return demoCompanyInfo;
    });
}
// Legacy function for backward compatibility
function fetchSerperContext(query) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`🔍 Demo Serper context for: ${query}`);
        // Simulate processing delay
        yield new Promise(resolve => setTimeout(resolve, 400));
        return `Demo context information for: ${query}. This would contain real web search context in production.`;
    });
}
