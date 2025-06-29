import express from 'express';
import { getRows, getRow } from '../database/init';
import { importLeadsBulk } from '../../agents/researchAgent';

const router = express.Router();

// Upload leads to Instantly
router.post('/instantly', async (req, res) => {
  try {
    const { icpId, listName } = req.body;
    
    if (!icpId) {
      return res.status(400).json({ error: 'ICP ID is required' });
    }

    // Get all leads for this ICP
    const leads = await getRows('SELECT * FROM leads WHERE icpId = ?', [icpId]);
    
    if (leads.length === 0) {
      return res.status(400).json({ error: 'No leads found for this ICP' });
    }

    // Get enrichment data for leads
    const enrichedLeads = [];
    for (const lead of leads) {
      const enrichment = await getRow('SELECT * FROM enriched_leads WHERE leadId = ?', [lead.id]);
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
router.get('/status/:icpId', async (req, res) => {
  try {
    const { icpId } = req.params;
    
    // Get leads count for this ICP
    const leads = await getRows('SELECT * FROM leads WHERE icpId = ?', [icpId]);
    const enrichedLeads = await getRows(`
      SELECT COUNT(*) as count 
      FROM enriched_leads el 
      JOIN leads l ON el.leadId = l.id 
      WHERE l.icpId = ?
    `, [icpId]);
    
    const emailTemplates = await getRows(`
      SELECT COUNT(*) as count 
      FROM email_templates et 
      JOIN leads l ON et.leadId = l.id 
      WHERE l.icpId = ?
    `, [icpId]);

    res.json({
      success: true,
      status: {
        totalLeads: leads.length,
        enrichedLeads: enrichedLeads[0]?.count || 0,
        emailTemplates: emailTemplates[0]?.count || 0,
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