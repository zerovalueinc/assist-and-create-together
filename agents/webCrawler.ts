// agents/webCrawler.ts
// Web crawling and search functionality using OpenRouter's web search tools
// Replaced with demo data for now to avoid API issues

interface WebSearchResult {
  title: string;
  snippet: string;
  link: string;
  source: 'web_search';
}

interface WebSearchOptions {
  maxResults?: number;
  searchType?: 'general' | 'news' | 'specific_page';
  includeSimilar?: boolean;
}

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
export async function searchWeb(query: string, options: WebSearchOptions = {}): Promise<WebSearchResult[]> {
  console.log(`🔍 Demo web searching: ${query}`);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return demo results based on query
  const demoResults: WebSearchResult[] = [
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
}

// Search for similar companies using demo data
export async function searchSimilarCompanies(domain: string): Promise<any[]> {
  console.log(`🔍 Demo searching similar companies for: ${domain}`);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log(`✅ Found ${DEMO_SIMILAR_COMPANIES.length} demo similar companies`);
  return DEMO_SIMILAR_COMPANIES;
}

// Search for market intelligence using demo data
export async function searchMarketIntelligence(domain: string): Promise<any> {
  console.log(`📊 Demo researching market intelligence for: ${domain}`);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  console.log(`📈 Demo market intelligence gathered`);
  return DEMO_MARKET_INTELLIGENCE;
}

// Search for company information using demo data
export async function searchCompanyInfo(domain: string): Promise<any> {
  console.log(`🏢 Demo searching company info for: ${domain}`);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
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
}

// Legacy function for backward compatibility
export async function fetchSerperContext(query: string): Promise<string> {
  console.log(`🔍 Demo Serper context for: ${query}`);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return `Demo context information for: ${query}. This would contain real web search context in production.`;
} 