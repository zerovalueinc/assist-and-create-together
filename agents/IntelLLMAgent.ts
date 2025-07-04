declare const Deno: any;
// Real Intel LLM Agent for company research using OpenRouter Claude 3.5 Sonnet

export async function runIntelLLMResearch(url: string): Promise<any> {
  const openrouterApiKey = typeof Deno !== 'undefined' ? Deno.env.get('OPENROUTER_API_KEY') : undefined;
  if (!openrouterApiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  const prompt = `Research the company at this URL: ${url}.
Return a detailed, structured JSON object with the following fields (use N/A if not available):

{
  "company_name": string,
  "summary": string,
  "industry": string or array,
  "headquarters": string,
  "founded": string or year,
  "company_type": string,
  "company_size": string,
  "revenue_range": string,
  "funding": string,
  "main_products": string or array,
  "target_market": string or array,
  "key_features": string or array,
  "platform_compatibility": string or array,
  "notable_clients": string or array,
  "social_media": {
    "linkedin": string,
    "twitter": string,
    "facebook": string
  },
  "research_summary": string
}

Output ONLY valid JSON. Do not include any explanations or extra text. If a field is not available, use "N/A" or an empty array as appropriate.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openrouterApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        { role: 'system', content: 'You are an expert B2B research analyst. Always return valid JSON.' },
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