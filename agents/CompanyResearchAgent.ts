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

// Agent 1: Company Overview & Key Facts
async function agentCompanyOverview(url: string) {
  const prompt = `You are an expert B2B company analyst. For the company at ${url}, return a JSON object with:
- company_name
- website
- overview
- company_size
- employees_global
- employees_key_regions
- revenue
- industry_segments
- funding_status
- key_contacts (array of {name, title, linkedin})
`;
  return await callLLM(prompt);
}

// Agent 2: Products, Positioning, and Market
async function agentMarketIntelligence(url: string, prev: any) {
  const prompt = `You are a product/market analyst. For the company at ${url}, return a JSON object with:
- core_product_suite
- key_modules (array: {module, problem_solved, target_user})
- unique_selling_points
- market_positioning
- value_proposition_by_segment (SMB, MM, Enterprise)
- key_differentiators (tech, service, integrations, pricing)
- main_products
- target_market
- competitors (by segment)
- market_trends
`;
  return await callLLM(prompt);
}

// Agent 3: ICP, Buying Process, Personas
async function agentTechStack(url: string, prev: any) {
  const prompt = `You are an ICP and sales process expert. For the company at ${url}, return a JSON object with:
- icp_demographics (industry, size, revenue, region, tech_stack)
- firmographics
- pain_points
- kpis_targeted
- buying_committee_personas (array: {role, responsibilities})
- buying_process (trigger_events, influencer_mapping, buying_cycles, content_sought)
- red_flags
- anti_personas
`;
  return await callLLM(prompt);
}

// Agent 4: Features, Ecosystem, Clients, Competitors, GTM, Matrix, Action Steps
async function agentSalesGTM(url: string, prev: any) {
  const prompt = `You are a GTM and competitive intelligence expert. For the company at ${url}, return a JSON object with:
- key_features
- integrations (ERPs, CRMs, payment gateways, tech partners)
- api_openness
- enterprise_readiness (security, scalability, support)
- client_logos (array: {logo_url, category, outcome})
- competitors (by segment, feature_comparison, threats, partners)
- gtm_messaging (objection_handlers, talking_points_by_role, content_preferences)
- icp_fit_matrix (table: attribute, ideal, acceptable, exclude)
- action_steps (lead_scoring, review_plan, loss_win_analysis)
- social_media (linkedin, twitter, facebook)
- research_summary
`;
  return await callLLM(prompt);
}

