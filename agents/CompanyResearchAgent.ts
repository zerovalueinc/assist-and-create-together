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

// Helper to get the first non-empty value from a list of possible keys
function getFirst(obj, keys, fallback = '') {
  for (const key of keys) {
    if (obj && obj[key] && obj[key] !== '' && obj[key] !== 'Unknown') return obj[key];
  }
  return fallback;
}

// Helper for arrays
function getFirstArray(obj, keys) {
  for (const key of keys) {
    if (obj && Array.isArray(obj[key]) && obj[key].length > 0) return obj[key];
  }
  return [];
}

// Helper for objects
function getFirstObject(obj, keys) {
  for (const key of keys) {
    if (obj && typeof obj[key] === 'object' && !Array.isArray(obj[key]) && Object.keys(obj[key] || {}).length > 0) return obj[key];
  }
  return {};
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

  // Log all agent outputs for debugging
  console.log('[DEBUG] Agent Output - overview:', JSON.stringify(overview));
  console.log('[DEBUG] Agent Output - market:', JSON.stringify(market));
  console.log('[DEBUG] Agent Output - tech:', JSON.stringify(tech));
  console.log('[DEBUG] Agent Output - sales:', JSON.stringify(sales));

  // Merge all results into a single object matching the new modular frontend structure, with robust normalization
  const merged = {
    executiveSummary: {
      companyName: getFirst(overview, ['company_name', 'companyName', 'name', 'company_overview.company_name']),
      industry: getFirst(overview, ['industry', 'industry_segments', 'industryClassification', 'company_overview.industry_segments']),
      summary: getFirst(overview, ['overview', 'summary', 'description', 'company_overview.overview']),
    },
    companyOverview: {
      size: getFirst(overview, ['company_size', 'size', 'employeeCount', 'employeeRange', 'employees_global', 'company_overview.company_size']),
      founded: getFirst(overview, ['founded', 'foundedYear', 'founding_year', 'foundingYear']),
      industry: getFirst(overview, ['industry', 'industry_segments', 'industryClassification', 'company_overview.industry_segments']),
      headquarters: getFirst(overview, ['headquarters', 'location', 'address', 'hq', 'company_overview.headquarters']),
      revenue: getFirst(overview, ['revenue', 'revenue_range', 'estimatedAnnualRevenue', 'company_overview.revenue']),
      type: getFirst(overview, ['company_type', 'type', 'businessModel', 'company_overview.company_type']),
      funding: getFirst(overview, ['funding_status', 'funding', 'fundingStage', 'company_overview.funding_status']),
      website: getFirst(overview, ['website', 'websiteUrl', 'company_url', 'url', 'company_overview.website']),
      notableClients: Array.isArray(sales.client_logos)
        ? sales.client_logos.map(c => c.category || c.logo_url || c.name || c.company || '')
        : (overview.notable_clients || []),
      socialMedia: sales.social_media || overview.social_media || { linkedin: '', twitter: '', facebook: '' },
    },
    marketIntelligence: {
      mainProducts: getFirstArray(market, ['main_products', 'core_product_suite', 'productOfferings', 'products', 'products_positioning.main_products']),
      targetMarket: getFirstObject(market, ['target_market', 'customerSegments', 'targetMarketSegments', 'market_positioning', 'value_proposition_by_segment', 'products_positioning.target_market']),
      directCompetitors: (typeof market.competitors === 'object')
        ? Object.values(market.competitors).flat()
        : getFirstArray(market, ['direct_competitors', 'competitors', 'competitiveLandscape', 'directCompetitors', 'products_positioning.competitors']),
      keyDifferentiators: getFirstArray(market, ['key_differentiators', 'differentiators', 'unique_selling_points', 'keyDifferentiators', 'products_positioning.key_differentiators']),
      marketTrends: getFirstArray(market, ['market_trends', 'marketTrends', 'trends', 'products_positioning.market_trends']),
    },
    icpIbps: {
      icp: getFirstObject(tech, ['icp_demographics', 'icp', 'idealCustomerProfile', 'firmographics', 'icp_and_buying.icp_demographics']),
      buyerPersonas: Array.isArray(tech.buying_committee_personas)
        ? tech.buying_committee_personas.map(p => ({
            title: getFirst(p, ['title', 'role']),
            demographics: getFirstArray(p, ['demographics', 'demographic', 'attributes']),
            pain_points: getFirstArray(p, ['pain_points', 'painPoints', 'painpoints']),
            success_metrics: getFirstArray(p, ['success_metrics', 'successMetrics', 'kpis', 'KPIs']),
          }))
        : getFirstArray(tech, ['personas', 'buyer_personas', 'keyPersonas', 'icp_and_buying.buying_committee_personas']),
    },
    salesGtmStrategy: {
      salesOpportunities: Array.isArray(sales.action_steps?.lead_scoring)
        ? sales.action_steps.lead_scoring
        : getFirstArray(sales, ['sales_opportunities', 'opportunities', 'leadScoring', 'opportunityData', 'features_ecosystem_gtm.action_steps.lead_scoring']),
      gtmRecommendations: getFirstObject(sales, ['gtm_messaging', 'gtmRecommendations', 'goToMarketStrategy', 'go_to_market_strategy', 'features_ecosystem_gtm.gtm_messaging']),
      metrics: Array.isArray(tech.kpis_targeted)
        ? tech.kpis_targeted.map(kpi => ({ label: kpi, value: '' }))
        : getFirstArray(tech, ['metrics', 'metricsToTrack', 'kpis', 'KPIs', 'icp_and_buying.kpis_targeted']),
    },
    technologyStack: {
      backendTechnologies: getFirstArray(sales, ['backend_technologies', 'backend', 'backendTech', 'techStackComponents', 'features_ecosystem_gtm.backend_technologies']),
      frontendTechnologies: getFirstArray(sales, ['frontend_technologies', 'frontend', 'frontendTech', 'features_ecosystem_gtm.frontend_technologies']),
      infrastructure: getFirstArray(sales, ['infrastructure', 'tech_stack', 'infrastructureTech', 'features_ecosystem_gtm.infrastructure']),
      keyPlatformFeatures: getFirstArray(sales, ['key_platform_features', 'features', 'uniqueSellingPropositions', 'features_ecosystem_gtm.key_features']),
      integrationCapabilities: Array.isArray(sales.integrations)
        ? sales.integrations
        : (typeof sales.integrations === 'object' ? Object.values(sales.integrations).flat() : getFirstArray(sales, ['integration_capabilities', 'integrations', 'features_ecosystem_gtm.integrations'])),
      platformCompatibility: getFirstArray(sales, ['platform_compatibility', 'enterprise_readiness', 'compatibility', 'features_ecosystem_gtm.enterprise_readiness']),
    }
  };
  console.log('[Pipeline] FINAL MODULAR MERGED RESULT:', JSON.stringify(merged));
  return { overview, market, tech, sales, merged };
} 