
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailPersonalizationRequest {
  contacts: any[];
  icpData: any;
  messagingAngles?: string[];
}

serve(async (req) => {
  console.log('=== Email Personalization Agent Called ===');
  
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

    const { contacts, icpData, messagingAngles }: EmailPersonalizationRequest = await req.json();
    
    console.log(`Processing email personalization for ${contacts.length} contacts`);
    
    // Generate personalized emails for each contact
    const personalizedEmails = [];
    for (const contact of contacts) {
      const email = await generatePersonalizedEmail(contact, icpData, messagingAngles);
      personalizedEmails.push(email);
    }
    
    console.log(`Generated ${personalizedEmails.length} personalized emails`);
    
    return new Response(
      JSON.stringify({
        success: true,
        emails: personalizedEmails,
        totalGenerated: personalizedEmails.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Email Personalization Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Email personalization failed',
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function generatePersonalizedEmail(contact: any, icpData: any, messagingAngles: string[] = []) {
  const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
  
  if (!openrouterApiKey) {
    console.warn('OpenRouter API key not configured, returning template email');
    return generateTemplateEmail(contact, icpData);
  }
  
  try {
    const prompt = buildPersonalizationPrompt(contact, icpData, messagingAngles);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: 'You are an expert B2B email copywriter specializing in personalized outreach. Generate concise, professional, and engaging cold emails.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error('OpenRouter API request failed');
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    return parseEmailContent(generatedContent, contact);
    
  } catch (error) {
    console.error('Error generating personalized email:', error);
    return generateTemplateEmail(contact, icpData);
  }
}

function buildPersonalizationPrompt(contact: any, icpData: any, messagingAngles: string[]) {
  const painPoints = icpData.personas?.[0]?.painPoints || [];
  const messaging = messagingAngles.length > 0 ? messagingAngles[0] : 'improving efficiency and growth';
  
  return `
Create a personalized cold email for:
- Name: ${contact.firstName} ${contact.lastName}
- Title: ${contact.title}
- Company: ${contact.companyName}
- Industry: ${contact.companyIndustry}

Key messaging angles: ${messaging}
Main pain points to address: ${painPoints.join(', ')}

Requirements:
- Subject line (under 50 characters)
- Email body (3-4 sentences max)
- Professional but conversational tone
- Include specific company/role reference
- Clear but soft call-to-action
- No aggressive sales language

Format your response as:
SUBJECT: [subject line]
BODY: [email body]
`;
}

function parseEmailContent(content: string, contact: any) {
  const lines = content.split('\n');
  let subject = '';
  let body = '';
  
  for (const line of lines) {
    if (line.startsWith('SUBJECT:')) {
      subject = line.replace('SUBJECT:', '').trim();
    } else if (line.startsWith('BODY:')) {
      body = line.replace('BODY:', '').trim();
    }
  }
  
  // Fallback parsing if format isn't followed
  if (!subject || !body) {
    const parts = content.split('\n\n');
    subject = parts[0]?.replace(/^(Subject:|SUBJECT:)/i, '').trim() || `Quick question about ${contact.companyName}`;
    body = parts[1] || content;
  }
  
  return {
    ...contact,
    subject: subject.substring(0, 100), // Limit subject length
    body: body.substring(0, 500), // Limit body length
    personalizedHook: `Noticed ${contact.companyName} is in ${contact.companyIndustry}`,
    generatedAt: new Date().toISOString()
  };
}

function generateTemplateEmail(contact: any, icpData: any) {
  const painPoint = icpData.personas?.[0]?.painPoints?.[0] || 'operational challenges';
  
  return {
    ...contact,
    subject: `Quick question about ${contact.companyName}'s growth`,
    body: `Hi ${contact.firstName},\n\nI noticed ${contact.companyName} has been expanding in the ${contact.companyIndustry} space. Many ${contact.title}s I work with mention ${painPoint} as a key challenge.\n\nWould you be open to a brief conversation about how we've helped similar companies overcome this?\n\nBest regards`,
    personalizedHook: `Expanding in ${contact.companyIndustry}`,
    generatedAt: new Date().toISOString()
  };
}
