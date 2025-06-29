import express from 'express';
import { runQuery, getRow, getRows } from '../database/init';

const router = express.Router();

// Enrich a specific lead
router.post('/:leadId', async (req, res) => {
  try {
    const { leadId } = req.params;
    
    // Get the lead
    const lead = await getRow('SELECT * FROM leads WHERE id = ?', [leadId]);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Get the ICP for context
    const icp = await getRow('SELECT * FROM icps WHERE id = ?', [lead.icpId]);
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
    const enrichedLead = await getRow('SELECT * FROM enriched_leads WHERE id = ?', [result.id]);

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
router.get('/:leadId', async (req, res) => {
  try {
    const { leadId } = req.params;
    const enrichedLead = await getRow('SELECT * FROM enriched_leads WHERE leadId = ?', [leadId]);
    
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