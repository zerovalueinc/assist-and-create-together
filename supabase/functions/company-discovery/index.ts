import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompanyDiscoveryRequest {
  icpData: any;
  batchSize?: number;
}

serve(async (req) => {
  console.log('=== Company Discovery Agent Called ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create temporary client for auth
    const tempSupabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: userError } = await tempSupabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create main client with JWT for RLS
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const { icpData, batchSize = 10 }: CompanyDiscoveryRequest = await req.json();
    
    console.log('Processing company discovery with ICP:', icpData);
    
    // Extract search parameters from ICP data
    const searchParams = extractSearchParams(icpData);
    
    // Call Apollo API for company discovery
    const companies = await searchCompanies(searchParams, batchSize);
    
    console.log(`Found ${companies.length} companies`);
    
    return new Response(
      JSON.stringify({
        success: true,
        companies,
        searchParams,
        totalFound: companies.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Company Discovery Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Company discovery failed',
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function extractSearchParams(icpData: any) {
  const params: any = {};
  
  if (icpData.firmographics) {
    const { industry, companySize, region } = icpData.firmographics;
    
    if (industry) {
      params.industries = [industry];
    }
    
    if (companySize) {
      // Convert company size to employee ranges
      params.employeeRanges = convertCompanySizeToRange(companySize);
    }
    
    if (region) {
      params.locations = [region];
    }
  }
  
  if (icpData.apolloSearchParams) {
    // Use Apollo-specific search parameters if available
    Object.assign(params, icpData.apolloSearchParams);
  }
  
  return params;
}

function convertCompanySizeToRange(companySize: string): string[] {
  const size = companySize.toLowerCase();
  
  if (size.includes('startup') || size.includes('small')) {
    return ['1-10', '11-50'];
  } else if (size.includes('medium') || size.includes('mid')) {
    return ['51-200', '201-500'];
  } else if (size.includes('large') || size.includes('enterprise')) {
    return ['501-1000', '1001-5000', '5001+'];
  }
  
  return ['1-50', '51-200', '201-1000']; // Default range
}

async function searchCompanies(searchParams: any, limit: number) {
  const apolloApiKey = Deno.env.get('APOLLO_API_KEY');
  
  if (!apolloApiKey) {
    console.warn('Apollo API key not configured, returning mock data');
    return generateMockCompanies(limit);
  }
  
  try {
    const response = await fetch('https://api.apollo.io/v1/mixed_companies/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apolloApiKey,
      },
      body: JSON.stringify({
        q_organization_industries: searchParams.industries || [],
        q_organization_num_employees: searchParams.employeeRanges || [],
        q_organization_locations: searchParams.locations || [],
        page: 1,
        per_page: limit
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Apollo API error:', errorText);
      throw new Error('Apollo API request failed');
    }

    const data = await response.json();
    return (data.organizations || []).map(formatCompanyData);
    
  } catch (error) {
    console.error('Error calling Apollo API:', error);
    return generateMockCompanies(limit);
  }
}

function formatCompanyData(org: any) {
  return {
    name: org.name,
    domain: org.website_url,
    industry: org.industry,
    employees: org.estimated_num_employees,
    location: org.city && org.state ? `${org.city}, ${org.state}` : org.country,
    description: org.short_description,
    linkedinUrl: org.linkedin_url,
    founded: org.founded_year,
    revenue: org.estimated_annual_revenue
  };
}

function generateMockCompanies(count: number) {
  const mockCompanies = [];
  const industries = ['SaaS', 'Fintech', 'Healthcare', 'E-commerce', 'EdTech'];
  const cities = ['San Francisco', 'New York', 'Austin', 'Seattle', 'Boston'];
  
  for (let i = 0; i < count; i++) {
    mockCompanies.push({
      name: `Company ${i + 1}`,
      domain: `company${i + 1}.com`,
      industry: industries[i % industries.length],
      employees: Math.floor(Math.random() * 500) + 50,
      location: cities[i % cities.length],
      description: `A leading ${industries[i % industries.length]} company`,
      linkedinUrl: `https://linkedin.com/company/company${i + 1}`,
      founded: 2015 + (i % 8),
      revenue: `$${Math.floor(Math.random() * 10) + 1}M`
    });
  }
  
  return mockCompanies;
}
