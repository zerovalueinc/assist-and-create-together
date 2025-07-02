
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PipelineRequest {
  action: 'start' | 'status' | 'results';
  pipelineId?: string;
  config?: {
    url?: string;
    batchSize?: number;
    skipEnrichment?: boolean;
    userInput?: string;
  };
}

interface PipelineState {
  id: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  currentPhase: 'icp_generation' | 'company_discovery' | 'contact_discovery' | 'email_personalization' | 'campaign_upload';
  progress: number;
  companiesProcessed: number;
  contactsFound: number;
  emailsGenerated: number;
  results?: any;
  error?: string;
  config: any;
}

serve(async (req) => {
  console.log('=== Pipeline Orchestrator Called ===');
  console.log('Method:', req.method);

  // Handle CORS preflight requests
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
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const requestBody = await req.json() as PipelineRequest;
    const { action, pipelineId, config } = requestBody;

    switch (action) {
      case 'start':
        return await startPipeline(supabase, user.id, config);
      
      case 'status':
        return await getPipelineStatus(supabase, user.id, pipelineId);
      
      case 'results':
        return await getPipelineResults(supabase, user.id, pipelineId);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }

  } catch (error) {
    console.error('Pipeline Orchestrator Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Pipeline operation failed',
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function startPipeline(supabase: any, userId: string, config: any) {
  console.log('Starting new pipeline for user:', userId);
  
  const pipelineId = crypto.randomUUID();
  const initialState: PipelineState = {
    id: pipelineId,
    status: 'running',
    currentPhase: 'icp_generation',
    progress: 0,
    companiesProcessed: 0,
    contactsFound: 0,
    emailsGenerated: 0,
    config: config || {},
  };

  // Save initial pipeline state
  const { error: saveError } = await supabase
    .from('pipeline_states')
    .insert({
      id: pipelineId,
      user_id: userId,
      status: initialState.status,
      current_phase: initialState.currentPhase,
      progress: initialState.progress,
      companies_processed: initialState.companiesProcessed,
      contacts_found: initialState.contactsFound,
      emails_generated: initialState.emailsGenerated,
      config: initialState.config,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  if (saveError) {
    console.error('Error saving pipeline state:', saveError);
    throw new Error('Failed to initialize pipeline');
  }

  // Start the pipeline execution asynchronously
  executePipeline(supabase, userId, pipelineId, initialState).catch(error => {
    console.error('Pipeline execution failed:', error);
    updatePipelineState(supabase, pipelineId, {
      status: 'failed',
      error: error.message
    });
  });

  return new Response(
    JSON.stringify({
      success: true,
      pipelineId,
      status: initialState.status,
      message: 'Pipeline started successfully'
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function getPipelineStatus(supabase: any, userId: string, pipelineId?: string) {
  if (!pipelineId) {
    return new Response(
      JSON.stringify({ error: 'Pipeline ID required' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  const { data, error } = await supabase
    .from('pipeline_states')
    .select('*')
    .eq('id', pipelineId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return new Response(
      JSON.stringify({ error: 'Pipeline not found' }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      pipeline: {
        id: data.id,
        status: data.status,
        currentPhase: data.current_phase,
        progress: data.progress,
        companiesProcessed: data.companies_processed,
        contactsFound: data.contacts_found,
        emailsGenerated: data.emails_generated,
        error: data.error,
        updatedAt: data.updated_at
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function getPipelineResults(supabase: any, userId: string, pipelineId?: string) {
  if (!pipelineId) {
    return new Response(
      JSON.stringify({ error: 'Pipeline ID required' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  const { data, error } = await supabase
    .from('pipeline_results')
    .select('*')
    .eq('pipeline_id', pipelineId)
    .eq('user_id', userId);

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch results' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      results: data || []
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function executePipeline(supabase: any, userId: string, pipelineId: string, state: PipelineState) {
  console.log('Executing pipeline:', pipelineId);
  
  try {
    // Phase 1: ICP Generation
    await updatePipelineState(supabase, pipelineId, {
      currentPhase: 'icp_generation',
      progress: 10
    });

    const icpResult = await callICPGenerator(supabase, userId, state.config);
    
    // Phase 2: Company Discovery
    await updatePipelineState(supabase, pipelineId, {
      currentPhase: 'company_discovery',
      progress: 30
    });

    const companies = await callCompanyDiscovery(supabase, icpResult);
    
    // Phase 3: Contact Discovery
    await updatePipelineState(supabase, pipelineId, {
      currentPhase: 'contact_discovery',
      progress: 60
    });

    const contacts = await callContactDiscovery(supabase, companies);
    
    // Phase 4: Email Personalization
    await updatePipelineState(supabase, pipelineId, {
      currentPhase: 'email_personalization',
      progress: 80
    });

    const emails = await callEmailPersonalization(supabase, contacts, icpResult);
    
    // Phase 5: Campaign Upload
    await updatePipelineState(supabase, pipelineId, {
      currentPhase: 'campaign_upload',
      progress: 95
    });

    await callCampaignUpload(supabase, emails);
    
    // Complete pipeline
    await updatePipelineState(supabase, pipelineId, {
      status: 'completed',
      progress: 100,
      companiesProcessed: companies.length,
      contactsFound: contacts.length,
      emailsGenerated: emails.length
    });

    // Save final results
    await savePipelineResults(supabase, userId, pipelineId, {
      companies,
      contacts,
      emails,
      summary: {
        companiesFound: companies.length,
        contactsFound: contacts.length,
        emailsGenerated: emails.length,
        completedAt: new Date().toISOString()
      }
    });

    console.log('Pipeline completed successfully:', pipelineId);

  } catch (error) {
    console.error('Pipeline execution failed:', error);
    await updatePipelineState(supabase, pipelineId, {
      status: 'failed',
      error: error.message
    });
  }
}

async function updatePipelineState(supabase: any, pipelineId: string, updates: Partial<PipelineState>) {
  const updateData: any = {
    updated_at: new Date().toISOString()
  };

  if (updates.status) updateData.status = updates.status;
  if (updates.currentPhase) updateData.current_phase = updates.currentPhase;
  if (updates.progress !== undefined) updateData.progress = updates.progress;
  if (updates.companiesProcessed !== undefined) updateData.companies_processed = updates.companiesProcessed;
  if (updates.contactsFound !== undefined) updateData.contacts_found = updates.contactsFound;
  if (updates.emailsGenerated !== undefined) updateData.emails_generated = updates.emailsGenerated;
  if (updates.error) updateData.error = updates.error;

  const { error } = await supabase
    .from('pipeline_states')
    .update(updateData)
    .eq('id', pipelineId);

  if (error) {
    console.error('Error updating pipeline state:', error);
  }
}

async function savePipelineResults(supabase: any, userId: string, pipelineId: string, results: any) {
  const { error } = await supabase
    .from('pipeline_results')
    .insert({
      pipeline_id: pipelineId,
      user_id: userId,
      results_data: results,
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error saving pipeline results:', error);
  }
}

// Placeholder functions for calling other agents (to be implemented)
async function callICPGenerator(supabase: any, userId: string, config: any) {
  console.log('Calling ICP Generator...');
  // This will call the existing gtm-generate edge function
  const { data, error } = await supabase.functions.invoke('gtm-generate', {
    body: { 
      url: config.url || 'https://example.com',
      userInput: config.userInput || 'Generate ICP for B2B SaaS company'
    }
  });
  
  if (error) throw error;
  return data;
}

async function callCompanyDiscovery(supabase: any, icpData: any) {
  console.log('Calling Company Discovery...');
  // Placeholder - will be implemented with Apollo agent
  return [
    { name: 'Sample Company 1', domain: 'example1.com', employees: 150 },
    { name: 'Sample Company 2', domain: 'example2.com', employees: 200 }
  ];
}

async function callContactDiscovery(supabase: any, companies: any[]) {
  console.log('Calling Contact Discovery...');
  // Placeholder - will be implemented with Apollo agent
  return companies.map(company => ({
    companyName: company.name,
    firstName: 'John',
    lastName: 'Doe',
    email: `john.doe@${company.domain}`,
    title: 'VP Marketing'
  }));
}

async function callEmailPersonalization(supabase: any, contacts: any[], icpData: any) {
  console.log('Calling Email Personalization...');
  // Placeholder - will be implemented with email agent
  return contacts.map(contact => ({
    ...contact,
    subject: `Quick question about ${contact.companyName}'s growth`,
    body: `Hi ${contact.firstName}, I noticed ${contact.companyName} is scaling rapidly...`,
    personalizedHook: `Saw your recent expansion in the market`
  }));
}

async function callCampaignUpload(supabase: any, emails: any[]) {
  console.log('Calling Campaign Upload...');
  // Placeholder - will be implemented with Instantly integration
  return { success: true, campaignId: 'camp_123', uploadedCount: emails.length };
}
