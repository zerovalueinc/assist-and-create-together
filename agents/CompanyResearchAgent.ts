// @ts-ignore: Deno runtime provides Deno.env in edge functions
// Modular Company Research Agent for PersonaOps
// Runs specialized LLM calls for each research section and merges results

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

export async function runFullCompanyResearch(url: string): Promise<any> {
  // 1. Company Overview
  const overviewPrompt = `Research the company at this URL: ${url}.
Return a JSON object with: company_name, summary, industry, headquarters, founded, company_type, company_size, revenue_range, funding.`;
  const overview = await callLLM(overviewPrompt);

  // 2. Products & Market
  const productsPrompt = `Research the company at this URL: ${url}.
Return a JSON object with: main_products, target_market.`;
  const products = await callLLM(productsPrompt);

  // 3. Key Features & Platforms
  const featuresPrompt = `Research the company at this URL: ${url}.
Return a JSON object with: key_features, platform_compatibility.`;
  const features = await callLLM(featuresPrompt);

  // 4. Notable Clients
  const clientsPrompt = `Research the company at this URL: ${url}.
Return a JSON object with: notable_clients.`;
  const clients = await callLLM(clientsPrompt);

  // 5. Social Media & Research Summary
  const socialPrompt = `Research the company at this URL: ${url}.
Return a JSON object with: social_media (linkedin, twitter, facebook), research_summary.`;
  const social = await callLLM(socialPrompt);

  // Merge all results into a single object matching frontend schema
  return {
    company_name: overview.company_name || 'N/A',
    summary: overview.summary || 'N/A',
    industry: overview.industry || 'N/A',
    headquarters: overview.headquarters || 'N/A',
    founded: overview.founded || 'N/A',
    company_type: overview.company_type || 'N/A',
    company_size: overview.company_size || 'N/A',
    revenue_range: overview.revenue_range || 'N/A',
    funding: overview.funding || 'N/A',
    main_products: products.main_products || 'N/A',
    target_market: products.target_market || 'N/A',
    key_features: features.key_features || 'N/A',
    platform_compatibility: features.platform_compatibility || 'N/A',
    notable_clients: clients.notable_clients || 'N/A',
    social_media: social.social_media || { linkedin: 'N/A', twitter: 'N/A', facebook: 'N/A' },
    research_summary: social.research_summary || 'N/A',
  };
} 