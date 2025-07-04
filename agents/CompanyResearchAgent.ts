// @ts-ignore: Deno runtime provides Deno.env in edge functions
// PersonaOps Sequential Multi-Agent Company Research Pipeline

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

declare const Deno: any;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Helper to get Supabase client (fallback for standalone usage)
function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !supabaseAnonKey) throw new Error('Supabase env vars not set');
  return createClient(supabaseUrl, supabaseAnonKey);
}

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

// Orchestrator: Run all agents in sequence, merging outputs, and save each step
export async function runFullCompanyResearchPipeline(url: string, user_id: string, supabaseClient?: any): Promise<any> {
  const supabase = supabaseClient || getSupabaseClient();
  
  console.log('[Pipeline] Starting pipeline with user_id:', user_id, 'url:', url);
  console.log('[Pipeline] Supabase client type:', typeof supabase);
  
  // Step 1: Company Overview
  console.log('[Pipeline] Agent 1: Company Overview starting...');
  const overview = await agentCompanyOverview(url);
  console.log('[Pipeline] Agent 1 completed, attempting to save...');
  
  const step1Payload = {
    user_id,
    company_url: url,
    step_name: 'company_overview',
    step_output: overview
  };
  console.log('[Pipeline] Step 1 payload:', JSON.stringify(step1Payload));
  
  const { data: step1Data, error: step1Error } = await supabase.from('company_research_steps').insert(step1Payload);
  if (step1Error) {
    console.error('[Pipeline] Step 1 save error:', step1Error);
    console.error('[Pipeline] Step 1 error details:', JSON.stringify(step1Error));
  } else {
    console.log('[Pipeline] Step 1 saved successfully:', step1Data);
  }
  console.log('[Pipeline] Agent 1 result:', JSON.stringify(overview));

  // Step 2: Market/Competitive Intelligence
  console.log('[Pipeline] Agent 2: Market/Competitive Intelligence starting...');
  const market = await agentMarketIntelligence(url, overview);
  console.log('[Pipeline] Agent 2 completed, attempting to save...');
  
  const step2Payload = {
    user_id,
    company_url: url,
    step_name: 'market_intelligence',
    step_output: market
  };
  console.log('[Pipeline] Step 2 payload:', JSON.stringify(step2Payload));
  
  const { data: step2Data, error: step2Error } = await supabase.from('company_research_steps').insert(step2Payload);
  if (step2Error) {
    console.error('[Pipeline] Step 2 save error:', step2Error);
    console.error('[Pipeline] Step 2 error details:', JSON.stringify(step2Error));
  } else {
    console.log('[Pipeline] Step 2 saved successfully:', step2Data);
  }
  console.log('[Pipeline] Agent 2 result:', JSON.stringify(market));

  // Step 3: Technology/Features/Stack
  console.log('[Pipeline] Agent 3: Technology/Features/Stack starting...');
  const tech = await agentTechStack(url, { ...overview, ...market });
  console.log('[Pipeline] Agent 3 completed, attempting to save...');
  
  const step3Payload = {
    user_id,
    company_url: url,
    step_name: 'tech_stack',
    step_output: tech
  };
  console.log('[Pipeline] Step 3 payload:', JSON.stringify(step3Payload));
  
  const { data: step3Data, error: step3Error } = await supabase.from('company_research_steps').insert(step3Payload);
  if (step3Error) {
    console.error('[Pipeline] Step 3 save error:', step3Error);
    console.error('[Pipeline] Step 3 error details:', JSON.stringify(step3Error));
  } else {
    console.log('[Pipeline] Step 3 saved successfully:', step3Data);
  }
  console.log('[Pipeline] Agent 3 result:', JSON.stringify(tech));

  // Step 4: Sales/Go-to-Market/Final Synthesis
  console.log('[Pipeline] Agent 4: Sales/Go-to-Market/Final Synthesis starting...');
  const sales = await agentSalesGTM(url, { ...overview, ...market, ...tech });
  console.log('[Pipeline] Agent 4 completed, attempting to save...');
  
  const step4Payload = {
    user_id,
    company_url: url,
    step_name: 'sales_gtm',
    step_output: sales
  };
  console.log('[Pipeline] Step 4 payload:', JSON.stringify(step4Payload));
  
  const { data: step4Data, error: step4Error } = await supabase.from('company_research_steps').insert(step4Payload);
  if (step4Error) {
    console.error('[Pipeline] Step 4 save error:', step4Error);
    console.error('[Pipeline] Step 4 error details:', JSON.stringify(step4Error));
  } else {
    console.log('[Pipeline] Step 4 saved successfully:', step4Data);
  }
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
  return { overview, market, tech, sales, merged };
} 