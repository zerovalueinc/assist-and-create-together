// @ts-nocheck
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import { importLeadsBulk } from '../../agents/researchAgent';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://hbogcsztrryrepudceww.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper functions to replace database/init functions
async function getRows(table: string, conditions: Record<string, any> = {}) {
  let query = supabase.from(table).select('*');
  for (const [key, value] of Object.entries(conditions)) {
    query = query.eq(key, value);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function getRow(table: string, conditions: Record<string, any>) {
  let query = supabase.from(table).select('*');
  for (const [key, value] of Object.entries(conditions)) {
    query = query.eq(key, value);
  }
  const { data, error } = await query.single();
  if (error) throw error;
  return data;
}

// Upload leads to Instantly
router.post('/instantly', authenticateToken, async (req, res) => {
  try {
    const { icpId, listName } = req.body;
    
    if (!icpId) {
      return res.status(400).json({ error: 'ICP ID is required' });
    }

    // Get all leads for this ICP and user
    const leads = await getRows('leads', { icpId, userId: req.user.id });
    
    if (leads.length === 0) {
      return res.status(400).json({ error: 'No leads found for this ICP' });
    }

    // Get enrichment data for leads
    const enrichedLeads = [];
    for (const lead of leads) {
      const enrichment = await getRow('enriched_leads', { leadId: lead.id });
      enrichedLeads.push({
        ...lead,
        enrichment: enrichment ? {
          ...enrichment,
          interests: JSON.parse(enrichment.interests || '[]')
        } : null
      });
    }

    // Format leads for Instantly
    const instantlyLeads = enrichedLeads.map(lead => ({
      email: lead.email,
      firstName: lead.firstName,
      lastName: lead.lastName,
      jobTitle: lead.title,
      companyName: lead.companyName,
      companyWebsite: lead.companyWebsite,
      linkedInUrl: lead.linkedInUrl,
      // Add enrichment data as custom fields if available
      ...(lead.enrichment && {
        bio: lead.enrichment.bio,
        interests: lead.enrichment.interests.join(', '),
        whyTheyCare: lead.enrichment.oneSentenceWhyTheyCare
      })
    }));

    // Upload to Instantly
    const uploadResult = await importLeadsBulk(instantlyLeads, listName);

    res.json({
      success: true,
      message: `Successfully uploaded ${instantlyLeads.length} leads to Instantly`,
      uploadResult,
      leadsCount: instantlyLeads.length
    });

  } catch (error) {
    console.error('Error uploading leads to Instantly:', error);
    res.status(500).json({ 
      error: 'Failed to upload leads to Instantly',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get upload status
router.get('/status/:icpId', authenticateToken, async (req, res) => {
  try {
    const { icpId } = req.params;
    
    // Get leads count for this ICP and user
    const leads = await getRows('leads', { icpId, userId: req.user.id });
    const enrichedLeads = await getRows('enriched_leads', { leadId: supabase.from('leads').select('id').eq('icpId', icpId).eq('userId', req.user.id) });
    
    const emailTemplates = await getRows('email_templates', { leadId: supabase.from('leads').select('id').eq('icpId', icpId).eq('userId', req.user.id) });

    res.json({
      success: true,
      status: {
        totalLeads: leads.length,
        enrichedLeads: enrichedLeads.length,
        emailTemplates: emailTemplates.length,
        readyForUpload: leads.length > 0
      }
    });
  } catch (error) {
    console.error('Error getting upload status:', error);
    res.status(500).json({ 
      error: 'Failed to get upload status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as uploadRoutes }; 