// @ts-ignore: Deno runtime provides Deno.env in edge functions
// PersonaOps Sequential Multi-Agent Company Research Pipeline

declare const Deno: any;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Helper to call the LLM with a prompt
async function callLLM(prompt: string, systemPrompt = 'You are an expert B2B research analyst. Always return valid JSON.') {
  const apiKey = typeof Deno !== 'undefined' ? Deno.env.get('OPENROUTER_API_KEY') : undefined;
  if (!apiKey) throw new Error('OpenRouter API key not configured');
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.3
    }),
  });
  if (!response.ok) throw new Error(`LLM error: ${response.status}`);
  const data = await response.json();
  const llmText = data.choices?.[0]?.message?.content || '';
  try {
    return JSON.parse(llmText);
  } catch (e) {
    throw new Error('LLM output was not valid JSON: ' + llmText);
  }
}

// Agent 1: Company Overview
async function agentCompanyOverview(url: string) {
  const prompt = `Research the company at this URL: ${url}.
Return a JSON object with: company_name, summary, industry, headquarters, founded, company_type, company_size, revenue_range, funding.`;
  return await callLLM(prompt);
}

// Agent 2: Market/Competitive Intelligence
async function agentMarketIntelligence(url: string, prev: any) {
  const prompt = `Given this company data: ${JSON.stringify(prev)}\nResearch the market and competitive landscape for the company at ${url}.
Return a JSON object with: main_products, target_market, competitors, market_trends, positioning, value_proposition.`;
  return await callLLM(prompt);
}

// Agent 3: Technology/Features/Stack
async function agentTechStack(url: string, prev: any) {
  const prompt = `Given this company and market data: ${JSON.stringify(prev)}\nResearch the technology stack, key features, platform compatibility, and integrations for the company at ${url}.
Return a JSON object with: key_features, platform_compatibility, technology_stack, integration_capabilities.`;
  return await callLLM(prompt);
}

// Agent 4: Sales/Go-to-Market/Opportunity/Final Synthesis
async function agentSalesGTM(url: string, prev: any) {
  const prompt = `Given this full company, market, and technology data: ${JSON.stringify(prev)}\nSynthesize actionable sales, go-to-market, and opportunity insights for the company at ${url}.
Return a JSON object with: notable_clients, social_media (linkedin, twitter, facebook), research_summary, sales_opportunities, gtm_recommendations.`;
  return await callLLM(prompt);
}

// Orchestrator: Run all agents in sequence, merging outputs
export async function runFullCompanyResearchPipeline(url: string): Promise<any> {
  console.log('[Pipeline] Agent 1: Company Overview starting...');
  const overview = await agentCompanyOverview(url);
  console.log('[Pipeline] Agent 1 result:', JSON.stringify(overview));

  console.log('[Pipeline] Agent 2: Market/Competitive Intelligence starting...');
  const market = await agentMarketIntelligence(url, overview);
  console.log('[Pipeline] Agent 2 result:', JSON.stringify(market));

  console.log('[Pipeline] Agent 3: Technology/Features/Stack starting...');
  const tech = await agentTechStack(url, { ...overview, ...market });
  console.log('[Pipeline] Agent 3 result:', JSON.stringify(tech));

  console.log('[Pipeline] Agent 4: Sales/Go-to-Market/Final Synthesis starting...');
  const sales = await agentSalesGTM(url, { ...overview, ...market, ...tech });
  console.log('[Pipeline] Agent 4 result:', JSON.stringify(sales));

  // Merge all results into a single object matching frontend schema
  const merged = {
    company_name: overview.company_name || 'N/A',
    summary: overview.summary || 'N/A',
    industry: overview.industry || 'N/A',
    headquarters: overview.headquarters || 'N/A',
    founded: overview.founded || 'N/A',
    company_type: overview.company_type || 'N/A',
    company_size: overview.company_size || 'N/A',
    revenue_range: overview.revenue_range || 'N/A',
    funding: overview.funding || 'N/A',
    main_products: market.main_products || 'N/A',
    target_market: market.target_market || 'N/A',
    competitors: market.competitors || 'N/A',
    market_trends: market.market_trends || 'N/A',
    positioning: market.positioning || 'N/A',
    value_proposition: market.value_proposition || 'N/A',
    key_features: tech.key_features || 'N/A',
    platform_compatibility: tech.platform_compatibility || 'N/A',
    technology_stack: tech.technology_stack || 'N/A',
    integration_capabilities: tech.integration_capabilities || 'N/A',
    notable_clients: sales.notable_clients || 'N/A',
    social_media: sales.social_media || { linkedin: 'N/A', twitter: 'N/A', facebook: 'N/A' },
    research_summary: sales.research_summary || 'N/A',
    sales_opportunities: sales.sales_opportunities || 'N/A',
    gtm_recommendations: sales.gtm_recommendations || 'N/A',
  };
  console.log('[Pipeline] FINAL MERGED RESULT:', JSON.stringify(merged));
  return merged;
} 