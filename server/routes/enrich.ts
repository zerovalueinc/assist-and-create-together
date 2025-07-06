// @ts-nocheck
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://hbogcsztrryrepudceww.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper functions to replace database/init functions
async function getRow(table: string, conditions: Record<string, any>) {
  let query = supabase.from(table).select('*');
  for (const [key, value] of Object.entries(conditions)) {
    query = query.eq(key, value);
  }
  const { data, error } = await query.single();
  if (error) throw error;
  return data;
}

async function getRows(table: string, conditions: Record<string, any> = {}) {
  let query = supabase.from(table).select('*');
  for (const [key, value] of Object.entries(conditions)) {
    query = query.eq(key, value);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function runQuery(query: string, params: any[] = []) {
  // For Supabase, we'll use RPC for custom queries or direct table operations
  const { data, error } = await supabase.rpc('execute_sql', { sql_query: query, params });
  if (error) throw error;
  return data;
}

// Enrich a specific lead
router.post('/:leadId', authenticateToken, async (req, res) => {
  try {
    const { leadId } = req.params;
    
    // Get the lead
    const lead = await getRow('leads', { id: leadId, userId: req.user.id });
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Get the ICP for context
    const icp = await getRow('icps', { id: lead.icpId, userId: req.user.id });
    if (!icp) {
      return res.status(404).json({ error: 'ICP not found' });
    }

    // Parse ICP data
    const icpData = {
      ...icp,
      painPoints: JSON.parse(icp.painPoints || '[]'),
      technologies: JSON.parse(icp.technologies || '[]'),
      companySize: JSON.parse(icp.companySize || '[]'),
      jobTitles: JSON.parse(icp.jobTitles || '[]'),
      locationCountry: JSON.parse(icp.locationCountry || '[]'),
      industries: JSON.parse(icp.industries || '[]')
    };

    // For now, create mock enrichment data
    // In a real implementation, this would call the research agent
    const enrichmentData = {
      bio: `Experienced ${lead.title} at ${lead.companyName} with expertise in ${icpData.technologies.join(', ')}`,
      interests: ['Technology', 'Innovation', 'Business Growth'],
      oneSentenceWhyTheyCare: `As a ${lead.title}, they likely care about ${icpData.painPoints[0] || 'business efficiency'}`
    };

    // Store enrichment data
    const result = await runQuery(`
      INSERT INTO enriched_leads (leadId, bio, interests, oneSentenceWhyTheyCare)
      VALUES (?, ?, ?, ?)
    `, [
      leadId,
      enrichmentData.bio,
      JSON.stringify(enrichmentData.interests),
      enrichmentData.oneSentenceWhyTheyCare
    ]);

    // Get the enriched lead
    const enrichedLead = await getRow('enriched_leads', { id: result.id, userId: req.user.id });

    res.json({
      success: true,
      enrichedLead: {
        ...enrichedLead,
        interests: JSON.parse(enrichedLead.interests || '[]')
      }
    });

  } catch (error) {
    console.error('Error enriching lead:', error);
    res.status(500).json({ 
      error: 'Failed to enrich lead',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get enrichment for a lead
router.get('/:leadId', authenticateToken, async (req, res) => {
  try {
    const { leadId } = req.params;
    const enrichedLead = await getRow('enriched_leads', { leadId: leadId, userId: req.user.id });
    
    if (!enrichedLead) {
      return res.status(404).json({ error: 'Enrichment not found' });
    }

    res.json({
      success: true,
      enrichedLead: {
        ...enrichedLead,
        interests: JSON.parse(enrichedLead.interests || '[]')
      }
    });
  } catch (error) {
    console.error('Error fetching enrichment:', error);
    res.status(500).json({ 
      error: 'Failed to fetch enrichment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as enrichRoutes }; 