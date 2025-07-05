// @ts-ignore: Deno runtime provides Deno.env in edge functions
// PersonaOps Sequential Multi-Agent Company Research Pipeline

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as fs from 'fs';
import * as path from 'path';

declare const Deno: any;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Helper to get Supabase client (fallback for standalone usage)
function getSupabaseClient() {
  const supabaseUrl = typeof Deno !== 'undefined' ? Deno.env.get('SUPABASE_URL') : process.env.SUPABASE_URL;
  const supabaseKey = typeof Deno !== 'undefined' ? Deno.env.get('SUPABASE_ANON_KEY') : process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) throw new Error('Supabase credentials not configured');
  return createClient(supabaseUrl, supabaseKey);
}

// Helper to call the LLM with a prompt
async function callLLM(prompt: string, systemPrompt = 'You are an expert B2B research analyst with deep knowledge of SaaS companies, market intelligence, and sales strategies. Always return valid JSON with comprehensive, detailed information. Never return empty or placeholder values.') {
  const apiKey = typeof Deno !== 'undefined' ? Deno.env.get('OPENROUTER_API_KEY') : process.env.OPENROUTER_API_KEY;
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
      max_tokens: 4000,
      temperature: 0.2
    }),
  });
  
  if (!response.ok) throw new Error(`LLM error: ${response.status}`);
  const data = await response.json();
  const llmText = data.choices?.[0]?.message?.content || '';
  
  try {
    return JSON.parse(llmText);
  } catch (e) {
    console.error('LLM output parsing failed:', llmText);
    throw new Error('LLM output was not valid JSON: ' + llmText);
  }
}

// Agent 1: Company Overview & Key Facts
async function agentCompanyOverview(url: string) {
  const systemPrompt = `You are an expert B2B company analyst specializing in SaaS and technology companies. You have deep knowledge of company research, financial analysis, and market intelligence. Always provide comprehensive, accurate information based on available data. Never return placeholder or generic values.`;

  const prompt = `Analyze the company at ${url} and provide comprehensive company overview information. Research their website, social media, news articles, and public information to gather detailed insights.

Return a detailed JSON object with the following structure:

{
  "company_name": "Exact company name",
  "website": "Full website URL",
  "overview": "Detailed 2-3 sentence description of what the company does, their main value proposition, and target market",
  "company_size": "Employee count range (e.g., '50-200 employees', '500-1000 employees')",
  "founded": "Year founded (e.g., '2018', '2020')",
  "industry": "Primary industry or vertical (e.g., 'SaaS', 'E-commerce', 'Marketing Technology')",
  "headquarters": "City, State/Country (e.g., 'San Francisco, CA', 'New York, NY')",
  "revenue_range": "Estimated annual revenue range (e.g., '$10M-$50M', '$100M+')",
  "company_type": "Business type (e.g., 'Private', 'Public', 'Subsidiary')",
  "funding_status": "Funding stage if known (e.g., 'Series A', 'Series B', 'Bootstrapped', 'Acquired')",
  "summary": "Comprehensive 3-4 sentence summary including business model, key products, target customers, and competitive advantages"
}

IMPORTANT: 
- Research thoroughly and provide specific, accurate information
- If exact information is not available, provide reasonable estimates based on company size, industry, and market position
- Never return "Unknown" or placeholder values
- Include specific details about their products, target market, and business model
- Base your analysis on actual company information, not generic descriptions`;

  return await callLLM(prompt, systemPrompt);
}

