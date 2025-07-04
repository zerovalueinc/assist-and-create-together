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

  async analyzeCompany(url: string): Promise<any> {
    // New GTM strategist prompt
    const prompt = `
You are a senior GTM strategist and sales expert.

A company has just submitted their website: ${url}

Your job is to analyze their business, offering, and positioning — and based on that, determine:

---

### 🔷 PART 1: Ideal Business Profile (IBP)
What *type of companies* should they be selling to?

Return a JSON object with:

- industry (e.g. SaaS, Fintech, Healthcare)
- segment (SMB, Mid-Market, Enterprise)
- companySize (e.g. 11–50, 200–500)
- revenueRange (e.g. <$5M, $10M–$100M)
- geography (target regions)
- businessModel (e.g. B2B SaaS, PLG, Marketplace)
- salesMotion (e.g. sales-led, product-led, outbound-led)
- goToMarketModel (e.g. outbound-heavy, inbound-driven, ABM)
- techStack (typical tools their ideal customers use)
- fitSignals (array of traits: e.g. "Hiring SDRs", "Raised Series A", etc.)

---

### 🔷 PART 2: Ideal Customer Profile (ICP)
What *roles/people inside those companies* should they target for outbound or partnerships?

Return a JSON object with:

- buyerTitles (array: e.g. "VP Sales", "Head of RevOps")
- department (e.g. Sales, Marketing, Partnerships)
- seniorityLevel (Manager, Director+, VP+)
- keyResponsibilities (what they do daily)
- painPoints (what problems they care about)
- buyingTriggers (e.g. hiring SDRs, team growth, pipeline problems)
- KPIs (e.g. SQLs, reply rates, revenue)
- techStack (common tools used by these buyers)
- decisionProcess (how they choose tools/partners)
- commonObjections (array)
- budgetRange (estimate of what they'd pay for a tool like this)
- emotionalDrivers (e.g. "wants to scale without hiring", "wants faster pipeline")

---

### 🔷 PART 3: GTM Summary
Return a high-level GTM recommendation with:

- goToMarketInsights (summary string)
- marketTrends (array)
- competitiveLandscape (array)
- decisionMakers (array of { name, title, linkedin })
- researchSummary (string)

Respond with a single valid JSON object:
{
  ibp: { ... },
  icp: { ... },
  goToMarketInsights: "...",
  marketTrends: [...],
  competitiveLandscape: [...],
  decisionMakers: [...],
  researchSummary: "..."
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
    let result: any;
    try {
      result = JSON.parse(content);
    } catch (e) {
      // Fallback to minimal object if not valid JSON
      result = {
        ibp: {},
        icp: {},
        goToMarketInsights: '',
        marketTrends: [],
        competitiveLandscape: [],
        decisionMakers: [],
        researchSummary: content,
      };
    }
    // Ensure all fields exist for frontend mapping
    result.ibp = result.ibp || {};
    result.icp = result.icp || {};
    result.goToMarketInsights = result.goToMarketInsights || '';
    result.marketTrends = Array.isArray(result.marketTrends) ? result.marketTrends : [];
    result.competitiveLandscape = Array.isArray(result.competitiveLandscape) ? result.competitiveLandscape : [];
    result.decisionMakers = Array.isArray(result.decisionMakers) ? result.decisionMakers : [];
    result.researchSummary = result.researchSummary || '';
    return result;
  }
} 