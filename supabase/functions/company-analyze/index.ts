import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { LLMCompanyAnalyzer } from '../../../agents/LLMCompanyAnalyzer.ts';
import { generateICPWithBestModel } from '../../../agents/analysisAgent.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompanyAnalysisRequest {
  url: string;
}

interface CompanyAnalysisResult {
  companyName: string;
  companyProfile: {
    industry: string;
    companySize: string;
    revenueRange: string;
  };
  decisionMakers: string[];
  painPoints: string[];
  technologies: string[];
  location: string;
  marketTrends: string[];
  competitiveLandscape: string[];
  goToMarketStrategy: string;
  researchSummary: string;
  website: string;
}

serve(async (req) => {
  console.log('=== Company Analyze Function Called ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestBody = await req.text();
    console.log('Raw request body:', requestBody);

    let companyUrl: string;
    try {
      const parsed = JSON.parse(requestBody) as CompanyAnalysisRequest;
      companyUrl = parsed.url;
      console.log('Parsed company URL:', companyUrl);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body', details: parseError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    if (!companyUrl) {
      console.error('No company URL provided');
      return new Response(
        JSON.stringify({ error: 'Company URL is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    console.log('Supabase URL available:', !!supabaseUrl);
    console.log('Supabase Anon Key available:', !!supabaseAnonKey);
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase configuration');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Extracted token length:', token.length);

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      console.error('User auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed', details: userError.message }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    if (!user) {
      console.error('No user found');
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('User authenticated successfully:', user.id);

    // Normalize company URL
    const normalizedUrl = normalizeUrl(companyUrl);

    // 30-day cache check: look for existing report for this user+url in last 30 days
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - THIRTY_DAYS_MS).toISOString();
    const { data: recentReport, error: recentError } = await supabaseClient
      .from('company_analyzer_outputs')
      .select('*')
      .eq('user_id', user.id)
      .eq('website', normalizedUrl)
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (recentReport && !recentError) {
      console.log('Returning cached company analysis (less than 30 days old)');
      return new Response(
        JSON.stringify({
          success: true,
          output: recentReport,
          analysis: recentReport, // for compatibility
          outputId: recentReport.id || null,
          cached: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Use normalizedUrl for analysis and saving
    const analyzer = new LLMCompanyAnalyzer();
    let finalAnalysis = await analyzer.analyzeCompany(normalizedUrl);
    console.log('Analysis generated for:', finalAnalysis.companyName);

    // ABSOLUTE MINIMAL: Only save the raw LLM output to llm_output
    const insertPayload = {
      user_id: user.id,
      website: normalizedUrl,
      llm_output: finalAnalysis, // EXACT raw LLM agent output
      created_at: new Date().toISOString(),
      companyName: finalAnalysis.companyName || '', // Only if required by schema
    };
    console.log('[Edge Function] RAW INSERT PAYLOAD:', JSON.stringify(insertPayload));
    const { data: savedReport, error: saveError } = await supabaseClient
      .from('company_analyzer_outputs')
      .insert(insertPayload)
      .select()
      .single();
    console.log('[Edge Function] Supabase insert response:', { savedReport, saveError });

    if (saveError) {
      console.error('Insert error details:', {
        code: saveError.code,
        message: saveError.message,
        details: saveError.details,
        hint: saveError.hint,
        fullError: saveError
      });
      return new Response(
        JSON.stringify({ 
          error: 'Failed to save analysis', 
          details: saveError.message,
          code: saveError.code,
          hint: saveError.hint
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        output: {
          ...savedReport,
          ibp: savedReport.ibp || {},
          icp: savedReport.icp || {},
          go_to_market_insights: savedReport.go_to_market_insights || '',
          market_trends: savedReport.market_trends || [],
          competitive_landscape: savedReport.competitive_landscape || [],
          decision_makers: savedReport.decision_makers || [],
          research_summary: savedReport.research_summary || '',
        },
        analysis: savedReport,
        outputId: savedReport.id || null,
        cached: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('=== CRITICAL ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error.constructor.name);
    
    return new Response(
      JSON.stringify({
        error: 'Company analysis failed',
        details: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function extractDomain(url: string): string {
  try {
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    const urlObj = new URL(cleanUrl);
    const hostname = urlObj.hostname.replace('www.', '');
    const parts = hostname.split('.');
    // Return the main domain name (e.g., "google" from "google.com")
    return parts.length > 1 ? parts[0] : hostname;
  } catch {
    // Fallback for invalid URLs
    const cleaned = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    return cleaned.split('.')[0] || url;
  }
}

function normalizeUrl(input: string): string {
  let url = input.trim().toLowerCase();
  url = url.replace(/^https?:\/\//, ''); // Remove protocol
  url = url.replace(/^www\./, ''); // Remove www.
  url = url.replace(/\/$/, ''); // Remove trailing slash
  return `https://${url}`;
}
