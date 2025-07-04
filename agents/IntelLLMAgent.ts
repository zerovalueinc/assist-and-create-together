declare const Deno: any;
// Real Intel LLM Agent for company research using OpenRouter Claude 3.5 Sonnet

export async function runIntelLLMResearch(url: string): Promise<any> {
  const openrouterApiKey = typeof Deno !== 'undefined' ? Deno.env.get('OPENROUTER_API_KEY') : undefined;
  if (!openrouterApiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  const prompt = `Research the company at this URL: ${url}. 

Return a detailed, structured JSON object with the following fields optimized for Company Overview cards:

{
  "company_name": "Full company name",
  "website": "${url}",
  "summary": "2-3 sentence company overview",
  "industry": ["Primary industry", "Secondary industry"],
  "company_size": {
    "employees_range": "e.g., 50-200",
    "employee_count": 150
  },
  "headquarters": "City, State/Country",
  "founded": 2015,
  "company_type": "Public/Private/Startup",
  "revenue_range": "$10M-$50M",
  "main_products": ["Product 1", "Product 2", "Product 3"],
  "target_market": ["Market segment 1", "Market segment 2"],
  "key_features": ["Feature 1", "Feature 2", "Feature 3"],
  "platform_compatibility": ["Platform 1", "Platform 2"],
  "notable_clients": ["Client 1", "Client 2", "Client 3"],
  "funding": {
    "total_raised": "$50M+",
    "latest_round": {
      "amount": "$25M",
      "year": 2023,
      "round_type": "Series B"
    }
  },
  "social_media": {
    "linkedin": "company-linkedin",
    "twitter": "@companyhandle",
    "facebook": "companypage"
  },
  "research_summary": "Comprehensive research summary paragraph"
}

Output ONLY valid JSON.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openrouterApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        { role: 'system', content: 'You are an expert B2B research analyst. Always return valid JSON optimized for company overview displays.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.3
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const llmText = data.choices?.[0]?.message?.content || '';
  let parsed;
  try {
    parsed = JSON.parse(llmText);
  } catch (e) {
    throw new Error('LLM output was not valid JSON: ' + llmText);
  }
  return parsed;
} 