// Agent 2: Products, Positioning, and Market Intelligence
async function agentMarketIntelligence(url: string, prev: any) {
  const systemPrompt = `You are a senior product and market intelligence analyst with expertise in SaaS product analysis, competitive intelligence, and market positioning. You understand product-market fit, competitive landscapes, and market trends deeply. Provide detailed, actionable insights.`;

  const prompt = `Based on the company at ${url} and previous analysis: ${JSON.stringify(prev)}, provide comprehensive market intelligence and product analysis.

Return a detailed JSON object with the following structure:

{
  "main_products": ["List of 3-5 main products or product lines with specific names"],
  "target_market": {
    "primary": "Primary target market segment (e.g., 'SMB', 'Enterprise', 'Mid-market')",
    "size_range": "Target company size range (e.g., '10-500 employees', '500+ employees')",
    "industry_focus": ["List of 3-5 primary industries they target"]
  },
  "direct_competitors": ["List of 5-8 direct competitors with specific company names"],
  "key_differentiators": ["List of 4-6 key competitive advantages or unique selling points"],
  "market_trends": ["List of 4-6 relevant market trends affecting this space"],
  "core_product_suite": "Detailed description of their main product offering",
  "key_modules": [
    {
      "module": "Specific module/feature name",
      "problem_solved": "What problem this solves",
      "target_user": "Who uses this feature"
    }
  ],
  "unique_selling_points": ["List of 3-5 unique features or capabilities"],
  "market_positioning": "How they position themselves in the market (e.g., 'Enterprise-grade', 'Easy-to-use', 'Most comprehensive')",
  "value_proposition_by_segment": {
    "SMB": "Value prop for small businesses",
    "Mid-market": "Value prop for mid-market",
    "Enterprise": "Value prop for enterprise"
  }
}

IMPORTANT:
- Research their actual products, features, and market positioning
- Identify real competitors in their space
- Understand their target market segments and value propositions
- Include specific product names and features
- Analyze their competitive advantages and market trends
- Base analysis on actual company information and market research`;

  return await callLLM(prompt, systemPrompt);
}

// Agent 3: ICP, Buying Process, and Buyer Personas
async function agentTechStack(url: string, prev: any) {
  const systemPrompt = `You are an expert in Ideal Customer Profile (ICP) development, buyer persona analysis, and sales process optimization. You understand customer segmentation, buying behaviors, and sales enablement strategies. Provide detailed, actionable insights for sales and marketing teams.`;

  const prompt = `Based on the company at ${url} and previous analysis: ${JSON.stringify(prev)}, develop comprehensive ICP and buyer persona information.

Return a detailed JSON object with the following structure:

{
  "icp": {
    "company_characteristics": ["List of 4-6 key company characteristics of ideal customers"],
    "technology_profile": ["List of 4-6 technology characteristics and preferences"]
  },
  "buyer_personas": [
    {
      "title": "Specific job title (e.g., 'VP of Marketing', 'CTO', 'Operations Manager')",
      "demographics": ["List of 3-4 demographic characteristics"],
      "pain_points": ["List of 4-6 specific pain points this persona faces"],
      "success_metrics": ["List of 3-4 key success metrics they care about"]
    }
  ],
  "firmographics": {
    "industry": ["List of target industries"],
    "size": "Target company size range",
    "revenue": "Target revenue range",
    "geography": ["List of target regions/countries"]
  },
  "pain_points": ["List of 6-8 common pain points their solution addresses"],
  "kpis_targeted": ["List of 5-7 key performance indicators their customers track"],
  "buying_process": {
    "trigger_events": ["List of 4-6 events that trigger buying decisions"],
    "influencer_mapping": ["List of key decision makers and influencers"],
    "buying_cycles": "Typical buying cycle length and stages",
    "content_sought": ["List of content types prospects look for"]
  },
  "red_flags": ["List of 4-6 characteristics that indicate poor fit"],
  "anti_personas": ["List of 3-4 personas that are NOT good fits"]
}

IMPORTANT:
- Develop realistic, detailed buyer personas based on their product and market
- Include specific job titles, pain points, and success metrics
- Understand their target customer characteristics and buying process
- Identify key decision makers and influencers in the buying process
- Include both positive (ICP) and negative (anti-personas) customer profiles
- Base analysis on their actual product offering and target market`;

  return await callLLM(prompt, systemPrompt);
}

