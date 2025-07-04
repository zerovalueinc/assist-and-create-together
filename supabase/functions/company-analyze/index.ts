import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { runFullCompanyResearchPipeline } from '../../../agents/CompanyResearchAgent.ts';

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const requestBody = await req.text();
    let companyUrl;
    try {
      const parsed = JSON.parse(requestBody);
      companyUrl = parsed.url;
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), { status: 400, headers: corsHeaders });
    }
    if (!companyUrl) {
      return new Response(JSON.stringify({ error: 'Company URL is required' }), { status: 400, headers: corsHeaders });
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500, headers: corsHeaders });
    }
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required' }), { status: 401, headers: corsHeaders });
    }
    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Authentication failed' }), { status: 401, headers: corsHeaders });
    }
    // Call the LLM agent
    let llm_output;
    try {
      llm_output = await runFullCompanyResearchPipeline(companyUrl);
    } catch (e) {
      return new Response(JSON.stringify({ error: 'LLM research failed', details: e.message }), { status: 500, headers: corsHeaders });
    }
    // Save to DB
    const insertPayload = {
      user_id: user.id,
      website: companyUrl,
      llm_output,
      created_at: new Date().toISOString(),
    };
    console.log('[Intel] FINAL INSERT PAYLOAD:', JSON.stringify(insertPayload));
    const { data: saved, error: saveError } = await supabaseClient
      .from('company_analyzer_outputs')
      .insert([insertPayload])
      .select();
    if (saveError) {
      console.error('[Intel] Supabase insert error:', saveError);
      return new Response(JSON.stringify({ error: 'Failed to save research', details: saveError.message }), { status: 500, headers: corsHeaders });
    }
    return new Response(JSON.stringify({ success: true, output: saved }), { headers: corsHeaders });
  } catch (error) {
    console.error('[Intel] CRITICAL ERROR:', error);
    return new Response(JSON.stringify({ error: 'Intel research failed', details: error.message }), { status: 500, headers: corsHeaders });
  }
}); 