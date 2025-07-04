// @ts-ignore: Deno runtime provides Deno.env in edge functions

export interface CompanyAnalysisResult {
  companyName: string;
  companyProfile: {
    industry: string;
    companySize: string;
    revenueRange: string;
  };
  decisionMakers: string[];
  painPoints: string[];
  technologies: string[];
  location: string;
  marketTrends: string[];
  competitiveLandscape: string[];
  goToMarketStrategy: string;
  researchSummary: string;
  website: string;
}

export class LLMCompanyAnalyzer {
  private apiKey: string;

  constructor(apiKey?: string) {
    // Deno.env is available in edge function runtime
    // @ts-ignore
    this.apiKey = apiKey || (typeof Deno !== 'undefined' ? Deno.env.get('OPENROUTER_API_KEY') : '');
  }

  async analyzeCompany(url: string): Promise<CompanyAnalysisResult> {
    // Build the new, detailed prompt for the LLM
    const prompt = `
You are a senior B2B SaaS market analyst agent. Given the company website URL: ${url}, conduct a deep, structured 5-part research synthesis optimized for sales and marketing intelligence.

Perform the following five research phases:

### 1. Company Intelligence
- Extract:
  - companyName
  - description (1-2 sentences)
  - industry
  - segment (SMB, Mid-Market, Enterprise)
  - estimated companySize (number of employees)
  - estimated revenueRange
  - location (HQ city and country)
  - businessModel (ex: subscription SaaS, product-led growth, usage-based pricing)
  - foundingYear

### 2. Key Decision Makers
- Identify major buyer personas:
  - Full names, titles, and LinkedIn URLs of key decision makers (focus on roles like CEO, CMO, CTO, VP Sales, VP Product, Head of Engineering)
  - Buying committee overview (what roles likely influence or make purchase decisions)

### 3. Technology Stack and Innovation
- List known or inferred core technologies (website tech stack, CRM, analytics, infrastructure)
- Highlight product innovation or integrations (APIs, AI use, platform capabilities)
- Funding history (rounds raised, investors, date if available)
- Use builtWith, Crunchbase, and site scraping for inference

### 4. Market Context and Competitive Analysis
- Identify:
  - Key market trends and opportunities in their sector
  - Common challenges companies like them face (relevant "painPoints")
  - Primary competitors with brief comparative positioning
  - Related or alternative providers (include indirect competition)

### 5. Strategic Synthesis for GTM
- Generate a tailored goToMarketStrategy:
  - Highlight how to position your product/service value proposition
  - Suggest potential messaging angles based on their needs, tech maturity, and market stage
  - Recommend outreach strategies (cold email persona focus, timing, channels)

Package your response in JSON format. Use real data when accessible; fallback to accurate inference when needed.

### JSON Output Structure
Return only this JSON object:

{
  "companyName": "",
  "companyProfile": {
    "description": "",
    "industry": "",
    "segment": "",
    "companySize": "",
    "revenueRange": "",
    "location": "",
    "businessModel": "",
    "foundingYear": ""
  },
  "website": "",
  "technologies": [],
  "funding": {
    "totalRaised": "",
    "investors": [],
    "lastRound": "",
    "lastRoundDate": ""
  },
  "decisionMakers": [
    {
      "name": "",
      "title": "",
      "linkedin": ""
    }
  ],
  "painPoints": [],
  "marketTrends": [],
  "competitiveLandscape": [
    {
      "name": "",
      "description": ""
    }
  ],
  "goToMarketStrategy": "",
  "researchSummary": ""
}
`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-opus',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content || '';
    
    // Try to parse the LLM's response as JSON
    let result: CompanyAnalysisResult;
    try {
      result = JSON.parse(content);
    } catch (e) {
      // If not valid JSON, fallback to a minimal object
      result = {
        companyName: url,
        companyProfile: { description: '', industry: '', segment: '', companySize: '', revenueRange: '', location: '', businessModel: '', foundingYear: '' },
        website: url,
        technologies: [],
        funding: { totalRaised: '', investors: [], lastRound: '', lastRoundDate: '' },
        decisionMakers: [],
        painPoints: [],
        marketTrends: [],
        competitiveLandscape: [],
        goToMarketStrategy: '',
        researchSummary: content,
      };
    }
    return result;
  }
} 