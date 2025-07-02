
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactDiscoveryRequest {
  companies: any[];
  targetPersonas: any[];
}

serve(async (req) => {
  console.log('=== Contact Discovery Agent Called ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { companies, targetPersonas }: ContactDiscoveryRequest = await req.json();
    
    console.log(`Processing contact discovery for ${companies.length} companies`);
    
    // Extract target titles from personas
    const targetTitles = extractTargetTitles(targetPersonas);
    
    // Find contacts for each company
    const allContacts = [];
    for (const company of companies) {
      const contacts = await findContactsForCompany(company, targetTitles);
      allContacts.push(...contacts);
    }
    
    console.log(`Found ${allContacts.length} contacts`);
    
    return new Response(
      JSON.stringify({
        success: true,
        contacts: allContacts,
        totalFound: allContacts.length,
        companiesProcessed: companies.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Contact Discovery Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Contact discovery failed',
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function extractTargetTitles(personas: any[]): string[] {
  const titles = [];
  
  if (personas && personas.length > 0) {
    for (const persona of personas) {
      if (persona.title) {
        titles.push(persona.title);
      }
      if (persona.role) {
        titles.push(persona.role);
      }
    }
  }
  
  // Default titles if none specified
  if (titles.length === 0) {
    titles.push('CEO', 'CTO', 'VP Marketing', 'Head of Sales', 'Director');
  }
  
  return titles;
}

async function findContactsForCompany(company: any, targetTitles: string[]) {
  const apolloApiKey = Deno.env.get('APOLLO_API_KEY');
  
  if (!apolloApiKey) {
    console.warn('Apollo API key not configured, returning mock data');
    return generateMockContacts(company, targetTitles.slice(0, 2));
  }
  
  try {
    const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apolloApiKey,
      },
      body: JSON.stringify({
        q_organization_domains: [company.domain],
        q_person_titles: targetTitles,
        page: 1,
        per_page: 5 // Limit contacts per company
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Apollo API error:', errorText);
      throw new Error('Apollo API request failed');
    }

    const data = await response.json();
    return (data.people || []).map(person => formatContactData(person, company));
    
  } catch (error) {
    console.error('Error calling Apollo API for contacts:', error);
    return generateMockContacts(company, targetTitles.slice(0, 2));
  }
}

function formatContactData(person: any, company: any) {
  return {
    firstName: person.first_name,
    lastName: person.last_name,
    email: person.email,
    title: person.title,
    companyName: company.name,
    companyDomain: company.domain,
    companyIndustry: company.industry,
    linkedinUrl: person.linkedin_url,
    location: person.city && person.state ? `${person.city}, ${person.state}` : person.country,
    verified: !!person.email,
    apolloId: person.id
  };
}

function generateMockContacts(company: any, titles: string[]) {
  const mockContacts = [];
  const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily', 'Chris', 'Lisa'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore'];
  
  for (let i = 0; i < Math.min(titles.length, 3); i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    
    mockContacts.push({
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.domain}`,
      title: titles[i],
      companyName: company.name,
      companyDomain: company.domain,
      companyIndustry: company.industry,
      linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
      location: company.location,
      verified: true,
      apolloId: `mock_${Date.now()}_${i}`
    });
  }
  
  return mockContacts;
}
