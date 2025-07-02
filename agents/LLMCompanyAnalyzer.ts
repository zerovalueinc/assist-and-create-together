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
    // Build the main prompt for the LLM
    const prompt = `
      You are a senior B2B SaaS market analyst. Given the company website URL: ${url},
      perform a comprehensive 5-phase research analysis:
      1. Company Intelligence: Identify company name, industry, size, revenue, and key decision makers.
      2. Market Research: List current market trends and growth drivers for this company's sector.
      3. Competitive Analysis: Identify main competitors and describe the competitive landscape.
      4. Technology Assessment: List core technologies and tools used by the company.
      5. Strategic Synthesis: Recommend actionable go-to-market strategies and summarize key findings.
      Format your response as a JSON object with these fields:
      - companyName
      - companyProfile (with industry, companySize, revenueRange)
      - decisionMakers (array)
      - painPoints (array)
      - technologies (array)
      - location
      - marketTrends (array)
      - competitiveLandscape (array)
      - goToMarketStrategy
      - researchSummary
      - website
      Be concise but thorough. Use real data if possible, otherwise make plausible inferences.
    `;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
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
        companyProfile: { industry: '', companySize: '', revenueRange: '' },
        decisionMakers: [],
        painPoints: [],
        technologies: [],
        location: '',
        marketTrends: [],
        competitiveLandscape: [],
        goToMarketStrategy: '',
        researchSummary: content,
        website: url,
      };
    }
    return result;
  }
} 