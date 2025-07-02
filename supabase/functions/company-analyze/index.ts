import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { LLMCompanyAnalyzer } from '../../../agents/LLMCompanyAnalyzer.ts';

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

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

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

    // Use the modular LLMCompanyAnalyzer agent for dynamic analysis
    const analyzer = new LLMCompanyAnalyzer();
    const finalAnalysis = await analyzer.analyzeCompany(companyUrl);
    console.log('Analysis generated for:', finalAnalysis.companyName);

    // Try to save to database
    try {
      const { data: savedReport, error: saveError } = await supabaseClient
        .from('saved_reports')
        .insert({
          user_id: parseInt(user.id),
          company_name: finalAnalysis.companyName,
          url: companyUrl,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (saveError) {
        console.error('Error saving report:', saveError);
      } else {
        console.log('Report saved successfully with ID:', savedReport?.id);
      }

      return new Response(
        JSON.stringify({
          success: true,
          analysis: finalAnalysis,
          reportId: savedReport?.id || null
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      // Still return the analysis even if saving fails
      return new Response(
        JSON.stringify({
          success: true,
          analysis: finalAnalysis,
          reportId: null,
          warning: 'Analysis completed but not saved to database'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('=== CRITICAL ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Company analysis failed',
        details: error.message,
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