// Agent 4: Sales GTM Strategy, Technology Stack, and Competitive Intelligence
async function agentSalesGTM(url: string, prev: any) {
  const systemPrompt = `You are a senior sales and go-to-market strategist with expertise in B2B sales processes, technology stack analysis, and competitive intelligence. You understand sales enablement, technology architecture, and competitive positioning. Provide detailed, actionable insights for sales and technical teams.`;

  const prompt = `Based on the company at ${url} and previous analysis: ${JSON.stringify(prev)}, provide comprehensive sales GTM strategy and technology stack analysis.

Return a detailed JSON object with the following structure:

{
  "sales_opportunities": [
    {
      "segment": "Specific customer segment (e.g., 'High-growth SaaS companies', 'Enterprise retailers')",
      "approach": "Recommended sales approach (e.g., 'Direct sales', 'Channel partners', 'Self-service')",
      "rationale": "Why this segment and approach makes sense"
    }
  ],
  "gtm_recommendations": {
    "vertical_specific_solutions": ["List of 3-4 vertical markets to target"],
    "partner_ecosystem": ["List of 4-6 partner types to engage"],
    "content_marketing": ["List of 4-6 content types to create"],
    "sales_enablement": ["List of 4-6 sales enablement tools/processes"]
  },
  "metrics": [
    {
      "label": "Specific metric name (e.g., 'Customer Acquisition Cost', 'Lifetime Value')",
      "value": "Typical value or range for this metric"
    }
  ],
  "backend_technologies": ["List of 4-6 backend technologies they likely use"],
  "frontend_technologies": ["List of 4-6 frontend technologies they likely use"],
  "infrastructure": ["List of 4-6 infrastructure and deployment technologies"],
  "key_platform_features": ["List of 5-7 key technical features of their platform"],
  "integration_capabilities": ["List of 4-6 integration capabilities and APIs"],
  "platform_compatibility": ["List of 4-6 platform compatibility features"],
  "key_features": {
    "backend": ["List of 3-4 key backend features"],
    "frontend": ["List of 3-4 key frontend features"]
  },
  "integrations": ["List of 6-8 key integrations they offer"],
  "api_openness": {
    "api_offerings": ["List of 3-4 API offerings"],
    "developer_resources": "Description of developer resources available",
    "documentation_quality": "Assessment of API documentation quality"
  },
  "enterprise_readiness": {
    "security": ["List of 4-6 security features and certifications"],
    "scalability": ["List of 3-4 scalability features"],
    "support": ["List of 3-4 support and service offerings"]
  },
  "client_logos": [
    {
      "logo_url": "URL or description of client logo",
      "category": "Client category or industry",
      "outcome": "Business outcome achieved"
    }
  ],
  "social_media": {
    "linkedin": "LinkedIn profile URL or handle",
    "twitter": "Twitter handle or profile",
    "facebook": "Facebook page or profile"
  }
}

IMPORTANT:
- Analyze their actual technology stack and architecture
- Develop realistic sales opportunities and GTM strategies
- Include specific metrics and KPIs relevant to their business
- Identify key integrations and technology partnerships
- Understand their enterprise readiness and security posture
- Base analysis on actual company capabilities and market position
- Include specific client examples and social media presence`;

  return await callLLM(prompt, systemPrompt);
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

// Recursively search for a field in an object/array
function findFieldDeep(obj: any, field: string): any {
  if (!obj || typeof obj !== 'object') return undefined;
  if (Object.prototype.hasOwnProperty.call(obj, field) && obj[field] !== undefined && obj[field] !== null) {
    return obj[field];
  }
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      if (typeof val === 'object' && val !== null) {
        const found = findFieldDeep(val, field);
        if (found !== undefined) return found;
      }
    }
  }
  return undefined;
}

