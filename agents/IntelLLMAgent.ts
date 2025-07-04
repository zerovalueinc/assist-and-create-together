declare const Deno: any;
// Real Intel LLM Agent for company research using OpenRouter Claude 3.5 Sonnet

export async function runIntelLLMResearch(url: string): Promise<any> {
  const openrouterApiKey = typeof Deno !== 'undefined' ? Deno.env.get('OPENROUTER_API_KEY') : undefined;
  if (!openrouterApiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  const prompt = `Research the company at this URL: ${url}. Return a detailed, structured JSON object with all relevant company information, including summary, industry, size, and any other useful fields. Output ONLY valid JSON.`;

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