// Orchestrator: Run all agents in sequence, merging outputs, and save each step
export async function runFullCompanyResearchPipeline(url: string, user_id: string, supabaseClient?: any): Promise<any> {
  const supabase = supabaseClient || getSupabaseClient();
  
  console.log('[Pipeline] Starting pipeline with user_id:', user_id, 'url:', url);
  console.log('[Pipeline] Supabase client type:', typeof supabase);
  
  // Test table existence first
  console.log('[Pipeline] Testing table existence...');
  try {
    const { data: tableTest, error: tableError } = await supabase
      .from('company_research_steps')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.error('[Pipeline] ❌ TABLE DOES NOT EXIST OR NOT ACCESSIBLE:', tableError);
      console.error('[Pipeline] Table error details:', JSON.stringify(tableError, null, 2));
      throw new Error(`Table access failed: ${tableError.message}`);
    } else {
      console.log('[Pipeline] ✅ Table exists and is accessible');
    }
  } catch (tableErr) {
    console.error('[Pipeline] ❌ Table test failed:', tableErr);
    throw tableErr;
  }
  
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
  
  try {
    const { data: step1Data, error: step1Error } = await supabase.from('company_research_steps').insert(step1Payload);
    if (step1Error) {
      console.error('[Pipeline] ❌ Step 1 save error:', step1Error);
      console.error('[Pipeline] Step 1 error details:', JSON.stringify(step1Error, null, 2));
      console.error('[Pipeline] Step 1 error code:', step1Error.code);
      console.error('[Pipeline] Step 1 error hint:', step1Error.hint);
    } else {
      console.log('[Pipeline] ✅ Step 1 saved successfully:', step1Data);
    }
  } catch (step1Err) {
    console.error('[Pipeline] ❌ Step 1 save exception:', step1Err);
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
  
  try {
    const { data: step2Data, error: step2Error } = await supabase.from('company_research_steps').insert(step2Payload);
    if (step2Error) {
      console.error('[Pipeline] ❌ Step 2 save error:', step2Error);
      console.error('[Pipeline] Step 2 error details:', JSON.stringify(step2Error, null, 2));
    } else {
      console.log('[Pipeline] ✅ Step 2 saved successfully:', step2Data);
    }
  } catch (step2Err) {
    console.error('[Pipeline] ❌ Step 2 save exception:', step2Err);
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
  
  try {
    const { data: step3Data, error: step3Error } = await supabase.from('company_research_steps').insert(step3Payload);
    if (step3Error) {
      console.error('[Pipeline] ❌ Step 3 save error:', step3Error);
      console.error('[Pipeline] Step 3 error details:', JSON.stringify(step3Error, null, 2));
    } else {
      console.log('[Pipeline] ✅ Step 3 saved successfully:', step3Data);
    }
  } catch (step3Err) {
    console.error('[Pipeline] ❌ Step 3 save exception:', step3Err);
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
  
  try {
    const { data: step4Data, error: step4Error } = await supabase.from('company_research_steps').insert(step4Payload);
    if (step4Error) {
      console.error('[Pipeline] ❌ Step 4 save error:', step4Error);
      console.error('[Pipeline] Step 4 error details:', JSON.stringify(step4Error, null, 2));
    } else {
      console.log('[Pipeline] ✅ Step 4 saved successfully:', step4Data);
    }
  } catch (step4Err) {
    console.error('[Pipeline] ❌ Step 4 save exception:', step4Err);
  }
  console.log('[Pipeline] Agent 4 result:', JSON.stringify(sales));

  // Merge all results into a single flat object matching reportstructure.json
  const merged = {
    company_name: overview.company_name || '',
    company_size: overview.company_size || '',
    founded: '', // Not available
    industry: Array.isArray(overview.industry_segments) ? overview.industry_segments[0] : (overview.industry_segments || ''),
    headquarters: '', // Not available
    revenue_range: overview.revenue || '',
    company_type: overview.funding_status || '',
    summary: overview.overview || '',
    notable_clients: Array.isArray(sales.client_logos) ? sales.client_logos.map(c => c.category || c.logo_url || '') : [],
    social_media: sales.social_media || { linkedin: '', twitter: '', facebook: '' },
    main_products: market.main_products || [],
    target_market: market.target_market || {},
    direct_competitors: (typeof market.competitors === 'object') ? Object.values(market.competitors).flat() : (market.competitors || []),
    key_differentiators: (typeof market.key_differentiators === 'object') ? Object.values(market.key_differentiators).flat() : (market.key_differentiators || []),
    market_trends: market.market_trends || [],
    icp: tech.icp_demographics || {},
    buyer_personas: Array.isArray(tech.buying_committee_personas) ? tech.buying_committee_personas.map(p => ({
      title: p.role,
      demographics: '',
      pain_points: '',
      success_metrics: ''
    })) : [],
    sales_opportunities: [], // Not mapped in current agent output
    gtm_recommendations: {}, // Not mapped in current agent output
    metrics: [], // Not mapped in current agent output
    backend_technologies: [], // Not mapped in current agent output
    frontend_technologies: [], // Not mapped in current agent output
    infrastructure: [], // Not mapped in current agent output
    key_platform_features: Array.isArray(sales.key_features) ? sales.key_features : [],
    integration_capabilities: Array.isArray(sales.integrations) ? sales.integrations : [],
    platform_compatibility: [], // Not mapped in current agent output
  };
  console.log('[Pipeline] FINAL FLAT MERGED RESULT:', JSON.stringify(merged));
  return { overview, market, tech, sales, merged };
} 