// Sanitization: Map merged LLM output to canonical reportstructure.json schema (deep search)
function sanitizeToCanonicalReport(merged: any) {
  const schemaPath = path.resolve(__dirname, '../reportstructure.json');
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  const mapping = schema.canonical_report_mapping;
  const result: any = {};

  // Helper to get default value by type
  function getDefault(type: string) {
    if (type === 'string' || type === 'text') return '';
    if (type === 'array') return [];
    if (type === 'object') return {};
    return null;
  }

  // For each section, build the canonical structure
  for (const section of mapping.sections) {
    result[section.id] = {};
    for (const subsection of section.subsections) {
      for (const fieldGroup of Array.isArray(subsection.fields) ? subsection.fields : [subsection.fields]) {
        if (typeof fieldGroup === 'string') {
          // Single field
          const fieldDef = mapping.field_mappings[fieldGroup];
          const value = findFieldDeep(merged, fieldGroup);
          result[section.id][fieldGroup] = value !== undefined ? value : getDefault(fieldDef?.type);
        } else if (typeof fieldGroup === 'object' && fieldGroup.fields) {
          // Grouped fields (e.g., two_column_grid)
          for (const colField of fieldGroup.fields) {
            const fieldDef = mapping.field_mappings[colField];
            const value = findFieldDeep(merged, colField);
            result[section.id][colField] = value !== undefined ? value : getDefault(fieldDef?.type);
          }
        }
      }
    }
  }
  return result;
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

  // Merge all results into canonical structure matching reportstructure.json
  const merged = {
    company_overview: {
      company_name: getFirst(overview, ['company_name', 'name']),
      company_size: getFirst(overview, ['company_size', 'size']),
      founded: getFirst(overview, ['founded', 'foundedYear']),
      industry: getFirst(overview, ['industry', 'industry_segments']),
      headquarters: getFirst(overview, ['headquarters', 'location']),
      revenue_range: getFirst(overview, ['revenue_range', 'revenue']),
      company_type: getFirst(overview, ['company_type', 'type']),
      funding_status: getFirst(overview, ['funding_status', 'funding']),
      summary: getFirst(overview, ['summary', 'overview']),
      website: getFirst(overview, ['website', 'url']),
      notable_clients: Array.isArray(sales.client_logos) ? sales.client_logos.map(c => c.category || c.logo_url || c.name || c.company || '') : [],
      social_media: sales.social_media || overview.social_media || {}
    },
    market_intelligence: {
      main_products: getFirstArray(market, ['main_products', 'products']),
      target_market: getFirstObject(market, ['target_market', 'customer_segments']),
      direct_competitors: getFirstArray(market, ['direct_competitors', 'competitors']),
      key_differentiators: getFirstArray(market, ['key_differentiators', 'unique_selling_points']),
      market_trends: getFirstArray(market, ['market_trends', 'trends'])
    },
    icp_ibp_framework: {
      icp: getFirstObject(tech, ['icp', 'ideal_customer_profile']),
      buyer_personas: getFirstArray(tech, ['buyer_personas', 'buying_committee_personas'])
    },
    sales_gtm_strategy: {
      sales_opportunities: getFirstArray(sales, ['sales_opportunities', 'opportunities']),
      gtm_recommendations: getFirstObject(sales, ['gtm_recommendations', 'go_to_market_strategy']),
      metrics: getFirstArray(sales, ['metrics', 'kpis'])
    },
    technology_stack: {
      backend_technologies: getFirstArray(sales, ['backend_technologies', 'backend']),
      frontend_technologies: getFirstArray(sales, ['frontend_technologies', 'frontend']),
      infrastructure: getFirstArray(sales, ['infrastructure', 'tech_stack']),
      key_platform_features: getFirstArray(sales, ['key_platform_features', 'features']),
      integration_capabilities: getFirstArray(sales, ['integration_capabilities', 'integrations']),
      platform_compatibility: getFirstArray(sales, ['platform_compatibility', 'compatibility'])
    }
  };

  // Sanitize to canonical report structure
  const canonical = sanitizeToCanonicalReport(merged);
  console.log('[Pipeline] FINAL CANONICAL RESULT:', JSON.stringify(canonical));
  return { overview, market, tech, sales, merged: canonical };
} 